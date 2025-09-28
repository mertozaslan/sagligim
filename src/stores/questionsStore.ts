import { create } from 'zustand';
import { Post, PostsResponse, PostFilters, TrendCategory, postsService } from '../services/posts';

interface QuestionsState {
  questions: Post[]; // Questions artık Post olarak çalışıyor
  currentQuestion: Post | null;
  newPosts: Post[];
  similarPosts: Post[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: PostFilters;
  trendCategories: TrendCategory[];
}

interface QuestionsActions {
  // Actions
  fetchQuestions: (filters?: PostFilters) => Promise<void>;
  fetchQuestion: (id: string) => Promise<void>;
  createQuestion: (questionData: any) => Promise<void>;
  updateQuestion: (questionId: string, questionData: any) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentQuestion: (question: Post | null) => void;
  setFilters: (filters: Partial<PostFilters>) => void;
  clearFilters: () => void;
  
  // Question interactions (artık Post interactions)
  likeQuestion: (questionId: string) => Promise<void>;
  dislikeQuestion: (questionId: string) => Promise<void>;
  reportQuestion: (questionId: string, reportData: any) => Promise<void>;
  incrementViews: (questionId: string) => Promise<void>;
}

const initialState: QuestionsState = {
  questions: [],
  currentQuestion: null,
  newPosts: [],
  similarPosts: [],
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

export const useQuestionsStore = create<QuestionsState & QuestionsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchQuestions: async (filters?: PostFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await postsService.getPosts(mergedFilters);
      
      
      set({ 
        questions: response?.posts || [], 
        pagination: response?.pagination || null,
        trendCategories: response?.trendCategorys || [],
        filters: mergedFilters,
        loading: false 
      });
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
      console.log('Store: Fetching question with ID:', id);
      const response = await postsService.getPostById(id);
      console.log('Store: Received response:', response);
      
      // API response yapısı: { post, newPosts, similarPosts }
      const { post, newPosts, similarPosts } = response;
      
      console.log('Store: Setting currentQuestion to:', post);
      console.log('Store: Setting newPosts to:', newPosts);
      console.log('Store: Setting similarPosts to:', similarPosts);
      
      set({ 
        currentQuestion: post, 
        newPosts: newPosts || [],
        similarPosts: similarPosts || [],
        loading: false 
      });
    } catch (error) {
      console.error('Store: Error fetching question:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Soru yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  createQuestion: async (questionData: any) => {
    set({ loading: true, error: null });
    try {
      const newQuestion = await postsService.createPost(questionData);
      console.log('Created question:', newQuestion);
      const { questions } = get();
      set({ 
        questions: [newQuestion, ...questions],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Soru oluşturulurken hata oluştu', 
        loading: false 
      });
    }
  },

  updateQuestion: async (questionId: string, questionData: any) => {
    set({ loading: true, error: null });
    try {
      const updatedQuestion = await postsService.updatePost(questionId, questionData);
      const { questions, currentQuestion } = get();
      
      const updateQuestionInList = (question: Post) => 
        question._id === questionId ? updatedQuestion : question;

      set({ 
        questions: questions.map(updateQuestionInList),
        currentQuestion: currentQuestion?._id === questionId ? updatedQuestion : currentQuestion,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Soru güncellenirken hata oluştu', 
        loading: false 
      });
    }
  },

  deleteQuestion: async (questionId: string) => {
    set({ loading: true, error: null });
    try {
      await postsService.deletePost(questionId);
      const { questions, currentQuestion } = get();
      
      set({ 
        questions: questions.filter(question => question._id !== questionId),
        currentQuestion: currentQuestion?._id === questionId ? null : currentQuestion,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Soru silinirken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentQuestion: (question: Post | null) => set({ currentQuestion: question }),
  
  setFilters: (filters: Partial<PostFilters>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => set({ 
    filters: initialState.filters,
    questions: [],
    pagination: null
  }),

  // Question interactions (artık Post interactions)
  likeQuestion: async (questionId: string) => {
    try {
      const response = await postsService.toggleLike(questionId);
      const { questions, currentQuestion } = get();
      
      const updateQuestion = (question: Post) => {
        if (question._id === questionId) {
          return { 
            ...question, 
            likesCount: response.likes || 0,
            dislikesCount: response.dislikes || 0,
            isLiked: response.isLiked,
            isDisliked: response.isDisliked
          };
        }
        return question;
      };

      set({
        questions: questions.map(updateQuestion),
        currentQuestion: currentQuestion ? updateQuestion(currentQuestion) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğeni işlemi başarısız' 
      });
    }
  },

  dislikeQuestion: async (questionId: string) => {
    try {
      const response = await postsService.toggleDislike(questionId);
      const { questions, currentQuestion } = get();
      
      const updateQuestion = (question: Post) => {
        if (question._id === questionId) {
          return { 
            ...question, 
            likesCount: response.likes || 0,
            dislikesCount: response.dislikes || 0,
            isLiked: response.isLiked,
            isDisliked: response.isDisliked
          };
        }
        return question;
      };

      set({
        questions: questions.map(updateQuestion),
        currentQuestion: currentQuestion ? updateQuestion(currentQuestion) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğenmeme işlemi başarısız' 
      });
    }
  },

  reportQuestion: async (questionId: string, reportData: any) => {
    try {
      await postsService.reportPost(questionId, reportData);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Raporlama işlemi başarısız' 
      });
    }
  },

  incrementViews: async (questionId: string) => {
    try {
      // API'de view tracking endpoint'i yok, sadece local state güncelle
      const { questions, currentQuestion } = get();
      
      const updateQuestion = (question: Post) => 
        question._id === questionId ? { 
          ...question, 
          views: (question.views || 0) + 1
        } : question;

      set({
        questions: questions.map(updateQuestion),
        currentQuestion: currentQuestion ? updateQuestion(currentQuestion) : null
      });
    } catch (error) {
      console.warn('Views artırma hatası:', error);
    }
  },
}));