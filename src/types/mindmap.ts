export type NodeType = 'root' | 'category' | 'post';

export interface MindmapNode {
  id: string;
  parentId: string | null;
  title: string;
  content: string;
  type: NodeType;
  color: string;
  positionX: number;
  positionY: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  matchedIds: Set<string>;
  pathIds: Set<string>;
  siblingIds: Set<string>;
}
