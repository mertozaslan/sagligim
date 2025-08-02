import { create } from 'zustand';
import { User, Expert, api } from '../services/api';

interface UsersState {
  users: User[];
  experts: Expert[];
  currentUser: User | Expert | null;
  loading: boolean;
  error: string | null;
  filters: {
    userType: 'user' | 'expert' | null;
    specialty: string | null;
    city: string | null;
    searchQuery: string | null;
  };
}

interface UsersActions {
  // Actions
  fetchUsers: () => Promise<void>;
  fetchExperts: () => Promise<void>;
  fetchUser: (username: string) => Promise<void>;
  fetchExpert: (username: string) => Promise<void>;
  searchExperts: (query: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentUser: (user: User | Expert | null) => void;
  setFilters: (filters: Partial<UsersState['filters']>) => void;
  clearFilters: () => void;
  
  // User interactions
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
}

const initialState: UsersState = {
  users: [],
  experts: [],
  currentUser: null,
  loading: false,
  error: null,
  filters: {
    userType: null,
    specialty: null,
    city: null,
    searchQuery: null,
  },
};

export const useUsersStore = create<UsersState & UsersActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await api.getUsers();
      set({ users, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Kullanıcılar yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchExperts: async () => {
    set({ loading: true, error: null });
    try {
      const experts = await api.getExperts();
      set({ experts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Uzmanlar yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchUser: async (username: string) => {
    set({ loading: true, error: null });
    try {
      const user = await api.getUser(username);
      set({ currentUser: user, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Kullanıcı yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchExpert: async (username: string) => {
    set({ loading: true, error: null });
    try {
      const expert = await api.getExpert(username);
      set({ currentUser: expert, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Uzman yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  searchExperts: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const experts = await api.searchExperts(query);
      set({ experts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Uzman arama yapılırken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentUser: (user: User | Expert | null) => set({ currentUser: user }),
  
  setFilters: (filters: Partial<UsersState['filters']>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => set({ 
    filters: initialState.filters,
    users: [],
    experts: []
  }),

  // User interactions
  followUser: (userId: string) => {
    const { users, experts, currentUser } = get();
    
    const updateUser = (user: User | Expert) => 
      user.id === userId ? { ...user, followersCount: user.followersCount + 1 } : user;

    set({
      users: users.map(updateUser as (user: User) => User),
      experts: experts.map(updateUser as (expert: Expert) => Expert),
      currentUser: currentUser ? updateUser(currentUser) : null
    });
  },

  unfollowUser: (userId: string) => {
    const { users, experts, currentUser } = get();
    
    const updateUser = (user: User | Expert) => 
      user.id === userId ? { ...user, followersCount: Math.max(0, user.followersCount - 1) } : user;

    set({
      users: users.map(updateUser as (user: User) => User),
      experts: experts.map(updateUser as (expert: Expert) => Expert),
      currentUser: currentUser ? updateUser(currentUser) : null
    });
  },
})); 