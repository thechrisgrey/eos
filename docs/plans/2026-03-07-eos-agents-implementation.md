# EOS x AI Agents Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and deploy a production interactive web experience where five AI agents self-route into an EOS business framework wheel, each using their real Bedrock model.

**Architecture:** React/Vite SPA on Amplify calls API Gateway HTTP API -> Lambda -> Bedrock Converse API with five different foundation models. CDK provisions all infrastructure in us-east-1.

**Tech Stack:** React 18, Vite, TypeScript, styled-components, Framer Motion, AWS CDK, Lambda (Node.js 20.x), API Gateway, Bedrock Converse API.

---

### Task 1: Initialize Git Repo and Monorepo Scaffold

**Files:**
- Create: `.gitignore`
- Create: `package.json` (root -- workspace config only)

**Step 1: Initialize git repo**

```bash
cd /Users/cperez/Desktop/altivum/eos
git init
```

**Step 2: Create root .gitignore**

```gitignore
node_modules/
dist/
cdk.out/
.env
*.js.map
*.d.ts
!vite.config.ts
```

**Step 3: Create root package.json (workspace references only)**

```json
{
  "name": "eos-agents",
  "private": true,
  "workspaces": ["frontend", "infra", "lambda/route-agent"]
}
```

**Step 4: Commit**

```bash
git add .gitignore package.json docs/
git commit -m "chore: init monorepo scaffold with design docs"
```

---

### Task 2: TypeScript Types and Data Constants

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/data/sectors.ts`
- Create: `frontend/src/data/agents.ts`

**Step 1: Create shared types**

```typescript
// frontend/src/types/index.ts

export type SectorId = 'vision' | 'data' | 'process' | 'traction' | 'issues' | 'people';

export interface Sector {
  id: SectorId;
  label: string;
  sub: [string, string];
  startAngle: number;
  endAngle: number;
  centerAngle: number;
  description: string;
  color: { base: string; hover: string };
}

export type AgentId = 'claude' | 'gpt' | 'gemma' | 'llama' | 'mistral';

export type AgentStatus = 'idle' | 'thinking' | 'flying' | 'settled';

export interface Agent {
  id: AgentId;
  name: string;
  provider: string;
  color: string;
  glow: string;
  capability: string;
  modelId: string;
}

export interface AgentState extends Agent {
  status: AgentStatus;
  sector: SectorId | null;
  reason: string | null;
}

export interface RouteAgentRequest {
  agentId: string;
  agentName: string;
  agentProvider: string;
  capability: string;
  modelId: string;
}

export interface RouteAgentResponse {
  sector: SectorId;
  reason: string;
}

export interface RouteAgentError {
  error: string;
}

export interface DecisionLogEntry {
  key: number;
  agentId: AgentId;
  agent: Agent;
  sector: SectorId;
  reason: string;
}

export interface FlyingNodeData {
  id: string;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  color: string;
  glow: string;
  name: string;
}
```

**Step 2: Create sectors data**

```typescript
// frontend/src/data/sectors.ts
import { Sector } from '../types';

