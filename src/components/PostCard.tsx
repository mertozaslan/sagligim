import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import Tag from './ui/Tag';

interface Post {
  id: string;
  title: string;
  slug: string;
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

interface Author {
  id: string;
  name: string;
  avatar: string;
  title: string;
  verified: boolean;
}

interface PostCardProps {
  post: Post;
  author: Author;
  onLike?: () => void;
  onShare?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  author,
  onLike,
  onShare,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Görsel */}
      {post.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6">
        {/* Header - Yazar bilgileri */}
        <div className="flex items-center space-x-3 mb-4">
          <Link href={`/profil/${author.id}`}>
            <Avatar
              src={author.avatar}
              alt={author.name}
              size="sm"
              className="cursor-pointer"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link 
                href={`/profil/${author.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {author.name}
              </Link>
              {author.verified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{author.title}</p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{formatDate(post.publishDate)}</span>
            <span>•</span>
            <span>{post.readTime} dk okuma</span>
          </div>
        </div>

        {/* Kategori Badge */}
        <div className="mb-3">
          <Badge variant="primary" size="sm">
            {post.category}
          </Badge>
        </div>

        {/* Başlık ve İçerik */}
        <div className="mb-4">
          <Link href={`/makale/${post.slug}`}>
            <h2 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
              {post.title}
            </h2>
          </Link>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        {/* Etiketler */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag) => (
            <Tag key={tag} className="text-xs">
              {tag}
            </Tag>
          ))}
          {post.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{post.tags.length - 3}</span>
          )}
        </div>

        {/* Alt bar - Etkileşim butonları */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLike}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{post.likes}</span>
            </button>

            <Link 
              href={`/makale/${post.slug}#yorumlar`}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post.commentsCount}</span>
            </Link>

            <button
              onClick={onShare}
              className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="text-sm font-medium">{post.shares}</span>
            </button>
          </div>

          <Link 
            href={`/makale/${post.slug}`}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            Devamını oku →
          </Link>
        </div>
      </div>
    </article>
  );
};

export default PostCard; 