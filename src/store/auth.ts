import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginForm } from '@/types';
import { authAPI } from '@/services/api';

interface AuthActions {
  login: (credentials: LoginForm) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginForm) => {
        console.log('Auth store: Starting login with credentials:', credentials);
        console.log('Auth store: Current state before login:', get());
        set({ isLoading: true, error: null });
        
        try {
          console.log('Auth store: Calling authAPI.login...');
          const response = await authAPI.login(credentials);
          console.log('Auth store: API response:', response);
          
          if (response.success && response.data) {
            console.log('Auth store: Login successful, setting user data');
            console.log('Auth store: Response data structure:', response.data);
            
            // Extract user and token from the response data
            const { user, token } = response.data;
            
            if (user && token) {
              set({
                user: user,
                token: token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              return { success: true };
            } else {
              console.log('Auth store: Missing user or token in response');
              set({
                isLoading: false,
                error: 'Invalid response format',
              });
              return { success: false, error: 'Invalid response format' };
            }
          } else {
            console.log('Auth store: Login failed, response not successful');
            set({
              isLoading: false,
              error: response.error || 'Login failed',
            });
            return { success: false, error: response.error };
          }
        } catch (error: any) {
          console.log('Auth store: Login error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        // Clear any stored tokens
        localStorage.removeItem('auth-storage');
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => {
        console.log('Auth store: Persisting state:', state);
        return {
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        };
      },
      onRehydrateStorage: () => (state) => {
        console.log('Auth store: Rehydrating from storage:', state);
      },
    }
  )
);
