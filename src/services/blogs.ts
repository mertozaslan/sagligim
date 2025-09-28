// Blogs API servisleri - Modern axios yaklaşımı
import { api, publicApi, handleApiError } from '@/lib/axios';

// Blog interface'leri
export interface BlogAuthor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: string;
  bio?: string;
}

export interface BlogReference {
  title: string;
  url: string;
}

export interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'medical-advice' | 'health-tips' | 'disease-information' | 'treatment-guides' | 'prevention' | 'nutrition' | 'mental-health' | 'pediatrics' | 'geriatrics' | 'emergency-care' | 'research' | 'other';
  tags: string[];
  images: string[];
  featuredImage?: string;
  author: BlogAuthor;
  isPublished: boolean;
  isFeatured: boolean;
  readingTime: number;
  readTime: number;
  views: number;
  likes: string[];
  dislikes: string[];
  likesCount: number;
  dislikesCount: number;
  commentCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  medicalDisclaimer?: string;
  references: BlogReference[];
  seoTitle?: string;
  seoDescription?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt: string;
  category: 'medical-advice' | 'health-tips' | 'disease-information' | 'treatment-guides' | 'prevention' | 'nutrition' | 'mental-health' | 'pediatrics' | 'geriatrics' | 'emergency-care' | 'research' | 'other';
  tags: string[];
  images: string[];
  featuredImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  medicalDisclaimer?: string;
  references: BlogReference[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateBlogData {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: 'medical-advice' | 'health-tips' | 'disease-information' | 'treatment-guides' | 'prevention' | 'nutrition' | 'mental-health' | 'pediatrics' | 'geriatrics' | 'emergency-care' | 'research' | 'other';
  tags?: string[];
  images?: string[];
  featuredImage?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  medicalDisclaimer?: string;
  references?: BlogReference[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  category?: string;
  author?: string;
  search?: string;
  featured?: boolean;
  published?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'views' | 'likes' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogsResponse {
  blogs: Blog[];
  pagination: BlogPagination;
  trendCategories?: TrendCategory[];
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TrendCategory {
  count: number;
  name: string;
}

export interface LikeResponse {
  message: string;
  isLiked: boolean;
  isDisliked: boolean;
}

export interface DislikeResponse {
  message: string;
  isLiked: boolean;
  isDisliked: boolean;
}

export interface ReportData {
  reason: string;
}

// Blogs API fonksiyonları
export const blogsService = {
  // Blog oluşturma (sadece doctor ve admin)
  async createBlog(blogData: CreateBlogData): Promise<Blog> {
    try {
      console.log('Blogs Service: Creating blog with data:', blogData);
      const response = await api.post<{blog: Blog}>('/api/blogs', blogData);
      console.log('Blogs Service: Created blog response:', response);
      return response.blog;
    } catch (error: any) {
      console.error('Blogs Service: Error creating blog:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Tüm blog'ları getir
  async getBlogs(filters: BlogFilters = {}): Promise<BlogsResponse> {
    try {
      console.log('Blogs Service: Fetching blogs with filters:', filters);
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.author) params.append('author', filters.author);
      if (filters.search) params.append('search', filters.search);
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
      if (filters.published !== undefined) params.append('published', filters.published.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const url = `/api/blogs?${params.toString()}`;
      console.log('Blogs Service: API URL:', url);
      
      const response = await api.get<BlogsResponse>(url);
      console.log('Blogs Service: API response:', response);
      return response;
    } catch (error: any) {
      console.error('Blogs Service: Error fetching blogs:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog detayı (ID ile)
  async getBlogById(blogId: string): Promise<{blog: Blog, newBlogs: Blog[], similarBlogs: Blog[]}> {
    try {
      console.log('Blogs Service: Fetching blog with ID:', blogId);
      const response = await api.get<{blog: Blog, newBlogs: Blog[], similarBlogs: Blog[]}>(`/api/blogs/${blogId}`);
      console.log('Blogs Service: API response:', response);
      return response;
    } catch (error: any) {
      console.error('Blogs Service: Error fetching blog:', error);
      if (error.response?.status === 404) {
        throw new Error('Blog bulunamadı');
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog detayı (Slug ile)
  async getBlogBySlug(slug: string): Promise<Blog> {
    try {
      const response = await api.get<{blog: Blog}>(`/api/blogs/slug/${slug}`);
      return response.blog;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Blog bulunamadı');
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog güncelleme
  async updateBlog(blogId: string, blogData: UpdateBlogData): Promise<Blog> {
    try {
      const response = await api.put<Blog>(`/api/blogs/${blogId}`, blogData);
      return response;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog silme
  async deleteBlog(blogId: string): Promise<void> {
    try {
      await api.delete(`/api/blogs/${blogId}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog beğenme
  async likeBlog(blogId: string): Promise<LikeResponse> {
    try {
      const response = await api.post<LikeResponse>(`/api/blogs/${blogId}/like`);
      return response;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog beğenmeme
  async dislikeBlog(blogId: string): Promise<DislikeResponse> {
    try {
      const response = await api.post<DislikeResponse>(`/api/blogs/${blogId}/dislike`);
      return response;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog raporlama
  async reportBlog(blogId: string, reportData: ReportData): Promise<void> {
    try {
      await api.post(`/api/blogs/${blogId}/report`, reportData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Kullanıcının blog'larını getir
  async getUserBlogs(userId: string, filters: BlogFilters = {}): Promise<BlogsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const url = `/api/blogs/user/${userId}?${params.toString()}`;
      const response = await api.get<BlogsResponse>(url);
      return response;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Öne çıkan blog'ları getir
  async getFeaturedBlogs(limit: number = 5): Promise<Blog[]> {
    try {
      const response = await api.get<{blogs: Blog[]}>(`/api/blogs/featured?limit=${limit}`);
      return response.blogs;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Blog kategorilerini getir
  async getBlogCategories(): Promise<TrendCategory[]> {
    try {
      const response = await api.get<{categories: TrendCategory[]}>('/api/blogs/categories');
      return response.categories;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
};
