'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { isAdmin } from '@/utils/auth';

interface EventFormData {
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
}

const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    category: 'Meditasyon',
    instructor: '',
    instructorTitle: '',
    date: '',
    endDate: '',
    location: '',
    locationAddress: '',
    maxParticipants: 20,
    price: 0,
    isOnline: false,
    organizer: 'Sağlığım Platform',
    organizerType: 'platform',
    tags: [],
    requirements: '',
  });

  const categories = [
    'Meditasyon',
    'Biyoenerji',
    'Beslenme',
    'Yoga',
    'Stres Yönetimi',
    'Fizyoterapi',
    'Psikoloji',
    'Doğal Tedavi',
    'Spor'
  ];

  const organizerOptions = [
    { value: 'Sağlığım Platform', type: 'platform', label: 'Sağlığım Platform' },
    { value: 'Sağlık Bakanlığı', type: 'government', label: 'Sağlık Bakanlığı' },
    { value: 'İstanbul Büyükşehir Belediyesi', type: 'municipal', label: 'İstanbul Büyükşehir Belediyesi' },
    { value: 'Ankara Büyükşehir Belediyesi', type: 'municipal', label: 'Ankara Büyükşehir Belediyesi' },
    { value: 'Türk Diyetisyenler Derneği', type: 'professional', label: 'Türk Diyetisyenler Derneği' },
    { value: 'Türk Psikiyatri Derneği', type: 'professional', label: 'Türk Psikiyatri Derneği' },
    { value: 'Holistik Sağlık Derneği', type: 'ngo', label: 'Holistik Sağlık Derneği' },
    { value: 'Yoga Federasyonu', type: 'professional', label: 'Yoga Federasyonu' }
  ];

  useEffect(() => {
    const adminStatus = isAdmin();
    setIsUserAdmin(adminStatus);
    setLoading(false);

    if (!adminStatus) {
      router.push('/etkinlikler');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleOrganizerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = organizerOptions.find(option => option.value === e.target.value);
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        organizer: selectedOption.value,
        organizerType: selectedOption.type
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = (): boolean => {
    const required = ['title', 'description', 'instructor', 'instructorTitle', 'date', 'location'];
    return required.every(field => formData[field as keyof EventFormData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (new Date(formData.date) <= new Date()) {
      alert('Etkinlik tarihi gelecekte olmalıdır.');
      return;
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.date)) {
      alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      return;
    }

    setSubmitting(true);

    try {
      // Yeni etkinlik ID'si oluştur
      const newEventId = Date.now().toString();
      
      const newEvent = {
        id: newEventId,
        ...formData,
        currentParticipants: 0,
        status: 'active',
        authorId: 'admin', // Gerçek uygulamada kullanıcı ID'si kullanılır
        publishDate: new Date().toISOString(),
        image: `event-${newEventId}.jpg`
      };

      // Bu gerçek uygulamada API'ye gönderilir
      console.log('Yeni etkinlik oluşturuldu:', newEvent);
      
      // Başarı mesajı göster
      alert('Etkinlik başarıyla oluşturuldu!');
      
      // Etkinlikler sayfasına yönlendir
      router.push('/etkinlikler');
      
    } catch (error) {
      console.error('Etkinlik oluşturulurken hata:', error);
      alert('Etkinlik oluşturulurken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isUserAdmin) {
    return null; // Redirect edildiği için içerik gösterilmez
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Yeni Etkinlik Oluştur</h1>
        <p className="text-gray-600">
          Sağlık ve wellness alanında yeni bir etkinlik oluşturun
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Temel Bilgiler</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Başlığı *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Mindfulness Meditasyon Atölyesi"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Etkinliğin detaylı açıklaması..."
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-2">
                Organizatör *
              </label>
              <select
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleOrganizerChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {organizerOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (₺)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Eğitmen Bilgileri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-2">
                Eğitmen Adı *
              </label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Dr. Ayşe Kaya"
                required
              />
            </div>

            <div>
              <label htmlFor="instructorTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Eğitmen Unvanı *
              </label>
              <input
                type="text"
                id="instructorTitle"
                name="instructorTitle"
                value={formData.instructorTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: Klinik Psikolog"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tarih ve Yer</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Başlangıç Tarihi ve Saati *
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Bitiş Tarihi ve Saati
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="isOnline"
                  name="isOnline"
                  checked={formData.isOnline}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isOnline" className="ml-2 block text-sm text-gray-700">
                  Online etkinlik
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Maksimum Katılımcı Sayısı
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="1"
                max="500"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Etkinlik Yeri *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formData.isOnline ? "Zoom, Google Meet vb." : "Merkez adı"}
                required
              />
            </div>

            <div>
              <label htmlFor="locationAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Adres Detayı
              </label>
              <input
                type="text"
                id="locationAddress"
                name="locationAddress"
                value={formData.locationAddress}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={formData.isOnline ? "Bağlantı linki bilgisi" : "Tam adres"}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ek Bilgiler</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Gereksinimler
              </label>
              <textarea
                id="requirements"
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Katılımcıların getirmesi gerekenler, ön koşullar vb."
              />
            </div>

            <div>
              <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-2">
                Etiketler
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  id="tagInput"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Etiket ekle ve Enter'a bas"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Ekle
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center">
                    <Badge variant="default" size="sm" className="mr-1">
                      {tag}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/etkinlikler')}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={submitting || !validateForm()}
          >
            {submitting ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventPage; 