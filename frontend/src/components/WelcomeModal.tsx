import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { theme } from '../styles/theme';

const STORAGE_KEY = 'eos-welcome-dismissed';
const TOTAL_PAGES = 3;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translate(-50%, -48%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
`;

const pageIn = keyframes`
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
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
  max-width: 480px;
  background: #0c0c14;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 36px 32px 28px;
  animation: ${slideUp} 0.4s ease-out;
  box-shadow:
    0 0 80px rgba(234, 88, 12, 0.08),
    0 24px 64px rgba(0, 0, 0, 0.6);
`;

const PageContent = styled.div`
  animation: ${pageIn} 0.25s ease-out;
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
  margin: 0 0 14px;
  font-family: ${theme.fontMono};
`;

const Body = styled.p`
  font-size: 13px;
  line-height: 1.7;
  color: ${theme.textSoft};
  margin: 0 0 8px;
  font-family: ${theme.fontMono};
`;

const StepRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
  align-items: flex-start;
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(234, 88, 12, 0.12);
  border: 1px solid rgba(234, 88, 12, 0.3);
  color: ${theme.accent};
  font-size: 10px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
`;

const StepText = styled.div`
  font-size: 12px;
  line-height: 1.7;
  color: ${theme.textSoft};
  font-family: ${theme.fontMono};

  strong {
    color: ${theme.text};
  }
`;

const SectorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin: 0 0 14px;
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
  margin-top: 24px;
  gap: 12px;
`;

const Dots = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Dot = styled.div<{ $active: boolean }>`
  width: ${(p) => (p.$active ? '18px' : '6px')};
  height: 6px;
  border-radius: 3px;
  transition: all 0.25s ease;
  background: ${(p) => (p.$active ? theme.accent : 'rgba(255, 255, 255, 0.12)')};
`;

const NavRow = styled.div`
  display: flex;
  gap: 8px;
`;

const navButtonBase = css`
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
`;

const BackButton = styled.button`
  ${navButtonBase}
  background: none;
  border: 1px solid ${theme.border};
  color: ${theme.textDim};

  &:hover {
    border-color: ${theme.textDim};
    color: ${theme.textSoft};
  }
`;

const NextButton = styled.button`
  ${navButtonBase}
  background: ${theme.accent};
  border: 1px solid ${theme.accent};
  color: #fff;

  &:hover {
    background: ${theme.accentHover};
    transform: translateY(-1px);
    box-shadow: 0 4px 24px rgba(249, 115, 22, 0.35);
  }
`;

const FooterNote = styled.div`
  font-size: 9px;
  color: ${theme.textDim};
  font-family: ${theme.fontMono};
  letter-spacing: 1px;
`;

/* ── Pages ── */

function Page1() {
  return (
    <PageContent key="p1">
      <TopLabel>WELCOME</TopLabel>
      <ModalTitle>
        EOS <AccentText>x</AccentText> AI Agents
      </ModalTitle>
      <Divider />
      <Body>
        Where do AI agents belong in your business operating system?
      </Body>
      <Body>
        This experiment deploys foundation models from twelve AI vendors and
        lets each one self-route into the EOS sector where it believes it can
        deliver the most value.
      </Body>
    </PageContent>
  );
}

function Page2() {
  return (
    <PageContent key="p2">
      <SectionTitle>HOW IT WORKS</SectionTitle>
      <StepRow>
        <StepNumber>1</StepNumber>
        <StepText>
          <strong>Select models.</strong> Choose up to 6 from 12 foundation
          models across Anthropic, Amazon, Meta, OpenAI, Mistral, and more.
        </StepText>
      </StepRow>
      <StepRow>
        <StepNumber>2</StepNumber>
        <StepText>
          <strong>Deploy.</strong> Click a model or hit "Deploy All" to run
          a two-turn inference chain powered by Amazon Bedrock.
        </StepText>
      </StepRow>
      <StepRow>
        <StepNumber>3</StepNumber>
        <StepText>
          <strong>Watch them route.</strong> Each model reasons through which
          EOS sector fits best and flies into its chosen position on the wheel.
        </StepText>
      </StepRow>
      <StepRow>
        <StepNumber>4</StepNumber>
        <StepText>
          <strong>Inspect reasoning.</strong> See the full prompt chain,
          chain-of-thought analysis, and final verdict for each deployment.
        </StepText>
      </StepRow>
    </PageContent>
  );
}

function Page3() {
  return (
    <PageContent key="p3">
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
        Each sector is a core pillar of a well-run business. The models decide
        for themselves where they fit -- revealing how different architectures
        produce different strategic strengths.
      </Body>
      <Body>
        Try adjusting the temperature slider, swap models in and out, and
        redeploy to compare results.
      </Body>
      <FooterNote style={{ marginTop: 16 }}>BUILT BY ALTIVUM</FooterNote>
    </PageContent>
  );
}

const PAGES = [Page1, Page2, Page3];

/* ── Modal ── */

const WelcomeModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);

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

  const PageComponent = PAGES[page];
  const isLast = page === TOTAL_PAGES - 1;
  const isFirst = page === 0;

  return (
    <>
      <Backdrop onClick={dismiss} />
      <Panel>
        <PageComponent />
        <Footer>
          <Dots>
            {Array.from({ length: TOTAL_PAGES }, (_, i) => (
              <Dot key={i} $active={i === page} />
            ))}
          </Dots>
          <NavRow>
            {!isFirst && <BackButton onClick={() => setPage(page - 1)}>BACK</BackButton>}
            {isLast ? (
              <NextButton onClick={dismiss}>ENTER</NextButton>
            ) : (
              <NextButton onClick={() => setPage(page + 1)}>NEXT</NextButton>
            )}
          </NavRow>
        </Footer>
      </Panel>
    </>
  );
};

export default WelcomeModal;
