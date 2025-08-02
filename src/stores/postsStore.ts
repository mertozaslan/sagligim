import { create } from 'zustand';
import { Post, api } from '../services/api';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    authorId: string | null;
    searchQuery: string | null;
  };
}

interface PostsActions {
  // Actions
  fetchPosts: () => Promise<void>;
  fetchPost: (slug: string) => Promise<void>;
  fetchPostsByCategory: (category: string) => Promise<void>;
  fetchPostsByAuthor: (authorId: string) => Promise<void>;
  searchPosts: (query: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPost: (post: Post | null) => void;
  setFilters: (filters: Partial<PostsState['filters']>) => void;
  clearFilters: () => void;
  
  // Post interactions
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  sharePost: (postId: string) => void;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    authorId: null,
    searchQuery: null,
  },
};

export const usePostsStore = create<PostsState & PostsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const posts = await api.getPosts();
      set({ posts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Posts yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchPost: async (slug: string) => {
    set({ loading: true, error: null });
    try {
      const post = await api.getPost(slug);
      set({ currentPost: post, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Post yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchPostsByCategory: async (category: string) => {
    set({ loading: true, error: null });
    try {
      const posts = await api.getPostsByCategory(category);
      set({ posts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Kategori posts yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchPostsByAuthor: async (authorId: string) => {
    set({ loading: true, error: null });
    try {
      const posts = await api.getPostsByAuthor(authorId);
      set({ posts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yazar posts yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  searchPosts: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const posts = await api.searchPosts(query);
      set({ posts, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Arama yapılırken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentPost: (post: Post | null) => set({ currentPost: post }),
  
  setFilters: (filters: Partial<PostsState['filters']>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => set({ 
    filters: initialState.filters,
    posts: []
  }),

  // Post interactions
  likePost: (postId: string) => {
    const { posts, currentPost } = get();
    
    const updatePost = (post: Post) => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post;

    set({
      posts: posts.map(updatePost),
      currentPost: currentPost ? updatePost(currentPost) : null
    });
  },

  unlikePost: (postId: string) => {
    const { posts, currentPost } = get();
    
    const updatePost = (post: Post) => 
      post.id === postId ? { ...post, likes: Math.max(0, post.likes - 1) } : post;

    set({
      posts: posts.map(updatePost),
      currentPost: currentPost ? updatePost(currentPost) : null
    });
  },

  sharePost: (postId: string) => {
    const { posts, currentPost } = get();
    
    const updatePost = (post: Post) => 
      post.id === postId ? { ...post, shares: post.shares + 1 } : post;

    set({
      posts: posts.map(updatePost),
      currentPost: currentPost ? updatePost(currentPost) : null
    });
  },
})); 