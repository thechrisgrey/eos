# EOS x AI Agents -- Design Document

## Overview

Interactive single-page web experience demonstrating AI self-routing intelligence mapped onto the EOS (Entrepreneurial Operating System) framework. Five AI agents from different providers assess their own capabilities via their actual models and autonomously navigate to the EOS component where they believe they can have the most impact.

## Architecture

```
Browser (React/Vite on Amplify)
    |
    POST /api/route-agent  (API Gateway HTTP API, us-east-1)
              |
              Lambda (Node.js 20.x)
                      |
                      Bedrock Converse API
                            Claude   -> us.anthropic.claude-sonnet-4-20250514-v1:0
                            GPT-OSS  -> openai.gpt-oss-120b-1:0
                            Gemma    -> google.gemma-3-27b-it
                            Llama    -> us.meta.llama4-scout-17b-instruct-v1:0
                            Mistral  -> mistral.devstral-2-123b
```

All five models invoked through the same Bedrock Converse API. No external API keys. Single IAM policy.

## Key AWS Decisions (Verified Against Docs 2026-03-07)

1. **Converse API over InvokeModel** -- AWS-recommended, consistent request/response format across all models, no model-native JSON boilerplate.
2. **Cross-region inference profiles** for Claude and Llama (no single-region availability). Profile IDs: `us.anthropic.claude-sonnet-4-20250514-v1:0`, `us.meta.llama4-scout-17b-instruct-v1:0`.
3. **Single-region models** for GPT-OSS, Gemma, Mistral (all available in us-east-1).
4. **Region: us-east-1** -- supports all five models.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | styled-components |
| Animation | Framer Motion |
| Hosting | AWS Amplify |
| API | AWS Lambda (Node.js 20.x) + API Gateway HTTP API |
| AI | Amazon Bedrock Converse API |
| IaC | AWS CDK (TypeScript) |

## Project Structure

```
eos/
  infra/
    bin/app.ts
    lib/eos-agents-stack.ts
    package.json
    tsconfig.json
  lambda/
    route-agent/
      handler.ts
      package.json
    tsconfig.json
  frontend/
    src/
      components/
        EOSWheel.tsx
        AgentPool.tsx
        FlyingNode.tsx
        DecisionLog.tsx
        GateDivider.tsx
        SectorTooltip.tsx
      hooks/
        useAgentRouter.ts
        useSectorGeometry.ts
      data/
        sectors.ts
        agents.ts
      types/
        index.ts
      styles/
        theme.ts
        GlobalStyle.ts
      App.tsx
      main.tsx
    index.html
    vite.config.ts
    package.json
    tsconfig.json
  amplify.yml
```

## Data Model

### EOS Sectors

Six sectors spanning 60 degrees each, starting at -90 degrees (top), clockwise:
- vision (-90 to -30), data (-30 to 30), process (30 to 90)
- traction (90 to 150), issues (150 to 210), people (210 to 270)

Graduated orange shades across sectors.

### Agents

| ID | Name | Provider | Color | Bedrock Model ID |
|---|---|---|---|---|
| claude | Claude | Anthropic | #a78bfa (violet) | us.anthropic.claude-sonnet-4-20250514-v1:0 |
| gpt | GPT-OSS | OpenAI | #4ade80 (green) | openai.gpt-oss-120b-1:0 |
| gemma | Gemma | Google | #60a5fa (blue) | google.gemma-3-27b-it |
| llama | Llama | Meta | #fb923c (orange) | us.meta.llama4-scout-17b-instruct-v1:0 |
| mistral | Mistral | Mistral AI | #2dd4bf (teal) | mistral.devstral-2-123b |

Each agent has a `capability` string describing its real strengths, injected into the Converse API system prompt.

## API Contract

### Request: POST /api/route-agent

```json
{
  "agentId": "claude",
  "agentName": "Claude",
  "agentProvider": "Anthropic",
  "capability": "Advanced reasoning, long-context..."
}
```

### Response

```json
{
  "sector": "vision",
  "reason": "One crisp sentence."
}
```

### Error Response

```json
{
  "error": "Description of what went wrong"
}
```

## Lambda Logic

1. Receive agent payload.
2. Look up Bedrock model ID from agent-to-model mapping.
3. Call Bedrock Converse API with system prompt (agent identity + capabilities) and user prompt (EOS sector descriptions + routing instruction).
4. Parse response text. Strip markdown fences if present. JSON.parse the result.
5. Validate sector is one of the six valid IDs.
6. Return `{ sector, reason }` or `{ error }` on failure.

IAM: `bedrock:InvokeModel` on all five model/profile ARNs.

## CDK Stack

Single stack provisioning:
1. Lambda function (Node.js 20.x, 30s timeout, 256MB, esbuild bundled)
2. IAM policy for bedrock:InvokeModel
3. HTTP API Gateway with POST /api/route-agent
4. CORS configured for all origins
5. Stack output: ApiEndpoint URL

## Frontend Components

- **EOSWheel**: SVG wheel (500x500 viewBox), 6 sectors with arc paths, center circle, agent badges
- **AgentPool**: Agent node grid with deploy/reset controls
- **FlyingNode**: Fixed-position div animating from agent DOM position to sector center (1.4s cubic-bezier spring)
- **DecisionLog**: Right panel showing agent decisions with color dots, sector badges, reasons
- **GateDivider**: Animated horizontal line between wheel and pool, pulse animation, gate open/closed states
- **SectorTooltip**: Fixed-position tooltip at viewport bottom on sector hover

### Agent State Machine

idle -> thinking -> flying -> settled

- deploy(agentId): idle->thinking, POST API, thinking->flying, after 1.4s flying->settled
- deployAll(): stagger idle agents with 750ms delay
- reset(): all agents back to idle, clear log

## Visual Design

- Background: #06060a
- Accent: #ea580c (orange)
- Fonts: Space Mono (monospace) + Barlow Condensed (display)
- Dot grid overlay, radial ambient gradient
- Agent nodes: radial gradient with brand color, glow shadow
- No emojis

## Deployment

1. CDK bootstrap in us-east-1
2. CDK deploy (Lambda + API Gateway)
3. Frontend build, wire VITE_API_ENDPOINT
4. Amplify configured for CI/CD from GitHub (later)
