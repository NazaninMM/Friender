import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { LandingPage } from './components/auth/LandingPage';
import { AuthScreen } from './components/auth/AuthScreen';
import { SocialIntegrationScreen } from './components/auth/SocialIntegrationScreen';
import { LocationPermissionScreen } from './components/auth/LocationPermissionScreen';
import { LoadingScreen } from './components/common/LoadingScreen';
import { HomeScreen } from './components/home/HomeScreen';
import { ChatsScreen } from './components/chat/ChatsScreen';
import { ChatScreen } from './components/chat/ChatScreen';
import { ActivitiesList } from './components/activities/ActivitiesList';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { ActivityChatScreen } from './components/activity/ActivityChatScreen';
import { ActivityDetailScreen } from './components/activity/ActivityDetailScreen';
import { HostRequestChatScreen } from './components/activity/HostRequestChatScreen';
import { DirectChatScreen } from './components/chat/DirectChatScreen';
import { CreateActivityModal } from './components/activity/CreateActivityModal';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { Activity, CreateActivityData, User, JoinRequest, DirectMessageChat, ChatMessage } from './types';
import { activityService } from './lib/database';

type AppFlowState = 'landing' | 'auth' | 'socialIntegration' | 'locationPermission' | 'loadingPersonality' | 'mainApp';
type AppScreen = 'main' | 'direct-chat' | 'settings' | 'activity-detail' | 'chat';
type MainTab = 'home' | 'chats' | 'activities' | 'profile';

