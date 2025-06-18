import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Heart, Smile, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Match, ChatMessage } from '../../types';

interface ChatScreenProps {
  match: Match;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ match, onBack }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: match.user.id,
      message: "Hey! I saw we have a lot in common. Love your taste in music! 🎵",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'text',
    },
    {
      id: '2',
      userId: 'current-user',
      message: "Thanks! I noticed you're into hiking too. Have you explored any good trails lately?",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'text',
    },
    {
      id: '3',
      userId: match.user.id,
      message: "Actually yes! Just did a amazing hike last weekend. The views were incredible. What about you?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'text',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current-user',
        message: message.trim(),
        timestamp: new Date(),
        type: 'text',
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // Simulate response
      setTimeout(() => {
        const responses = [
          "That sounds amazing! I'd love to hear more about it.",
          "We should definitely plan a hike together sometime!",
          "Your stories are so interesting! Tell me more.",
          "I'm really enjoying our conversation 😊",
        ];
        
        const response: ChatMessage = {
          id: (Date.now() + 1).toString(),
          userId: match.user.id,
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: 'text',
        };

        setMessages(prev => [...prev, response]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3"
      >
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <img
              src={match.user.profileImage}
              alt={match.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">{match.user.name}</h3>
            <p className="text-xs text-green-600">Online now</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="p-2">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Match Notification */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-primary-100 px-4 py-3"
      >
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Heart className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-800">You matched!</span>
            <Heart className="w-4 h-4 text-primary-600" />
          </div>
          <p className="text-xs text-primary-700">
            {Math.round(match.similarityScore * 100)}% compatible • {match.matchReason}
          </p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.userId === 'current-user';
          const showAvatar = !isCurrentUser && (index === 0 || messages[index - 1].userId !== msg.userId);
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            >
              {!isCurrentUser && (
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar && (
                    <img
                      src={match.user.profileImage}
                      alt={match.user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isCurrentUser
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  isCurrentUser ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2">
            <Smile className="w-5 h-5" />
          </Button>
          
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={setMessage}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className="p-3 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};