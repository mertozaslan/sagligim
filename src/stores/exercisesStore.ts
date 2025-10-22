import { create } from 'zustand';
import { exerciseService, Exercise, ExerciseStats, DailySummary, CreateExerciseData, CompleteExerciseData, ActiveExercisesData } from '@/services/exercises';

interface ExerciseStore {
  // State
  exercises: Exercise[];
  activeExercises: ActiveExercisesData | null;
  activeSummary: {
    date: string;
    totalExercises: number;
    completedToday: number;
    totalDuration: number;
    completionPercentage: number;
  } | null;
  stats: ExerciseStats | null;
  dailySummary: DailySummary | null;
  selectedDate: string;
  loading: boolean;
  error: string | null;

  // Actions
  fetchExercises: () => Promise<void>;
  fetchActiveExercises: (period?: 'daily' | 'weekly' | 'monthly') => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchDailySummary: (date?: string) => Promise<void>;
  createExercise: (data: CreateExerciseData) => Promise<void>;
  updateExercise: (id: string, data: CreateExerciseData) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  completeExercise: (id: string, data: CompleteExerciseData) => Promise<void>;
  toggleExercise: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  clearError: () => void;
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  // Initial state
  exercises: [],
  activeExercises: null,
  activeSummary: null,
  stats: null,
  dailySummary: null,
  selectedDate: new Date().toISOString().split('T')[0],
  loading: false,
  error: null,

  // Fetch all exercises
  fetchExercises: async () => {
    set({ loading: true, error: null });
    try {
      const response = await exerciseService.getExercises();
      set({ exercises: response, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Egzersizler yüklenemedi', loading: false });
    }
  },

  // Fetch active exercises
  fetchActiveExercises: async (period?: 'daily' | 'weekly' | 'monthly') => {
    set({ loading: true, error: null });
    try {
      const response = await exerciseService.getActiveExercises(period);
      
      // API'den gelen veriyi direkt kullan - gereksiz işlem yok
      set({ 
        activeExercises: response.data,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Aktif egzersizler yüklenemedi', loading: false });
    }
  },

  // Fetch stats
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await exerciseService.getStats();
      set({ stats: response, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'İstatistikler yüklenemedi', loading: false });
    }
  },

  // Fetch daily summary
  fetchDailySummary: async (date?: string) => {
    set({ loading: true, error: null });
    try {
        const response = await exerciseService.getDailySummary(date);
        set({ dailySummary: response, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Günlük özet yüklenemedi', loading: false });
    }
  },

  // Create exercise
  createExercise: async (data: CreateExerciseData) => {
    set({ loading: true, error: null });
    try {
      const response = await exerciseService.createExercise(data);
      const newExercise = response;
      
      set(state => ({
        exercises: [...state.exercises, newExercise],
        activeExercises: newExercise.isActive && state.activeExercises
          ? {
              ...state.activeExercises,
              exercises: [...state.activeExercises.exercises, newExercise],
              totalExercises: state.activeExercises.totalExercises + 1
            }
          : state.activeExercises,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Egzersiz oluşturulamadı', loading: false });
      throw error;
    }
  },

  // Update exercise
  updateExercise: async (id: string, data: CreateExerciseData) => {
    set({ loading: true, error: null });
    try {
      const response = await exerciseService.updateExercise(id, data);
      const updatedExercise = response;
      
      set(state => ({
        exercises: state.exercises.map(ex => 
          ex._id === id ? updatedExercise : ex
        ),
        activeExercises: state.activeExercises
          ? {
              ...state.activeExercises,
              exercises: state.activeExercises.exercises.map(ex => 
                ex._id === id ? updatedExercise : ex
              )
            }
          : state.activeExercises,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Egzersiz güncellenemedi', loading: false });
      throw error;
    }
  },

  // Delete exercise
  deleteExercise: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await exerciseService.deleteExercise(id);
      
      set(state => ({
        exercises: state.exercises.filter(ex => ex._id !== id),
        activeExercises: state.activeExercises
          ? {
              ...state.activeExercises,
              exercises: state.activeExercises.exercises.filter(ex => ex._id !== id),
              totalExercises: state.activeExercises.totalExercises - 1
            }
          : state.activeExercises,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Egzersiz silinemedi', loading: false });
      throw error;
    }
  },

  // Complete exercise
  completeExercise: async (id: string, data: CompleteExerciseData) => {
    set({ loading: true, error: null });
    try {
      const response = await exerciseService.completeExercise(id, data);
      const updatedExercise = response;
      
      set(state => ({
        exercises: state.exercises.map(ex => 
          ex._id === id ? updatedExercise : ex
        ),
        activeExercises: state.activeExercises
          ? {
              ...state.activeExercises,
              exercises: state.activeExercises.exercises.map(ex => 
                ex._id === id ? updatedExercise : ex
              ),
              completedExercises: state.activeExercises.completedExercises + (updatedExercise.isCompleted ? 1 : 0)
            }
          : state.activeExercises,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Egzersiz tamamlanamadı', loading: false });
      throw error;
    }
  },

  // Toggle exercise
  toggleExercise: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await exerciseService.toggleExercise(id);
      const updatedExercise = response;
      
      set(state => ({
        exercises: state.exercises.map(ex => 
          ex._id === id ? updatedExercise : ex
        ),
        activeExercises: state.activeExercises
          ? {
              ...state.activeExercises,
              exercises: updatedExercise.isActive 
                ? [...state.activeExercises.exercises.filter(ex => ex._id !== id), updatedExercise]
                : state.activeExercises.exercises.filter(ex => ex._id !== id),
              totalExercises: updatedExercise.isActive 
                ? state.activeExercises.totalExercises + 1
                : state.activeExercises.totalExercises - 1
            }
          : state.activeExercises,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Egzersiz durumu değiştirilemedi', loading: false });
      throw error;
    }
  },

  // Set selected date
  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));
