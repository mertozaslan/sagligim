import React from 'react';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorTitle: string;
  date: string;
  endDate: string;
  location: string;
  locationAddress: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  isOnline: boolean;
  organizer: string;
  organizerType: string;
  tags: string[];
  requirements: string;
  status: string;
  image?: string;
}

interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryVariant = (category: string) => {
    switch (category.toLowerCase()) {
      case 'meditasyon':
        return 'info';
      case 'biyoenerji':
        return 'success';
      case 'beslenme':
        return 'warning';
      case 'yoga':
        return 'primary';
      case 'stres yönetimi':
        return 'danger';
      case 'spor':
        return 'success';
      default:
        return 'default';
    }
  };

  const getOrganizerVariant = (organizerType: string) => {
    switch (organizerType) {
      case 'government':
        return 'danger';
      case 'municipal':
        return 'primary';
      case 'professional':
        return 'warning';
      case 'ngo':
        return 'info';
      default:
        return 'default';
    }
  };

  const getAvailableSpots = () => {
    return event.maxParticipants - event.currentParticipants;
  };

  const isFullyBooked = () => {
    return getAvailableSpots() <= 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header Image Placeholder */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <h3 className="text-white text-xl font-bold text-center px-4">{event.title}</h3>
        </div>
        <div className="absolute top-4 left-4">
          <Badge variant={getCategoryVariant(event.category)} size="sm">
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {event.isOnline && (
            <Badge variant="info" size="sm">
              Online
            </Badge>
          )}
          <Badge variant={getOrganizerVariant(event.organizerType)} size="sm">
            {event.organizer}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        {/* Instructor Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {event.instructor.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{event.instructor}</p>
            <p className="text-sm text-gray-600">{event.instructorTitle}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">{event.description}</p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{event.currentParticipants}/{event.maxParticipants} katılımcı</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {event.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="default" size="sm">
              {tag}
            </Badge>
          ))}
          {event.tags.length > 3 && (
            <Badge variant="default" size="sm">
              +{event.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Price and Register */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {event.price === 0 ? (
              <span className="text-green-600">Ücretsiz</span>
            ) : (
              <span>{event.price} ₺</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isFullyBooked() ? (
              <Button variant="outline" disabled>
                Dolu
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={() => onRegister?.(event.id)}
              >
                Katıl
              </Button>
            )}
          </div>
        </div>

        {/* Available spots indicator */}
        {!isFullyBooked() && getAvailableSpots() <= 5 && (
          <div className="mt-3 text-xs text-orange-600 font-medium">
            Son {getAvailableSpots()} yer kaldı!
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard; 