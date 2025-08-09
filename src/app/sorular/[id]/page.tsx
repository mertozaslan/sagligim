'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tag from '@/components/ui/Tag';
import CommentBox from '@/components/CommentBox';
import SimilarContent from '@/components/SimilarContent';
import { useQuestionsStore, useUsersStore, useCommentsStore } from '@/stores';
import type { Question, User, Expert, Comment } from '@/services/api';

export default function QuestionDetailPage() {
  const params = useParams();
  const questionId = params.id as string;
  
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Zustand stores
  const { 
    questions, 
    currentQuestion, 
    loading: questionsLoading, 
    error: questionsError, 
    fetchQuestions, 
    fetchQuestion,
    incrementViews
  } = useQuestionsStore();
  
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
    fetchQuestions();
    fetchUsers();
    fetchExperts();
  }, [fetchQuestions, fetchUsers, fetchExperts]);

  useEffect(() => {
    if (questionId) {
      fetchQuestion(questionId);
      incrementViews(questionId);
    }
  }, [questionId, fetchQuestion, incrementViews]);

  useEffect(() => {
    if (currentQuestion) {
      fetchCommentsByPost(currentQuestion.id);
    }
  }, [currentQuestion, fetchCommentsByPost]);

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
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share && currentQuestion) {
      navigator.share({
        title: currentQuestion.title,
        text: currentQuestion.content.substring(0, 100),
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const handleAddComment = (content: string) => {
    if (currentQuestion) {
      addComment({
        postId: currentQuestion.id,
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

  // Benzer soruları bul
  const getSimilarQuestions = () => {
    if (!currentQuestion) return [];
    
    return questions
      .filter(q => q.id !== currentQuestion.id && (
        q.category === currentQuestion.category || 
        q.tags.some(tag => currentQuestion.tags.includes(tag))
      ))
      .slice(0, 3);
  };

  // Yeni sorular
  const getRecentQuestions = () => {
    return questions
      .filter(q => q.id !== currentQuestion?.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  };

  const loading = questionsLoading || usersLoading || commentsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Soru yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (questionsError || usersError || commentsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h3>
          <p className="text-gray-600 mb-8">
            {questionsError || usersError || commentsError}
          </p>
          <Button 
            onClick={() => {
              fetchQuestions();
              fetchUsers();
              fetchExperts();
              if (questionId) fetchQuestion(questionId);
            }} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Soru bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız soru mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/sorular">
            <Button>Sorulara Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const author = getAuthorById(currentQuestion.authorId);
  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yazar bilgisi bulunamadı</h1>
          <p className="text-gray-600 mb-6">Bu sorunun yazarına ait bilgi bulunamadı.</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const similarQuestions = getSimilarQuestions();
  const recentQuestions = getRecentQuestions();

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
                  <li><Link href="/sorular" className="hover:text-blue-600">Sorular</Link></li>
                  <li>•</li>
                  <li className="text-gray-900 font-medium">{currentQuestion.title}</li>
                </ol>
              </nav>

              {/* Question Header */}
              <header className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-6 md:p-8">
                  {/* Question Type */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 bg-blue-100 text-blue-700">
                        <span>❓</span>
                        <span>Soru</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{getTimeAgo(currentQuestion.createdAt)}</p>
                      <p>{currentQuestion.views} görüntüleme</p>
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {currentQuestion.title}
                  </h1>

                  {/* Author Info */}
                  <div className="flex items-center space-x-4 mb-6">
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
                        <span className="font-medium">{currentQuestion.views}</span>
                      </button>

                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span className="font-medium">{comments.length}</span>
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

              {/* Question Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
                <div className="prose prose-blue max-w-none">
                  <div className="text-gray-800 leading-relaxed text-lg">
                    {currentQuestion.content}
                  </div>
                </div>

                {/* Tags */}
                {currentQuestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
                    {currentQuestion.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments/Answers */}
              <div id="yorumlar">
                <CommentBox
                  comments={comments}
                  authors={[...users, ...experts]}
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                />
              </div>

              {/* Benzer Paylaşımlar */}
              <SimilarContent
                title="Benzer Paylaşımlar"
                subtitle="İlginizi çekebilecek diğer deneyimler ve paylaşımlar"
                icon="💬"
                items={similarQuestions}
                authors={[...users, ...experts]}
                type="questions"
                getTimeAgo={getTimeAgo}
                gradientColors={{
                  bg: "bg-gradient-to-br from-white via-amber-50/40 to-orange-50/40",
                  decorative1: "bg-gradient-to-br from-amber-400/10 to-orange-400/10",
                  decorative2: "bg-gradient-to-br from-orange-400/10 to-red-400/10",
                  iconBg: "bg-gradient-to-br from-amber-500 to-orange-500",
                  titleGradient: "bg-gradient-to-r from-gray-900 via-amber-800 to-orange-800",
                  cardHover: "bg-gradient-to-br from-transparent via-transparent to-amber-50/30",
                  statusColors: {
                    active: "bg-green-100 text-green-700",
                    inactive: "bg-amber-100 text-amber-700"
                  }
                }}
              />
            </article>
          </div>

          {/* Sağ Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">


              {/* Yeni Sorular */}
              <div className="relative overflow-hidden bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/30 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-xl"></div>
                <div className="relative p-6">
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-lg mr-4">
                      🆕
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Yeni Sorular
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {recentQuestions.map((recentQuestion, index) => {
                      const recentAuthor = getAuthorById(recentQuestion.authorId);
                      if (!recentAuthor) return null;

                      const isRecent = index < 2;

                      return (
                        <div key={recentQuestion.id} className="group">
                          <Link href={`/sorular/${recentQuestion.id}`}>
                            <div className={`relative p-4 rounded-xl transition-all duration-300 hover:shadow-lg border ${
                              isRecent 
                                ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200 hover:scale-105' 
                                : 'bg-white border-gray-100 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:border-cyan-200'
                            }`}>
                              {isRecent && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">🔥</span>
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="relative">
                                  <Avatar
                                    src={recentAuthor.avatar}
                                    alt={recentAuthor.name}
                                    size="sm"
                                    className="ring-2 ring-white shadow-sm"
                                  />
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">?</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{recentAuthor.name}</p>
                                  <p className="text-xs text-gray-500">{getTimeAgo(recentQuestion.createdAt)}</p>
                                </div>
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors leading-snug">
                                {recentQuestion.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                                {recentQuestion.content.substring(0, 80)}...
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="text-cyan-600 text-sm">❓</span>
                                  </div>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                  isRecent 
                                    ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {recentQuestion.answersCount} cevap
                                </span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <Link href="/sorular">
                      <Button variant="outline" size="sm" className="w-full border-2 border-gray-200 hover:border-cyan-500 hover:text-cyan-600 font-semibold">
                        <span className="mr-2">❓</span>
                        Tüm Soruları Görüntüle
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 