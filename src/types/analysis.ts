// src/types/analysis.ts

export interface MindmapContext {
  categories: { id: string; title: string; childCount: number }[];
  existingPosts: { id: string; title: string; categoryId: string }[];
}

export interface AnalysisRequest {
  postTitle: string;
  postContent: string;
  mindmapContext: MindmapContext;
}

export interface AnalysisResponse {
  suggestedParentId: string | null;
  suggestedNewCategories: string[];
  suggestedSiblings: string[];
  reasoning: string;
  confidence: number;
}

export interface AnalysisAction {
  type: 'move-to-category' | 'create-category' | 'link-sibling';
  targetId?: string;
  newTitle?: string;
  description: string;
  accepted: boolean;
}