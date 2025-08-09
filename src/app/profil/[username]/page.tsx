'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PostCard from '@/components/PostCard';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  verified: boolean;
  userType: 'user' | 'expert';
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  specialty?: string;
  experience?: number;
  education?: string;
  certifications?: string[];
  city?: string;
  rating?: number;
  reviewCount?: number;
  consultationFee?: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  readTime: number;
  publishDate: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  image?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [user, setUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [usersResponse, postsResponse] = await Promise.all([
          fetch('/data/users.json'),
          fetch('/data/posts.json')
        ]);
        
        const usersData = await usersResponse.json();
        const postsData = await postsResponse.json();
        
        // Kullanıcıyı username ile bul
        const foundUser = usersData.find((u: User) => u.username === username);
        
        if (foundUser) {
          setUser(foundUser);
          // Kullanıcının gönderilerini filtrele
          const userPostsFiltered = postsData.filter((post: Post) => post.authorId === foundUser.id);
          setUserPosts(userPostsFiltered);
        }
      } catch (error) {
        console.error('Profil verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [username]);

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    if (user) {
      setUser({
        ...user,
        followersCount: isFollowing ? user.followersCount - 1 : user.followersCount + 1
      });
    }
  };

  const handleLike = (postId: string) => {
    setUserPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: post.likes + 1 }
          : post
      )
    );
  };

  const handleShare = (postId: string) => {
    setUserPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, shares: post.shares + 1 }
          : post
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kullanıcı bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız profil mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-48 md:h-64"></div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 -mt-20 relative z-10">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start -mt-16 mb-4 md:mb-0">
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  size="xl"
                  className="border-4 border-white shadow-lg"
                />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                      {user.verified && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-2">{user.title}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-500 mb-4">
                      <span>📍 {user.city}</span>
                      <span>📅 {formatJoinDate(user.joinDate)} tarihinde katıldı</span>
                    </div>
                    {user.specialty && (
                      <div className="flex justify-center md:justify-start mb-4">
                        <Badge variant="primary">{user.specialty}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "primary"}
                    >
                      {isFollowing ? 'Takibi Bırak' : 'Takip Et'}
                    </Button>
                    <Button variant="outline">
                      Mesaj
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900">{user.postsCount}</div>
                    <div className="text-sm text-gray-500">Gönderi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900">{user.followersCount}</div>
                    <div className="text-sm text-gray-500">Takipçi</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-gray-900">{user.followingCount}</div>
                    <div className="text-sm text-gray-500">Takip</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'posts'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Gönderiler ({userPosts.length})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'about'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hakkında
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'posts' && (
                <div>
                  {userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz gönderi yok</h3>
                      <p className="text-gray-600">
                        {user.name} henüz herhangi bir gönderi paylaşmamış.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          author={user}
                          onLike={() => handleLike(post.id)}
                          onShare={() => handleShare(post.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'about' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Biyografi</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {user.bio || 'Henüz biyografi eklenmemiş.'}
                    </p>
                  </div>

                  {user.userType === 'expert' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Uzmanlık Bilgileri</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Uzmanlık Alanı</span>
                            <p className="text-gray-900">{user.specialty}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Unvan</span>
                            <p className="text-gray-900">{user.title}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Şehir</span>
                            <p className="text-gray-900">{user.city}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Doğrulanmış</span>
                            <p className="text-gray-900">
                              {user.verified ? (
                                <span className="inline-flex items-center text-green-600">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Evet
                                </span>
                              ) : (
                                'Hayır'
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">İstatistikler</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{user.postsCount}</div>
                          <div className="text-sm text-gray-500">Toplam Gönderi</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{user.followersCount}</div>
                          <div className="text-sm text-gray-500">Takipçi Sayısı</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">{user.followingCount}</div>
                          <div className="text-sm text-gray-500">Takip Edilen</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 