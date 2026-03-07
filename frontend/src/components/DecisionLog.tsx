import React from 'react';
import styled from 'styled-components';
import { DecisionLogEntry } from '../types';
import { theme } from '../styles/theme';

interface DecisionLogProps {
  log: DecisionLogEntry[];
}

const Container = styled.div`
  flex: 1 1 200px;
  min-width: 200px;
  max-width: 340px;
  background: ${theme.panelBg};
  border: 1px solid ${theme.border};
  border-radius: 12px;
  padding: 18px 16px;
  max-height: 460px;
  overflow-y: auto;
`;

const Header = styled.div`
  font-size: 8px;
  letter-spacing: 5px;
  color: ${theme.accent};
  margin-bottom: 16px;
  font-weight: 700;
  font-family: ${theme.fontMono};
`;

const EmptyState = styled.div`
  color: ${theme.textDarker};
  font-size: 11px;
  line-height: 1.9;
  font-family: ${theme.fontMono};
`;

const Entry = styled.div`
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${theme.borderDim};
  animation: fadein 0.35s ease;
`;

const EntryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  flex-wrap: wrap;
  margin-bottom: 5px;
`;

const ColorDot = styled.div<{ $color: string; $glow: string }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  box-shadow: 0 0 8px ${(p) => p.$glow};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DotLetter = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  font-family: ${theme.fontMono};
`;

const AgentNameLabel = styled.span<{ $color: string }>`
  color: ${(p) => p.$color};
  font-weight: 700;
  font-size: 11px;
  font-family: ${theme.fontMono};
`;

const Arrow = styled.span`
  color: ${theme.textDark};
  font-size: 9px;
  font-family: ${theme.fontMono};
`;

const SectorBadge = styled.span`
  color: ${theme.accentHover};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  background: rgba(249, 115, 22, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  font-family: ${theme.fontMono};
`;

const ReasonText = styled.div`
  font-size: 10px;
  color: ${theme.textMuted};
  line-height: 1.75;
  padding-left: 29px;
  font-family: ${theme.fontMono};
`;

const DecisionLog: React.FC<DecisionLogProps> = ({ log }) => {
  return (
    <Container>
      <Header>AGENT DECISIONS</Header>
      {log.length === 0 ? (
        <EmptyState>
          Deploy agents below to see their self-routing decisions appear
          here...
        </EmptyState>
      ) : (
        log.map((entry) => (
          <Entry key={entry.key}>
            <EntryHeader>
              <ColorDot $color={entry.agent.color} $glow={entry.agent.glow}>
                <DotLetter>{entry.agent.name[0]}</DotLetter>
              </ColorDot>
              <AgentNameLabel $color={entry.agent.color}>
                {entry.agent.name}
              </AgentNameLabel>
              <Arrow>{'->'}</Arrow>
              <SectorBadge>{entry.sector.toUpperCase()}</SectorBadge>
            </EntryHeader>
            <ReasonText>{entry.reason}</ReasonText>
          </Entry>
        ))
      )}
    </Container>
  );
};

export default DecisionLog;
