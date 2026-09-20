import { create } from 'zustand';
import { tokenStorage } from '../services/apiClient';

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Khởi phục session từ localStorage khi app khởi động
   */
  loadFromStorage: () => {
    const token = tokenStorage.getAccessToken();
    const userJson = localStorage.getItem('t_user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as UserInfo;
        set({ user, isAuthenticated: true });
      } catch {
        tokenStorage.clearTokens();
      }
    }
  },

  /**
   * Đăng nhập
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetch('http://localhost:4000/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Email hoặc mật khẩu không chính xác');
        }
        return res.json();
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      localStorage.setItem('t_user', JSON.stringify(data.user));

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Đăng nhập thất bại',
      });
      throw err;
    }
  },

  /**
   * Đăng ký tài khoản mới (tự động đăng nhập sau khi thành công)
   */
  register: async (email: string, name: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetch('http://localhost:4000/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || 'Đăng ký thất bại');
        }
        return res.json();
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      localStorage.setItem('t_user', JSON.stringify(data.user));

      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Đăng ký thất bại',
      });
      throw err;
    }
  },

  /**
   * Đăng xuất — xóa token và reset state
   */
  logout: () => {
    tokenStorage.clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
