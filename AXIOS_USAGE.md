# Modern Axios API Yapılandırması

Bu proje, modern ve kullanışlı bir axios yapılandırması kullanır. Tüm API istekleri merkezi bir yerden yönetilir ve otomatik token yönetimi, hata yönetimi ve retry mekanizması içerir.

## 🚀 Özellikler

- ✅ **Otomatik Token Yönetimi**: JWT token'ları otomatik olarak eklenir ve yenilenir
- ✅ **Interceptors**: Request/Response interceptor'ları ile merkezi yönetim
- ✅ **Hata Yönetimi**: Kapsamlı hata yakalama ve kullanıcı dostu mesajlar
- ✅ **Retry Mekanizması**: Başarısız istekler için otomatik yeniden deneme
- ✅ **Dosya Yükleme**: Progress tracking ile dosya yükleme desteği
- ✅ **TypeScript**: Tam tip güvenliği
- ✅ **Multiple Instances**: Auth, Public ve API için ayrı instance'lar

## 📁 Dosya Yapısı

```
src/
├── lib/
│   ├── axios.ts          # Ana axios yapılandırması
│   └── api-examples.ts   # Kullanım örnekleri
├── services/
│   ├── auth.ts           # Auth API servisleri
│   └── api.ts            # Genel API servisleri
└── utils/
    └── auth.ts           # Auth utility fonksiyonları
```

## 🔧 Kullanım

### 1. Auth İşlemleri

```typescript
import { authService } from '@/services/auth';

// Giriş yapma
const login = async () => {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123'
    });
    console.log('Giriş başarılı:', response);
  } catch (error) {
    console.error('Giriş hatası:', error);
  }
};

// Kayıt olma
const register = async () => {
  try {
    const response = await authService.register({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'Yeni',
      lastName: 'Kullanıcı',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phone: '+905551234567'
    });
    console.log('Kayıt başarılı:', response);
  } catch (error) {
    console.error('Kayıt hatası:', error);
  }
};

// Profil getirme
const getProfile = async () => {
  try {
    const profile = await authService.getProfile();
    console.log('Profil:', profile);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
  }
};
```

### 2. Genel API İşlemleri

```typescript
import { apiService } from '@/services/api';

// Post işlemleri
const getPosts = async () => {
  try {
    const posts = await apiService.getPosts();
    console.log('Postlar:', posts);
  } catch (error) {
    console.error('Post getirme hatası:', error);
  }
};

// Yeni post oluşturma
const createPost = async () => {
  try {
    const newPost = await apiService.createPost({
      title: 'Yeni Makale',
      slug: 'yeni-makale',
      content: 'Bu yeni bir makale içeriğidir...',
      authorId: 'user123',
      category: 'Sağlık',
      tags: ['beslenme', 'diyet'],
      readTime: 5
    });
    console.log('Post oluşturuldu:', newPost);
  } catch (error) {
    console.error('Post oluşturma hatası:', error);
  }
};
```

### 3. Dosya Yükleme

```typescript
import { api } from '@/lib/axios';

// Tek dosya yükleme
const uploadFile = async (file: File) => {
  try {
    const result = await api.upload('/api/upload', file, (progress) => {
      console.log(`Yükleme ilerlemesi: ${progress}%`);
    });
    console.log('Dosya yüklendi:', result);
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
  }
};

// Çoklu dosya yükleme
const uploadMultipleFiles = async (files: File[]) => {
  try {
    const result = await api.uploadMultiple('/api/upload/multiple', files, (progress) => {
      console.log(`Yükleme ilerlemesi: ${progress}%`);
    });
    console.log('Dosyalar yüklendi:', result);
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
  }
};
```

### 4. Retry Mekanizması

```typescript
import { retryRequest } from '@/lib/axios';

const fetchDataWithRetry = async () => {
  try {
    const result = await retryRequest(
      () => apiService.getPosts(),
      3, // 3 kez dene
      1000 // 1 saniye bekle
    );
    console.log('Retry ile alınan veri:', result);
  } catch (error) {
    console.error('Retry hatası:', error);
  }
};
```

### 5. Hata Yönetimi

```typescript
import { handleApiError } from '@/lib/axios';

const handleApiCall = async () => {
  try {
    await apiService.getPosts();
  } catch (error: any) {
    const errorMessage = handleApiError(error);
    console.error('Hata mesajı:', errorMessage);
    
    // Hata tipine göre farklı işlemler
    if (error.response?.status === 401) {
      console.log('Yetkilendirme hatası - giriş sayfasına yönlendir');
    } else if (error.response?.status === 404) {
      console.log('Kaynak bulunamadı');
    } else if (error.response?.status >= 500) {
      console.log('Sunucu hatası - daha sonra tekrar deneyin');
    }
  }
};
```

### 6. React Hook Örneği

```typescript
import { useState } from 'react';
import { apiService } from '@/services/api';
import { handleApiError } from '@/lib/axios';

const usePosts = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getPosts();
      setData(result);
    } catch (err: any) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchPosts };
};
```

## 🔐 Token Yönetimi

Sistem otomatik olarak token yönetimi yapar:

1. **Login**: Token'lar localStorage'a kaydedilir
2. **Request**: Her istekte token otomatik eklenir
3. **Refresh**: Token süresi dolduğunda otomatik yenilenir
4. **Logout**: Token'lar temizlenir

## 🌐 API Instance'ları

### 1. `apiClient` (Ana Instance)
- Token ile korumalı endpoint'ler için
- Otomatik token ekleme ve yenileme
- Tüm CRUD işlemleri

### 2. `authClient` (Auth Instance)
- Login, register gibi auth işlemleri için
- Token gerektirmez

### 3. `publicClient` (Public Instance)
- Public endpoint'ler için
- Token gerektirmez

## 📊 Response Formatları

### Başarılı Response
```typescript
{
  data: any,
  message?: string,
  success: boolean
}
```

### Sayfalanmış Response
```typescript
{
  data: any[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Hata Response
```typescript
{
  message: string,
  errors?: Array<{
    field: string,
    message: string
  }>
}
```

## 🛠️ Yapılandırma

### Base URL
```typescript
const API_BASE_URL = 'https://api.saglikhep.com';
```

### Timeout
```typescript
timeout: 10000 // 10 saniye
```

### Headers
```typescript
headers: {
  'Content-Type': 'application/json',
}
```

## 🚨 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| 400 | Geçersiz istek verisi |
| 401 | Yetkilendirme hatası |
| 403 | Erişim reddedildi |
| 404 | Kaynak bulunamadı |
| 409 | Çakışma (örn: kullanıcı zaten mevcut) |
| 422 | Validasyon hatası |
| 500 | Sunucu hatası |

## 💡 İpuçları

1. **Hata Yakalama**: Her API çağrısında try-catch kullanın
2. **Loading States**: UI'da loading durumlarını gösterin
3. **Error Messages**: Kullanıcı dostu hata mesajları kullanın
4. **Retry Logic**: Kritik işlemler için retry mekanizması kullanın
5. **TypeScript**: Tip güvenliği için interface'leri kullanın

## 🔄 Migration

Eski fetch API'lerinden yeni axios yapılandırmasına geçiş:

### Eski Yöntem
```typescript
const response = await fetch('/api/posts', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Yeni Yöntem
```typescript
const data = await apiService.getPosts();
```

Bu yapılandırma ile tüm API işlemleriniz daha güvenli, hızlı ve yönetilebilir hale gelir! 🎉
