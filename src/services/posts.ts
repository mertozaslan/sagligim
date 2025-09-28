// Posts API servisleri - Modern axios yaklaşımı
import { api, publicApi, handleApiError } from '@/lib/axios';

// Post interface'leri
export interface PostAuthor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface PostDisease {
  id: string;
  name: string;
  category?: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  category: 'diabetes' | 'heart-disease' | 'cancer' | 'mental-health' | 'arthritis' | 'asthma' | 'digestive' | 'neurological' | 'autoimmune' | 'other';
  tags: string[];
  images: string[];
  isAnonymous: boolean;
  isSensitive: boolean;
  medicalAdvice: boolean;
  symptoms: string[];
  treatments: string[];
  author: PostAuthor;
  disease?: PostDisease;
  likes: string[]; // API'den gelen likes array'i
  dislikes: string[]; // API'den gelen dislikes array'i
  views: number;
  isApproved: boolean;
  isReported: boolean;
  reportCount: number;
  likesCount: number; // Virtual field
  dislikesCount: number; // Virtual field
  commentCount: number; // Virtual field
  isLiked: boolean; // Kullanıcının bu post'u beğenip beğenmediği
  isDisliked: boolean; // Kullanıcının bu post'u beğenmeyip beğenmediği
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: 'diabetes' | 'heart-disease' | 'cancer' | 'mental-health' | 'arthritis' | 'asthma' | 'digestive' | 'neurological' | 'autoimmune' | 'other';
  tags: string[];
  images?: string[];
  isAnonymous?: boolean;
  isSensitive?: boolean;
  medicalAdvice?: boolean;
  symptoms?: string[];
  treatments?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  category?: 'diabetes' | 'heart-disease' | 'cancer' | 'mental-health' | 'arthritis' | 'asthma' | 'digestive' | 'neurological' | 'autoimmune' | 'other';
  tags?: string[];
  images?: string[];
  isAnonymous?: boolean;
  isSensitive?: boolean;
  medicalAdvice?: boolean;
  symptoms?: string[];
  treatments?: string[];
}

export interface PostFilters {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'createdAt' | 'likes' | 'views';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PostPagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TrendCategory {
  count: number;
  name: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: PostPagination;
  trendCategorys?: TrendCategory[];
}

export interface LikeResponse {
  message: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
}

export interface DislikeResponse {
  message: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
}

export interface ReportData {
  reason: 'spam' | 'inappropriate' | 'harassment' | 'false_information' | 'other';
  description?: string;
}

// Posts API fonksiyonları
export const postsService = {
  // Post oluşturma
  async createPost(postData: CreatePostData): Promise<Post> {
    try {
      const response = await api.post<{post: Post}>('/api/posts', postData);
      console.log('API response:', response);
      return response.post;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Tüm post'ları getir
  async getPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.search) params.append('search', filters.search);

      const result = await api.get<PostsResponse>(`/api/posts?${params.toString()}`);
      return result;
    } catch (error: any) {
      console.error('❌ Posts API hatası:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post detayı getir
  async getPostById(postId: string): Promise<{post: Post, newPosts: Post[], similarPosts: Post[]}> {
    try {
      console.log('Posts Service: Fetching post with ID:', postId);
      const response = await api.get<{post: Post, newPosts: Post[], similarPosts: Post[]}>(`/api/posts/${postId}`);
      console.log('Posts Service: API response:', response);
      return response;
    } catch (error: any) {
      console.error('Posts Service: Error fetching post:', error);
      if (error.response?.status === 404) {
        throw new Error('Post bulunamadı');
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post güncelleme
  async updatePost(postId: string, postData: UpdatePostData): Promise<Post> {
    try {
      return await api.put<Post>(`/api/posts/${postId}`, postData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post silme
  async deletePost(postId: string): Promise<void> {
    try {
      await api.delete(`/api/posts/${postId}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post beğenme/beğenmeyi geri alma
  async toggleLike(postId: string): Promise<LikeResponse> {
    try {
      return await api.post<LikeResponse>(`/api/posts/${postId}/like`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post beğenmeme/beğenmemeyi geri alma
  async toggleDislike(postId: string): Promise<DislikeResponse> {
    try {
      return await api.post<DislikeResponse>(`/api/posts/${postId}/dislike`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post raporlama
  async reportPost(postId: string, reportData: ReportData): Promise<void> {
    try {
      await api.post(`/api/posts/${postId}/report`, reportData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Kullanıcının post'larını getir
  async getUserPosts(userId: string, filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);

      return await api.get<PostsResponse>(`/api/posts/user/${userId}?${params.toString()}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post arama
  async searchPosts(query: string, filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getPosts(searchFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Kategoriye göre post'ları getir
  async getPostsByCategory(category: string, filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const categoryFilters = { ...filters, category };
      return await this.getPosts(categoryFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Popüler post'ları getir
  async getPopularPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const popularFilters = { 
        ...filters, 
        sortBy: 'likes' as const, 
        sortOrder: 'desc' as const
      };
      return await this.getPosts(popularFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Son post'ları getir
  async getRecentPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const recentFilters = { 
        ...filters, 
        sortBy: 'createdAt' as const, 
        sortOrder: 'desc' as const
      };
      return await this.getPosts(recentFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post görüntülenme sayısını artır (API'de endpoint yok, sadece local)
  async incrementViews(postId: string): Promise<void> {
    // API'de view tracking endpoint'i yok, sadece local state güncellenir
    // Bu fonksiyon store'da kullanılacak
    return Promise.resolve();
  }
};
