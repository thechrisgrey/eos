import React, { useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../styles/theme';
import type { InferenceModalState, InferenceStep } from '../types';

interface InferenceModalProps {
  state: InferenceModalState;
  onSkip: () => void;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const textReveal = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.25s ease-out;
`;

const Panel = styled.div`
  position: fixed;
  z-index: 9999;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 92%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #0a0a12;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  animation: ${slideUp} 0.35s ease-out;
  box-shadow:
    0 0 100px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(234, 88, 12, 0.06);
  overflow: hidden;
`;

const Header = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
`;

const ModelDot = styled.div<{ $color: string; $glow: string }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, ${(p) => p.$color}, ${(p) => p.$color}bb);
  border: 2px solid ${(p) => p.$color};
  box-shadow: 0 0 18px ${(p) => p.$glow};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  font-family: ${theme.fontMono};
  flex-shrink: 0;
`;

const HeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ModelName = styled.div`
  font-family: ${theme.fontDisplay};
  font-size: 22px;
  font-weight: 700;
  color: #f5f5f5;
  line-height: 1.1;
`;

const ModelProvider = styled.div`
  font-size: 10px;
  color: ${theme.textDim};
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  margin-top: 2px;
`;

const SkipButton = styled.button`
  padding: 6px 16px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  cursor: pointer;
  background: transparent;
  border: 1px solid ${theme.border};
  color: ${theme.textDim};
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: ${theme.textDim};
    color: ${theme.textSoft};
  }
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px 24px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
`;

/* ── Steps ── */

const STEP_ORDER: InferenceStep[] = [
  'init',
  'turn1-sending',
  'turn1-received',
  'turn2-sending',
  'turn2-received',
  'routing',
];

function stepIndex(step: InferenceStep): number {
  const idx = STEP_ORDER.indexOf(step);
  return idx >= 0 ? idx : -1;
}

const StepRow = styled.div`
  position: relative;
  padding-left: 28px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepIndicator = styled.div<{ $state: 'pending' | 'active' | 'done' | 'error'; $color: string }>`
  position: absolute;
  left: 0;
  top: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  transition: all 0.3s;

  ${(p) => {
    switch (p.$state) {
      case 'pending':
        return css`
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid ${theme.textDark};
        `;
      case 'active':
        return css`
          background: ${p.$color}33;
          border: 1.5px solid ${p.$color};
          animation: ${pulse} 1.2s ease-in-out infinite;
        `;
      case 'done':
        return css`
          background: ${p.$color}22;
          border: 1.5px solid ${p.$color}88;
          color: ${p.$color};
        `;
      case 'error':
        return css`
          background: rgba(239, 68, 68, 0.15);
          border: 1.5px solid #ef4444;
          color: #ef4444;
        `;
    }
  }}
`;

const StepConnector = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 6px;
  top: 18px;
  width: 1px;
  bottom: -6px;
  background: ${(p) => p.$visible ? 'rgba(255,255,255,0.06)' : 'transparent'};
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 9px;
  letter-spacing: 3px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  color: ${(p) => p.$active ? theme.text : theme.textDim};
  margin-bottom: 8px;
  transition: color 0.3s;
`;

const ContentBlock = styled.div`
  animation: ${textReveal} 0.3s ease-out;
`;

const PromptBox = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid ${theme.borderDim};
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
`;

const PromptLabel = styled.div`
  font-size: 8px;
  letter-spacing: 3px;
  color: ${theme.textDim};
  font-weight: 700;
  font-family: ${theme.fontMono};
  margin-bottom: 6px;
`;

const PromptText = styled.div`
  font-size: 11px;
  line-height: 1.65;
  color: ${theme.textMuted};
  font-family: ${theme.fontMono};
  white-space: pre-wrap;
  max-height: 100px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
`;

const ResponseBox = styled.div<{ $color: string }>`
  background: ${(p) => `${p.$color}08`};
  border: 1px solid ${(p) => `${p.$color}20`};
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 8px;
`;

