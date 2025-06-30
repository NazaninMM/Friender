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
import { CreateActivityModal } from './components/activity/CreateActivityModal';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { Activity, CreateActivityData, User } from './types';
import { activityService } from './lib/database';
import { joinRequestService } from './lib/joinRequestService';

type AppFlowState = 'landing' | 'auth' | 'socialIntegration' | 'locationPermission' | 'loadingPersonality' | 'mainApp';
type AppScreen = 'main' | 'chat' | 'settings' | 'activity-detail';
type MainTab = 'home' | 'chats' | 'activities' | 'profile';

function App() {
  console.log('App: Rendering App component');
  
  const { user, loading, signOut } = useAuth();
  
  // App flow state management
  const [appFlowState, setAppFlowState] = useState<AppFlowState>('landing');
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Main app state management
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main');
  const [currentTab, setCurrentTab] = useState<MainTab>('home');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<User | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  console.log('App: Current state - loading:', loading, 'user:', user ? 'Present' : 'None', 'appFlowState:', appFlowState, 'isNewUser:', isNewUser);

  useEffect(() => {
    async function fetchActivities() {
      if (user) {
        try {
          console.log('Fetching activities...');
          const activities = await activityService.getAllActivities();
          console.log('Fetched activities:', activities);
          setActivities(activities);
        } catch (error) {
          console.error('Error fetching activities:', error);
        }
      }
    }
    fetchActivities();
  }, [user]);

  // Handle authentication state changes
  useEffect(() => {
    console.log('🔄 App: useEffect triggered');
    console.log('📊 App: Current state - loading:', loading, 'user:', user ? 'Present' : 'None', 'appFlowState:', appFlowState, 'isNewUser:', isNewUser);
    
    if (!loading) {
      console.log('✅ App: Not loading, processing state...');
      if (user) {
        // If user is new, go to social integration
        if (isNewUser) {
          console.log('👤 App: New user detected, going to social integration');
          setAppFlowState('socialIntegration');
          return;
        }
        
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
        setIsNewUser(false);
      }
    } else {
      console.log('⏳ App: Still loading, not changing appFlowState');
    }
  }, [user, loading, isNewUser]);

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
    // Set isNewUser based on the mode
    console.log('App: handleAuthSuccess called with mode:', mode);
    setIsNewUser(mode === 'signup');
    
    // The useEffect above will handle the transition based on user.connectedServices and isNewUser
    console.log('App: handleAuthSuccess - isNewUser set to:', mode === 'signup');
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
    setIsNewUser(false);
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
  
    try {
      // Create a join request (this will also create a chat)
      const result = await joinRequestService.createJoinRequest(
        activityId, 
        user.id,
        `Hi! I'd love to join this activity. Looking forward to hearing from you!`
      );
      
      if (!result) {
        console.error('Failed to create join request');
        return;
      }
      
      console.log('Join request created successfully:', result);
      
      // Update UI to show pending state
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
      
      // Refresh activities to get updated state
      const updatedActivities = await activityService.getAllActivities();
      setActivities(updatedActivities);
      
      // Switch to chats tab to show the new conversation
      setCurrentTab('chats');
    } catch (err) {
      console.error('Error joining activity:', err);
    }
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

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedActivity(null);
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

  // Show loading screen during initial auth check
  if (loading) {
    console.log('App: Showing initial loading screen');
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