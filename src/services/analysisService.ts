import type { AnalysisRequest, AnalysisResponse } from '@/types/analysis';
import { fetch } from 'workflow';

export async function analyzePost(request: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '알 수 없는 오류' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export function buildMindmapContext(
  nodes: { id: string; parentId: string | null; title: string; type: string }[]
): { categories: { id: string; title: string; childCount: number }[]; existingPosts: { id: string; title: string; categoryId: string }[] } {
  const categories = nodes
    .filter(n => n.type === 'category')
    .map(c => ({
      id: c.id,
      title: c.title,
      childCount: nodes.filter(n => n.parentId === c.id).length,
    }));

  const existingPosts = nodes
    .filter(n => n.type === 'post')
    .map(p => ({
      id: p.id,
      title: p.title,
      categoryId: p.parentId || '',
    }));

  return { categories, existingPosts };
}