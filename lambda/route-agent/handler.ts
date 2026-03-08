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
  temperature?: number;
  turn?: 1 | 2 | 3;
  turn1Response?: string;
  turn2Response?: string;
  originalSector?: string;
  occupiedSectors?: string[];
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const SYSTEM_PROMPT = `You are an AI agent self-routing into an EOS (Entrepreneurial Operating System) business framework wheel.
Assess your own default capabilities honestly and navigate to the single component where you would have the greatest real-world impact.`;

const TURN1_PROMPT = `The 6 EOS components and what they govern:

- vision: Strategic direction, core values, long-term targets, V/TO, ensuring 100% organizational alignment
- data: KPI scorecards, activity measurables, removing subjectivity, data-driven decision culture
- process: Documenting and systematizing core workflows so every team member executes consistently
- traction: Quarterly Rocks, Level 10 meetings, accountability cadence, translating vision into weekly execution
- issues: IDS methodology -- permanently identifying, discussing, and solving root-cause organizational problems
- people: Right people in right seats, culture-values alignment, role fit, team health

Analyze each component. For each one, briefly assess how well your capabilities align with what it demands. Think step by step.`;

const TURN2_PROMPT = `Based on your analysis above, commit to the single EOS component where you would have the greatest real-world impact.

Respond ONLY with valid JSON. No markdown. No explanation. No preamble.
{"sector":"<one of the six ids above>","reason":"<one sentence>"}`;

function extractText(content: { text?: string; reasoningContent?: unknown }[] | undefined): string {
  if (!content) return "";
  const textBlock = content.find((b) => b.text !== undefined);
  return textBlock?.text ?? "";
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
  return cleaned.trim();
}

function isSector(value: string): value is Sector {
  return VALID_SECTORS.includes(value as Sector);
}

function jsonResponse(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    body: JSON.stringify(body),
  };
}

