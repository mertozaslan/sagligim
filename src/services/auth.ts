// Auth API servisleri - Axios ile modern yaklaşım
import { authApi, api, publicApi, handleApiError } from '@/lib/axios';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ProfileResponse {
  user: User;
}

export interface RefreshResponse {
  message: string;
  token: string;
  refreshToken: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Auth API fonksiyonları - Modern axios yaklaşımı
export const authService = {
  // Kullanıcı kayıt
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      return await authApi.register(userData);
    } catch (error: any) {
      // Original error'ı koru, handleApiError kullanma
      throw error;
    }
  },

  // Kullanıcı giriş
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      return await authApi.login(credentials);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Kullanıcı profili getir
  async getProfile(): Promise<User> {
    try {
      return await authApi.getProfile();
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Çıkış yapma
  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error: any) {
      console.error('Çıkış hatası:', error);
      // Hata olsa bile token'ları temizle
    }
  },

  // Token kontrolü
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Mevcut kullanıcı bilgilerini getir
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Kullanıcı bilgisi okuma hatası:', error);
      return null;
    }
  },

  // Token'ı getir
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    return localStorage.getItem('token');
  },

  // Profil güncelleme
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      return await api.put<User>('/api/auth/profile', userData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Şifre değiştirme
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Şifre sıfırlama isteği
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await publicApi.post('/api/auth/forgot-password', { email });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Şifre sıfırlama
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await publicApi.post('/api/auth/reset-password', {
        token,
        newPassword
      });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Email doğrulama
  async verifyEmail(token: string): Promise<void> {
    try {
      await publicApi.post('/api/auth/verify-email', { token });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Email doğrulama yeniden gönderme
  async resendVerificationEmail(): Promise<void> {
    try {
      await api.post('/api/auth/resend-verification');
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
};
