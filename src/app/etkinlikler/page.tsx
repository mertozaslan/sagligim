'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { isAdmin } from '@/utils/auth';

interface Event {
  id: string;
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
  status: string;
  authorId: string;
  publishDate: string;
  image?: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>('Tümü');
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['Tümü', 'Meditasyon', 'Biyoenerji', 'Beslenme', 'Yoga', 'Stres Yönetimi', 'Spor'];
  const getUniqueOrganizers = () => {
    const uniqueOrganizers = [...new Set(events.map(event => event.organizer))];
    return ['Tümü', ...uniqueOrganizers.sort()];
  };

  useEffect(() => {
    loadEvents();
    setIsUserAdmin(isAdmin());
  }, []);

  const filterEvents = useCallback(() => {
    let filtered = events;
    
    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    if (selectedOrganizer !== 'Tümü') {
      filtered = filtered.filter(event => event.organizer === selectedOrganizer);
    }
    
    setFilteredEvents(filtered);
  }, [events, selectedCategory, selectedOrganizer]);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const loadEvents = async () => {
    try {
      const response = await fetch('/data/events.json');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Etkinlikler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (eventId: string) => {
    // Burada etkinliğe kayıt işlemi yapılacak
    alert(`Etkinlik ${eventId} için kayıt işlemi başlatıldı!`);
  };

  const getCategoryVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case 'meditasyon':
        return 'info';
      case 'biyoenerji':
        return 'success';
      case 'beslenme':
        return 'warning';
      case 'yoga':
        return 'primary';
      case 'stres yönetimi':
        return 'danger';
      case 'spor':
        return 'success';
      default:
        return 'default';
    }
  };

  const getOrganizerVariant = (organizer: string) => {
    if (organizer.includes('Bakanlığı')) return 'danger';
    if (organizer.includes('Belediyesi')) return 'primary';
    if (organizer.includes('Derneği')) return 'warning';
    return 'default';
  };

  if (!loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-300 h-96 rounded-xl"></div>
            ))}
          </div>
        </div> */}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with prominent create button */}
      <div className="mb-8">
        {/* Top section with create button */}
        {isUserAdmin && (
          <div className="flex justify-end mb-4">
            <Link href="/etkinlikler/olustur">
              <Button size="lg" className="shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Yeni Etkinlik Oluştur
              </Button>
            </Link>
          </div>
        )}
        
        {/* Title and description */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sağlık Etkinlikleri</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sağlık Bakanlığı, İBB ve diğer uzman kurumların düzenlediği 
            eğitici ve faydalı etkinliklere katılın. Sağlığınız için en doğru bilgileri alın.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Toplam Etkinlik</h3>
          <p className="text-3xl font-bold text-blue-600">{events.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aktif Etkinlik</h3>
          <p className="text-3xl font-bold text-green-600">
            {events.filter(e => e.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Toplam Katılımcı</h3>
          <p className="text-3xl font-bold text-purple-600">
            {events.reduce((total, event) => total + event.currentParticipants, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ücretsiz Etkinlik</h3>
          <p className="text-3xl font-bold text-orange-600">
            {events.filter(e => e.price === 0).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kategoriler</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-200 ${
                  selectedCategory === category
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <Badge
                  variant={category === 'Tümü' ? 'default' : getCategoryVariant(category)}
                  size="md"
                  className="cursor-pointer hover:scale-105"
                >
                  {category}
                  {category !== 'Tümü' && (
                    <span className="ml-1 opacity-75">
                      ({events.filter(e => e.category === category).length})
                    </span>
                  )}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Organizer Filter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizatörler</h3>
          <div className="flex flex-wrap gap-2">
            {getUniqueOrganizers().map((organizer) => (
              <button
                key={organizer}
                onClick={() => setSelectedOrganizer(organizer)}
                className={`transition-all duration-200 ${
                  selectedOrganizer === organizer
                    ? 'ring-2 ring-green-500'
                    : ''
                }`}
              >
                <Badge
                  variant={organizer === 'Tümü' ? 'default' : getOrganizerVariant(organizer)}
                  size="md"
                  className="cursor-pointer hover:scale-105"
                >
                  {organizer}
                  {organizer !== 'Tümü' && (
                    <span className="ml-1 opacity-75">
                      ({events.filter(e => e.organizer === organizer).length})
                    </span>
                  )}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRegister={handleRegister}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Etkinlik Bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory === 'Tümü' && selectedOrganizer === 'Tümü'
              ? 'Henüz hiç etkinlik eklenmemiş.'
              : selectedCategory !== 'Tümü' && selectedOrganizer !== 'Tümü'
              ? `${selectedCategory} kategorisinde ${selectedOrganizer} organizatöründe etkinlik bulunamadı.`
              : selectedCategory !== 'Tümü'
              ? `${selectedCategory} kategorisinde etkinlik bulunamadı.`
              : `${selectedOrganizer} organizatöründe etkinlik bulunamadı.`
            }
          </p>
          {(selectedCategory !== 'Tümü' || selectedOrganizer !== 'Tümü') && (
            <div className="space-x-2">
              {selectedCategory !== 'Tümü' && (
                <Button variant="outline" onClick={() => setSelectedCategory('Tümü')}>
                  Tüm Kategoriler
                </Button>
              )}
              {selectedOrganizer !== 'Tümü' && (
                <Button variant="outline" onClick={() => setSelectedOrganizer('Tümü')}>
                  Tüm Organizatörler
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage; 