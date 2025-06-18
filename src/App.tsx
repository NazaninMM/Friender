import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './components/auth/LandingPage';
import { SignupFormScreen } from './components/auth/SignupFormScreen';
import { LocationPermissionScreen } from './components/auth/LocationPermissionScreen';
import { SocialIntegrationScreen } from './components/auth/SocialIntegrationScreen';
import { LoadingScreen } from './components/common/LoadingScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { ChatsList } from './components/chat/ChatsList';
import { ActivitiesList } from './components/activities/ActivitiesList';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { ActivityChatScreen } from './components/activity/ActivityChatScreen';
import { ActivityDetailScreen } from './components/activity/ActivityDetailScreen';
import { HostRequestChatScreen } from './components/activity/HostRequestChatScreen';
import { DirectChatScreen } from './components/chat/DirectChatScreen';
import { CreateActivityModal } from './components/activity/CreateActivityModal';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { Activity, CreateActivityData, User, SignupFormData, JoinRequest, DirectMessageChat, ChatMessage } from './types';
import { mockActivities } from './data/mockData';

type AppScreen = 'landing' | 'signup-form' | 'location-permission' | 'social-integration' | 'loading' | 'main' | 'direct-chat' | 'settings' | 'activity-detail';
type MainTab = 'home' | 'chats' | 'activities' | 'profile';

