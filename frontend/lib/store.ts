import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, ClothingItem, Message, Conversation } from '@/types';
import { api } from './api';

// Auth Store
export type TutorialKey =
  | 'client_dashboard'
  | 'client_wardrobe'
  | 'client_outfits'
  | 'stylist_dashboard'
  | 'stylist_clients'
  | 'stylist_lookbooks';

export type Tutorials = Record<TutorialKey, boolean>;

const DEFAULT_TUTORIALS: Tutorials = {
  client_dashboard: false,
  client_wardrobe: false,
  client_outfits: false,
  stylist_dashboard: false,
  stylist_clients: false,
  stylist_lookbooks: false,
};

const TUTORIALS_LOCAL_KEY = 'lien-tutorials';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  activeRole: 'CLIENT' | 'STYLIST';
  isDualRole: boolean;
  hasSeenTour: boolean;
  tutorials: Tutorials;
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (email: string, password: string, name: string, role?: string) => Promise<boolean>;
  requestMagicLink: (email: string) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  switchRole: (role: 'CLIENT' | 'STYLIST') => Promise<void>;
  activateStylistMode: () => Promise<void>;
  completeTour: () => void;
  completeTutorial: (key: TutorialKey) => void;
  resetTutorial: (key: TutorialKey) => void;
  hasCompletedTutorial: (key: TutorialKey) => boolean;
}

function persistTutorialsToLocal(tutorials: Tutorials): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TUTORIALS_LOCAL_KEY, JSON.stringify(tutorials));
  } catch {
    // ignore quota / privacy mode failures
  }
}

function readTutorialsFromLocal(): Tutorials | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TUTORIALS_LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Tutorials>;
    return { ...DEFAULT_TUTORIALS, ...parsed };
  } catch {
    return null;
  }
}

function resolveActiveRole(user: User): 'CLIENT' | 'STYLIST' {
  if (user.active_role === 'STYLIST') return 'STYLIST';
  if (user.active_role === 'CLIENT') return 'CLIENT';
  // Fallback for users without active_role set yet
  return user.role === 'STYLIST' ? 'STYLIST' : 'CLIENT';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      activeRole: 'CLIENT' as 'CLIENT' | 'STYLIST',
      isDualRole: false,
      hasSeenTour: false,
      tutorials: { ...DEFAULT_TUTORIALS },
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (email, password, rememberMe = true) => {
        set({ isLoading: true });
        const res = await api.post<{ user: User; token: string }>('/auth/login', {
          email,
          password,
          remember_me: rememberMe,
        });
        if (res.success && res.data) {
          const user = res.data.user;
          localStorage.setItem('lien_token', res.data.token);
          localStorage.setItem('lien_remember_me', rememberMe ? 'true' : 'false');
          set({
            user,
            token: res.data.token,
            isLoading: false,
            activeRole: resolveActiveRole(user),
            isDualRole: user.is_dual_role ?? false,
          });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      requestMagicLink: async (email) => {
        set({ isLoading: true });
        const res = await api.post<{ email: string; expires_in_minutes: number }>(
          '/auth/magic-link',
          { email }
        );
        set({ isLoading: false });
        return res.success === true;
      },

      register: async (email, password, name, role?) => {
        set({ isLoading: true });
        const res = await api.post<{ user: User; token: string }>('/auth/register', { email, password, name, role });
        if (res.success && res.data) {
          const user = res.data.user;
          localStorage.setItem('lien_token', res.data.token);
          set({
            user,
            token: res.data.token,
            isLoading: false,
            activeRole: resolveActiveRole(user),
            isDualRole: user.is_dual_role ?? false,
          });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        localStorage.removeItem('lien_token');
        set({ user: null, token: null, activeRole: 'CLIENT', isDualRole: false });
      },

      loadUser: async () => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true });
        const res = await api.get<User>('/auth/me');
        if (res.success && res.data) {
          const user = res.data;
          set({
            user,
            isLoading: false,
            activeRole: resolveActiveRole(user),
            isDualRole: user.is_dual_role ?? false,
          });
        } else {
          // Token is invalid or expired
          localStorage.removeItem('lien_token');
          set({ user: null, token: null, isLoading: false });
        }
      },

      switchRole: async (role) => {
        const res = await api.put<User>('/auth/switch-role', { role });
        if (res.success && res.data) {
          set({ activeRole: role, user: res.data });
        }
      },

      activateStylistMode: async () => {
        const res = await api.post<User>('/auth/activate-stylist');
        if (res.success && res.data) {
          set({ isDualRole: true, activeRole: 'STYLIST', user: res.data });
        }
      },

      completeTour: () => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lien-tour-done', 'true');
        }
        // Best-effort backend sync (tour_completed ignored if field absent)
        api.put('/auth/profile', { tour_completed: true });
        set({ hasSeenTour: true });
      },

      completeTutorial: (key) => {
        const next = { ...get().tutorials, [key]: true };
        set({ tutorials: next });
        persistTutorialsToLocal(next);
        // Best-effort backend sync — server may ignore unknown fields.
        api.put('/auth/profile', { tutorial_completed: { [key]: true } });
      },

      resetTutorial: (key) => {
        const next = { ...get().tutorials, [key]: false };
        set({ tutorials: next });
        persistTutorialsToLocal(next);
      },

      hasCompletedTutorial: (key) => {
        return get().tutorials[key] === true;
      },
    }),
    {
      name: 'lien-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeRole: state.activeRole,
        isDualRole: state.isDualRole,
        hasSeenTour: state.hasSeenTour,
        tutorials: state.tutorials,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Merge any standalone 'lien-tutorials' key (spec-named bucket)
        // with whatever the persist layer rehydrated.
        const fromLocal = readTutorialsFromLocal();
        if (fromLocal) {
          state.tutorials = { ...DEFAULT_TUTORIALS, ...state.tutorials, ...fromLocal };
        }
        state._setHasHydrated(true);
      },
    }
  )
);

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
