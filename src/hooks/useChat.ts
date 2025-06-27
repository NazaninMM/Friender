import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../lib/chat';
import { ChatMessage, DirectMessageChat } from '../types';
import { useAuth } from './useAuth';

export const useChat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<DirectMessageChat[]>([]);
  const [currentChat, setCurrentChat] = useState<DirectMessageChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const userChats = await chatService.getUserChats();
      setChats(userChats);
    } catch (err) {
      console.error('Error loading chats:', err);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load messages for a specific chat
  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);
      const chatMessages = await chatService.getChatMessages(chatId);
      setMessages(chatMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(async (message: string, messageType: string = 'text', metadata?: any) => {
    if (!currentChat) return;
    
    try {
      setError(null);
      const newMessage = await chatService.sendMessage(currentChat.id, message, messageType, metadata);
      setMessages(prev => [...prev, newMessage]);
      
      // Update the chat's last message in the chats list
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChat.id) {
          return {
            ...chat,
            lastMessage: newMessage,
            lastMessageTime: newMessage.timestamp,
          };
        }
        return chat;
      }));
      
      return newMessage;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      throw err;
    }
  }, [currentChat]);

  // Get or create a chat with another user
  const getOrCreateChat = useCallback(async (otherUserId: string) => {
    if (!user) return null;
    
    try {
      setError(null);
      const chatId = await chatService.getOrCreateChat(otherUserId);
      
      // Check if we already have this chat loaded
      const existingChat = chats.find(chat => 
        chat.participants.some(p => p.id === otherUserId)
      );
      
      if (existingChat) {
        setCurrentChat(existingChat);
        await loadMessages(existingChat.id);
        return existingChat;
      } else {
        // Reload chats to get the new one
        await loadChats();
        return null;
      }
    } catch (err) {
      console.error('Error getting or creating chat:', err);
      setError('Failed to create chat');
      throw err;
    }
  }, [user, chats, loadChats, loadMessages]);

  // Set current chat
  const setChat = useCallback(async (chat: DirectMessageChat) => {
    setCurrentChat(chat);
    await loadMessages(chat.id);
  }, [loadMessages]);

  // Subscribe to real-time messages for current chat
  useEffect(() => {
    if (!currentChat) return;

    const unsubscribe = chatService.subscribeToMessages(currentChat.id, (newMessage) => {
      setMessages(prev => {
        // Avoid duplicate messages
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
      
      // Update the chat's last message in the chats list
      setChats(prev => prev.map(chat => {
        if (chat.id === currentChat.id) {
          return {
            ...chat,
            lastMessage: newMessage,
            lastMessageTime: newMessage.timestamp,
          };
        }
        return chat;
      }));
    });

    return unsubscribe;
  }, [currentChat]);

  // Subscribe to chat updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.subscribeToChatUpdates((updatedChat) => {
      setChats(prev => {
        const index = prev.findIndex(chat => chat.id === updatedChat.id);
        if (index >= 0) {
          const newChats = [...prev];
          newChats[index] = updatedChat;
          return newChats;
        } else {
          return [updatedChat, ...prev];
        }
      });

      // Update current chat if it's the one that was updated
      if (currentChat && currentChat.id === updatedChat.id) {
        setCurrentChat(updatedChat);
      }
    });

    return unsubscribe;
  }, [user, currentChat]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    sendMessage,
    getOrCreateChat,
    setChat,
    loadChats,
    clearError: () => setError(null),
  };
}; 