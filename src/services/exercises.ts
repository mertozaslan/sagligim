import { api } from '@/lib/axios';

export interface Exercise {
  _id: string;
  user: string;
  name: string;
  description?: string;
  duration: number;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  customPeriod?: number;
  completedCount: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  completionHistory: CompletionRecord[];
  // Backend'den gelen reminder alanını ignore ediyoruz
  reminder?: {
    enabled: boolean;
    time: string;
    days: string[];
  };
  createdAt: string;
  updatedAt: string;
  // Yeni API response alanları
  todayCompletions?: number;
  completedDuration?: number;
  isCompletedToday?: boolean;
}

export interface CompletionRecord {
  completedAt: string;
  duration: number;
  notes?: string;
}

export interface ExerciseStats {
  totalExercises: number;
  activeExercises: number;
  totalCompletions: number;
  totalDuration: number;
  longestStreak: number;
}

export interface DailySummary {
  date: string;
  totalExercises: number;
  completedExercises: number;
  totalDuration: number;
  exercises: {
    _id: string;
    name: string;
    targetDuration: number;
    completedDuration: number;
    completions: number;
    isCompleted: boolean;
  }[];
}

export interface ActiveExercisesData {
  period: 'daily' | 'weekly' | 'monthly';
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalExercises: number;
  completedExercises: number;
  totalDuration: number;
  exercises: {
    _id: string;
    name: string;
    targetDuration: number;
    completedDuration: number;
    completions: number;
    isCompleted: boolean;
  }[];
}

export interface ActiveExercisesResponse {
  success: boolean;
  data: ActiveExercisesData;
}

export interface CreateExerciseData {
  name: string;
  description?: string;
  duration: number;
  period: 'daily' | 'weekly' | 'monthly' | 'custom';
  customPeriod?: number;
}

export interface CompleteExerciseData {
  duration?: number;
  notes?: string;
}

export interface ExerciseHistory {
  exercise: {
    _id: string;
    name: string;
  };
  history: CompletionRecord[];
  totalCompletions: number;
}

class ExerciseService {
  // Tüm egzersizleri getir
  async getExercises(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const response = await api.get('/api/exercises', { params }) as any;
    return response.data;
  }

  // Aktif egzersizleri getir
  async getActiveExercises(period?: 'daily' | 'weekly' | 'monthly'): Promise<ActiveExercisesResponse> {
    const params = period ? { period } : {};
    const response = await api.get('/api/exercises/active', { params }) as any;
    return response;
  }

  // İstatistikleri getir
  async getStats() {
    const response = await api.get('/api/exercises/stats') as any;
    console.log('Stats response:', response.data);
    return response.data;
  }

  // Günlük özet
  async getDailySummary(date?: string) {
    const response = await api.get('/api/exercises/daily-summary', {
      params: date ? { date } : {}
    }) as any;
    return response.data;
  }

  // Tek egzersiz getir
  async getExercise(id: string) {
    const response = await api.get(`/api/exercises/${id}`) as any;
    return response.data;
  }

  // Egzersiz geçmişi
  async getExerciseHistory(id: string, startDate?: string, endDate?: string) {
    const response = await api.get(`/api/exercises/${id}/history`, {
      params: { startDate, endDate }
    }) as any;
    return response.data;
  }

  // Yeni egzersiz oluştur
  async createExercise(data: CreateExerciseData) {
    const response = await api.post('/api/exercises', data) as any;
    return response.data;
  }

  // Egzersiz güncelle
  async updateExercise(id: string, data: CreateExerciseData) {
    const response = await api.put(`/api/exercises/${id}`, data) as any;
    return response.data;
  }

  // Egzersiz sil
  async deleteExercise(id: string) {
    const response = await api.delete(`/api/exercises/${id}`) as any;
    return response.data;
  }

  // Egzersizi tamamla
  async completeExercise(id: string, data: CompleteExerciseData) {
    const response = await api.post(`/api/exercises/${id}/complete`, data) as any;
    return response.data;
  }

  // Egzersiz durumunu değiştir
  async toggleExercise(id: string) {
    const response = await api.patch(`/api/exercises/${id}/toggle`) as any;

    return response.data;
  }
}

export const exerciseService = new ExerciseService();
