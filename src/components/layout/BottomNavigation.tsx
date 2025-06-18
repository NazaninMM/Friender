import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MessageCircle, Calendar, User } from 'lucide-react';

interface BottomNavigationProps {
  currentTab: 'home' | 'chats' | 'activities' | 'profile';
  onTabChange: (tab: 'home' | 'chats' | 'activities' | 'profile') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'home' as const, label: 'Explore', icon: Compass },
    { id: 'chats' as const, label: 'Chats', icon: MessageCircle },
    { id: 'activities' as const, label: 'Activities', icon: Calendar },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};