const ResponseText = styled.div`
  font-size: 11px;
  line-height: 1.65;
  color: ${theme.textSoft};
  font-family: ${theme.fontMono};
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
`;

const Spinner = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid ${(p) => `${p.$color}33`};
  border-top-color: ${(p) => p.$color};
  animation: ${spin} 0.6s linear infinite;
  margin: 8px 0;
`;

const LatencyTag = styled.span`
  font-size: 9px;
  color: ${theme.textDim};
  font-family: ${theme.fontMono};
  letter-spacing: 1px;
  margin-left: 8px;
  font-weight: 400;
`;

/* ── Routing result ── */

const RoutingResult = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: ${(p) => `${p.$color}0c`};
  border: 1px solid ${(p) => `${p.$color}30`};
  border-radius: 10px;
  animation: ${textReveal} 0.4s ease-out;
`;

const SectorBadge = styled.div<{ $color: string }>`
  padding: 5px 14px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  font-family: ${theme.fontMono};
  background: ${(p) => `${p.$color}22`};
  border: 1px solid ${(p) => `${p.$color}55`};
  color: ${(p) => p.$color};
  flex-shrink: 0;
`;

const ReasonText = styled.div`
  font-size: 11px;
  line-height: 1.5;
  color: ${theme.textSoft};
  font-family: ${theme.fontMono};
`;

const ErrorBox = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 11px;
  color: #fca5a5;
  font-family: ${theme.fontMono};
  line-height: 1.5;