export const SECTORS: Sector[] = [
  {
    id: 'vision',
    label: 'VISION',
    sub: ['8 Questions', 'Shared by All'],
    startAngle: -90,
    endAngle: -30,
    centerAngle: -60,
    description: 'Establish clear company direction -- core values, 10-year target, 3-year picture, and 1-year plan. Ensures everyone is aligned on where the business is headed.',
    color: { base: '#e8560a', hover: '#f26a1a' },
  },
  {
    id: 'data',
    label: 'DATA',
    sub: ['Scorecard', 'Measurables'],
    startAngle: -30,
    endAngle: 30,
    centerAngle: 0,
    description: 'Remove subjectivity with a data-driven culture. Weekly KPI scorecards, activity and revenue measurables, and clear numbers every person owns.',
    color: { base: '#d94e08', hover: '#eb5f10' },
  },
  {
    id: 'process',
    label: 'PROCESS',
    sub: ['Documented', 'Followed by All'],
    startAngle: 30,
    endAngle: 90,
    centerAngle: 60,
    description: 'Document and systematize the core ways your business runs -- so every team member follows the same proven processes, every time.',
    color: { base: '#c24608', hover: '#d35510' },
  },
  {
    id: 'traction',
    label: 'TRACTION',
    sub: ['Rocks', 'Meeting Pulse'],
    startAngle: 90,
    endAngle: 150,
    centerAngle: 120,
    description: 'Execute the vision through quarterly Rocks, Level 10 meetings, and a weekly cadence that drives accountability across every seat.',
    color: { base: '#b83f08', hover: '#ca4e10' },
  },
  {
    id: 'issues',
    label: 'ISSUES',
    sub: ['Issues List', 'IDS'],
    startAngle: 150,
    endAngle: 210,
    centerAngle: 180,
    description: 'Tackle problems at the root. IDS (Identify, Discuss, Solve) eliminates recurring issues and keeps your business moving forward permanently.',
    color: { base: '#c24608', hover: '#d35510' },
  },
  {
    id: 'people',
    label: 'PEOPLE',
    sub: ['Right People', 'Right Seats'],
    startAngle: 210,
    endAngle: 270,
    centerAngle: 240,
    description: 'Build a team who share your core values AND have the right skills for their roles. The foundation everything else is built upon.',
    color: { base: '#d94e08', hover: '#eb5f10' },
  },
];

export const VALID_SECTOR_IDS = SECTORS.map((s) => s.id);
```

**Step 3: Create agents data**

```typescript
// frontend/src/data/agents.ts
import { Agent } from '../types';

export const AGENTS: Agent[] = [
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.5)',
    capability: 'Advanced reasoning, long-context document synthesis, nuanced strategic analysis, coding, honest guidance, constitutional AI principles. Excels at understanding complex problems and delivering thoughtful, well-structured decision support.',
    modelId: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
  },
  {
    id: 'gpt',
    name: 'GPT-OSS',
    provider: 'OpenAI',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.5)',
    capability: 'Open-weight large language model optimized for production and general purpose reasoning. Strong at structured output formatting, instruction following, multi-step directives, and building frameworks and templates.',
    modelId: 'openai.gpt-oss-120b-1:0',
  },
  {
    id: 'gemma',
    name: 'Gemma',
    provider: 'Google',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.5)',
    capability: 'Open-weight model from Google optimized for efficient on-device and cloud inference. Strong at text understanding, summarization, reasoning tasks, and multilingual capabilities with a focus on responsible AI development.',
    modelId: 'google.gemma-3-27b-it',
  },
  {
    id: 'llama',
    name: 'Llama',
    provider: 'Meta',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.5)',
    capability: 'Open-source, fine-tunable for specific domains, deployable on-premise for data privacy, cost-efficient inference, adaptable to specialized workflows. Community-driven with strong customization potential for unique business processes.',
    modelId: 'us.meta.llama4-scout-17b-instruct-v1:0',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    provider: 'Mistral AI',
    color: '#2dd4bf',
    glow: 'rgba(45,212,191,0.5)',
    capability: 'Efficient European AI, multilingual, GDPR-compliant, fast inference, strong at code generation, structured task execution, process-oriented instruction following and generating well-organized structured outputs at scale.',
    modelId: 'mistral.devstral-2-123b',
  },
];
```

**Step 4: Commit**

```bash
git add frontend/src/types/ frontend/src/data/
git commit -m "feat: add TypeScript types and data constants for sectors and agents"
```

---

### Task 3: Lambda Handler

**Files:**
- Create: `lambda/route-agent/handler.ts`
- Create: `lambda/route-agent/package.json`
- Create: `lambda/tsconfig.json`

**Step 1: Create lambda package.json**

```json
{
  "name": "route-agent-lambda",
  "private": true,
  "type": "module",
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.700.0"
  }
}
```

**Step 2: Create lambda tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["route-agent/**/*.ts"]
}
```

**Step 3: Create lambda handler**

The handler must:
1. Parse request body to get agentId, agentName, agentProvider, capability, modelId
2. Call Bedrock Converse API with the agent's specific modelId
3. Parse JSON response defensively (strip markdown fences)
4. Validate sector is one of the six valid IDs
5. Return { sector, reason } or { error }

