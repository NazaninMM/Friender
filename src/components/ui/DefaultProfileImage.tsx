import React from 'react';
import { User } from 'lucide-react';

interface DefaultProfileImageProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DefaultProfileImage: React.FC<DefaultProfileImageProps> = ({ 
  name, 
  size = 'md',
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br from-blue-400 to-purple-500 
        rounded-full flex items-center justify-center 
        text-white font-semibold
        ${className}
      `}
    >
      {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
    </div>
  );
}; 