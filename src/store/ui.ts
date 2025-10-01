import { create } from 'zustand';
import { UIState } from '@/types';

interface UIActions {
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  sidebarOpen: false,
  isMobile: false,
  theme: 'light',
  loading: false,
  error: null,

  // Actions
  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setIsMobile: (isMobile: boolean) => {
    set({ isMobile });
    // Auto-close sidebar on mobile when switching to desktop
    if (!isMobile) {
      set({ sidebarOpen: false });
    }
  },

  setTheme: (theme: 'light' | 'dark') => {
    set({ theme });
    // Store theme preference
    localStorage.setItem('theme', theme);
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
