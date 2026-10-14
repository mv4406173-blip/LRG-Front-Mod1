import { create } from 'zustand';
import { authApi, initCsrf } from '../lib/api';

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  clearSession: () => set({ user: null, isAuthenticated: false, isLoading: false }),

  init: async () => {
    try {
      const res = await authApi.me();
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    await initCsrf();
    const res = await authApi.login({ email, password });
    set({ user: res.data.data, isAuthenticated: true });
    return res.data.data;
  },

  register: async (name, email, password, password_confirmation) => {
    await initCsrf();
    const res = await authApi.register({ name, email, password, password_confirmation });
    return res.data;
  },

  logout: async () => {
    await initCsrf();
    await authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  sendVerification: async () => {
    await initCsrf();
    return authApi.sendVerification();
  },
}));

export default useAuthStore;
