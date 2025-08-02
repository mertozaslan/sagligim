import { create } from 'zustand';
import { Event, api } from '../services/api';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  filters: {
    category: string | null;
    isOnline: boolean | null;
    city: string | null;
    searchQuery: string | null;
  };
}

interface EventsActions {
  // Actions
  fetchEvents: () => Promise<void>;
  fetchEvent: (id: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentEvent: (event: Event | null) => void;
  setFilters: (filters: Partial<EventsState['filters']>) => void;
  clearFilters: () => void;
  
  // Event interactions
  joinEvent: (eventId: string) => void;
  leaveEvent: (eventId: string) => void;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    isOnline: null,
    city: null,
    searchQuery: null,
  },
};

export const useEventsStore = create<EventsState & EventsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await api.getEvents();
      set({ events, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlikler yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const event = await api.getEvent(id);
      set({ currentEvent: event, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Etkinlik yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentEvent: (event: Event | null) => set({ currentEvent: event }),
  
  setFilters: (filters: Partial<EventsState['filters']>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => set({ 
    filters: initialState.filters,
    events: []
  }),

  // Event interactions
  joinEvent: (eventId: string) => {
    const { events, currentEvent } = get();
    
    const updateEvent = (event: Event) => 
      event.id === eventId ? { ...event, currentParticipants: event.currentParticipants + 1 } : event;

    set({
      events: events.map(updateEvent),
      currentEvent: currentEvent ? updateEvent(currentEvent) : null
    });
  },

  leaveEvent: (eventId: string) => {
    const { events, currentEvent } = get();
    
    const updateEvent = (event: Event) => 
      event.id === eventId ? { ...event, currentParticipants: Math.max(0, event.currentParticipants - 1) } : event;

    set({
      events: events.map(updateEvent),
      currentEvent: currentEvent ? updateEvent(currentEvent) : null
    });
  },
})); 