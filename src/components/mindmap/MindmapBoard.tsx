import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import MindmapNodeComponent from './MindmapNode';
import { SearchBar } from './SearchBar';
import { NodePanel } from './NodePanel';
import { AddNodeDialog } from './AddNodeDialog';
import { useMindmapStore } from '@/hooks/useMindmapStore';

const nodeTypes = { mindmap: MindmapNodeComponent };

export function MindmapBoard() {
  const store = useMindmapStore();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addParentId, setAddParentId] = useState<string | null>(null);

  const handleAddChild = useCallback((parentId: string) => {
    setAddParentId(parentId);
    setAddDialogOpen(true);
  }, []);

  const handleSelect = useCallback((nodeId: string) => {
    store.setSelectedNodeId(nodeId);
  }, [store]);

  const getHighlight = useCallback((nodeId: string) => {
    if (!store.searchResult) return 'none' as const;
    if (store.searchResult.matchedIds.has(nodeId)) return 'match' as const;
    if (store.searchResult.pathIds.has(nodeId)) return 'path' as const;
    if (store.searchResult.siblingIds.has(nodeId)) return 'sibling' as const;
    return 'fade' as const;
  }, [store.searchResult]);

  const flowNodes: Node[] = useMemo(() => {
    return store.nodes.map(n => ({
      id: n.id,
      type: 'mindmap',
      position: { x: n.positionX, y: n.positionY },
      data: {
        label: n.title,
        nodeType: n.type,
        color: n.color,
        highlight: getHighlight(n.id),
        onAddChild: handleAddChild,
        onSelect: handleSelect,
        nodeId: n.id,
      },
    }));
  }, [store.nodes, getHighlight, handleAddChild, handleSelect]);

  const flowEdges: Edge[] = useMemo(() => {
    return store.nodes
      .filter(n => n.parentId)
      .map(n => {
        const isHighlighted = store.searchResult
          ? store.searchResult.pathIds.has(n.id) && store.searchResult.pathIds.has(n.parentId!)
          : false;
        const isFaded = store.searchResult && !isHighlighted && !store.searchResult.siblingIds.has(n.id);

        return {
          id: `${n.parentId}-${n.id}`,
          source: n.parentId!,
          target: n.id,
          type: 'smoothstep',
          style: {
            stroke: isHighlighted
              ? 'hsl(45, 95%, 55%)'
              : isFaded
                ? 'hsl(var(--border))'
                : 'hsl(var(--border))',
            strokeWidth: isHighlighted ? 3 : 1.5,
            opacity: isFaded ? 0.15 : 1,
          },
          animated: isHighlighted,
        };
      });
  }, [store.nodes, store.searchResult]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Sync flow state when store changes
  useEffect(() => {
    setNodes(flowNodes);
  }, [flowNodes, setNodes]);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    store.updateNodePosition(node.id, node.position.x, node.position.y);
  }, [store]);

  const addParent = store.nodes.find(n => n.id === addParentId);
  const selectedChildren = store.selectedNode
    ? store.nodes.filter(n => n.parentId === store.selectedNode!.id)
    : [];

  return (
    <div className="w-full h-screen bg-background relative" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <SearchBar value={store.searchQuery} onChange={store.search} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} className="!bg-background" />
        <Controls className="!bg-card !border-border !shadow-lg [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" />
        <MiniMap
          className="!bg-card !border-border !shadow-lg"
          maskColor="hsl(var(--background) / 0.7)"
          nodeColor={(n) => {
            const data = n.data as any;
            return data?.color || 'hsl(var(--muted))';
          }}
        />
      </ReactFlow>

      {/* Side Panel */}
      {store.selectedNode && (
        <NodePanel
          node={store.selectedNode}
          children={selectedChildren}
          onClose={() => store.setSelectedNodeId(null)}
          onUpdate={store.updateNode}
          onDelete={(id) => { store.deleteNode(id); store.setSelectedNodeId(null); }}
          onSelectChild={(id) => store.setSelectedNodeId(id)}
        />
      )}

      {/* Add Node Dialog */}
      <AddNodeDialog
        open={addDialogOpen}
        parentTitle={addParent?.title || ''}
        onClose={() => setAddDialogOpen(false)}
        onAdd={(type, title, content) => {
          if (addParentId) store.addNode(addParentId, type, title, content);
        }}
      />
    </div>
  );
}