```typescript
// lambda/route-agent/handler.ts
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

const client = new BedrockRuntimeClient({ region: 'us-east-1' });

const VALID_SECTORS = ['vision', 'data', 'process', 'traction', 'issues', 'people'] as const;

const SYSTEM_PROMPT_TEMPLATE = (name: string, provider: string, capability: string) => `You are ${name} by ${provider}.

Your capabilities: ${capability}

You are an AI agent self-routing into an EOS (Entrepreneurial Operating System) business framework wheel.
Assess your own default capabilities honestly and navigate to the single component where you would have the greatest real-world impact.

Respond ONLY with valid JSON. No markdown. No explanation. No preamble.`;

const USER_PROMPT = `The 6 EOS components and what they govern:

- vision: Strategic direction, core values, long-term targets, V/TO, ensuring 100% organizational alignment
- data: KPI scorecards, activity measurables, removing subjectivity, data-driven decision culture
- process: Documenting and systematizing core workflows so every team member executes consistently
- traction: Quarterly Rocks, Level 10 meetings, accountability cadence, translating vision into weekly execution
- issues: IDS methodology -- permanently identifying, discussing, and solving root-cause organizational problems
- people: Right people in right seats, culture-values alignment, role fit, team health

Where do you belong? Respond with exactly:
{"sector":"<one of the six ids above>","reason":"<one sentence>"}`;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
  };
}

function response(statusCode: number, body: Record<string, unknown>): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    body: JSON.stringify(body),
  };
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  if (event.requestContext.http.method === 'OPTIONS') {
    return response(200, {});
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { agentName, agentProvider, capability, modelId } = body;

    if (!agentName || !agentProvider || !capability || !modelId) {
      return response(400, { error: 'Missing required fields: agentName, agentProvider, capability, modelId' });
    }

    const command = new ConverseCommand({
      modelId,
      system: [{ text: SYSTEM_PROMPT_TEMPLATE(agentName, agentProvider, capability) }],
      messages: [
        {
          role: 'user',
          content: [{ text: USER_PROMPT }],
        },
      ],
      inferenceConfig: {
        maxTokens: 300,
        temperature: 0.7,
      },
    });

    const result = await client.send(command);

    const outputText =
      result.output?.message?.content?.[0]?.text ?? '';

    // Strip markdown fences if present
    const cleaned = outputText
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    let sector: string;
    let reason: string;

    try {
      const parsed = JSON.parse(cleaned);
      sector = parsed.sector;
      reason = parsed.reason;
    } catch {
      // Try regex extraction as fallback
      const sectorMatch = cleaned.match(/"sector"\s*:\s*"([^"]+)"/);
      const reasonMatch = cleaned.match(/"reason"\s*:\s*"([^"]+)"/);
      sector = sectorMatch?.[1] ?? '';
      reason = reasonMatch?.[1] ?? '';
    }

    if (!VALID_SECTORS.includes(sector as typeof VALID_SECTORS[number])) {
      return response(400, {
        error: `Model returned invalid sector: "${sector}". Raw output: ${cleaned.slice(0, 200)}`,
      });
    }

    reason = reason || 'Best alignment with my core capabilities.';

    return response(200, { sector, reason });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isThrottle = message.includes('ThrottlingException') || message.includes('Too many requests');
    return response(isThrottle ? 503 : 500, { error: message });
  }
}
```

**Step 4: Install lambda dependencies**

```bash
cd /Users/cperez/Desktop/altivum/eos/lambda/route-agent && npm install
```

**Step 5: Commit**

```bash
git add lambda/
git commit -m "feat: add Lambda handler with Bedrock Converse API routing"
```

---

### Task 4: CDK Stack

**Files:**
- Create: `infra/bin/app.ts`
- Create: `infra/lib/eos-agents-stack.ts`
- Create: `infra/package.json`
- Create: `infra/tsconfig.json`

**Step 1: Create infra package.json**

```json
{
  "name": "eos-agents-infra",
  "private": true,
  "scripts": {
    "build": "tsc",
    "cdk": "cdk"
  },
  "dependencies": {
    "aws-cdk-lib": "^2.170.0",
    "constructs": "^10.4.0"
  },
  "devDependencies": {
    "aws-cdk": "^2.170.0",
    "typescript": "~5.7.0"
  }
}
```

