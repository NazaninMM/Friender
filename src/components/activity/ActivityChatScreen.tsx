import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Users, Smile } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Activity, User, ChatMessage } from "../../types";
import { DefaultProfileImage } from "../ui/DefaultProfileImage";

interface ActivityChatScreenProps {
  activity: Activity;
  user: User;
  onBack: () => void;
  onProfileClick?: (userId: string) => void;
}

export const ActivityChatScreen: React.FC<ActivityChatScreenProps> = ({
  activity,
  user,
  onBack,
  onProfileClick,
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      userId: "system",
      userName: "System",
      userImage: "",
      message: `Welcome to the ${activity.title} group chat! 🎉`,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "system",
    },
    {
      id: "2",
      userId: activity.createdBy.id,
      userName: activity.createdBy.name,
      userImage: activity.createdBy.profileImage,
      message:
        "Hey everyone! Looking forward to meeting you all at this activity. Feel free to ask any questions!",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: "text",
    },
    {
      id: "3",
      userId: activity.attendees[1]?.id || "other-user",
      userName: activity.attendees[1]?.name || "Maya",
      userImage: activity.attendees[1]?.profileImage || "",
      message: "This sounds amazing! Should we bring anything specific?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "text",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userImage: user.profileImage,
        message: message.trim(),
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // Simulate responses from other participants
      setTimeout(() => {
        const responses = [
          "That's a great idea!",
          "Count me in! 😊",
          "Looking forward to it!",
          "Thanks for organizing this!",
          "See you there!",
        ];

        const otherParticipants = activity.attendees.filter(
          (attendee) => attendee.id !== user.id
        );
        if (otherParticipants.length > 0) {
          const randomParticipant =
            otherParticipants[
              Math.floor(Math.random() * otherParticipants.length)
            ];
          const response: ChatMessage = {
            id: (Date.now() + 1).toString(),
            userId: randomParticipant.id,
            userName: randomParticipant.name,
            userImage: randomParticipant.profileImage,
            message: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            type: "text",
          };

          setMessages((prev) => [...prev, response]);
        }
      }, 1000 + Math.random() * 2000);
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
          <h3 className="font-semibold text-gray-900 text-sm">
            {activity.title}
          </h3>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Users className="w-3 h-3" />
            <span>{activity.attendees.length} participants</span>
          </div>
        </div>
      </motion.div>

      {/* Activity Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 px-4 py-3"
      >
        <div className="text-center">
          <p className="text-sm font-medium text-indigo-800">
            {activity.date.toLocaleDateString()} at {activity.time}
          </p>
          <p className="text-xs text-indigo-600">{activity.location}</p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.userId === user.id;
          const isSystem = msg.type === "system";
          const showAvatar =
            !isCurrentUser &&
            !isSystem &&
            (index === 0 || messages[index - 1].userId !== msg.userId);
          const showDate =
            index === 0 ||
            formatDate(msg.timestamp) !==
              formatDate(messages[index - 1].timestamp);

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
                            onClick={() => onProfileClick?.(msg.userId)}
                          />
                        ) : (
                          <DefaultProfileImage
                            name={msg.userName}
                            size="sm"
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onProfileClick?.(msg.userId)}
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
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-sm"
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