'use client';

import * as React from 'react';
import { Paperclip, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FileCard } from './file-card';
import { toast } from 'sonner';
import type { Message, Attachment } from '@/types';

interface MessageEditorProps {
  message: Message;
  onChange: (content: string) => void;
  onDelete?: () => void;
  onGeneratePrompt?: () => void;
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  showGenerateButton?: boolean;
  canDelete?: boolean;
}

export function MessageEditor({
  message,
  onChange,
  onDelete,
  onGeneratePrompt,
  onAttachmentsChange,
  showGenerateButton = false,
  canDelete = false,
}: MessageEditorProps) {
  const isUser = message.role === 'user';
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = React.useState<Attachment[]>(message.attachments || []);

  // File size limit: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const replaceId = fileInputRef.current?.getAttribute('data-replace-id');

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      // Read file as base64 for images and PDFs
      const shouldReadAsBase64 = file.type.startsWith('image/') || file.type.includes('pdf');
      let base64Content: string | undefined;

      if (shouldReadAsBase64) {
        const reader = new FileReader();
        base64Content = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data URL prefix
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      const newAttachment: Attachment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        base64Content,
        uploadedAt: new Date().toISOString(),
      };

      let updatedAttachments: Attachment[];

      if (replaceId) {
        // Replace the existing file
        updatedAttachments = attachments.map((a) =>
          a.id === replaceId ? newAttachment : a
        );
        toast.success(`${file.name} replaced successfully`);
      } else {
        // Add new file
        updatedAttachments = [...attachments, newAttachment];
        toast.success(`${file.name} uploaded successfully`);
      }

      setAttachments(updatedAttachments);
      onAttachmentsChange?.(updatedAttachments);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.removeAttribute('data-replace-id');
    }
  };

  const handleReplaceFile = (attachmentId: string) => {
    // Store the ID to replace
    fileInputRef.current?.setAttribute('data-replace-id', attachmentId);
    fileInputRef.current?.click();
  };

  const handleDeleteFile = (attachmentId: string) => {
    const updatedAttachments = attachments.filter((a) => a.id !== attachmentId);
    setAttachments(updatedAttachments);
    onAttachmentsChange?.(updatedAttachments);
    toast.success('File removed');
  };

  const handlePaperclipClick = () => {
    fileInputRef.current?.removeAttribute('data-replace-id');
    fileInputRef.current?.click();
  };

  return (
    <div className="border border-border rounded-lg bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="font-medium text-sm capitalize">{message.role}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6"
            onClick={handlePaperclipClick}
          >
            <Paperclip className="size-3.5 text-muted-foreground" />
          </Button>
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="size-6"
              onClick={onDelete}
            >
              <X className="size-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {showGenerateButton && isUser && !message.content && (
          <Button
            variant="outline"
            size="sm"
            className="mb-3 gap-1"
            onClick={onGeneratePrompt}
          >
            <Sparkles className="size-4" />
            Generate Prompt
          </Button>
        )}

        {/* File Attachments */}
        {attachments.length > 0 && (
          <div className="space-y-2 mb-4">
            {attachments.map((attachment) => (
              <FileCard
                key={attachment.id}
                attachment={attachment}
                onReplace={() => handleReplaceFile(attachment.id)}
                onDelete={() => handleDeleteFile(attachment.id)}
              />
            ))}
          </div>
        )}

        <Textarea
          value={message.content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            isUser
              ? 'or enter instructions or prompt for Claude...'
              : 'Enter assistant response (optional)...'
          }
          className={cn(
            'min-h-[120px] resize-y border-none shadow-none focus-visible:ring-0 p-0',
            'placeholder:text-muted-foreground/60'
          )}
        />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,.pdf,.doc,.docx,.txt,.json,.xml,.csv"
      />
    </div>
  );
}

interface MessageListProps {
  messages: Message[];
  onUpdateMessage: (messageId: string, content: string) => void;
  onUpdateAttachments?: (messageId: string, attachments: Attachment[]) => void;
  onDeleteMessage: (messageId: string) => void;
  onAddMessagePair: () => void;
  onGeneratePrompt: () => void;
}

export function MessageList({
  messages,
  onUpdateMessage,
  onUpdateAttachments,
  onDeleteMessage,
  onAddMessagePair,
  onGeneratePrompt,
}: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageEditor
          key={message.id}
          message={message}
          onChange={(content) => onUpdateMessage(message.id, content)}
          onAttachmentsChange={(attachments) => onUpdateAttachments?.(message.id, attachments)}
          onDelete={() => onDeleteMessage(message.id)}
          onGeneratePrompt={onGeneratePrompt}
          showGenerateButton={index === 0 && message.role === 'user'}
          canDelete={messages.length > 1}
        />
      ))}

      {/* Add Message Pair Button */}
      <div className="flex items-center gap-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          Pre-fill response
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onAddMessagePair}
        >
          Add message pair
        </Button>
      </div>
    </div>
  );
}
