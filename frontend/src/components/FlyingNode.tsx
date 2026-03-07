import React, { useState, useEffect } from 'react';
import { FlyingNodeData } from '../types';

interface FlyingNodeProps {
  node: FlyingNodeData;
}

const FlyingNode: React.FC<FlyingNodeProps> = ({ node }) => {
  const [go, setGo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setGo(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const x = go ? node.ex : node.sx;
  const y = go ? node.ey : node.sy;

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: `radial-gradient(circle at 38% 38%, ${node.color}, ${node.color}99)`,
        border: `2px solid ${node.color}`,
        boxShadow: `0 0 18px ${node.glow}, 0 0 40px ${node.glow}55`,
        transform: `translate(${x - 25}px, ${y - 25}px)`,
        transition: go
          ? 'transform 1.4s cubic-bezier(0.34,1.56,0.64,1)'
          : 'none',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: '#fff',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {node.name[0]}
    </div>
  );
};

export default FlyingNode;
