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
}

const UserCard: React.FC<UserCardProps> = ({
  user,
}) => {

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
        <div className="grid grid-cols-1 gap-4 mb-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{user.experience}</div>
            <div className="text-xs text-gray-500">Yıl Deneyim</div>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex space-x-2">
          <Link href={`/profil/${user.username}`} className="flex-1">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
            >
              Profil Görüntüle
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserCard; 