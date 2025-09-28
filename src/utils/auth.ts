import { authService, User } from '@/services/auth';

// Admin kontrolü
export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering için
  }
  
  try {
    const adminStatus = localStorage.getItem('isAdmin');
    return adminStatus === 'true';
  } catch (error) {
    console.error('LocalStorage erişim hatası:', error);
    return false;
  }
};

export const setAdminStatus = (status: boolean): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('isAdmin', status.toString());
  } catch (error) {
    console.error('LocalStorage yazma hatası:', error);
  }
};

export const removeAdminStatus = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem('isAdmin');
  } catch (error) {
    console.error('LocalStorage silme hatası:', error);
  }
};

// Auth utility fonksiyonları
export const isAuthenticated = (): boolean => {
  return authService.isAuthenticated();
};

export const getCurrentUser = (): User | null => {
  return authService.getCurrentUser();
};

export const getToken = (): string | null => {
  return authService.getToken();
};

// Kullanıcı çıkış yapma
export const logout = async (): Promise<void> => {
  await authService.logout();
  
  // Auth değişikliği event'ini dispatch et
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('authChange'));
    // Sayfayı yenile veya ana sayfaya yönlendir
    window.location.href = '/';
  }
};

// Kullanıcı giriş kontrolü ve yönlendirme
export const requireAuth = (): boolean => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return true;
};

// Admin yetkisi kontrolü
export const requireAdmin = (): boolean => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  
  if (!isAdmin()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return false;
  }
  
  return true;
};

// Kullanıcı rolü kontrolü
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Kullanıcı adı formatla
export const formatUserName = (user: User | null): string => {
  if (!user) return 'Kullanıcı';
  return `${user.firstName} ${user.lastName}`.trim() || user.username;
};

// Kullanıcı yaşını hesapla
export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Token süresi kontrolü (basit)
export const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;
  
  try {
    // JWT token'ı decode et (basit kontrol)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Token decode hatası:', error);
    return true;
  }
}; 