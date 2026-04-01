import { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Save, FolderOpen, FileText, Sparkles, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MindmapNode } from '@/types/mindmap';
import { cn } from '@/lib/utils';

interface NodePanelProps {
  node: MindmapNode;
  childNodes: MindmapNode[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Pick<MindmapNode, 'title' | 'content' | 'color'>>) => void;
  onDelete: (id: string) => void;
  onSelectChild: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function NodePanel({ node, childNodes, onClose, onUpdate, onDelete, onSelectChild, onAddChild }: NodePanelProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);

  useEffect(() => {
    setTitle(node.title);
    setContent(node.content);
    setEditing(false);
  }, [node.id]);

  const Icon = node.type === 'root' ? Sparkles : node.type === 'category' ? FolderOpen : FileText;

  const handleSave = () => {
    onUpdate(node.id, { title, content });
    setEditing(false);
  };

  const typeLabel = { root: '루트', category: '카테고리', post: '게시글' };

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-20 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color: node.color }} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {typeLabel[node.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!editing && node.type !== 'root' && (
            <>
              <Button variant="ghost" size="icon" onClick={() => setEditing(true)} className="h-8 w-8">
                <Edit3 size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { if (confirm('이 노드와 모든 하위 노드가 삭제됩니다.')) onDelete(node.id); }}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {editing ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">제목</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">내용</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="text-sm resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="gap-1">
                <Save size={14} /> 저장
              </Button>
              <Button onClick={() => { setTitle(node.title); setContent(node.content); setEditing(false); }} variant="outline" size="sm">
                취소
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold text-card-foreground">{node.title}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar size={12} />
              <span>{new Date(node.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div
              className="h-1 w-12 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            <p className="text-sm text-card-foreground whitespace-pre-wrap leading-relaxed">
              {node.content || '내용이 없습니다.'}
            </p>
          </>
        )}

        {/* Add child button */}
        {node.type !== 'post' && !editing && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => onAddChild(node.id)}
            >
              <Plus size={14} /> 하위 노드 추가
            </Button>
          </div>
        )}

        {/* Children list */}
        {childNodes.length > 0 && !editing && (
          <div className="pt-4 border-t border-border space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              하위 노드 ({childNodes.length})
            </h3>
            {childNodes.map(child => (
              <button
                key={child.id}
                onClick={() => onSelectChild(child.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  'hover:bg-muted flex items-center gap-2'
                )}
              >
                {child.type === 'category' ? <FolderOpen size={14} style={{ color: child.color }} /> : <FileText size={14} style={{ color: child.color }} />}
                <span className="truncate">{child.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
