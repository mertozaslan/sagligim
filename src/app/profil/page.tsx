'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { getCurrentUser, isAuthenticated, logout, formatUserName, calculateAge } from '@/utils/auth';
import { User } from '@/services/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }
      
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kullanıcı bulunamadı</h1>
          <Link href="/login">
            <Button>Giriş Yap</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-6">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formatUserName(user))}&background=3b82f6&color=fff&size=120`}
              alt={formatUserName(user)}
              size="lg"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{formatUserName(user)}</h1>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-500 text-sm mt-1">{user.email}</p>
              {user.dateOfBirth && (
                <p className="text-gray-500 text-sm">
                  {calculateAge(user.dateOfBirth)} yaşında
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">
                Profili Düzenle
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad</label>
                  <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Soyad</label>
                  <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-posta</label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phone || 'Belirtilmemiş'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cinsiyet</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.gender === 'male' ? 'Erkek' : user.gender === 'female' ? 'Kadın' : 'Diğer'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hesap Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kullanıcı Adı</label>
                  <p className="mt-1 text-sm text-gray-900">@{user.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rol</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.role === 'admin' ? 'Yönetici' : user.role === 'expert' ? 'Uzman' : 'Kullanıcı'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hesap Durumu</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kayıt Tarihi</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
              <div className="space-y-3">
                <Link href="/posts" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Soru Sor
                  </Button>
                </Link>
                <Link href="/events/olustur" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Etkinlik Oluştur
                  </Button>
                </Link>
                <Link href="/uzmanlar" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Uzman Ara
                  </Button>
                </Link>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">İstatistikler</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam Soru</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Toplam Cevap</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Katıldığı Etkinlik</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Takipçi</span>
                  <span className="text-sm font-medium text-gray-900">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
