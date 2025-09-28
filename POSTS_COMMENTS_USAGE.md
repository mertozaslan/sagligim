# Posts & Comments API Kullanım Kılavuzu

Bu dokümantasyon, yeni Posts ve Comments API yapısının nasıl kullanılacağını açıklar.

## 🚀 Yeni API Yapısı

### Posts API
- **Base URL**: `https://api.saglikhep.com/api/posts`
- **Modern Axios**: Token yönetimi, refresh, error handling
- **Sayfalama**: Tüm listeleme endpoint'leri sayfalama destekler
- **Filtreleme**: Kategori, arama, sıralama

### Comments API
- **Base URL**: `https://api.saglikhep.com/api/comments`
- **Hiyerarşik Yapı**: Ana yorumlar ve yanıtlar
- **Etkileşim**: Beğeni/beğenmeme sistemi
- **Raporlama**: Uygunsuz içerik raporlama

## 📁 Dosya Yapısı

```
src/
├── services/
│   ├── posts.ts          # Post API servisleri
│   ├── comments.ts       # Comment API servisleri
│   ├── api.ts           # Genel API servisleri (güncellenmiş)
│   └── auth.ts          # Auth servisleri
├── stores/
│   ├── postsStore.ts    # Post state yönetimi
│   ├── commentsStore.ts # Comment state yönetimi
│   ├── questionsStore.ts # Questions artık Posts olarak çalışıyor
│   └── index.ts         # Export'lar
└── lib/
    └── axios.ts         # Modern axios konfigürasyonu
```

## 🔧 Kullanım Örnekleri

### 1. Posts Kullanımı

```typescript
import { postsService, usePostsStore } from '@/stores';

// Service kullanımı
const fetchPosts = async () => {
  try {
    const response = await postsService.getPosts({
      page: 1,
      limit: 10,
      category: 'genel',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    console.log('Posts:', response.posts);
    console.log('Pagination:', response.pagination);
  } catch (error) {
    console.error('Hata:', error.message);
  }
};

// Store kullanımı
const PostsComponent = () => {
  const { 
    posts, 
    loading, 
    error, 
    fetchPosts, 
    likePost, 
    createPost 
  } = usePostsStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  const handleCreatePost = async (postData: any) => {
    await createPost(postData);
  };

  return (
    <div>
      {loading && <p>Yükleniyor...</p>}
      {error && <p>Hata: {error}</p>}
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <button onClick={() => handleLike(post.id)}>
            Beğen ({post.likesCount})
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 2. Comments Kullanımı

```typescript
import { commentsService, useCommentsStore } from '@/stores';

