import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { expertsService, Expert, ExpertsResponse, ExpertsQueryParams } from '@/services/experts';

interface ExpertsState {
  // Data
  experts: Expert[];
  pagination: ExpertsResponse['pagination'] | null;
  stats: ExpertsResponse['stats'] | null;
  filters: ExpertsResponse['filters'];
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  
  // Error state
  error: string | null;
  
  // Query params
  queryParams: ExpertsQueryParams;
  
  // Actions
  fetchExperts: (params?: ExpertsQueryParams) => Promise<void>;
  loadMoreExperts: () => Promise<void>;
  updateFilters: (filters: Partial<ExpertsQueryParams>) => void;
  clearFilters: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialQueryParams: ExpertsQueryParams = {
  page: 1,
  limit: 12,
};

const initialState = {
  experts: [],
  pagination: null,
  stats: null,
  filters: {},
  isLoading: false,
  isLoadingMore: false,
  error: null,
  queryParams: initialQueryParams,
};

export const useExpertsStore = create<ExpertsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchExperts: async (params?: ExpertsQueryParams) => {
        const currentParams = { ...get().queryParams, ...params };
        
        set({ 
          isLoading: true, 
          error: null,
          queryParams: currentParams,
          experts: params?.page === 1 ? [] : get().experts // Reset experts if it's the first page
        });

        try {
          const response = await expertsService.getExperts(currentParams);
          
          set({
            experts: currentParams.page === 1 ? response.experts : [...get().experts, ...response.experts],
            pagination: response.pagination,
            stats: response.stats,
            filters: response.filters,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Experts fetch error:', error);
          set({
            error: error.message || 'Uzmanlar yüklenirken bir hata oluştu',
            isLoading: false,
          });
        }
      },

      loadMoreExperts: async () => {
        const { pagination, queryParams, isLoadingMore } = get();
        
        if (!pagination?.hasNext || isLoadingMore) return;

        set({ isLoadingMore: true });

        try {
          const nextPage = pagination.currentPage + 1;
          const response = await expertsService.getExperts({
            ...queryParams,
            page: nextPage,
          });

          set({
            experts: [...get().experts, ...response.experts],
            pagination: response.pagination,
            isLoadingMore: false,
          });
        } catch (error: any) {
          console.error('Load more experts error:', error);
          set({
            error: error.message || 'Daha fazla uzman yüklenirken bir hata oluştu',
            isLoadingMore: false,
          });
        }
      },

      updateFilters: (filters: Partial<ExpertsQueryParams>) => {
        const newParams = { ...get().queryParams, ...filters, page: 1 }; // Reset to page 1 when filters change
        set({ queryParams: newParams });
        get().fetchExperts(newParams);
      },

      clearFilters: () => {
        const clearedParams = { ...initialQueryParams };
        set({ queryParams: clearedParams });
        get().fetchExperts(clearedParams);
      },

      setError: (error: string | null) => {
        set({ error });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'experts-store',
    }
  )
);
