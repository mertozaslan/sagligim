import React, { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import { useImageCache } from '@/hooks/useImageCache';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  quality?: number;
  onError?: () => void;
  onLoad?: () => void;
}

// Optimized Image component with better caching and error handling
export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  loading = 'lazy',
  sizes,
  quality = 75,
  onError,
  onLoad
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { updateImageStatus, isImageCached } = useImageCache();

  // Localhost kontrolü
  const isLocalhost = src.startsWith('http://localhost') || src.startsWith('http://127.0.0.1');
  
  // Base URL'yi normalize et
  const normalizedSrc = src.startsWith('/') 
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${src}`
    : src;

  // Error handler
  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    updateImageStatus(normalizedSrc, false, true);
    onError?.();
  }, [normalizedSrc, updateImageStatus, onError]);

  // Load handler
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    updateImageStatus(normalizedSrc, true, false);
    onLoad?.();
  }, [normalizedSrc, updateImageStatus, onLoad]);

  // Eğer image cache'de varsa ve hata yoksa, loading state'ini false yap
  const isCached = isImageCached(normalizedSrc);
  if (isCached && isLoading) {
    setIsLoading(false);
  }

  const imageProps = {
    src: normalizedSrc,
    alt,
    className,
    priority,
    loading: isCached ? 'eager' : loading,
    quality,
    unoptimized: isLocalhost,
    onError: handleError,
    onLoad: handleLoad,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes }),
  };

  return <Image {...imageProps} />;
});

OptimizedImage.displayName = 'OptimizedImage';

// Image URL helper
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Eğer zaten tam URL ise, olduğu gibi döndür
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Relative path ise base URL ekle
  return `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${imagePath}`;
};

// Image error handler
export const handleImageError = (setError: (error: boolean) => void) => {
  return () => {
    setError(true);
  };
};

// Image load handler
export const handleImageLoad = (setLoading: (loading: boolean) => void) => {
  return () => {
    setLoading(false);
  };
};
