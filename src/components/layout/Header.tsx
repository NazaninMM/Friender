import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Home, Calendar, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user?: any;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, user }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-activities', label: 'My Activities', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50"
    >
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Friender
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => onNavigate('create')}
              size="sm"
              className="p-2 rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
            
            {user && (
              <div className="flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate(item.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600' 
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};