// Service kullanımı
const fetchComments = async (postId: string) => {
  try {
    const response = await commentsService.getPostComments(postId, {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    
    console.log('Comments:', response.comments);
  } catch (error) {
    console.error('Hata:', error.message);
  }
};

// Store kullanımı
const CommentsComponent = ({ postId }: { postId: string }) => {
  const { 
    comments, 
    loading, 
    error, 
    fetchComments, 
    createComment,
    likeComment 
  } = useCommentsStore();

  useEffect(() => {
    fetchComments(postId);
  }, [postId]);

  const handleCreateComment = async (content: string) => {
    await createComment(postId, { content });
  };

  const handleLike = async (commentId: string) => {
    await likeComment(commentId);
  };

  return (
    <div>
      {loading && <p>Yorumlar yükleniyor...</p>}
      {error && <p>Hata: {error}</p>}
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.content}</p>
          <button onClick={() => handleLike(comment.id)}>
            Beğen ({comment.likesCount})
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 3. Questions (Artık Posts) Kullanımı

```typescript
import { useQuestionsStore } from '@/stores';

// Questions artık Posts olarak çalışıyor
const QuestionsComponent = () => {
  const { 
    questions, 
    loading, 
    error, 
    fetchQuestions, 
    createQuestion,
    likeQuestion 
  } = useQuestionsStore();

  useEffect(() => {
    fetchQuestions({
      category: 'genel',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }, []);

  const handleCreateQuestion = async (questionData: any) => {
    await createQuestion(questionData);
  };

  return (
    <div>
      {loading && <p>Sorular yükleniyor...</p>}
      {error && <p>Hata: {error}</p>}
      {questions.map(question => (
        <div key={question.id}>
          <h3>{question.title}</h3>
          <p>{question.content}</p>
          <button onClick={() => likeQuestion(question.id)}>
            Beğen ({question.likesCount})
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 🔄 Migration (Geçiş) Rehberi

### Eski Yapıdan Yeni Yapıya

#### 1. API Çağrıları
```typescript
// ESKİ
const posts = await api.getPosts();

// YENİ
const response = await postsService.getPosts();
const posts = response.posts;
```

#### 2. Store Kullanımı
```typescript
// ESKİ
const { posts, fetchPosts } = usePostsStore();
await fetchPosts();

// YENİ
const { posts, fetchPosts } = usePostsStore();
await fetchPosts({ page: 1, limit: 10 });
```

#### 3. Questions → Posts
```typescript
// ESKİ
const { questions, fetchQuestions } = useQuestionsStore();

// YENİ
const { questions, fetchQuestions } = useQuestionsStore();
// questions artık Post[] tipinde
```

## 🎯 Yeni Özellikler

### 1. Sayfalama
```typescript
const response = await postsService.getPosts({
  page: 2,
  limit: 20
});

console.log('Toplam sayfa:', response.pagination.totalPages);
console.log('Toplam post:', response.pagination.totalPosts);
```

### 2. Filtreleme
```typescript
const response = await postsService.getPosts({
  category: 'hastalik',
  search: 'diyabet',
  sortBy: 'likesCount',
  sortOrder: 'desc'
});
```

### 3. Beğeni/Beğenmeme
```typescript
// Post beğenme
const response = await postsService.toggleLike(postId);
console.log('Beğeni durumu:', response.isLiked);
console.log('Beğeni sayısı:', response.likesCount);

// Comment beğenme
const response = await commentsService.toggleLike(commentId);
```

### 4. Raporlama
```typescript
await postsService.reportPost(postId, {
  reason: 'inappropriate',
  description: 'Uygunsuz içerik'
});

await commentsService.reportComment(commentId, {
  reason: 'spam'
});
```

## 🔐 Authentication

Tüm API çağrıları otomatik olarak token yönetimi yapar:

```typescript
// Token otomatik olarak eklenir
const response = await postsService.createPost({
  title: 'Yeni Post',
  content: 'İçerik...',
  category: 'genel',
  tags: ['tag1', 'tag2']
});
```

## 🚨 Error Handling

```typescript
try {
  const response = await postsService.getPosts();
} catch (error) {
  // Hata mesajı otomatik olarak çıkarılır
  console.error('Hata:', error.message);
  
  // Hata türüne göre işlem yapabilirsiniz
  if (error.response?.status === 401) {
    // Token süresi dolmuş, login sayfasına yönlendir
    router.push('/login');
  }
}
```

## 📊 TypeScript Desteği

Tüm API'ler tam TypeScript desteği ile gelir:

```typescript
import type { 
  Post, 
  CreatePostData, 
  PostFilters, 
  PostsResponse 
} from '@/services/posts';

import type { 
  Comment, 
  CreateCommentData, 
  CommentFilters, 
  CommentsResponse 
} from '@/services/comments';
```

## 🎉 Sonuç

Yeni API yapısı ile:
- ✅ Modern axios kullanımı
- ✅ Otomatik token yönetimi
- ✅ Sayfalama desteği
- ✅ Gelişmiş filtreleme
- ✅ Beğeni/beğenmeme sistemi
- ✅ Raporlama sistemi
- ✅ Tam TypeScript desteği
- ✅ Hata yönetimi
- ✅ Store entegrasyonu

Artık tüm uygulama modern, ölçeklenebilir ve maintainable bir API yapısına sahip! 🚀
