import { useState, useRef, useCallback } from 'react';
import { MODEL_CATALOG, DEFAULT_SELECTED_IDS } from '../data/models';
import { SECTORS } from '../data/sectors';
import type {
  AgentState,
  AgentId,
  FlyingNodeData,
  DecisionLogEntry,
  RouteAgentResponse,
  ModelEntry,
} from '../types';
import { svgPointToScreen } from './useSectorGeometry';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

function buildAgentState(model: ModelEntry): AgentState {
  return {
    ...model,
    status: 'idle',
    sector: null,
    reason: null,
    inference: null,
  };
}

export function useAgentRouter() {
  const [selectedIds, setSelectedIds] = useState<string[]>(DEFAULT_SELECTED_IDS);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>(() => {
    const map: Record<string, AgentState> = {};
    for (const model of MODEL_CATALOG) {
      map[model.id] = buildAgentState(model);
    }
    return map;
  });
  const [flying, setFlying] = useState<FlyingNodeData[]>([]);
  const [gateOpen, setGateOpen] = useState(false);
  const [log, setLog] = useState<DecisionLogEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [temperature, setTemperature] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const agentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const agents = selectedIds.map((id) => agentStates[id]).filter(Boolean);

  const setAgentRef = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      agentRefs.current[id] = el;
    },
    [],
  );

  const toggleModel = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Don't deselect if deployed
        const state = agentStates[id];
        if (state && state.status !== 'idle') return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  }, [agentStates]);

  const deploy = useCallback(async (id: AgentId) => {
    const model = MODEL_CATALOG.find((m) => m.id === id);
    if (!model) return;

    setGateOpen(true);
    setAgentStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: 'thinking' },
    }));

    try {
      const res = await fetch(`${API_ENDPOINT}/api/route-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: model.id,
          agentName: model.name,
          agentProvider: model.provider,
          capability: model.capability,
          modelId: model.modelId,
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
        color: model.color,
        glow: model.glow,
        name: model.name,
      };

      setFlying((prev) => [...prev, flyingNode]);
      const inferenceResult = { systemPrompt, turn1Prompt, turn1Response, turn2Prompt, turn2Response, temperature: usedTemp, latencyMs };
      setAgentStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: 'flying', sector, reason, inference: inferenceResult },
      }));

      setTimeout(() => {
        setFlying((prev) => prev.filter((f) => f.id !== flyingNode.id));
        setAgentStates((prev) => ({
          ...prev,
          [id]: { ...prev[id], status: 'settled' },
        }));
        setLog((prev) => [
          {
            key: Date.now(),
            agentId: id,
            agent: model,
            sector,
            reason,
          },
          ...prev,
        ]);
      }, 1650);
    } catch (err) {
      console.error(`Failed to deploy agent ${id}:`, err);
      setAgentStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: 'idle', sector: null, reason: null, inference: null },
      }));
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
      deploy(idleIds[i]);
    }

    setBusy(false);
  }, [busy, agents, deploy]);

  const reset = useCallback(() => {
    setAgentStates((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        const model = MODEL_CATALOG.find((m) => m.id === id);
        if (model) {
          next[id] = buildAgentState(model);
        }
      }
      return next;
    });
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
    selectedIds,
    toggleModel,
  };
}
