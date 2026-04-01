import type { AnalysisResponse, AnalysisAction } from '@/types/analysis';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, FolderOpen, Plus, Link2, Check } from 'lucide-react';

interface AnalysisPreviewDialogProps {
  open: boolean;
  isLoading: boolean;
  error: string | null;
  result: AnalysisResponse | null;
  actions: AnalysisAction[];
  onToggleAction: (index: number) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onApply: () => void;
  onSkip: () => void;
}

const actionIcons: Record<AnalysisAction['type'], React.ReactNode> = {
  'move-to-category': <FolderOpen className="h-4 w-4" />,
  'create-category': <Plus className="h-4 w-4" />,
  'link-sibling': <Link2 className="h-4 w-4" />,
};

export function AnalysisPreviewDialog({
  open,
  isLoading,
  error,
  result,
  actions,
  onToggleAction,
  onAcceptAll,
  onRejectAll,
  onApply,
  onSkip,
}: AnalysisPreviewDialogProps) {
  const acceptedCount = actions.filter(a => a.accepted).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onSkip(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI 분석 결과
          </DialogTitle>
          <DialogDescription>
            게시물 분석 결과를 확인하고 적용할 작업을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">분석 중...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-4">
            {/* 신뢰도 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">분석 신뢰도</span>
                <span className="font-medium">{Math.round(result.confidence * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* 제안 이유 */}
            {result.reasoning && (
              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                {result.reasoning}
              </div>
            )}

            {/* 액션 목록 */}
            {actions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    제안 작업 ({acceptedCount}/{actions.length})
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={onAcceptAll} className="h-7 text-xs">
                      전체 선택
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onRejectAll} className="h-7 text-xs">
                      전체 해제
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {actions.map((action, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-accent"
                    >
                      <Checkbox
                        checked={action.accepted}
                        onCheckedChange={() => onToggleAction(index)}
                      />
                      <span className="text-muted-foreground">{actionIcons[action.type]}</span>
                      <span className="text-sm">{action.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={onSkip}>
            건너뛰기
          </Button>
          <Button onClick={onApply} disabled={acceptedCount === 0 || isLoading}>
            <Check className="mr-1 h-4 w-4" />
            선택 승인 ({acceptedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
