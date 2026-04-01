import { memo, useState, useRef } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Plus, FileText, FolderOpen, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MindmapNodeData {
  label: string;
  nodeType: 'root' | 'category' | 'post';
  color: string;
  highlight: 'match' | 'path' | 'sibling' | 'fade' | 'none';
  onAddChild: (id: string) => void;
  onSelect: (id: string) => void;
  nodeId: string;
}

function MindmapNodeComponent({ data }: NodeProps) {
  const { label, nodeType, color, highlight, onAddChild, onSelect, nodeId } = data as unknown as MindmapNodeData;
  const [hovered, setHovered] = useState(false);
  const addClickedRef = useRef(false);

  const Icon = nodeType === 'root' ? Sparkles : nodeType === 'category' ? FolderOpen : FileText;

  const highlightStyles = {
    match: 'ring-4 ring-[hsl(45,95%,55%)] shadow-[0_0_20px_hsl(45,95%,55%,0.4)] scale-110 z-10',
    path: 'ring-2 ring-[hsl(45,95%,55%,0.6)] shadow-lg',
    sibling: 'opacity-70 ring-1 ring-[hsl(45,95%,55%,0.3)]',
    fade: 'opacity-20 grayscale',
    none: '',
  };

  return (
    <div
      className={cn(
        'relative group transition-all duration-300 ease-out cursor-pointer',
        highlightStyles[highlight]
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-border !border-none" />

      <div
        className={cn(
          'px-4 py-3 rounded-xl border-2 flex items-center gap-2 min-w-[120px] max-w-[200px] transition-shadow duration-200',
          nodeType === 'root' && 'px-5 py-4 min-w-[160px]',
        )}
        style={{
          backgroundColor: `color-mix(in srgb, ${color} 12%, hsl(var(--card)))`,
          borderColor: color,
          boxShadow: hovered ? `0 8px 24px ${color}33` : `0 2px 8px ${color}1a`,
        }}
      >
        <Icon
          className="shrink-0"
          size={nodeType === 'root' ? 20 : 16}
          style={{ color }}
        />
        <span
          className={cn(
            'font-medium truncate text-card-foreground',
            nodeType === 'root' && 'text-base font-bold',
            nodeType === 'category' && 'text-sm font-semibold',
            nodeType === 'post' && 'text-sm',
          )}
        >
          {label}
        </span>
      </div>

      {/* Add child button */}
      {nodeType !== 'post' && (
        <button
          className={cn(
            'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 border-2',
            'bg-card text-muted-foreground border-border hover:text-primary hover:border-primary hover:scale-110',
            hovered ? 'opacity-100' : 'opacity-0'
          )}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            addClickedRef.current = true;
            onAddChild(nodeId);
          }}
        >
          <Plus size={14} />
        </button>
      )}

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-border !border-none" />
    </div>
  );
}

export default memo(MindmapNodeComponent);
