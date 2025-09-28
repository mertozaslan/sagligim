// API servisleri - Modern axios yaklaşımı
import { api, publicApi, handleApiError } from '@/lib/axios';
import { Post, CreatePostData, UpdatePostData, PostFilters, PostsResponse } from './posts';
import { Comment, CreateCommentData, UpdateCommentData, CommentFilters, CommentsResponse } from './comments';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  verified: boolean;
  userType: 'user' | 'expert';
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface Expert extends User {
  specialty: string;
  experience: number;
  education: string;
  certifications: string[];
  city: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
}

// Comment interface'i artık comments.ts'den import ediliyor

export interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  category: string;
  tags: string[];
  image?: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  price: number;
  createdAt: string;
}

// Question interface'i artık Post ile değiştirildi
// Post interface'i posts.ts'den import ediliyor

// API fonksiyonları - Modern axios yaklaşımı
export const apiService = {
  // Posts - Yeni API yapısına göre güncellendi
  async getPosts(filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.search) params.append('search', filters.search);

      return await api.get<PostsResponse>(`/api/posts?${params.toString()}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getPost(postId: string): Promise<Post> {
    try {
      return await api.get<Post>(`/api/posts/${postId}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Post bulunamadı');
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getPostsByCategory(category: string, filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const categoryFilters = { ...filters, category };
      return await this.getPosts(categoryFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getPostsByAuthor(authorId: string, filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);

      return await api.get<PostsResponse>(`/api/posts/user/${authorId}?${params.toString()}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async createPost(postData: CreatePostData): Promise<Post> {
    try {
      return await api.post<Post>('/api/posts', postData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async updatePost(postId: string, postData: UpdatePostData): Promise<Post> {
    try {
      return await api.put<Post>(`/api/posts/${postId}`, postData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async deletePost(postId: string): Promise<void> {
    try {
      await api.delete(`/api/posts/${postId}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Users
  async getUsers(): Promise<User[]> {
    try {
      return await api.get<User[]>('/api/users');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getUser(username: string): Promise<User | null> {
    try {
      return await api.get<User>(`/api/users/${username}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Experts - Artık expertsService kullanılıyor
  async getExperts(): Promise<Expert[]> {
    try {
      return await api.get<Expert[]>('/api/users/experts');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getExpert(username: string): Promise<Expert | null> {
    try {
      return await api.get<Expert>(`/api/users/experts/${username}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Comments - Yeni API yapısına göre güncellendi
  async getComments(): Promise<Comment[]> {
    try {
      return await api.get<Comment[]>('/api/comments');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getCommentsByPost(postId: string, filters: CommentFilters = {}): Promise<CommentsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      return await api.get<CommentsResponse>(`/api/comments/${postId}?${params.toString()}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async createComment(postId: string, commentData: CreateCommentData): Promise<Comment> {
    try {
      return await api.post<Comment>(`/api/comments/${postId}`, commentData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async updateComment(commentId: string, commentData: UpdateCommentData): Promise<Comment> {
    try {
      return await api.put<Comment>(`/api/comments/${commentId}`, commentData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      await api.delete(`/api/comments/${commentId}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Events
  async getEvents(): Promise<Event[]> {
    try {
      return await api.get<Event[]>('/api/events');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getEvent(id: string): Promise<Event | null> {
    try {
      return await api.get<Event>(`/api/events/${id}`);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'currentParticipants'>): Promise<Event> {
    try {
      return await api.post<Event>('/api/events', eventData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    try {
      return await api.put<Event>(`/api/events/${id}`, eventData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`/api/events/${id}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async joinEvent(id: string): Promise<void> {
    try {
      await api.post(`/api/events/${id}/join`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async leaveEvent(id: string): Promise<void> {
    try {
      await api.post(`/api/events/${id}/leave`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Questions - Artık Posts olarak çalışıyor
  async getQuestions(filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      // Questions artık Posts API'sini kullanıyor
      return await this.getPosts(filters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getQuestion(id: string): Promise<Post> {
    try {
      // Question artık Post olarak çalışıyor
      return await this.getPost(id);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Soru bulunamadı');
      }
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async createQuestion(questionData: CreatePostData): Promise<Post> {
    try {
      // Question oluşturma artık Post oluşturma olarak çalışıyor
      return await this.createPost(questionData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async updateQuestion(id: string, questionData: UpdatePostData): Promise<Post> {
    try {
      // Question güncelleme artık Post güncelleme olarak çalışıyor
      return await this.updatePost(id, questionData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async deleteQuestion(id: string): Promise<void> {
    try {
      // Question silme artık Post silme olarak çalışıyor
      await this.deletePost(id);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Search - Yeni API yapısına göre güncellendi
  async searchPosts(query: string, filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getPosts(searchFilters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async searchExperts(query: string): Promise<Expert[]> {
    try {
      return await api.get<Expert[]>(`/api/users/experts?search=${encodeURIComponent(query)}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async searchQuestions(query: string, filters: PostFilters = {}): Promise<PostsResponse> {
    try {
      // Questions artık Posts olarak çalışıyor
      return await this.searchPosts(query, filters);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async searchEvents(query: string): Promise<Event[]> {
    try {
      return await api.get<Event[]>(`/api/search/events?q=${encodeURIComponent(query)}`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Like/Unlike - Yeni API yapısına göre güncellendi
  async likePost(postId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    try {
      return await api.post(`/api/posts/${postId}/like`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async dislikePost(postId: string): Promise<{ isDisliked: boolean; dislikesCount: number }> {
    try {
      return await api.post(`/api/posts/${postId}/dislike`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async likeComment(commentId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    try {
      return await api.post(`/api/comments/${commentId}/like`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async dislikeComment(commentId: string): Promise<{ isDisliked: boolean; dislikesCount: number }> {
    try {
      return await api.post(`/api/comments/${commentId}/dislike`);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
}; 