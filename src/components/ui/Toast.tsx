import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: '✓',
      iconBg: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '✕',
      iconBg: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠',
      iconBg: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ',
      iconBg: 'bg-blue-500'
    }
  };

  const style = colors[type];

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-top-5 duration-300">
      <div className={`${style.bg} ${style.border} border rounded-xl shadow-2xl p-4 max-w-md flex items-start space-x-3`}>
        <div className={`${style.iconBg} rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold">{style.icon}</span>
        </div>
        <div className="flex-1">
          <p className={`${style.text} text-sm font-medium leading-relaxed`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;