**Step 2: Create infra tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true
  },
  "include": ["bin/**/*.ts", "lib/**/*.ts"]
}
```

**Step 3: Create CDK app entry point**

```typescript
// infra/bin/app.ts
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EosAgentsStack } from '../lib/eos-agents-stack';

const app = new cdk.App();
new EosAgentsStack(app, 'EosAgentsStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});
```

**Step 4: Create CDK stack**

```typescript
// infra/lib/eos-agents-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigw from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import * as path from 'path';

export class EosAgentsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const routeAgentFn = new lambdaNode.NodejsFunction(this, 'RouteAgentFunction', {
      entry: path.join(__dirname, '../../lambda/route-agent/handler.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      architecture: lambda.Architecture.ARM_64,
      bundling: {
        format: lambdaNode.OutputFormat.ESM,
        target: 'node20',
        mainFields: ['module', 'main'],
        externalModules: [],
      },
    });

    routeAgentFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['bedrock:InvokeModel'],
        resources: ['*'],
      })
    );

    const httpApi = new apigw.HttpApi(this, 'EosAgentsApi', {
      apiName: 'eos-agents-api',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigw.CorsHttpMethod.POST, apigw.CorsHttpMethod.OPTIONS],
        allowHeaders: ['Content-Type'],
      },
    });

    httpApi.addRoutes({
      path: '/api/route-agent',
      methods: [apigw.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('RouteAgentIntegration', routeAgentFn),
    });

    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.apiEndpoint,
      description: 'API Gateway endpoint URL',
    });
  }
}
```

**Step 5: Install infra dependencies**

```bash
cd /Users/cperez/Desktop/altivum/eos/infra && npm install
```

**Step 6: Verify CDK synth**

```bash
cd /Users/cperez/Desktop/altivum/eos/infra && npx cdk synth
```

Expected: CloudFormation template output, no errors.

**Step 7: Commit**

```bash
git add infra/
git commit -m "feat: add CDK stack with Lambda, API Gateway, Bedrock IAM"
```

---

### Task 5: Deploy CDK Stack

**Step 1: Bootstrap CDK (if needed)**

```bash
cd /Users/cperez/Desktop/altivum/eos/infra && npx cdk bootstrap aws://ACCOUNT_ID/us-east-1
```

**Step 2: Deploy**

```bash
cd /Users/cperez/Desktop/altivum/eos/infra && npx cdk deploy --require-approval never
```

Expected: Stack deploys successfully. Outputs `ApiEndpoint` URL.

**Step 3: Test the endpoint with curl**

```bash
curl -X POST <API_ENDPOINT>/api/route-agent \
  -H "Content-Type: application/json" \
  -d '{"agentId":"claude","agentName":"Claude","agentProvider":"Anthropic","capability":"Advanced reasoning and analysis","modelId":"us.anthropic.claude-sonnet-4-20250514-v1:0"}'
```

Expected: `{"sector":"<valid-sector>","reason":"<sentence>"}`

**Step 4: Commit any stack changes**

```bash
git add . && git commit -m "chore: deploy CDK stack, verify API endpoint"
```

---

### Task 6: Frontend Scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/styles/theme.ts`
- Create: `frontend/src/styles/GlobalStyle.ts`

**Step 1: Create frontend package.json**

```json
{
  "name": "eos-agents-frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "framer-motion": "^11.15.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "styled-components": "^6.1.13"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "~5.7.0",
    "vite": "^6.0.0"
  }
}
```

**Step 2: Create frontend tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

**Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EOS x AI Agents</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;600;700;900&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 5: Create theme.ts**

```typescript
// frontend/src/styles/theme.ts
export const theme = {
  bg: '#06060a',
  accent: '#ea580c',
  accentHover: '#f97316',
  text: '#e0e0e0',
  textDim: '#444',
  textMuted: '#666',
  textDark: '#333',
  textDarker: '#2a2a2a',
  textDarkest: '#2e2e2e',
  border: 'rgba(255,255,255,0.055)',
  borderDim: 'rgba(255,255,255,0.04)',
  panelBg: 'rgba(255,255,255,0.018)',
  fontMono: "'Space Mono', monospace",
  fontDisplay: "'Barlow Condensed', sans-serif",
} as const;
```

