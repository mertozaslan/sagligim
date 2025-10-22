'use client';

import React, { useState } from 'react';
import { Exercise, CompleteExerciseData } from '@/services/exercises';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface ExerciseListProps {
  exercises: Exercise[];
  onComplete: (id: string, data: CompleteExerciseData) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export default function ExerciseList({ exercises = [], onComplete, onToggle, onDelete, loading }: ExerciseListProps) {
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    exercise: Exercise | null;
  }>({
    isOpen: false,
    exercise: null
  });

  const [completionData, setCompletionData] = useState<CompleteExerciseData>({
    duration: 0,
    notes: ''
  });

  const handleCompleteClick = (exercise: Exercise) => {
    setCompletionData({
      duration: exercise.duration,
      notes: ''
    });
    setCompletionModal({
      isOpen: true,
      exercise
    });
  };

  const handleCompleteSubmit = async () => {
    if (!completionModal.exercise) return;
    
    try {
      await onComplete(completionModal.exercise._id, completionData);
      setCompletionModal({ isOpen: false, exercise: null });
      setCompletionData({ duration: 0, notes: '' });
    } catch (error) {
      console.error('Completion error:', error);
    }
  };

  const getPeriodText = (exercise: Exercise) => {
    switch (exercise.period) {
      case 'daily':
        return 'Günlük';
      case 'weekly':
        return 'Haftalık';
      case 'monthly':
        return 'Aylık';
      case 'custom':
        return `Her ${exercise.customPeriod} gün`;
      default:
        return exercise.period;
    }
  };

  const getStreakDays = (exercise: Exercise) => {
    if (exercise.completionHistory.length === 0) return 0;
    
    const sortedHistory = exercise.completionHistory
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedHistory.length; i++) {
      const completionDate = new Date(sortedHistory[i].completedAt);
      completionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (completionDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz egzersiz yok</h3>
          <p className="text-gray-500">İlk egzersizinizi oluşturmak için yukarıdaki butona tıklayın.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
          Egzersizlerim
        </h2>
        
        <div className="space-y-4">
          {(exercises || []).map(exercise => {
            const streak = getStreakDays(exercise);
            const isCompletedToday = exercise.completionHistory.some(completion => {
              const completionDate = new Date(completion.completedAt).toDateString();
              const today = new Date().toDateString();
              return completionDate === today;
            });

            return (
              <div key={exercise._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{exercise.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        exercise.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {exercise.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                      {isCompletedToday && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Bugün tamamlandı
                        </span>
                      )}
                    </div>
                    
                    {exercise.description && (
                      <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {exercise.duration} dk
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {getPeriodText(exercise)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {exercise.completedCount} tamamlandı
                      </span>
                      {streak > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          {streak} gün streak
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {exercise.isActive && !isCompletedToday && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteClick(exercise)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Tamamla
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onToggle(exercise._id)}
                    >
                      {exercise.isActive ? 'Duraklat' : 'Başlat'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(exercise._id)}
                      className="text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tamamlama Modal */}
      <Modal
        isOpen={completionModal.isOpen}
        onClose={() => setCompletionModal({ isOpen: false, exercise: null })}
        title="Egzersizi Tamamla"
        size="md"
      >
        {completionModal.exercise && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {completionModal.exercise.name}
              </h3>
              <p className="text-sm text-gray-600">
                Hedef süre: {completionModal.exercise.duration} dakika
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gerçekleştirilen Süre (dakika)
              </label>
              <input
                type="number"
                value={completionData.duration}
                onChange={(e) => setCompletionData(prev => ({ 
                  ...prev, 
                  duration: parseInt(e.target.value) || 0 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="300"
                placeholder={completionModal.exercise.duration.toString()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notlar (opsiyonel)
              </label>
              <textarea
                value={completionData.notes}
                onChange={(e) => setCompletionData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Egzersiz hakkında notlarınız..."
                maxLength={200}
              />
              <p className="text-gray-500 text-sm mt-1">{completionData.notes?.length || 0}/200 karakter</p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCompletionModal({ isOpen: false, exercise: null })}
              >
                İptal
              </Button>
              <Button
                onClick={handleCompleteSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                Tamamla
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
