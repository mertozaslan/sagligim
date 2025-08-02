import { create } from 'zustand';
import { Comment, api } from '../services/api';

interface CommentsState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  currentPostId: string | null;
}

interface CommentsActions {
  // Actions
  fetchCommentsByPost: (postId: string) => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPostId: (postId: string | null) => void;
  
  // Comment interactions
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void;
  likeComment: (commentId: string) => void;
  unlikeComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
}

const initialState: CommentsState = {
  comments: [],
  loading: false,
  error: null,
  currentPostId: null,
};

export const useCommentsStore = create<CommentsState & CommentsActions>((set, get) => ({
  ...initialState,

  // Actions
  fetchCommentsByPost: async (postId: string) => {
    set({ loading: true, error: null, currentPostId: postId });
    try {
      const comments = await api.getCommentsByPost(postId);
      set({ comments, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Yorumlar yüklenirken hata oluştu', 
        loading: false 
      });
    }
  },

  // State management
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  setCurrentPostId: (postId: string | null) => set({ currentPostId: postId }),

  // Comment interactions
  addComment: (commentData) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      ...commentData,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    
    set({ comments: [newComment, ...get().comments] });
  },

  likeComment: (commentId: string) => {
    const { comments } = get();
    
    const updateComment = (comment: Comment) => 
      comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment;

    set({ comments: comments.map(updateComment) });
  },

  unlikeComment: (commentId: string) => {
    const { comments } = get();
    
    const updateComment = (comment: Comment) => 
      comment.id === commentId ? { ...comment, likes: Math.max(0, comment.likes - 1) } : comment;

    set({ comments: comments.map(updateComment) });
  },

  deleteComment: (commentId: string) => {
    const { comments } = get();
    set({ comments: comments.filter(comment => comment.id !== commentId) });
  },
})); 