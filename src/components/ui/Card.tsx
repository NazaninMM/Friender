import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true 
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};