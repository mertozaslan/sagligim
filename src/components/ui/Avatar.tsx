import React, { memo, useCallback } from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = memo(({
  src,
  alt,
  size = 'md',
  className = '',
  fallback
}) => {
  const [hasError, setHasError] = React.useState(false);

  const sizeConfig = {
    xs: { size: 'w-6 h-6', pixels: 24, text: 'text-xs' },
    sm: { size: 'w-8 h-8', pixels: 32, text: 'text-sm' },
    md: { size: 'w-10 h-10', pixels: 40, text: 'text-base' },
    lg: { size: 'w-12 h-12', pixels: 48, text: 'text-lg' },
    xl: { size: 'w-16 h-16', pixels: 64, text: 'text-xl' },
  };

  const config = sizeConfig[size];

  // Fallback için kullanıcının adının ilk harfini al
  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  // Error handler'ı memoize et
  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  // Localhost kontrolü için memoize edilmiş fonksiyon
  const isLocalhost = useCallback((url: string) => {
    return url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1');
  }, []);

  if (src && !hasError) {
    return (
      <Image
        src={src}
        alt={alt}
        width={config.pixels}
        height={config.pixels}
        className={`${config.size} rounded-full object-cover ${className}`}
        onError={handleError}
        unoptimized={isLocalhost(src)}
        // Priority ve loading optimizasyonları
        priority={false}
        loading="lazy"
        // Cache kontrolü için key ekle
        key={`${src}-${size}`}
      />
    );
  }

  return (
    <div className={`${config.size} ${config.text} rounded-full bg-blue-500 text-white font-medium flex items-center justify-center ${className}`}>
      {fallback ? getInitials(fallback) : getInitials(alt)}
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar; 