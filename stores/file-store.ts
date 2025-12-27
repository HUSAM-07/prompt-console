import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { UploadedFile } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES } from '@/lib/constants';

interface FileStore {
  // State
  files: UploadedFile[];
  isHydrated: boolean;

  // Actions
  uploadFile: (file: File) => Promise<UploadedFile>;
  deleteFile: (id: string) => void;
  getFileById: (id: string) => UploadedFile | undefined;
  getFilesByIds: (ids: string[]) => UploadedFile[];

  // Hydration
  setHydrated: () => void;
}

// Helper to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export const useFileStore = create<FileStore>()(
  persist(
    (set, get) => ({
      // Initial state
      files: [],
      isHydrated: false,

      // Actions
      uploadFile: async (file: File) => {
        // Validate file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new Error(`File size exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit`);
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          throw new Error(`File type ${file.type} is not allowed`);
        }

        // Convert to base64 for storage
        const content = await fileToBase64(file);

        const uploadedFile: UploadedFile = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          content,
          uploadedAt: new Date().toISOString(),
        };

        set((state) => ({
          files: [uploadedFile, ...state.files],
        }));

        return uploadedFile;
      },

      deleteFile: (id) =>
        set((state) => ({
          files: state.files.filter((f) => f.id !== id),
        })),

      getFileById: (id) => {
        const { files } = get();
        return files.find((f) => f.id === id);
      },

      getFilesByIds: (ids) => {
        const { files } = get();
        return files.filter((f) => ids.includes(f.id));
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: STORAGE_KEYS.FILES,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
      partialize: (state) => ({
        files: state.files,
      }),
    }
  )
);

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type === 'application/json') return '📋';
  if (type.startsWith('text/')) return '📝';
  return '📁';
}
