import React from 'react';
import styled from 'styled-components';
import { AgentState, AgentId } from '../types';
import { theme } from '../styles/theme';

interface InferenceConfigPanelProps {
  agents: AgentState[];
  selectedAgent: AgentId | null;
  onSelectAgent: (id: AgentId) => void;
  temperature: number;
  onTemperatureChange: (t: number) => void;
}

const USER_PROMPT = `The 6 EOS components and what they govern:

- vision: Strategic direction, core values, long-term targets, V/TO, ensuring 100% organizational alignment
- data: KPI scorecards, activity measurables, removing subjectivity, data-driven decision culture
- process: Documenting and systematizing core workflows so every team member executes consistently
- traction: Quarterly Rocks, Level 10 meetings, accountability cadence, translating vision into weekly execution
- issues: IDS methodology -- permanently identifying, discussing, and solving root-cause organizational problems
- people: Right people in right seats, culture-values alignment, role fit, team health

Where do you belong? Respond with exactly:
{"sector":"<one of the six ids above>","reason":"<one sentence>"}`;

const SYSTEM_PROMPT = `You are an AI agent self-routing into an EOS (Entrepreneurial Operating System) business framework wheel.
Assess your own default capabilities honestly and navigate to the single component where you would have the greatest real-world impact.

Respond ONLY with valid JSON. No markdown. No explanation. No preamble.`;

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

const AgentSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const AgentDot = styled.button<{ $color: string; $glow: string; $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${(p) => p.$active ? p.$color : `${p.$color}33`};
  border: 2px solid ${(p) => p.$active ? p.$color : `${p.$color}55`};
  box-shadow: ${(p) => p.$active ? `0 0 12px ${p.$glow}` : 'none'};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(p) => p.$color};
    box-shadow: 0 0 12px ${(p) => p.$glow};
  }
`;

const SectionLabel = styled.div`
  font-size: 8px;
  letter-spacing: 3px;
  color: ${theme.textDark};
  margin-bottom: 6px;
  margin-top: 14px;
  font-weight: 700;
  font-family: ${theme.fontMono};
`;

const PromptBlock = styled.pre`
  font-size: 9px;
  line-height: 1.6;
  color: ${theme.textMuted};
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid ${theme.borderDim};
  border-radius: 6px;
  padding: 10px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ${theme.fontMono};
  max-height: 120px;
  overflow-y: auto;
`;

const TempRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
`;

const TempSlider = styled.input`
  flex: 1;
  accent-color: ${theme.accent};
  cursor: pointer;
`;

const TempValue = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${theme.accent};
  font-family: ${theme.fontMono};
  min-width: 28px;
  text-align: right;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
`;

const MetaLabel = styled.span`
  font-size: 8px;
  letter-spacing: 2px;
  color: ${theme.textDark};
  font-weight: 700;
  font-family: ${theme.fontMono};
`;

const MetaValue = styled.span`
  font-size: 10px;
  color: ${theme.textMuted};
  font-family: ${theme.fontMono};
`;

const RawDetails = styled.details`
  margin-top: 6px;

  & > summary {
    font-size: 8px;
    letter-spacing: 3px;
    color: ${theme.textDark};
    font-weight: 700;
    font-family: ${theme.fontMono};
    cursor: pointer;
    user-select: none;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &::before {
      content: '+ ';
      color: ${theme.accent};
    }
  }

  &[open] > summary::before {
    content: '- ';
  }
`;

const EmptyState = styled.div`
  color: ${theme.textDarker};
  font-size: 11px;
  line-height: 1.9;
  font-family: ${theme.fontMono};
`;

const InferenceConfigPanel: React.FC<InferenceConfigPanelProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  temperature,
  onTemperatureChange,
}) => {
  const selected = agents.find((a) => a.id === selectedAgent);

  return (
    <Container>
      <Header>INFERENCE CONFIG</Header>

      <AgentSelector>
        {agents.map((a) => (
          <AgentDot
            key={a.id}
            $color={a.color}
            $glow={a.glow}
            $active={selectedAgent === a.id}
            onClick={() => onSelectAgent(a.id)}
            title={a.name}
          >
            {a.name[0]}
          </AgentDot>
        ))}
      </AgentSelector>

      {!selected ? (
        <EmptyState>
          Select an agent node above to view its inference configuration...
        </EmptyState>
      ) : (
        <>
          <SectionLabel>SYSTEM PROMPT</SectionLabel>
          <PromptBlock>
            {selected.inference?.systemPrompt ?? SYSTEM_PROMPT}
          </PromptBlock>

          <SectionLabel>USER PROMPT</SectionLabel>
          <PromptBlock>{selected.inference?.userPrompt ?? USER_PROMPT}</PromptBlock>

          <SectionLabel>TEMPERATURE</SectionLabel>
          <TempRow>
            <TempSlider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            />
            <TempValue>{temperature.toFixed(1)}</TempValue>
          </TempRow>

          {selected.inference && (
            <>
              <MetaRow>
                <MetaLabel>LATENCY</MetaLabel>
                <MetaValue>{selected.inference.latencyMs}ms</MetaValue>
              </MetaRow>
              <MetaRow>
                <MetaLabel>TEMP USED</MetaLabel>
                <MetaValue>{selected.inference.temperature.toFixed(1)}</MetaValue>
              </MetaRow>

              <RawDetails>
                <summary>RAW MODEL OUTPUT</summary>
                <PromptBlock style={{ marginTop: 6 }}>
                  {selected.inference.rawOutput}
                </PromptBlock>
              </RawDetails>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default InferenceConfigPanel;
