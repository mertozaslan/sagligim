// API servisleri
const API_BASE_URL = '/data';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  image?: string;
  publishDate: string;
  likes: number;
  shares: number;
  comments: number;
  readTime: number;
  views: number;
}

export interface User {
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
}

export interface Expert extends User {
  specialty: string;
  experience: number;
  education: string;
  certifications: string[];
  city: string;
  rating: number;
  reviewCount: number;
  consultationFee: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
  replies?: Comment[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  category: string;
  tags: string[];
  image?: string;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  maxParticipants?: number;
  currentParticipants: number;
  price: number;
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  createdAt: string;
  answersCount: number;
  views: number;
  isResolved: boolean;
}

// API fonksiyonları
export const api = {
  // Posts
  async getPosts(): Promise<Post[]> {
    const response = await fetch(`${API_BASE_URL}/posts.json`);
    return response.json();
  },

  async getPost(slug: string): Promise<Post | null> {
    const posts = await this.getPosts();
    return posts.find(post => post.slug === slug) || null;
  },

  async getPostsByCategory(category: string): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.filter(post => post.category === category);
  },

  async getPostsByAuthor(authorId: string): Promise<Post[]> {
    const posts = await this.getPosts();
    return posts.filter(post => post.authorId === authorId);
  },

  // Users
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users.json`);
    return response.json();
  },

  async getUser(username: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.username === username) || null;
  },

  // Experts
  async getExperts(): Promise<Expert[]> {
    const response = await fetch(`${API_BASE_URL}/experts.json`);
    return response.json();
  },

  async getExpert(username: string): Promise<Expert | null> {
    const experts = await this.getExperts();
    return experts.find(expert => expert.username === username) || null;
  },

  // Comments
  async getComments(): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/comments.json`);
    return response.json();
  },

  async getCommentsByPost(postId: string): Promise<Comment[]> {
    const comments = await this.getComments();
    return comments.filter(comment => comment.postId === postId);
  },

  // Events
  async getEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}/events.json`);
    return response.json();
  },

  async getEvent(id: string): Promise<Event | null> {
    const events = await this.getEvents();
    return events.find(event => event.id === id) || null;
  },

  // Questions
  async getQuestions(): Promise<Question[]> {
    const response = await fetch(`${API_BASE_URL}/questions.json`);
    return response.json();
  },

  async getQuestion(id: string): Promise<Question | null> {
    const questions = await this.getQuestions();
    return questions.find(question => question.id === id) || null;
  },

  // Search
  async searchPosts(query: string): Promise<Post[]> {
    const posts = await this.getPosts();
    const lowercaseQuery = query.toLowerCase();
    return posts.filter(post => 
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.content.toLowerCase().includes(lowercaseQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  },

  async searchExperts(query: string): Promise<Expert[]> {
    const experts = await this.getExperts();
    const lowercaseQuery = query.toLowerCase();
    return experts.filter(expert => 
      expert.name.toLowerCase().includes(lowercaseQuery) ||
      expert.specialty.toLowerCase().includes(lowercaseQuery) ||
      expert.bio.toLowerCase().includes(lowercaseQuery)
    );
  }
}; 