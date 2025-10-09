'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { isAuthenticated, getCurrentUser, logout, formatUserName } from '@/utils/auth';
import { User } from '@/services/auth';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      const currentUser = getCurrentUser();
      console.log('Auth durumu kontrol ediliyor:', { authStatus, currentUser }); // Debug için
      setAuthenticated(authStatus);
      setUser(currentUser);
    };

    // İlk yüklemede kontrol et
    checkAuth();
    
    // Auth durumu değişikliklerini dinle
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        console.log('Storage değişti:', e.key); // Debug için
        checkAuth();
      }
    };

    // Custom event listener - aynı tab içinde değişiklikler için
    const handleAuthChange = () => {
      console.log('Auth değişikliği algılandı'); // Debug için
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Topluluk', href: '/posts' },
    { name: 'Keşfet', href: '/blogs' },
    { name: 'Etkinlikler', href: '/events' },
    { name: 'Uzmanlar', href: '/experts' },
  ];

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUser(null);
    setIsProfileDropdownOpen(false);
  };

  // Profile dropdown'ı kapat
  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileDropdownOpen && !target.closest('.profile-dropdown')) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative h-24">
                <Image
                  src="/logoSaglik.png"
                  alt="Sağlığım Logo"
                  width={320}
                  height={175}
                  className="object-contain h-20 w-auto"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {authenticated ? (
              <div className="relative profile-dropdown">
                {/* Profile Button */}
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar
                    src={
                      user?.profilePicture 
                        ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${user.profilePicture}`
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(formatUserName(user))}&background=3b82f6&color=fff`
                    }
                    alt={formatUserName(user)}
                    size="sm"
                  />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{formatUserName(user)}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isProfileDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          src={
                            user?.profilePicture 
                              ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${user.profilePicture}`
                              : `https://ui-avatars.com/api/?name=${encodeURIComponent(formatUserName(user))}&background=3b82f6&color=fff`
                          }
                          alt={formatUserName(user)}
                          size="md"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatUserName(user)}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {user?.role === 'admin' ? 'Yönetici' : user?.role === 'expert' ? 'Uzman' : 'Kullanıcı'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profil"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={closeProfileDropdown}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profilim
                      </Link>
                      
                      {/* <Link
                        href="/posts"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={closeProfileDropdown}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sorularım
                      </Link>

                      <Link
                        href="/events"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={closeProfileDropdown}
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Etkinliklerim
                      </Link> */}

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Giriş Yap</span>
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Kayıt Ol</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePath(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              {authenticated ? (
                <div className="px-3 space-y-3">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Avatar
                      src={
                        user?.profilePicture 
                          ? `${process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.saglikhep.com'}${user.profilePicture}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(formatUserName(user))}&background=3b82f6&color=fff`
                      }
                      alt={formatUserName(user)}
                      size="md"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{formatUserName(user)}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {user?.role === 'admin' ? 'Yönetici' : user?.role === 'expert' ? 'Uzman' : 'Kullanıcı'}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Link
                      href="/profil"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profilim
                    </Link>
                    
                    <Link
                      href="/posts"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Sorularım
                    </Link>

                    <Link
                      href="/events"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Etkinliklerim
                    </Link>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Link href="/login" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Giriş Yap</span>
                    </Button>
                  </Link>
                  <Link href="/register" className="block" onClick={() => setIsMenuOpen(false)}>
                    <Button size="sm" className="w-full flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Kayıt Ol</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 