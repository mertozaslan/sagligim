import React from 'react';
import Link from 'next/link';
import Tag from './ui/Tag';
import type { Post } from '@/services/api';

interface PopularTopicsProps {
  posts: Post[];
  onTopicClick?: (topic: string) => void;
  variant?: 'sidebar' | 'main';
}

const PopularTopics: React.FC<PopularTopicsProps> = ({
  posts,
  onTopicClick,
  variant = 'sidebar'
}) => {
  const topics = variant === 'main' 
    ? ['kalp', 'beslenme', 'egzersiz', 'anksiyete', 'diyabet']
    : ['kalp-sağlığı', 'beslenme', 'egzersiz', 'mental-sağlık', 'uyku'];

  if (variant === 'main') {
    return (
      <div className="space-y-4">
        {topics.map((topic, index) => {
          const postCount = posts.filter(post => post.tags.includes(topic)).length;
          const isPopular = index < 2;
          return (
            <div 
              key={topic} 
              className={`group relative rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                isPopular 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 hover:shadow-lg' 
                  : 'bg-gray-50 border border-gray-200 hover:shadow-md'
              }`} 
              onClick={() => onTopicClick?.(topic)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isPopular && (
                    <span className="mr-2 text-lg">🔥</span>
                  )}
                  <Tag onClick={() => onTopicClick?.(topic)} className="pointer-events-none">
                    {topic}
                  </Tag>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-semibold ${isPopular ? 'text-blue-600' : 'text-gray-600'}`}>
                    {postCount}
                  </span>
                  <span className="text-xs text-gray-500">gönderi</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Sidebar variant
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
      <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-lg"></div>
      <div className="relative p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg mr-4">
            🔥
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Popüler Konular
          </h3>
        </div>
        <div className="space-y-3">
          {topics.map((topic, index) => {
            const postCount = posts.filter(p => p.tags.includes(topic)).length;
            const isTop = index < 2;
            return (
              <Link key={topic} href={`/kesfet?tag=${topic}`}>
                <div className={`relative group flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                  isTop 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 hover:shadow-lg hover:scale-105' 
                    : 'bg-gray-50 border border-gray-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200'
                }`}>
                  {isTop && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isTop ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                    }`}>
                      <span className={`text-sm ${isTop ? 'text-white' : 'text-gray-600'}`}>#</span>
                    </div>
                    <span className={`font-semibold ${isTop ? 'text-purple-700' : 'text-gray-700'} group-hover:text-purple-600`}>
                      {topic}
                    </span>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    isTop 
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {postCount}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PopularTopics;
