'use client';

import React, { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import PopularTopics from '@/components/PopularTopics';
import Tag from '@/components/ui/Tag';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { usePostsStore, useUsersStore } from '@/stores';
import type { Post, User, Expert } from '@/services/api';

export default function Kesfet() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Zustand stores
  const { 
    posts, 
    loading: postsLoading, 
    error: postsError, 
    fetchPosts 
  } = usePostsStore();
  
  const { 
    users, 
    experts, 
    loading: usersLoading, 
    error: usersError, 
    fetchUsers, 
    fetchExperts 
  } = useUsersStore();

  useEffect(() => {
    // Verileri yükle
    fetchPosts();
    fetchUsers();
    fetchExperts();
  }, [fetchPosts, fetchUsers, fetchExperts]);

  // Tüm etiketleri al
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags)));
  
  // Filtrelenmiş gönderiler
  const filteredPosts = selectedTag 
    ? posts.filter(post => post.tags.includes(selectedTag))
    : posts;

  // Kullanıcı bilgisini bul
  const getAuthorById = (authorId: string): User | Expert | null => {
    const user = users.find(user => user.id === authorId);
    if (user) return user;
    
    const expert = experts.find(expert => expert.id === authorId);
    return expert || null;
  };

  const loading = postsLoading || usersLoading;

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

  if (postsError || usersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h3>
          <p className="text-gray-600 mb-8">
            {postsError || usersError}
          </p>
          <Button 
            onClick={() => {
              fetchPosts();
              fetchUsers();
              fetchExperts();
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
                    {allTags.slice(0, 8).map((tag) => (
                      <Tag
                        key={tag}
                        active={selectedTag === tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      >
                        {tag}
                      </Tag>
                    ))}
                  </div>
                </div>
              </div>

              {/* İçerik Başlığı */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedTag ? `"${selectedTag}" Konusunda İçerikler` : 'Güncel Sağlık İçerikleri'}
                    </h2>
                    <p className="text-gray-600">
                      {filteredPosts.length} içerik • Uzmanlar tarafından onaylandı
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

              {/* Gönderiler */}
              <div className="space-y-8">
                {filteredPosts.length === 0 ? (
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-16 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                      📝
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz İçerik Bulunmuyor</h3>
                    <p className="text-gray-600 text-lg mb-8">Bu kategoride henüz yayınlanmış içerik yok. Diğer kategorileri keşfedebilirsiniz.</p>
                    <Button onClick={() => setSelectedTag(null)} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Tüm İçerikleri Görüntüle
                    </Button>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const author = getAuthorById(post.authorId);
                    if (!author) return null;

                    return (
                      <PostCard
                        key={post.id}
                        post={post}
                        author={author}
                      />
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
                    {experts.slice(0, 3).map((expert, index) => (
                      <div key={expert.id} className="group relative bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar
                              src={expert.avatar}
                              alt={expert.name}
                              size="md"
                            />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="font-semibold text-gray-900">{expert.name}</p>
                              <span className="ml-2 text-blue-500">✓</span>
                            </div>
                            <p className="text-sm text-gray-600">{expert.specialty}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex text-yellow-400 text-xs">
                                ⭐⭐⭐⭐⭐
                              </div>
                              <span className="text-xs text-gray-500 ml-1">({expert.rating})</span>
                            </div>
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white group-hover:shadow-lg">
                            Takip Et
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button variant="outline" className="w-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-500">
                      <span className="mr-2">👥</span>
                      Tüm Uzmanları Görüntüle
                    </Button>
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
                  <PopularTopics 
                    posts={posts} 
                    onTopicClick={setSelectedTag} 
                    variant="main" 
                  />
                  

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 