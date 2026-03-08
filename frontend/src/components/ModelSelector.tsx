import React from 'react';
import styled from 'styled-components';
import { AgentState, AgentId } from '../types';
import { MODEL_CATALOG } from '../data/models';
import { theme } from '../styles/theme';

interface ModelSelectorProps {
  agents: AgentState[];
  selectedIds: string[];
  toggleModel: (id: string) => void;
  setAgentRef: (id: string, el: HTMLDivElement | null) => void;
  deploy: (id: AgentId) => void;
  deployAll: () => void;
  reset: () => void;
  busy: boolean;
  anyIdle: boolean;
  deployCountByModel: Record<string, number>;
  totalDeployed: number;
}

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-top: 28px;
`;

const SectionLabel = styled.div`
  font-size: 9px;
  letter-spacing: 5px;
  color: ${theme.textDim};
  text-align: center;
  font-weight: 700;
  margin-bottom: 20px;
  font-family: ${theme.fontMono};
`;

/* ── Selected Models (top row) ── */

const SelectedRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  min-height: 100px;
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

const DeployBadge = styled.div<{ $color: string }>`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: ${(p) => p.$color};
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  box-shadow: 0 0 8px ${(p) => p.$color};
  z-index: 2;
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
  margin-top: 28px;
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

/* ── Model Catalog (bottom row) ── */

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: ${theme.border};
  margin: 28px 0;
`;

const CatalogGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto;
`;

const CatalogChip = styled.button<{
  $color: string;
  $selected: boolean;
  $disabled: boolean;
  $locked: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  cursor: ${(p) => (p.$disabled || p.$locked ? 'default' : 'pointer')};
  transition: all 0.2s;
  white-space: nowrap;

  background: ${(p) =>
    p.$selected ? `${p.$color}18` : 'rgba(255,255,255,0.02)'};
  border: 1px solid ${(p) =>
    p.$selected ? `${p.$color}66` : theme.border};
  color: ${(p) =>
    p.$selected ? p.$color : p.$disabled ? theme.textDark : theme.textDim};
  opacity: ${(p) => (p.$disabled ? 0.4 : 1)};

  &:hover {
    ${(p) =>
      !p.$disabled &&
      !p.$locked &&
      `
      background: ${p.$selected ? `${p.$color}25` : 'rgba(255,255,255,0.04)'};
      border-color: ${p.$selected ? p.$color : theme.textDim};
    `}
  }
`;

const ChipDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  flex-shrink: 0;
`;

const ChipProvider = styled.span`
  color: ${theme.textDim};
  font-weight: 400;
  font-size: 9px;
`;

const SelectionCount = styled.div`
  font-size: 9px;
  letter-spacing: 3px;
  color: ${theme.textDim};
  text-align: center;
  font-weight: 700;
  margin-bottom: 14px;
  font-family: ${theme.fontMono};
`;

const ModelSelector: React.FC<ModelSelectorProps> = ({
  agents,
  selectedIds,
  toggleModel,
  setAgentRef,
  deploy,
  deployAll,
  reset,
  busy,
  anyIdle,
  deployCountByModel,
  totalDeployed,
}) => {
  const canDeploy = !busy && anyIdle;
  const selectionFull = selectedIds.length >= 6;
  const gameOver = totalDeployed >= 6;

  return (
    <Container>
      <SectionLabel>SELECTED MODELS -- CLICK TO DEPLOY</SectionLabel>
      <SelectedRow>
        {agents.map((a) => {
          const deployCount = deployCountByModel[a.id] || 0;
          const isIdle = a.status === 'idle';
          const canClickDeploy = isIdle && !gameOver;

          let statusText = '';
          switch (a.status) {
            case 'idle':
              if (deployCount > 0 && gameOver) {
                statusText = `DEPLOYED x${deployCount}`;
              } else if (deployCount > 0) {
                statusText = 'READY';
              } else {
                statusText = a.provider;
              }
              break;
            case 'thinking':
              statusText = 'THINKING...';
              break;
            case 'flying':
              statusText = 'EN ROUTE ->';
              break;
          }

          return (
            <AgentNode
              key={a.id}
              ref={(el) => setAgentRef(a.id, el)}
              $idle={canClickDeploy}
              $settled={gameOver && isIdle && deployCount === 0}
              onClick={() => canClickDeploy && deploy(a.id)}
            >
              <CircleContainer>
                {a.status === 'thinking' && <SpinRing $color={a.color} />}
                {a.status === 'flying' && <DashRing $color={a.color} />}
                {deployCount > 0 && (
                  <DeployBadge $color={a.color}>x{deployCount}</DeployBadge>
                )}
                <MainCircle
                  $color={a.color}
                  $glow={a.glow}
                  $status={a.status}
                >
                  {a.name[0]}
                </MainCircle>
              </CircleContainer>
              <AgentName $color={a.color} $idle={canClickDeploy}>
                {a.name}
              </AgentName>
              <AgentStatus>{statusText}</AgentStatus>
            </AgentNode>
          );
        })}
      </SelectedRow>

      <ButtonRow>
        <DeployButton
          $active={canDeploy}
          disabled={!canDeploy}
          onClick={() => canDeploy && deployAll()}
        >
          {busy ? 'DEPLOYING...' : gameOver ? 'ALL DEPLOYED' : 'DEPLOY ALL'}
        </DeployButton>
        <ResetButton onClick={reset}>RESET</ResetButton>
      </ButtonRow>

      <Divider />

      <SelectionCount>
        {totalDeployed} / 6 DEPLOYED
      </SelectionCount>
      <SectionLabel>MODEL CATALOG</SectionLabel>
      <CatalogGrid>
        {MODEL_CATALOG.map((model) => {
          const isSelected = selectedIds.includes(model.id);
          const agentState = agents.find((a) => a.id === model.id);
          const hasDeployments = (deployCountByModel[model.id] || 0) > 0;
          const isLocked = hasDeployments || (agentState != null && agentState.status !== 'idle');
          const isDisabled = !isSelected && selectionFull;

          return (
            <CatalogChip
              key={model.id}
              $color={model.color}
              $selected={isSelected}
              $disabled={isDisabled}
              $locked={isLocked}
              onClick={() => !isDisabled && !isLocked && toggleModel(model.id)}
              title={`${model.name} - ${model.provider}${isLocked ? ' (deployed)' : ''}`}
            >
              <ChipDot $color={model.color} />
              {model.name}
              <ChipProvider>{model.provider}</ChipProvider>
            </CatalogChip>
          );
        })}
      </CatalogGrid>
    </Container>
  );
};

export default ModelSelector;
