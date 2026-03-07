import { useState, useRef, useCallback } from 'react';
import { MODEL_CATALOG, DEFAULT_SELECTED_IDS } from '../data/models';
import { SECTORS } from '../data/sectors';
import type {
  AgentState,
  AgentId,
  FlyingNodeData,
  DecisionLogEntry,
  Turn1Response,
  Turn2Response,
  ModelEntry,
  InferenceModalState,
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
  const [inferenceModal, setInferenceModal] = useState<InferenceModalState | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const agentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // Track whether the modal was skipped so we don't re-open it
  const skippedRef = useRef(false);

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
        const state = agentStates[id];
        if (state && state.status !== 'idle') return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  }, [agentStates]);

  const skipModal = useCallback(() => {
    skippedRef.current = true;
    setInferenceModal(null);
  }, []);

  const deploy = useCallback(async (id: AgentId) => {
    const model = MODEL_CATALOG.find((m) => m.id === id);
    if (!model) return;

    skippedRef.current = false;
    setGateOpen(true);
    setAgentStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: 'thinking' },
    }));

    // Open modal at init step
    setInferenceModal({
      agentId: id,
      agent: model,
      step: 'init',
    });

    const baseBody = {
      agentId: model.id,
      agentName: model.name,
      agentProvider: model.provider,
      capability: model.capability,
      modelId: model.modelId,
      temperature,
    };

    try {
      // ── Turn 1 ──
      if (!skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn1-sending',
          systemPrompt: undefined,
          turn1Prompt: undefined,
        } : prev);
      }

      const res1 = await fetch(`${API_ENDPOINT}/api/route-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseBody, turn: 1 }),
      });

      if (!res1.ok) {
        const errData = await res1.json().catch(() => ({ error: `API error: ${res1.status}` }));
        throw new Error(errData.error || `API error: ${res1.status}`);
      }

      const turn1Data: Turn1Response = await res1.json();

      // Show turn 1 sending state with prompts, then received
      if (!skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn1-sending',
          systemPrompt: turn1Data.systemPrompt,
          turn1Prompt: turn1Data.turn1Prompt,
        } : prev);

        // Brief delay to show the prompt before showing response
        await new Promise((r) => setTimeout(r, 300));

        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn1-received',
          turn1Response: turn1Data.turn1Response,
          turn1LatencyMs: turn1Data.latencyMs,
        } : prev);

        // Pause so user can read
        await new Promise((r) => setTimeout(r, 800));
      }

      // ── Turn 2 ──
      if (!skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn2-sending',
        } : prev);
      }

      const res2 = await fetch(`${API_ENDPOINT}/api/route-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...baseBody,
          turn: 2,
          turn1Response: turn1Data.turn1Response,
        }),
      });

      if (!res2.ok) {
        const errData = await res2.json().catch(() => ({ error: `API error: ${res2.status}` }));
        throw new Error(errData.error || `API error: ${res2.status}`);
      }

      const turn2Data: Turn2Response = await res2.json();

      if (!skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn2-sending',
          turn2Prompt: turn2Data.turn2Prompt,
        } : prev);

        await new Promise((r) => setTimeout(r, 300));

        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn2-received',
          turn2Response: turn2Data.turn2Response,
          turn2LatencyMs: turn2Data.latencyMs,
        } : prev);

        await new Promise((r) => setTimeout(r, 800));

        // Show routing result
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'routing',
          sector: turn2Data.sector,
          reason: turn2Data.reason,
        } : prev);
      }

      const { sector, reason } = turn2Data;
      const totalLatencyMs = turn1Data.latencyMs + turn2Data.latencyMs;
      const inferenceResult = {
        systemPrompt: turn1Data.systemPrompt,
        turn1Prompt: turn1Data.turn1Prompt,
        turn1Response: turn1Data.turn1Response,
        turn2Prompt: turn2Data.turn2Prompt,
        turn2Response: turn2Data.turn2Response,
        temperature: turn1Data.temperature,
        latencyMs: totalLatencyMs,
      };

      // ── Animate flying node ──
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

      // If modal is still showing, wait a moment then close before animating
      if (!skippedRef.current) {
        await new Promise((r) => setTimeout(r, 1200));
        setInferenceModal(null);
      }

      setFlying((prev) => [...prev, flyingNode]);
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

      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      if (!skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'error',
          error: errorMsg,
        } : prev);
      }

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
      await deploy(idleIds[i]);
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
    setInferenceModal(null);
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
    inferenceModal,
    skipModal,
  };
}
