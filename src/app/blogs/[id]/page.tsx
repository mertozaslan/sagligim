'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { OptimizedImage, getImageUrl } from '@/utils/imageUtils';
import CommentBox from '@/components/CommentBox';
import SimilarContent from '@/components/SimilarContent';
import ShareModal from '@/components/ShareModal';
import Toast from '@/components/ui/Toast';
import { useBlogsStore, useCommentsStore } from '@/stores';

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params.id as string;
  
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Zustand stores
  const { 
    currentBlog,
    newBlogs,
    similarBlogs,
    loading: blogsLoading, 
    error: blogsError, 
    fetchBlog,
    likeBlog,
    dislikeBlog
  } = useBlogsStore();

  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    fetchCommentsByPost,
    addComment,
    likeComment
  } = useCommentsStore();

  useEffect(() => {
    if (blogId && blogId !== 'undefined') {
      console.log('Fetching blog with ID:', blogId);
      fetchBlog(blogId);
    }
  }, [blogId, fetchBlog]);

  useEffect(() => {
    if (currentBlog && currentBlog._id && currentBlog._id !== 'undefined') {
      console.log('Fetching comments for blog ID:', currentBlog._id);
      fetchCommentsByPost(currentBlog._id, 'Blog');
    }
  }, [currentBlog, fetchCommentsByPost]);

  // Kullanıcının mevcut like/dislike durumunu kontrol et
  useEffect(() => {
    if (currentBlog) {
      // API'den gelen isLiked/isDisliked bilgisini kullan
      setIsLiked(currentBlog.isLiked || false);
      setIsDisliked(currentBlog.isDisliked || false);
    }
  }, [currentBlog]);

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
    if (!currentBlog) return;
    
    try {
      if (isLiked) {
        // Eğer zaten beğenilmişse, like'ı kaldır
        await likeBlog(currentBlog._id);
        setIsLiked(false);
      } else {
        // Beğen
        await likeBlog(currentBlog._id);
        setIsLiked(true);
        setIsDisliked(false); // Dislike'ı kaldır
      }
    } catch (error) {
      console.error('Like hatası:', error);
    }
  };

  const handleDislike = async () => {
    if (!currentBlog) return;
    
    try {
      if (isDisliked) {
        // Eğer zaten dislike edilmişse, dislike'i kaldır
        await dislikeBlog(currentBlog._id);
        setIsDisliked(false);
      } else {
        // Dislike yap
        await dislikeBlog(currentBlog._id);
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
    if (currentBlog) {
      try {
        await addComment({
          postId: currentBlog._id,
          authorId: 'user1', // Dummy user ID - gerçek uygulamada auth'dan alınır
          content,
          postType: 'Blog'
        });
        
        // Yorum eklendikten sonra comments'ları yeniden yükle
        await fetchCommentsByPost(currentBlog._id, 'Blog');
      } catch (error) {
        console.error('Yorum eklenirken hata:', error);
      }
    }
  };

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId);
  };

  const loading = blogsLoading || commentsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Uzman paylaşımı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (blogsError || commentsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ❌
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Hata Oluştu</h3>
          <p className="text-gray-600 mb-8">
            {blogsError || commentsError}
          </p>
          <Button 
            onClick={() => {
              if (blogId) fetchBlog(blogId);
            }} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
          >
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Uzman paylaşımı bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız uzman paylaşımı mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/blogs">
            <Button>Uzman Paylaşımlarına Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Author bilgisi API'den geliyor
  const author = currentBlog?.author;
  
  console.log('Current blog:', currentBlog);
  console.log('New blogs:', newBlogs);
  console.log('Similar blogs:', similarBlogs);
  console.log('Author:', author);
  console.log('Comments:', comments);

  // API'den gelen verileri kullan
  const similarBlogsList = similarBlogs;
  const recentBlogs = newBlogs;

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
      {currentBlog && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          url={`${typeof window !== 'undefined' ? window.location.href : ''}`}
          title={currentBlog.title}
          description={currentBlog.content.substring(0, 200)}
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
                  <li><Link href="/blogs" className="hover:text-blue-600 transition-colors font-medium">Uzman Paylaşımları</Link></li>
                  <li className="text-gray-400">•</li>
                  <li className="text-gray-900 font-semibold truncate max-w-md">{currentBlog.title}</li>
                </ol>
              </nav>

              {/* Blog Header */}
              <header className="mb-12">
                {/* Blog Type ve Meta */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                      <span className="text-lg">👨‍⚕️</span>
                      <span>Uzman Paylaşımı</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{getTimeAgo(currentBlog.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <span>{currentBlog.views || 0} görüntüleme</span>
                      <span className="mx-2">•</span>
                      <span>{currentBlog.readTime || 5} dk okuma</span>
                      <span className="mx-2">•</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Tıbbi İçerik
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                  {currentBlog.title}
                </h1>

                {/* Author Info */}
                {author && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-10 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <Link href={`/profil/${author.username}`}>
                        <Avatar
                          src={author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=3b82f6&color=fff`}
                          alt={`${author.firstName} ${author.lastName}`}
                          size="lg"
                          className="cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all duration-300 ring-4 ring-blue-100"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Link 
                            href={`/profil/${author.username}`}
                            className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-xl"
                          >
                            Dr. {author.firstName} {author.lastName}
                          </Link>
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            Uzman Hekim
                          </div>
                        </div>
   
                      </div>
                    </div>
                  </div>
                )}
              </header>

              {/* Blog Content */}
              <div className="mb-12">
                {/* Blog Images */}
                {currentBlog.images && currentBlog.images.length > 0 && (
                  <div className="mb-8">
                    {/* Ana resim */}
                    <div className="relative rounded-2xl overflow-hidden shadow-xl mb-4" style={{ height: '400px' }}>
                      <OptimizedImage
                        src={getImageUrl(currentBlog.images[selectedImageIndex])}
                        alt={currentBlog.title}
                        fill
                        className="object-cover"
                        priority={true}
                        loading="eager"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      />
                    </div>

                    {/* Thumbnail'ler (birden fazla resim varsa) */}
                    {currentBlog.images.length > 1 && (
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {currentBlog.images.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                              selectedImageIndex === index 
                                ? 'ring-4 ring-green-500 scale-105' 
                                : 'hover:ring-2 hover:ring-green-300 hover:scale-105'
                            }`}
                          >
                            <OptimizedImage
                              src={getImageUrl(imageUrl)}
                              alt={`Thumbnail ${index + 1}`}
                              fill
                              className="object-cover"
                              priority={false}
                              loading="lazy"
                              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Medical Disclaimer */}
                {currentBlog.medicalDisclaimer && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <span className="text-amber-600 text-xl">⚠️</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Tıbbi Uyarı
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>{currentBlog.medicalDisclaimer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="prose prose-lg prose-blue max-w-none bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="text-gray-800 leading-relaxed font-light">
                    {currentBlog.content}
                  </div>
                </div>

                {/* Actions */}
                <div className="py-6 border-y border-gray-200 mt-8">
                  {/* Tags */}
                  {currentBlog.tags && currentBlog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {currentBlog.tags.map((tag) => (
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
                        }`}>{currentBlog.likesCount || 0}</span>
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
                        }`}>{currentBlog.dislikesCount || 0}</span>
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
                  postType="Blog"
                  onAddComment={handleAddComment}
                  onLikeComment={handleLikeComment}
                />
              </div>

              {/* Benzer Paylaşımlar */}
              <SimilarContent
                title="Benzer Uzman Paylaşımları"
                subtitle="Bu konuyla ilgili diğer uzman görüşleri ve paylaşımları"
                icon="👨‍⚕️"
                items={similarBlogsList as any}
                authors={[]} // Author bilgisi API'den geliyor
                type="posts"
                getTimeAgo={getTimeAgo}
                gradientColors={{
                  bg: "bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40",
                  decorative1: "bg-gradient-to-br from-blue-400/10 to-indigo-400/10",
                  decorative2: "bg-gradient-to-br from-indigo-400/10 to-purple-400/10",
                  iconBg: "bg-gradient-to-br from-blue-500 to-indigo-500",
                  titleGradient: "bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800",
                  cardHover: "bg-gradient-to-br from-transparent via-transparent to-blue-50/30",
                  statusColors: {
                    active: "bg-blue-100 text-blue-700",
                    inactive: "bg-indigo-100 text-indigo-700"
                  }
                }}
              />
            </article>
          </div>

          {/* Sağ Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 space-y-8">

              {/* Yeni Uzman Paylaşımları */}
              <div className="relative">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl mr-4 shadow-lg">
                    👨‍⚕️
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Yeni Uzman Paylaşımları
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {recentBlogs.map((recentBlog, index) => {
                    const recentAuthor = recentBlog.author;
                    if (!recentAuthor) return null;

                    const isRecent = index < 2;

                    return (
                      <div key={recentBlog._id} className="group">
                        <Link href={`/blogs/${recentBlog._id}`}>
                          <div className={`relative transition-all duration-300 hover:transform hover:scale-105 ${
                            isRecent 
                              ? 'p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border-2 border-blue-200 shadow-lg' 
                              : 'p-6 hover:bg-gradient-to-br hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-md'
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
                                  src={recentAuthor.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(recentAuthor.firstName + ' ' + recentAuthor.lastName)}&background=3b82f6&color=fff`}
                                  alt={`${recentAuthor.firstName} ${recentAuthor.lastName}`}
                                  size="md"
                                  className="ring-2 ring-white shadow-md"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">👨‍⚕️</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-base">Dr. {recentAuthor.firstName} {recentAuthor.lastName}</p>
                                <p className="text-sm text-gray-600">{getTimeAgo(recentBlog.createdAt)}</p>
                              </div>
                            </div>
                            
                            <h4 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug text-lg">
                              {recentBlog.title}
                            </h4>
                            
                            <p className="text-gray-700 line-clamp-3 mb-4 leading-relaxed">
                              {recentBlog.content.substring(0, 120)}...
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                  <span className="text-blue-600 text-lg">👨‍⚕️</span>
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                  Uzman Paylaşımı
                                </span>
                              </div>
                              <span className={`text-sm px-4 py-2 rounded-full font-semibold ${
                                isRecent 
                                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors'
                              }`}>
                                {recentBlog.readTime || 5} dk okuma
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link href="/blogs">
                    <Button variant="outline" size="sm" className="w-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 font-semibold py-3 text-base">
                      <span className="mr-3">👨‍⚕️</span>
                      Tüm Uzman Paylaşımlarını Görüntüle
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