**Step 6: Create GlobalStyle.ts**

```typescript
// frontend/src/styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: ${theme.bg};
    font-family: ${theme.fontMono};
    color: ${theme.text};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes fadein {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pop {
    0% { transform: scale(0); opacity: 0; }
    60% { transform: scale(1.25); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
`;
```

**Step 7: Create main.tsx**

```typescript
// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalStyle } from './styles/GlobalStyle';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalStyle />
    <App />
  </React.StrictMode>
);
```

**Step 8: Install frontend dependencies**

```bash
cd /Users/cperez/Desktop/altivum/eos/frontend && npm install
```

**Step 9: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold frontend with Vite, React, styled-components, theme"
```

---

### Task 7: SVG Geometry Hook

**Files:**
- Create: `frontend/src/hooks/useSectorGeometry.ts`

**Step 1: Create the geometry hook**

This hook encapsulates all SVG coordinate math: sector arc paths, label positions, badge positions, and sector center points for animation targets.

```typescript
// frontend/src/hooks/useSectorGeometry.ts
import { Sector, SectorId } from '../types';

const SVG_W = 500;
const CX = 250;
const CY = 250;
const R1 = 78;
const R2 = 232;
const GAP = 2;

const toRad = (d: number) => (d * Math.PI) / 180;

export function makeSectorPath(startAngle: number, endAngle: number): string {
  const a = startAngle + GAP;
  const b = endAngle - GAP;
  const pt = (r: number, d: number): [number, number] => [
    CX + r * Math.cos(toRad(d)),
    CY + r * Math.sin(toRad(d)),
  ];
  const [x1, y1] = pt(R1, a);
  const [x2, y2] = pt(R1, b);
  const [x3, y3] = pt(R2, b);
  const [x4, y4] = pt(R2, a);
  return `M${x1},${y1} A${R1},${R1},0,0,1,${x2},${y2} L${x3},${y3} A${R2},${R2},0,0,0,${x4},${y4} Z`;
}

export function labelPosition(centerAngle: number, frac = 0.54): [number, number] {
  const r = R1 + (R2 - R1) * frac;
  return [CX + r * Math.cos(toRad(centerAngle)), CY + r * Math.sin(toRad(centerAngle))];
}

export function badgePosition(
  centerAngle: number,
  index: number,
  total: number
): [number, number] {
  const r = R1 + (R2 - R1) * 0.82;
  const bx = CX + r * Math.cos(toRad(centerAngle));
  const by = CY + r * Math.sin(toRad(centerAngle));
  const offset = (index - (total - 1) / 2) * 22;
  return [
    bx + offset * -Math.sin(toRad(centerAngle)),
    by + offset * Math.cos(toRad(centerAngle)),
  ];
}

export function sectorCenterPoint(centerAngle: number): { x: number; y: number } {
  const r = R1 + (R2 - R1) * 0.62;
  return {
    x: CX + r * Math.cos(toRad(centerAngle)),
    y: CY + r * Math.sin(toRad(centerAngle)),
  };
}

export function svgPointToScreen(
  svgEl: SVGSVGElement,
  sectorCenterAngle: number
): { x: number; y: number } {
  const rect = svgEl.getBoundingClientRect();
  const scale = rect.width / SVG_W;
  const pt = sectorCenterPoint(sectorCenterAngle);
  return {
    x: rect.left + pt.x * scale,
    y: rect.top + pt.y * scale,
  };
}

export const SVG_CONSTANTS = { SVG_W, CX, CY, R1, R2, GAP } as const;
```

**Step 2: Commit**

```bash
git add frontend/src/hooks/useSectorGeometry.ts
git commit -m "feat: add SVG sector geometry utilities"
```

---

### Task 8: Agent Router Hook

**Files:**
- Create: `frontend/src/hooks/useAgentRouter.ts`

**Step 1: Create the agent router hook**

State machine managing agent lifecycle: idle -> thinking -> flying -> settled. Handles API calls, flying node coordination, decision log.

