import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/theme';

const STORAGE_KEY = 'eos-welcome-dismissed';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  animation: ${fadeIn} 0.3s ease-out;
`;

const Panel = styled.div`
  position: fixed;
  z-index: 10000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  background: #0c0c14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 40px 36px 32px;
  animation: ${slideUp} 0.4s ease-out;
  box-shadow:
    0 0 80px rgba(234, 88, 12, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.6);

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
  }
`;

const TopLabel = styled.div`
  font-size: 9px;
  letter-spacing: 5px;
  color: ${theme.accent};
  font-weight: 700;
  margin-bottom: 12px;
  font-family: ${theme.fontMono};
`;

const ModalTitle = styled.h2`
  font-family: ${theme.fontDisplay};
  font-size: 32px;
  font-weight: 900;
  color: #f5f5f5;
  margin: 0 0 6px;
  line-height: 1.1;
`;

const AccentText = styled.span`
  color: ${theme.accent};
`;

const Divider = styled.div`
  width: 40px;
  height: 2px;
  background: ${theme.accent};
  margin: 18px 0;
  opacity: 0.6;
`;

const SectionTitle = styled.div`
  font-size: 10px;
  letter-spacing: 3px;
  color: ${theme.accent};
  font-weight: 700;
  margin: 20px 0 10px;
  font-family: ${theme.fontMono};
`;

const Body = styled.p`
  font-size: 13px;
  line-height: 1.7;
  color: ${theme.textSoft};
  margin: 0 0 8px;
  font-family: ${theme.fontMono};
`;

const StepList = styled.ol`
  margin: 0 0 8px;
  padding-left: 20px;
`;

const StepItem = styled.li`
  font-size: 12px;
  line-height: 1.8;
  color: ${theme.textSoft};
  font-family: ${theme.fontMono};
  margin-bottom: 4px;

  strong {
    color: ${theme.text};
  }
`;

const SectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin: 10px 0 8px;
`;

const SectorTag = styled.div`
  font-size: 9px;
  letter-spacing: 2px;
  font-weight: 700;
  text-align: center;
  padding: 6px 4px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${theme.border};
  color: ${theme.textMuted};
  font-family: ${theme.fontMono};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28px;
  gap: 12px;
`;

const FooterNote = styled.div`
  font-size: 9px;
  color: ${theme.textDim};
  font-family: ${theme.fontMono};
  letter-spacing: 1px;
`;

const EnterButton = styled.button`
  padding: 12px 36px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 3px;
  cursor: pointer;
  background: ${theme.accent};
  border: 1px solid ${theme.accent};
  color: #fff;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: ${theme.accentHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 24px rgba(249, 115, 22, 0.35);
  }
`;

const WelcomeModal: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <Backdrop onClick={dismiss} />
      <Panel>
        <TopLabel>WELCOME</TopLabel>
        <ModalTitle>
          EOS <AccentText>x</AccentText> AI Agents
        </ModalTitle>

        <Divider />

        <Body>
          This is an interactive experiment that explores a simple but powerful
          question: where do AI agents belong in your business operating system?
        </Body>

        <Body>
          Using the Entrepreneurial Operating System (EOS) framework as a lens,
          this app deploys foundation models from twelve different AI vendors
          and lets each one self-route into the EOS sector where it believes it
          can deliver the most value.
        </Body>

        <SectionTitle>HOW IT WORKS</SectionTitle>

        <StepList>
          <StepItem>
            <strong>Select your models.</strong> Choose up to 6 from the
            catalog of 12 foundation models spanning providers like Anthropic,
            Amazon, Meta, OpenAI, Mistral, and more.
          </StepItem>
          <StepItem>
            <strong>Deploy them.</strong> Click a model or hit "Deploy All" to
            send each one through a two-turn inference chain powered by Amazon
            Bedrock.
          </StepItem>
          <StepItem>
            <strong>Watch them route.</strong> Each model analyzes its own
            capabilities, reasons through which EOS sector fits best, and flies
            into its chosen position on the wheel.
          </StepItem>
          <StepItem>
            <strong>Inspect the reasoning.</strong> Open the inference panel to
            see the full prompt chain, chain-of-thought analysis, and final
            verdict for each deployment.
          </StepItem>
        </StepList>

        <SectionTitle>THE 6 EOS SECTORS</SectionTitle>

        <SectorGrid>
          <SectorTag>VISION</SectorTag>
          <SectorTag>PEOPLE</SectorTag>
          <SectorTag>DATA</SectorTag>
          <SectorTag>ISSUES</SectorTag>
          <SectorTag>PROCESS</SectorTag>
          <SectorTag>TRACTION</SectorTag>
        </SectorGrid>

        <Body>
          Each sector represents a core pillar of a well-run business. The
          models decide for themselves where they fit — revealing how different
          architectures and training approaches produce different strategic
          strengths.
        </Body>

        <SectionTitle>EXPERIMENT</SectionTitle>

        <Body>
          Try adjusting the temperature slider to see how randomness affects
          routing decisions. Reset and redeploy to compare results. Swap models
          in and out to see which vendors gravitate toward which sectors.
        </Body>

        <Footer>
          <FooterNote>BUILT BY ALTIVUM</FooterNote>
          <EnterButton onClick={dismiss}>ENTER</EnterButton>
        </Footer>
      </Panel>
    </>
  );
};

export default WelcomeModal;
