import { create } from 'zustand';
import { Event, EventsResponse, EventFilters, EventStats, eventsService } from '../services/events';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  userEvents: Event[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: EventFilters;
  stats: EventStats | null;
}

interface EventsActions {
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  searchEvents: (searchTerm: string, filters?: EventFilters) => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  createEvent: (eventData: any) => Promise<void>;
  updateEvent: (id: string, eventData: any) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  registerForEvent: (eventId: string, registrationData?: any) => Promise<void>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  fetchUserEvents: (filters?: EventFilters) => Promise<void>;
  fetchEventStats: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentEvent: (event: Event | null) => void;
  setFilters: (filters: EventFilters) => void;
  clearFilters: () => void;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  userEvents: [],
  loading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'asc'
  },
  stats: null,
};

export const useEventsStore = create<EventsState & EventsActions>((set, get) => ({
  ...initialState,

  fetchEvents: async (filters?: EventFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await eventsService.getEvents(mergedFilters);
      set({
        events: response?.events || [],
        pagination: response?.pagination || null,
        filters: mergedFilters,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlikler yüklenirken hata oluştu',
        loading: false
      });
    }
  },

  searchEvents: async (searchTerm: string, filters?: EventFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await eventsService.searchEvents(searchTerm, mergedFilters);
      set({
        events: response?.events || [],
        pagination: response?.pagination || null,
        filters: mergedFilters,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlik arama sırasında hata oluştu',
        loading: false
      });
    }
  },

  fetchEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const event = await eventsService.getEventById(id);
      set({
        currentEvent: event,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlik yüklenirken hata oluştu',
        loading: false
      });
    }
  },

  createEvent: async (eventData: any) => {
    set({ loading: true, error: null });
    try {
      const newEvent = await eventsService.createEvent(eventData);
      set(state => ({
        events: [newEvent, ...state.events],
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlik oluşturulurken hata oluştu',
        loading: false
      });
    }
  },

  updateEvent: async (id: string, eventData: any) => {
    set({ loading: true, error: null });
    try {
      const updatedEvent = await eventsService.updateEvent(id, eventData);
      set(state => ({
        events: state.events.map(event => 
          event._id === id ? updatedEvent : event
        ),
        currentEvent: state.currentEvent?._id === id ? updatedEvent : state.currentEvent,
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlik güncellenirken hata oluştu',
        loading: false
      });
    }
  },

  deleteEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await eventsService.deleteEvent(id);
      set(state => ({
        events: state.events.filter(event => event._id !== id),
        currentEvent: state.currentEvent?._id === id ? null : state.currentEvent,
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlik silinirken hata oluştu',
        loading: false
      });
    }
  },

  registerForEvent: async (eventId: string, registrationData?: any) => {
    set({ loading: true, error: null });
    try {
      const { event } = await eventsService.registerForEvent(eventId, registrationData);
      set(state => ({
        events: state.events.map(e => 
          e._id === eventId ? { ...e, isRegistered: true, currentParticipants: event.currentParticipants } : e
        ),
        currentEvent: state.currentEvent?._id === eventId ? { ...state.currentEvent, isRegistered: true, currentParticipants: event.currentParticipants } : state.currentEvent,
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinliğe kayıt olurken hata oluştu',
        loading: false
      });
    }
  },

  unregisterFromEvent: async (eventId: string) => {
    set({ loading: true, error: null });
    try {
      const { event } = await eventsService.unregisterFromEvent(eventId);
      set(state => ({
        events: state.events.map(e => 
          e._id === eventId ? { ...e, isRegistered: false, currentParticipants: event.currentParticipants } : e
        ),
        currentEvent: state.currentEvent?._id === eventId ? { ...state.currentEvent, isRegistered: false, currentParticipants: event.currentParticipants } : state.currentEvent,
        loading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlik kaydı iptal edilirken hata oluştu',
        loading: false
      });
    }
  },

  fetchUserEvents: async (filters?: EventFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await eventsService.getUserEvents(mergedFilters);
      set({
        userEvents: response?.events || [],
        pagination: response?.pagination || null,
        filters: mergedFilters,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Kullanıcı etkinlikleri yüklenirken hata oluştu',
        loading: false
      });
    }
  },

  fetchEventStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await eventsService.getEventStats();
      set({
        stats,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Etkinlik istatistikleri yüklenirken hata oluştu',
        loading: false
      });
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentEvent: (event: Event | null) => set({ currentEvent: event }),
  setFilters: (filters: EventFilters) => set({ filters }),
  clearFilters: () => set({ filters: initialState.filters }),
}));