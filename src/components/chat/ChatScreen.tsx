import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Heart, Smile, MoreVertical } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { User, ChatMessage } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { chatService } from "../../lib/chat";
import { DefaultProfileImage } from "../ui/DefaultProfileImage";

interface ChatScreenProps {
  otherUser: User;
  onBack: () => void;
  onProfileClick?: (userId: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  otherUser,
  onBack,
  onProfileClick,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat and load messages
  useEffect(() => {
    if (user && otherUser) {
      const initializeChat = async () => {
        try {
          setLoading(true);
          setError(null);

          // Get or create chat
          const newChatId = await chatService.getOrCreateChat(otherUser.id);
          setChatId(newChatId);

          // Load existing messages
          const chatMessages = await chatService.getChatMessages(newChatId);
          setMessages(chatMessages);
        } catch (err) {
          console.error("Error initializing chat:", err);
          setError("Failed to load chat");
        } finally {
          setLoading(false);
        }
      };

      initializeChat();
    }
  }, [user, otherUser]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = chatService.subscribeToMessages(
      chatId,
      (newMessage) => {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    );

    return unsubscribe;
  }, [chatId]);

  const handleSend = async () => {
    if (!message.trim() || sending || !user || !chatId) return;

    try {
      setSending(true);
      setError(null);

      // Send message through database
      const newMessage = await chatService.sendMessage(chatId, message.trim());

      // Add to local state (will also be added via real-time subscription)
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getOtherParticipant = () => {
    return otherUser;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 px-4 py-3 flex items-center space-x-3"
      >
        <Button onClick={onBack} variant="ghost" size="sm" className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            {getOtherParticipant().profileImage ? (
              <img
                src={getOtherParticipant().profileImage}
                alt={getOtherParticipant().name}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onProfileClick?.(getOtherParticipant().id)}
              />
            ) : (
              <DefaultProfileImage
                name={getOtherParticipant().name}
                size="sm"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onProfileClick?.(getOtherParticipant().id)}
              />
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {getOtherParticipant().name}
            </h3>
            <p className="text-xs text-green-600">Online now</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="p-2">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-b border-red-200 px-4 py-2"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              Start a conversation with {getOtherParticipant().name}!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUser = msg.userId === user?.id;
            const showAvatar =
              !isCurrentUser &&
              (index === 0 || messages[index - 1].userId !== msg.userId);

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                } items-end space-x-2`}
              >
                {!isCurrentUser && (
                  <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar && (
                      getOtherParticipant().profileImage ? (
                        <img
                          src={getOtherParticipant().profileImage}
                          alt={getOtherParticipant().name}
                          className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            onProfileClick?.(getOtherParticipant().id)
                          }
                        />
                      ) : (
                        <DefaultProfileImage
                          name={getOtherParticipant().name}
                          size="sm"
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            onProfileClick?.(getOtherParticipant().id)
                          }
                        />
                      )
                    )}
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isCurrentUser
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
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
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={sending}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || sending || !chatId}
            className="p-3 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};