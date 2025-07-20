import React from 'react';
import Link from 'next/link';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    specialty: string;
    title: string;
    city: string;
    shortBio: string;
    followersCount: number;
    rating: number;
    experience: number;
    verified: boolean;
  };
  onFollow?: () => void;
  onMessage?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onFollow,
  onMessage,
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half-star">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <Link href={`/profil/${user.username}`}>
            <Avatar
              src={user.avatar}
              alt={user.name}
              size="lg"
              className="cursor-pointer"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Link 
                href={`/profil/${user.username}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {user.name}
              </Link>
              {user.verified && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{user.title}</p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>📍 {user.city}</span>
              <span>•</span>
              <span>{user.experience} yıl deneyim</span>
            </div>
          </div>
        </div>

        {/* Uzmanlık Alanı */}
        <div className="mb-3">
          <Badge variant="primary" size="sm">
            {user.specialty}
          </Badge>
        </div>

        {/* Kısa Biyografi */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
          {user.shortBio}
        </p>

        {/* İstatistikler */}
        <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{user.followersCount}</div>
            <div className="text-xs text-gray-500">Takipçi</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center space-x-1 mb-1">
              {renderStars(user.rating)}
            </div>
            <div className="text-xs text-gray-500">
              {user.rating.toFixed(1)} Puan
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{user.experience}</div>
            <div className="text-xs text-gray-500">Yıl</div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex space-x-2">
          <Button
            onClick={onFollow}
            variant="primary"
            size="sm"
            className="flex-1"
          >
            Takip Et
          </Button>
          <Button
            onClick={onMessage}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Mesaj
          </Button>
          <Link href={`/profil/${user.username}`} className="flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Profil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCard; 