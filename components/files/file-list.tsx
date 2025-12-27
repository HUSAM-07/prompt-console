'use client';

import { FileCard } from './file-card';
import { useFileStore } from '@/stores/file-store';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

export function FileList() {
  const files = useFileStore((state) => state.files);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const isHydrated = useFileStore((state) => state.isHydrated);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteFile(id);
      toast.success('File deleted');
    }
  };

  if (!isHydrated) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="size-12 opacity-50 mb-4" />
        <p className="font-medium">No files uploaded</p>
        <p className="text-sm">Upload files to use them in your prompts</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onDelete={() => handleDelete(file.id, file.name)}
        />
      ))}
    </div>
  );
}
