import { ChatMessage } from '../types';

// Simple local storage for chat messages
class ChatStorage {
  private storageKey = 'friender_chat_messages';

  // Get all stored messages
  getAllMessages(): Record<string, ChatMessage[]> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error reading chat messages from storage:', error);
      return {};
    }
  }

  // Get messages for a specific chat (identified by participant IDs)
  getChatMessages(userId1: string, userId2: string): ChatMessage[] {
    const chatId = this.getChatId(userId1, userId2);
    const allMessages = this.getAllMessages();
    return allMessages[chatId] || [];
  }

  // Save messages for a specific chat
  saveChatMessages(userId1: string, userId2: string, messages: ChatMessage[]): void {
    try {
      const chatId = this.getChatId(userId1, userId2);
      const allMessages = this.getAllMessages();
      allMessages[chatId] = messages;
      localStorage.setItem(this.storageKey, JSON.stringify(allMessages));
    } catch (error) {
      console.error('Error saving chat messages to storage:', error);
    }
  }

  // Add a new message to a chat
  addMessage(userId1: string, userId2: string, message: ChatMessage): void {
    const messages = this.getChatMessages(userId1, userId2);
    messages.push(message);
    this.saveChatMessages(userId1, userId2, messages);
  }

  // Get chat ID (consistent regardless of order of user IDs)
  private getChatId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  // Clear all stored messages (for testing)
  clearAll(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error clearing chat messages:', error);
    }
  }
}

export const chatStorage = new ChatStorage(); 