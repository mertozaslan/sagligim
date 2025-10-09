'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import ShareModal from '@/components/ShareModal';
import { useQuestionsStore, useEventsStore, useExpertsStore } from '@/stores';
import { Post, CreatePostData } from '@/services/posts';
import type { Event } from '@/services/events';
import { uploadService } from '@/services/upload';

// Post ve Comment interface'leri artık services'den import ediliyor

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  verified: boolean;
}

// Event interface artık services/events'ten import ediliyor

export default function CommunityPage() {
  // Store'dan verileri al
  const { 
    questions: posts, 
    loading, 
    error, 
    fetchQuestions, 
    createQuestion, 
    likeQuestion,
    dislikeQuestion,
    trendCategories
  } = useQuestionsStore();

  // Events store
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    fetchEvents
  } = useEventsStore();

  // Experts store
  const {
    experts,
    isLoading: expertsLoading,
    error: expertsError,
    fetchExperts
  } = useExpertsStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Post creation state
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const [newPost, setNewPost] = useState<CreatePostData>({
    title: '',
    content: '',
    category: 'other',
    tags: [],
    images: [],
    isAnonymous: false,
    isSensitive: false,
    medicalAdvice: false,
    symptoms: [],
    treatments: []
  });
  const [availableTags] = useState<string[]>([
    'beslenme', 'egzersiz', 'mental-sağlık', 'kalp-sağlığı', 'diyabet', 
    'kilo-yönetimi', 'uyku', 'stres', 'motivasyon', 'başarı-hikayesi'
  ]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePost, setSharePost] = useState<Post | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        // Tüm API çağrılarını paralel olarak yap
        await Promise.all([
          // Posts yükle
          fetchQuestions({
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }).catch(apiError => {
            console.warn('API\'den veri yüklenemedi:', apiError);
          }),
          
          // Events yükle
          fetchEvents({
            page: 1,
            limit: 10,
            sortBy: 'date',
            sortOrder: 'asc'
          }).catch(eventError => {
            console.warn('Events yüklenemedi:', eventError);
          }),

          // Experts yükle
          fetchExperts({ limit: 3 }).catch(expertsError => {
            console.warn('Experts yüklenemedi:', expertsError);
          }),
          
          // Users yükle
          fetch('/data/users.json')
            .then(res => res.json())
            .then(usersData => setUsers(usersData))
            .catch(error => {
              console.warn('Users yüklenemedi:', error);
            })
        ]);
      } catch (error) {
        console.error('Topluluk verileri yüklenirken hata:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [fetchQuestions, fetchEvents]);

  // Featured event'i API'den gelen events'ten seç
  useEffect(() => {
    if (events.length > 0 && !featuredEvent) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setFeaturedEvent(randomEvent);
    }
  }, [events, featuredEvent]);

  // Kategoriler
  const categories = Array.from(new Set(posts?.map(post => post.category) || []));

  // Post kategorileri (API'ye göre)
  const postCategories = [
    { value: 'diabetes', label: 'Diyabet', icon: '🩸', color: 'blue' },
    { value: 'heart-disease', label: 'Kalp Hastalıkları', icon: '🫀', color: 'red' },
    { value: 'cancer', label: 'Kanser', icon: '🎗️', color: 'pink' },
    { value: 'mental-health', label: 'Ruh Sağlığı', icon: '🧠', color: 'purple' },
    { value: 'arthritis', label: 'Artrit', icon: '🦴', color: 'orange' },
    { value: 'asthma', label: 'Astım', icon: '🫁', color: 'cyan' },
    { value: 'digestive', label: 'Sindirim', icon: '🍏', color: 'green' },
    { value: 'neurological', label: 'Nörolojik', icon: '🧬', color: 'indigo' },
    { value: 'autoimmune', label: 'Otoimmün', icon: '🛡️', color: 'yellow' },
    { value: 'experience', label: 'Deneyim', icon: '✨', color: 'teal' },
    { value: 'curiosity', label: 'Merak', icon: '🤔', color: 'lime' },
    { value: 'success-story', label: 'Başarı Hikayesi', icon: '🏆', color: 'amber' },
    { value: 'other', label: 'Diğer', icon: '💭', color: 'gray' }
  ];

  // Kategori iconları
  const getCategoryIcon = (category: string) => {
    const categoryData = postCategories.find(c => c.value === category);
    return categoryData?.icon || '💭';
  };



  // Filtrelenmiş postlar
  const filteredPosts = (posts || []).filter(post => {
    const matchesSearch = (post.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (post.content?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedType || post.category === selectedType;
    
    return matchesSearch && matchesCategory;
  });


  // Kullanıcı bilgisini bul
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  // Süre farkını hesapla
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handleLike = async (postId: string) => {
    await likeQuestion(postId);
  };

  const handleDislike = async (postId: string) => {
    await dislikeQuestion(postId);
  };

  // Paylaşım modalını aç
  const handleShare = (post: Post) => {
    setSharePost(post);
    setShareModalOpen(true);
  };

  // Post creation handlers
  const handleExpandCreate = () => {
    setIsCreateExpanded(true);
  };

  const handleCollapseCreate = () => {
    setIsCreateExpanded(false);
    setNewPost({
      title: '',
      content: '',
      category: 'other',
      tags: [],
      images: [],
      isAnonymous: false,
      isSensitive: false,
      medicalAdvice: false,
      symptoms: [],
      treatments: []
    });
    setSelectedFile(null);
    setCustomTagInput('');
  };

  const handleTagToggle = (tag: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddCustomTag = () => {
    const trimmedTag = customTagInput.trim().toLowerCase();
    
    // Validasyonlar
    if (!trimmedTag) {
      setToast({ message: 'Etiket boş olamaz!', type: 'error' });
      return;
    }

    if (trimmedTag.length < 1 || trimmedTag.length > 50) {
      setToast({ message: 'Etiket 1-50 karakter arasında olmalı!', type: 'error' });
      return;
    }

    if (newPost.tags.length >= 10) {
      setToast({ message: 'En fazla 10 etiket ekleyebilirsiniz!', type: 'error' });
      return;
    }

    if (newPost.tags.includes(trimmedTag)) {
      setToast({ message: 'Bu etiket zaten eklenmiş!', type: 'warning' });
      return;
    }

    // Etiketi ekle
    setNewPost(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    
    setCustomTagInput('');
    setToast({ message: `"${trimmedTag}" etiketi eklendi!`, type: 'success' });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  // Tek resim seçme
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validasyon
    const validation = uploadService.validateFile(file);
    if (!validation.valid) {
      setToast({ message: validation.error!, type: 'error' });
      return;
    }

    setSelectedFile(file);
    setToast({ message: 'Resim seçildi!', type: 'success' });
  };

  // Seçili resmi kaldır
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // Resim yükle
  const handleUploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      setIsUploadingImage(true);
      const response = await uploadService.uploadSingle(selectedFile);
      setToast({ message: 'Resim başarıyla yüklendi!', type: 'success' });
      return response.imageUrl;
    } catch (error: any) {
      setToast({ message: error.message || 'Resim yükleme başarısız!', type: 'error' });
      throw error;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreatePost = async () => {
    // Client-side validasyon - Backend kurallarına uygun
    if (!newPost.title.trim()) {
      setToast({ message: 'Başlık alanı boş olamaz!', type: 'error' });
      return;
    }

    if (newPost.title.length < 5 || newPost.title.length > 200) {
      setToast({ message: 'Başlık 5-200 karakter arasında olmalı!', type: 'error' });
      return;
    }

    if (!newPost.content.trim()) {
      setToast({ message: 'İçerik alanı boş olamaz!', type: 'error' });
      return;
    }

    if (newPost.content.length < 10 || newPost.content.length > 5000) {
      setToast({ message: 'İçerik 10-5000 karakter arasında olmalı!', type: 'error' });
      return;
    }

    // Tags validasyonu
    if (newPost.tags.length > 10) {
      setToast({ message: 'En fazla 10 etiket ekleyebilirsiniz!', type: 'error' });
      return;
    }

    // Her etiketin uzunluğunu kontrol et
    const invalidTag = newPost.tags.find(tag => tag.length < 1 || tag.length > 50);
    if (invalidTag) {
      setToast({ message: 'Her etiket 1-50 karakter arasında olmalı!', type: 'error' });
      return;
    }

    try {
      // Önce resim yükle (varsa)
      let uploadedImageUrl: string | null = null;
      if (selectedFile) {
        setToast({ message: 'Resim yükleniyor...', type: 'info' });
        uploadedImageUrl = await handleUploadImage();
      }

      // Post'u oluştur
      const postDataWithImage = {
        ...newPost,
        images: uploadedImageUrl ? [uploadedImageUrl] : []
      };

      await createQuestion(postDataWithImage);
      handleCollapseCreate();
      setToast({ message: 'Paylaşım başarıyla oluşturuldu! 🎉', type: 'success' });
    } catch (error: any) {
      console.error('Post oluşturma hatası:', error);
      
      // API'dan gelen hata mesajlarını işle
      let errorMsg = '';
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Validation hataları
        errorMsg = error.response.data.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(', ');
      } else if (error.response?.data?.message) {
        // Genel API hatası
        errorMsg = error.response.data.message;
      } else if (error.message) {
        // Network veya diğer hatalar
        errorMsg = error.message;
      } else {
        errorMsg = 'Post oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      }
      
      setToast({ message: errorMsg, type: 'error' });
    }
  };

  // Event helper functions
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric',
      month: 'long',
      weekday: 'long'
    });
  };



  const getCategoryGradient = (category: string) => {
    const gradients: Record<string, string> = {
      'Meditasyon': 'from-purple-600 via-indigo-600 to-blue-600',
      'Biyoenerji': 'from-green-600 via-teal-600 to-cyan-600',
      'Beslenme': 'from-orange-600 via-red-600 to-pink-600',
      'Yoga': 'from-pink-600 via-purple-600 to-indigo-600',
      'Stres Yönetimi': 'from-blue-600 via-purple-600 to-pink-600',
      'Spor': 'from-green-600 via-blue-600 to-purple-600'
    };
    return gradients[category] || 'from-indigo-600 via-purple-600 to-pink-600';
  };

  const getEventCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Meditasyon': '🧘‍♀️',
      'Biyoenerji': '⚡',
      'Beslenme': '🥗',
      'Yoga': '🧘‍♂️',
      'Stres Yönetimi': '🌿',
      'Spor': '🏃‍♂️'
    };
    return icons[category] || '📅';
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Topluluk yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    console.error('Topluluk verileri yüklenirken hata:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bir hata oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={async () => {
              setInitialLoading(true);
              await Promise.all([
                fetchQuestions().catch(() => {}),
                fetchEvents().catch(() => {})
              ]);
              setInitialLoading(false);
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-6 py-3"
          >
            🔄 Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Share Modal */}
      {sharePost && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSharePost(null);
          }}
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${sharePost._id}`}
          title={sharePost.title}
          description={sharePost.content.substring(0, 200)}
        />
      )}

      {/* Elegant Filter Bar */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-600 mr-2 flex-shrink-0">Kategoriler:</span>
              <div className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-1 min-w-0 flex-1">
                <button
                  onClick={() => setSelectedType('')}
                  className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
                    selectedType === '' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                  }`}
                >
                  🌟 Tümü
                </button>
                {postCategories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedType(category.value)}
                    className={`flex-shrink-0 px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center space-x-2 ${
                      selectedType === category.value 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="whitespace-nowrap">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Results count with style */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="px-4 py-2 bg-white/70 rounded-xl border border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  {filteredPosts.length} paylaşım
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Layout - Responsive */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
          
          {/* Sol Sidebar - Trends & Navigation */}
          <div className="order-2 xl:order-1 xl:col-span-3 hidden xl:block">
            <div className="sticky top-32 space-y-6">
              {/* Trending Topics */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl shadow-blue-500/10">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full mr-3"></span>
                  Trend Konular
                </h3>
                <div className="space-y-3">
                  {trendCategories.slice(0, 5).map((trend, index) => {
                    const categoryData = postCategories.find(c => c.value === trend.name);
                    return (
                      <div 
                        key={trend.name} 
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer group"
                        onClick={() => setSelectedType(trend.name)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">#{index + 1}</span>
                          <span className="text-lg">{categoryData?.icon || '💭'}</span>
                          <span className="font-medium text-gray-700 group-hover:text-blue-600">
                            {categoryData?.label || trend.name}
                          </span>
                        </div>
                        <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 px-2 py-1 rounded-full">
                          {trend.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>


            </div>
          </div>

          {/* Ana Feed - Merkez */}
          <div className="order-1 xl:order-2 xl:col-span-6">
            {/* Advanced Post Creator */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/50 mb-6 md:mb-8 overflow-hidden transition-all duration-300">
              
              {!isCreateExpanded ? (
                /* Compact Create Post Trigger */
                <div 
                  onClick={handleExpandCreate}
                  className="p-4 md:p-6 cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src="https://ui-avatars.com/api/?name=Kullanici&background=3b82f6&color=fff"
                      alt="Sen"
                      size="md"
                    />
                    <div className="flex-1 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl px-6 py-4 border border-gray-200">
                      <p className="text-gray-500 font-medium">
                        💭 Ne düşünüyorsun? Deneyimini paylaş, soru sor...
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                        <span className="text-xl">📝</span>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                        <span className="text-xl">📷</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Expanded Create Post Form */
                <div className="p-4 md:p-6 lg:p-8 space-y-6">
                  {/* Header with Close Button */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src="https://ui-avatars.com/api/?name=Kullanici&background=3b82f6&color=fff"
                        alt="Sen"
                        size="lg"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">Yeni Paylaşım Oluştur</h3>
                        <p className="text-sm text-gray-500">Topluluğunla deneyimini paylaş</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleCollapseCreate}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                    >
                      <span className="text-gray-600">✕</span>
                    </button>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📝 Kategori
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                      {postCategories.map((category) => (
                        <button 
                          key={category.value}
                          onClick={() => setNewPost(prev => ({ ...prev, category: category.value as any }))}
                          className={`group flex flex-col items-center space-y-2 p-4 rounded-2xl border-2 transition-all ${
                            newPost.category === category.value 
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{category.icon}</span>
                          <span className="text-sm font-medium text-center">{category.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📌 Başlık
                    </label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Paylaşımına çekici bir başlık ver..."
                      className="w-full p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-lg font-medium"
                      maxLength={200}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">5-200 karakter arası</span>
                      <span className={`text-xs font-medium ${
                        newPost.title.length < 5 || newPost.title.length > 200 
                          ? 'text-red-500' 
                          : 'text-green-600'
                      }`}>{newPost.title.length}/200</span>
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 İçerik
                    </label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Deneyimini, sorununu veya düşüncelerini detaylıca anlat..."
                      className="w-full p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none resize-none transition-all text-base leading-relaxed"
                      rows={6}
                      maxLength={5000}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">10-5000 karakter arası</span>
                      <span className={`text-xs font-medium ${
                        newPost.content.length < 10 || newPost.content.length > 5000 
                          ? 'text-red-500' 
                          : 'text-green-600'
                      }`}>{newPost.content.length}/5000</span>
                    </div>
                  </div>

                  {/* Privacy and Content Options */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🔒 Gizlilik ve İçerik
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setNewPost(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border-2 transition-all ${
                          newPost.isAnonymous
                            ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 font-medium'
                            : 'border-gray-200 hover:border-orange-300 text-gray-700'
                        }`}
                      >
                        <span>{newPost.isAnonymous ? '🔒' : '👤'}</span>
                        <span>{newPost.isAnonymous ? 'Anonim' : 'İsimli'}</span>
                      </button>
                      
                      <button
                        onClick={() => setNewPost(prev => ({ ...prev, isSensitive: !prev.isSensitive }))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border-2 transition-all ${
                          newPost.isSensitive
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 font-medium'
                            : 'border-gray-200 hover:border-red-300 text-gray-700'
                        }`}
                      >
                        <span>{newPost.isSensitive ? '⚠️' : '✅'}</span>
                        <span>{newPost.isSensitive ? 'Hassas' : 'Normal'}</span>
                      </button>
                      
                      <button
                        onClick={() => setNewPost(prev => ({ ...prev, medicalAdvice: !prev.medicalAdvice }))}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border-2 transition-all ${
                          newPost.medicalAdvice
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 font-medium'
                            : 'border-gray-200 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        <span>{newPost.medicalAdvice ? '🏥' : '💭'}</span>
                        <span>{newPost.medicalAdvice ? 'Tıbbi' : 'Genel'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Tags Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🏷️ Etiketler (Max 10)
                    </label>
                    
                    {/* Önceden tanımlı etiketler */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          disabled={!newPost.tags.includes(tag) && newPost.tags.length >= 10}
                          className={`px-3 py-2 rounded-2xl border transition-all ${
                            newPost.tags.includes(tag)
                              ? 'border-green-500 bg-gradient-to-r from-green-50 to-teal-50 text-green-700 font-medium'
                              : 'border-gray-200 hover:border-green-300 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    {/* Özel etiket ekleme */}
                    <div className="mb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customTagInput}
                          onChange={(e) => setCustomTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomTag();
                            }
                          }}
                          placeholder="Özel etiket ekle..."
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                          maxLength={50}
                          disabled={newPost.tags.length >= 10}
                        />
                        <Button
                          onClick={handleAddCustomTag}
                          disabled={!customTagInput.trim() || newPost.tags.length >= 10}
                          variant="outline"
                          className="rounded-2xl border-2 px-6"
                        >
                          Ekle
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Enter tuşuna basarak veya &quot;Ekle&quot; butonuna tıklayarak özel etiket ekleyebilirsiniz
                      </p>
                    </div>

                    {/* Seçilen etiketler */}
                    {newPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl">
                        <span className="text-sm font-medium text-green-700">Seçilen etiketler:</span>
                        {newPost.tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="px-2 py-1 bg-green-200 text-green-800 rounded-xl text-sm font-medium flex items-center gap-1 group"
                          >
                            #{tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-green-600 hover:text-green-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resim Yükleme */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📷 Resim
                    </label>
                    
                    {/* Resim seçme butonu */}
                    {!selectedFile ? (
                      <div>
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="image-upload"
                          className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 rounded-2xl transition-all cursor-pointer"
                        >
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-blue-700">
                            Resim Seç (JPG, PNG, GIF, WEBP)
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Maksimum 5MB boyutunda resim yükleyebilirsiniz
                        </p>
                      </div>
                    ) : (
                      /* Seçilen resim önizleme */
                      <div className="relative group">
                        <div className="relative rounded-xl overflow-hidden border-2 border-white shadow-lg" style={{ height: '250px' }}>
                          <Image
                            src={URL.createObjectURL(selectedFile)}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-600 mt-2 truncate">
                          {selectedFile.name}
                        </p>
                      </div>
                    )}
                  </div>


                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>🌍</span>
                        <span>Herkese açık paylaşım</span>
                      </div>
            </div>

                    <div className="flex space-x-3">
            <Button
              variant="outline"
                        onClick={handleCollapseCreate}
                        className="rounded-2xl border-2"
                      >
                        İptal
                      </Button>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={
                          isUploadingImage ||
                          !newPost.title.trim() || 
                          !newPost.content.trim() || 
                          newPost.title.length < 5 || 
                          newPost.title.length > 200 ||
                          newPost.content.length < 10 ||
                          newPost.content.length > 5000
                        }
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">🚀</span>
                            Paylaş
                          </>
                        )}
            </Button>
          </div>
        </div>
                </div>
              )}
            </div>

            {/* Active Filters - Modern Style */}
            {(searchTerm || selectedType) && (
              <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Aktif filtreler:
                  </span>
                  {searchTerm && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-2xl text-sm font-medium flex items-center">
                      🔍 &quot;{searchTerm}&quot;
                      <button onClick={() => setSearchTerm('')} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">×</button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-2xl text-sm font-medium flex items-center">
                      {postCategories.find(c => c.value === selectedType)?.icon} {postCategories.find(c => c.value === selectedType)?.label}
                      <button onClick={() => setSelectedType('')} className="ml-2 text-purple-600 hover:text-purple-800 font-bold">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Premium Feed */}
            <div className="space-y-8">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50">
                  <div className="text-8xl mb-6">🌟</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Hiç paylaşım yok</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    İlk paylaşımı sen yap ve bu harika topluluğu canlandır!
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-8 py-4 text-lg">
                    ✨ İlk Paylaşımı Yap
                    </Button>
                  </div>
                ) : (
                filteredPosts.map((post) => {
                  const author = post.author;
                  

                    return (
                    <article key={post._id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-200 overflow-hidden">
                      
                      {/* Modern Header - LinkedIn Style */}
                      <div className="p-4 md:p-6">
                        <div className="flex items-center space-x-4 mb-5">
                          <div className="relative">
                            <Avatar
                              src={post.isAnonymous 
                                ? `https://ui-avatars.com/api/?name=Anonim&background=6b7280&color=fff` 
                                : author.profilePicture 
                                  ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${author.profilePicture}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=3b82f6&color=fff`}
                              alt={post.isAnonymous ? 'Anonim Kullanıcı' : `${author.firstName} ${author.lastName}`}
                              size="lg"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">
                                {post.isAnonymous ? 'Anonim Kullanıcı' : `${author.firstName} ${author.lastName}`}
                              </h4>
                              <span className="text-sm text-gray-500 font-medium">@{author.username}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{getTimeAgo(post.createdAt)}</span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <span>{getCategoryIcon(post.category)}</span>
                                <span>{postCategories.find(c => c.value === post.category)?.label}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <span>👁️</span>
                                <span>{post.views || 0} görüntülenme</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                              post.category === 'diabetes' ? 'bg-blue-100 text-blue-700' :
                              post.category === 'heart-disease' ? 'bg-red-100 text-red-700' :
                              post.category === 'cancer' ? 'bg-pink-100 text-pink-700' :
                              post.category === 'mental-health' ? 'bg-purple-100 text-purple-700' :
                              post.category === 'arthritis' ? 'bg-orange-100 text-orange-700' :
                              post.category === 'asthma' ? 'bg-cyan-100 text-cyan-700' :
                              post.category === 'digestive' ? 'bg-green-100 text-green-700' :
                              post.category === 'neurological' ? 'bg-indigo-100 text-indigo-700' :
                              post.category === 'autoimmune' ? 'bg-yellow-100 text-yellow-700' :
                              post.category === 'experience' ? 'bg-teal-100 text-teal-700' :
                              post.category === 'curiosity' ? 'bg-lime-100 text-lime-700' :
                              post.category === 'success-story' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              <span>{getCategoryIcon(post.category)}</span>
                              <span>{postCategories.find(c => c.value === post.category)?.label}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {post.isAnonymous && (
                                <div className="text-xl" title="Anonim Paylaşım">🔒</div>
                              )}
                              {post.isSensitive && (
                                <div className="text-xl" title="Hassas İçerik">⚠️</div>
                              )}
                              {post.medicalAdvice && (
                                <div className="text-xl" title="Tıbbi Tavsiye">🏥</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content Area - Instagram Style */}
                        <div className="mb-5">
                          {/* Başlık */}
                          <Link href={`/posts/${post._id}`}>
                            <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
                              {post.title}
                            </h2>
                          </Link>
                          
                          {/* Post Images */}
                          {post.images && post.images.length > 0 && (
                            <Link href={`/posts/${post._id}`}>
                              <div className="relative mb-4 rounded-xl overflow-hidden cursor-pointer group" style={{ height: '200px' }}>
                                <Image
                                  src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${post.images[0]}`}
                                  alt={post.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {post.images.length > 1 && (
                                  <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>+{post.images.length - 1}</span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          )}

                          {/* İçerik */}
                          <div className="text-gray-700 leading-relaxed">
                            <p className="line-clamp-4">{post.content}</p>
                          </div>
                          
                          {post.content.length > 200 && (
                            <Link href={`/posts/${post._id}`}>
                              <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-800 transition-colors">
                                Devamını oku...
                              </button>
                            </Link>
                          )}
                        </div>

                        {/* Tags, Symptoms, Treatments */}
                        <div className="space-y-3 mb-5">
                          {/* Tags */}
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs font-medium text-gray-500">🏷️ Etiketler:</span>
                              {post.tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer">
                                  #{tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                                  +{post.tags.length - 3} daha
                                </span>
                              )}
                            </div>
                          )}

                          {/* Symptoms */}
                          {post.symptoms && post.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs font-medium text-gray-500">🩺 Belirtiler:</span>
                              {post.symptoms.slice(0, 2).map((symptom: string) => (
                                <span key={symptom} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                  {symptom}
                                </span>
                              ))}
                              {post.symptoms.length > 2 && (
                                <span className="px-3 py-1 bg-red-100 text-red-500 rounded-full text-sm">
                                  +{post.symptoms.length - 2} daha
                                </span>
                              )}
                            </div>
                          )}

                          {/* Treatments */}
                          {post.treatments && post.treatments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs font-medium text-gray-500">💊 Tedaviler:</span>
                              {post.treatments.slice(0, 2).map((treatment: string) => (
                                <span key={treatment} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  {treatment}
                                </span>
                              ))}
                              {post.treatments.length > 2 && (
                                <span className="px-3 py-1 bg-green-100 text-green-500 rounded-full text-sm">
                                  +{post.treatments.length - 2} daha
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Compact Engagement Bar */}
                      <div className="px-4 md:px-6 py-3 bg-gray-50/30 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          
                          {/* Interactive Actions with Counts */}
                          <div className="flex items-center space-x-1">
                            
                            {/* Like */}
                            <button
                              onClick={() => handleLike(post._id)}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all group ${
                                post.isLiked ? 'bg-red-50 text-red-600' : 'hover:bg-red-50'
                              }`}
                            >
                              <span className={`text-lg group-hover:scale-110 transition-transform ${
                                post.isLiked ? 'text-red-500' : ''
                              }`}>❤️</span>
                              <span className={`text-sm font-medium group-hover:text-red-600 ${
                                post.isLiked ? 'text-red-600' : 'text-gray-700'
                              }`}>{post.likesCount || 0}</span>
                            </button>

                            {/* Dislike */}
                            <button
                              onClick={() => handleDislike(post._id)}
                              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all group ${
                                post.isDisliked ? 'bg-gray-50 text-gray-600' : 'hover:bg-gray-50'
                              }`}
                            >
                              <span className={`text-lg group-hover:scale-110 transition-transform ${
                                post.isDisliked ? 'text-gray-500' : ''
                              }`}>👎</span>
                              <span className={`text-sm font-medium group-hover:text-gray-600 ${
                                post.isDisliked ? 'text-gray-600' : 'text-gray-700'
                              }`}>{post.dislikesCount || 0}</span>
                            </button>

                            {/* Comment */}
                            <Link href={`/posts/${post._id}#yorumlar`}>
                              <button className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-blue-50 transition-all group">
                                <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{post.commentCount || 0}</span>
                              </button>
                            </Link>

                            </div>

                          {/* Quick Actions */}
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => handleShare(post)}
                              className="p-2 hover:bg-blue-50 rounded-full transition-colors group"
                              title="Paylaş"
                            >
                              <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                            </button>
                          </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>

          {/* Sağ Sidebar - Quick Actions */}
          <div className="order-3 xl:col-span-3 hidden xl:block">
            <div className="sticky top-32 space-y-6">
              {/* Featured Event Promotion */}
              {featuredEvent ? (
                <div className={`bg-gradient-to-br ${getCategoryGradient(featuredEvent.category)} rounded-3xl p-6 text-white shadow-lg relative overflow-hidden`}>
                  <div className="relative">
                    {/* Compact Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 bg-white/20 rounded-full px-3 py-1.5">
                        <span className="text-lg">{getEventCategoryIcon(featuredEvent.category)}</span>
                        <span className="text-sm font-medium">{featuredEvent.category}</span>
                      </div>
                      <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-800 text-sm">🎉</span>
                      </div>
                    </div>

                    {/* Event Title */}
                    <h3 className="font-bold text-lg mb-3 leading-tight line-clamp-2">
                      {featuredEvent.title}
                </h3>

                    {/* Key Info */}
                    <div className="space-y-2 text-sm opacity-90 mb-4">
                      <div className="flex items-center space-x-3">
                        <span>📅</span>
                        <span>{formatEventDate(featuredEvent.date)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span>👥</span>
                          <span>{featuredEvent.currentParticipants} katılımcı</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>{featuredEvent.isOnline ? '💻' : '📍'}</span>
                          <span className="font-medium">
                            {featuredEvent.price === 0 ? 'ÜCRETSİZ' : `${featuredEvent.price}₺`}
                          </span>
                        </div>
                      </div>
              </div>

                    {/* Instructor - Compact */}
                    <div className="bg-white/15 rounded-xl p-3 mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">👨‍⚕️</span>
                        <div>
                          <p className="font-medium text-sm">{featuredEvent.instructor}</p>
                          <p className="text-sm opacity-75">{featuredEvent.instructorTitle}</p>
                        </div>
                </div>
              </div>

                    {/* Single CTA */}
                    <button className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-xl hover:bg-gray-100 transition-all text-base">
                      🎯 Katıl
                      {featuredEvent.price > 0 && (
                        <span className="ml-1 font-normal">({featuredEvent.price}₺)</span>
                      )}
                    </button>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-white/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm opacity-90">
                        {featuredEvent.maxParticipants - featuredEvent.currentParticipants} kota kaldı
                      </span>
                  </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-200 rounded-2xl p-4 animate-pulse">
                  <div className="h-16 bg-gray-300 rounded-lg mb-3"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
              )}

              {/* Öne Çıkan Uzmanlar */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl shadow-blue-500/10">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></span>
                  Öne Çıkan Uzmanlar
                </h3>
                <p className="text-gray-600 mb-6 text-sm">Platformumuzun en deneyimli doktorları</p>
                <div className="space-y-4">
                  {expertsLoading ? (
                    // Loading state
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : expertsError ? (
                    <div className="text-center py-4">
                      <p className="text-red-500 text-sm">Uzmanlar yüklenemedi</p>
                    </div>
                  ) : experts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">Henüz uzman bulunmuyor</p>
                    </div>
                  ) : (
                    experts.slice(0, 3).map((expert, index) => (
                      <div key={expert._id} className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Link href={`/profil/${expert.username}`}>
                              <Avatar
                                src={expert.profilePicture 
                                  ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${expert.profilePicture}`
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.firstName + ' ' + expert.lastName)}&background=10b981&color=fff`}
                                alt={`Dr. ${expert.firstName} ${expert.lastName}`}
                                size="md"
                                className="cursor-pointer hover:ring-4 hover:ring-blue-100 transition-all duration-300"
                              />
                            </Link>
                            {expert.isVerified && expert.doctorInfo.approvalStatus === 'approved' && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <Link href={`/profil/${expert.username}`}>
                                <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                                  Dr. {expert.firstName} {expert.lastName}
                                </p>
                              </Link>
                              {expert.isVerified && expert.doctorInfo.approvalStatus === 'approved' && (
                                <span className="ml-2 text-blue-500">✓</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{expert.doctorInfo.specialization}</p>
                            <p className="text-xs text-gray-500 mt-1">{expert.doctorInfo.experience} yıl deneyim</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link href="/experts">
                    <Button variant="outline" className="w-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-500">
                      <span className="mr-2">👥</span>
                      Tüm Uzmanları Görüntüle
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 