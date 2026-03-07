import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

interface GateDividerProps {
  gateOpen: boolean;
}

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 32px 0 0;
  display: flex;
  align-items: center;
  gap: 14px;
`;

const Line = styled.div<{ $open: boolean }>`
  flex: 1;
  height: 1px;
  position: relative;
  background: ${(p) =>
    p.$open ? 'rgba(234,88,12,0.12)' : 'rgba(234,88,12,0.55)'};
  transition: background 1.2s ease;
`;

const PulseOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 140, 60, 0.3),
    transparent
  );
  animation: pulse 2s ease-in-out infinite;
`;

const CenterLabel = styled.span<{ $open: boolean }>`
  flex-shrink: 0;
  font-size: 9px;
  letter-spacing: 4px;
  font-weight: 700;
  font-family: ${theme.fontMono};
  color: ${(p) => (p.$open ? '#4ade80' : theme.accent)};
  transition: color 0.6s;
`;

const GateDivider: React.FC<GateDividerProps> = ({ gateOpen }) => {
  return (
    <Container>
      <Line $open={gateOpen}>
        {!gateOpen && <PulseOverlay />}
      </Line>
      <CenterLabel $open={gateOpen}>
        {gateOpen ? '\u25BC GATE OPEN' : '--- GATE ---'}
      </CenterLabel>
      <Line $open={gateOpen}>
        {!gateOpen && <PulseOverlay />}
      </Line>
    </Container>
  );
};

export default GateDivider;
