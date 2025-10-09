'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import EventCard from '@/components/EventCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import Avatar from '@/components/ui/Avatar';
import { isAdmin } from '@/utils/auth';
import { useEventsStore } from '@/stores';
import type { Event, EventFilters } from '@/services/events';

// Event interface artık services'den import ediliyor

const EventsPage: React.FC = () => {
  // Zustand store
  const {
    events,
    loading,
    error,
    fetchEvents,
    registerForEvent,
    unregisterFromEvent
  } = useEventsStore();

  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [selectedOrganizer, setSelectedOrganizer] = useState<string>('Tümü');
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  const categories = ['Tümü', 'Meditasyon', 'Biyoenerji', 'Beslenme', 'Yoga', 'Stres Yönetimi', 'Spor'];
  const getUniqueOrganizers = () => {
    const uniqueOrganizers = [...new Set(events.map(event => event.organizer))];
    return ['Tümü', ...uniqueOrganizers.sort()];
  };

  useEffect(() => {
    // API'den etkinlikleri yükle
    fetchEvents({
      page: 1,
      limit: 50,
      sortBy: 'date',
      sortOrder: 'asc'
    });
    setIsUserAdmin(isAdmin());
  }, [fetchEvents]);

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

  const handleRegister = async (eventId: string) => {
    try {
      await registerForEvent(eventId);
      setToast({ message: 'Etkinliğe başarıyla kayıt oldunuz! 🎉', type: 'success' });
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      setToast({ message: error.message || 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.', type: 'error' });
    }
  };

  const handleUnregister = async (eventId: string) => {
    try {
      await unregisterFromEvent(eventId);
      setToast({ message: 'Etkinlik kaydınız başarıyla iptal edildi.', type: 'info' });
    } catch (error: any) {
      console.error('Kayıt iptal hatası:', error);
      setToast({ message: error.message || 'Kayıt iptal edilirken bir hata oluştu. Lütfen tekrar deneyin.', type: 'error' });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
              <div className="h-12 bg-white/60 rounded-2xl w-2/3 mx-auto mb-4 backdrop-blur-sm"></div>
              <div className="h-6 bg-white/40 rounded-xl w-1/2 mx-auto backdrop-blur-sm"></div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/30">
                  <div className="h-4 bg-gray-300 rounded-xl mb-3"></div>
                  <div className="h-8 bg-gray-400 rounded-xl w-3/4"></div>
                </div>
              ))}
            </div>
            
            {/* Filters Skeleton */}
            <div className="mb-8 space-y-6">
              <div className="h-6 bg-white/60 rounded-xl w-1/4 backdrop-blur-sm"></div>
              <div className="flex flex-wrap gap-3">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-8 bg-white/40 rounded-full w-20 backdrop-blur-sm"></div>
                ))}
              </div>
            </div>
            
            {/* Events Grid Skeleton */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/60 backdrop-blur-sm h-96 rounded-3xl border border-white/30 shadow-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTVlN2ViIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      

      
      {/* Motivational Hero Section - Integrated */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-16">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZG90cykiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-white space-y-6 lg:space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">🔥 Popüler Etkinlikler</span>
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 sm:mb-4">
                    <span className="block">Sağlıklı Yaşama</span>
                    <span className="block text-yellow-300">İlk Adımını At!</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-white/70 font-medium tracking-wider uppercase">Sağlık Hep ile etkinliklerde</p>
                </div>

                <p className="text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed max-w-lg">
                  Sağlık Bakanlığı, İBB, uzman doktorlar ve profesyonel sağlık kuruluşlarının düzenlediği 
                  <span className="font-semibold text-yellow-300"> ücretsiz etkinliklere</span> katıl. 
                  Güvenilir kaynaklardan doğru bilgileri al, yeni insanlarla tanış!
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link href="#etkinlikler">
                    <Button 
                      size="lg" 
                      className="bg-white !text-purple-600 hover:bg-gray-100 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl px-6 sm:px-8 w-full sm:w-auto"
                    >
                      <span className="mr-2">🎯</span>
                      Hemen Katıl
                    </Button>
                  </Link>
                  <Link href="/uzmanlar">
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl px-6 sm:px-8 w-full sm:w-auto"
                    >
                      <span className="mr-2">👨‍⚕️</span>
                      Uzmanları Gör
                    </Button>
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 lg:gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{events.length}+</div>
                    <div className="text-xs sm:text-sm text-white/80">Etkinlik</div>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-300">{events.filter(e => e.price === 0).length}</div>
                    <div className="text-xs sm:text-sm text-white/80">Ücretsiz</div>
                  </div>
                  <div className="w-px h-8 sm:h-12 bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-yellow-300">2.5K+</div>
                    <div className="text-xs sm:text-sm text-white/80">Katılımcı</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Event Previews */}
              <div className="relative hidden lg:block">
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {/* Featured Event 1 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <div className="w-full h-20 lg:h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mb-3 flex items-center justify-center">
                      <span className="text-2xl lg:text-3xl">🥗</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xs lg:text-sm mb-1">Sağlıklı Beslenme</h3>
                    <p className="text-xs text-gray-600 mb-2">Dr. Ayşe Kaya</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Ücretsiz</span>
                      <span className="text-xs text-gray-500">45 kişi</span>
                    </div>
                  </div>

                  {/* Featured Event 2 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300 mt-4 lg:mt-6">
                    <div className="w-full h-20 lg:h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl mb-3 flex items-center justify-center">
                      <span className="text-2xl lg:text-3xl">🧘‍♀️</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xs lg:text-sm mb-1">Meditasyon Temelleri</h3>
                    <p className="text-xs text-gray-600 mb-2">Uzm. Zeynep Ak</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Ücretsiz</span>
                      <span className="text-xs text-gray-500">67 kişi</span>
                    </div>
                  </div>

                  {/* Featured Event 3 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="w-full h-20 lg:h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl mb-3 flex items-center justify-center">
                      <span className="text-2xl lg:text-3xl">🏃‍♂️</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xs lg:text-sm mb-1">Spor ve Sağlık</h3>
                    <p className="text-xs text-gray-600 mb-2">Antrenör Mert B.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">Ücretsiz</span>
                      <span className="text-xs text-gray-500">89 kişi</span>
                    </div>
                  </div>

                  {/* Featured Event 4 */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 lg:p-4 shadow-xl transform -rotate-1 hover:rotate-0 transition-transform duration-300 mt-2 lg:mt-4">
                    <div className="w-full h-20 lg:h-24 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl mb-3 flex items-center justify-center">
                      <span className="text-2xl lg:text-3xl">😌</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-xs lg:text-sm mb-1">Stres Yönetimi</h3>
                    <p className="text-xs text-gray-600 mb-2">Psikolog Elif S.</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Ücretsiz</span>
                      <span className="text-xs text-gray-500">23 kişi</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-10 h-10 lg:w-12 lg:h-12 bg-yellow-400 rounded-full shadow-xl flex items-center justify-center text-lg lg:text-xl animate-bounce">
                  ⭐
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 lg:w-8 lg:h-8 bg-pink-400 rounded-full shadow-lg flex items-center justify-center text-xs lg:text-sm animate-pulse">
                  💖
                </div>
              </div>
            </div>
          </div>

          {/* Smooth Bottom Transition */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 sm:h-16 text-blue-50" viewBox="0 0 1440 120" fill="currentColor">
              <path d="M0,32L48,37.3C96,43,192,53,288,53.3C384,53,480,43,576,32C672,21,768,11,864,16C960,21,1056,43,1152,48C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">



        {/* Compact Filters */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Filter Label */}
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 lg:w-24 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                Filtreler:
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 flex-1">
                <span className="text-xs text-gray-500 lg:w-16 flex-shrink-0">Kategori:</span>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                    }`}
                  >
                    {category}
                    {category !== 'Tümü' && (
                      <span className="ml-1 opacity-75">
                        ({events.filter(e => e.category === category).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Organizer Pills */}
              <div className="flex flex-wrap gap-2 flex-1">
                <span className="text-xs text-gray-500 lg:w-20 flex-shrink-0">Organizatör:</span>
                {getUniqueOrganizers().map((organizer) => (
                  <button
                    key={organizer}
                    onClick={() => setSelectedOrganizer(organizer)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${
                      selectedOrganizer === organizer
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
                    }`}
                  >
                    {organizer.length > 20 ? organizer.substring(0, 20) + '...' : organizer}
                    {organizer !== 'Tümü' && (
                      <span className="ml-1 opacity-75">
                        ({events.filter(e => e.organizer === organizer).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Clear Filter & Results */}
              <div className="flex items-center gap-3 lg:flex-shrink-0">
                {(selectedCategory !== 'Tümü' || selectedOrganizer !== 'Tümü') && (
                  <>
                    <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {filteredEvents.length} sonuç
                    </span>
                    <button
                      onClick={() => {
                        setSelectedCategory('Tümü');
                        setSelectedOrganizer('Tümü');
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                    >
                      ✕ Temizle
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <div>
            {(selectedCategory !== 'Tümü' || selectedOrganizer !== 'Tümü') && (
              <div className="mb-4">
                <p className="text-gray-600">
                  {filteredEvents.length} etkinlik bulundu
                  {selectedCategory !== 'Tümü' && ` • ${selectedCategory}`}
                  {selectedOrganizer !== 'Tümü' && ` • ${selectedOrganizer}`}
                </p>
              </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <div
                  key={event._id}
                  className="group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full"
                >
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Event Image */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
                      {/* Etkinlik resmi varsa göster, yoksa emoji/gradient */}
                      {event.image ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${event.image}`}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        /* Dummy Images based on category */
                        <div className="absolute inset-0">
                          {event.category === 'Meditasyon' && (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500 flex items-center justify-center">
                              <div className="text-6xl text-white/80">🧘‍♀️</div>
                            </div>
                          )}
                          {event.category === 'Beslenme' && (
                            <div className="w-full h-full bg-gradient-to-br from-green-400 via-emerald-400 to-teal-500 flex items-center justify-center">
                              <div className="text-6xl text-white/80">🥗</div>
                            </div>
                          )}
                          {event.category === 'Yoga' && (
                            <div className="w-full h-full bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 flex items-center justify-center">
                              <div className="text-6xl text-white/80">🧘‍♂️</div>
                            </div>
                          )}
                          {event.category === 'Spor' && (
                            <div className="w-full h-full bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-500 flex items-center justify-center">
                              <div className="text-6xl text-white/80">🏃‍♂️</div>
                            </div>
                          )}
                          {event.category === 'Stres Yönetimi' && (
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-cyan-400 to-teal-500 flex items-center justify-center">
                              <div className="text-6xl text-white/80">😌</div>
                            </div>
                          )}
                          {event.category === 'Biyoenerji' && (
                            <div className="w-full h-full bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-500 flex items-center justify-center">
                              <div className="text-6xl text-white/80">⚡</div>
                            </div>
                          )}
                          {!['Meditasyon', 'Beslenme', 'Yoga', 'Spor', 'Stres Yönetimi', 'Biyoenerji'].includes(event.category) && (
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 via-slate-400 to-gray-500 flex items-center justify-center">
                              <div className="text-6xl text-white/80">🎯</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Overlay Pattern */}
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90cyIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPjwvc3ZnPg==')] opacity-30"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30`}>
                          {event.category}
                        </span>
                      </div>
                      
                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          event.price === 0 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white/90 text-gray-800'
                        }`}>
                          {event.price === 0 ? 'ÜCRETSİZ' : `${event.price} ₺`}
                        </span>
                      </div>

                      {/* Popular Badge for first 3 */}
                      {index < 3 && (
                        <div className="absolute bottom-4 right-4">
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                            🔥 Popüler
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Title */}
                      <Link href={`/events/${event._id}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                          {event.title}
                        </h3>
                      </Link>

                      {/* Author/Organizer Info */}
                      <div className="flex items-center gap-3 mb-4">
                        {event.author ? (
                          <>
                            <Avatar
                              src={event.author.profilePicture 
                                ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${event.author.profilePicture}`
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(event.author.firstName + ' ' + event.author.lastName)}&background=3b82f6&color=fff`}
                              alt={`${event.author.firstName} ${event.author.lastName}`}
                              size="md"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {event.author.firstName} {event.author.lastName}
                              </p>
                              <p className="text-xs text-gray-500">@{event.author.username}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {event.instructor.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{event.instructor}</p>
                              <p className="text-xs text-gray-500">{event.instructorTitle}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      <Link href={`/events/${event._id}`}>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-1 cursor-pointer">
                          {event.description}
                        </p>
                      </Link>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">
                            {new Date(event.date).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {event.isOnline ? (
                            <>
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                              </svg>
                              <span className="font-medium text-green-600">Online Etkinlik</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium truncate">{event.location}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">
                            {event.currentParticipants}/{event.maxParticipants} katılımcı
                          </span>
                          {event.maxParticipants - event.currentParticipants <= 5 && event.maxParticipants - event.currentParticipants > 0 && (
                            <span className="text-orange-500 font-semibold">• Son {event.maxParticipants - event.currentParticipants} yer!</span>
                          )}
                        </div>
                      </div>

                      {/* Organizer */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xs text-gray-500">Organizatör:</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium truncate ${
                          event.organizer.includes('Bakanlığı') 
                            ? 'bg-red-100 text-red-700'
                            : event.organizer.includes('Belediyesi')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {event.organizer}
                        </span>
                      </div>

                      {/* Register Button - Always at bottom */}
                      <div className="mt-auto flex gap-2">
                        <Link href={`/events/${event._id}`} className="flex-1">
                          <button className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200">
                            Detayları Gör
                          </button>
                        </Link>
                        {event.isRegistered ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnregister(event._id);
                            }}
                            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl"
                          >
                            Kaydı İptal Et
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegister(event._id);
                            }}
                            disabled={event.currentParticipants >= event.maxParticipants}
                            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                              event.currentParticipants >= event.maxParticipants
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {event.currentParticipants >= event.maxParticipants 
                              ? 'Kontenjan Dolu' 
                              : 'Hemen Katıl'
                            }
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
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
    </div>
  );
};

export default EventsPage; 