`;

const CloseButton = styled.button`
  display: block;
  margin: 16px auto 0;
  padding: 10px 32px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  cursor: pointer;
  background: ${theme.accent};
  border: 1px solid ${theme.accent};
  color: #fff;
  transition: all 0.2s;

  &:hover {
    background: ${theme.accentHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(249, 115, 22, 0.3);
  }
`;

const InferenceModal: React.FC<InferenceModalProps> = ({ state, onSkip }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentStep = stepIndex(state.step);
  const isError = state.step === 'error';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.step, state.turn1Response, state.turn2Response]);

  function getIndicatorState(idx: number): 'pending' | 'active' | 'done' | 'error' {
    if (isError && idx === currentStep) return 'error';
    if (isError) return idx < currentStep ? 'done' : 'pending';
    if (idx < currentStep) return 'done';
    if (idx === currentStep) return 'active';
    return 'pending';
  }

  return (
    <>
      <Backdrop />
      <Panel>
        <Header $color={state.agent.color}>
          <ModelDot $color={state.agent.color} $glow={state.agent.glow}>
            {state.agent.name[0]}
          </ModelDot>
          <HeaderInfo>
            <ModelName>{state.agent.name}</ModelName>
            <ModelProvider>{state.agent.provider.toUpperCase()}</ModelProvider>
          </HeaderInfo>
          {state.step !== 'routing' && !isError && (
            <SkipButton onClick={onSkip}>SKIP</SkipButton>
          )}
          {(state.step === 'routing' || isError) && (
            <CloseButton onClick={onSkip}>
              {isError ? 'CLOSE' : 'DONE'}
            </CloseButton>
          )}
        </Header>

        <ScrollArea ref={scrollRef}>
          {/* Step 0: System Prompt */}
          <StepRow>
            <StepIndicator $state={getIndicatorState(0)} $color={state.agent.color}>
              {getIndicatorState(0) === 'done' && '\u2713'}
            </StepIndicator>
            <StepConnector $visible />
            <StepLabel $active={currentStep >= 0}>SYSTEM PROMPT</StepLabel>
            {currentStep >= 0 && state.systemPrompt && (
              <ContentBlock>
                <PromptBox>
                  <PromptLabel>INSTRUCTIONS</PromptLabel>
                  <PromptText>{state.systemPrompt}</PromptText>
                </PromptBox>
              </ContentBlock>
            )}
          </StepRow>

          {/* Step 1: Turn 1 Sending */}
          <StepRow>
            <StepIndicator $state={getIndicatorState(1)} $color={state.agent.color}>
              {getIndicatorState(1) === 'done' && '\u2713'}
            </StepIndicator>
            <StepConnector $visible />
            <StepLabel $active={currentStep >= 1}>
              TURN 1 -- ANALYSIS
              {state.turn1LatencyMs != null && (
                <LatencyTag>{(state.turn1LatencyMs / 1000).toFixed(1)}s</LatencyTag>
              )}
            </StepLabel>
            {currentStep >= 1 && state.turn1Prompt && (
              <ContentBlock>
                <PromptBox>
                  <PromptLabel>PROMPT</PromptLabel>
                  <PromptText>{state.turn1Prompt}</PromptText>
                </PromptBox>
              </ContentBlock>
            )}
            {currentStep === 1 && !state.turn1Response && (
              <Spinner $color={state.agent.color} />
            )}
          </StepRow>

          {/* Step 2: Turn 1 Response */}
          {currentStep >= 2 && state.turn1Response && (
            <StepRow>
              <StepIndicator $state={getIndicatorState(2)} $color={state.agent.color}>
                {getIndicatorState(2) === 'done' && '\u2713'}
              </StepIndicator>
              <StepConnector $visible />
              <StepLabel $active>RESPONSE</StepLabel>
              <ContentBlock>
                <ResponseBox $color={state.agent.color}>
                  <ResponseText>{state.turn1Response}</ResponseText>
                </ResponseBox>
              </ContentBlock>
            </StepRow>
          )}

          {/* Step 3: Turn 2 Sending */}
          {currentStep >= 3 && (
            <StepRow>
              <StepIndicator $state={getIndicatorState(3)} $color={state.agent.color}>
                {getIndicatorState(3) === 'done' && '\u2713'}
              </StepIndicator>
              <StepConnector $visible />
              <StepLabel $active>
                TURN 2 -- DECISION
                {state.turn2LatencyMs != null && (
                  <LatencyTag>{(state.turn2LatencyMs / 1000).toFixed(1)}s</LatencyTag>
                )}
              </StepLabel>
              {state.turn2Prompt && (
                <ContentBlock>
                  <PromptBox>
                    <PromptLabel>PROMPT</PromptLabel>
                    <PromptText>{state.turn2Prompt}</PromptText>
                  </PromptBox>
                </ContentBlock>
              )}
              {currentStep === 3 && !state.turn2Response && (
                <Spinner $color={state.agent.color} />
              )}
            </StepRow>
          )}

          {/* Step 4: Turn 2 Response */}
          {currentStep >= 4 && state.turn2Response && (
            <StepRow>
              <StepIndicator $state={getIndicatorState(4)} $color={state.agent.color}>
                {getIndicatorState(4) === 'done' && '\u2713'}
              </StepIndicator>
              <StepConnector $visible />
              <StepLabel $active>RESPONSE</StepLabel>
              <ContentBlock>
                <ResponseBox $color={state.agent.color}>
                  <ResponseText>{state.turn2Response}</ResponseText>
                </ResponseBox>
              </ContentBlock>
            </StepRow>
          )}

          {/* Step 5: Routing result */}
          {currentStep >= 5 && state.sector && (
            <StepRow>
              <StepIndicator $state={getIndicatorState(5)} $color={state.agent.color}>
                {'\u2713'}
              </StepIndicator>
              <StepConnector $visible={false} />
              <StepLabel $active>ROUTED</StepLabel>
              <RoutingResult $color={state.agent.color}>
                <SectorBadge $color={state.agent.color}>
                  {state.sector.toUpperCase()}
                </SectorBadge>
                <ReasonText>{state.reason}</ReasonText>
              </RoutingResult>
            </StepRow>
          )}

          {/* Error */}
          {isError && state.error && (
            <StepRow>
              <StepIndicator $state="error" $color={state.agent.color} />
              <StepConnector $visible={false} />
              <StepLabel $active>ERROR</StepLabel>
              <ErrorBox>{state.error}</ErrorBox>
            </StepRow>
          )}
        </ScrollArea>
      </Panel>
    </>
  );
};

export default InferenceModal;
