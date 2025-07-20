'use client';

import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { isAdmin, setAdminStatus, removeAdminStatus } from '@/utils/auth';

const AdminPanel: React.FC = () => {
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsUserAdmin(isAdmin());
  }, []);

  const handleToggleAdmin = () => {
    const newAdminStatus = !isUserAdmin;
    setAdminStatus(newAdminStatus);
    setIsUserAdmin(newAdminStatus);
    
    if (newAdminStatus) {
      alert('Admin yetkisi verildi! Artık etkinlik oluşturabilirsiniz.');
    } else {
      alert('Admin yetkisi kaldırıldı.');
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="rounded-full shadow-lg"
        >
          ⚙️ Test Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Test Paneli</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Admin Durumu:</span>
            <Badge variant={isUserAdmin ? 'success' : 'default'}>
              {isUserAdmin ? 'Admin' : 'Kullanıcı'}
            </Badge>
          </div>
          <Button
            onClick={handleToggleAdmin}
            variant={isUserAdmin ? 'outline' : 'primary'}
            size="sm"
            className="w-full"
          >
            {isUserAdmin ? 'Admin Yetkisini Kaldır' : 'Admin Yetkisi Ver'}
          </Button>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3">
          <p className="mb-2">
            <strong>Admin yetkisi ile:</strong>
          </p>
          <ul className="space-y-1">
            <li>• Etkinlik oluşturabilirsiniz</li>
            <li>• Etkinlikleri yönetebilirsiniz</li>
            <li>• Admin paneline erişebilirsiniz</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3">
          <p>
            Bu panel sadece test amaçlıdır. Gerçek uygulamada admin yetkileri 
            kullanıcı hesabı ile yönetilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 