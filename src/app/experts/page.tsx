'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import UserCard from '@/components/UserCard';
import Button from '@/components/ui/Button';
import ExpertInfoModal from '@/components/ExpertInfoModal';
import { useExpertsStore } from '@/stores/expertsStore';

export default function ExpertsPage() {
  const {
    experts,
    pagination,
    stats,
    isLoading,
    isLoadingMore,
    error,
    fetchExperts,
    loadMoreExperts,
    updateFilters,
    clearFilters
  } = useExpertsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Arama ve filtreler değiştiğinde debounce ile API çağrısı yap
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters({
        search: searchTerm || undefined,
        specialization: selectedSpecialty || undefined,
        location: selectedLocation || undefined,
        hospital: selectedHospital || undefined,
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSpecialty, selectedLocation, selectedHospital]);

  // Filtreler için seçenekler
  const specialties = stats?.specializationStats.map(s => s.specialization) || [];
  const locations = stats?.locationStats.map(l => l.location) || [];


  const handleLoadMore = () => {
    loadMoreExperts();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLocation('');
    setSelectedHospital('');
    clearFilters();
  };

  if (isLoading && experts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Uzmanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
 

      {/* Filters Section */}
      <section className="bg-white shadow-sm border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Uzman Ara ve Filtrele</h2>
            <p className="text-sm text-gray-600">Aradığınız sağlık uzmanını bulmak için filtreleri kullanın</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Arama */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Arama</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Uzman adı veya uzmanlık alanı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Uzmanlık Filtresi */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanı</label>
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none bg-white"
                >
                  <option value="">Tüm Uzmanlıklar</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Lokasyon Filtresi */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lokasyon</label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none bg-white"
                >
                  <option value="">Tüm Lokasyonlar</option>
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Hastane Filtresi */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hastane</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Hastane ara..."
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Reset Butonu */}
            <div className="lg:col-span-1 flex items-end">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="w-full h-12"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sıfırla
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sonuç Başlığı ve Sayısı */}
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {experts.length > 0 ? 'Uzman Sonuçları' : 'Sonuç Bulunamadı'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{pagination?.totalExperts || experts.length} uzman bulundu</span>
                {searchTerm && (
                  <div className="flex items-center">
                    <span className="mx-2">•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      &ldquo;{searchTerm}&rdquo;
                    </span>
                  </div>
                )}
                {selectedSpecialty && (
                  <div className="flex items-center">
                    <span className="mx-2">•</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {selectedSpecialty}
                    </span>
                  </div>
                )}
                {selectedLocation && (
                  <div className="flex items-center">
                    <span className="mx-2">•</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {selectedLocation}
                    </span>
                  </div>
                )}
                {selectedHospital && (
                  <div className="flex items-center">
                    <span className="mx-2">•</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      {selectedHospital}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {pagination && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Sayfa {pagination.currentPage} / {pagination.totalPages}</span>
              </div>
            )}
          </div>

          {/* Uzman Kartları */}
          {experts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Uzman Bulunamadı</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Arama kriterlerinize uygun uzman bulunamadı. 
                  <br />
                  Lütfen filtreleri değiştirip tekrar deneyin.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleResetFilters}
                    className="flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Tüm Uzmanları Görüntüle
                  </Button>
                  <Button variant="outline">
                    Uzman Öner
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {experts.map((expert) => (
                  <div key={expert._id} className="transform transition-transform duration-200 hover:scale-105">
                  <UserCard
                    user={{
                      id: expert._id,
                      username: expert.username,
                      name: `Dr. ${expert.firstName} ${expert.lastName}`,
                      avatar: expert.profilePicture 
                        ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${expert.profilePicture}`
                        : '/default-avatar.png',
                      specialty: expert.doctorInfo.specialization,
                      title: expert.doctorInfo.specialization,
                      city: expert.doctorInfo.location,
                      shortBio: expert.bio || `${expert.doctorInfo.specialization} uzmanı`,
                      followersCount: 0, // API'de yok, placeholder
                      rating: 0, // API'de yok, placeholder
                      experience: expert.doctorInfo.experience,
                      verified: expert.isVerified && expert.doctorInfo.approvalStatus === 'approved'
                    }}
                  />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {pagination?.hasNext && (
                <div className="mt-12 text-center">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    variant="outline"
                    size="lg"
                    className="px-8"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Yükleniyor...
                      </>
                    ) : (
                      'Daha Fazla Uzman Yükle'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Uzman Ol
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Siz de Sağlık Uzmanı 
                <span className="text-blue-200"> mısınız?</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Sağlık Hep platformuna katılın ve binlerce kişiye ulaşın. 
                Bilginizi paylaşın, sorulara cevap verin ve kariyerinizi büyütün.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link href="/register?role=doctor">
                  <Button 
                    size="lg" 
                    className="bg-white !text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Uzman Başvurusu Yap
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsInfoModalOpen(true)}
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Daha Fazla Bilgi
                </Button>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="border border-white border-opacity-30 rounded-xl p-6" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)'}}>
                    <div className="text-2xl font-bold mb-2" style={{color: 'white'}}>500+</div>
                    <div className="text-sm" style={{color: '#bfdbfe'}}>Aktif Uzman</div>
                  </div>
                  <div className="border border-white border-opacity-30 rounded-xl p-6" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)'}}>
                    <div className="text-2xl font-bold mb-2" style={{color: 'white'}}>24/7</div>
                    <div className="text-sm" style={{color: '#bfdbfe'}}>Destek</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="border border-white border-opacity-30 rounded-xl p-6" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)'}}>
                    <div className="text-2xl font-bold mb-2" style={{color: 'white'}}>10K+</div>
                    <div className="text-sm" style={{color: '#bfdbfe'}}>Hasta</div>
                  </div>
                  <div className="border border-white border-opacity-30 rounded-xl p-6" style={{backgroundColor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)'}}>
                    <div className="text-2xl font-bold mb-2" style={{color: 'white'}}>4.8★</div>
                    <div className="text-sm" style={{color: '#bfdbfe'}}>Değerlendirme</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white opacity-10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white opacity-10 transform -translate-x-24 translate-y-24"></div>
      </section>

      {/* Expert Info Modal */}
      <ExpertInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
    </div>
  );
} 