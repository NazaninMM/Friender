import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Music, Brain, Check, ArrowRight, Shield, Upload, FileText, AlertCircle, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface DataConnectionScreenProps {
  onComplete: () => void;
}

export const DataConnectionScreen: React.FC<DataConnectionScreenProps> = ({ onComplete }) => {
  const [dataSources, setDataSources] = useState<any[]>([]);
  const [step, setStep] = useState<'connect' | 'upload' | 'instructions'>('connect');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>('');

  const handleConnect = (sourceId: string) => {
    setDataSources(prev => 
      prev.map(source => 
        source.id === sourceId 
          ? { ...source, connected: true, lastSync: new Date() }
          : source
      )
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError('');
    
    if (file) {
      if (file.type !== 'application/json') {
        setUploadError('Please upload a JSON file from your ChatGPT data export.');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setUploadError('File is too large. Please ensure your export is under 50MB.');
        return;
      }

      setUploadedFile(file);
      setDataSources(prev => 
        prev.map(source => 
          source.id === 'openai' 
            ? { ...source, connected: true, lastSync: new Date() }
            : source
        )
      );
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'instagram': return Instagram;
      case 'spotify': return Music;
      case 'openai': return Brain;
      default: return Shield;
    }
  };

  const connectedCount = dataSources.filter(source => source.connected).length;
  const canProceed = connectedCount >= 2;

  if (step === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your ChatGPT Data</h2>
            <p className="text-gray-600">
              Follow these steps to download your conversation history from OpenAI
            </p>
          </motion.div>

          <div className="space-y-4 mb-8">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visit ChatGPT Settings</h3>
                    <p className="text-gray-600 text-sm mt-1">Go to chatgpt.com and click on your profile in the bottom left</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Navigate to Data Controls</h3>
                    <p className="text-gray-600 text-sm mt-1">Click "Settings" → "Data controls" → "Export data"</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Request Your Data</h3>
                    <p className="text-gray-600 text-sm mt-1">Click "Export" and wait for the email with your data download link</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Download & Upload</h3>
                    <p className="text-gray-600 text-sm mt-1">Download the ZIP file, extract it, and upload the conversations.json file here</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-900">Processing Time</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    OpenAI typically takes a few minutes to prepare your data export. You'll receive an email when it's ready.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.open('https://chatgpt.com', '_blank')}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Open ChatGPT Settings</span>
            </Button>
            
            <Button
              onClick={() => setStep('upload')}
              variant="outline"
              className="w-full"
            >
              I Have My Data File
            </Button>
            
            <Button
              onClick={() => setStep('connect')}
              variant="ghost"
              className="w-full"
            >
              Back to Connections
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your ChatGPT Data</h2>
            <p className="text-gray-600">
              Upload your conversations.json file to enhance friend matching with AI personality analysis
            </p>
          </motion.div>

          <Card className="p-6 mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload conversations.json</h3>
              <p className="text-gray-600 mb-4">
                Select the conversations.json file from your ChatGPT data export
              </p>

              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer mb-4">
                  <FileText className="w-4 h-4 mr-2" />
                  Choose JSON File
                </Button>
              </label>

              {uploadError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 text-sm">{uploadError}</span>
                  </div>
                </motion.div>
              )}

              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">{uploadedFile.name}</span>
                  </div>
                  <p className="text-green-600 text-xs mt-1">
                    File uploaded successfully! AI analysis will enhance your matches.
                  </p>
                </motion.div>
              )}
            </div>
          </Card>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Your Privacy is Protected</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your conversation data is processed locally and used only for personality analysis. We never store or share your personal conversations.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setStep('instructions')}
              variant="ghost"
              className="w-full"
            >
              Need Help Getting Your Data?
            </Button>
            
            <Button
              onClick={() => setStep('connect')}
              variant="outline"
              className="w-full"
            >
              Back to Connections
            </Button>
            
            <Button
              onClick={onComplete}
              className="w-full"
              disabled={!canProceed}
            >
              Continue to Friend Matching
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Data</h2>
          <p className="text-gray-600">
            Connect at least 2 sources to start finding your perfect friend matches using AI personality analysis
          </p>
          
          <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-medium text-primary-600">{connectedCount}/3</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(connectedCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <div className="space-y-4 mb-8">
          {dataSources.map((source, index) => {
            const Icon = getSourceIcon(source.type);
            
            return (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        source.connected 
                          ? 'bg-gradient-to-r from-green-100 to-green-200' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          source.connected ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        <p className="text-sm text-gray-600">
                          {source.permissions.join(', ')}
                        </p>
                        {source.type === 'openai' && (
                          <p className="text-xs text-primary-600 mt-1">
                            Enhances personality matching accuracy
                          </p>
                        )}
                      </div>
                    </div>

                    {source.connected ? (
                      <div className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Connected</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          if (source.type === 'openai') {
                            setStep('instructions');
                          } else {
                            handleConnect(source.id);
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Privacy-First Friend Matching</h4>
                <p className="text-sm text-blue-700 mt-1">
                  We only access the minimum data needed for personality-based friend matching and never share your personal information.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onComplete}
            className="w-full"
            disabled={!canProceed}
          >
            {canProceed ? 'Start Finding Friends' : `Connect ${2 - connectedCount} more source${2 - connectedCount !== 1 ? 's' : ''}`}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};