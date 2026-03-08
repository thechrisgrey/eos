# EOS x AI Agents

Interactive experiment: deploy AI foundation models and watch them self-route into EOS (Entrepreneurial Operating System) sectors.

## Architecture

- **Frontend**: React 18 + Vite + styled-components, deployed on AWS Amplify (auto-builds on push to main)
- **Backend**: Lambda (Node.js 20, ARM64) behind HTTP API Gateway, proxying to Amazon Bedrock Converse API
- **IaC**: AWS CDK (TypeScript) in `infra/`
- **Region**: Lambda + API Gateway in `us-east-1`, Amplify in `us-east-2`

## Key Files

- `frontend/src/hooks/useAgentRouter.ts` — Core state management: deploy flow, concurrent deployment, inference modal, race panel state
- `frontend/src/hooks/useResultsStore.ts` — localStorage persistence for routing results, derived stats
- `frontend/src/hooks/useSectorGeometry.ts` — SVG math: sector paths, label positions, coordinate transforms
- `frontend/src/data/models.ts` — Model catalog (12 models, 8 providers). First 6 are defaults.
- `frontend/src/data/sectors.ts` — 6 EOS sectors with angles, colors, descriptions
- `lambda/route-agent/handler.ts` — Two-turn Bedrock inference: Turn 1 (analysis), Turn 2 (JSON decision)
- `infra/lib/eos-agents-stack.ts` — CDK stack: Lambda + API Gateway + IAM policies

## Commands

```bash
# Frontend
cd frontend && npm run dev      # Dev server on :3000
cd frontend && npm run build    # tsc + vite build

# Infrastructure
cd infra && npx cdk deploy      # Deploy Lambda + API Gateway

# Monorepo
npm install                     # Install all workspaces
```

## API Contract

The Lambda supports three modes via the `turn` field:
- `turn: 1` — Returns system prompt, turn 1 prompt, and model's analysis response
- `turn: 2` — Requires `turn1Response` in body, returns sector + reason as JSON
- No `turn` field — Runs both turns sequentially (backwards compat)

## Important Patterns

- **Concurrent deployment**: `deployAll()` uses `Promise.allSettled()` to fire all models simultaneously. Individual `deploy()` accepts `opts.skipModal` to bypass UI pauses during race mode.
- **Sector case normalization**: Lambda lowercases `parsed.sector` before validation — some models (e.g., Nemotron) return capitalized sector names.
- **Model reasoning blocks**: Some models (GPT-OSS, MiniMax) return `reasoningContent` as `content[0]` before the `text` block. The `extractText()` helper handles this.
- **Results persistence**: `useResultsStore` saves to localStorage key `eos-results-history`, capped at 500 entries (FIFO).
- **Welcome modal**: Uses localStorage key `eos-welcome-dismissed` for first-visit detection.

## Environment

- `VITE_API_ENDPOINT` — API Gateway URL, injected at build time via `amplify.yml`
- API endpoint is hardcoded in `amplify.yml`: `https://m945b8j1le.execute-api.us-east-1.amazonaws.com`

## Gotchas

- AWS Marketplace models (some Anthropic, Cohere, AI21, Writer) require payment instruments — use `aws bedrock get-foundation-model-availability` to check before adding models
- SVG OG images don't work on most social platforms — use PNG
- The `capability` field is sent to the API but NOT injected into prompts — models self-route on generic self-knowledge only
- Temperature is clamped to [0, 1] on the backend regardless of frontend value
