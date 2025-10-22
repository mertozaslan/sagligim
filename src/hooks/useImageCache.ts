import { useState, useCallback, useRef } from 'react';

interface ImageCacheEntry {
  loaded: boolean;
  error: boolean;
  timestamp: number;
}

// Global image cache
const imageCache = new Map<string, ImageCacheEntry>();

export const useImageCache = () => {
  const [cache, setCache] = useState<Map<string, ImageCacheEntry>>(imageCache);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Cache temizleme fonksiyonu (5 dakikada bir)
  const clearOldCache = useCallback(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    for (const [key, entry] of imageCache.entries()) {
      if (now - entry.timestamp > fiveMinutes) {
        imageCache.delete(key);
      }
    }
    
    setCache(new Map(imageCache));
  }, []);

  // Image yükleme durumunu güncelle
  const updateImageStatus = useCallback((src: string, loaded: boolean, error: boolean = false) => {
    imageCache.set(src, {
      loaded,
      error,
      timestamp: Date.now()
    });
    
    setCache(new Map(imageCache));
    
    // Cache temizleme timeout'unu sıfırla
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(clearOldCache, 30000); // 30 saniye sonra temizle
  }, [clearOldCache]);

  // Image cache'den durumu al
  const getImageStatus = useCallback((src: string): ImageCacheEntry | null => {
    return imageCache.get(src) || null;
  }, []);

  // Image'ın daha önce yüklenip yüklenmediğini kontrol et
  const isImageCached = useCallback((src: string): boolean => {
    const entry = imageCache.get(src);
    return entry ? entry.loaded && !entry.error : false;
  }, []);

  // Cache'i temizle
  const clearCache = useCallback(() => {
    imageCache.clear();
    setCache(new Map());
  }, []);

  return {
    cache,
    updateImageStatus,
    getImageStatus,
    isImageCached,
    clearCache,
    clearOldCache
  };
};
