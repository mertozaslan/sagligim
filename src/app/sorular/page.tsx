'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tag from '@/components/ui/Tag';

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  publishDate: string;
  likes: number;
  supportive: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  type: 'question' | 'experience' | 'celebration' | 'support';
  tags: string[];
  publishDate: string;
  views: number;
  likes: number;
  comments: Comment[];
  mood?: 'happy' | 'worried' | 'hopeful' | 'grateful' | 'curious';
}

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  verified: boolean;
}

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
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  isOnline: boolean;
  organizer: string;
  tags: string[];
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Post creation state
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'question' as Post['type'],
    category: '',
    tags: [] as string[],
    mood: 'hopeful' as Post['mood']
  });
  const [availableTags, setAvailableTags] = useState<string[]>([
    'beslenme', 'egzersiz', 'mental-sağlık', 'kalp-sağlığı', 'diyabet', 
    'kilo-yönetimi', 'uyku', 'stres', 'motivasyon', 'başarı-hikayesi'
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [questionsResponse, usersResponse, eventsResponse] = await Promise.all([
          fetch('/data/questions.json'),
          fetch('/data/users.json'),
          fetch('/data/events.json')
        ]);
        
        const questionsData = await questionsResponse.json();
        const usersData = await usersResponse.json();
        const eventsData = await eventsResponse.json();
        
        // Dummy data için mevcut soruları postlara dönüştür
        const transformedPosts = questionsData.map((question: any) => ({
          ...question,
          type: Math.random() > 0.7 ? 'experience' : Math.random() > 0.5 ? 'celebration' : 'question',
          comments: question.answers || [],
          mood: ['happy', 'worried', 'hopeful', 'grateful', 'curious'][Math.floor(Math.random() * 5)]
        }));
        
        setPosts(transformedPosts);
        setUsers(usersData);
        setEvents(eventsData);
        
        // Rastgele bir etkinlik seç
        if (eventsData.length > 0) {
          const randomEvent = eventsData[Math.floor(Math.random() * eventsData.length)];
          setFeaturedEvent(randomEvent);
        }
        
      } catch (error) {
        console.error('Topluluk verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Kategoriler
  const categories = Array.from(new Set(posts.map(post => post.category)));

  // Post tipleri
  const postTypes = [
    { value: 'question', label: 'Sorular', icon: '❓', color: 'blue' },
    { value: 'experience', label: 'Deneyimler', icon: '💭', color: 'purple' },
    { value: 'celebration', label: 'Başarı Hikayeleri', icon: '🎉', color: 'green' },
    { value: 'support', label: 'Destek Arayışı', icon: '🤝', color: 'orange' }
  ];

  // Mood iconları
  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'worried': return '😟';
      case 'hopeful': return '🌟';
      case 'grateful': return '🙏';
      case 'curious': return '🤔';
      default: return '💭';
    }
  };

  // Post type iconları
  const getTypeIcon = (type: string) => {
    const typeData = postTypes.find(t => t.value === type);
    return typeData?.icon || '💭';
  };

  const getTypeColor = (type: string) => {
    const typeData = postTypes.find(t => t.value === type);
    return typeData?.color || 'gray';
  };

  // Filtrelenmiş postlar
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesType = !selectedType || post.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
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

  const handleLike = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
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
      type: 'question',
      category: '',
      tags: [],
      mood: 'hopeful'
    });
  };

  const handleTagToggle = (tag: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Başlık ve içerik alanları boş olamaz!');
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      authorId: 'current-user', // Normalde login sisteminden gelecek
      category: newPost.category || 'Genel',
      type: newPost.type,
      tags: newPost.tags,
      publishDate: new Date().toISOString(),
      views: 0,
      likes: 0,
      comments: [],
      mood: newPost.mood
    };

    setPosts(prev => [post, ...prev]);
    handleCollapseCreate();
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

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit',
      minute: '2-digit'
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

  const getCategoryIcon = (category: string) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Topluluk yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      {/* Elegant Filter Bar */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 mr-2">Kategoriler:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedType('')}
                  className={selectedType === '' 
                    ? 'px-5 py-2.5 rounded-2xl text-sm font-medium transition-all bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                    : 'px-5 py-2.5 rounded-2xl text-sm font-medium transition-all bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                  }
                >
                  🌟 Tümü
                </button>
                {postTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={selectedType === type.value 
                      ? 'px-5 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'px-5 py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center space-x-2 bg-white/70 text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                    }
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span>{type.label}</span>
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
                  {['Kalp Sağlığı', 'Beslenme', 'Mental Sağlık', 'Egzersiz', 'Uyku'].map((topic, index) => (
                    <div key={topic} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer group">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">#{index + 1}</span>
                        <span className="font-medium text-gray-700 group-hover:text-blue-600">{topic}</span>
                      </div>
                      <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 px-2 py-1 rounded-full">
                        {Math.floor(Math.random() * 50) + 10}
                      </span>
                    </div>
                  ))}
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
                      src="/api/placeholder/50/50"
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
                        src="/api/placeholder/50/50"
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

                  {/* Post Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      📝 Paylaşım Türü
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {postTypes.map((type) => (
                        <button 
                          key={type.value}
                          onClick={() => setNewPost(prev => ({ ...prev, type: type.value as Post['type'] }))}
                          className={`group flex flex-col items-center space-y-2 p-4 rounded-2xl border-2 transition-all ${
                            newPost.type === type.value 
                              ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md' 
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                          }`}
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform">{type.icon}</span>
                          <span className="text-sm font-medium text-center">{type.label}</span>
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
                      maxLength={100}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Maksimum 100 karakter</span>
                      <span className="text-xs text-gray-500">{newPost.title.length}/100</span>
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
                      maxLength={1000}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Detaylı ve yararlı bilgi paylaş</span>
                      <span className="text-xs text-gray-500">{newPost.content.length}/1000</span>
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🏷️ Kategori
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.length > 0 && categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setNewPost(prev => ({ ...prev, category }))}
                          className={`px-4 py-2 rounded-2xl border-2 transition-all ${
                            newPost.category === category
                              ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 font-medium'
                              : 'border-gray-200 hover:border-purple-300 text-gray-700'
                          }`}
                        >
                    {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      🏷️ Etiketler (Max 5)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          disabled={!newPost.tags.includes(tag) && newPost.tags.length >= 5}
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
                    {newPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl">
                        <span className="text-sm font-medium text-green-700">Seçilen etiketler:</span>
                        {newPost.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-green-200 text-green-800 rounded-xl text-sm font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mood Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      😊 Ruh Halin
                    </label>
                    <div className="flex space-x-3">
                      {[
                        { value: 'happy', icon: '😊', label: 'Mutlu' },
                        { value: 'hopeful', icon: '🌟', label: 'Umutlu' },
                        { value: 'worried', icon: '😟', label: 'Endişeli' },
                        { value: 'grateful', icon: '🙏', label: 'Minnettar' },
                        { value: 'curious', icon: '🤔', label: 'Meraklı' }
                      ].map((mood) => (
                        <button
                          key={mood.value}
                          onClick={() => setNewPost(prev => ({ ...prev, mood: mood.value as Post['mood'] }))}
                          className={`flex flex-col items-center space-y-1 p-3 rounded-2xl border-2 transition-all ${
                            newPost.mood === mood.value
                              ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-md'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <span className="text-2xl">{mood.icon}</span>
                          <span className="text-xs font-medium">{mood.label}</span>
                        </button>
                      ))}
                    </div>
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
                        disabled={!newPost.title.trim() || !newPost.content.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="mr-2">🚀</span>
                        Paylaş
            </Button>
          </div>
        </div>
                </div>
              )}
            </div>

            {/* Active Filters - Modern Style */}
            {(searchTerm || selectedType || selectedCategory) && (
              <div className="mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Aktif filtreler:
                  </span>
                  {searchTerm && (
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-2xl text-sm font-medium flex items-center">
                      🔍 "{searchTerm}"
                      <button onClick={() => setSearchTerm('')} className="ml-2 text-blue-600 hover:text-blue-800 font-bold">×</button>
                    </span>
                  )}
                  {selectedType && (
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 rounded-2xl text-sm font-medium flex items-center">
                      {postTypes.find(t => t.value === selectedType)?.icon} {postTypes.find(t => t.value === selectedType)?.label}
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
                  const author = getUserById(post.authorId);
                    if (!author) return null;

                    return (
                    <article key={post.id} className="group bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-200 overflow-hidden">
                      
                      {/* Modern Header - LinkedIn Style */}
                      <div className="p-4 md:p-6">
                        <div className="flex items-center space-x-4 mb-5">
                          <div className="relative">
                            <Avatar
                              src={author.avatar}
                              alt={author.name}
                              size="lg"
                            />
                                {author.verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors">{author.name}</h4>
                              {author.verified && (
                                <span className="text-blue-500 text-sm">•</span>
                              )}
                              <span className="text-sm text-gray-500 font-medium">{author.title}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{getTimeAgo(post.publishDate)}</span>
                                <span>•</span>
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                </svg>
                                <span>{post.views}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                              post.type === 'question' ? 'bg-blue-100 text-blue-700' :
                              post.type === 'experience' ? 'bg-purple-100 text-purple-700' :
                              post.type === 'celebration' ? 'bg-green-100 text-green-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              <span>{getTypeIcon(post.type)}</span>
                              <span>{postTypes.find(t => t.value === post.type)?.label}</span>
                            </div>
                            <div className="text-xl">{getMoodIcon(post.mood)}</div>
                          </div>
                        </div>

                        {/* Content Area - Instagram Style */}
                        <div className="mb-5">
                          <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2">
                            {post.title}
                          </h2>
                          <div className="text-gray-700 leading-relaxed">
                            <p className="line-clamp-4">{post.content}</p>
                          </div>
                          {post.content.length > 200 && (
                            <button className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-800 transition-colors">
                              Devamını oku...
                            </button>
                          )}
                        </div>

                        {/* Modern Tags */}
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-5">
                            {post.tags.slice(0, 3).map((tag) => (
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
                      </div>

                      {/* Compact Engagement Bar */}
                      <div className="px-4 md:px-6 py-3 bg-gray-50/30 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          
                          {/* Interactive Actions with Counts */}
                          <div className="flex items-center space-x-1">
                            
                            {/* Like */}
                              <button
                              onClick={() => handleLike(post.id)}
                              className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-red-50 transition-all group"
                            >
                              <span className="text-lg group-hover:scale-110 transition-transform">❤️</span>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-red-600">{post.likes}</span>
                            </button>

                            {/* Comment */}
                            <button className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-blue-50 transition-all group">
                              <span className="text-lg group-hover:scale-110 transition-transform">💬</span>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{post.comments.length}</span>
                              </button>

                            {/* Support */}
                            <button className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-green-50 transition-all group">
                              <span className="text-lg group-hover:scale-110 transition-transform">🤝</span>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-green-600">12</span>
                            </button>
                            </div>

                          {/* Quick Actions */}
                          <div className="flex items-center space-x-1">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span className="text-lg">{getCategoryIcon(featuredEvent.category)}</span>
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


            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 