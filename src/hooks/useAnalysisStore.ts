import { useState, useCallback } from 'react';
import type { AnalysisResponse, AnalysisAction } from '@/types/analysis';
import { analyzePost, buildMindmapContext } from '@/services/analysisService';
import type { MindmapNode } from '@/types/mindmap';

interface UseAnalysisStore {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResponse | null;
  actions: AnalysisAction[];
  analyze: (postTitle: string, postContent: string, allNodes: MindmapNode[]) => Promise<void>;
  toggleAction: (index: number) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  reset: () => void;
}

export function useAnalysisStore(): UseAnalysisStore {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [actions, setActions] = useState<AnalysisAction[]>([]);

  const analyze = useCallback(async (postTitle: string, postContent: string, allNodes: MindmapNode[]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setActions([]);
    try {
      const mindmapContext = buildMindmapContext(allNodes);
      const response = await analyzePost({ postTitle, postContent, mindmapContext });
      setResult(response);

      const newActions: AnalysisAction[] = [];

      if (response.suggestedParentId) {
        const cat = mindmapContext.categories.find(c => c.id === response.suggestedParentId);
        newActions.push({
          type: 'move-to-category',
          targetId: response.suggestedParentId,
          description: `"${cat?.title || '알 수 없음'}" 카테고리로 이동`,
          accepted: true,
        });
      }

      response.suggestedNewCategories.forEach(title => {
        newActions.push({
          type: 'create-category',
          newTitle: title,
          description: `새 카테고리 "${title}" 생성`,
          accepted: true,
        });
      });

      response.suggestedSiblings.forEach(id => {
        const post = mindmapContext.existingPosts.find(p => p.id === id);
        newActions.push({
          type: 'link-sibling',
          targetId: id,
          description: `연관 게시물 "${post?.title || '알 수 없음'}" 연결`,
          accepted: true,
        });
      });

      setActions(newActions);
    } catch (err) {
      setError(err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAction = useCallback((index: number) => {
    setActions(prev => prev.map((a, i) => i === index ? { ...a, accepted: !a.accepted } : a));
  }, []);

  const acceptAll = useCallback(() => {
    setActions(prev => prev.map(a => ({ ...a, accepted: true })));
  }, []);

  const rejectAll = useCallback(() => {
    setActions(prev => prev.map(a => ({ ...a, accepted: false })));
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResult(null);
    setActions([]);
  }, []);

  return { isLoading, error, result, actions, analyze, toggleAction, acceptAll, rejectAll, reset };
}
