import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Smile,
  MoreVertical,
  Calendar,
  Check,
  X,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { DirectMessageChat, User, ChatMessage } from "../../types";
import { DefaultProfileImage } from "../ui/DefaultProfileImage";

interface DirectChatScreenProps {
  directChat: DirectMessageChat;
  user: User;
  onBack: () => void;
  onSendMessage: (chatId: string, messageText: string) => void;
  onApproveRequest?: (requestId: string) => void;
  onDenyRequest?: (requestId: string) => void;
  onProfileClick?: (userId: string) => void;
}

export const DirectChatScreen: React.FC<DirectChatScreenProps> = ({
  directChat,
  user,
  onBack,
  onSendMessage,
  onApproveRequest,
  onDenyRequest,
  onProfileClick,
}) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the other participant (not the current user)
  const otherParticipant =
    directChat.participants.find((p) => p.id !== user.id) ||
    directChat.participants[0];

  // Check if this is a join request and if current user is the host
  const isJoinRequest = directChat.activityContext?.isJoinRequest;
  const joinRequestStatus =
    directChat.activityContext?.joinRequestStatus || "pending";
  const linkedJoinRequestId = directChat.activityContext?.linkedJoinRequestId;

  // Determine if current user is the host (they would receive the join request)
  const isHost =
    isJoinRequest && directChat.activityContext?.requesterId !== user.id;
  const isRequester =
    isJoinRequest && directChat.activityContext?.requesterId === user.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [directChat.messages]);

  const handleSend = () => {
    if (message.trim() && joinRequestStatus !== "denied") {
      onSendMessage(directChat.id, message.trim());
      setMessage("");
    }
  };

  const handleApprove = () => {
    if (linkedJoinRequestId && onApproveRequest) {
      onApproveRequest(linkedJoinRequestId);
    }
  };

  const handleDeny = () => {
    if (linkedJoinRequestId && onDenyRequest) {
      onDenyRequest(linkedJoinRequestId);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    return date.toLocaleDateString();
  };

  const getStatusMessage = () => {
    if (!isJoinRequest) return null;

    switch (joinRequestStatus) {
      case "approved":
        return {
          text: isRequester
            ? "Your join request has been approved! 🎉"
            : "You approved this join request",
          color: "bg-green-50 text-green-800 border-green-200",
        };
      case "denied":
        return {
          text: isRequester
            ? "Your join request was not approved"
            : "You declined this join request",
          color: "bg-red-50 text-red-800 border-red-200",
        };
      case "pending":
        return {
          text: isRequester
            ? "Your join request is pending review"
            : "New join request - please review",
          color: "bg-orange-50 text-orange-800 border-orange-200",
        };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

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
            {otherParticipant.profileImage ? (
              <img
                src={otherParticipant.profileImage}
                alt={otherParticipant.name}
                className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  onProfileClick && onProfileClick(otherParticipant.id)
                }
              />
            ) : (
              <DefaultProfileImage
                name={otherParticipant.name}
                size="sm"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  onProfileClick && onProfileClick(otherParticipant.id)
                }
              />
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {otherParticipant.name}
            </h3>
            <p className="text-xs text-green-600">Online now</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="p-2">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Activity Context Banner */}
      {directChat.activityContext && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-3"
        >
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              About: {directChat.activityContext.activityTitle}
            </span>
          </div>
        </motion.div>
      )}

      {/* Status Banner for Join Requests */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 border-b ${statusMessage.color}`}
        >
          <div className="text-center">
            <p className="text-sm font-medium">{statusMessage.text}</p>
            {isHost && joinRequestStatus === "pending" && (
              <p className="text-xs mt-1">
                The host has full discretion to accept or deny requests. They
                can make this decision at any time during or after conversation.
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {directChat.messages.map((msg, index) => {
          const isCurrentUser = msg.userId === user.id;
          const isSystem = msg.type === "system";
          const showAvatar =
            !isCurrentUser &&
            !isSystem &&
            (index === 0 ||
              directChat.messages[index - 1].userId !== msg.userId);
          const showDate =
            index === 0 ||
            formatDate(msg.timestamp) !==
              formatDate(directChat.messages[index - 1].timestamp);

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="text-center my-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formatDate(msg.timestamp)}
                  </span>
                </div>
              )}

              {isSystem ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <span className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
                    {msg.message}
                  </span>
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
                        msg.userImage ? (
                          <img
                            src={msg.userImage}
                            alt={msg.userName}
                            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              onProfileClick &&
                              onProfileClick(otherParticipant.id)
                            }
                          />
                        ) : (
                          <DefaultProfileImage
                            name={msg.userName}
                            size="sm"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              onProfileClick &&
                              onProfileClick(otherParticipant.id)
                            }
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
                        {msg.userName}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-sm"
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
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Buttons for Host (Join Request Review) */}
      {isHost &&
        isJoinRequest &&
        joinRequestStatus === "pending" &&
        onApproveRequest &&
        onDenyRequest && (
          <div className="bg-white border-t border-gray-200 px-4 py-4">
            <div className="flex space-x-3 mb-3">
              <Button
                onClick={handleDeny}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
                <span>Deny</span>
              </Button>

              <Button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                <span>Accept</span>
              </Button>
            </div>
          </div>
        )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2">
            <Smile className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <Input
              placeholder={
                joinRequestStatus === "denied"
                  ? "Request was denied"
                  : "Type a message..."
              }
              value={message}
              onChange={setMessage}
              disabled={joinRequestStatus === "denied"}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim() || joinRequestStatus === "denied"}
            className="p-3 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};