'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tag from '@/components/ui/Tag';
import CommentBox from '@/components/CommentBox';
import PostCard from '@/components/PostCard';
import { usePostsStore, useUsersStore, useCommentsStore } from '@/stores';
import type { Post, User, Expert } from '@/services/api';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Zustand stores
  const { 
    posts, 
    currentPost, 
    loading: postsLoading, 
    error: postsError, 
    fetchPosts, 
    fetchPost,
    likePost,
    sharePost
  } = usePostsStore();
  
  const { 
    users, 
    experts, 
    loading: usersLoading, 
    error: usersError, 
    fetchUsers, 
    fetchExperts 
  } = useUsersStore();

  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    fetchCommentsByPost,
    addComment,
    likeComment
  } = useCommentsStore();

  useEffect(() => {
    // Verileri yükle
    fetchPosts();
    fetchUsers();
    fetchExperts();
  }, [fetchPosts, fetchUsers, fetchExperts]);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug, fetchPost]);

  useEffect(() => {
    if (currentPost) {
      fetchCommentsByPost(currentPost.id);
    }
  }, [currentPost, fetchCommentsByPost]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    
    return formatDate(dateString);
  };

  const handleLike = () => {
    if (currentPost) {
      likePost(currentPost.id);
      setIsLiked(!isLiked);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share && currentPost) {
      navigator.share({
        title: currentPost.title,
        text: currentPost.content.substring(0, 150) + '...',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
    
    if (currentPost) {
      sharePost(currentPost.id);
    }
  };

  const handleAddComment = (content: string) => {
    if (currentPost) {
      addComment({
        postId: currentPost.id,
        authorId: 'user1', // Dummy user ID - gerçek uygulamada auth'dan alınır
        content
      });
    }
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId);
  };

  // Kullanıcı bilgisini bul
  const getAuthorById = (authorId: string): User | Expert | null => {
    const user = users.find(user => user.id === authorId);
    if (user) return user;
    
    const expert = experts.find(expert => expert.id === authorId);
    return expert || null;
  };

  // Benzer makaleleri bul
  const getSimilarPosts = () => {
    if (!currentPost) return [];
    
    return posts
      .filter(p => p.id !== currentPost.id && (
        p.category === currentPost.category || 
        p.tags.some(tag => currentPost.tags.includes(tag))
      ))
      .slice(0, 3);
  };

  // Yeni gönderiler
  const getRecentPosts = () => {
    return posts
      .filter(p => p.id !== currentPost?.id)
      .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      .slice(0, 4);
  };

  const loading = postsLoading || usersLoading || commentsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Makale yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (postsError || usersError || commentsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h3>
          <p className="text-gray-600 mb-8">
            {postsError || usersError || commentsError}
          </p>
          <Button 
            onClick={() => {
              fetchPosts();
              fetchUsers();
              fetchExperts();
              if (slug) fetchPost(slug);
            }} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Makale bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const author = getAuthorById(currentPost.authorId);
  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yazar bilgisi bulunamadı</h1>
          <p className="text-gray-600 mb-6">Bu makalenin yazarına ait bilgi bulunamadı.</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const similarPosts = getSimilarPosts();
  const recentPosts = getRecentPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-3">
            <article>
              {/* Breadcrumb */}
              <nav className="mb-8">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li><Link href="/" className="hover:text-blue-600">Ana Sayfa</Link></li>
                  <li>•</li>
                  <li><Link href="/kesfet" className="hover:text-blue-600">Keşfet</Link></li>
                  <li>•</li>
                  <li className="text-gray-900 font-medium">{currentPost.title}</li>
                </ol>
              </nav>

              {/* Header */}
              <header className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                {/* Cover Image */}
                {currentPost.image && (
                  <div className="relative h-64 md:h-80 w-full">
                    <Image
                      src={currentPost.image}
                      alt={currentPost.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {/* Category */}
                  <div className="mb-4">
                    <Badge variant="primary">{currentPost.category}</Badge>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {currentPost.title}
                  </h1>

                  {/* Author & Meta Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <Link href={`/profil/${author.username}`}>
                        <Avatar
                          src={author.avatar}
                          alt={author.name}
                          size="md"
                          className="cursor-pointer"
                        />
                      </Link>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Link 
                            href={`/profil/${author.username}`}
                            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {author.name}
                          </Link>
                          {author.verified && (
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{author.title}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{getTimeAgo(currentPost.publishDate)}</p>
                      <p>{currentPost.readTime} dakika okuma</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2 transition-colors ${
                          isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="font-medium">{currentPost.likes}</span>
                      </button>

                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-medium">{currentPost.comments}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleBookmark}
                        className={`p-2 rounded-full transition-colors ${
                          isBookmarked ? 'text-blue-500 bg-blue-50' : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>

                      <button
                        onClick={handleShare}
                        className="p-2 rounded-full text-gray-500 hover:text-green-500 hover:bg-green-50 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
                <div className="prose prose-blue max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: currentPost.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
                  {currentPost.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div id="yorumlar">
                <CommentBox
                  comments={comments}
                  authors={[...users, ...experts]}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                />
              </div>

              {/* Benzer Makaleler */}
              {similarPosts.length > 0 && (
                <div className="mt-12">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="text-blue-600 mr-3">📚</span>
                      Benzer Makaleler
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {similarPosts.map((similarPost) => {
                        const similarAuthor = getAuthorById(similarPost.authorId);
                        if (!similarAuthor) return null;

                        return (
                          <div key={similarPost.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar
                                src={similarAuthor.avatar}
                                alt={similarAuthor.name}
                                size="sm"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{similarAuthor.name}</p>
                                <p className="text-xs text-gray-500">{getTimeAgo(similarPost.publishDate)}</p>
                              </div>
                            </div>
                            <Link href={`/makale/${similarPost.slug}`}>
                              <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                                {similarPost.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {similarPost.content.substring(0, 100)}...
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="primary" size="sm">
                                {similarPost.category}
                              </Badge>
                              <span className="text-xs text-gray-500">{similarPost.readTime} dk</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </article>
          </div>

          {/* Sağ Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Author Card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yazar Hakkında</h3>
                <div className="text-center">
                  <Link href={`/profil/${author.username}`}>
                    <Avatar
                      src={author.avatar}
                      alt={author.name}
                      size="lg"
                      className="mx-auto mb-3 cursor-pointer"
                    />
                  </Link>
                  <h4 className="font-semibold text-gray-900 mb-1">{author.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{author.title}</p>
                  {'specialty' in author && (
                    <Badge variant="primary" size="sm" className="mb-3">
                      {author.specialty}
                    </Badge>
                  )}
                  <p className="text-xs text-gray-500 mb-4 line-clamp-3">
                    {author.bio}
                  </p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Takip Et
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Mesaj
                    </Button>
                  </div>
                </div>
              </div>

              {/* Yeni Gönderiler */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-green-600 mr-2">🆕</span>
                  Yeni Gönderiler
                </h3>
                <div className="space-y-4">
                  {recentPosts.map((recentPost) => {
                    const recentAuthor = getAuthorById(recentPost.authorId);
                    if (!recentAuthor) return null;

                    return (
                      <div key={recentPost.id} className="group">
                        <Link href={`/makale/${recentPost.slug}`}>
                          <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3 mb-2">
                              <Avatar
                                src={recentAuthor.avatar}
                                alt={recentAuthor.name}
                                size="sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{recentAuthor.name}</p>
                                <p className="text-xs text-gray-500">{getTimeAgo(recentPost.publishDate)}</p>
                              </div>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {recentPost.title}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {recentPost.content.substring(0, 80)}...
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="primary" size="sm">
                                {recentPost.category}
                              </Badge>
                              <span className="text-xs text-gray-500">{recentPost.readTime} dk</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href="/kesfet">
                    <Button variant="outline" size="sm" className="w-full">
                      Tüm Gönderileri Görüntüle
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Popüler Konular */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-purple-600 mr-2">🔥</span>
                  Popüler Konular
                </h3>
                <div className="space-y-3">
                  {['kalp-sağlığı', 'beslenme', 'egzersiz', 'mental-sağlık', 'uyku'].map((topic) => {
                    const postCount = posts.filter(p => p.tags.includes(topic)).length;
                    return (
                      <Link key={topic} href={`/kesfet?tag=${topic}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <span className="text-sm font-medium text-gray-700">#{topic}</span>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {postCount}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Hızlı Aksiyonlar */}
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4 text-white">
                  <h4 className="font-bold text-sm mb-2">💡 Soru Sorun</h4>
                  <p className="text-blue-100 text-xs mb-3">
                    Aklınızdaki sağlık sorularını uzmanlarımıza sorun!
                  </p>
                  <Link href="/sorular">
                    <Button size="sm" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold w-full">
                      Soru Sor
                    </Button>
                  </Link>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-lg p-4 text-white">
                  <h4 className="font-bold text-sm mb-2">👨‍⚕️ Uzman Desteği</h4>
                  <p className="text-green-100 text-xs mb-3">
                    Bu konuda uzman doktorlarımızla görüşün!
                  </p>
                  <Button size="sm" className="bg-white text-green-600 hover:bg-gray-100 font-semibold w-full">
                    Uzman Desteği Al
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 