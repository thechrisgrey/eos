import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../styles/theme';
import type { AgentState, InferenceStep, RaceEntry } from '../types';

interface RacePanelProps {
  state: Record<string, RaceEntry>;
  agents: AgentState[];
  onDismiss: () => void;
}

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const STEP_PROGRESS: Record<InferenceStep, number> = {
  'init': 0,
  'turn1-sending': 1,
  'turn1-received': 2,
  'turn2-sending': 3,
  'turn2-received': 4,
  'turn3-sending': 5,
  'turn3-received': 6,
  'routing': 7,
  'error': -1,
};

const STATUS_TEXT: Record<InferenceStep, string> = {
  'init': 'STARTING',
  'turn1-sending': 'TURN 1',
  'turn1-received': 'ANALYZING',
  'turn2-sending': 'TURN 2',
  'turn2-received': 'DECIDING',
  'turn3-sending': 'TURN 3',
  'turn3-received': 'RE-ROUTING',
  'routing': 'ROUTED',
  'error': 'ERROR',
};

const Panel = styled.div`
  position: fixed;
  z-index: 100;
  top: 16px;
  right: 16px;
  width: 360px;
  display: flex;
  flex-direction: column;
  background: rgba(8, 8, 14, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow:
    0 0 60px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(234, 88, 12, 0.04);
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100% - 32px);
    left: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const HeaderTitle = styled.div`
  font-size: 9px;
  letter-spacing: 3px;
  color: ${theme.accent};
  font-weight: 700;
  font-family: ${theme.fontMono};
`;

const DismissBtn = styled.button<{ $done?: boolean }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;

  ${(p) => p.$done ? css`
    background: ${theme.accent};
    border: 1px solid ${theme.accent};
    color: #fff;
    &:hover {
      background: ${theme.accentHover};
      box-shadow: 0 2px 12px rgba(249, 115, 22, 0.3);
    }
  ` : css`
    background: transparent;
    border: 1px solid ${theme.border};
    color: ${theme.textDim};
    &:hover {
      border-color: ${theme.textDim};
      color: ${theme.textSoft};
    }
  `}
`;

const Rows = styled.div`
  padding: 6px 0;
  max-height: 420px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
`;

const Row = styled.div<{ $error?: boolean; $done?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  transition: background 0.3s;

  ${(p) => p.$error && css`background: rgba(239, 68, 68, 0.05);`}
  ${(p) => p.$done && css`background: rgba(234, 88, 12, 0.03);`}
`;

const ModelDot = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  font-family: ${theme.fontMono};
  flex-shrink: 0;
  box-shadow: 0 0 8px ${(p) => p.$color}55;
`;

const ModelName = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: ${theme.text};
  font-family: ${theme.fontMono};
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DotsWrap = styled.div`
  display: flex;
  gap: 3px;
  align-items: center;
`;

const StepDot = styled.div<{ $state: 'pending' | 'active' | 'done' | 'error'; $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all 0.3s;

  ${(p) => {
    switch (p.$state) {
      case 'pending':
        return css`background: rgba(255, 255, 255, 0.07);`;
      case 'active':
        return css`
          background: ${p.$color};
          box-shadow: 0 0 6px ${p.$color};
          animation: ${pulse} 1s ease-in-out infinite;
        `;
      case 'done':
        return css`
          background: ${p.$color};
          opacity: 0.65;
        `;
      case 'error':
        return css`
          background: #ef4444;
          box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
        `;
    }
  }}
`;

const StatusLabel = styled.div<{ $color: string; $error?: boolean }>`
  font-size: 9px;
  font-family: ${theme.fontMono};
  letter-spacing: 1px;
  font-weight: 700;
  white-space: nowrap;
  text-align: right;
  min-width: 56px;
  color: ${(p) => p.$error ? '#fca5a5' : p.$color};
`;

const LatencyLabel = styled.span`
  font-size: 8px;
  color: ${theme.textDim};
  font-family: ${theme.fontMono};
  font-weight: 400;
  letter-spacing: 0;
  margin-left: 4px;
`;

function dotState(progress: number, dotPos: number, isError: boolean): 'pending' | 'active' | 'done' | 'error' {
  if (isError) return 'error';
  if (progress > dotPos) return 'done';
  if (progress === dotPos) return 'active';
  return 'pending';
}

const RacePanel: React.FC<RacePanelProps> = ({ state, agents, onDismiss }) => {
  const entries = Object.entries(state);
  const completed = entries.filter(([, e]) => e.step === 'routing').length;
  const errored = entries.filter(([, e]) => e.step === 'error').length;
  const total = entries.length;
  const allDone = completed + errored === total;

  return (
    <Panel>
      <Header>
        <HeaderTitle>
          DEPLOYING {completed + errored} / {total}
        </HeaderTitle>
        <DismissBtn $done={allDone} onClick={onDismiss}>
          {allDone ? 'DONE' : 'DISMISS'}
        </DismissBtn>
      </Header>
      <Rows>
        {entries.map(([id, entry]) => {
          const agent = agents.find((a) => a.id === id);
          if (!agent) return null;

          const progress = STEP_PROGRESS[entry.step];
          const isError = entry.step === 'error';
          const isDone = entry.step === 'routing';

          const latency = (entry.turn1LatencyMs || 0) + (entry.turn2LatencyMs || 0) + (entry.turn3LatencyMs || 0);
          const latencyText = latency > 0 ? `${(latency / 1000).toFixed(1)}s` : '';

          let status = STATUS_TEXT[entry.step];
          if (isDone && entry.sector) {
            status = entry.sector.toUpperCase();
          }

          return (
            <Row key={id} $error={isError} $done={isDone}>
              <ModelDot $color={agent.color}>{agent.name[0]}</ModelDot>
              <ModelName>{agent.name}</ModelName>
              <DotsWrap>
                {[1, 2, 3, 4, 5, 6, 7].map((pos) => (
                  <StepDot
                    key={pos}
                    $state={dotState(progress, pos, isError)}
                    $color={agent.color}
                  />
                ))}
              </DotsWrap>
              <StatusLabel $color={agent.color} $error={isError}>
                {status}
                {latencyText && !isError && (
                  <LatencyLabel>{latencyText}</LatencyLabel>
                )}
              </StatusLabel>
            </Row>
          );
        })}
      </Rows>
    </Panel>
  );
};

export default RacePanel;
