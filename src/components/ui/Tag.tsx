import React from 'react';

interface TagProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  children,
  onClick,
  active = false,
  removable = false,
  onRemove,
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center px-3 py-1 text-sm font-medium rounded-full transition-all duration-200';
  
  const statusClasses = active
    ? 'bg-blue-100 text-blue-800 border border-blue-200'
    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200';
    
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const tagClasses = `${baseClasses} ${statusClasses} ${clickableClasses} ${className}`;

  return (
    <span className={tagClasses} onClick={onClick}>
      <span className="flex items-center">
        #{children}
        {removable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-2 w-4 h-4 rounded-full hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-600"
          >
            ×
          </button>
        )}
      </span>
    </span>
  );
};

export default Tag; 