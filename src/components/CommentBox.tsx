import React, { useState } from 'react';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import type { Comment } from '@/services/comments';

interface CommentBoxProps {
  comments: Comment[];
  authors: any[]; // Artık kullanılmıyor, author bilgisi comment içinde
  postType: 'Post' | 'Blog';
  onAddComment?: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
}

const CommentBox: React.FC<CommentBoxProps> = ({
  comments,
  authors,
  postType,
  onAddComment,
  onLikeComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  // Author bilgisi artık comment içinde geliyor

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    if (diffInHours < 48) return 'Dün';
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onAddComment?.(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Yorum eklenirken hata:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yorumları filtrele - ilk 5 tanesini göster veya hepsini
  const displayedComments = showAllComments ? comments : comments.slice(0, 5);
  const hasMoreComments = comments.length > 5;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Yorumlar ({comments.length})
        </h3>

        {/* Yorum Ekleme Formu */}
        <div className="mb-8">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <Avatar
                src="https://images.unsplash.com/photo-1494790108755-2616b612b105?w=150&h=150&fit=crop&crop=face"
                alt="Kullanıcı"
                size="sm"
              />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Yorumunuzu yazın..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">
                    Lütfen yapıcı ve saygılı yorumlar yazın.
                  </span>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                  >
                    {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Yorumlar Listesi */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-gray-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
            </div>
          ) : (
            displayedComments.map((comment) => {
              const author = comment.author;
              if (!author) return null;

              return (
                <div key={comment._id} className="flex space-x-4">
                  <Avatar
                    src={author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=3b82f6&color=fff`}
                    alt={`${author.firstName} ${author.lastName}`}
                    size="sm"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {comment.isAnonymous ? 'Anonim Kullanıcı' : `${author.firstName} ${author.lastName}`}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <button
                        onClick={() => onLikeComment?.(comment._id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.60L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{comment.likesCount > 0 && comment.likesCount}</span>
                      </button>
                      <button className="text-gray-500 hover:text-blue-500 transition-colors text-sm">
                        Yanıtla
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Daha Fazla Yorum Göster/Gizle */}
        {hasMoreComments && (
          <div className="text-center mt-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAllComments(!showAllComments)}
            >
              {showAllComments ? (
                <>
                  <span className="mr-2">👆</span>
                  Daha Az Göster
                </>
              ) : (
                <>
                  <span className="mr-2">👇</span>
                  Daha Fazla Yorum Göster ({comments.length - 5} daha)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentBox; 