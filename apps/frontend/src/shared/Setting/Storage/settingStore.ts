import { create } from 'zustand';

export type SettingTab = 'storage'; // extend later: | 'notifications' | 'account'
export type StorageView = 'overview' | 'plans';

interface SettingStore {
  isOpen: boolean;
  activeTab: SettingTab;
  storageView: StorageView;

  openDialog: () => void;
  closeDialog: () => void;
  setActiveTab: (tab: SettingTab) => void;
  setStorageView: (view: StorageView) => void;
}

export const useSettingStore = create<SettingStore>((set) => ({
  isOpen: false,
  activeTab: 'storage',
  storageView: 'overview',

  openDialog: () => set({ isOpen: true, storageView: 'overview' }),
  closeDialog: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab, storageView: 'overview' }),
  setStorageView: (view) => set({ storageView: view }),
}));