function App() {
  const { user, loading, login, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedJoinRequest, setSelectedJoinRequest] = useState<JoinRequest | null>(null);
  const [selectedDirectChat, setSelectedDirectChat] = useState<DirectMessageChat | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showHostRequest, setShowHostRequest] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [directChats, setDirectChats] = useState<DirectMessageChat[]>([]);
  
  // Store signup data as user progresses through the flow
  const [signupData, setSignupData] = useState<Partial<SignupFormData & { connectedServices: string[] }>>({});

  const handleSignUp = () => {
    setCurrentScreen('signup-form');
  };

  const handleSignupFormComplete = (formData: SignupFormData) => {
    setSignupData(prev => ({ ...prev, ...formData }));
    setCurrentScreen('location-permission');
  };

  const handleLocationAllow = () => {
    setCurrentScreen('social-integration');
  };

  const handleLocationSkip = () => {
    setCurrentScreen('social-integration');
  };

  const handleLocationBack = () => {
    setCurrentScreen('signup-form');
  };

  const handleSignupFormBack = () => {
    setCurrentScreen('landing');
  };

  const handleLogin = () => {
    // For demo purposes, create a mock user
    const mockUser: User = {
      id: 'current-user',
      firstName: 'Alex',
      lastName: 'Johnson',
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      age: 26,
      profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Love exploring new places and meeting interesting people!',
      location: 'San Francisco, CA',
      interests: ['Coffee', 'Hiking', 'Photography', 'Food', 'Music'],
      personalityTraits: ['Outgoing', 'Adventurous', 'Creative'],
      joinedActivities: [],
      createdActivities: [],
      connectedServices: [],
    };
    login(mockUser);
    setCurrentScreen('main');
  };

  const handleSocialIntegrationComplete = (connectedServices: string[]) => {
    // Store connected services and move to loading screen
    setSignupData(prev => ({ ...prev, connectedServices }));
    setCurrentScreen('loading');
  };

  const handleLoadingComplete = () => {
    // Create user with all collected data
    const newUser: User = {
      id: 'current-user',
      firstName: signupData.firstName || 'User',
      lastName: signupData.lastName || '',
      name: `${signupData.firstName || 'User'} ${signupData.lastName || ''}`.trim(),
      email: signupData.email || '',
      age: signupData.age || 18,
      profileImage: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'New to Friender! Excited to meet amazing people through shared activities.',
      location: 'San Francisco, CA', // This would come from location permission in a real app
      interests: ['Social', 'Adventure', 'Food'], // These would be derived from connected services
      personalityTraits: ['Friendly', 'Open-minded'], // These would be derived from AI analysis
      joinedActivities: [],
      createdActivities: [],
      connectedServices: signupData.connectedServices || [],
    };
    
    login(newUser);
    setCurrentScreen('main');
    
    // Clear signup data
    setSignupData({});
  };

  const handleSocialIntegrationSkip = () => {
    handleSocialIntegrationComplete([]);
  };

  const handleSocialIntegrationBack = () => {
    setCurrentScreen('location-permission');
  };

  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackFromSettings = () => {
    setCurrentScreen('main');
    setCurrentTab('profile');
  };

  const handleLogout = () => {
    logout();
    setCurrentScreen('landing');
    setCurrentTab('home');
  };

  const createOrOpenDirectChat = (otherUser: User, activityContext?: { activityId: string; activityTitle: string; isJoinRequest?: boolean; joinRequestId?: string }) => {
    if (!user) return;

    // Check if a direct chat already exists with this user for this activity context
    const existingChat = directChats.find(chat => 
      chat.participants.some(p => p.id === otherUser.id) &&
      chat.activityContext?.activityId === activityContext?.activityId
    );

    if (existingChat) {
      // Open existing chat
      setSelectedDirectChat(existingChat);
      setCurrentScreen('direct-chat');
      return;
    }

    // Create new direct chat
    const newDirectChat: DirectMessageChat = {
      id: `direct-${Date.now()}`,
      participants: [user, otherUser],
      messages: [
        {
          id: 'welcome-1',
          userId: 'system',
          userName: 'System',
          userImage: '',
          message: activityContext?.isJoinRequest 
            ? `Join request sent for "${activityContext.activityTitle}". The host will review your request.`
            : `You're now connected with ${otherUser.name}!`,
          timestamp: new Date(),
          type: 'system',
        }
      ],
      lastMessageTime: new Date(),
      activityContext: activityContext ? {
        ...activityContext,
        linkedJoinRequestId: activityContext.joinRequestId,
      } : undefined,
    };

    // Add initial message if there's activity context
    if (activityContext?.isJoinRequest) {
      newDirectChat.messages.push({
        id: 'join-request-message',
        userId: user.id,
        userName: user.name,
        userImage: user.profileImage,
        message: `Hi ${otherUser.name}! I'd love to join "${activityContext.activityTitle}". This looks like a great activity and I think I'd be a good fit for the group. Looking forward to hearing from you!`,
        timestamp: new Date(),
        type: 'text',
      });
      newDirectChat.lastMessage = newDirectChat.messages[newDirectChat.messages.length - 1];
      newDirectChat.lastMessageTime = new Date();
    } else if (activityContext) {
      newDirectChat.messages.push({
        id: 'initial-message',
        userId: user.id,
        userName: user.name,
        userImage: user.profileImage,
        message: `Hi ${otherUser.name}! I just joined "${activityContext.activityTitle}" and would love to connect. Looking forward to the activity!`,
        timestamp: new Date(),
        type: 'text',
      });
      newDirectChat.lastMessage = newDirectChat.messages[newDirectChat.messages.length - 1];
      newDirectChat.lastMessageTime = new Date();
    }

    setDirectChats(prev => [newDirectChat, ...prev]);
    setSelectedDirectChat(newDirectChat);
    setCurrentScreen('direct-chat');
  };

  const handleJoinActivity = (activityId: string) => {
    if (!user) return;

    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;

    // Create a join request
    const joinRequest: JoinRequest = {
      id: Date.now().toString(),
      activityId: activityId,
      requesterId: user.id,
      requesterName: user.name,
      requesterImage: user.profileImage,
      message: `Hi! I'd love to join "${activity.title}". This looks like a great activity and I think I'd be a good fit for the group. Looking forward to hearing from you!`,
      timestamp: new Date(),
      status: 'pending',
    };

    setJoinRequests(prev => [...prev, joinRequest]);

    // Add user to pending list
    setActivities(prev => prev.map(a => {
      if (a.id === activityId) {
        return {
          ...a,
          pendingUsers: [...(a.pendingUsers || []), user],
          isPending: true,
        };
      }
      return a;
    }));

    // Create or open direct chat with the activity host
    createOrOpenDirectChat(activity.createdBy, {
      activityId: activity.id,
      activityTitle: activity.title,
      isJoinRequest: true,
      joinRequestId: joinRequest.id,
    });
  };

  const handleApproveRequest = (requestId: string) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request || !user) return;

    // Update request status
    setJoinRequests(prev => 
      prev.map(r => 
        r.id === requestId 
          ? { ...r, status: 'approved' }
          : r
      )
    );

    // Move user from pending to approved attendees
    setActivities(prev => prev.map(activity => {
      if (activity.id === request.activityId) {
        const requester = activity.pendingUsers?.find(u => u.id === request.requesterId);
        if (requester) {
          return {
            ...activity,
            attendees: [...activity.attendees, requester],
            currentAttendees: activity.currentAttendees + 1,
            pendingUsers: (activity.pendingUsers || []).filter(u => u.id !== request.requesterId),
            isApproved: true,
            isPending: false,
          };
        }
      }
      return activity;
    }));

    // Update corresponding direct chat status
    setDirectChats(prev => prev.map(chat => {
      if (chat.activityContext?.linkedJoinRequestId === requestId) {
        return {
          ...chat,
          activityContext: {
            ...chat.activityContext,
            joinRequestStatus: 'approved',
          },
        };
      }
      return chat;
    }));

    // Close host request chat
    setShowHostRequest(false);
    setSelectedJoinRequest(null);
  };

  const handleDenyRequest = (requestId: string) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status
    setJoinRequests(prev => 
      prev.map(r => 
        r.id === requestId 
          ? { ...r, status: 'denied' }
          : r
      )
    );

    // Remove user from pending list
    setActivities(prev => prev.map(activity => {
      if (activity.id === request.activityId) {
        return {
          ...activity,
          pendingUsers: (activity.pendingUsers || []).filter(u => u.id !== request.requesterId),
          isPending: false,
        };
      }
      return activity;
    }));

    // Update corresponding direct chat status
    setDirectChats(prev => prev.map(chat => {
      if (chat.activityContext?.linkedJoinRequestId === requestId) {
        return {
          ...chat,
          activityContext: {
            ...chat.activityContext,
            joinRequestStatus: 'denied',
          },
        };
      }
      return chat;
    }));

    // Close host request chat after a delay
    setTimeout(() => {
      setShowHostRequest(false);
      setSelectedJoinRequest(null);
    }, 2000);
  };

  const handleCreateActivity = (activityData: CreateActivityData) => {
    if (!user) return;

    const newActivity: Activity = {
      id: Date.now().toString(),
      ...activityData,
      currentAttendees: 1,
      createdBy: user,
      attendees: [user],
      pendingUsers: [],
      tags: activityData.tags,
    };

    setActivities(prev => [newActivity, ...prev]);
  };

  const handleOpenActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentScreen('activity-detail');
  };

  const handleOpenActivityChat = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowChat(true);
  };

  const handleOpenHostRequest = (activity: Activity, request: JoinRequest) => {
    setSelectedActivity(activity);
    setSelectedJoinRequest(request);
    setShowHostRequest(true);
  };

  const handleOpenDirectChat = (directChat: DirectMessageChat) => {
    setSelectedDirectChat(directChat);
    setCurrentScreen('direct-chat');
  };

  const handleSendDirectMessage = (chatId: string, messageText: string) => {
    if (!user) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userImage: user.profileImage,
      message: messageText,
      timestamp: new Date(),
      type: 'text',
    };

    setDirectChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        const updatedMessages = [...chat.messages, newMessage];
        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: newMessage,
          lastMessageTime: new Date(),
        };
      }
      return chat;
    }));

    // Simulate response from other user
    setTimeout(() => {
      const chat = directChats.find(c => c.id === chatId);
      if (!chat) return;

      const otherParticipant = chat.participants.find(p => p.id !== user.id);
      if (!otherParticipant) return;

      const responses = [
        "That sounds great!",
        "I'm really looking forward to this!",
        "Thanks for reaching out!",
        "This is going to be so much fun!",
        "Can't wait to meet you!",
        "I'm excited about this activity too!",
      ];

      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: otherParticipant.id,
        userName: otherParticipant.name,
        userImage: otherParticipant.profileImage,
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        type: 'text',
      };

      setDirectChats(prev => prev.map(c => {
        if (c.id === chatId) {
          const updatedMessages = [...c.messages, responseMessage];
          return {
            ...c,
            messages: updatedMessages,
            lastMessage: responseMessage,
            lastMessageTime: new Date(),
          };
        }
        return c;
      }));
    }, 1000 + Math.random() * 2000);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedActivity(null);
  };

  const handleCloseHostRequest = () => {
    setShowHostRequest(false);
    setSelectedActivity(null);
    setSelectedJoinRequest(null);
  };

  const handleBackFromDirectChat = () => {
    setCurrentScreen('main');
    setSelectedDirectChat(null);
    setCurrentTab('chats');
  };

  const handleBackFromActivityDetail = () => {
    setCurrentScreen('main');
    setSelectedActivity(null);
  };

  const handleLeaveActivity = (activityId: string) => {
    if (!user) return;

    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          attendees: activity.attendees.filter(attendee => attendee.id !== user.id),
          currentAttendees: activity.currentAttendees - 1,
          isJoined: false,
        };
      }
      return activity;
    }));

    // Go back to main screen
    setCurrentScreen('main');
    setSelectedActivity(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
        />
      </div>
    );
  }

  if (currentScreen === 'landing') {
    return (
      <LandingPage 
        onSignUp={handleSignUp}
        onLogin={handleLogin}
      />
    );
  }

  if (currentScreen === 'signup-form') {
    return (
      <SignupFormScreen 
        onComplete={handleSignupFormComplete}
        onBack={handleSignupFormBack}
      />
    );
  }

  if (currentScreen === 'location-permission') {
    return (
      <LocationPermissionScreen 
        onAllow={handleLocationAllow}
        onSkip={handleLocationSkip}
        onBack={handleLocationBack}
      />
    );
  }

  if (currentScreen === 'social-integration') {
    return (
      <SocialIntegrationScreen 
        onComplete={handleSocialIntegrationComplete}
        onBack={handleSocialIntegrationBack}
      />
    );
  }

  if (currentScreen === 'loading') {
    return (
      <LoadingScreen 
        onComplete={handleLoadingComplete}
      />
    );
  }

  if (currentScreen === 'settings') {
    return (
      <SettingsScreen 
        onLogout={handleLogout}
        onBack={handleBackFromSettings}
      />
    );
  }

  if (currentScreen === 'activity-detail' && selectedActivity) {
    return (
      <ActivityDetailScreen 
        activity={selectedActivity}
        user={user!}
        onJoin={() => handleJoinActivity(selectedActivity.id)}
        onLeave={() => handleLeaveActivity(selectedActivity.id)}
        onOpenChat={() => handleOpenActivityChat(selectedActivity)}
        onBack={handleBackFromActivityDetail}
      />
    );
  }

  if (currentScreen === 'direct-chat' && selectedDirectChat) {
    return (
      <DirectChatScreen 
        directChat={selectedDirectChat}
        user={user!}
        onBack={handleBackFromDirectChat}
        onSendMessage={handleSendDirectMessage}
        onApproveRequest={handleApproveRequest}
        onDenyRequest={handleDenyRequest}
      />
    );
  }

  if (showHostRequest && selectedActivity && selectedJoinRequest) {
    return (
      <HostRequestChatScreen 
        activity={selectedActivity}
        user={user!}
        joinRequest={selectedJoinRequest}
        onBack={handleCloseHostRequest}
        onApprove={handleApproveRequest}
        onDeny={handleDenyRequest}
      />
    );
  }

  if (showChat && selectedActivity) {
    return (
      <ActivityChatScreen 
        activity={selectedActivity}
        user={user!}
        onBack={handleCloseChat}
      />
    );
  }

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen 
            activities={activities}
            user={user!}
            onJoinActivity={handleJoinActivity}
            onCreateActivity={() => setShowCreateModal(true)}
            onOpenActivity={handleOpenActivity}
          />
        );
      case 'chats':
        return (
          <ChatsList 
            activities={activities}
            user={user!}
            joinRequests={joinRequests}
            directChats={directChats}
            onOpenChat={handleOpenActivityChat}
            onOpenHostRequest={handleOpenHostRequest}
            onOpenDirectChat={handleOpenDirectChat}
          />
        );
      case 'activities':
        return (
          <ActivitiesList 
            activities={activities}
            user={user!}
            onOpenActivity={handleOpenActivity}
          />
        );
      case 'profile':
        return (
          <ProfileScreen 
            user={user!}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderCurrentTab()}
        </motion.div>
      </AnimatePresence>
      
      <BottomNavigation 
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      <CreateActivityModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateActivity={handleCreateActivity}
      />
    </div>
  );
}

export default App;