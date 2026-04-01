import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeType } from '@/types/mindmap';

interface AddNodeDialogProps {
  open: boolean;
  parentTitle: string;
  onClose: () => void;
  onAdd: (type: 'category' | 'post', title: string, content: string) => void;
}

export function AddNodeDialog({ open, parentTitle, onClose, onAdd }: AddNodeDialogProps) {
  const [type, setType] = useState<'category' | 'post'>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(type, title.trim(), content.trim());
    setTitle('');
    setContent('');
    setType('post');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            <span className="text-muted-foreground font-normal">"{parentTitle}" 아래에</span>{' '}
            노드 추가
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Tabs value={type} onValueChange={(v) => setType(v as 'category' | 'post')}>
            <TabsList className="w-full">
              <TabsTrigger value="category" className="flex-1">카테고리</TabsTrigger>
              <TabsTrigger value="post" className="flex-1">게시글</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">제목</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'category' ? '카테고리 이름' : '게시글 제목'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">내용</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요..."
              rows={type === 'post' ? 6 : 3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>추가</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
