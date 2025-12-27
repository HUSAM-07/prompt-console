'use client';

import * as React from 'react';
import { Upload, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileStore } from '@/stores/file-store';
import { toast } from 'sonner';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const uploadFile = useFileStore((state) => state.uploadFile);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFiles(files);
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsUploading(true);

    for (const file of files) {
      try {
        await uploadFile(file);
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload file';
        toast.error(message);
      }
    }

    setIsUploading(false);
    onUploadComplete?.();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors',
        'flex flex-col items-center justify-center gap-4 text-center',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        isUploading && 'pointer-events-none opacity-50'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".txt,.md,.csv,.json,.pdf,.png,.jpg,.jpeg,.gif,.webp"
      />

      <div className="p-4 rounded-full bg-muted">
        {isUploading ? (
          <File className="size-8 text-muted-foreground animate-pulse" />
        ) : (
          <Upload className="size-8 text-muted-foreground" />
        )}
      </div>

      <div>
        <p className="font-medium">
          {isUploading ? 'Uploading...' : 'Drop files here or click to upload'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Supports text, markdown, CSV, JSON, PDF, and images (max 10MB)
        </p>
      </div>
    </div>
  );
}