function App() {
  console.log('App: Rendering App component');
  
  const { user, loading, signOut } = useAuth();
  
  // App flow state management
  const [appFlowState, setAppFlowState] = useState<AppFlowState>('landing');
  
  // Main app state management
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedJoinRequest, setSelectedJoinRequest] = useState<JoinRequest | null>(null);
  const [selectedDirectChat, setSelectedDirectChat] = useState<DirectMessageChat | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showHostRequest, setShowHostRequest] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [directChats, setDirectChats] = useState<DirectMessageChat[]>([]);

  // Add state to track onboarding mode
  const [onboardingMode, setOnboardingMode] = useState<'signup' | 'signin' | null>(null);

  console.log('App: Current state - loading:', loading, 'user:', user ? 'Present' : 'None', 'appFlowState:', appFlowState);

  // Handle authentication state changes
  useEffect(() => {
    console.log('🔄 App: useEffect triggered');
    console.log('📊 App: Current state - loading:', loading, 'user:', user ? 'Present' : 'None', 'appFlowState:', appFlowState);
    console.log('👤 App: User details:', user ? {
      id: user.id,
      email: user.email,
      name: user.name,
      connectedServices: user.connectedServices
    } : 'No user');
    
    if (!loading) {
      console.log('✅ App: Not loading, processing state...');
      if (user) {
        // Require at least 2 connected services to complete onboarding
        const hasCompletedOnboarding = user.connectedServices && user.connectedServices.length >= 2;
        console.log('👤 App: User found');
        console.log('🔗 App: connectedServices:', user.connectedServices);
        console.log('✅ App: hasCompletedOnboarding:', hasCompletedOnboarding);
        if (hasCompletedOnboarding) {
          // User has completed onboarding, go to main app
          console.log('🏠 App: Setting appFlowState to mainApp');
          setAppFlowState('mainApp');
        } else {
          // User hasn't connected enough services, go to social integration
          console.log('🔗 App: Setting appFlowState to socialIntegration');
          setAppFlowState('socialIntegration');
        }
      } else {
        // No user, start from landing page
        console.log('🏠 App: No user, setting appFlowState to landing');
        setAppFlowState('landing');
      }
    } else {
      console.log('⏳ App: Still loading, not changing appFlowState');
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchActivities() {
      const activities = await activityService.getAllActivities();
      setActivities(activities);
    }
    fetchActivities();
  }, []);

  // Onboarding flow handlers
  const handleSignUpFromLanding = () => {
    console.log('App: handleSignUpFromLanding - setting appFlowState to auth');
    setAppFlowState('auth');
  };

  const handleLoginFromLanding = () => {
    console.log('App: handleLoginFromLanding - setting appFlowState to auth');
    setAppFlowState('auth');
  };

  const handleAuthSuccess = (mode?: 'signup' | 'signin') => {
    // Set onboarding mode
    setOnboardingMode(mode || null);
    // The useEffect below will handle the transition based on user.connectedServices
    console.log('App: handleAuthSuccess called - user will be redirected based on onboarding status');
    // Fallback: If we have a user but are still in auth state, force transition
    if (user && appFlowState === 'auth') {
      console.log('App: Fallback - forcing transition from auth state');
      const hasCompletedOnboarding = user.connectedServices && user.connectedServices.length >= 2;
      if (hasCompletedOnboarding) {
        setAppFlowState('mainApp');
      } else {
        // Only show socialIntegration if just signed up
        if (onboardingMode === 'signup') {
          setAppFlowState('socialIntegration');
        } else {
          setAppFlowState('locationPermission');
        }
      }
    }
  };

  const handleSocialIntegrationComplete = (connectedServices: string[]) => {
    console.log('Social integration completed with services:', connectedServices);
    setAppFlowState('locationPermission');
  };

  const handleLocationPermissionComplete = () => {
    setAppFlowState('loadingPersonality');
  };

  const handleLocationPermissionSkip = () => {
    setAppFlowState('loadingPersonality');
  };

  const handlePersonalityLoadingComplete = () => {
    setAppFlowState('mainApp');
  };

  const handleBackFromAuth = () => {
    setAppFlowState('landing');
  };

  const handleBackFromSocialIntegration = () => {
    setAppFlowState('auth');
  };

  const handleBackFromLocationPermission = () => {
    setAppFlowState('socialIntegration');
  };

  // Main app handlers
  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleBackFromSettings = () => {
    setCurrentScreen('main');
    setCurrentTab('profile');
  };

  const handleLogout = () => {
    signOut();
    setCurrentScreen('main');
    setCurrentTab('home');
    setAppFlowState('landing');
  };

  const handleOpenChat = (otherUser: User) => {
    setSelectedOtherUser(otherUser);
    setCurrentScreen('chat');
  };

  const handleBackFromChat = () => {
    setCurrentScreen('main');
    setSelectedOtherUser(null);
  };

  const handleJoinActivity = async (activityId: string) => {
    if (!user) return;
  
    const activity = activities.find(a => a.id === activityId);
    if (!activity) return;
  
    // Create a join request (local state/UI only)
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
  
    // Add user to pending list (local UI)
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
  
    // Call backend to join activity
    console.log('App: handleJoinActivity called with', activityId, user.id);
    const result = await activityService.joinActivity(activityId, user.id);
    console.log('App: activityService.joinActivity result:', result);
  
    // Open chat with the activity host
    handleOpenChat(activity.createdBy);
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

    // Close host request chat
    setShowHostRequest(false);
    setSelectedJoinRequest(null);
  };

  const handleCreateActivity = async (activityData: CreateActivityData) => {
    if (!user) return;
    const newActivity = await activityService.createActivity(activityData, user.id);
    if (newActivity) {
      setActivities(prev => [newActivity, ...prev]);
    }
    setShowCreateModal(false);
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
    // This will be handled by the new chat system
    console.log('Sending direct message:', messageText);
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
  };

  const handleBackFromActivityDetail = () => {
    setCurrentScreen('main');
    setSelectedActivity(null);
  };

  const handleLeaveActivity = (activityId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          attendees: activity.attendees.filter(a => a.id !== user?.id),
          currentAttendees: activity.currentAttendees - 1,
          isJoined: false,
        };
      }
      return activity;
    }));
  };

  // Render based on app flow state
  if (appFlowState === 'landing') {
    console.log('App: Showing landing page');
    return (
      <LandingPage 
        onSignUp={handleSignUpFromLanding}
        onLogin={handleLoginFromLanding}
      />
    );
  }

  if (appFlowState === 'auth') {
    console.log('App: Showing auth screen');
    return (
      <AuthScreen 
        onAuthSuccess={(mode) => handleAuthSuccess(mode)}
        onBack={handleBackFromAuth}
      />
    );
  }

  if (appFlowState === 'socialIntegration') {
    if (onboardingMode !== 'signup') {
      setAppFlowState('locationPermission');
      return null;
    }
    console.log('App: Showing social integration screen');
    return (
      <SocialIntegrationScreen 
        onComplete={handleSocialIntegrationComplete}
        onBack={handleBackFromSocialIntegration}
      />
    );
  }

  if (appFlowState === 'locationPermission') {
    console.log('App: Showing location permission screen');
    return (
      <LocationPermissionScreen 
        onAllow={handleLocationPermissionComplete}
        onSkip={handleLocationPermissionSkip}
        onBack={handleBackFromLocationPermission}
      />
    );
  }

  if (appFlowState === 'loadingPersonality') {
    console.log('App: Showing personality loading screen');
    return (
      <LoadingScreen 
        onComplete={handlePersonalityLoadingComplete}
      />
    );
  }

  // Main app screens
  console.log('App: Showing main app interface');

  if (currentScreen === 'settings') {
    return (
      <SettingsScreen 
        onLogout={handleLogout}
        onBack={handleBackFromSettings}
      />
    );
  }

  if (currentScreen === 'chat' && selectedOtherUser) {
    return (
      <ChatScreen 
        otherUser={selectedOtherUser}
        onBack={handleBackFromChat}
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
    console.log('🔄 App: renderCurrentTab called with currentTab:', currentTab);
    
    switch (currentTab) {
      case 'home':
        console.log('🏠 App: Rendering HomeScreen');
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
        console.log('💬 App: Rendering ChatsScreen');
        return (
          <ChatsScreen 
            onOpenChat={handleOpenChat}
          />
        );
      case 'activities':
        console.log('🎯 App: Rendering ActivitiesList');
        return (
          <ActivitiesList 
            activities={activities}
            user={user!}
            onOpenActivity={handleOpenActivity}
          />
        );
      case 'profile':
        console.log('👤 App: Rendering ProfileScreen');
        return (
          <ProfileScreen 
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        );
      default:
        console.log('❓ App: Unknown tab:', currentTab);
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