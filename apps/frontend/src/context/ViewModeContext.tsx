import React, { createContext, useContext, useEffect, useState } from 'react';

type ViewMode = 'grid' | 'table';
export type SortField = 'name' | 'createdAt' | 'size';
export type SortOrder = 'asc' | 'desc';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(
  undefined,
);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('viewMode');
      return (saved as ViewMode) || 'grid';
    }
    return 'grid';
  });

  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sortField');
      return (saved as SortField) || 'name';
    }
    return 'name';
  });

  const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sortOrder');
      return (saved as SortOrder) || 'asc';
    }
    return 'asc';
  });

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('sortField', sortField);
  }, [sortField]);

  useEffect(() => {
    localStorage.setItem('sortOrder', sortOrder);
  }, [sortOrder]);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'grid' ? 'table' : 'grid'));
  };

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        sortField,
        setSortField,
        sortOrder,
        setSortOrder,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};

export function sortItems<
  T extends { name: string; sizeMb?: number; createdAt: string | Date },
>(items: T[], field: SortField, order: SortOrder): T[] {
  return [...items].sort((a, b) => {
    if (field === 'name') {
      // Natural Alphanumeric Sorting: 10 comes after 9
      const comparison = a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
      return order === 'asc' ? comparison : -comparison;
    }
    if (field === 'size') {
      const sizeA = a.sizeMb ?? 0;
      const sizeB = b.sizeMb ?? 0;
      return order === 'asc' ? sizeA - sizeB : sizeB - sizeA;
    }
    if (field === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    return 0;
  });
}
