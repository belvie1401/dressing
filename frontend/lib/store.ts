import { create } from 'zustand';
import type { User, ClothingItem, Message, Conversation } from '@/types';
import { api } from './api';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    const res = await api.post<{ user: User; token: string }>('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    const res = await api.post<{ user: User; token: string }>('/auth/register', { email, password, name });
    if (res.success && res.data) {
      localStorage.setItem('token', res.data.token);
      set({ user: res.data.user, token: res.data.token, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ isLoading: true });
    const res = await api.get<User>('/auth/me');
    if (res.success && res.data) {
      set({ user: res.data, token, isLoading: false });
    } else {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));

// Wardrobe Store
interface WardrobeState {
  items: ClothingItem[];
  isLoading: boolean;
  loadItems: () => Promise<void>;
  addItem: (item: ClothingItem) => void;
  removeItem: (id: string) => void;
  markWorn: (id: string) => Promise<void>;
}

export const useWardrobeStore = create<WardrobeState>((set, get) => ({
  items: [],
  isLoading: false,

  loadItems: async () => {
    set({ isLoading: true });
    const res = await api.get<ClothingItem[]>('/wardrobe');
    if (res.success && res.data) {
      set({ items: res.data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  addItem: (item) => {
    set({ items: [item, ...get().items] });
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.id !== id) });
  },

  markWorn: async (id) => {
    const res = await api.post<ClothingItem>(`/wardrobe/${id}/wear`);
    if (res.success && res.data) {
      set({
        items: get().items.map((i) => (i.id === id ? res.data! : i)),
      });
    }
  },
}));

// Chat Store
interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  isLoading: boolean;
  loadConversations: () => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  addMessage: (userId: string, message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  isLoading: false,

  loadConversations: async () => {
    set({ isLoading: true });
    const res = await api.get<Conversation[]>('/messages');
    if (res.success && res.data) {
      set({ conversations: res.data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  loadMessages: async (userId) => {
    const res = await api.get<Message[]>(`/messages/${userId}`);
    if (res.success && res.data) {
      set({ messages: { ...get().messages, [userId]: res.data } });
    }
  },

  addMessage: (userId, message) => {
    const current = get().messages[userId] || [];
    set({
      messages: { ...get().messages, [userId]: [message, ...current] },
    });
  },
}));
