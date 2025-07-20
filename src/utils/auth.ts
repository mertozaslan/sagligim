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