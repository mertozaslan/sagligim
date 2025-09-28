import { api, handleApiError } from '../lib/axios';

// Event interfaces
export interface EventAuthor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorTitle: string;
  date: string;
  endDate: string;
  location: string;
  locationAddress: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  isOnline: boolean;
  organizer: string;
  organizerType: string;
  tags: string[];
  requirements: string;
  publishDate: string;
  status: 'pending' | 'active' | 'full' | 'completed' | 'cancelled' | 'rejected';
  authorId: string;
  author?: EventAuthor;
  image?: string;
  isRegistered?: boolean;
  canRegister?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorTitle: string;
  date: string;
  endDate: string;
  location: string;
  locationAddress: string;
  maxParticipants: number;
  price: number;
  isOnline: boolean;
  organizer: string;
  organizerType: string;
  tags: string[];
  requirements: string;
  image?: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  category?: string;
  instructor?: string;
  instructorTitle?: string;
  date?: string;
  endDate?: string;
  location?: string;
  locationAddress?: string;
  maxParticipants?: number;
  price?: number;
  isOnline?: boolean;
  organizer?: string;
  organizerType?: string;
  tags?: string[];
  requirements?: string;
  image?: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  isOnline?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EventPagination {
  currentPage: number;
  totalPages: number;
  totalEvents: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EventsResponse {
  events: Event[];
  pagination: EventPagination;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  pendingEvents: number;
  completedEvents: number;
  totalParticipants: number;
  averageParticipants: number;
  categoryStats: Array<{
    category: string;
    count: number;
    totalParticipants: number;
  }>;
  organizerStats: Array<{
    organizerType: string;
    count: number;
    totalParticipants: number;
  }>;
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  registrationDate: string;
  notes?: string;
  status: 'confirmed' | 'pending';
}

export interface EventParticipant {
  _id: string;
  user: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  registrationDate: string;
  status: 'confirmed' | 'pending';
  notes?: string;
}

export interface EventParticipantsResponse {
  participants: EventParticipant[];
  pagination: EventPagination;
}

export interface EventApprovalData {
  action: 'approve' | 'reject';
  reason?: string;
}

export interface EventReportData {
  reason: 'spam' | 'inappropriate' | 'false_information' | 'other';
  description?: string;
}

// Events service
export const eventsService = {
  // Create event
  async createEvent(eventData: CreateEventData): Promise<Event> {
    try {
      console.log('Events Service: Creating event with data:', eventData);
      const response = await api.post<Event>('/api/events', eventData);
      console.log('Events Service: Created event response:', response);
      return response;
    } catch (error: any) {
      console.error('Events Service: Error creating event:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Get all events
  async getEvents(filters?: EventFilters): Promise<EventsResponse> {
    try {
      console.log('Events Service: Getting events with filters:', filters);
      const response = await api.get<EventsResponse>('/api/events', { params: filters });
      console.log('Events Service: Events response:', response);
      return response;
    } catch (error: any) {
      console.error('Events Service: Error getting events:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Search events
  async searchEvents(searchTerm: string, filters?: EventFilters): Promise<EventsResponse> {
    try {
      console.log('Events Service: Searching events with term:', searchTerm, 'filters:', filters);
      const response = await api.get<EventsResponse>('/api/events/search', { 
        params: { q: searchTerm, ...filters } 
      });
      console.log('Events Service: Search response:', response);
      return response;
    } catch (error: any) {
      console.error('Events Service: Error searching events:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Get event stats (admin only)
  async getEventStats(): Promise<EventStats> {
    try {
      console.log('Events Service: Getting event stats');
      const response = await api.get<{ stats: EventStats }>('/api/events/stats');
      console.log('Events Service: Stats response:', response);
      return response.stats;
    } catch (error: any) {
      console.error('Events Service: Error getting event stats:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Get user events
  async getUserEvents(filters?: EventFilters): Promise<EventsResponse> {
    try {
      console.log('Events Service: Getting user events with filters:', filters);
      const response = await api.get<EventsResponse>('/api/events/my-events', { params: filters });
      console.log('Events Service: User events response:', response);
      return response;
    } catch (error: any) {
      console.error('Events Service: Error getting user events:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Get event by ID
  async getEventById(eventId: string): Promise<Event> {
    try {
      console.log('Events Service: Getting event by ID:', eventId);
      const response = await api.get<{ event: Event }>(`/api/events/${eventId}`);
      console.log('Events Service: Event response:', response);
      return response.event;
    } catch (error: any) {
      console.error('Events Service: Error getting event by ID:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Update event
  async updateEvent(eventId: string, eventData: UpdateEventData): Promise<Event> {
    try {
      console.log('Events Service: Updating event:', eventId, 'with data:', eventData);
      const response = await api.put<{ event: Event }>(`/api/events/${eventId}`, eventData);
      console.log('Events Service: Updated event response:', response);
      return response.event;
    } catch (error: any) {
      console.error('Events Service: Error updating event:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Delete event
  async deleteEvent(eventId: string): Promise<void> {
    try {
      console.log('Events Service: Deleting event:', eventId);
      await api.delete(`/api/events/${eventId}`);
      console.log('Events Service: Event deleted successfully');
    } catch (error: any) {
      console.error('Events Service: Error deleting event:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Register for event
  async registerForEvent(eventId: string, registrationData?: { notes?: string }): Promise<{ registration: EventRegistration; event: Event }> {
    try {
      console.log('Events Service: Registering for event:', eventId, 'with data:', registrationData);
      const response = await api.post<{ registration: EventRegistration; event: Event }>(`/api/events/${eventId}/register`, registrationData);
      console.log('Events Service: Registration response:', response);
      return response;
    } catch (error: any) {
      console.error('Events Service: Error registering for event:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Unregister from event
  async unregisterFromEvent(eventId: string): Promise<{ event: Event }> {
    try {
      console.log('Events Service: Unregistering from event:', eventId);
      const response = await api.delete<{ event: Event }>(`/api/events/${eventId}/unregister`);
      console.log('Events Service: Unregistration response:', response);
      return response;
    } catch (error: any) {
      console.error('Events Service: Error unregistering from event:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Get event participants
  async getEventParticipants(eventId: string, filters?: EventFilters): Promise<EventParticipantsResponse> {
    try {
      console.log('Events Service: Getting event participants:', eventId, 'with filters:', filters);
      const response = await api.get<EventParticipantsResponse>(`/api/events/${eventId}/participants`, { params: filters });
      console.log('Events Service: Participants response:', response);
      return response;
    } catch (error: any) {
      console.error('Events Service: Error getting event participants:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Approve/reject event (admin only)
  async approveEvent(eventId: string, approvalData: EventApprovalData): Promise<Event> {
    try {
      console.log('Events Service: Approving/rejecting event:', eventId, 'with data:', approvalData);
      const response = await api.put<{ event: Event }>(`/api/events/${eventId}/approve`, approvalData);
      console.log('Events Service: Approval response:', response);
      return response.event;
    } catch (error: any) {
      console.error('Events Service: Error approving/rejecting event:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Report event
  async reportEvent(eventId: string, reportData: EventReportData): Promise<void> {
    try {
      console.log('Events Service: Reporting event:', eventId, 'with data:', reportData);
      await api.post(`/api/events/${eventId}/report`, reportData);
      console.log('Events Service: Event reported successfully');
    } catch (error: any) {
      console.error('Events Service: Error reporting event:', error);
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  }
};
