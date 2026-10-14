import React from 'react';
import type { ToolDefinition } from '@pdf-toolbox/shared';
import { IconRenderer } from './IconRenderer';
import { ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (tool: ToolDefinition) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const isPending = tool.status.startsWith('pending-');

  let badgeClass = 'core';
  if (tool.badge === 'Popular') badgeClass = 'popular';
  if (isPending) badgeClass = 'pending';

  return (
    <a
      href={`#tool/${tool.id}`}
      onClick={(e) => {
        e.preventDefault();
        onSelect(tool);
      }}
      className="tool-card"
      id={`tool-card-${tool.id}`}
    >
      <div className="tool-card-header">
        <div className={`tool-icon-wrapper tool-icon-cat-${tool.category}`}>
          <IconRenderer name={tool.icon} size={22} />
        </div>
        <span className={`tool-badge ${badgeClass}`}>
          {isPending ? 'Phase Roadmap' : tool.badge || 'Ready'}
        </span>
      </div>

      <h3 className="tool-card-title">{tool.name}</h3>
      <p className="tool-card-desc">{tool.shortDescription}</p>

      <div className="tool-card-footer">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {tool.engine === 'client' && (
            <>
              <ShieldCheck size={14} style={{ color: 'var(--status-success)' }} />
              <span>100% In-Browser</span>
            </>
          )}
          {tool.engine === 'server' && (
            <>
              <Cpu size={14} style={{ color: 'var(--accent-primary)' }} />
              <span>Cloud Engine</span>
            </>
          )}
        </span>
        <ArrowRight size={16} />
      </div>
    </a>
  );
};
