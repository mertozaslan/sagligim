import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API Base URL
const API_BASE_URL = 'https://api.saglikhep.com';

// Token yönetimi için yardımcı fonksiyonlar
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

const setTokens = (token: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isAdmin');
  
  // Auth değişikliği event'ini dispatch et
  window.dispatchEvent(new CustomEvent('authChange'));
};

// Token yenileme fonksiyonu
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('Refresh token bulunamadı');
    }

    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken: refreshTokenValue
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch (error) {
    console.error('Token yenileme hatası:', error);
    clearTokens();
    // Kullanıcıyı login sayfasına yönlendir
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }
};

// Ana axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekleme
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Token yenileme ve hata yönetimi
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any & { _retry?: boolean };

    // 401 hatası ve token yenileme denemesi yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token yenileme başarısız:', refreshError);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Diğer hatalar için
    return Promise.reject(error);
  }
);

// Auth API için özel instance (token olmadan)
export const authClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API için instance (token olmadan)
export const publicClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Response tipleri
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hata yönetimi için yardımcı fonksiyon
export const handleApiError = (error: AxiosError): string => {
  if (error.response) {
    // Sunucu hatası
    const data = error.response.data as any;
    return data?.message || `Sunucu hatası: ${error.response.status}`;
  } else if (error.request) {
    // Ağ hatası
    return 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
  } else {
    // Diğer hatalar
    return error.message || 'Beklenmeyen bir hata oluştu.';
  }
};

// Retry mekanizması
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Son deneme değilse bekle
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError!;
};

// API istekleri için yardımcı fonksiyonlar
export const api = {
  // GET isteği
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  // POST isteği
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  // PUT isteği
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  // PATCH isteği
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  // DELETE isteği
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },

  // Sayfalama ile GET isteği
  getPaginated: async <T>(url: string, params?: any): Promise<PaginatedResponse<T>> => {
    const response = await apiClient.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  },

  // Dosya yükleme
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data;
  },

  // Çoklu dosya yükleme
  uploadMultiple: async <T>(url: string, files: File[], onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data.data;
  },
};

// Auth API için özel fonksiyonlar
export const authApi = {
  // Giriş yapma
  login: async (credentials: { email: string; password: string }) => {
    const response = await authClient.post('/api/auth/login', credentials);
    const { accessToken, refreshToken: newRefreshToken, user } = response.data;
    
    
    // Token'ları kaydet
    setTokens(accessToken, newRefreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      // Auth değişikliği event'ini dispatch et
      window.dispatchEvent(new CustomEvent('authChange'));
    }
    
    return response.data;
  },

  // Kayıt olma
  register: async (userData: any) => {
    const response = await authClient.post('/api/auth/register', userData);
    return response.data;
  },

  // Çıkış yapma
  logout: async () => {
    try {
      const token = getToken();
      if (token) {
        await apiClient.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout hatası:', error);
    } finally {
      clearTokens();
    }
  },

  // Profil getirme
  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data.user;
  },
};

// Public API için fonksiyonlar
export const publicApi = {
  // Public veriler için GET
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await publicClient.get<ApiResponse<T>>(url, config);
    return response.data.data;
  },

  // Public POST (örneğin: iletişim formu)
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await publicClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  },
};

export default apiClient;
