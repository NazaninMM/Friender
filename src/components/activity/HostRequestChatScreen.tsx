import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  X,
  User,
  Clock,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  Activity,
  User as UserType,
  ChatMessage,
  JoinRequest,
} from "../../types";
import { DefaultProfileImage } from "../ui/DefaultProfileImage";

interface HostRequestChatScreenProps {
  activity: Activity;
  user: UserType;
  joinRequest: JoinRequest;
  onBack: () => void;
  onApprove: (requestId: string) => void;
  onDeny: (requestId: string) => void;
  onProfileClick?: (userId: string) => void;
}

export const HostRequestChatScreen: React.FC<HostRequestChatScreenProps> = ({
  activity,
  user,
  joinRequest,
  onBack,
  onApprove,
  onDeny,
  onProfileClick,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "system",
      userName: "System",
      userImage: "",
      message: `${joinRequest.requesterName} wants to join "${activity.title}"`,
      timestamp: joinRequest.timestamp,
      type: "system",
    },
    {
      id: "2",
      userId: joinRequest.requesterId,
      userName: joinRequest.requesterName,
      userImage: joinRequest.requesterImage,
      message: joinRequest.message,
      timestamp: joinRequest.timestamp,
      type: "join_request",
      metadata: {
        requesterId: joinRequest.requesterId,
        requesterName: joinRequest.requesterName,
        activityId: activity.id,
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHost = activity.createdBy.id === user.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleApprove = () => {
    const approvalMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userImage: user.profileImage,
      message: `Welcome to the group! I've approved your request to join "${activity.title}". Looking forward to meeting you!`,
      timestamp: new Date(),
      type: "approval",
    };

    setMessages((prev) => [...prev, approvalMessage]);
    onApprove(joinRequest.id);
  };

  const handleDeny = () => {
    const denialMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userImage: user.profileImage,
      message: `Thanks for your interest in "${activity.title}". Unfortunately, I won't be able to approve your request at this time.`,
      timestamp: new Date(),
      type: "denial",
    };

    setMessages((prev) => [...prev, denialMessage]);
    onDeny(joinRequest.id);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Join Request</h3>
          <p className="text-xs text-gray-600">{activity.title}</p>
        </div>

        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {joinRequest.requesterName}
          </span>
        </div>
      </motion.div>

      {/* Activity Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-4 py-3"
      >
        <div className="text-center">
          <p className="text-sm font-medium text-blue-800">
            {activity.date.toLocaleDateString()} at {activity.time}
          </p>
          <p className="text-xs text-blue-600">{activity.location}</p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.userId === user.id;
          const isSystem = msg.type === "system";
          const isJoinRequest = msg.type === "join_request";

          return (
            <div key={msg.id}>
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
                    msg.userImage ? (
                      <img
                        src={msg.userImage}
                        alt={msg.userName}
                        className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onProfileClick?.(msg.userId)}
                      />
                    ) : (
                      <DefaultProfileImage
                        name={msg.userName}
                        size="sm"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    )
                  )}

                  <div
                    className={`max-w-xs lg:max-w-md ${
                      isCurrentUser ? "order-1" : ""
                    }`}
                  >
                    {!isCurrentUser && (
                      <p className="text-xs text-gray-600 mb-1 ml-1">
                        {msg.userName}
                      </p>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-sm"
                          : isJoinRequest
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 rounded-bl-sm"
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

      {/* Action Buttons for Host */}
      {/* Removed approve/deny buttons for new chats as requested */}

      {/* Status Message */}
      {joinRequest.status !== "pending" && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <div className="text-center">
            <p
              className={`text-sm font-medium ${
                joinRequest.status === "approved"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Request{" "}
              {joinRequest.status === "approved" ? "Approved" : "Declined"}
            </p>
            {joinRequest.status === "approved" && (
              <p className="text-xs text-gray-600 mt-1">
                Participant can now join the group chat
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};