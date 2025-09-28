import apiClient from '@/lib/axios';

export interface DoctorInfo {
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  approvedBy?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  location: string;
  specialization: string;
  hospital: string;
  experience: number;
}

export interface Expert {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'doctor';
  profilePicture?: string;
  bio?: string;
  dateOfBirth: string;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: string;
  doctorInfo: DoctorInfo;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ExpertsResponse {
  experts: Expert[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalExperts: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    totalExperts: number;
    specializationStats: Array<{
      specialization: string;
      count: number;
      avgExperience: number;
    }>;
    locationStats: Array<{
      location: string;
      count: number;
    }>;
  };
  filters: {
    specialization?: string;
    location?: string;
    hospital?: string;
    search?: string;
  };
}

export interface ExpertsQueryParams {
  page?: number;
  limit?: number;
  specialization?: string;
  location?: string;
  hospital?: string;
  search?: string;
}

class ExpertsService {
  /**
   * Tüm uzmanları getir
   */
  async getExperts(params: ExpertsQueryParams = {}): Promise<ExpertsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.specialization) queryParams.append('specialization', params.specialization);
    if (params.location) queryParams.append('location', params.location);
    if (params.hospital) queryParams.append('hospital', params.hospital);
    if (params.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`/api/users/experts?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Belirli bir uzmanı ID ile getir
   */
  async getExpertById(id: string): Promise<Expert> {
    const response = await apiClient.get(`/api/users/experts/${id}`);
    return response.data;
  }

  /**
   * Uzmanlık alanlarını getir
   */
  async getSpecializations(): Promise<string[]> {
    const response = await apiClient.get('/api/users/experts/specializations');
    return response.data;
  }

  /**
   * Lokasyonları getir
   */
  async getLocations(): Promise<string[]> {
    const response = await apiClient.get('/api/users/experts/locations');
    return response.data;
  }

  /**
   * Hastaneleri getir
   */
  async getHospitals(): Promise<string[]> {
    const response = await apiClient.get('/api/users/experts/hospitals');
    return response.data;
  }

  /**
   * Uzman istatistiklerini getir
   */
  async getExpertStats(): Promise<{
    totalExperts: number;
    specializationStats: Array<{
      specialization: string;
      count: number;
      avgExperience: number;
    }>;
    locationStats: Array<{
      location: string;
      count: number;
    }>;
  }> {
    const response = await apiClient.get('/api/users/experts/stats');
    return response.data;
  }
}

export const expertsService = new ExpertsService();
