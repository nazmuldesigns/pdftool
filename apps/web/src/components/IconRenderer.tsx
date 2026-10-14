import React from 'react';
import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = '', size = 20 }) => {
  // Map icon name to Lucide component
  const LucideIcon = (Icons as Record<string, any>)[name] || Icons.FileText;
  return <LucideIcon className={className} size={size} />;
};
