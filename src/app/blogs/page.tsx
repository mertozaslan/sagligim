'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useBlogsStore, useExpertsStore } from '@/stores';
import type { User } from '@/services/api';
import type { CreateBlogData } from '@/services/blogs';

export default function Kesfet() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCreateExpanded, setIsCreateExpanded] = useState(false);
  const [newBlog, setNewBlog] = useState<CreateBlogData>({
    title: '',
    content: '',
    excerpt: '',
    category: 'other',
    tags: [],
    images: [],
    isPublished: true,
    isFeatured: false,
    medicalDisclaimer: '',
    references: [],
    seoTitle: '',
    seoDescription: ''
  });
  
  // Zustand stores
  const {
    blogs,
    loading: blogsLoading,
    error: blogsError,
    fetchBlogs,
    createBlog,
    trendCategories
  } = useBlogsStore();

  const {
    experts,
    isLoading: expertsLoading,
    error: expertsError,
    fetchExperts
  } = useExpertsStore();

  // Blog kategorileri
  const blogCategories = [
    { value: 'medical-advice', label: 'Tıbbi Tavsiyeler', icon: '🩺', color: 'blue' },
    { value: 'health-tips', label: 'Sağlık İpuçları', icon: '💡', color: 'green' },
    { value: 'disease-information', label: 'Hastalık Bilgileri', icon: '📋', color: 'red' },
    { value: 'treatment-guides', label: 'Tedavi Rehberleri', icon: '📖', color: 'purple' },
    { value: 'prevention', label: 'Önleme', icon: '🛡️', color: 'yellow' },
    { value: 'nutrition', label: 'Beslenme', icon: '🥗', color: 'orange' },
    { value: 'mental-health', label: 'Ruh Sağlığı', icon: '🧠', color: 'pink' },
    { value: 'pediatrics', label: 'Çocuk Sağlığı', icon: '👶', color: 'cyan' },
    { value: 'geriatrics', label: 'Yaşlı Sağlığı', icon: '👴', color: 'indigo' },
    { value: 'emergency-care', label: 'Acil Bakım', icon: '🚨', color: 'red' },
    { value: 'research', label: 'Araştırma', icon: '🔬', color: 'blue' },
    { value: 'other', label: 'Diğer', icon: '💭', color: 'gray' }
  ];

  // Kullanıcının rolünü kontrol et
  const getUserRole = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.role;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const userRole = getUserRole();
  const canCreateBlog = userRole === 'doctor' || userRole === 'admin';

  // Local state for users (JSON'dan gelecek)
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Blog'ları ve uzmanları yükle
    fetchBlogs();
    fetchExperts({ limit: 3 }); // Sadece 3 uzman getir
    
    // Users için JSON'dan dummy data yükle (sadece blog yazarları için)
    const loadDummyUsers = async () => {
      try {
        const usersResponse = await fetch('/data/users.json');
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (error) {
        console.warn('Users dummy data yüklenemedi:', error);
      }
    };

    loadDummyUsers();
  }, [fetchBlogs, fetchExperts]);

  
  // Filtrelenmiş blog'lar
  const filteredBlogs = selectedTag 
    ? blogs.filter(blog => blog.category === selectedTag)
    : blogs;

  // Blog oluşturma fonksiyonları
  const handleExpandCreate = () => {
    setIsCreateExpanded(true);
  };

  const handleCollapseCreate = () => {
    setIsCreateExpanded(false);
    setNewBlog({
      title: '',
      content: '',
      excerpt: '',
      category: 'other',
      tags: [],
      images: [],
      isPublished: true,
      isFeatured: false,
      medicalDisclaimer: '',
      references: [],
      seoTitle: '',
      seoDescription: ''
    });
  };

  const handleCreateBlog = async () => {
    if (!newBlog.title.trim() || !newBlog.content.trim()) {
      alert('Başlık ve içerik alanları boş olamaz!');
      return;
    }

    try {
      await createBlog(newBlog);
      handleCollapseCreate();
    } catch (error) {
      console.error('Blog oluşturma hatası:', error);
      alert('Blog oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };


  const loading = blogsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">İçerikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (blogsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h3>
          <p className="text-gray-600 mb-8">
            {blogsError}
          </p>
          <Button 
            onClick={() => {
              fetchBlogs();
            }} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="relative bg-gray-50 min-h-screen">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sol Panel - İçerik */}
            <div className="flex-1">
              {/* Blog Oluşturma Formu - Sadece Doctor/Admin için */}
              {canCreateBlog && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    {!isCreateExpanded ? (
                      /* Compact Create Blog Trigger */
                      <div 
                        onClick={handleExpandCreate}
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-green-50/50 hover:to-blue-50/50 transition-all p-4 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar
                            src="https://ui-avatars.com/api/?name=Doctor&background=10b981&color=fff"
                            alt="Doktor"
                            size="md"
                          />
                          <div className="flex-1 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl px-6 py-4 border border-green-200">
                            <p className="text-green-700 font-medium">
                              📝 Yeni blog yazısı oluştur, sağlık bilgilerini paylaş...
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                              <span className="text-xl">📝</span>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                              <span className="text-xl">📷</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Expanded Create Blog Form */
                      <div className="space-y-6">
                        {/* Header with Close Button */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <Avatar
                              src="https://ui-avatars.com/api/?name=Doctor&background=10b981&color=fff"
                              alt="Doktor"
                              size="lg"
                            />
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">Yeni Blog Yazısı Oluştur</h3>
                              <p className="text-sm text-gray-500">Sağlık bilgilerini toplulukla paylaş</p>
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
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {blogCategories.map((category) => (
                              <button 
                                key={category.value}
                                onClick={() => setNewBlog(prev => ({ ...prev, category: category.value as any }))}
                                className={`group flex flex-col items-center space-y-2 p-4 rounded-2xl border-2 transition-all ${
                                  newBlog.category === category.value 
                                    ? 'border-green-500 bg-gradient-to-r from-green-50 to-blue-50 shadow-md' 
                                    : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
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
                            value={newBlog.title}
                            onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Blog yazınıza çekici bir başlık ver..."
                            className="w-full p-4 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none transition-all text-lg font-medium"
                            maxLength={100}
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">Maksimum 100 karakter</span>
                            <span className="text-xs text-gray-500">{newBlog.title.length}/100</span>
                          </div>
                        </div>

                        {/* Excerpt Input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📝 Özet
                          </label>
                          <textarea
                            value={newBlog.excerpt}
                            onChange={(e) => setNewBlog(prev => ({ ...prev, excerpt: e.target.value }))}
                            placeholder="Blog yazınızın kısa özetini yazın..."
                            className="w-full p-4 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none resize-none transition-all text-base leading-relaxed"
                            rows={2}
                            maxLength={200}
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">Maksimum 200 karakter</span>
                            <span className="text-xs text-gray-500">{newBlog.excerpt.length}/200</span>
                          </div>
                        </div>

                        {/* Content Textarea */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📄 İçerik
                          </label>
                          <textarea
                            value={newBlog.content}
                            onChange={(e) => setNewBlog(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Blog yazınızın detaylı içeriğini yazın..."
                            className="w-full p-4 bg-gradient-to-r from-gray-50 to-green-50 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:outline-none resize-none transition-all text-base leading-relaxed"
                            rows={8}
                            maxLength={5000}
                          />
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-500">Detaylı ve yararlı bilgi paylaş</span>
                            <span className="text-xs text-gray-500">{newBlog.content.length}/5000</span>
                          </div>
                        </div>

                        {/* Medical Disclaimer */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ⚠️ Tıbbi Uyarı
                          </label>
                          <textarea
                            value={newBlog.medicalDisclaimer}
                            onChange={(e) => setNewBlog(prev => ({ ...prev, medicalDisclaimer: e.target.value }))}
                            placeholder="Bu içerik hakkında tıbbi uyarı metni yazın..."
                            className="w-full p-4 bg-gradient-to-r from-gray-50 to-yellow-50 border-2 border-gray-200 rounded-2xl focus:border-yellow-500 focus:outline-none resize-none transition-all text-base leading-relaxed"
                            rows={3}
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>🏥</span>
                              <span>Uzman içerik</span>
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
                              onClick={handleCreateBlog}
                              disabled={!newBlog.title.trim() || !newBlog.content.trim()}
                              className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="mr-2">🚀</span>
                              Blog Yayınla
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Filtre Etiketleri */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg mr-4">
                      🔍
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Konulara Göre Filtrele
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-6">Size en uygun sağlık içeriklerini bulmak için kategorileri kullanın</p>
                  <div className="flex flex-wrap gap-3">
                    <Tag
                      active={selectedTag === null}
                      onClick={() => setSelectedTag(null)}
                    >
                      ✨ Tümü
                    </Tag>
                    {trendCategories.slice(0, 8).map((trend) => {
                      const categoryData = blogCategories.find(c => c.value === trend.name);
                      return (
                        <Tag
                          key={trend.name}
                          active={selectedTag === trend.name}
                          onClick={() => setSelectedTag(selectedTag === trend.name ? null : trend.name)}
                        >
                          {categoryData?.icon} {categoryData?.label || trend.name}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* İçerik Başlığı */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedTag ? `"${blogCategories.find(c => c.value === selectedTag)?.label || selectedTag}" Konusunda Blog Yazıları` : 'Güncel Sağlık Blog Yazıları'}
                    </h2>
                    <p className="text-gray-600">
                      {filteredBlogs.length} blog yazısı • Doktorlar tarafından yazıldı
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2 bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                    <span className="text-sm text-gray-600">Sırala:</span>
                    <select className="text-sm font-medium text-gray-900 bg-transparent border-none focus:outline-none">
                      <option>En Yeni</option>
                      <option>En Popüler</option>
                      <option>En Çok Beğenilen</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Blog Yazıları */}
              <div className="space-y-8">
                {filteredBlogs.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                      📝
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz Blog Yazısı Bulunmuyor</h3>
                    <p className="text-gray-600 text-lg mb-8">Bu kategoride henüz yayınlanmış blog yazısı yok. Diğer kategorileri keşfedebilirsiniz.</p>
                    <Button onClick={() => setSelectedTag(null)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Tüm Blog Yazılarını Görüntüle
                    </Button>
                  </div>
                ) : (
                  filteredBlogs.map((blog) => {
                    const author = blog.author;
                    if (!author) return null;

                    return (
                      <div key={blog._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-2xl"></div>
                        <div className="relative">
                          {/* Blog Header */}
                          <div className="flex items-center space-x-4 mb-6">
                            <Link href={`/profil/${author.username}`}>
                              <Avatar
                                src={author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=10b981&color=fff`}
                                alt={`${author.firstName} ${author.lastName}`}
                                size="lg"
                                className="cursor-pointer hover:ring-4 hover:ring-green-100 transition-all duration-300"
                              />
                            </Link>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Link href={`/profil/${author.username}`}>
                                  <h4 className="font-bold text-gray-900 hover:text-green-600 transition-colors cursor-pointer">
                                    Dr. {author.firstName} {author.lastName}
                                  </h4>
                                </Link>
                                <span className="text-sm text-gray-500">@{author.username}</span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  {author.role === 'doctor' ? '👨‍⚕️ Doktor' : '👨‍💼 Admin'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{new Date(blog.createdAt).toLocaleDateString('tr-TR')}</span>
                                <span>•</span>
                                <span>{blog.readingTime} dk okuma</span>
                                <span>•</span>
                                <span>{blog.views} görüntülenme</span>
                              </div>
                            </div>
                          </div>

                          {/* Blog Content */}
                          <div className="mb-6">
                            <Link href={`/blogs/${blog._id}`}>
                              <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-green-600 cursor-pointer transition-colors">
                                {blog.title}
                              </h2>
                            </Link>
                            <p className="text-gray-700 leading-relaxed mb-4">
                              {blog.excerpt}
                            </p>
                            <div className="text-gray-600 leading-relaxed">
                              <p className="line-clamp-3">{blog.content}</p>
                            </div>
                            {blog.content.length > 200 && (
                              <Link href={`/blogs/${blog._id}`}>
                                <button className="text-green-600 text-sm font-medium mt-2 hover:text-green-800 transition-colors">
                                  Devamını oku...
                                </button>
                              </Link>
                            )}
                          </div>

                          {/* Blog Tags */}
                          {blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {blog.tags.slice(0, 5).map((tag: string) => (
                                <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Blog Actions */}
                          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                            <div className="flex items-center space-x-6">
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
                                <span className="text-lg">❤️</span>
                                <span className="font-medium">{blog.likesCount || 0}</span>
                              </button>
                              <Link href={`/blogs/${blog._id}#yorumlar`}>
                                <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                                  <span className="text-lg">💬</span>
                                  <span className="font-medium">{blog.commentCount || 0}</span>
                                </button>
                              </Link>
                              <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                                <span className="text-lg">👁️</span>
                                <span className="font-medium">{blog.views || 0}</span>
                              </button>
                            </div>
                            <div className="flex items-center space-x-2">
                              {blog.isFeatured && (
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                  ⭐ Öne Çıkan
                                </span>
                              )}
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {blogCategories.find(c => c.value === blog.category)?.icon} {blogCategories.find(c => c.value === blog.category)?.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sağ Panel - Sidebar */}
            <div className="lg:w-96">
              {/* Popüler Uzmanlar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-lg mr-4">
                      👨‍⚕️
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Öne Çıkan Uzmanlar
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-sm">Platformumuzun en deneyimli doktorları</p>
                  <div className="space-y-5">
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
                            <div className="w-16 h-8 bg-gray-200 rounded"></div>
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
                                  src={expert.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.firstName + ' ' + expert.lastName)}&background=10b981&color=fff`}
                                  alt={`Dr. ${expert.firstName} ${expert.lastName}`}
                                  size="md"
                                  className="cursor-pointer hover:ring-4 hover:ring-blue-100 transition-all duration-300"
                                />
                              </Link>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                                {index + 1}
                              </div>
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
                            <Link href={`/profil/${expert.username}`}>
                              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white group-hover:shadow-lg">
                                Profil Görüntüle
                              </Button>
                            </Link>
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

              {/* Popüler Konular */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg mr-4">
                      📈
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Popüler Konular
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-sm">En çok merak edilen sağlık konuları</p>
   
                  
                  {/* Trending Topics */}
                  {trendCategories.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
    
                      <div className="space-y-3">
                        {trendCategories.slice(0, 5).map((trend, index) => {
                          const categoryData = blogCategories.find(c => c.value === trend.name);
                          return (
                            <div 
                              key={trend.name} 
                              className="flex items-center justify-between p-3 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer group"
                              onClick={() => setSelectedTag(trend.name)}
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
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 