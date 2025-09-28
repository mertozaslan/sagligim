// Comments API servisleri - Modern axios yaklaşımı
import { api, publicApi, handleApiError } from '@/lib/axios';

// Comment interface'leri
export interface CommentAuthor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface CommentPost {
  _id: string;
  title: string;
}

export interface CommentParent {
  _id: string;
  content: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: CommentAuthor;
  post: CommentPost;
  parentComment?: CommentParent;
  replies?: Comment[];
  repliesCount: number;
  likesCount: number;
  dislikesCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
  postType?: 'Post' | 'Blog';
}

export interface UpdateCommentData {
  content: string;
}

export interface CommentFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'likesCount';
  sortOrder?: 'asc' | 'desc';
  postType?: 'Post' | 'Blog';
}

export interface CommentPagination {
  currentPage: number;
  totalPages: number;
  totalComments: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: CommentPagination;
}

export interface CommentLikeResponse {
  message: string;
  isLiked: boolean;
  likesCount: number;
}

export interface CommentDislikeResponse {
  message: string;
  isDisliked: boolean;
  dislikesCount: number;
}

export interface CommentReportData {
  reason: 'spam' | 'inappropriate' | 'harassment' | 'false_information' | 'other';
  description?: string;
}

// Comments API fonksiyonları
export const commentsService = {
  // Yorum oluşturma
  async createComment(postId: string, commentData: CreateCommentData): Promise<Comment> {
    try {
      console.log('Comments Service: Creating comment for post ID:', postId, 'with data:', commentData);
      console.log('Comments Service: PostType in commentData:', commentData.postType);
      const response = await api.post<Comment>(`/api/comments/${postId}`, commentData);
      console.log('Comments Service: Created comment response:', response);
      return response;
    } catch (error: any) {
      console.error('Comments Service: Error creating comment:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Post'un yorumlarını getir
  async getPostComments(postId: string, filters: CommentFilters = {}): Promise<CommentsResponse> {
    try {
      console.log('Comments Service: Fetching comments for post ID:', postId, 'with filters:', filters);
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.postType) params.append('postType', filters.postType);

      const url = `/api/comments/${postId}?${params.toString()}`;
      console.log('Comments Service: API URL:', url);
      
      const response = await api.get<CommentsResponse>(url);
      console.log('Comments Service: API response:', response);
      return response;
    } catch (error: any) {
      console.error('Comments Service: Error fetching comments:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum güncelleme
  async updateComment(commentId: string, commentData: UpdateCommentData): Promise<Comment> {
    try {
      return await api.put<Comment>(`/api/comments/${commentId}`, commentData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum silme
  async deleteComment(commentId: string): Promise<void> {
    try {
      await api.delete(`/api/comments/${commentId}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum beğenme/beğenmeyi geri alma
  async toggleLike(commentId: string): Promise<CommentLikeResponse> {
    try {
      return await api.post<CommentLikeResponse>(`/api/comments/${commentId}/like`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum beğenmeme/beğenmemeyi geri alma
  async toggleDislike(commentId: string): Promise<CommentDislikeResponse> {
    try {
      return await api.post<CommentDislikeResponse>(`/api/comments/${commentId}/dislike`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum raporlama
  async reportComment(commentId: string, reportData: CommentReportData): Promise<void> {
    try {
      await api.post(`/api/comments/${commentId}/report`, reportData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Kullanıcının yorumlarını getir
  async getUserComments(userId: string, filters: CommentFilters = {}): Promise<CommentsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      return await api.get<CommentsResponse>(`/api/comments/user/${userId}?${params.toString()}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum yanıtları getir
  async getCommentReplies(commentId: string, filters: CommentFilters = {}): Promise<CommentsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      return await api.get<CommentsResponse>(`/api/comments/${commentId}/replies?${params.toString()}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum yanıtı oluşturma
  async createReply(parentCommentId: string, content: string): Promise<Comment> {
    try {
      return await api.post<Comment>(`/api/comments/${parentCommentId}/reply`, { content });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Popüler yorumları getir
  async getPopularComments(postId: string, filters: CommentFilters = {}): Promise<CommentsResponse> {
    try {
      const popularFilters = { 
        ...filters, 
        sortBy: 'likesCount' as const, 
        sortOrder: 'desc' as const 
      };
      return await this.getPostComments(postId, popularFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Son yorumları getir
  async getRecentComments(postId: string, filters: CommentFilters = {}): Promise<CommentsResponse> {
    try {
      const recentFilters = { 
        ...filters, 
        sortBy: 'createdAt' as const, 
        sortOrder: 'desc' as const 
      };
      return await this.getPostComments(postId, recentFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Yorum arama
  async searchComments(query: string, postId?: string, filters: CommentFilters = {}): Promise<CommentsResponse> {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const endpoint = postId 
        ? `/api/comments/${postId}/search?${params.toString()}`
        : `/api/comments/search?${params.toString()}`;

      return await api.get<CommentsResponse>(endpoint);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
};
