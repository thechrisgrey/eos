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

export type AgentId = string;

export type AgentStatus = 'idle' | 'thinking' | 'flying' | 'settled';

export interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  color: string;
  glow: string;
  capability: string;
  modelId: string;
}

export interface Agent extends ModelEntry {}

export interface AgentInferenceResult {
  systemPrompt: string;
  turn1Prompt: string;
  turn1Response: string;
  turn2Prompt: string;
  turn2Response: string;
  temperature: number;
  latencyMs: number;
}

export interface AgentState extends Agent {
  status: AgentStatus;
  sector: SectorId | null;
  reason: string | null;
  inference: AgentInferenceResult | null;
}

export interface DeploymentInstance {
  id: string;
  modelId: string;
  model: ModelEntry;
  sector: SectorId;
  reason: string;
  inference: AgentInferenceResult;
}

export interface RouteAgentRequest {
  agentId: string;
  agentName: string;
  agentProvider: string;
  capability: string;
  modelId: string;
  temperature: number;
  turn?: 1 | 2;
  turn1Response?: string;
  occupiedSectors?: string[];
}

export interface RouteAgentResponse {
  sector: SectorId;
  reason: string;
  systemPrompt: string;
  turn1Prompt: string;
  turn1Response: string;
  turn2Prompt: string;
  turn2Response: string;
  temperature: number;
  latencyMs: number;
}

export interface Turn1Response {
  systemPrompt: string;
  turn1Prompt: string;
  turn1Response: string;
  temperature: number;
  latencyMs: number;
}

export interface Turn2Response {
  turn2Prompt: string;
  turn2Response: string;
  sector: SectorId;
  reason: string;
  latencyMs: number;
}

export interface RouteAgentError {
  error: string;
}

export type InferenceStep =
  | 'init'
  | 'turn1-sending'
  | 'turn1-received'
  | 'turn2-sending'
  | 'turn2-received'
  | 'routing'
  | 'error';

export interface InferenceModalState {
  agentId: string;
  agent: ModelEntry;
  step: InferenceStep;
  systemPrompt?: string;
  turn1Prompt?: string;
  turn1Response?: string;
  turn2Prompt?: string;
  turn2Response?: string;
  sector?: SectorId;
  reason?: string;
  error?: string;
  turn1LatencyMs?: number;
  turn2LatencyMs?: number;
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

export interface RaceEntry {
  step: InferenceStep;
  turn1LatencyMs?: number;
  turn2LatencyMs?: number;
  sector?: SectorId;
  error?: string;
}

export interface StoredResult {
  id: string;
  timestamp: number;
  modelId: string;
  modelName: string;
  provider: string;
  sector: SectorId;
  reason: string;
  temperature: number;
  latencyMs: number;
}
