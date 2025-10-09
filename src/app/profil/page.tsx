'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import { getCurrentUser, isAuthenticated, logout, formatUserName, calculateAge } from '@/utils/auth';
import { User, authService, ProfileResponse, ProfileStats } from '@/services/auth';
import { uploadService } from '@/services/upload';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phone: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    dateOfBirth: ''
  });
  const [activityModal, setActivityModal] = useState<{
    isOpen: boolean;
    type: 'posts' | 'comments' | 'likedPosts' | 'blogs' | 'events' | 'participatingEvents' | null;
    title: string;
  }>({
    isOpen: false,
    type: null,
    title: ''
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      // Auth kontrolü
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        // API'den kullanıcı profilini çek
        const response = await authService.getProfile();
        setProfileData(response);
        setUser(response.user);
        setStats(response.stats);
        
        // LocalStorage'ı da güncelle (senkronizasyon için)
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      } catch (error: any) {
        console.error('Profil yükleme hatası:', error);
        
        // API hatası olursa localStorage'dan yedek al
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Stats için varsayılan değerler
          setStats({
            totalPosts: 0,
            totalComments: 0,
            totalLikedPosts: 0,
            totalBlogs: 0,
            publishedBlogs: 0,
            totalCreatedEvents: 0,
            totalParticipatingEvents: 0
          });
        } else {
          setToast({ message: 'Profil yüklenemedi. Lütfen tekrar giriş yapın.', type: 'error' });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Düzenleme modunu aç
  const handleEditMode = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      gender: user?.gender || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
    });
    setIsEditing(true);
  };

  // Düzenlemeyi iptal et
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      firstName: '',
      lastName: '',
      bio: '',
      phone: '',
      gender: '',
      dateOfBirth: ''
    });
  };

  // Profil güncelleme
  const handleUpdateProfile = async () => {
    // Client-side validasyon
    if (editForm.firstName && (editForm.firstName.length < 2 || editForm.firstName.length > 50)) {
      setToast({ message: 'Ad 2-50 karakter arasında olmalı!', type: 'error' });
      return;
    }

    if (editForm.firstName && !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(editForm.firstName)) {
      setToast({ message: 'Ad sadece harf içerebilir!', type: 'error' });
      return;
    }

    if (editForm.lastName && (editForm.lastName.length < 2 || editForm.lastName.length > 50)) {
      setToast({ message: 'Soyad 2-50 karakter arasında olmalı!', type: 'error' });
      return;
    }

    if (editForm.lastName && !/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(editForm.lastName)) {
      setToast({ message: 'Soyad sadece harf içerebilir!', type: 'error' });
      return;
    }

    if (editForm.bio && editForm.bio.length > 500) {
      setToast({ message: 'Biyografi en fazla 500 karakter olabilir!', type: 'error' });
      return;
    }

    try {
      setToast({ message: 'Profil güncelleniyor...', type: 'info' });
      
      const updatedUser = await authService.updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        bio: editForm.bio,
        phone: editForm.phone,
        gender: editForm.gender || undefined,
        dateOfBirth: editForm.dateOfBirth || undefined
      });
      
      // State'i güncelle
      setUser(updatedUser);
      
      // LocalStorage'ı güncelle
      if (typeof window !== 'undefined') {
        const currentUserData = localStorage.getItem('user');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          Object.assign(userData, {
            firstName: editForm.firstName,
            lastName: editForm.lastName,
            bio: editForm.bio,
            phone: editForm.phone,
            gender: editForm.gender,
            dateOfBirth: editForm.dateOfBirth
          });
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      // Auth değişikliği event'ini dispatch et (Navbar için)
      window.dispatchEvent(new CustomEvent('authChange'));
      
      setIsEditing(false);
      setToast({ message: 'Profil başarıyla güncellendi! 🎉', type: 'success' });
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      setToast({ message: error.message || 'Profil güncellenemedi!', type: 'error' });
    }
  };

  // Profil fotoğrafı yükleme
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasyon
    const validation = uploadService.validateFile(file);
    if (!validation.valid) {
      setToast({ message: validation.error!, type: 'error' });
      return;
    }

    try {
      setIsUploadingImage(true);
      setToast({ message: 'Profil fotoğrafı yükleniyor...', type: 'info' });
      
      // Resmi yükle
      const response = await uploadService.uploadSingle(file);
      
      // Profili güncelle
      const updatedUser = await authService.updateProfile({
        profilePicture: response.imageUrl
      });
      
      // Local storage'ı güncelle
      if (typeof window !== 'undefined') {
        const currentUserData = localStorage.getItem('user');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          userData.profilePicture = response.imageUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      // State'i güncelle
      setUser(updatedUser);
      
      // Auth değişikliği event'ini dispatch et (Navbar için)
      window.dispatchEvent(new CustomEvent('authChange'));
      
      setToast({ message: 'Profil fotoğrafı başarıyla güncellendi! 🎉', type: 'success' });
    } catch (error: any) {
      console.error('Profil fotoğrafı yükleme hatası:', error);
      setToast({ message: error.message || 'Profil fotoğrafı yüklenemedi!', type: 'error' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Activity modal'ı aç
  const openActivityModal = (type: 'posts' | 'comments' | 'likedPosts' | 'blogs' | 'events' | 'participatingEvents', title: string) => {
    setActivityModal({
      isOpen: true,
      type,
      title
    });
  };

  // Activity modal'ı kapat
  const closeActivityModal = () => {
    setActivityModal({
      isOpen: false,
      type: null,
      title: ''
    });
  };

  // Modal içeriğini render et
  const renderModalContent = () => {
    if (!profileData || !activityModal.type) return null;

    switch (activityModal.type) {
      case 'posts':
        return profileData.recentPosts?.length > 0 ? (
          <div className="space-y-3">
            {profileData.recentPosts.map((post: any) => (
              <Link key={post._id} href={`/posts/${post._id}`} onClick={closeActivityModal}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-3">
                    {post.images?.[0] && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${post.images[0]}`}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-500 mt-2">{post.views} görüntülenme • {new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-8">Henüz gönderi yok</p>;

      case 'comments':
        return profileData.recentComments?.length > 0 ? (
          <div className="space-y-3">
            {profileData.recentComments.map((comment: any) => {
              const targetUrl = comment.postType === 'Post' 
                ? `/posts/${comment.postOrBlog}` 
                : `/blogs/${comment.postOrBlog}`;
              
              return (
                <Link key={comment._id} href={targetUrl} onClick={closeActivityModal}>
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm text-gray-900 line-clamp-3">{comment.content}</p>
                        <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                          comment.postType === 'Post' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {comment.postType === 'Post' ? 'Gönderi' : 'Blog'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : <p className="text-gray-500 text-center py-8">Henüz yorum yok</p>;

      case 'likedPosts':
        return profileData.recentLikedPosts?.length > 0 ? (
          <div className="space-y-3">
            {profileData.recentLikedPosts.map((post: any) => (
              <Link key={post._id} href={`/posts/${post._id}`} onClick={closeActivityModal}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-3">
                    {post.images?.[0] && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${post.images[0]}`}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                      {post.author && (
                        <p className="text-xs text-gray-500 mt-1">@{post.author.username}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{new Date(post.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-8">Henüz beğenilen gönderi yok</p>;

      case 'blogs':
        return profileData.recentBlogs?.length > 0 ? (
          <div className="space-y-3">
            {profileData.recentBlogs.map((blog: any) => (
              <Link key={blog._id} href={`/blogs/${blog._id}`} onClick={closeActivityModal}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-3">
                    {blog.images?.[0] && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${blog.images[0]}`}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{blog.title}</h3>
                        <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                          blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {blog.isPublished ? 'Yayında' : 'Taslak'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{blog.views} görüntülenme • {blog.readingTime} dk okuma</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-8">Henüz blog yok</p>;

      case 'events':
        return profileData.createdEvents?.length > 0 ? (
          <div className="space-y-3">
            {profileData.createdEvents.map((event: any) => (
              <Link key={event._id} href={`/events/${event._id}`} onClick={closeActivityModal}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-3">
                    {event.image && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${event.image}`}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === 'active' ? 'bg-green-100 text-green-700' :
                          event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status === 'active' ? 'Aktif' : event.status === 'pending' ? 'Beklemede' : event.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{event.currentParticipants}/{event.maxParticipants} katılımcı • {new Date(event.date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-8">Henüz etkinlik oluşturulmamış</p>;

      case 'participatingEvents':
        return profileData.participatingEvents?.length > 0 ? (
          <div className="space-y-3">
            {profileData.participatingEvents.map((event: any) => (
              <Link key={event._id} href={`/events/${event._id}`} onClick={closeActivityModal}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex gap-3">
                    {event.image && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                        <Image
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${event.image}`}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-xs text-gray-500 mt-2">{event.currentParticipants}/{event.maxParticipants} katılımcı • {new Date(event.date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500 text-center py-8">Henüz katılınan etkinlik yok</p>;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kullanıcı bulunamadı</h1>
          <Link href="/login">
            <Button>Giriş Yap</Button>
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Activity Modal */}
      <Modal
        isOpen={activityModal.isOpen}
        onClose={closeActivityModal}
        title={activityModal.title}
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto">
          {renderModalContent()}
        </div>
      </Modal>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profil Fotoğrafı */}
            <div className="relative">
              <input
                type="file"
                id="profile-image-upload"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleProfileImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
              <label 
                htmlFor="profile-image-upload"
                className="relative block w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden ring-4 ring-blue-100 shadow-lg bg-white cursor-pointer group"
              >
                <Image
                  src={
                    user.profilePicture 
                      ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${user.profilePicture}`
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(formatUserName(user))}&background=3b82f6&color=fff&size=120`
                  }
                  alt={formatUserName(user)}
                  fill
                  className="object-cover"
                  unoptimized={!user.profilePicture}
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-opacity flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </label>
              <p className="text-xs text-gray-500 text-center mt-3">
                {isUploadingImage ? 'Yükleniyor...' : 'Değiştirmek için tıklayın'}
              </p>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{formatUserName(user)}</h1>
                {user.isVerified && (
                  <span className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-lg mb-1">@{user.username}</p>
              <p className="text-gray-500 text-sm mb-2">{user.email}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' ? 'bg-red-100 text-red-700' :
                  user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                  user.role === 'expert' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user.role === 'admin' ? 'Yönetici' :
                   user.role === 'doctor' ? 'Doktor' :
                   user.role === 'expert' ? 'Uzman' :
                   'Kullanıcı'}
                </span>
                {user.dateOfBirth && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {calculateAge(user.dateOfBirth)} yaşında
                  </span>
                )}
                {user.isActive && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Aktif
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="text-gray-600 text-sm mt-3 max-w-2xl">{user.bio}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl text-red-600 hover:bg-red-50 hover:border-red-300">
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Profile Info - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal & Account Information - Birleştirilmiş */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                  Hesap Bilgileri
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEditMode}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Düzenle
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                    >
                      Kaydet
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Ad</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:border-blue-500 focus:outline-none"
                      maxLength={50}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">{user.firstName}</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Soyad</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:border-blue-500 focus:outline-none"
                      maxLength={50}
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">{user.lastName}</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Kullanıcı Adı</span>
                  <span className="text-sm font-semibold text-gray-900">@{user.username}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">E-posta</span>
                  <span className="text-sm font-semibold text-gray-900">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Telefon</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Telefon numarası"
                      className="text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">{user.phone || 'Belirtilmemiş'}</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Cinsiyet</span>
                  {isEditing ? (
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                      className="text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Seçiniz</option>
                      <option value="male">Erkek</option>
                      <option value="female">Kadın</option>
                      <option value="other">Diğer</option>
                    </select>
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">
                      {user.gender === 'male' ? 'Erkek' : user.gender === 'female' ? 'Kadın' : user.gender === 'other' ? 'Diğer' : 'Belirtilmemiş'}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Doğum Tarihi</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-900">
                      {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                    </span>
                  )}
                </div>
                {/* Biyografi - Textarea olarak */}
                {(user.bio || isEditing) && (
                  <div className="py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Biyografi</label>
                    {isEditing ? (
                      <div>
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Kendinizi tanıtın..."
                          className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
                          rows={3}
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {editForm.bio.length}/500 karakter
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-gray-900">{user.bio}</p>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Rol</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {user.role === 'admin' ? 'Yönetici' : user.role === 'doctor' ? 'Doktor' : user.role === 'expert' ? 'Uzman' : 'Kullanıcı'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Hesap Durumu</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Doğrulama</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isVerified ? 'Doğrulanmış' : 'Bekliyor'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                  <span className="text-sm font-medium text-gray-600">Kayıt Tarihi</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center justify-between py-3 hover:bg-gray-50 px-4 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-600">Son Giriş</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Information - Sadece doktorlar için */}
            {user.role === 'doctor' && user.doctorInfo && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-pink-500 to-red-500 rounded-full mr-3"></span>
                  Doktor Bilgileri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {user.doctorInfo.specialization && (
                    <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-100">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Uzmanlık</label>
                      <p className="text-base font-medium text-gray-900">{user.doctorInfo.specialization}</p>
                    </div>
                  )}
                  {user.doctorInfo.experience && (
                    <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-100">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deneyim</label>
                      <p className="text-base font-medium text-gray-900">{user.doctorInfo.experience} yıl</p>
                    </div>
                  )}
                  {user.doctorInfo.hospital && (
                    <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-100">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hastane</label>
                      <p className="text-base font-medium text-gray-900">{user.doctorInfo.hospital}</p>
                    </div>
                  )}
                  {user.doctorInfo.location && (
                    <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-100">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lokasyon</label>
                      <p className="text-base font-medium text-gray-900">{user.doctorInfo.location}</p>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-100 md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Onay Durumu</label>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      user.doctorInfo.approvalStatus === 'approved' ? 'bg-green-500 text-white shadow-lg' :
                      user.doctorInfo.approvalStatus === 'pending' ? 'bg-yellow-500 text-white shadow-lg' :
                      'bg-red-500 text-white shadow-lg'
                    }`}>
                      {user.doctorInfo.approvalStatus === 'approved' ? 'Onaylandı' :
                       user.doctorInfo.approvalStatus === 'pending' ? 'İnceleniyor' :
                       'Reddedildi'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity - Son aktiviteler */}
            {profileData && (
              <>
                {/* Recent Posts */}
                {profileData.recentPosts && profileData.recentPosts.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></span>
                      Son Gönderiler
                    </h2>
                    <div className="space-y-4">
                      {profileData.recentPosts.slice(0, 3).map((post: any) => (
                        <Link key={post._id} href={`/posts/${post._id}`}>
                          <div className="group border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex gap-4">
                              {/* Resim varsa göster */}
                              {post.images && post.images.length > 0 && (
                                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${post.images[0]}`}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                  {post.title}
                                </h3>
                                {post.content && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {post.content}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    {post.views} görüntülenme
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
                                  {post.category && (
                                    <>
                                      <span>•</span>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        {post.category}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Blogs */}
                {profileData.recentBlogs && profileData.recentBlogs.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full mr-3"></span>
                      Son Blog Yazıları
                    </h2>
                    <div className="space-y-4">
                      {profileData.recentBlogs.slice(0, 3).map((blog: any) => (
                        <Link key={blog._id} href={`/blogs/${blog._id}`}>
                          <div className="group border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex gap-4">
                              {/* Resim varsa göster */}
                              {blog.images && blog.images.length > 0 && (
                                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${blog.images[0]}`}
                                    alt={blog.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                    {blog.title}
                                  </h3>
                                  <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                                    blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {blog.isPublished ? 'Yayında' : 'Taslak'}
                                  </span>
                                </div>
                                {blog.excerpt && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {blog.excerpt}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    {blog.views} görüntülenme
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    {blog.readingTime} dk okuma
                                  </span>
                                  <span>•</span>
                                  <span>{new Date(blog.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created Events */}
                {profileData.createdEvents && profileData.createdEvents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
                      Son Oluşturulan Etkinlikler
                    </h2>
                    <div className="space-y-4">
                      {profileData.createdEvents.slice(0, 3).map((event: any) => (
                        <Link key={event._id} href={`/events/${event._id}`}>
                          <div className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex gap-4">
                              {/* Resim varsa göster */}
                              {event.image && (
                                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${event.image}`}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                    {event.title}
                                  </h3>
                                  <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                                    event.status === 'active' ? 'bg-green-100 text-green-700' :
                                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {event.status === 'active' ? 'Aktif' :
                                     event.status === 'pending' ? 'Beklemede' :
                                     event.status}
                                  </span>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    {event.currentParticipants}/{event.maxParticipants} katılımcı
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    {new Date(event.date).toLocaleDateString('tr-TR')}
                                  </span>
                                  {event.category && (
                                    <>
                                      <span>•</span>
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                        {event.category}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participating Events */}
                {profileData.participatingEvents && profileData.participatingEvents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-blue-500 rounded-full mr-3"></span>
                      Son Katılınan Etkinlikler
                    </h2>
                    <div className="space-y-4">
                      {profileData.participatingEvents.slice(0, 3).map((event: any) => (
                        <Link key={event._id} href={`/events/${event._id}`}>
                          <div className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
                            <div className="flex gap-4">
                              {/* Resim varsa göster */}
                              {event.image && (
                                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${event.image}`}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {event.title}
                                  </h3>
                                  <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                                    event.status === 'active' ? 'bg-green-100 text-green-700' :
                                    event.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    event.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {event.status === 'active' ? 'Aktif' :
                                     event.status === 'pending' ? 'Beklemede' :
                                     event.status === 'completed' ? 'Tamamlandı' :
                                     event.status}
                                  </span>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    {event.currentParticipants}/{event.maxParticipants} katılımcı
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    {new Date(event.date).toLocaleDateString('tr-TR')}
                                  </span>
                                  {event.category && (
                                    <>
                                      <span>•</span>
                                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                                        {event.category}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Statistics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></span>
                İstatistikler
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => openActivityModal('posts', 'Tüm Gönderilerim')}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-blue-50 group"
                >
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Gönderi
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <span className="text-lg font-bold text-blue-600">{stats?.totalPosts || 0}</span>
                </button>
                <button
                  onClick={() => openActivityModal('comments', 'Tüm Yorumlarım')}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-green-50 group"
                >
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Yorum
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <span className="text-lg font-bold text-green-600">{stats?.totalComments || 0}</span>
                </button>
                <button
                  onClick={() => openActivityModal('likedPosts', 'Beğendiğim Gönderiler')}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-red-50 group"
                >
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Beğeni
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <span className="text-lg font-bold text-red-600">{stats?.totalLikedPosts || 0}</span>
                </button>
                <button
                  onClick={() => openActivityModal('blogs', 'Tüm Blog Yazılarım')}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-purple-50 group"
                >
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Blog
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <span className="text-lg font-bold text-purple-600">{stats?.totalBlogs || 0}</span>
                </button>
                <button
                  onClick={() => openActivityModal('events', 'Oluşturduğum Etkinlikler')}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-orange-50 group"
                >
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Etkinlik
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <span className="text-lg font-bold text-orange-600">{stats?.totalCreatedEvents || 0}</span>
                </button>
                <button
                  onClick={() => openActivityModal('participatingEvents', 'Katıldığım Etkinlikler')}
                  className="w-full flex justify-between items-center p-3 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer hover:bg-pink-50 group"
                >
                  <span className="text-sm text-gray-600 flex items-center gap-2">
                    Katılım
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                  <span className="text-lg font-bold text-pink-600">{stats?.totalParticipatingEvents || 0}</span>
                </button>
   
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
