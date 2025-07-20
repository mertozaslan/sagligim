import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = ({
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
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${config.size} rounded-full object-cover ${className}`}
        onError={() => {
          console.error('Avatar image failed to load:', src);
          setHasError(true);
        }}
        onLoad={() => {
          console.log('Avatar image loaded successfully:', src);
        }}
      />
    );
  }

  return (
    <div className={`${config.size} ${config.text} rounded-full bg-blue-500 text-white font-medium flex items-center justify-center ${className}`}>
      {fallback ? getInitials(fallback) : getInitials(alt)}
    </div>
  );
};

export default Avatar; 