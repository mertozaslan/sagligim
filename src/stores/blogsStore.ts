import { create } from 'zustand';
import { Blog, BlogsResponse, BlogFilters, TrendCategory, blogsService } from '../services/blogs';

interface BlogsState {
  blogs: Blog[];
  currentBlog: Blog | null;
  newBlogs: Blog[];
  similarBlogs: Blog[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBlogs: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: BlogFilters;
  trendCategories: TrendCategory[];
}

interface BlogsActions {
  // Actions
  fetchBlogs: (filters?: BlogFilters) => Promise<void>;
  fetchBlog: (id: string) => Promise<void>;
  createBlog: (blogData: any) => Promise<void>;
  updateBlog: (blogId: string, blogData: any) => Promise<void>;
  deleteBlog: (blogId: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentBlog: (blog: Blog | null) => void;
  setFilters: (filters: Partial<BlogFilters>) => void;
  clearFilters: () => void;
  
  // Blog interactions
  likeBlog: (blogId: string) => Promise<void>;
  dislikeBlog: (blogId: string) => Promise<void>;
  reportBlog: (blogId: string, reportData: any) => Promise<void>;
}

const initialState: BlogsState = {
  blogs: [],
  currentBlog: null,
  newBlogs: [],
  similarBlogs: [],
  loading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  trendCategories: [],
};

export const useBlogsStore = create<BlogsState & BlogsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchBlogs: async (filters?: BlogFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await blogsService.getBlogs(mergedFilters);
      
      set({ 
        blogs: response?.blogs || [], 
        pagination: response?.pagination || null,
        trendCategories: response?.trendCategories || [],
        filters: mergedFilters,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Bloglar yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchBlog: async (id: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Store: Fetching blog with ID:', id);
      const response = await blogsService.getBlogById(id);
      console.log('Store: Received response:', response);

      // API response yapısı: { blog, newBlogs, similarBlogs }
      const { blog, newBlogs, similarBlogs } = response;

      console.log('Store: Setting currentBlog to:', blog);
      console.log('Store: Setting newBlogs to:', newBlogs);
      console.log('Store: Setting similarBlogs to:', similarBlogs);

      set({
        currentBlog: blog,
        newBlogs: newBlogs || [],
        similarBlogs: similarBlogs || [],
        loading: false
      });
    } catch (error) {
      console.error('Store: Error fetching blog:', error);
      set({
        error: error instanceof Error ? error.message : 'Blog yüklenirken hata oluştu',
        loading: false
      });
    }
  },

  createBlog: async (blogData: any) => {
    set({ loading: true, error: null });
    try {
      console.log('Store: Creating blog:', blogData);
      const newBlog = await blogsService.createBlog(blogData);
      console.log('Store: Created blog:', newBlog);
      const { blogs } = get();
      set({ 
        blogs: [newBlog, ...blogs],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Blog oluşturulurken hata oluştu', 
        loading: false 
      });
    }
  },

  updateBlog: async (blogId: string, blogData: any) => {
    set({ loading: true, error: null });
    try {
      const updatedBlog = await blogsService.updateBlog(blogId, blogData);
      const { blogs, currentBlog } = get();
      
      set({
        blogs: blogs.map(blog => blog._id === blogId ? updatedBlog : blog),
        currentBlog: currentBlog?._id === blogId ? updatedBlog : currentBlog,
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Blog güncellenirken hata oluştu', 
        loading: false 
      });
    }
  },

  deleteBlog: async (blogId: string) => {
    set({ loading: true, error: null });
    try {
      await blogsService.deleteBlog(blogId);
      const { blogs, currentBlog } = get();
      
      set({
        blogs: blogs.filter(blog => blog._id !== blogId),
        currentBlog: currentBlog?._id === blogId ? null : currentBlog,
        loading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Blog silinirken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentBlog: (blog: Blog | null) => set({ currentBlog: blog }),
  setFilters: (filters: Partial<BlogFilters>) => set({ filters: { ...get().filters, ...filters } }),
  clearFilters: () => set({ filters: initialState.filters }),

  // Blog interactions
  likeBlog: async (blogId: string) => {
    try {
      const response = await blogsService.likeBlog(blogId);
      const { blogs, currentBlog } = get();
      
      const updateBlog = (blog: Blog) =>
        blog._id === blogId ? {
          ...blog,
          isLiked: response.isLiked,
          isDisliked: response.isDisliked || false,
        } : blog;

      set({
        blogs: blogs.map(updateBlog),
        currentBlog: currentBlog ? updateBlog(currentBlog) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğeni işlemi başarısız' 
      });
    }
  },

  dislikeBlog: async (blogId: string) => {
    try {
      const response = await blogsService.dislikeBlog(blogId);
      const { blogs, currentBlog } = get();
      
      const updateBlog = (blog: Blog) =>
        blog._id === blogId ? {
          ...blog,
          isDisliked: response.isDisliked,
          isLiked: response.isLiked || false,
        } : blog;

      set({
        blogs: blogs.map(updateBlog),
        currentBlog: currentBlog ? updateBlog(currentBlog) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğenmeme işlemi başarısız' 
      });
    }
  },

  reportBlog: async (blogId: string, reportData: any) => {
    try {
      await blogsService.reportBlog(blogId, reportData);
    } catch (error) {
      console.error('Report blog hatası:', error);
    }
  }
}));
