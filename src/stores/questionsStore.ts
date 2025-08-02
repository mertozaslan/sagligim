import { create } from 'zustand';
import { Question, api } from '../services/api';

interface QuestionsState {
  questions: Question[];
  currentQuestion: Question | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    isResolved: boolean | null;
    searchQuery: string | null;
  };
}

interface QuestionsActions {
  // Actions
  fetchQuestions: () => Promise<void>;
  fetchQuestion: (id: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setFilters: (filters: Partial<QuestionsState['filters']>) => void;
  clearFilters: () => void;
  
  // Question interactions
  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'answersCount' | 'views' | 'isResolved'>) => void;
  markAsResolved: (questionId: string) => void;
  incrementViews: (questionId: string) => void;
}

const initialState: QuestionsState = {
  questions: [],
  currentQuestion: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    isResolved: null,
    searchQuery: null,
  },
};

export const useQuestionsStore = create<QuestionsState & QuestionsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const questions = await api.getQuestions();
      set({ questions, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Sorular yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchQuestion: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const question = await api.getQuestion(id);
      set({ currentQuestion: question, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Soru yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentQuestion: (question: Question | null) => set({ currentQuestion: question }),
  
  setFilters: (filters: Partial<QuestionsState['filters']>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => set({ 
    filters: initialState.filters,
    questions: []
  }),

  // Question interactions
  addQuestion: (questionData) => {
    const newQuestion: Question = {
      id: `question_${Date.now()}`,
      ...questionData,
      createdAt: new Date().toISOString(),
      answersCount: 0,
      views: 0,
      isResolved: false,
    };
    
    set({ questions: [newQuestion, ...get().questions] });
  },

  markAsResolved: (questionId: string) => {
    const { questions, currentQuestion } = get();
    
    const updateQuestion = (question: Question) => 
      question.id === questionId ? { ...question, isResolved: true } : question;

    set({
      questions: questions.map(updateQuestion),
      currentQuestion: currentQuestion ? updateQuestion(currentQuestion) : null
    });
  },

  incrementViews: (questionId: string) => {
    const { questions, currentQuestion } = get();
    
    const updateQuestion = (question: Question) => 
      question.id === questionId ? { ...question, views: question.views + 1 } : question;

    set({
      questions: questions.map(updateQuestion),
      currentQuestion: currentQuestion ? updateQuestion(currentQuestion) : null
    });
  },
})); 