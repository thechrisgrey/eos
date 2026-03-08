import { useState, useRef, useCallback } from 'react';
import { MODEL_CATALOG, DEFAULT_SELECTED_IDS } from '../data/models';
import { SECTORS } from '../data/sectors';
import type {
  AgentState,
  AgentId,
  FlyingNodeData,
  DecisionLogEntry,
  DeploymentInstance,
  Turn1Response,
  Turn2Response,
  Turn3Response,
  ModelEntry,
  InferenceModalState,
  InferenceStep,
  RaceEntry,
  SectorId,
} from '../types';
import { svgPointToScreen } from './useSectorGeometry';
import { useResultsStore } from './useResultsStore';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

interface DeployOptions {
  skipModal?: boolean;
  onStepChange?: (step: InferenceStep, data?: Record<string, unknown>) => void;
}

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
  const [raceState, setRaceState] = useState<Record<string, RaceEntry> | null>(null);
  const [deployments, setDeployments] = useState<DeploymentInstance[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);
  const agentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const skippedRef = useRef(false);
  const deploymentsRef = useRef<DeploymentInstance[]>([]);
  deploymentsRef.current = deployments;

  const {
    sectorCounts,
    totalDeployments,
    avgLatencyMs,
    mostPopularSector,
    mostPopularPct,
    sessionCount,
    addResult,
    clearHistory,
    exportJSON,
  } = useResultsStore();

  const agents = selectedIds.map((id) => agentStates[id]).filter(Boolean);
  const totalDeployed = deployments.length;

  const occupiedSectors: SectorId[] = SECTORS
    .filter((s) => deployments.filter((d) => d.sector === s.id).length >= 2)
    .map((s) => s.id);

  const deployCountByModel: Record<string, number> = {};
  for (const d of deployments) {
    deployCountByModel[d.modelId] = (deployCountByModel[d.modelId] || 0) + 1;
  }

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
        if (deploymentsRef.current.some((d) => d.modelId === id)) return prev;
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

  const dismissRace = useCallback(() => {
    setRaceState(null);
  }, []);

  const deploy = useCallback(async (id: AgentId, opts?: DeployOptions) => {
    const model = MODEL_CATALOG.find((m) => m.id === id);
    if (!model) return;

    const showModal = !opts?.skipModal;

    if (showModal) skippedRef.current = false;
    setGateOpen(true);
    setAgentStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: 'thinking' },
    }));

    if (showModal) {
      setInferenceModal({
        agentId: id,
        agent: model,
        step: 'init',
      });
    }
    opts?.onStepChange?.('init', {});

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
      if (showModal && !skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn1-sending',
          systemPrompt: undefined,
          turn1Prompt: undefined,
        } : prev);
      }
      opts?.onStepChange?.('turn1-sending', {});

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

      if (showModal && !skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn1-sending',
          systemPrompt: turn1Data.systemPrompt,
          turn1Prompt: turn1Data.turn1Prompt,
        } : prev);

        await new Promise((r) => setTimeout(r, 300));

        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn1-received',
          turn1Response: turn1Data.turn1Response,
          turn1LatencyMs: turn1Data.latencyMs,
        } : prev);

        await new Promise((r) => setTimeout(r, 800));
      }
      opts?.onStepChange?.('turn1-received', { turn1LatencyMs: turn1Data.latencyMs });

      // ── Turn 2 ──
      if (showModal && !skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'turn2-sending',
        } : prev);
      }
      opts?.onStepChange?.('turn2-sending', {});

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

      if (showModal && !skippedRef.current) {
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
      }
      opts?.onStepChange?.('turn2-received', { turn2LatencyMs: turn2Data.latencyMs });

      // ── Check if Turn 2 sector is occupied → Turn 3 ──
      const currentOccupied = SECTORS
        .filter((s) => deploymentsRef.current.filter((d) => d.sector === s.id).length >= 2)
        .map((s) => s.id);

      let sector = turn2Data.sector;
      let reason = turn2Data.reason;
      let totalLatencyMs = turn1Data.latencyMs + turn2Data.latencyMs;
      let turn3Prompt: string | undefined;
      let turn3Response: string | undefined;
      let turn3LatencyMs: number | undefined;

      if (currentOccupied.includes(turn2Data.sector)) {
        // Sector is full — fire Turn 3
        if (showModal && !skippedRef.current) {
          setInferenceModal((prev) => prev && prev.agentId === id ? {
            ...prev,
            step: 'turn3-sending',
            originalSector: turn2Data.sector,
          } : prev);
        }
        opts?.onStepChange?.('turn3-sending', {});

        const res3 = await fetch(`${API_ENDPOINT}/api/route-agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...baseBody,
            turn: 3,
            turn1Response: turn1Data.turn1Response,
            turn2Response: turn2Data.turn2Response,
            originalSector: turn2Data.sector,
            occupiedSectors: currentOccupied,
          }),
        });

        if (!res3.ok) {
          const errData = await res3.json().catch(() => ({ error: `API error: ${res3.status}` }));
          throw new Error(errData.error || `API error: ${res3.status}`);
        }

        const turn3Data: Turn3Response = await res3.json();

        if (showModal && !skippedRef.current) {
          setInferenceModal((prev) => prev && prev.agentId === id ? {
            ...prev,
            step: 'turn3-sending',
            turn3Prompt: turn3Data.turn3Prompt,
          } : prev);

          await new Promise((r) => setTimeout(r, 300));

          setInferenceModal((prev) => prev && prev.agentId === id ? {
            ...prev,
            step: 'turn3-received',
            turn3Response: turn3Data.turn3Response,
            turn3LatencyMs: turn3Data.latencyMs,
          } : prev);

          await new Promise((r) => setTimeout(r, 800));
        }
        opts?.onStepChange?.('turn3-received', { turn3LatencyMs: turn3Data.latencyMs });

        sector = turn3Data.sector;
        reason = turn3Data.reason;
        totalLatencyMs += turn3Data.latencyMs;
        turn3Prompt = turn3Data.turn3Prompt;
        turn3Response = turn3Data.turn3Response;
        turn3LatencyMs = turn3Data.latencyMs;
      }

      // ── Final routing ──
      if (showModal && !skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'routing',
          sector,
          reason,
        } : prev);
      }
      opts?.onStepChange?.('routing', { sector });

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

      if (showModal && !skippedRef.current) {
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

        const deployment: DeploymentInstance = {
          id: `${id}-${Date.now()}`,
          modelId: id,
          model,
          sector,
          reason,
          inference: inferenceResult,
        };
        setDeployments((prev) => [...prev, deployment]);

        setAgentStates((prev) => ({
          ...prev,
          [id]: { ...prev[id], status: 'idle', sector: null, reason: null, inference: null },
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
        addResult({
          modelId: model.modelId,
          modelName: model.name,
          provider: model.provider,
          sector,
          reason,
          temperature,
          latencyMs: totalLatencyMs,
        });
      }, 1650);
    } catch (err) {
      console.error(`Failed to deploy agent ${id}:`, err);

      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      if (showModal && !skippedRef.current) {
        setInferenceModal((prev) => prev && prev.agentId === id ? {
          ...prev,
          step: 'error',
          error: errorMsg,
        } : prev);
      }

      opts?.onStepChange?.('error', { error: errorMsg });

      setAgentStates((prev) => ({
        ...prev,
        [id]: { ...prev[id], status: 'idle', sector: null, reason: null, inference: null },
      }));
    }
  }, [temperature, addResult]);

  const deployAll = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    const remaining = 6 - deploymentsRef.current.length;
    const idleIds = agents
      .filter((a) => a.status === 'idle')
      .map((a) => a.id)
      .slice(0, remaining);

    // Initialize race state
    const initialRace: Record<string, RaceEntry> = {};
    for (const id of idleIds) {
      initialRace[id] = { step: 'init' };
    }
    setRaceState(initialRace);

    // Deploy all concurrently
    await Promise.allSettled(
      idleIds.map((id) =>
        deploy(id, {
          skipModal: true,
          onStepChange: (step, data) => {
            setRaceState((prev) =>
              prev
                ? { ...prev, [id]: { ...prev[id], step, ...data } as RaceEntry }
                : prev,
            );
          },
        }),
      ),
    );

    // Auto-dismiss race panel after delay
    setTimeout(() => setRaceState(null), 2000);
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
    setRaceState(null);
    setDeployments([]);
  }, []);

  const anyIdle = totalDeployed < 6 && agents.some((a) => a.status === 'idle');

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
    raceState,
    dismissRace,
    deployments,
    totalDeployed,
    deployCountByModel,
    sectorCounts,
    totalDeployments,
    avgLatencyMs,
    mostPopularSector,
    mostPopularPct,
    sessionCount,
    clearHistory,
    exportJSON,
  };
}
