import { useState, useCallback, useEffect } from 'react';
import { MindmapNode, SearchResult } from '@/types/mindmap';

const STORAGE_KEY = 'mindmap-nodes';

const defaultRoot: MindmapNode = {
  id: 'root',
  parentId: null,
  title: '마인드맵 게시판',
  content: '루트 노드입니다. 여기서부터 카테고리와 게시글을 추가하세요.',
  type: 'root',
  color: 'hsl(270, 55%, 55%)',
  positionX: 0,
  positionY: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const defaultNodes: MindmapNode[] = [
  defaultRoot,
  {
    id: 'cat-1',
    parentId: 'root',
    title: '일반',
    content: '일반 게시글 카테고리',
    type: 'category',
    color: 'hsl(230, 65%, 55%)',
    positionX: 250,
    positionY: -100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    parentId: 'root',
    title: '질문',
    content: '질문 게시글 카테고리',
    type: 'category',
    color: 'hsl(160, 55%, 45%)',
    positionX: 250,
    positionY: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-1',
    parentId: 'cat-1',
    title: '환영합니다!',
    content: '마인드맵 기반 게시판에 오신 것을 환영합니다. 노드를 클릭하여 내용을 확인하고, 우클릭으로 하위 노드를 추가할 수 있습니다.',
    type: 'post',
    color: 'hsl(160, 55%, 45%)',
    positionX: 500,
    positionY: -150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'post-2',
    parentId: 'cat-1',
    title: '사용법 안내',
    content: '1. 노드를 클릭하면 상세 내용을 볼 수 있습니다.\n2. 노드 위의 + 버튼으로 하위 노드를 추가합니다.\n3. 검색 시 관련 경로와 형제 노드가 함께 표시됩니다.',
    type: 'post',
    color: 'hsl(160, 55%, 45%)',
    positionX: 500,
    positionY: -50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function loadNodes(): MindmapNode[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultNodes;
}

function saveNodes(nodes: MindmapNode[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
}

export function useMindmapStore() {
  const [nodes, setNodes] = useState<MindmapNode[]>(loadNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    saveNodes(nodes);
  }, [nodes]);

  const getChildren = useCallback((parentId: string) => {
    return nodes.filter(n => n.parentId === parentId);
  }, [nodes]);

  const getAncestorPath = useCallback((nodeId: string): string[] => {
    const path: string[] = [];
    let current = nodes.find(n => n.id === nodeId);
    while (current) {
      path.unshift(current.id);
      current = current.parentId ? nodes.find(n => n.id === current!.parentId) : undefined;
    }
    return path;
  }, [nodes]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResult(null);
      return;
    }

    const q = query.toLowerCase();
    const matchedIds = new Set<string>();
    const pathIds = new Set<string>();
    const siblingIds = new Set<string>();

    // Find matching nodes
    nodes.forEach(node => {
      if (node.title.toLowerCase().includes(q) || node.content.toLowerCase().includes(q)) {
        matchedIds.add(node.id);
      }
    });

    // Get ancestor paths and siblings
    matchedIds.forEach(id => {
      const path = getAncestorPath(id);
      path.forEach(pid => pathIds.add(pid));

      const node = nodes.find(n => n.id === id);
      if (node?.parentId) {
        const siblings = nodes.filter(n => n.parentId === node.parentId);
        siblings.forEach(s => siblingIds.add(s.id));
      }
    });

    setSearchResult({ matchedIds, pathIds, siblingIds });
  }, [nodes, getAncestorPath]);

  const addNode = useCallback((parentId: string, type: 'category' | 'post', title: string, content: string = '') => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    const siblings = nodes.filter(n => n.parentId === parentId);
    const offsetY = siblings.length * 80;

    const newNode: MindmapNode = {
      id: `node-${Date.now()}`,
      parentId,
      title,
      content,
      type,
      color: type === 'category' ? 'hsl(230, 65%, 55%)' : 'hsl(160, 55%, 45%)',
      positionX: parent.positionX + 250,
      positionY: parent.positionY + offsetY - (siblings.length * 40),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNodes(prev => [...prev, newNode]);
    return newNode.id;
  }, [nodes]);

  const updateNode = useCallback((id: string, updates: Partial<Pick<MindmapNode, 'title' | 'content' | 'color'>>) => {
    setNodes(prev => prev.map(n =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    ));
  }, []);

  const deleteNode = useCallback((id: string) => {
    if (id === 'root') return;
    // Recursively delete children
    const toDelete = new Set<string>();
    const collectChildren = (parentId: string) => {
      toDelete.add(parentId);
      nodes.filter(n => n.parentId === parentId).forEach(child => collectChildren(child.id));
    };
    collectChildren(id);
    setNodes(prev => prev.filter(n => !toDelete.has(n.id)));
    if (selectedNodeId && toDelete.has(selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [nodes, selectedNodeId]);

  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    setNodes(prev => prev.map(n =>
      n.id === id ? { ...n, positionX: x, positionY: y } : n
    ));
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return {
    nodes,
    selectedNode,
    selectedNodeId,
    setSelectedNodeId,
    searchQuery,
    searchResult,
    search,
    getChildren,
    addNode,
    updateNode,
    deleteNode,
    updateNodePosition,
  };
}
