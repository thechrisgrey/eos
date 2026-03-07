import React from 'react';
import styled from 'styled-components';
import { SectorId } from '../types';
import { SECTORS } from '../data/sectors';
import { theme } from '../styles/theme';

interface SectorTooltipProps {
  sectorId: SectorId | null;
}

const Tooltip = styled.div`
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(6, 6, 10, 0.95);
  border: 1px solid rgba(234, 88, 12, 0.18);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 11px;
  color: ${theme.textSoft};
  max-width: 400px;
  z-index: 200;
  backdrop-filter: blur(14px);
  animation: fadein 0.15s ease;
  pointer-events: none;
  line-height: 1.75;
  white-space: normal;
  text-align: center;
  font-family: ${theme.fontMono};
`;

const SectorName = styled.span`
  color: ${theme.accent};
  font-weight: 700;
  letter-spacing: 3px;
  font-size: 9px;
  display: block;
  margin-bottom: 6px;
  font-family: ${theme.fontMono};
`;

const SectorTooltip: React.FC<SectorTooltipProps> = ({ sectorId }) => {
  if (!sectorId) return null;

  const sector = SECTORS.find((s) => s.id === sectorId);
  if (!sector) return null;

  return (
    <Tooltip>
      <SectorName>{sectorId.toUpperCase()}</SectorName>
      {sector.description}
    </Tooltip>
  );
};

export default SectorTooltip;
