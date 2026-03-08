import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import type { SectorId } from '../types';

interface StatsBarProps {
  totalDeployments: number;
  mostPopularSector: SectorId | null;
  mostPopularPct: number;
  avgLatencyMs: number;
  sessionCount: number;
  onClearHistory: () => void;
}

const Container = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  margin-top: 20px;
  padding: 10px 16px;
  border-top: 1px solid ${theme.borderDim};
  flex-wrap: wrap;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${theme.fontMono};
`;

const StatLabel = styled.span`
  font-size: 8px;
  letter-spacing: 2px;
  color: ${theme.textDim};
  font-weight: 700;
`;

const StatValue = styled.span`
  font-size: 11px;
  color: ${theme.accent};
  font-weight: 700;
`;

const ClearButton = styled.button`
  font-size: 8px;
  letter-spacing: 2px;
  color: ${theme.textDark};
  font-weight: 700;
  font-family: ${theme.fontMono};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  padding: 2px 4px;

  &:hover {
    color: ${theme.textDim};
  }
`;

const StatsBar: React.FC<StatsBarProps> = ({
  totalDeployments,
  mostPopularSector,
  mostPopularPct,
  avgLatencyMs,
  sessionCount,
  onClearHistory,
}) => {
  if (totalDeployments === 0) return null;

  return (
    <Container>
      <Stat>
        <StatLabel>TOTAL</StatLabel>
        <StatValue>{totalDeployments}</StatValue>
      </Stat>
      {mostPopularSector && (
        <Stat>
          <StatLabel>TOP SECTOR</StatLabel>
          <StatValue>
            {mostPopularSector.toUpperCase()} ({mostPopularPct}%)
          </StatValue>
        </Stat>
      )}
      <Stat>
        <StatLabel>AVG LATENCY</StatLabel>
        <StatValue>{(avgLatencyMs / 1000).toFixed(1)}s</StatValue>
      </Stat>
      <Stat>
        <StatLabel>SESSIONS</StatLabel>
        <StatValue>{sessionCount}</StatValue>
      </Stat>
      <ClearButton
        onClick={() => {
          if (window.confirm('Clear all routing history?')) onClearHistory();
        }}
      >
        CLEAR HISTORY
      </ClearButton>
    </Container>
  );
};

export default StatsBar;
