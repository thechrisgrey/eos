import { useState, useMemo, useCallback } from 'react';
import type { SectorId, StoredResult } from '../types';

const STORAGE_KEY = 'eos-results-history';
const SESSION_KEY = 'eos-session-count';
const MAX_RESULTS = 500;

function loadResults(): StoredResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredResult[];
  } catch {
    return [];
  }
}

function saveResults(results: StoredResult[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

function incrementSessionCount(): number {
  const current = parseInt(localStorage.getItem(SESSION_KEY) || '0', 10);
  const next = current + 1;
  localStorage.setItem(SESSION_KEY, next.toString());
  return next;
}

export function useResultsStore() {
  const [results, setResults] = useState<StoredResult[]>(loadResults);
  const [sessionCount] = useState(() => incrementSessionCount());

  const sectorCounts = useMemo(() => {
    const counts: Record<SectorId, number> = {
      vision: 0, data: 0, process: 0, traction: 0, issues: 0, people: 0,
    };
    for (const r of results) {
      if (counts[r.sector] !== undefined) counts[r.sector]++;
    }
    return counts;
  }, [results]);

  const totalDeployments = results.length;

  const avgLatencyMs = useMemo(() => {
    if (results.length === 0) return 0;
    const sum = results.reduce((acc, r) => acc + r.latencyMs, 0);
    return Math.round(sum / results.length);
  }, [results]);

  const mostPopularSector = useMemo((): SectorId | null => {
    if (results.length === 0) return null;
    let max = 0;
    let sector: SectorId | null = null;
    for (const [s, count] of Object.entries(sectorCounts)) {
      if (count > max) {
        max = count;
        sector = s as SectorId;
      }
    }
    return sector;
  }, [results, sectorCounts]);

  const mostPopularPct = useMemo(() => {
    if (!mostPopularSector || totalDeployments === 0) return 0;
    return Math.round((sectorCounts[mostPopularSector] / totalDeployments) * 100);
  }, [mostPopularSector, sectorCounts, totalDeployments]);

  const addResult = useCallback((result: Omit<StoredResult, 'id' | 'timestamp'>) => {
    setResults((prev) => {
      const newResult: StoredResult = {
        ...result,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
      };
      const next = [newResult, ...prev].slice(0, MAX_RESULTS);
      saveResults(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setResults([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(SESSION_KEY, '0');
  }, []);

  const exportJSON = useCallback(() => {
    return JSON.stringify(results, null, 2);
  }, [results]);

  return {
    results,
    sectorCounts,
    totalDeployments,
    avgLatencyMs,
    mostPopularSector,
    mostPopularPct,
    sessionCount,
    addResult,
    clearHistory,
    exportJSON,
  };
}
