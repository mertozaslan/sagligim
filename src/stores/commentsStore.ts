import { create } from 'zustand';
import { Comment, CommentsResponse, CommentFilters } from '../services/comments';
import { commentsService } from '../services/comments';

interface CommentsState {
  comments: Comment[];
  currentComment: Comment | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalComments: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  filters: CommentFilters;
}

interface CommentsActions {
  // Actions
  fetchComments: (postId: string, filters?: CommentFilters) => Promise<void>;
  fetchCommentsByPost: (postId: string, postType: 'Post' | 'Blog', filters?: CommentFilters) => Promise<void>;
  fetchComment: (commentId: string) => Promise<void>;
  createComment: (postId: string, commentData: any) => Promise<void>;
  addComment: (commentData: any) => Promise<void>;
  updateComment: (commentId: string, commentData: any) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  createReply: (parentCommentId: string, content: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentComment: (comment: Comment | null) => void;
  setFilters: (filters: Partial<CommentFilters>) => void;
  clearFilters: () => void;
  
  // Comment interactions
  likeComment: (commentId: string) => Promise<void>;
  dislikeComment: (commentId: string) => Promise<void>;
  reportComment: (commentId: string, reportData: any) => Promise<void>;
}

const initialState: CommentsState = {
  comments: [],
  currentComment: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
};

export const useCommentsStore = create<CommentsState & CommentsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchComments: async (postId: string, filters?: CommentFilters) => {
    set({ loading: true, error: null });
    try {
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters };
      const response = await commentsService.getPostComments(postId, mergedFilters);
      set({ 
        comments: response.comments, 
        pagination: response.pagination,
        filters: mergedFilters,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yorumlar yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchCommentsByPost: async (postId: string, postType: 'Post' | 'Blog', filters?: CommentFilters) => {
    set({ loading: true, error: null });
    try {
      console.log('Comments Store: Fetching comments for post ID:', postId, 'postType:', postType);
      const currentFilters = get().filters;
      const mergedFilters = { ...currentFilters, ...filters, postType };
      console.log('Comments Store: Merged filters:', mergedFilters);
      const response = await commentsService.getPostComments(postId, mergedFilters);
      console.log('Comments Store: Received comments:', response);
      set({ 
        comments: response.comments, 
        pagination: response.pagination,
        filters: mergedFilters,
        loading: false 
      });
    } catch (error) {
      console.error('Comments Store: Error fetching comments:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Yorumlar yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  fetchComment: async (commentId: string) => {
    set({ loading: true, error: null });
    try {
      // Bu endpoint API'de yok, sadece örnek olarak
      // const comment = await commentsService.getCommentById(commentId);
      // set({ currentComment: comment, loading: false });
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yorum yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  createComment: async (postId: string, commentData: any) => {
    set({ loading: true, error: null });
    try {
      const newComment = await commentsService.createComment(postId, commentData);
      const { comments } = get();
      set({ 
        comments: [newComment, ...comments],
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yorum oluşturulurken hata oluştu', 
        loading: false 
      });
    }
  },

  addComment: async (commentData: any) => {
    set({ loading: true, error: null });
    try {
      console.log('Comments Store: Adding comment:', commentData);
      const { postId, postType, ...commentPayload } = commentData;
      console.log('Comments Store: Comment payload:', commentPayload);
      console.log('Comments Store: PostType:', postType);
      const newComment = await commentsService.createComment(postId, { ...commentPayload, postType });
      console.log('Comments Store: Created comment:', newComment);
      const { comments } = get();
      set({ 
        comments: [newComment, ...comments],
        loading: false 
      });
    } catch (error) {
      console.error('Comments Store: Error adding comment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Yorum oluşturulurken hata oluştu', 
        loading: false 
      });
    }
  },

  updateComment: async (commentId: string, commentData: any) => {
    set({ loading: true, error: null });
    try {
      const updatedComment = await commentsService.updateComment(commentId, commentData);
      const { comments, currentComment } = get();
      
      const updateCommentInList = (comment: Comment) => 
        comment._id === commentId ? updatedComment : comment;

      set({ 
        comments: comments.map(updateCommentInList),
        currentComment: currentComment?._id === commentId ? updatedComment : currentComment,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yorum güncellenirken hata oluştu', 
        loading: false 
      });
    }
  },

  deleteComment: async (commentId: string) => {
    set({ loading: true, error: null });
    try {
      await commentsService.deleteComment(commentId);
      const { comments, currentComment } = get();
      
      set({ 
        comments: comments.filter(comment => comment._id !== commentId),
        currentComment: currentComment?._id === commentId ? null : currentComment,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yorum silinirken hata oluştu', 
        loading: false 
      });
    }
  },

  createReply: async (parentCommentId: string, content: string) => {
    set({ loading: true, error: null });
    try {
      const newReply = await commentsService.createReply(parentCommentId, content);
      const { comments } = get();
      
      // Parent comment'in replies listesine ekle
      const updateParentComment = (comment: Comment) => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
            repliesCount: comment.repliesCount + 1
          };
        }
        return comment;
      };

      set({ 
        comments: comments.map(updateParentComment),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yanıt oluşturulurken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentComment: (comment: Comment | null) => set({ currentComment: comment }),
  
  setFilters: (filters: Partial<CommentFilters>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => set({ 
    filters: initialState.filters,
    comments: [],
    pagination: null
  }),

  // Comment interactions
  likeComment: async (commentId: string) => {
    try {
      const response = await commentsService.toggleLike(commentId);
      const { comments, currentComment } = get();
      
      const updateComment = (comment: Comment) => 
        comment._id === commentId ? { 
          ...comment, 
          isLiked: response.isLiked,
          likesCount: response.likesCount,
          isDisliked: false // Like yapıldığında dislike false olur
        } : comment;

      set({
        comments: comments.map(updateComment),
        currentComment: currentComment ? updateComment(currentComment) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğeni işlemi başarısız' 
      });
    }
  },

  dislikeComment: async (commentId: string) => {
    try {
      const response = await commentsService.toggleDislike(commentId);
      const { comments, currentComment } = get();
      
      const updateComment = (comment: Comment) => 
        comment._id === commentId ? { 
          ...comment, 
          isDisliked: response.isDisliked,
          dislikesCount: response.dislikesCount,
          isLiked: false // Dislike yapıldığında like false olur
        } : comment;

      set({
        comments: comments.map(updateComment),
        currentComment: currentComment ? updateComment(currentComment) : null
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Beğenmeme işlemi başarısız' 
      });
    }
  },

  reportComment: async (commentId: string, reportData: any) => {
    try {
      await commentsService.reportComment(commentId, reportData);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Raporlama işlemi başarısız' 
      });
    }
  },
}));