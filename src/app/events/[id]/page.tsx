'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { OptimizedImage, getImageUrl } from '@/utils/imageUtils';
import ShareModal from '@/components/ShareModal';
import { useEventsStore } from '@/stores';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const {
    currentEvent,
    loading,
    error,
    fetchEvent,
    registerForEvent,
    unregisterFromEvent
  } = useEventsStore();

  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    if (eventId && eventId !== 'undefined') {
      fetchEvent(eventId);
    }
  }, [eventId, fetchEvent]);

  const handleRegister = async () => {
    if (!currentEvent) return;
    
    try {
      await registerForEvent(currentEvent._id);
      setToast({ message: 'Etkinliğe başarıyla kayıt oldunuz! 🎉', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.message || 'Kayıt olurken bir hata oluştu.', type: 'error' });
    }
  };

  const handleUnregister = async () => {
    if (!currentEvent) return;
    
    try {
      await unregisterFromEvent(currentEvent._id);
      setToast({ message: 'Etkinlik kaydınız iptal edildi.', type: 'info' });
    } catch (error: any) {
      setToast({ message: error.message || 'Kayıt iptal edilirken bir hata oluştu.', type: 'error' });
    }
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Etkinlik yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Etkinlik Bulunamadı</h2>
          <p className="text-gray-600 mb-6">{error || 'Aradığınız etkinlik bulunamadı.'}</p>
          <Button onClick={() => router.push('/events')} className="bg-blue-600 text-white">
            Etkinliklere Dön
          </Button>
        </div>
      </div>
    );
  }

  const event = currentEvent;
  const author = event.author;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event._id}`}
          title={event.title}
          description={event.description.substring(0, 200)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/events">
            <Button variant="outline" size="sm" className="rounded-xl">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Etkinliklere Dön
            </Button>
          </Link>
        </div>

        {/* Main Event Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          {/* Event Image */}
          {event.image ? (
            <div className="relative h-96">
              <OptimizedImage
                src={getImageUrl(event.image)}
                alt={event.title}
                fill
                className="object-cover"
                priority={true}
                loading="eager"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Category Badge */}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30">
                  {event.category}
                </span>
              </div>
              
              {/* Price Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  event.price === 0 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/90 text-gray-800'
                }`}>
                  {event.price === 0 ? 'ÜCRETSİZ' : `${event.price} ₺`}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-8xl text-white/80">
                {event.category === 'Meditasyon' ? '🧘‍♀️' :
                 event.category === 'Beslenme' ? '🥗' :
                 event.category === 'Yoga' ? '🧘‍♂️' :
                 event.category === 'Spor' ? '🏃‍♂️' :
                 event.category === 'Stres Yönetimi' ? '😌' :
                 event.category === 'Biyoenerji' ? '⚡' :
                 '🎯'}
              </div>
              
              {/* Category & Price Badges */}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30">
                  {event.category}
                </span>
              </div>
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  event.price === 0 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/90 text-gray-800'
                }`}>
                  {event.price === 0 ? 'ÜCRETSİZ' : `${event.price} ₺`}
                </span>
              </div>
            </div>
          )}

          {/* Event Content */}
          <div className="p-8">
            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <h1 className="text-4xl font-bold text-gray-900">
                {event.title}
              </h1>
              
              <div className="flex gap-2 md:flex-shrink-0 pt-1">
                {event.isRegistered ? (
                  <button
                    onClick={handleUnregister}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
                  >
                    Kaydı İptal Et
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={event.currentParticipants >= event.maxParticipants}
                    className={`px-6 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      event.currentParticipants >= event.maxParticipants
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {event.currentParticipants >= event.maxParticipants 
                      ? 'Kontenjan Dolu' 
                      : 'Katıl'
                    }
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Paylaş"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Author/Organizer Info */}
            {author && (
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                <Avatar
                  src={author.profilePicture 
                    ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${author.profilePicture}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=3b82f6&color=fff`}
                  alt={`${author.firstName} ${author.lastName}`}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {author.firstName} {author.lastName}
                  </p>
                  <p className="text-sm text-gray-500">@{author.username}</p>
                  <p className="text-xs text-gray-500 mt-1">Etkinlik Organizatörü</p>
                </div>
              </div>
            )}

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Date & Time */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Başlangıç</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(event.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Bitiş</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(event.endDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    {event.isOnline ? (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">
                      {event.isOnline ? 'Online Etkinlik' : 'Lokasyon'}
                    </p>
                    <p className="font-semibold text-gray-900">{event.location}</p>
                    {event.locationAddress && !event.isOnline && (
                      <p className="text-xs text-gray-500 mt-1">{event.locationAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Katılımcılar</p>
                    <p className="font-semibold text-gray-900">
                      {event.currentParticipants} / {event.maxParticipants}
                    </p>
                    {event.maxParticipants - event.currentParticipants <= 5 && event.maxParticipants - event.currentParticipants > 0 && (
                      <p className="text-xs text-orange-600 font-medium mt-1">
                        Son {event.maxParticipants - event.currentParticipants} yer!
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                Etkinlik Hakkında
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Instructor Info */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                Eğitmen Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Eğitmen</p>
                  <p className="font-semibold text-gray-900">{event.instructor}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Ünvan</p>
                  <p className="font-semibold text-gray-900">{event.instructorTitle}</p>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></span>
                Organizatör Bilgileri
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Organizatör</p>
                  <p className="font-semibold text-gray-900">{event.organizer}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-1">Organizatör Tipi</p>
                  <p className="font-semibold text-gray-900">{event.organizerType}</p>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {event.requirements && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full mr-3"></span>
                  Gereksinimler
                </h2>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                  <p className="text-gray-700">{event.requirements}</p>
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Etiketler</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