```typescript
// frontend/src/hooks/useAgentRouter.ts
import { useState, useRef, useCallback } from 'react';
import { AGENTS } from '../data/agents';
import { SECTORS } from '../data/sectors';
import {
  AgentState,
  AgentId,
  FlyingNodeData,
  DecisionLogEntry,
  SectorId,
  RouteAgentResponse,
} from '../types';
import { svgPointToScreen } from './useSectorGeometry';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

function initialAgentStates(): AgentState[] {
  return AGENTS.map((a) => ({ ...a, status: 'idle' as const, sector: null, reason: null }));
}

export function useAgentRouter() {
  const [agents, setAgents] = useState<AgentState[]>(initialAgentStates);
  const [flying, setFlying] = useState<FlyingNodeData[]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const [log, setLog] = useState<DecisionLogEntry[]>([]);
  const [busy, setBusy] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const agentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setAgentRef = useCallback((id: string, el: HTMLDivElement | null) => {
    agentRefs.current[id] = el;
  }, []);

  const getSvgScreenPoint = useCallback((sectorId: SectorId) => {
    if (!svgRef.current) return null;
    const sector = SECTORS.find((s) => s.id === sectorId);
    if (!sector) return null;
    return svgPointToScreen(svgRef.current, sector.centerAngle);
  }, []);

  const getAgentScreenPoint = useCallback((id: string) => {
    const el = agentRefs.current[id];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const deploy = useCallback(async (id: AgentId) => {
    const agent = AGENTS.find((a) => a.id === id);
    if (!agent) return;

    setGateOpen(true);
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'thinking' } : a)));

    try {
      const res = await fetch(`${API_ENDPOINT}/api/route-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
          agentProvider: agent.provider,
          capability: agent.capability,
          modelId: agent.modelId,
        }),
      });

      const data = await res.json();

      if (data.error) {
        console.error(`Agent ${id} error:`, data.error);
        setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'idle' } : a)));
        return;
      }

      const { sector, reason } = data as RouteAgentResponse;

      const sp = getSvgScreenPoint(sector);
      const ap = getAgentScreenPoint(id);

      if (sp && ap) {
        const fid = `${id}-${Date.now()}`;
        setFlying((prev) => [
          ...prev,
          {
            id: fid,
            sx: ap.x,
            sy: ap.y,
            ex: sp.x,
            ey: sp.y,
            color: agent.color,
            glow: agent.glow,
            name: agent.name,
          },
        ]);
        setAgents((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'flying', sector, reason } : a))
        );
        setTimeout(() => {
          setFlying((prev) => prev.filter((f) => f.id !== fid));
          setAgents((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: 'settled' } : a))
          );
          setLog((prev) => [
            { key: Date.now(), agentId: id, agent, sector, reason },
            ...prev,
          ]);
        }, 1650);
      }
    } catch (err) {
      console.error(`Deploy ${id} failed:`, err);
      setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'idle' } : a)));
    }
  }, [getSvgScreenPoint, getAgentScreenPoint]);

  const deployAll = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    const idle = agents.filter((a) => a.status === 'idle');
    for (let i = 0; i < idle.length; i++) {
      await new Promise((r) => setTimeout(r, 750));
      deploy(idle[i].id);
    }
    setBusy(false);
  }, [busy, agents, deploy]);

  const reset = useCallback(() => {
    setAgents(initialAgentStates());
    setFlying([]);
    setGateOpen(false);
    setLog([]);
    setBusy(false);
  }, []);

  const anyIdle = agents.some((a) => a.status === 'idle');

  return {
    agents,
    flying,
    gateOpen,
    log,
    busy,
    anyIdle,
    svgRef,
    setAgentRef,
    deploy,
    deployAll,
    reset,
  };
}
```

**Step 2: Commit**

```bash
git add frontend/src/hooks/useAgentRouter.ts
git commit -m "feat: add useAgentRouter hook with state machine and API integration"
```

---

### Task 9: Frontend Components

**Files:**
- Create: `frontend/src/components/EOSWheel.tsx`
- Create: `frontend/src/components/AgentPool.tsx`
- Create: `frontend/src/components/FlyingNode.tsx`
- Create: `frontend/src/components/DecisionLog.tsx`
- Create: `frontend/src/components/GateDivider.tsx`
- Create: `frontend/src/components/SectorTooltip.tsx`

Build all six components following the prototype's visual design exactly. Each component uses styled-components and references the theme. Reference the prototype code for exact styling values, but use proper component architecture.

Key implementation notes per component:

- **EOSWheel**: Takes `svgRef`, `agents` (for settled badges), `hoveredSector`/`setHoveredSector`. Uses `makeSectorPath`, `labelPosition`, `badgePosition` from geometry hook. Sectors with settled agents get `drop-shadow(0 0 12px rgba(255,155,50,0.55))`.
- **AgentPool**: Takes `agents`, `setAgentRef`, `deploy`, `deployAll`, `reset`, `busy`, `anyIdle`. Each agent node is a clickable div with ref callback. Shows spinning ring for `thinking`, dashed ring for `flying`, faded for `settled`.
- **FlyingNode**: Takes `FlyingNodeData`. Fixed-position div that animates from (sx,sy) to (ex,ey) using CSS transition with `cubic-bezier(0.34,1.56,0.64,1)` over 1.4s. Triggers animation via useEffect after mount.
- **DecisionLog**: Takes `log: DecisionLogEntry[]`. Shows agent color dot, name, arrow, sector badge, reason. Most recent at top. fadein animation.
- **GateDivider**: Takes `gateOpen: boolean`. Horizontal line with pulse animation when closed, dim when open. Label toggles between gate states.
- **SectorTooltip**: Takes `sectorId: SectorId | null`. Fixed at bottom of viewport. Fades in/out. Shows sector name and description.

**Step 1: Create all six component files with full implementations**

(Each component follows the prototype's inline styles converted to styled-components)

**Step 2: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add all frontend components (wheel, pool, flying node, log, gate, tooltip)"
```

