import { FileUpload } from '@/components/files/file-upload';
import { FileList } from '@/components/files/file-list';

export default function FilesPage() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Files</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage files to use in your prompts
          </p>
        </div>

        {/* Upload Area */}
        <FileUpload />

        {/* File List */}
        <div>
          <h2 className="text-lg font-medium mb-4">Uploaded Files</h2>
          <FileList />
        </div>
      </div>
    </div>
  );
}
