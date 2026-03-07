import { useState, useRef, useCallback } from 'react';
import { AGENTS } from '../data/agents';
import { SECTORS } from '../data/sectors';
import type {
  AgentState,
  AgentId,
  FlyingNodeData,
  DecisionLogEntry,
  RouteAgentResponse,
} from '../types';
import { svgPointToScreen } from './useSectorGeometry';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

function buildInitialAgents(): AgentState[] {
  return AGENTS.map((a) => ({
    ...a,
    status: 'idle' as const,
    sector: null,
    reason: null,
    inference: null,
  }));
}

export function useAgentRouter() {
  const [agents, setAgents] = useState<AgentState[]>(buildInitialAgents);
  const [flying, setFlying] = useState<FlyingNodeData[]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const [log, setLog] = useState<DecisionLogEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [temperature, setTemperature] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const agentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const setAgentRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      agentRefs.current[id] = el;
    },
    [],
  );

  const deploy = useCallback(async (id: AgentId) => {
    const agent = AGENTS.find((a) => a.id === id);
    if (!agent) return;

    setGateOpen(true);
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'thinking' as const } : a)),
    );

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
          temperature,
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: RouteAgentResponse = await res.json();
      const { sector, reason, systemPrompt, turn1Prompt, turn1Response, turn2Prompt, turn2Response, temperature: usedTemp, latencyMs } = data;

      const sectorDef = SECTORS.find((s) => s.id === sector);
      if (!sectorDef || !svgRef.current) throw new Error('Missing sector or SVG ref');

      const target = svgPointToScreen(svgRef.current, sectorDef.centerAngle);
      const agentEl = agentRefs.current[id];
      const agentRect = agentEl?.getBoundingClientRect();

      const sx = agentRect ? agentRect.left + agentRect.width / 2 : 0;
      const sy = agentRect ? agentRect.top + agentRect.height / 2 : 0;

      const flyingNode: FlyingNodeData = {
        id: `${id}-${Date.now()}`,
        sx,
        sy,
        ex: target.x,
        ey: target.y,
        color: agent.color,
        glow: agent.glow,
        name: agent.name,
      };

      setFlying((prev) => [...prev, flyingNode]);
      const inferenceResult = { systemPrompt, turn1Prompt, turn1Response, turn2Prompt, turn2Response, temperature: usedTemp, latencyMs };
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: 'flying' as const, sector, reason, inference: inferenceResult }
            : a,
        ),
      );

      setTimeout(() => {
        setFlying((prev) => prev.filter((f) => f.id !== flyingNode.id));
        setAgents((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: 'settled' as const } : a,
          ),
        );
        setLog((prev) => [
          {
            key: Date.now(),
            agentId: id,
            agent,
            sector,
            reason,
          },
          ...prev,
        ]);
      }, 1650);
    } catch (err) {
      console.error(`Failed to deploy agent ${id}:`, err);
      setAgents((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: 'idle' as const, sector: null, reason: null, inference: null }
            : a,
        ),
      );
    }
  }, [temperature]);

  const deployAll = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    const idleIds = agents
      .filter((a) => a.status === 'idle')
      .map((a) => a.id);

    for (let i = 0; i < idleIds.length; i++) {
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 750));
      }
      deploy(idleIds[i]); // fire and forget -- don't await
    }

    setBusy(false);
  }, [busy, agents, deploy]);

  const reset = useCallback(() => {
    setAgents(buildInitialAgents());
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
    temperature,
    setTemperature,
  };
}
