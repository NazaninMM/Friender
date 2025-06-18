import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Clock, Users, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CreateActivityData, ActivityCategory } from '../../types';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateActivity: (activity: CreateActivityData) => void;
}

export const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreateActivity 
}) => {
  const [formData, setFormData] = useState<CreateActivityData>({
    title: '',
    description: '',
    location: '',
    date: new Date(),
    time: '',
    maxAttendees: 4,
    category: 'social',
    tags: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.description && formData.location && formData.time) {
      onCreateActivity(formData);
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: new Date(),
        time: '',
        maxAttendees: 4,
        category: 'social',
        tags: [],
      });
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Activity</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Title *
            </label>
            <Input
              placeholder="e.g., Coffee & Chat at Blue Bottle"
              value={formData.title}
              onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              placeholder="Describe your activity and what participants can expect..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 resize-none h-24"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location *
            </label>
            <Input
              placeholder="e.g., Blue Bottle Coffee, Mission District"
              value={formData.location}
              onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.date)}
                onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200"
                min={formatDateForInput(new Date())}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Max Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Maximum Attendees
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="2"
                max="20"
                value={formData.maxAttendees}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAttendees: parseInt(e.target.value) }))}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-blue-600 min-w-[3rem] text-center">
                {formData.maxAttendees}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.title || !formData.description || !formData.location || !formData.time}
            >
              Create Activity
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};