import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Check,
  X,
  Calendar,
  User,
  Clock,
  Smile,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAuth } from "../../hooks/useAuth";
import {
  joinRequestService,
  JoinRequestChat,
  JoinRequestChatMessage,
} from "../../lib/joinRequestService";
import { DefaultProfileImage } from "../ui/DefaultProfileImage";

interface JoinRequestChatScreenProps {
  chat: JoinRequestChat;
  onBack: () => void;
  onProfileClick?: (userId: string) => void;
}

export const JoinRequestChatScreen: React.FC<JoinRequestChatScreenProps> = ({
  chat,
  onBack,
  onProfileClick,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<JoinRequestChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joinRequestStatus, setJoinRequestStatus] = useState<
    "pending" | "approved" | "denied"
  >("pending");
  const [processingAction, setProcessingAction] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHost = user?.id === chat.hostId;
  const isRequester = user?.id === chat.requesterId;
  const otherUser = isHost ? chat.requester : chat.host;

  useEffect(() => {
    loadMessages();
    loadJoinRequestStatus();
  }, [chat.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    try {
      const chatMessages = await joinRequestService.getChatMessages(chat.id);
      setMessages(chatMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequestStatus = async () => {
    try {
      const joinRequest = await joinRequestService.getJoinRequest(
        chat.joinRequestId
      );
      if (joinRequest) {
        setJoinRequestStatus(
          joinRequest.status as "pending" | "approved" | "denied"
        );
      }
    } catch (error) {
      console.error("Error loading join request status:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !user) return;

    setSending(true);
    try {
      const message = await joinRequestService.sendMessage(
        chat.id,
        user.id,
        newMessage.trim()
      );

      if (message) {
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleApprove = async () => {
    if (!user || !isHost || processingAction) return;

    setProcessingAction(true);
    try {
      const success = await joinRequestService.approveJoinRequest(
        chat.joinRequestId,
        user.id
      );
      if (success) {
        setJoinRequestStatus("approved");
        // Reload messages to show the approval message
        await loadMessages();
      }
    } catch (error) {
      console.error("Error approving join request:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleDeny = async () => {
    if (!user || !isHost || processingAction) return;

    setProcessingAction(true);
    try {
      const success = await joinRequestService.denyJoinRequest(
        chat.joinRequestId,
        user.id
      );
      if (success) {
        setJoinRequestStatus("denied");
        // Reload messages to show the denial message
        await loadMessages();
      }
    } catch (error) {
      console.error("Error denying join request:", error);
    } finally {
      setProcessingAction(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getMessageTypeColor = (messageType: string) => {
    switch (messageType) {
      case "approval":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejection":
        return "bg-red-100 text-red-800 border-red-200";
      case "join_request":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "system":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
            {otherUser.profileImage ? (
              <img
                src={otherUser.profileImage}
                alt={otherUser.name}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  console.log(
                    "Header profile image clicked for user:",
                    otherUser.id
                  );
                  if (onProfileClick) onProfileClick(otherUser.id);
                }}
              />
            ) : (
              <DefaultProfileImage
                name={otherUser.name}
                size="sm"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  if (onProfileClick) onProfileClick(otherUser.id);
                }}
              />
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {otherUser.name}
            </h3>
            <p className="text-xs text-gray-600">
              {isHost ? "Join Request" : "Activity Host"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {isHost ? "Host" : "Requester"}
          </span>
        </div>
      </motion.div>

      {/* Activity Context Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-3"
      >
        <div className="flex items-center justify-center space-x-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Join Request: {chat.activity.title}
          </span>
        </div>
      </motion.div>

      {/* Status Banner */}
      {joinRequestStatus !== "pending" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 border-b ${
            joinRequestStatus === "approved"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="text-center">
            <p className="text-sm font-medium">
              {joinRequestStatus === "approved"
                ? "✅ Join request approved!"
                : "❌ Join request was not approved"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === user?.id;
          const isSystemMessage = [
            "system",
            "approval",
            "rejection",
            "join_request",
          ].includes(msg.messageType);
          const showAvatar =
            !isCurrentUser &&
            !isSystemMessage &&
            (index === 0 || messages[index - 1].senderId !== msg.senderId);

          return (
            <div key={msg.id}>
              {isSystemMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm border ${getMessageTypeColor(
                      msg.messageType
                    )}`}
                  >
                    {msg.messageText}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  } items-end space-x-2`}
                >
                  {!isCurrentUser && (
                    <div className="w-8 h-8 flex-shrink-0">
                      {showAvatar && (
                        msg.sender.profileImage ? (
                          <img
                            src={msg.sender.profileImage}
                            alt={msg.sender.name}
                            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              console.log(
                                "Message profile image clicked for user:",
                                msg.sender.id
                              );
                              if (onProfileClick) onProfileClick(msg.sender.id);
                            }}
                          />
                        ) : (
                          <DefaultProfileImage
                            name={msg.sender.name}
                            size="sm"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              if (onProfileClick) onProfileClick(msg.sender.id);
                            }}
                          />
                        )
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isCurrentUser ? "order-1" : ""
                    }`}
                  >
                    {!isCurrentUser && showAvatar && (
                      <p className="text-xs text-gray-600 mb-1 ml-1">
                        {msg.sender.name}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm">{msg.messageText}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? "text-white/70" : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Host Action Buttons */}
      {isHost && joinRequestStatus === "pending" && (
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <div className="flex space-x-3 mb-3">
            <Button
              onClick={handleDeny}
              variant="outline"
              disabled={processingAction}
              className="flex-1 flex items-center justify-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
              <span>{processingAction ? "Processing..." : "Deny"}</span>
            </Button>

            <Button
              onClick={handleApprove}
              disabled={processingAction}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              <span>{processingAction ? "Processing..." : "Approve"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      {joinRequestStatus !== "denied" && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2">
              <Smile className="w-5 h-5" />
            </Button>

            <div className="flex-1">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={setNewMessage}
                disabled={sending}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="p-3 rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};