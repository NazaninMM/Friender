import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Bell, Eye, Trash2, Download, LogOut, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SettingsScreenProps {
  onLogout: () => void;
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onLogout, onBack }) => {
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    showAge: true,
    showLocation: true,
    showLastActive: false,
  });

  const settingsSections = [
    {
      title: 'Privacy & Safety',
      icon: Shield,
      items: [
        {
          label: 'Show Age',
          value: privacy.showAge,
          onChange: (value: boolean) => setPrivacy(prev => ({ ...prev, showAge: value })),
        },
        {
          label: 'Show Location',
          value: privacy.showLocation,
          onChange: (value: boolean) => setPrivacy(prev => ({ ...prev, showLocation: value })),
        },
        {
          label: 'Show Last Active',
          value: privacy.showLastActive,
          onChange: (value: boolean) => setPrivacy(prev => ({ ...prev, showLastActive: value })),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'New Matches',
          value: notifications.newMatches,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, newMatches: value })),
        },
        {
          label: 'Messages',
          value: notifications.messages,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, messages: value })),
        },
        {
          label: 'Marketing',
          value: notifications.marketing,
          onChange: (value: boolean) => setNotifications(prev => ({ ...prev, marketing: value })),
        },
      ],
    },
  ];

  const actionItems = [
    {
      label: 'View My Data',
      icon: Eye,
      action: () => alert('Data viewing feature coming soon!'),
      color: 'text-gray-700',
    },
    {
      label: 'Download My Data',
      icon: Download,
      action: () => alert('Data download feature coming soon!'),
      color: 'text-gray-700',
    },
    {
      label: 'Delete My Data',
      icon: Trash2,
      action: () => {
        if (confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
          alert('Data deletion initiated. You will receive a confirmation email.');
        }
      },
      color: 'text-red-600',
    },
  ];

  const ToggleSwitch: React.FC<{ value: boolean; onChange: (value: boolean) => void }> = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          value ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your privacy and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 pb-24">
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between">
                        <span className="text-gray-700">{item.label}</span>
                        <ToggleSwitch value={item.value} onChange={item.onChange} />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                </div>

                <div className="space-y-3">
                  {actionItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={item.action}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <span className={`${item.color}`}>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Account Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Privacy First</h4>
                  <p className="text-sm text-blue-700">
                    Your data is encrypted and never shared with third parties. 
                    You maintain full control over your information.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};