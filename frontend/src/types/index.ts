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

export interface RouteAgentRequest {
  agentId: string;
  agentName: string;
  agentProvider: string;
  capability: string;
  modelId: string;
  temperature: number;
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
