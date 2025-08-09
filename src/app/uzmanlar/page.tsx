'use client';

import React, { useState, useEffect } from 'react';
import UserCard from '@/components/UserCard';
import Button from '@/components/ui/Button';

interface Expert {
  id: string;
  username: string;
  name: string;
  avatar: string;
  specialty: string;
  title: string;
  city: string;
  shortBio: string;
  followersCount: number;
  rating: number;
  experience: number;
  verified: boolean;
}

export default function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rating');

  useEffect(() => {
    const loadExperts = async () => {
      try {
        const response = await fetch('/data/experts.json');
        const data = await response.json();
        setExperts(data);
      } catch (error) {
        console.error('Uzman verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExperts();
  }, []);

  // Filtreler
  const specialties = Array.from(new Set(experts.map(expert => expert.specialty)));
  const cities = Array.from(new Set(experts.map(expert => expert.city)));

  // Filtrelenmiş ve sıralanmış uzmanlar
  const filteredExperts = experts
    .filter(expert => {
      const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expert.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = !selectedSpecialty || expert.specialty === selectedSpecialty;
      const matchesCity = !selectedCity || expert.city === selectedCity;
      
      return matchesSearch && matchesSpecialty && matchesCity;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'followers':
          return b.followersCount - a.followersCount;
        case 'name':
          return a.name.localeCompare(b.name, 'tr');
        default:
          return 0;
      }
    });

  const handleFollow = (expertId: string) => {
    setExperts(prevExperts =>
      prevExperts.map(expert =>
        expert.id === expertId
          ? { ...expert, followersCount: expert.followersCount + 1 }
          : expert
      )
    );
  };

  const handleMessage = (expertId: string) => {
    // Mesaj gönderme işlevi (dummy)
    alert(`${experts.find(e => e.id === expertId)?.name} ile mesajlaşma başlatıldı!`);
  };

  if (loading) {
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

            {/* Şehir Filtresi */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Şehir</label>
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none bg-white"
                >
                  <option value="">Tüm Şehirler</option>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sıralama */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sırala</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 appearance-none bg-white"
                >
                  <option value="rating">Puana Göre</option>
                  <option value="experience">Deneyime Göre</option>
                  <option value="followers">Takipçiye Göre</option>
                  <option value="name">İsme Göre</option>
                </select>
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Reset Butonu */}
            <div className="lg:col-span-1 flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setSelectedCity('');
                  setSortBy('rating');
                }}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {filteredExperts.length > 0 ? 'Uzman Sonuçları' : 'Sonuç Bulunamadı'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{filteredExperts.length} uzman bulundu</span>
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
                {selectedCity && (
                  <div className="flex items-center">
                    <span className="mx-2">•</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      {selectedCity}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {filteredExperts.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                <span>Sıralama: {
                  sortBy === 'rating' ? 'Puan' :
                  sortBy === 'experience' ? 'Deneyim' :
                  sortBy === 'followers' ? 'Takipçi' : 'İsim'
                }</span>
              </div>
            )}
          </div>

          {/* Uzman Kartları */}
          {filteredExperts.length === 0 ? (
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
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSpecialty('');
                      setSelectedCity('');
                      setSortBy('rating');
                    }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperts.map((expert) => (
                <div key={expert.id} className="transform transition-transform duration-200 hover:scale-105">
                  <UserCard
                    user={expert}
                    onFollow={() => handleFollow(expert.id)}
                    onMessage={() => handleMessage(expert.id)}
                  />
                </div>
              ))}
            </div>
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
                Sağlığım platformuna katılın ve binlerce kişiye ulaşın. 
                Bilginizi paylaşın, sorulara cevap verin ve kariyerinizi büyütün.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Button 
                  size="lg" 
                  className="bg-white !text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Uzman Başvurusu Yap
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
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
    </div>
  );
} 