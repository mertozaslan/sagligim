'use client';

import React, { useState } from 'react';

// Yeni API response formatına göre interface tanımları
interface Exercise {
  _id: string;
  name: string;
  targetDuration: number;
  completedDuration: number;
  completions: number;
  isCompleted: boolean;
}

interface ActiveExercisesData {
  period: 'daily' | 'weekly' | 'monthly';
  periodLabel: string;
  startDate: string;
  endDate: string;
  totalExercises: number;
  completedExercises: number;
  totalDuration: number;
  exercises: Exercise[];
}

interface ExerciseTrackerProps {
  data: ActiveExercisesData | null;
  loading?: boolean;
  onComplete?: (exerciseId: string) => Promise<void>;
  onPeriodChange?: (period: 'daily' | 'weekly' | 'monthly') => Promise<void>;
}


type ViewMode = 'daily' | 'weekly' | 'monthly';

export default function ExerciseTracker({ data, loading, onComplete, onPeriodChange }: ExerciseTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [isChangingTab, setIsChangingTab] = useState(false);

  const handleTabChange = async (newViewMode: ViewMode) => {
    if (newViewMode === viewMode) return;
    
    setIsChangingTab(true);
    setViewMode(newViewMode);
    
    if (onPeriodChange) {
      await onPeriodChange(newViewMode);
    }
    
    // Kısa bir delay ile loading state'i kapat
    setTimeout(() => {
      setIsChangingTab(false);
    }, 300);
  };
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Tab navigation'ı her zaman göster
  const renderContent = () => {
    // Tab değişimi sırasında loading göster
    if (isChangingTab) {
      return (
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="text-right">
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="w-full bg-gray-200 rounded-full h-3"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      );
    }

    if (!data || !data.exercises || data.exercises.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Egzersiz yok</h3>
          <p className="text-gray-500">Planlanmış egzersiz bulunmuyor.</p>
        </div>
      );
    }

    const completionRate = data.totalExercises > 0 ? Math.round((data.completedExercises / data.totalExercises) * 100) : 0;

    return (
      <>
        {/* İçerik Alanı */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {viewMode === 'daily' && 'Günlük Egzersizler'}
              {viewMode === 'weekly' && 'Haftalık Egzersizler'}
              {viewMode === 'monthly' && 'Aylık Egzersizler'}
            </h3>
            <p className="text-sm text-gray-500">
              {viewMode === 'daily' && 'Bugünkü egzersiz planınız'}
              {viewMode === 'weekly' && 'Bu haftaki egzersiz özetiniz'}
              {viewMode === 'monthly' && 'Bu ayki egzersiz raporunuz'}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              completionRate === 100 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {completionRate}%
            </div>
            <div className="text-sm text-gray-500">Tamamlanma Oranı</div>
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {data.completedExercises}/{data.totalExercises} egzersiz tamamlandı
            </span>
            <span className="text-sm text-gray-500">
              {completionRate}% tamamlandı
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                completionRate === 100 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500'
              }`}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* İçerik - ViewMode'a göre */}
        {viewMode === 'daily' && (
          <div className="space-y-2">
            {data.exercises.map(exercise => {
              const isCompletedToday = exercise.isCompleted || false;

              return (
                <div 
                  key={exercise._id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCompletedToday 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {isCompletedToday ? (
                      <div className="w-5 h-5 bg-green-500 rounded border-2 border-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={() => onComplete?.(exercise._id)}
                        className="w-5 h-5 bg-white rounded border-2 border-gray-300 hover:border-green-500 transition-colors flex items-center justify-center"
                      >
                        {onComplete && (
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Egzersiz Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${
                      isCompletedToday 
                        ? 'text-green-700 line-through' 
                        : 'text-gray-900'
                    }`}>
                      {exercise.name}
                    </h3>
                    <p className={`text-sm ${
                      isCompletedToday 
                        ? 'text-green-600' 
                        : 'text-gray-500'
                    }`}>
                      {exercise.targetDuration} dakika
                    </p>
                  </div>

                  {/* Durum İkonu */}
                  <div className="flex-shrink-0">
                    {isCompletedToday ? (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {(viewMode === 'weekly' || viewMode === 'monthly') && (
          <div className="space-y-2">
            {data.exercises.map(exercise => {
              const isCompleted = exercise.isCompleted || false;

              return (
                <div 
                  key={exercise._id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-5 h-5 bg-green-500 rounded border-2 border-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <button
                        onClick={() => onComplete?.(exercise._id)}
                        className="w-5 h-5 bg-white rounded border-2 border-gray-300 hover:border-green-500 transition-colors flex items-center justify-center"
                      >
                        {onComplete && (
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Egzersiz Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${
                      isCompleted 
                        ? 'text-green-700 line-through' 
                        : 'text-gray-900'
                    }`}>
                      {exercise.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <p className={`${
                        isCompleted 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }`}>
                        {exercise.targetDuration} dakika
                      </p>
                      <p className={`${
                        isCompleted 
                          ? 'text-green-600' 
                          : 'text-gray-500'
                      }`}>
                        {exercise.completions} tamamlandı
                      </p>
                      {exercise.completedDuration > 0 && (
                        <p className={`${
                          isCompleted 
                            ? 'text-green-600' 
                            : 'text-gray-500'
                        }`}>
                          {exercise.completedDuration} dk yapıldı
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Durum İkonu */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Özet İstatistikler - Tüm görünümler için */}
        {data && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{data.completedExercises}</div>
              <div className="text-sm text-gray-500">
                {viewMode === 'daily' && 'Bugün tamamlanan'}
                {viewMode === 'weekly' && 'Bu hafta tamamlanan'}
                {viewMode === 'monthly' && 'Bu ay tamamlanan'}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Başlık ve Navigasyon */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center mb-4">
          <span className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></span>
          Egzersiz Takibi
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('daily')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'daily'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Günlük
          </button>
          <button
            onClick={() => handleTabChange('weekly')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'weekly'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Haftalık
          </button>
          <button
            onClick={() => handleTabChange('monthly')}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              viewMode === 'monthly'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Aylık
          </button>
        </div>
      </div>

      {/* İçerik */}
      {renderContent()}
    </div>
  );
}
