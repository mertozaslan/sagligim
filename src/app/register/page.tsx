'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { authService } from '@/services/auth';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL parametresinden role'u al
  const roleParam = searchParams.get('role');
  const initialRole = (roleParam === 'doctor' ? 'doctor' : 'patient') as 'patient' | 'doctor';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    role: initialRole,
    // Doctor specific fields
    location: '',
    specialization: '',
    hospital: '',
    experience: '',
    terms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'warning' | 'info'} | null>(null);
  
  // Input refs for scrolling
  const inputRefs = useRef<{[key: string]: HTMLInputElement | HTMLSelectElement | null}>({});

  const specialties = [
    'Kardiyoloji',
    'Beslenme ve Diyet',
    'Fizyoterapi',
    'Psikoloji',
    'Dermatoloji',
    'Genel Cerrahi',
    'İç Hastalıkları',
    'Nöroloji',
    'Ortopedi',
    'Pediatri'
  ];


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Hatalı inputa tıklandığında hatayı temizle
  const handleFocus = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // İlk hatalı alana scroll yap
  const scrollToFirstError = (errors: {[key: string]: string}) => {
    const firstErrorField = Object.keys(errors)[0];
    const inputElement = inputRefs.current[firstErrorField];
    
    if (inputElement) {
      inputElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      inputElement.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    // Client-side validasyon - Backend kurallarına uygun
    const errors: {[key: string]: string} = {};

    // Username validasyonu
    if (!formData.username.trim()) {
      errors.username = 'Kullanıcı adı zorunludur.';
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      errors.username = 'Kullanıcı adı 3-30 karakter arasında olmalı.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.';
    }

    // Email validasyonu
    if (!formData.email.trim()) {
      errors.email = 'E-posta adresi zorunludur.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Geçerli bir e-posta adresi girin.';
    }

    // Password validasyonu
    if (!formData.password) {
      errors.password = 'Şifre alanı zorunludur.';
    } else if (formData.password.length < 6) {
      errors.password = 'Şifre en az 6 karakter olmalı.';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermeli.';
    }

    // Confirm password validasyonu
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Şifre tekrarı zorunludur.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Şifreler eşleşmiyor.';
    }

    // First name validasyonu
    if (!formData.firstName.trim()) {
      errors.firstName = 'Ad alanı zorunludur.';
    } else if (formData.firstName.length < 2 || formData.firstName.length > 50) {
      errors.firstName = 'Ad 2-50 karakter arasında olmalı.';
    } else if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(formData.firstName)) {
      errors.firstName = 'Ad sadece harf içerebilir.';
    }

    // Last name validasyonu
    if (!formData.lastName.trim()) {
      errors.lastName = 'Soyad alanı zorunludur.';
    } else if (formData.lastName.length < 2 || formData.lastName.length > 50) {
      errors.lastName = 'Soyad 2-50 karakter arasında olmalı.';
    } else if (!/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(formData.lastName)) {
      errors.lastName = 'Soyad sadece harf içerebilir.';
    }

    // Terms validasyonu
    if (!formData.terms) {
      errors.terms = 'Kullanım şartlarını kabul etmelisiniz.';
    }

    // Doktor validasyonu
    if (formData.role === 'doctor') {
      if (!formData.specialization) {
        errors.specialization = 'Uzmanlık alanı seçmelisiniz.';
      }
      if (!formData.location.trim()) {
        errors.location = 'Konum alanı zorunludur.';
      }
      if (!formData.hospital.trim()) {
        errors.hospital = 'Hastane bilgisi zorunludur.';
      }
    }

    // Eğer client-side hata varsa
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(`Form doğrulama hatası: ${Object.keys(errors).length} alan kontrol edilmeli.`);
      setToast({
        message: 'Lütfen formu eksiksiz ve doğru doldurun.',
        type: 'error'
      });
      scrollToFirstError(errors);
      setIsLoading(false);
      return;
    }

    try {

      // API ile kayıt yap
      const registerData: any = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || '1990-01-01',
        role: formData.role
      };

      // Doctor specific fields
      if (formData.role === 'doctor') {
        registerData.location = formData.location;
        registerData.specialization = formData.specialization;
        registerData.hospital = formData.hospital;
        registerData.experience = parseInt(formData.experience) || 0;
      }

      const response = await authService.register(registerData);
      
      // Başarılı kayıt
      console.log('Kayıt başarılı:', response);
      
      // Başarı mesajı göster
      setError('');
      setFieldErrors({});
      setToast({
        message: 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...',
        type: 'success'
      });
      
      // 2 saniye sonra yönlendir
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      
      // API'dan gelen validation hatalarını işle
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const apiErrors: {[key: string]: string} = {};
        error.response.data.errors.forEach((err: any) => {
          // Field mapping - API'dan gelen field isimleri form field isimleriyle eşleştir
          const fieldMap: {[key: string]: string} = {
            'username': 'username',
            'email': 'email',
            'password': 'password',
            'firstName': 'firstName',
            'lastName': 'lastName',
            'specialization': 'specialization',
            'location': 'location',
            'hospital': 'hospital'
          };
          
          const mappedField = fieldMap[err.field] || err.field;
          apiErrors[mappedField] = err.message;
        });
        setFieldErrors(apiErrors);
        
        // Genel hata mesajını oluştur
        const errorCount = error.response.data.errors.length;
        const generalMessage = error.response.data.message;
        
        if (generalMessage && generalMessage !== 'Validation hatası') {
          setError(generalMessage);
          setToast({ message: generalMessage, type: 'error' });
        } else {
          const errorMsg = `Form doğrulama hatası: ${errorCount} alan kontrol edilmeli.`;
          setError(errorMsg);
          setToast({ message: errorMsg, type: 'error' });
        }
        scrollToFirstError(apiErrors);
      } else if (error.response?.data?.message) {
        // Genel API hatası
        const errorMsg = error.response.data.message;
        setError(errorMsg);
        setToast({ message: errorMsg, type: 'error' });
      } else if (error.message) {
        // Network veya diğer hatalar
        setError(error.message);
        setToast({ message: error.message, type: 'error' });
      } else {
        const errorMsg = 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
        setError(errorMsg);
        setToast({ message: errorMsg, type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Sağlık Hep</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Hesap oluşturun
          </h2>
          <p className="text-gray-600">
            Sağlık topluluğumuza katılın ve uzmanlarla bağlantı kurun
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* User Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Hesap Türü *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${formData.role === 'patient' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={formData.role === 'patient'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      Hasta/Kullanıcı
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      Sağlık bilgilerine erişim
                    </span>
                  </div>
                </label>

                <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${formData.role === 'doctor' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={formData.role === 'doctor'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      Doktor
                    </span>
                    <span className="mt-1 text-sm text-gray-500">
                      Hasta bakımı ve danışmanlık
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Kullanıcı Adı *
              </label>
              <input
                ref={(el) => { inputRefs.current.username = el; }}
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                onFocus={() => handleFocus('username')}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  fieldErrors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="kullanici_adi"
              />
              {fieldErrors.username && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Ad *
              </label>
              <input
                ref={(el) => { inputRefs.current.firstName = el; }}
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                onFocus={() => handleFocus('firstName')}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  fieldErrors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Adınız"
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Soyad *
              </label>
              <input
                ref={(el) => { inputRefs.current.lastName = el; }}
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                onFocus={() => handleFocus('lastName')}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  fieldErrors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Soyadınız"
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-posta adresi *
              </label>
              <input
                ref={(el) => { inputRefs.current.email = el; }}
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                onFocus={() => handleFocus('email')}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="ornek@email.com"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Doctor specific fields */}
            {formData.role === 'doctor' && (
              <>
                {/* Specialization */}
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    Uzmanlık Alanı *
                  </label>
                  <select
                    ref={(el) => { inputRefs.current.specialization = el; }}
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    onFocus={() => handleFocus('specialization')}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      fieldErrors.specialization ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Uzmanlık alanınızı seçin</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.specialization}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Konum *
                  </label>
                  <input
                    ref={(el) => { inputRefs.current.location = el; }}
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    onFocus={() => handleFocus('location')}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      fieldErrors.location ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="İstanbul, Türkiye"
                  />
                  {fieldErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
                  )}
                </div>

                {/* Hospital */}
                <div>
                  <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-1">
                    Hastane/Kurum *
                  </label>
                  <input
                    ref={(el) => { inputRefs.current.hospital = el; }}
                    id="hospital"
                    name="hospital"
                    type="text"
                    required
                    value={formData.hospital}
                    onChange={handleChange}
                    onFocus={() => handleFocus('hospital')}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      fieldErrors.hospital ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Acıbadem Hastanesi"
                  />
                  {fieldErrors.hospital && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.hospital}</p>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                    Deneyim (Yıl)
                  </label>
                  <input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>

              </>
            )}

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Doğum Tarihi
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cinsiyet
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${formData.gender === 'male' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900">Erkek</span>
                </label>
                <label className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${formData.gender === 'female' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900">Kadın</span>
                </label>
                <label className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none ${formData.gender === 'other' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-900">Diğer</span>
                </label>
              </div>
            </div>



            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre *
              </label>
              <input
                ref={(el) => { inputRefs.current.password = el; }}
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus('password')}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="En az 6 karakter"
              />
              {fieldErrors.password && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Şifre Tekrar *
              </label>
              <input
                ref={(el) => { inputRefs.current.confirmPassword = el; }}
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => handleFocus('confirmPassword')}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  fieldErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Şifrenizi tekrar girin"
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded mt-1 ${
                  fieldErrors.terms ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                <Link href="#" className="text-blue-600 hover:text-blue-500">
                  Kullanım Şartları
                </Link>{' '}
                ve{' '}
                <Link href="#" className="text-blue-600 hover:text-blue-500">
                  Gizlilik Politikası
                </Link>
                &apos;nı okudum ve kabul ediyorum *
              </label>
            </div>
            {fieldErrors.terms && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </Button>
          </div>

          {/* Doctor Info */}
          {formData.role === 'doctor' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-amber-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Doktor Hesabı</h3>
                  <p className="mt-1 text-sm text-amber-700">
                    Doktor hesabınız onay süreci gerektirir. Bilgileriniz kontrol edilecektir.
                  </p>
                </div>
              </div>
            </div>
          )}

   

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Giriş yapın
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
} 