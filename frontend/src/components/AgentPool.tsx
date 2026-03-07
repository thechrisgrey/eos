import React from 'react';
import styled from 'styled-components';
import { AgentState, AgentId } from '../types';
import { theme } from '../styles/theme';

interface AgentPoolProps {
  agents: AgentState[];
  setAgentRef: (id: string, el: HTMLDivElement | null) => void;
  deploy: (id: AgentId) => void;
  deployAll: () => void;
  reset: () => void;
  busy: boolean;
  anyIdle: boolean;
}

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-top: 28px;
`;

const MicroLabel = styled.div`
  font-size: 9px;
  letter-spacing: 5px;
  color: ${theme.textDim};
  text-align: center;
  font-weight: 700;
  margin-bottom: 24px;
  font-family: ${theme.fontMono};
`;

const AgentRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
`;

const AgentNode = styled.div<{ $idle: boolean; $settled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: ${(p) => (p.$settled ? 0.25 : 1)};
  transition: opacity 0.6s, transform 0.2s;
  cursor: ${(p) => (p.$idle ? 'pointer' : 'default')};

  &:hover {
    transform: ${(p) => (p.$idle ? 'scale(1.12)' : 'none')};
  }
`;

const CircleContainer = styled.div`
  position: relative;
`;

const SpinRing = styled.div<{ $color: string }>`
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid ${(p) => p.$color};
  border-top-color: transparent;
  animation: spin 0.7s linear infinite;
`;

const DashRing = styled.div<{ $color: string }>`
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px dashed ${(p) => p.$color}44;
  animation: spin 2s linear infinite;
`;

const MainCircle = styled.div<{
  $color: string;
  $glow: string;
  $status: string;
}>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  font-family: ${theme.fontMono};
  transition: all 0.3s;

  ${(p) => {
    switch (p.$status) {
      case 'idle':
        return `
          background: radial-gradient(circle at 35% 35%, ${p.$color}, ${p.$color}bb);
          border: 2px solid ${p.$color};
          box-shadow: 0 0 22px ${p.$glow};
        `;
      case 'settled':
        return `
          background: ${p.$color}18;
          border: 2px solid ${p.$color}55;
          box-shadow: none;
        `;
      default:
        return `
          background: ${p.$color}44;
          border: 2px solid ${p.$color}55;
          box-shadow: none;
        `;
    }
  }}
`;

const AgentName = styled.div<{ $color: string; $idle: boolean }>`
  font-size: 10px;
  font-weight: 700;
  color: ${(p) => (p.$idle ? p.$color : theme.textDim)};
  font-family: ${theme.fontMono};
`;

const AgentStatus = styled.div`
  font-size: 9px;
  color: ${theme.textDim};
  letter-spacing: 1px;
  font-family: ${theme.fontMono};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 32px;
`;

const DeployButton = styled.button<{ $active: boolean }>`
  padding: 12px 32px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  cursor: ${(p) => (p.$active ? 'pointer' : 'not-allowed')};
  transition: all 0.2s;

  background: ${(p) => (p.$active ? theme.accent : 'transparent')};
  border: 1px solid ${(p) => (p.$active ? theme.accent : theme.border)};
  color: ${(p) => (p.$active ? '#fff' : theme.textDim)};

  &:hover {
    ${(p) =>
      p.$active &&
      `
      background: ${theme.accentHover};
      transform: translateY(-1px);
      box-shadow: 0 4px 20px rgba(249,115,22,0.35);
    `}
  }
`;

const ResetButton = styled.button`
  padding: 12px 32px;
  background: transparent;
  border: 1px solid ${theme.border};
  border-radius: 6px;
  color: ${theme.textDim};
  font-size: 11px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.textDim};
    color: ${theme.textSoft};
  }
`;

const AgentPool: React.FC<AgentPoolProps> = ({
  agents,
  setAgentRef,
  deploy,
  deployAll,
  reset,
  busy,
  anyIdle,
}) => {
  const canDeploy = !busy && anyIdle;

  return (
    <Container>
      <MicroLabel>AGENT POOL -- CLICK TO DEPLOY INDIVIDUALLY</MicroLabel>
      <AgentRow>
        {agents.map((a) => {
          const isIdle = a.status === 'idle';
          const isSettled = a.status === 'settled';

          let statusText = '';
          switch (a.status) {
            case 'idle':
              statusText = a.provider;
              break;
            case 'thinking':
              statusText = 'THINKING...';
              break;
            case 'flying':
              statusText = 'EN ROUTE ->';
              break;
            case 'settled':
              statusText = a.sector ? a.sector.toUpperCase() : '';
              break;
          }

          return (
            <AgentNode
              key={a.id}
              ref={(el) => setAgentRef(a.id, el)}
              $idle={isIdle}
              $settled={isSettled}
              onClick={() => isIdle && deploy(a.id)}
            >
              <CircleContainer>
                {a.status === 'thinking' && <SpinRing $color={a.color} />}
                {a.status === 'flying' && <DashRing $color={a.color} />}
                <MainCircle
                  $color={a.color}
                  $glow={a.glow}
                  $status={a.status}
                >
                  {isSettled ? '\u2713' : a.name[0]}
                </MainCircle>
              </CircleContainer>
              <AgentName $color={a.color} $idle={isIdle}>
                {a.name}
              </AgentName>
              <AgentStatus>{statusText}</AgentStatus>
            </AgentNode>
          );
        })}
      </AgentRow>

      <ButtonRow>
        <DeployButton
          $active={canDeploy}
          disabled={!canDeploy}
          onClick={() => canDeploy && deployAll()}
        >
          {busy ? 'DEPLOYING...' : 'DEPLOY ALL'}
        </DeployButton>
        <ResetButton onClick={reset}>RESET</ResetButton>
      </ButtonRow>
    </Container>
  );
};

export default AgentPool;
