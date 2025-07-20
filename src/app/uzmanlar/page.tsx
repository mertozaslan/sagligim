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

  // Filtrelenmiş uzmanlar
  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || expert.specialty === selectedSpecialty;
    const matchesCity = !selectedCity || expert.city === selectedCity;
    
    return matchesSearch && matchesSpecialty && matchesCity;
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

  if (!loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {/* <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Uzmanlar yükleniyor...</p>
        </div> */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sağlık Uzmanları
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Alanında uzman doktorlar, diyetisyenler, fizyoterapistler ve diğer sağlık profesyonellerini keşfedin.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Arama */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Uzman adı veya uzmanlık alanı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Uzmanlık Filtresi */}
            <div className="lg:w-64">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Uzmanlıklar</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Şehir Filtresi */}
            <div className="lg:w-48">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Butonu */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('');
                setSelectedCity('');
              }}
            >
              Temizle
            </Button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sonuç Sayısı */}
          <div className="mb-6">
            <p className="text-gray-600">
              {filteredExperts.length} uzman bulundu
              {searchTerm && ` "${searchTerm}" için`}
              {selectedSpecialty && ` ${selectedSpecialty} alanında`}
              {selectedCity && ` ${selectedCity} şehrinde`}
            </p>
          </div>

          {/* Uzman Kartları */}
          {filteredExperts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Uzman bulunamadı</h3>
              <p className="text-gray-600 mb-4">
                Arama kriterlerinize uygun uzman bulunamadı. Lütfen filtreleri değiştirip tekrar deneyin.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('');
                  setSelectedCity('');
                }}
              >
                Tüm Uzmanları Görüntüle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperts.map((expert) => (
                <UserCard
                  key={expert.id}
                  user={expert}
                  onFollow={() => handleFollow(expert.id)}
                  onMessage={() => handleMessage(expert.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Siz de Uzman mısınız?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Sağlığım platformuna katılın ve binlerce kişiye ulaşın. Bilginizi paylaşın, sorulara cevap verin ve kariyerinizi büyütün.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              Uzman Başvurusu Yap
            </Button>
            <Button variant="outline" size="lg">
              Daha Fazla Bilgi
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 