import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

const VALID_SECTORS = [
  "vision",
  "data",
  "process",
  "traction",
  "issues",
  "people",
] as const;

type Sector = (typeof VALID_SECTORS)[number];

interface RouteRequest {
  agentId: string;
  agentName: string;
  agentProvider: string;
  capability: string;
  modelId: string;
}

interface RouteSuccess {
  sector: Sector;
  reason: string;
}

interface RouteError {
  error: string;
}

type RouteResponse = RouteSuccess | RouteError;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const client = new BedrockRuntimeClient({ region: "us-east-1" });

function buildSystemPrompt(
  agentName: string,
  agentProvider: string,
  capability: string,
): string {
  return `You are ${agentName} by ${agentProvider}.

Your capabilities: ${capability}

You are an AI agent self-routing into an EOS (Entrepreneurial Operating System) business framework wheel.
Assess your own default capabilities honestly and navigate to the single component where you would have the greatest real-world impact.

Respond ONLY with valid JSON. No markdown. No explanation. No preamble.`;
}

const USER_PROMPT = `The 6 EOS components and what they govern:

- vision: Strategic direction, core values, long-term targets, V/TO, ensuring 100% organizational alignment
- data: KPI scorecards, activity measurables, removing subjectivity, data-driven decision culture
- process: Documenting and systematizing core workflows so every team member executes consistently
- traction: Quarterly Rocks, Level 10 meetings, accountability cadence, translating vision into weekly execution
- issues: IDS methodology -- permanently identifying, discussing, and solving root-cause organizational problems
- people: Right people in right seats, culture-values alignment, role fit, team health

Where do you belong? Respond with exactly:
{"sector":"<one of the six ids above>","reason":"<one sentence>"}`;

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  // Strip ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
  return cleaned.trim();
}

function isSector(value: string): value is Sector {
  return VALID_SECTORS.includes(value as Sector);
}

export async function handler(event: {
  requestContext?: { http?: { method?: string } };
  httpMethod?: string;
  body?: string | null;
}): Promise<{
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}> {
  const method =
    event.requestContext?.http?.method ?? event.httpMethod ?? "POST";

  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  try {
    const rawBody =
      typeof event.body === "string" ? event.body : JSON.stringify(event.body);
    const request: RouteRequest = JSON.parse(rawBody ?? "{}");

    const { agentName, agentProvider, capability, modelId } = request;

    if (!agentName || !agentProvider || !capability || !modelId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        body: JSON.stringify({
          error:
            "Missing required fields: agentName, agentProvider, capability, modelId",
        } satisfies RouteError),
      };
    }

    const systemPrompt = buildSystemPrompt(agentName, agentProvider, capability);

    const command = new ConverseCommand({
      modelId,
      messages: [
        {
          role: "user",
          content: [{ text: USER_PROMPT }],
        },
      ],
      system: [{ text: systemPrompt }],
      inferenceConfig: {
        maxTokens: 600,
        temperature: 0.2,
      },
    });

    const response = await client.send(command);

    const outputText =
      response.output?.message?.content?.[0]?.text ?? "";

    const cleaned = stripMarkdownFences(outputText);

    let parsed: { sector?: string; reason?: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        body: JSON.stringify({
          error: `Failed to parse model response as JSON: ${cleaned}`,
        } satisfies RouteError),
      };
    }

    if (!parsed.sector || !isSector(parsed.sector)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        body: JSON.stringify({
          error: `Invalid sector "${parsed.sector}". Must be one of: ${VALID_SECTORS.join(", ")}`,
        } satisfies RouteError),
      };
    }

    const result: RouteSuccess = {
      sector: parsed.sector,
      reason: parsed.reason ?? "No reason provided",
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      body: JSON.stringify(result),
    };
  } catch (err: unknown) {
    const error = err as Error & { name?: string; $metadata?: { httpStatusCode?: number } };

    // Handle throttling errors
    if (
      error.name === "ThrottlingException" ||
      error.name === "TooManyRequestsException" ||
      error.$metadata?.httpStatusCode === 429
    ) {
      return {
        statusCode: 503,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        body: JSON.stringify({
          error: "Service temporarily unavailable due to rate limiting. Please retry.",
        } satisfies RouteError),
      };
    }

    console.error("Route agent error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      body: JSON.stringify({
        error: error.message ?? "Internal server error",
      } satisfies RouteError),
    };
  }
}