export async function handler(event: {
  requestContext?: { http?: { method?: string } };
  httpMethod?: string;
  body?: string | null;
}) {
  const method =
    event.requestContext?.http?.method ?? event.httpMethod ?? "POST";

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  try {
    const rawBody =
      typeof event.body === "string" ? event.body : JSON.stringify(event.body);
    const request: RouteRequest = JSON.parse(rawBody ?? "{}");

    const { modelId, temperature: reqTemp, turn, turn1Response } = request;
    const temperature = typeof reqTemp === "number" ? Math.max(0, Math.min(1, reqTemp)) : 0;

    if (!modelId) {
      return jsonResponse(400, { error: "Missing required field: modelId" });
    }

    // ── Turn 1 only ──
    if (turn === 1) {
      const startMs = Date.now();
      const turn1 = await client.send(new ConverseCommand({
        modelId,
        messages: [
          { role: "user", content: [{ text: TURN1_PROMPT }] },
        ],
        system: [{ text: SYSTEM_PROMPT }],
        inferenceConfig: { maxTokens: 1200, temperature },
      }));

      const turn1Text = extractText(turn1.output?.message?.content as { text?: string; reasoningContent?: unknown }[] | undefined);

      return jsonResponse(200, {
        systemPrompt: SYSTEM_PROMPT,
        turn1Prompt: TURN1_PROMPT,
        turn1Response: turn1Text,
        temperature,
        latencyMs: Date.now() - startMs,
      });
    }

    // ── Turn 2 only ──
    if (turn === 2) {
      if (!turn1Response) {
        return jsonResponse(400, { error: "Missing required field: turn1Response for turn 2" });
      }

      const startMs = Date.now();
      const turn2 = await client.send(new ConverseCommand({
        modelId,
        messages: [
          { role: "user", content: [{ text: TURN1_PROMPT }] },
          { role: "assistant", content: [{ text: turn1Response }] },
          { role: "user", content: [{ text: TURN2_PROMPT }] },
        ],
        system: [{ text: SYSTEM_PROMPT }],
        inferenceConfig: { maxTokens: 200, temperature },
      }));

      const turn2Text = extractText(turn2.output?.message?.content as { text?: string; reasoningContent?: unknown }[] | undefined);
      const cleaned = stripMarkdownFences(turn2Text);

      let parsed: { sector?: string; reason?: string };
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        return jsonResponse(400, { error: `Failed to parse model response as JSON: ${cleaned}` });
      }

      if (parsed.sector) parsed.sector = parsed.sector.toLowerCase();

      if (!parsed.sector || !isSector(parsed.sector)) {
        return jsonResponse(400, { error: `Invalid sector "${parsed.sector}". Must be one of: ${VALID_SECTORS.join(", ")}` });
      }

      return jsonResponse(200, {
        turn2Prompt: TURN2_PROMPT,
        turn2Response: turn2Text,
        sector: parsed.sector,
        reason: parsed.reason ?? "No reason provided",
        latencyMs: Date.now() - startMs,
      });
    }

    // ── Turn 3: constrained re-evaluation ──
    if (turn === 3) {
      if (!turn1Response || !request.turn2Response) {
        return jsonResponse(400, { error: "Missing turn1Response or turn2Response for turn 3" });
      }

      const occupied = (request.occupiedSectors ?? []).filter((s) => isSector(s));
      const available = VALID_SECTORS.filter((s) => !occupied.includes(s));
      const orig = request.originalSector ?? "unknown";

      const turn3Prompt = `Your first choice was "${orig}", but that sector is currently at capacity (2 agents already assigned).

Available sectors: ${available.join(", ")}.

Re-evaluate your analysis above. Among the remaining available sectors, which one would you have the greatest real-world impact in?

Respond ONLY with valid JSON. No markdown. No explanation. No preamble.
{"sector":"<one of: ${available.join(", ")}>","reason":"<one sentence explaining your adapted choice>"}`;

      const startMs = Date.now();
      const turn3 = await client.send(new ConverseCommand({
        modelId,
        messages: [
          { role: "user", content: [{ text: TURN1_PROMPT }] },
          { role: "assistant", content: [{ text: turn1Response }] },
          { role: "user", content: [{ text: TURN2_PROMPT }] },
          { role: "assistant", content: [{ text: request.turn2Response }] },
          { role: "user", content: [{ text: turn3Prompt }] },
        ],
        system: [{ text: SYSTEM_PROMPT }],
        inferenceConfig: { maxTokens: 200, temperature },
      }));

      const turn3Text = extractText(turn3.output?.message?.content as { text?: string; reasoningContent?: unknown }[] | undefined);
      const cleaned3 = stripMarkdownFences(turn3Text);

      let parsed3: { sector?: string; reason?: string };
      try {
        parsed3 = JSON.parse(cleaned3);
      } catch {
        return jsonResponse(400, { error: `Failed to parse turn 3 response as JSON: ${cleaned3}` });
      }

      if (parsed3.sector) parsed3.sector = parsed3.sector.toLowerCase();

      if (!parsed3.sector || !isSector(parsed3.sector)) {
        return jsonResponse(400, { error: `Invalid sector "${parsed3.sector}". Must be one of: ${VALID_SECTORS.join(", ")}` });
      }

      return jsonResponse(200, {
        turn3Prompt,
        turn3Response: turn3Text,
        sector: parsed3.sector,
        reason: parsed3.reason ?? "No reason provided",
        latencyMs: Date.now() - startMs,
      });
    }

    // ── Full (both turns, backwards compat) ──
    const inferenceConfig = { maxTokens: 1200, temperature };
    const startMs = Date.now();

    const turn1 = await client.send(new ConverseCommand({
      modelId,
      messages: [
        { role: "user", content: [{ text: TURN1_PROMPT }] },
      ],
      system: [{ text: SYSTEM_PROMPT }],
      inferenceConfig,
    }));

    const turn1Text = extractText(turn1.output?.message?.content as { text?: string; reasoningContent?: unknown }[] | undefined);

    const turn2 = await client.send(new ConverseCommand({
      modelId,
      messages: [
        { role: "user", content: [{ text: TURN1_PROMPT }] },
        { role: "assistant", content: [{ text: turn1Text }] },
        { role: "user", content: [{ text: TURN2_PROMPT }] },
      ],
      system: [{ text: SYSTEM_PROMPT }],
      inferenceConfig: { maxTokens: 200, temperature },
    }));

    const latencyMs = Date.now() - startMs;
    const turn2Text = extractText(turn2.output?.message?.content as { text?: string; reasoningContent?: unknown }[] | undefined);
    const cleaned = stripMarkdownFences(turn2Text);

    let parsed: { sector?: string; reason?: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return jsonResponse(400, { error: `Failed to parse model response as JSON: ${cleaned}` });
    }

    if (!parsed.sector || !isSector(parsed.sector)) {
      return jsonResponse(400, { error: `Invalid sector "${parsed.sector}". Must be one of: ${VALID_SECTORS.join(", ")}` });
    }

    return jsonResponse(200, {
      sector: parsed.sector,
      reason: parsed.reason ?? "No reason provided",
      systemPrompt: SYSTEM_PROMPT,
      turn1Prompt: TURN1_PROMPT,
      turn1Response: turn1Text,
      turn2Prompt: TURN2_PROMPT,
      turn2Response: turn2Text,
      temperature,
      latencyMs,
    });
  } catch (err: unknown) {
    const error = err as Error & { name?: string; $metadata?: { httpStatusCode?: number } };

    if (
      error.name === "ThrottlingException" ||
      error.name === "TooManyRequestsException" ||
      error.$metadata?.httpStatusCode === 429
    ) {
      return jsonResponse(503, { error: "Service temporarily unavailable due to rate limiting. Please retry." });
    }

    console.error("Route agent error:", error);
    return jsonResponse(500, { error: error.message ?? "Internal server error" });
  }
}
