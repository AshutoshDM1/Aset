import { create } from 'zustand';

export interface UploadFileState {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

interface UploadStore {
  isOpen: boolean;
  isMinimized: boolean;
  folderId: string | null;
  files: UploadFileState[];
  isUploading: boolean;

  openDialog: (initialFolderId?: string | null) => void;
  closeDialog: () => void;
  minimizeDialog: () => void;
  maximizeDialog: () => void;
  setFolderId: (folderId: string | null) => void;
  setFiles: (files: UploadFileState[]) => void;
  updateFileProgress: (id: string, progress: number) => void;
  updateFileStatus: (
    id: string,
    status: UploadFileState['status'],
    errorMsg?: string,
  ) => void;
  setIsUploading: (isUploading: boolean) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  isOpen: false,
  isMinimized: false,
  folderId: null,
  files: [],
  isUploading: false,

  openDialog: (initialFolderId = null) =>
    set({ isOpen: true, isMinimized: false, folderId: initialFolderId }),
  closeDialog: () => set({ isOpen: false, isMinimized: false }),
  minimizeDialog: () => set({ isMinimized: true }),
  maximizeDialog: () => set({ isMinimized: false }),
  setFolderId: (folderId) => set({ folderId }),
  setFiles: (files) => set({ files }),
  updateFileProgress: (id, progress) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, progress } : f)),
    })),
  updateFileStatus: (id, status, errorMsg) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status, errorMsg } : f,
      ),
    })),
  setIsUploading: (isUploading) => set({ isUploading }),
  reset: () =>
    set({
      isOpen: false,
      isMinimized: false,
      folderId: null,
      files: [],
      isUploading: false,
    }),
}));

// --- HELPERS ---
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function uploadWithProgress(
  url: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}
