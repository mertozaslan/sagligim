import { create } from 'zustand';
import { Post, PostsResponse, PostFilters, postsService } from '../services/posts';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: PostFilters;
}

interface PostsActions {
  // Actions
  fetchPosts: (filters?: PostFilters) => Promise<void>;
  fetchPost: (postId: string) => Promise<void>;
  fetchPostsByCategory: (category: string, filters?: PostFilters) => Promise<void>;
  fetchPostsByAuthor: (authorId: string, filters?: PostFilters) => Promise<void>;
  searchPosts: (query: string, filters?: PostFilters) => Promise<void>;
  createPost: (postData: any) => Promise<void>;
  updatePost: (postId: string, postData: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPost: (post: Post | null) => void;
  setFilters: (filters: Partial<PostFilters>) => void;
  clearFilters: () => void;
  
  // Post interactions
  likePost: (postId: string) => Promise<void>;
  dislikePost: (postId: string) => Promise<void>;
  reportPost: (postId: string, reportData: any) => Promise<void>;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
};

export const usePostsStore = create<PostsState & PostsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchPosts: async (filters?: PostFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await postsService.getPosts(mergedFilters);
      set({ 
        posts: response.posts, 
        pagination: response.pagination,
        filters: mergedFilters,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Posts yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchPost: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await postsService.getPostById(postId);
      set({ currentPost: response.post, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Post yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchPostsByCategory: async (category: string, filters?: PostFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters, category };
      const response = await postsService.getPostsByCategory(category, mergedFilters);
      set({ 
        posts: response.posts, 
        pagination: response.pagination,
        filters: mergedFilters,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Kategori posts yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchPostsByAuthor: async (authorId: string, filters?: PostFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await postsService.getUserPosts(authorId, mergedFilters);
      set({ 
        posts: response.posts, 
        pagination: response.pagination,
        filters: mergedFilters,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yazar posts yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  searchPosts: async (query: string, filters?: PostFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters, search: query };
      const response = await postsService.searchPosts(query, mergedFilters);
      set({ 
        posts: response.posts, 
        pagination: response.pagination,
        filters: mergedFilters,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Arama yapılırken hata oluştu', 
        loading: false 
      });
    }
  },

  createPost: async (postData: any) => {
    set({ loading: true, error: null });
    try {
      const newPost = await postsService.createPost(postData);
      const { posts } = get();
      set({ 
        posts: [newPost, ...posts],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Post oluşturulurken hata oluştu', 
        loading: false 
      });
    }
  },

  updatePost: async (postId: string, postData: any) => {
    set({ loading: true, error: null });
    try {
      const updatedPost = await postsService.updatePost(postId, postData);
      const { posts, currentPost } = get();
      
      const updatePostInList = (post: Post) => 
        post._id === postId ? updatedPost : post;

      set({ 
        posts: posts.map(updatePostInList),
        currentPost: currentPost?._id === postId ? updatedPost : currentPost,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Post güncellenirken hata oluştu', 
        loading: false 
      });
    }
  },

  deletePost: async (postId: string) => {
    set({ loading: true, error: null });
    try {
      await postsService.deletePost(postId);
      const { posts, currentPost } = get();
      
      set({ 
        posts: posts.filter(post => post._id !== postId),
        currentPost: currentPost?._id === postId ? null : currentPost,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Post silinirken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentPost: (post: Post | null) => set({ currentPost: post }),
  
  setFilters: (filters: Partial<PostFilters>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => set({ 
    filters: initialState.filters,
    posts: [],
    pagination: null
  }),

  // Post interactions
  likePost: async (postId: string) => {
    try {
      const response = await postsService.toggleLike(postId);
      const { posts, currentPost } = get();
      
      const updatePost = (post: Post) => 
        post._id === postId ? { 
          ...post, 
          isLiked: response.isLiked,
          isDisliked: response.isDisliked || false,
        } : post;

      set({
        posts: posts.map(updatePost),
        currentPost: currentPost ? updatePost(currentPost) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğeni işlemi başarısız' 
      });
    }
  },

  dislikePost: async (postId: string) => {
    try {
      const response = await postsService.toggleDislike(postId);
      const { posts, currentPost } = get();
      
      const updatePost = (post: Post) => 
        post._id === postId ? { 
          ...post, 
          isDisliked: response.isDisliked,
          isLiked: response.isLiked || false,
        } : post;

      set({
        posts: posts.map(updatePost),
        currentPost: currentPost ? updatePost(currentPost) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğenmeme işlemi başarısız' 
      });
    }
  },

  reportPost: async (postId: string, reportData: any) => {
    try {
      await postsService.reportPost(postId, reportData);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Raporlama işlemi başarısız' 
      });
    }
  },
})); 