import React, { RefObject } from 'react';
import styled from 'styled-components';
import { AgentState, DeploymentInstance, SectorId } from '../types';
import { SECTORS } from '../data/sectors';
import {
  makeSectorPath,
  labelPosition,
  badgePosition,
  SVG_CONSTANTS,
} from '../hooks/useSectorGeometry';

const { CX, CY, R1 } = SVG_CONSTANTS;

interface EOSWheelProps {
  svgRef: RefObject<SVGSVGElement>;
  agents: AgentState[];
  deployments: DeploymentInstance[];
  hoveredSector: SectorId | null;
  onSectorHover: (id: SectorId | null) => void;
  sectorCounts: Record<SectorId, number>;
}

const WheelSvg = styled.svg`
  width: min(460px, calc(100vw - 260px));
  min-width: 280px;
  height: auto;
  display: block;
`;

const EOSWheel: React.FC<EOSWheelProps> = ({
  svgRef,
  agents,
  deployments,
  hoveredSector,
  onSectorHover,
  sectorCounts,
}) => {
  const maxCount = Math.max(1, ...Object.values(sectorCounts));
  const deploymentsBySector: Record<string, DeploymentInstance[]> = {};
  deployments.forEach((d) => {
    (deploymentsBySector[d.sector] = deploymentsBySector[d.sector] || []).push(d);
  });

  return (
    <WheelSvg ref={svgRef} viewBox="0 0 500 500">
      <defs>
        <filter id="glo">
          <feGaussianBlur stdDeviation="5" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sglo">
          <feGaussianBlur stdDeviation="3" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {SECTORS.map((sector) => {
        const sectorDeps = deploymentsBySector[sector.id] || [];
        const hasAgents = sectorDeps.length > 0;
        const isHovered = hoveredSector === sector.id;
        const fill =
          isHovered || hasAgents ? sector.color.hover : sector.color.base;

        const [lx, ly] = labelPosition(sector.centerAngle);

        return (
          <g
            key={sector.id}
            onMouseEnter={() => onSectorHover(sector.id)}
            onMouseLeave={() => onSectorHover(null)}
          >
            <path
              d={makeSectorPath(sector.startAngle, sector.endAngle)}
              fill={fill}
              style={{
                transition: 'fill 0.2s, filter 0.3s',
                filter: hasAgents
                  ? 'drop-shadow(0 0 12px rgba(255,155,50,0.55))'
                  : 'none',
                cursor: 'pointer',
              }}
            />

            {/* Heat map overlay */}
            {(sectorCounts[sector.id] || 0) > 0 && (
              <path
                d={makeSectorPath(sector.startAngle, sector.endAngle)}
                fill={`rgba(234, 88, 12, ${(sectorCounts[sector.id] / maxCount) * 0.22})`}
                style={{ pointerEvents: 'none', transition: 'fill 0.6s' }}
              />
            )}

            {/* Count badge */}
            {(sectorCounts[sector.id] || 0) > 0 && (
              <text
                x={lx}
                y={ly - 25}
                textAnchor="middle"
                style={{
                  fontSize: 8,
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fill: 'rgba(234, 88, 12, 0.55)',
                  pointerEvents: 'none',
                }}
              >
                x{sectorCounts[sector.id]}
              </text>
            )}

            <text
              x={lx}
              y={ly - 12}
              textAnchor="middle"
              style={{
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: 2,
                fill: 'rgba(255,255,255,0.95)',
                pointerEvents: 'none',
              }}
            >
              {sector.label}
            </text>

            {sector.sub.map((s, i) => (
              <text
                key={i}
                x={lx}
                y={ly + 4 + i * 13}
                textAnchor="middle"
                style={{
                  fontSize: 8.5,
                  fontFamily: "'Space Mono', monospace",
                  fill: 'rgba(255,255,255,0.6)',
                  pointerEvents: 'none',
                }}
              >
                {'\u2022'} {s}
              </text>
            ))}

            {sectorDeps.map((dep, index) => {
              const [bx, by] = badgePosition(
                sector.centerAngle,
                index,
                sectorDeps.length,
              );
              return (
                <g
                  key={dep.id}
                  style={{ animation: 'pop 0.45s ease both' }}
                >
                  <circle
                    cx={bx}
                    cy={by}
                    r={11}
                    fill={dep.model.color}
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth={1.5}
                    style={{
                      filter: `drop-shadow(0 0 7px ${dep.model.color})`,
                    }}
                  />
                  <text
                    x={bx}
                    y={by}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      fill: '#fff',
                      pointerEvents: 'none',
                    }}
                  >
                    {dep.model.name[0]}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Center circle */}
      <circle
        cx={CX}
        cy={CY}
        r={R1 - 5}
        fill="#06060a"
        stroke="#ea580c33"
        strokeWidth={1.5}
      />
      <circle
        cx={CX}
        cy={CY}
        r={R1 - 14}
        fill="none"
        stroke="#ea580c1a"
        strokeWidth={1}
      />
      <text
        x={CX}
        y={CY - 7}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: 2,
          fill: '#c0c0c0',
        }}
      >
        YOUR
      </text>
      <text
        x={CX}
        y={CY + 9}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: 2,
          fill: '#c0c0c0',
        }}
      >
        BUSINESS
      </text>
    </WheelSvg>
  );
};

export default EOSWheel;