---

### Task 10: App.tsx -- Compose Everything

**Files:**
- Create: `frontend/src/App.tsx`

**Step 1: Create App.tsx**

Compose all components together:
- Ambient background layers (radial gradient + dot grid)
- Header with title "EOS x AI AGENTS"
- Main layout: EOSWheel (left) + DecisionLog (right)
- GateDivider
- AgentPool with deploy/reset buttons
- SectorTooltip
- FlyingNode layer

Wire up `useAgentRouter` hook and `hoveredSector` state.

**Step 2: Verify frontend builds**

```bash
cd /Users/cperez/Desktop/altivum/eos/frontend && npm run build
```

Expected: Build succeeds, outputs to `dist/`.

**Step 3: Verify frontend runs locally**

```bash
cd /Users/cperez/Desktop/altivum/eos/frontend && npm run dev
```

Open http://localhost:3000 -- verify wheel renders, agents display, clicking deploy hits the API.

**Step 4: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: compose App with all components wired to agent router"
```

---

### Task 11: Amplify Config and Environment

**Files:**
- Create: `amplify.yml`
- Modify: `frontend/vite.config.ts` (add env handling if needed)

**Step 1: Create amplify.yml**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend && npm ci
    build:
      commands:
        - cd frontend && npm run build
  artifacts:
    baseDirectory: frontend/dist
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

**Step 2: Commit**

```bash
git add amplify.yml
git commit -m "chore: add Amplify build configuration"
```

---

### Task 12: End-to-End Verification

**Step 1: Set VITE_API_ENDPOINT to the deployed API Gateway URL**

Create `frontend/.env`:
```
VITE_API_ENDPOINT=https://<api-id>.execute-api.us-east-1.amazonaws.com
```

(Get the URL from CDK output `EosAgentsStack.ApiEndpoint`)

**Step 2: Run frontend locally against live API**

```bash
cd /Users/cperez/Desktop/altivum/eos/frontend && npm run dev
```

**Step 3: Verify all five agents**

Click each agent individually, verify:
- Thinking spinner appears
- Flying node animates to a sector
- Badge appears on wheel
- Decision log entry appears
- Each agent uses its actual Bedrock model (verify in Lambda CloudWatch logs)

**Step 4: Verify Deploy All**

Click Deploy All, verify staggered deployment with 750ms delay.

**Step 5: Verify Reset**

Click Reset, verify all agents return to idle, log clears, gate closes.

**Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete EOS x AI Agents with live Bedrock integration"
```

---

Plan complete and saved to `docs/plans/2026-03-07-eos-agents-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open a new session with executing-plans, batch execution with checkpoints

Which approach?