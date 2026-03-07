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
