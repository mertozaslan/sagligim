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

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: string;
  tags: string[];
  readTime: number;
  publishDate: string;
  likes: number;
  commentsCount: number;
  shares: number;
  imageUrl?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  verified: boolean;
  specialty?: string;
  city: string;
  bio: string;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  publishDate: string;
  likes: number;
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadArticleData = async () => {
      try {
        const [postsResponse, usersResponse, commentsResponse] = await Promise.all([
          fetch('/data/posts.json'),
          fetch('/data/users.json'),
          fetch('/data/comments.json')
        ]);
        
        const postsData = await postsResponse.json();
        const usersData = await usersResponse.json();
        const commentsData = await commentsResponse.json();
        
        // Makaleyi slug ile bul
        const foundPost = postsData.find((p: Post) => p.slug === slug);
        
        if (foundPost) {
          setPost(foundPost);
          
          // Yazarı bul
          const foundAuthor = usersData.find((u: User) => u.id === foundPost.authorId);
          setAuthor(foundAuthor || null);
          
          // Makalenin yorumlarını filtrele
          const postComments = commentsData.filter((c: Comment) => c.postId === foundPost.id);
          setComments(postComments);
          
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Makale verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticleData();
  }, [slug]);

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
    if (post) {
      setPost({
        ...post,
        likes: isLiked ? post.likes - 1 : post.likes + 1
      });
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
    
    if (post) {
      setPost({
        ...post,
        shares: post.shares + 1
      });
    }
  };

  const handleAddComment = (content: string) => {
    // Dummy yorum ekleme
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: post?.id || '',
      authorId: '6', // Dummy user ID
      content,
      publishDate: new Date().toISOString(),
      likes: 0
    };
    
    setComments([...comments, newComment]);
    
    if (post) {
      setPost({
        ...post,
        commentsCount: post.commentsCount + 1
      });
    }
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

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

  if (!post || !author) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600">Ana Sayfa</Link></li>
            <li>•</li>
            <li>{post.category}</li>
            <li>•</li>
            <li className="text-gray-900 font-medium">{post.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Cover Image */}
          {post.imageUrl && (
            <div className="relative h-64 md:h-80 w-full">
              <Image
                src={post.imageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Category */}
            <div className="mb-4">
              <Badge variant="primary">{post.category}</Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Author & Meta Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href={`/profil/${author.id}`}>
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
                      href={`/profil/${author.id}`}
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
                <p>{getTimeAgo(post.publishDate)}</p>
                <p>{post.readTime} dakika okuma</p>
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
                  <span className="font-medium">{post.likes}</span>
                </button>

                <div className="flex items-center space-x-2 text-gray-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="font-medium">{post.commentsCount}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
              <div className="prose prose-blue max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  }}
                />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t border-gray-100">
                {post.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div id="yorumlar">
              <CommentBox
                comments={comments}
                authors={users}
                onAddComment={handleAddComment}
                onLikeComment={handleLikeComment}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Author Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Yazar Hakkında</h3>
              <div className="text-center">
                <Link href={`/profil/${author.id}`}>
                  <Avatar
                    src={author.avatar}
                    alt={author.name}
                    size="lg"
                    className="mx-auto mb-3 cursor-pointer"
                  />
                </Link>
                <h4 className="font-semibold text-gray-900 mb-1">{author.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{author.title}</p>
                {author.specialty && (
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

            {/* Related Articles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">İlgili Makaleler</h3>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Yakında daha fazla makale...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
} 