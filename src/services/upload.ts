// Upload API servisleri
import { api, handleApiError } from '@/lib/axios';

export interface UploadSingleResponse {
  message: string;
  imageUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadedImage {
  imageUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadMultipleResponse {
  message: string;
  images: UploadedImage[];
}

export interface DeleteImageResponse {
  message: string;
  fileName: string;
}

export const uploadService = {
  // Tek resim yükleme
  async uploadSingle(file: File): Promise<UploadSingleResponse> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post<UploadSingleResponse>('/api/upload/single', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Çoklu resim yükleme (max 10)
  async uploadMultiple(files: File[]): Promise<UploadMultipleResponse> {
    try {
      if (files.length > 10) {
        throw new Error('En fazla 10 resim yükleyebilirsiniz');
      }

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });

      const response = await api.post<UploadMultipleResponse>('/api/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Resim silme
  async deleteImage(fileName: string): Promise<DeleteImageResponse> {
    try {
      const response = await api.delete<DeleteImageResponse>(`/api/upload/${fileName}`);
      return response;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  // Dosya validasyonu
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: 'Geçersiz dosya tipi. Sadece JPEG, PNG, GIF ve WEBP formatları desteklenir.' 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: 'Dosya boyutu 5MB\'dan büyük olamaz.' 
      };
    }

    return { valid: true };
  },

  // Çoklu dosya validasyonu
  validateFiles(files: File[]): { valid: boolean; error?: string } {
    if (files.length > 10) {
      return { 
        valid: false, 
        error: 'En fazla 10 resim yükleyebilirsiniz.' 
      };
    }

    for (const file of files) {
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return validation;
      }
    }

    return { valid: true };
  }
};

