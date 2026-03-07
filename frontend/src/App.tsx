import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from './styles/theme';
import { useAgentRouter } from './hooks/useAgentRouter';
import EOSWheel from './components/EOSWheel';
import ModelSelector from './components/ModelSelector';
import FlyingNode from './components/FlyingNode';
import DecisionLog from './components/DecisionLog';
import GateDivider from './components/GateDivider';
import SectorTooltip from './components/SectorTooltip';
import InferenceConfigPanel from './components/InferenceConfigPanel';
import { SectorId, AgentId } from './types';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${theme.bg};
  font-family: ${theme.fontMono};
  color: ${theme.text};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px 64px;
  position: relative;
  overflow: hidden;
`;

const AmbientGradient = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      ellipse 80% 50% at 50% -5%,
      rgba(234, 88, 12, 0.07),
      transparent 60%
    ),
    radial-gradient(
      ellipse 60% 40% at 50% 105%,
      rgba(234, 88, 12, 0.03),
      transparent 50%
    );
`;

const DotGrid = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.018) 1px,
    transparent 1px
  );
  background-size: 32px 32px;
`;

const Header = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  margin-bottom: 36px;
`;

const MicroLabel = styled.div`
  font-size: 9px;
  letter-spacing: 6px;
  color: ${theme.accent};
  margin-bottom: 10px;
  font-weight: 700;
  opacity: 0.85;
`;

const Title = styled.h1`
  font-family: ${theme.fontDisplay};
  font-size: clamp(38px, 5vw, 58px);
  font-weight: 900;
  letter-spacing: -1px;
  color: #f5f5f5;
  line-height: 1;
  margin: 0;
`;

const OrangeSpan = styled.span`
  color: ${theme.accent};
`;

const Subtitle = styled.div`
  font-size: 10px;
  color: ${theme.textMuted};
  margin-top: 12px;
  letter-spacing: 2px;
  line-height: 1.8;
`;

const MainLayout = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
  max-width: 1200px;
  flex-wrap: wrap;
  justify-content: center;
`;

export default function App() {
  const [hoveredSector, setHoveredSector] = useState<SectorId | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentId | null>(null);
  const {
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
  } = useAgentRouter();

  return (
    <PageContainer>
      <AmbientGradient />
      <DotGrid />

      <Header>
        <MicroLabel>INTERACTIVE EXPERIMENT</MicroLabel>
        <Title>
          EOS <OrangeSpan>x</OrangeSpan> AI AGENTS
        </Title>
        <Subtitle>
          SELF-ROUTING INTELLIGENCE
          <br />
          WHERE DO AI AGENTS BELONG IN YOUR BUSINESS OS?
        </Subtitle>
      </Header>

      <MainLayout>
        <InferenceConfigPanel
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
          temperature={temperature}
          onTemperatureChange={setTemperature}
        />
        <EOSWheel
          svgRef={svgRef}
          agents={agents}
          hoveredSector={hoveredSector}
          onSectorHover={setHoveredSector}
        />
        <DecisionLog log={log} />
      </MainLayout>

      <GateDivider gateOpen={gateOpen} />
      <ModelSelector
        agents={agents}
        selectedIds={selectedIds}
        toggleModel={toggleModel}
        setAgentRef={setAgentRef}
        deploy={deploy}
        deployAll={deployAll}
        reset={reset}
        busy={busy}
        anyIdle={anyIdle}
      />
      <SectorTooltip sectorId={hoveredSector} />

      {flying.map((n) => (
        <FlyingNode key={n.id} node={n} />
      ))}
    </PageContainer>
  );
}
