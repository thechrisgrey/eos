import React, { useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../styles/theme';
import type { InferenceModalState, InferenceStep } from '../types';

interface InferenceModalProps {
  state: InferenceModalState;
  onSkip: () => void;
}

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
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

const Panel = styled.div`
  position: fixed;
  z-index: 100;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: 380px;
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

const Header = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
`;

const ModelDot = styled.div<{ $color: string; $glow: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, ${(p) => p.$color}, ${(p) => p.$color}bb);
  border: 2px solid ${(p) => p.$color};
  box-shadow: 0 0 14px ${(p) => p.$glow};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
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
  font-size: 18px;
  font-weight: 700;
  color: #f5f5f5;
  line-height: 1.1;
`;

const ModelProvider = styled.div`
  font-size: 9px;
  color: ${theme.textDim};
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  margin-top: 2px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  padding: 5px 14px;
  border-radius: 5px;
  font-size: 9px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  ${(p) => p.$variant === 'primary' ? css`
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

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 18px 20px;

  &::-webkit-scrollbar { width: 3px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
`;

/* ── Steps ── */

const STEP_ORDER_BASE: InferenceStep[] = [
  'init',
  'turn1-sending',
  'turn1-received',
  'turn2-sending',
  'turn2-received',
  'routing',
];

const STEP_ORDER_TURN3: InferenceStep[] = [
  'init',
  'turn1-sending',
  'turn1-received',
  'turn2-sending',
  'turn2-received',
  'turn3-sending',
  'turn3-received',
  'routing',
];

function getStepOrder(state: InferenceModalState): InferenceStep[] {
  const hasTurn3 = state.turn3Prompt != null
    || state.originalSector != null
    || state.step === 'turn3-sending'
    || state.step === 'turn3-received';
  return hasTurn3 ? STEP_ORDER_TURN3 : STEP_ORDER_BASE;
}

function stepIndex(step: InferenceStep, order: InferenceStep[]): number {
  const idx = order.indexOf(step);
  return idx >= 0 ? idx : -1;
}

const StepRow = styled.div`
  position: relative;
  padding-left: 24px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepIndicator = styled.div<{ $state: 'pending' | 'active' | 'done' | 'error'; $color: string }>`
  position: absolute;
  left: 0;
  top: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
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
  left: 5px;
  top: 16px;
  width: 1px;
  bottom: -4px;
  background: ${(p) => p.$visible ? 'rgba(255,255,255,0.05)' : 'transparent'};
`;

const StepLabel = styled.div<{ $active: boolean }>`
  font-size: 9px;
  letter-spacing: 2px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  color: ${(p) => p.$active ? theme.text : theme.textDim};
  margin-bottom: 6px;
  transition: color 0.3s;
`;

const ContentBlock = styled.div`
  animation: ${textReveal} 0.3s ease-out;
`;

const PromptBox = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid ${theme.borderDim};
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 6px;
`;

const PromptLabel = styled.div`
  font-size: 8px;
  letter-spacing: 2px;
  color: ${theme.textDim};
  font-weight: 700;
  font-family: ${theme.fontMono};
  margin-bottom: 5px;
`;

const PromptText = styled.div`
  font-size: 10px;
  line-height: 1.6;
  color: ${theme.textMuted};
  font-family: ${theme.fontMono};
  white-space: pre-wrap;
  max-height: 80px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 2px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
`;

const ResponseBox = styled.div<{ $color: string }>`
  background: ${(p) => `${p.$color}08`};
  border: 1px solid ${(p) => `${p.$color}18`};
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 6px;
`;

const ResponseText = styled.div`
  font-size: 10px;
  line-height: 1.6;
  color: ${theme.textSoft};
  font-family: ${theme.fontMono};
  white-space: pre-wrap;
  max-height: 160px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 2px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.06);
    border-radius: 2px;
  }
`;

const Spinner = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid ${(p) => `${p.$color}33`};
  border-top-color: ${(p) => p.$color};
  animation: ${spin} 0.6s linear infinite;
  margin: 6px 0;
`;

const LatencyTag = styled.span`
  font-size: 9px;
  color: ${theme.textDim};
  font-family: ${theme.fontMono};
  letter-spacing: 1px;
  margin-left: 6px;
  font-weight: 400;
`;

/* ── Routing result ── */

const RoutingResult = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: ${(p) => `${p.$color}0c`};
  border: 1px solid ${(p) => `${p.$color}28`};
  border-radius: 8px;
  animation: ${textReveal} 0.4s ease-out;
`;

const SectorBadge = styled.div<{ $color: string }>`
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  font-family: ${theme.fontMono};
  background: ${(p) => `${p.$color}22`};
  border: 1px solid ${(p) => `${p.$color}55`};
  color: ${(p) => p.$color};
  flex-shrink: 0;
`;

const ReasonText = styled.div`
  font-size: 10px;
  line-height: 1.45;
  color: ${theme.textSoft};
  font-family: ${theme.fontMono};
`;

const RejectedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  margin-bottom: 8px;
  animation: ${textReveal} 0.3s ease-out;
`;

const RejectedSector = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
  font-family: ${theme.fontMono};
  color: #fca5a5;
`;

const RejectedLabel = styled.span`
  font-size: 8px;
  letter-spacing: 1px;
  font-family: ${theme.fontMono};
  color: ${theme.textDim};
`;

const ErrorBox = styled.div`
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 10px;
  color: #fca5a5;
  font-family: ${theme.fontMono};
  line-height: 1.5;
`;

const InferenceModal: React.FC<InferenceModalProps> = ({ state, onSkip }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const order = getStepOrder(state);
  const currentStep = stepIndex(state.step, order);
  const isError = state.step === 'error';
  const hasTurn3 = order === STEP_ORDER_TURN3;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.step, state.turn1Response, state.turn2Response, state.turn3Response]);

  function getIndicatorState(idx: number): 'pending' | 'active' | 'done' | 'error' {
    if (isError && idx === currentStep) return 'error';
    if (isError) return idx < currentStep ? 'done' : 'pending';
    if (idx < currentStep) return 'done';
    if (idx === currentStep) return 'active';
    return 'pending';
  }

  const isDone = state.step === 'routing';

  return (
    <Panel>
      <Header $color={state.agent.color}>
        <ModelDot $color={state.agent.color} $glow={state.agent.glow}>
          {state.agent.name[0]}
        </ModelDot>
        <HeaderInfo>
          <ModelName>{state.agent.name}</ModelName>
          <ModelProvider>{state.agent.provider.toUpperCase()}</ModelProvider>
        </HeaderInfo>
        <ActionButton
          $variant={isDone || isError ? 'primary' : 'ghost'}
          onClick={onSkip}
        >
          {isDone ? 'DONE' : isError ? 'CLOSE' : 'DISMISS'}
        </ActionButton>
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

        {/* Turn 3: Constrained re-evaluation (conditional) */}
        {hasTurn3 && currentStep >= stepIndex('turn3-sending', order) && (
          <>
            {/* Original sector rejected */}
            {state.originalSector && (
              <StepRow>
                <StepIndicator $state="error" $color={state.agent.color} />
                <StepConnector $visible />
                <StepLabel $active>SECTOR AT CAPACITY</StepLabel>
                <RejectedBadge>
                  <RejectedSector>{state.originalSector.toUpperCase()}</RejectedSector>
                  <RejectedLabel>FULL -- RE-EVALUATING</RejectedLabel>
                </RejectedBadge>
              </StepRow>
            )}

            {/* Turn 3 prompt + response */}
            <StepRow>
              <StepIndicator
                $state={getIndicatorState(stepIndex('turn3-sending', order))}
                $color={state.agent.color}
              >
                {getIndicatorState(stepIndex('turn3-sending', order)) === 'done' && '\u2713'}
              </StepIndicator>
              <StepConnector $visible />
              <StepLabel $active>
                TURN 3 -- RE-EVALUATION
                {state.turn3LatencyMs != null && (
                  <LatencyTag>{(state.turn3LatencyMs / 1000).toFixed(1)}s</LatencyTag>
                )}
              </StepLabel>
              {state.turn3Prompt && (
                <ContentBlock>
                  <PromptBox>
                    <PromptLabel>CONSTRAINT PROMPT</PromptLabel>
                    <PromptText>{state.turn3Prompt}</PromptText>
                  </PromptBox>
                </ContentBlock>
              )}
              {currentStep === stepIndex('turn3-sending', order) && !state.turn3Response && (
                <Spinner $color={state.agent.color} />
              )}
            </StepRow>

            {/* Turn 3 response */}
            {currentStep >= stepIndex('turn3-received', order) && state.turn3Response && (
              <StepRow>
                <StepIndicator
                  $state={getIndicatorState(stepIndex('turn3-received', order))}
                  $color={state.agent.color}
                >
                  {getIndicatorState(stepIndex('turn3-received', order)) === 'done' && '\u2713'}
                </StepIndicator>
                <StepConnector $visible />
                <StepLabel $active>RESPONSE</StepLabel>
                <ContentBlock>
                  <ResponseBox $color={state.agent.color}>
                    <ResponseText>{state.turn3Response}</ResponseText>
                  </ResponseBox>
                </ContentBlock>
              </StepRow>
            )}
          </>
        )}

        {/* Routing result */}
        {currentStep >= stepIndex('routing', order) && state.sector && (
          <StepRow>
            <StepIndicator $state={getIndicatorState(stepIndex('routing', order))} $color={state.agent.color}>
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
  );
};

export default InferenceModal;
