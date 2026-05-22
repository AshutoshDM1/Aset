import { create } from 'zustand';

interface SelectionState {
  selectedFolderIds: string[];
  selectedFileIds: string[];
  toggleFolder: (id: string) => void;
  toggleFile: (id: string) => void;
  selectFolders: (ids: string[]) => void;
  selectFiles: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (type: 'folder' | 'file', id: string) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedFolderIds: [],
  selectedFileIds: [],
  toggleFolder: (id) =>
    set((state) => {
      const isSelected = state.selectedFolderIds.includes(id);
      return {
        selectedFolderIds: isSelected
          ? state.selectedFolderIds.filter((fid) => fid !== id)
          : [...state.selectedFolderIds, id],
      };
    }),
  toggleFile: (id) =>
    set((state) => {
      const isSelected = state.selectedFileIds.includes(id);
      return {
        selectedFileIds: isSelected
          ? state.selectedFileIds.filter((fid) => fid !== id)
          : [...state.selectedFileIds, id],
      };
    }),
  selectFolders: (ids) => set({ selectedFolderIds: ids }),
  selectFiles: (ids) => set({ selectedFileIds: ids }),
  clearSelection: () => set({ selectedFolderIds: [], selectedFileIds: [] }),
  isSelected: (type, id) => {
    if (type === 'folder') {
      return get().selectedFolderIds.includes(id);
    }
    return get().selectedFileIds.includes(id);
  },
}));
