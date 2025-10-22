'use client';

import React, { useState, useEffect } from 'react';
import { useExerciseStore } from '@/stores/exercisesStore';
import { Exercise } from '@/services/exercises';

interface ExerciseCalendarProps {
  exercises: Exercise[];
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export default function ExerciseCalendar({ exercises = [], onDateSelect, selectedDate }: ExerciseCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [completionData, setCompletionData] = useState<Record<string, { completed: number; total: number }>>({});

  // Ay değiştirme
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Takvim günlerini oluştur
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Günlük tamamlanma verilerini hesapla
  useEffect(() => {
    const calculateCompletionData = () => {
      const data: Record<string, { completed: number; total: number }> = {};
      
      (exercises || []).forEach(exercise => {
        exercise.completionHistory.forEach(completion => {
          const date = new Date(completion.completedAt).toISOString().split('T')[0];
          if (!data[date]) {
            data[date] = { completed: 0, total: 0 };
          }
          data[date].completed += 1;
        });
      });

      // Her gün için toplam egzersiz sayısını hesapla
      Object.keys(data).forEach(date => {
        const dayExercises = (exercises || []).filter(exercise => {
          const startDate = new Date(exercise.startDate);
          const endDate = exercise.endDate ? new Date(exercise.endDate) : null;
          const checkDate = new Date(date);
          
          if (checkDate < startDate) return false;
          if (endDate && checkDate > endDate) return false;
          
          // Periyot kontrolü
          const daysDiff = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          
          switch (exercise.period) {
            case 'daily':
              return true;
            case 'weekly':
              return daysDiff % 7 === 0;
            case 'monthly':
              return daysDiff % 30 === 0;
            case 'custom':
              return exercise.customPeriod ? daysDiff % exercise.customPeriod === 0 : false;
            default:
              return false;
          }
        });
        
        data[date].total = dayExercises.length;
      });
      
      setCompletionData(data);
    };

    calculateCompletionData();
  }, [exercises]);

  // Gün rengini belirle
  const getDayColor = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const data = completionData[dateStr];
    
    if (!data) return 'bg-gray-50 text-gray-400';
    
    if (data.total === 0) return 'bg-gray-50 text-gray-400';
    
    const percentage = data.completed / data.total;
    
    if (percentage === 1) return 'bg-green-500 text-white';
    if (percentage >= 0.5) return 'bg-yellow-400 text-white';
    if (percentage > 0) return 'bg-red-400 text-white';
    
    return 'bg-gray-100 text-gray-600';
  };

  // Gün seçimi
  const handleDayClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    onDateSelect(dateStr);
  };

  const days = getCalendarDays();
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3"></span>
          Egzersiz Takvimi
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => changeMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
      </div>

      {/* Hafta günleri */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Takvim günleri */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toISOString().split('T')[0] === selectedDate;
          const dayColor = getDayColor(day);
          const dateStr = day.toISOString().split('T')[0];
          const data = completionData[dateStr];

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                relative p-2 text-sm rounded-lg transition-all hover:shadow-md
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'ring-2 ring-green-500' : ''}
                ${dayColor}
              `}
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">{day.getDate()}</span>
                {data && data.total > 0 && (
                  <div className="text-xs mt-1">
                    <div className="flex items-center justify-center gap-1">
                      <span>{data.completed}</span>
                      <span>/</span>
                      <span>{data.total}</span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Açıklama */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Tamamlandı</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span>Kısmen</span>
        </div>
      </div>
    </div>
  );
}
