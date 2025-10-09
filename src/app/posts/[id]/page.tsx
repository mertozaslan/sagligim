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
import SimilarContent from '@/components/SimilarContent';
import ShareModal from '@/components/ShareModal';
import Toast from '@/components/ui/Toast';
import { useQuestionsStore, useCommentsStore } from '@/stores';

export default function QuestionDetailPage() {
  const params = useParams();
  const questionId = params.id as string;
  
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Zustand stores
  const { 
    currentQuestion,
    newPosts,
    similarPosts,
    loading: questionsLoading, 
    error: questionsError, 
    fetchQuestion,
    incrementViews,
    likeQuestion,
    dislikeQuestion
  } = useQuestionsStore();
  
  // Users ve experts artık JSON dosyalarından yükleniyor

  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    fetchCommentsByPost,
    addComment,
    likeComment
  } = useCommentsStore();

  // Artık tüm questions'ı yüklemeye gerek yok, sadece current question yeterli

  useEffect(() => {
    if (questionId && questionId !== 'undefined') {
      console.log('Fetching question with ID:', questionId);
      fetchQuestion(questionId);
      incrementViews(questionId);
    }
  }, [questionId, fetchQuestion, incrementViews]);

  useEffect(() => {
    if (currentQuestion && currentQuestion._id && currentQuestion._id !== 'undefined') {
      console.log('Fetching comments for post ID:', currentQuestion._id);
      fetchCommentsByPost(currentQuestion._id, 'Post');
    }
  }, [currentQuestion, fetchCommentsByPost]);

  // Kullanıcının mevcut like/dislike durumunu kontrol et
  useEffect(() => {
    if (currentQuestion) {
      // API'den gelen isLiked/isDisliked bilgisini kullan
      setIsLiked(currentQuestion.isLiked || false);
      setIsDisliked(currentQuestion.isDisliked || false);
    }
  }, [currentQuestion]);

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

  const handleLike = async () => {
    if (!currentQuestion) return;
    
    try {
      if (isLiked) {
        // Eğer zaten beğenilmişse, like'ı kaldır
        await likeQuestion(currentQuestion._id);
        setIsLiked(false);
      } else {
        // Beğen
        await likeQuestion(currentQuestion._id);
        setIsLiked(true);
        setIsDisliked(false); // Dislike'ı kaldır
      }
    } catch (error) {
      console.error('Like hatası:', error);
    }
  };

  const handleDislike = async () => {
    if (!currentQuestion) return;
    
    try {
      if (isDisliked) {
        // Eğer zaten dislike edilmişse, dislike'i kaldır
        await dislikeQuestion(currentQuestion._id);
        setIsDisliked(false);
      } else {
        // Dislike yap
        await dislikeQuestion(currentQuestion._id);
        setIsDisliked(true);
        setIsLiked(false); // Like'ı kaldır
      }
    } catch (error) {
      console.error('Dislike hatası:', error);
    }
  };



  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleAddComment = async (content: string) => {
    if (currentQuestion) {
      try {
        await addComment({
          postId: currentQuestion._id,
          authorId: 'user1', // Dummy user ID - gerçek uygulamada auth'dan alınır
          content,
          postType: 'Post'
        });
        
        // Yorum eklendikten sonra comments'ları yeniden yükle
        await fetchCommentsByPost(currentQuestion._id, 'Post');
      } catch (error) {
        console.error('Yorum eklenirken hata:', error);
      }
    }
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId);
  };

  // Author bilgisi API'den geliyor, ayrıca çekmeye gerek yok

  // Artık API'den gelen verileri kullanıyoruz
  // getSimilarQuestions ve getRecentQuestions fonksiyonlarına gerek yok

  const loading = questionsLoading || commentsLoading;

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

  if (questionsError || commentsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h3>
          <p className="text-gray-600 mb-8">
            {questionsError || commentsError}
          </p>
          <Button 
            onClick={() => {
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
          <Link href="/posts">
            <Button>Sorulara Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Author bilgisi API'den geliyor
  const author = currentQuestion?.author;
  
  console.log('Current question:', currentQuestion);
  console.log('New posts:', newPosts);
  console.log('Similar posts:', similarPosts);
  console.log('Author:', author);
  console.log('Comments:', comments);

  // API'den gelen verileri kullan
  const similarQuestions = similarPosts;
  const recentQuestions = newPosts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Share Modal */}
      {currentQuestion && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          url={`${typeof window !== 'undefined' ? window.location.href : ''}`}
          title={currentQuestion.title}
          description={currentQuestion.content.substring(0, 200)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Ana İçerik */}
          <div className="lg:col-span-3">
            <article>
              {/* Breadcrumb */}
              <nav className="mb-12">
                <ol className="flex items-center space-x-3 text-sm text-gray-600">
                  <li><Link href="/" className="hover:text-blue-600 transition-colors font-medium">Ana Sayfa</Link></li>
                  <li className="text-gray-400">•</li>
                  <li><Link href="/posts" className="hover:text-blue-600 transition-colors font-medium">Sorular</Link></li>
                  <li className="text-gray-400">•</li>
                  <li className="text-gray-900 font-semibold truncate max-w-md">{currentQuestion.title}</li>
                </ol>
              </nav>

              {/* Question Header - Card olmadan */}
              <header className="mb-12">
                {/* Question Type ve Meta */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                      <span className="text-lg">❓</span>
                      <span>Soru</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{getTimeAgo(currentQuestion.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{currentQuestion.views || 0} görüntüleme</span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                  {currentQuestion.title}
                </h1>

                {/* Author Info */}
                {author && (
                  <div className="flex items-center space-x-4 mb-10">
                    <Link href={`/profil/${author.username}`}>
                      <Avatar
                        src={author.profilePicture 
                          ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${author.profilePicture}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=3b82f6&color=fff`}
                        alt={`${author.firstName} ${author.lastName}`}
                        size="lg"
                        className="cursor-pointer hover:ring-4 hover:ring-blue-100 transition-all duration-300"
                      />
                    </Link>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link 
                          href={`/profil/${author.username}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-lg"
                        >
                          {author.firstName} {author.lastName}
                        </Link>
                      </div>
                      <p className="text-gray-600">@{author.username}</p>
                    </div>
                  </div>
                )}

              </header>

              {/* Question Content - Card olmadan */}
              <div className="mb-12">
                {/* Post Images */}
                {currentQuestion.images && currentQuestion.images.length > 0 && (
                  <div className="mb-8">
                    {/* Ana resim */}
                    <div className="relative rounded-2xl overflow-hidden shadow-xl mb-4" style={{ height: '400px' }}>
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${currentQuestion.images[selectedImageIndex]}`}
                        alt={currentQuestion.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Thumbnail'ler (birden fazla resim varsa) */}
                    {currentQuestion.images.length > 1 && (
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {currentQuestion.images.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                              selectedImageIndex === index 
                                ? 'ring-4 ring-blue-500 scale-105' 
                                : 'hover:ring-2 hover:ring-blue-300 hover:scale-105'
                            }`}
                          >
                            <Image
                              src={`${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${imageUrl}`}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="prose prose-lg prose-blue max-w-none">
                  <div className="text-gray-800 leading-relaxed font-light">
                    {currentQuestion.content}
                  </div>
                </div>

                {/* Actions */}
                <div className="py-6 border-y border-gray-200 mt-8">
                  {/* Tags */}
                  {currentQuestion.tags && currentQuestion.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {currentQuestion.tags.map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    {/* Like Button */}
                    <button
                      onClick={handleLike}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                        isLiked ? 'bg-red-50 text-red-600 border border-red-200' : 'hover:bg-red-50 border border-transparent hover:border-red-200'
                      }`}
                    >
                      <span className={`text-xl group-hover:scale-110 transition-transform ${
                        isLiked ? 'text-red-500' : ''
                      }`}>❤️</span>
                      <span className={`font-semibold group-hover:text-red-600 ${
                        isLiked ? 'text-red-600' : 'text-gray-700'
                      }`}>{currentQuestion.likesCount || 0}</span>
                    </button>

                    {/* Dislike Button */}
                    <button
                      onClick={handleDislike}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                        isDisliked ? 'bg-gray-50 text-gray-600 border border-gray-200' : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      <span className={`text-xl group-hover:scale-110 transition-transform ${
                        isDisliked ? 'text-gray-500' : ''
                      }`}>👎</span>
                      <span className={`font-semibold group-hover:text-gray-600 ${
                        isDisliked ? 'text-gray-600' : 'text-gray-700'
                      }`}>{currentQuestion.dislikesCount || 0}</span>
                    </button>

                    {/* Comments Count */}
                    <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-200">
                      <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
                      <span className="font-semibold text-gray-700 group-hover:text-blue-600">{comments.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">


                    <button
                      onClick={handleShare}
                      className="p-3 rounded-xl text-gray-500 hover:text-green-500 hover:bg-green-50 transition-all duration-300 hover:border hover:border-green-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </button>
                  </div>
                  </div>
                </div>
              </div>

              {/* Comments/Answers */}
              <div id="yorumlar">
                <CommentBox
                  comments={comments}
                  authors={[]} // Author bilgisi API'den geliyor
                  postType="Post"
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
                authors={[]} // Author bilgisi API'den geliyor
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
            <div className="sticky top-12 space-y-8">

              {/* Yeni Sorular - Card olmadan */}
              <div className="relative">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white text-xl mr-4 shadow-lg">
                    🆕
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Yeni Paylaşımlar
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {recentQuestions.map((recentQuestion, index) => {
                    const recentAuthor = recentQuestion.author;
                    if (!recentAuthor) return null;

                    const isRecent = index < 2;

                    return (
                      <div key={recentQuestion._id} className="group">
                        <Link href={`/posts/${recentQuestion._id}`}>
                          <div className={`relative transition-all duration-300 hover:transform hover:scale-105 ${
                            isRecent 
                              ? 'p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-cyan-200 shadow-lg' 
                              : 'p-6 hover:bg-gradient-to-br hover:from-cyan-50 hover:via-blue-50 hover:to-indigo-50 rounded-2xl border border-gray-200 hover:border-cyan-200 hover:shadow-md'
                          }`}>
                            {isRecent && (
                              <div className="absolute top-4 right-4">
                                <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
                                  <span className="text-white text-xs font-bold">🔥</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="relative">
                                <Avatar
                                  src={recentAuthor.profilePicture 
                                    ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${recentAuthor.profilePicture}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(recentAuthor.firstName + ' ' + recentAuthor.lastName)}&background=3b82f6&color=fff`}
                                  alt={`${recentAuthor.firstName} ${recentAuthor.lastName}`}
                                  size="md"
                                  className="ring-2 ring-white shadow-md"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">?</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-base">{recentAuthor.firstName} {recentAuthor.lastName}</p>
                                <p className="text-sm text-gray-600">{getTimeAgo(recentQuestion.createdAt)}</p>
                              </div>
                            </div>
                            
                            <h4 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-cyan-600 transition-colors leading-snug text-lg">
                              {recentQuestion.title}
                            </h4>
                            
                            <p className="text-gray-700 line-clamp-3 mb-4 leading-relaxed">
                              {recentQuestion.content.substring(0, 120)}...
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="text-cyan-600 text-lg">❓</span>
                                </div>
                              </div>
                              <span className={`text-sm px-4 py-2 rounded-full font-semibold ${
                                isRecent 
                                  ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                              }`}>
                                {recentQuestion.commentCount || 0} cevap
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link href="/posts">
                    <Button variant="outline" size="sm" className="w-full border-2 border-gray-300 hover:border-cyan-500 hover:text-cyan-600 font-semibold py-3 text-base">
                      <span className="mr-3">❓</span>
                      Tüm Paylaşımları Görüntüle
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