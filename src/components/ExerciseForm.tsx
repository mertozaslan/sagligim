'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { CreateExerciseData } from '@/services/exercises';

interface ExerciseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExerciseData) => Promise<void>;
  initialData?: CreateExerciseData;
  title: string;
}

export default function ExerciseForm({ isOpen, onClose, onSubmit, initialData, title }: ExerciseFormProps) {
  const [formData, setFormData] = useState<CreateExerciseData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 30,
    period: initialData?.period || 'daily',
    customPeriod: initialData?.customPeriod
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validation
      const newErrors: Record<string, string> = {};
      
      if (!formData.name.trim()) {
        newErrors.name = 'Egzersiz adı gerekli';
      } else if (formData.name.length < 2 || formData.name.length > 100) {
        newErrors.name = 'Egzersiz adı 2-100 karakter arasında olmalı';
      }

      if (formData.duration < 1 || formData.duration > 300) {
        newErrors.duration = 'Süre 1-300 dakika arasında olmalı';
      }

      if (formData.period === 'custom' && (!formData.customPeriod || formData.customPeriod < 1 || formData.customPeriod > 365)) {
        newErrors.customPeriod = 'Özel periyot 1-365 gün arasında olmalı';
      }

      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Açıklama en fazla 500 karakter olabilir';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      await onSubmit(formData);
      onClose();
    } catch (error: any) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Egzersiz Adı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Egzersiz Adı *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Örn: Sabah Koşusu"
            maxLength={100}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Egzersiz hakkında detaylar..."
            rows={3}
            maxLength={500}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          <p className="text-gray-500 text-sm mt-1">{formData.description?.length || 0}/500 karakter</p>
        </div>

        {/* Süre ve Periyot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Süre (dakika) *
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
              max="300"
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periyot *
            </label>
            <select
              value={formData.period}
              onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Günlük</option>
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
              <option value="custom">Özel</option>
            </select>
          </div>
        </div>

        {/* Özel Periyot */}
        {formData.period === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Özel Periyot (gün) *
            </label>
            <input
              type="number"
              value={formData.customPeriod || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, customPeriod: parseInt(e.target.value) || undefined }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.customPeriod ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1"
              max="365"
              placeholder="Örn: 3"
            />
            {errors.customPeriod && <p className="text-red-500 text-sm mt-1">{errors.customPeriod}</p>}
          </div>
        )}


        {/* Butonlar */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
