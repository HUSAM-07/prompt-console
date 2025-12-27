'use client';

import { Trash2, FileText, Image, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatFileSize } from '@/stores/file-store';
import { formatDate } from '@/hooks/use-greeting';
import type { UploadedFile } from '@/types';

interface FileCardProps {
  file: UploadedFile;
  onDelete: () => void;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type === 'application/json') return FileJson;
  if (type === 'text/csv') return FileSpreadsheet;
  return FileText;
}

export function FileCard({ file, onDelete }: FileCardProps) {
  const Icon = getFileIcon(file.type);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Icon or Preview */}
        <div className="p-2 rounded-lg bg-muted shrink-0">
          {file.type.startsWith('image/') && file.content ? (
            <img
              src={file.content}
              alt={file.name}
              className="size-10 object-cover rounded"
            />
          ) : (
            <Icon className="size-6 text-muted-foreground" />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate" title={file.name}>
            {file.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{formatFileSize(file.size)}</span>
            <span>•</span>
            <span>{formatDate(file.uploadedAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
