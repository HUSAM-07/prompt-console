'use client';

import * as React from 'react';
import { FileText, Image, FileCode, File, Trash2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types';

interface FileCardProps {
  attachment: Attachment;
  onReplace?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) return Image;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('json') || fileType.includes('xml') || fileType.includes('javascript') || fileType.includes('typescript')) return FileCode;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function FileCard({ attachment, onReplace, onDelete, showActions = true }: FileCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const IconComponent = getFileIcon(attachment.fileType);

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 border border-border rounded-lg bg-muted/30',
        'transition-colors hover:bg-muted/50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* File Icon */}
      <IconComponent className="size-5 text-muted-foreground shrink-0" />

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.fileName}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className={cn(
          'flex items-center gap-1 transition-opacity',
          isHovered ? 'opacity-100' : 'opacity-0'
        )}>
          {onReplace && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7"
              onClick={onReplace}
              title="Replace file"
            >
              <RotateCw className="size-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-7 hover:text-destructive"
              onClick={onDelete}
              title="Delete file"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Replace button tooltip on hover */}
      {isHovered && onReplace && (
        <div className="absolute -top-9 right-0 px-2 py-1 text-xs bg-popover text-popover-foreground border border-border rounded shadow-md">
          Replace file
        </div>
      )}
    </div>
  );
}
