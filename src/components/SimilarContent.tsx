import React from 'react';
import Link from 'next/link';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import type { Post } from '@/services/posts';
import type { User, Expert } from '@/services/api';

interface SimilarContentProps {
  title: string;
  subtitle: string;
  icon: string;
  items: Post[];
  authors: (User | Expert)[];
  type: 'posts' | 'questions';
  getTimeAgo: (date: string) => string;
  gradientColors: {
    bg: string;
    decorative1: string;
    decorative2: string;
    iconBg: string;
    titleGradient: string;
    cardHover: string;
    statusColors: {
      active: string;
      inactive: string;
    };
  };
}

const SimilarContent: React.FC<SimilarContentProps> = ({
  title,
  subtitle,
  icon,
  items,
  authors,
  type,
  getTimeAgo,
  gradientColors
}) => {
  // Author bilgisi artık item içinde geliyor, ayrı aramaya gerek yok
  const getAuthor = (item: Post) => {
    return (item as any).author || null;
  };

  const getItemUrl = (item: Post): string => {
    return `/makale/${(item as Post)._id}`;
  };

  const getItemStatus = (item: Post) => {
    const post = item as any;
    return {
      hasActivity: (post.likesCount || 0) > 10,
      label: (post.likesCount || 0) > 10 ? '🔥 Popüler' : '📖 Yeni',
      activityCount: post.likesCount || 0
    };
  };

  const getItemMetrics = (item: Post) => {
    const post = item as any;
    return {
      metric1: { icon: '⏱️', value: `${Math.ceil(post.content?.length / 200) || 5} dk` },
      metric2: { icon: '❤️', value: post.likesCount || 0 },
      badge: post.category || 'Genel'
    };
  };

  if (items.length === 0) return null;

  return (
    <div className="mt-12">
      <div className={`relative overflow-hidden ${gradientColors.bg} rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm`}>
        <div className={`absolute top-0 right-0 w-40 h-40 ${gradientColors.decorative1} rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-10 -left-10 w-32 h-32 ${gradientColors.decorative2} rounded-full blur-2xl`}></div>
        <div className="relative p-8 md:p-12">
          <div className="flex items-center mb-8">
            <div className={`w-12 h-12 ${gradientColors.iconBg} rounded-2xl flex items-center justify-center text-white text-2xl mr-4 shadow-lg`}>
              {icon}
            </div>
            <div>
              <h2 className={`text-3xl font-bold ${gradientColors.titleGradient} bg-clip-text text-transparent`}>
                {title}
              </h2>
              <p className="text-gray-600 mt-1">{subtitle}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => {
              const author = getAuthor(item);
              if (!author) return null;

              const status = getItemStatus(item);
              const metrics = getItemMetrics(item);
              const publishDate = (item as any).createdAt;

              return (
                <div key={(item as any)._id} className="group relative">
                  <div className="relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">


                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 ${gradientColors.cardHover} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Content */}
                    <div className="relative p-6">
                      {/* Author info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="relative">
                          <Avatar
                            src={author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.firstName + ' ' + author.lastName)}&background=3b82f6&color=fff`}
                            alt={author.firstName + ' ' + author.lastName}
                            size="sm"
                            className="ring-2 ring-white shadow-md"
                          />
                          {author.verified && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white">
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{(author as any).firstName} {(author as any).lastName}</p>
                          <p className="text-xs text-gray-500">{getTimeAgo(publishDate)}</p>
                        </div>
                        <div className="w-6 h-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 font-bold text-xs">{index + 1}</span>
                        </div>
                      </div>

                      {/* Content icon */}
                      {type === 'questions' && (
                        <div className="mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                            <span className="text-amber-600 text-lg">❓</span>
                          </div>
                        </div>
                      )}

                      {/* Title */}
                      <Link href={getItemUrl(item)}>
                        <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight min-h-[3.5rem] flex items-start">
                          {item.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed min-h-[4.5rem] flex items-start">
                        {item.content.substring(0, 120)}...
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {type === 'posts' ? (
                          <>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200">
                              <span className="text-blue-700 font-semibold text-xs">{metrics.badge}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span>{metrics.metric1.icon}</span>
                                <span>{metrics.metric1.value}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>{metrics.metric2.icon}</span>
                                <span>{metrics.metric2.value}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span>{metrics.metric1.icon}</span>
                                <span>{metrics.metric1.value}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span>{metrics.metric2.icon}</span>
                                <span>{metrics.metric2.value}</span>
                              </div>
                            </div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
                              <span className="text-amber-700 font-semibold text-xs">
                                {metrics.badge}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Hover indicator */}
                    <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${
                      type === 'posts' ? 'from-blue-500 to-indigo-500' : 'from-amber-500 to-orange-500'
                    } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarContent;
