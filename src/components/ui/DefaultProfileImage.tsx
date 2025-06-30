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

  const getRandomColor = (name: string) => {
    // Generate a consistent color based on the name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use a predefined set of gradient pairs for better aesthetics
    const gradientPairs = [
      ['from-blue-400 to-indigo-500', 'text-white'],
      ['from-purple-400 to-pink-500', 'text-white'],
      ['from-green-400 to-teal-500', 'text-white'],
      ['from-yellow-400 to-orange-500', 'text-white'],
      ['from-red-400 to-pink-500', 'text-white'],
      ['from-indigo-400 to-purple-500', 'text-white'],
      ['from-pink-400 to-rose-500', 'text-white'],
      ['from-teal-400 to-cyan-500', 'text-white'],
    ];
    
    const index = Math.abs(hash) % gradientPairs.length;
    return gradientPairs[index][0];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg'
  };

  const colorClass = getRandomColor(name || 'User');

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        bg-gradient-to-br ${colorClass}
        rounded-full flex items-center justify-center 
        text-white font-semibold
        ${className}
      `}
    >
      {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
    </div>
  );
};