import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./hooks/useAuth";
import { useChat } from "./hooks/useChat";
import { LandingPage } from "./components/auth/LandingPage";
import { AuthScreen } from "./components/auth/AuthScreen";
import { SocialIntegrationScreen } from "./components/auth/SocialIntegrationScreen";
import { LocationPermissionScreen } from "./components/auth/LocationPermissionScreen";
import { LoadingScreen } from "./components/common/LoadingScreen";
import { HomeScreen } from "./components/home/HomeScreen";
import { ChatsList } from "./components/chat/ChatsList";
import { ActivitiesList } from "./components/activities/ActivitiesList";
import { ProfileScreen } from "./components/profile/ProfileScreen";
import { OtherUserProfileScreen } from "./components/profile/OtherUserProfileScreen";
import { SettingsScreen } from "./components/settings/SettingsScreen";
import { ActivityChatScreen } from "./components/activity/ActivityChatScreen";
import { ActivityDetailScreen } from "./components/activity/ActivityDetailScreen";
import { HostRequestChatScreen } from "./components/activity/HostRequestChatScreen";
import { DirectChatScreen } from "./components/chat/DirectChatScreen";
import { CreateActivityModal } from "./components/activity/CreateActivityModal";
import { BottomNavigation } from "./components/layout/BottomNavigation";
import {
  Activity,
  CreateActivityData,
  User,
  JoinRequest,
  DirectMessageChat,
  ChatMessage,
} from "./types";
import { mockActivities } from "./data/mockData";
import { activityService } from "./lib/database";
import { joinRequestService } from "./lib/joinRequestService";
import { chatService } from "./lib/chat";
import { ChatsScreen } from "./components/chat/ChatsScreen";

type AppFlowState =
  | "landing"
  | "auth"
  | "socialIntegration"
  | "locationPermission"
  | "loadingPersonality"
  | "mainApp";
type AppScreen =
  | "main"
  | "direct-chat"
  | "settings"
  | "activity-detail"
  | "other-user-profile";
type MainTab = "home" | "chats" | "activities" | "profile";

function App() {
  console.log("App: Rendering App component");

  const { user, loading, signOut } = useAuth();
  const { chats: directChats, getOrCreateChat, sendMessage } = useChat();

  // App flow state management
  const [appFlowState, setAppFlowState] = useState<AppFlowState>("landing");
  const [isNewUser, setIsNewUser] = useState(false);

  // Main app state management
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("main");
  const [currentTab, setCurrentTab] = useState<MainTab>("home");
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [selectedJoinRequest, setSelectedJoinRequest] =
    useState<JoinRequest | null>(null);
  const [selectedDirectChat, setSelectedDirectChat] =
    useState<DirectMessageChat | null>(null);
  const [selectedOtherUserId, setSelectedOtherUserId] = useState<string | null>(
    null
  );
  const [showChat, setShowChat] = useState(false);
  const [showHostRequest, setShowHostRequest] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false);

  console.log(
    "App: Current state - loading:",
    loading,
    "user:",
    user ? "Present" : "None",
    "appFlowState:",
    appFlowState
  );

  // Load activities and join requests when user is authenticated
  useEffect(() => {
    if (user && appFlowState === "mainApp") {
      loadActivities();
      loadJoinRequests();
    }
  }, [user, appFlowState]);

  const loadActivities = async () => {
    if (!user) return;

    try {
      setLoadingActivities(true);
      const userActivities = await activityService.getUserActivities(user.id);
      setActivities(userActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadJoinRequests = async () => {
    if (!user) return;

    try {
      setLoadingJoinRequests(true);
      const userJoinRequests = await joinRequestService.getUserJoinRequests(
        user.id
      );
      setJoinRequests(userJoinRequests);
    } catch (error) {
      console.error("Error loading join requests:", error);
    } finally {
      setLoadingJoinRequests(false);
    }
  };

  // Handle authentication state changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, go to main app
        setAppFlowState("mainApp");
      } else {
        // No user, start from landing page
        setAppFlowState("landing");
      }
    }
  }, [user, loading]);

  // Onboarding flow handlers
  const handleSignUpFromLanding = () => {
    setAppFlowState("auth");
    setIsNewUser(true);
  };

  const handleLoginFromLanding = () => {
    setAppFlowState("auth");
    setIsNewUser(false);
  };

  const handleAuthSuccess = (newUser: boolean) => {
    setIsNewUser(newUser);
    if (newUser) {
      // New user goes through social integration
      setAppFlowState("socialIntegration");
    } else {
      // Existing user goes straight to main app
      setAppFlowState("mainApp");
    }
  };

  const handleSocialIntegrationComplete = (connectedServices: string[]) => {
    console.log(
      "Social integration completed with services:",
      connectedServices
    );
    setAppFlowState("locationPermission");
  };

  const handleLocationPermissionComplete = () => {
    setAppFlowState("loadingPersonality");
  };

  const handleLocationPermissionSkip = () => {
    setAppFlowState("loadingPersonality");
  };

  const handlePersonalityLoadingComplete = () => {
    setAppFlowState("mainApp");
  };

  const handleBackFromAuth = () => {
    setAppFlowState("landing");
  };

  const handleBackFromSocialIntegration = () => {
    setAppFlowState("auth");
  };

  const handleBackFromLocationPermission = () => {
    setAppFlowState("socialIntegration");
  };

  // Main app handlers
  const handleSettings = () => {
    setCurrentScreen("settings");
  };

  const handleBackFromSettings = () => {
    setCurrentScreen("main");
    setCurrentTab("profile");
  };

  const handleLogout = () => {
    signOut();
    setCurrentScreen("main");
    setCurrentTab("home");
    setAppFlowState("landing");
  };

  const handleJoinActivity = async (activityId: string) => {
    if (!user) return;

    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;

    try {
      // Create join request in database
      const result = await joinRequestService.createJoinRequest(
        activityId,
        user.id,
        `Hi! I'd love to join "${activity.title}". This looks like a great activity and I think I'd be a good fit for the group. Looking forward to hearing from you!`
      );

      if (result) {
        // Reload join requests to get the new one
        await loadJoinRequests();

        // Add user to pending list in local state
        setActivities((prev) =>
          prev.map((a) => {
            if (a.id === activityId) {
              return {
                ...a,
                pendingUsers: [...(a.pendingUsers || []), user],
                isPending: true,
              };
            }
            return a;
          })
        );

        // Find the new join request in joinRequests state
        // (wait for state update, or fetch directly if needed)
        const joinRequestId = result.joinRequestId;
        // Try to find the join request in the latest joinRequests state
        // If not found, fetch it directly
        let newJoinRequest = null;
        if (joinRequests && joinRequests.length > 0) {
          newJoinRequest = joinRequests.find(
            (jr) => jr.id === joinRequestId
          );
        }
        if (!newJoinRequest) {
          // Fallback: fetch the join request directly
          if (joinRequestService.getJoinRequest) {
            newJoinRequest = await joinRequestService.getJoinRequest(joinRequestId);
          }
        }
        if (newJoinRequest) {
          setSelectedActivity(activity);
          setSelectedJoinRequest(newJoinRequest);
          setShowHostRequest(true);
        } else {
          alert("Join request created, but could not open chat. Please try again from your join requests.");
        }
      }
    } catch (error) {
      console.error("Error joining activity:", error);
      alert("Failed to join activity. Please try again.");
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const success = await joinRequestService.approveJoinRequest(
        requestId,
        user.id
      );

      if (success) {
        // Reload data
        await loadJoinRequests();
        await loadActivities();

        // Close host request chat
        setShowHostRequest(false);
        setSelectedJoinRequest(null);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("Failed to approve request. Please try again.");
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    if (!user) return;

    try {
      const success = await joinRequestService.denyJoinRequest(
        requestId,
        user.id
      );

      if (success) {
        // Reload data
        await loadJoinRequests();
        await loadActivities();

        // Close host request chat after a delay
        setTimeout(() => {
          setShowHostRequest(false);
          setSelectedJoinRequest(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error denying request:", error);
      alert("Failed to deny request. Please try again.");
    }
  };

  const handleCreateActivity = async (activityData: CreateActivityData) => {
    if (!user) return;

    try {
      console.log(
        "App: handleCreateActivity called with",
        activityData,
        user.id
      );
      const created = await activityService.createActivity(
        activityData,
        user.id
      );
      console.log("App: activityService.createActivity result:", created);

      if (created) {
        setActivities((prev) => [created, ...prev]);
        setShowCreateModal(false);
      } else {
        alert("Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      alert("Failed to create activity. Please try again.");
    }
  };

  const handleOpenActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentScreen("activity-detail");
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
    setCurrentScreen("direct-chat");
  };

  const handleSendDirectMessage = async (
    chatId: string,
    messageText: string
  ) => {
    if (!user) return;

    try {
      // Use the chat service to send the message
      await chatService.sendMessage(chatId, messageText);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedActivity(null);
  };

  const handleCloseHostRequest = () => {
    setShowHostRequest(false);
    setSelectedJoinRequest(null);
  };

  const handleBackFromDirectChat = () => {
    setCurrentScreen("main");
    setSelectedDirectChat(null);
  };

  const handleBackFromActivityDetail = () => {
    setCurrentScreen("main");
    setSelectedActivity(null);
  };

  const handleOpenOtherUserProfile = (userId: string) => {
    setSelectedOtherUserId(userId);
    setCurrentScreen("other-user-profile");
  };

  const handleBackFromOtherUserProfile = () => {
    setCurrentScreen("main");
    setSelectedOtherUserId(null);
  };

  const handleMessageFromOtherUserProfile = (userId: string) => {
    // Navigate back to main and open chat with this user
    setCurrentScreen("main");
    setSelectedOtherUserId(null);
    // TODO: Implement opening chat with the user
    // This could be done by finding the existing chat or creating a new one
  };

  const handleLeaveActivity = async (activityId: string) => {
    if (!user) return;

    try {
      const success = await activityService.leaveActivity(activityId, user.id);

      if (success) {
        // Reload activities
        await loadActivities();

        // Go back to main screen
        setCurrentScreen("main");
        setSelectedActivity(null);
      }
    } catch (error) {
      console.error("Error leaving activity:", error);
      alert("Failed to leave activity. Please try again.");
    }
  };

  // Show loading screen during initial auth check
  if (loading) {
    console.log("App: Showing initial loading screen");
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
  if (appFlowState === "landing") {
    console.log("App: Showing landing page");
    return (
      <LandingPage
        onSignUp={handleSignUpFromLanding}
        onLogin={handleLoginFromLanding}
      />
    );
  }

  if (appFlowState === "auth") {
    console.log("App: Showing auth screen");
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        onBack={handleBackFromAuth}
      />
    );
  }

  if (appFlowState === "socialIntegration") {
    console.log("App: Showing social integration screen");
    return (
      <SocialIntegrationScreen
        onComplete={handleSocialIntegrationComplete}
        onBack={handleBackFromSocialIntegration}
      />
    );
  }

  if (appFlowState === "locationPermission") {
    console.log("App: Showing location permission screen");
    return (
      <LocationPermissionScreen
        onAllow={handleLocationPermissionComplete}
        onSkip={handleLocationPermissionSkip}
        onBack={handleBackFromLocationPermission}
      />
    );
  }

  if (appFlowState === "loadingPersonality") {
    console.log("App: Showing personality loading screen");
    return <LoadingScreen onComplete={handlePersonalityLoadingComplete} />;
  }

  // Main app screens
  console.log("App: Showing main app interface");

  if (currentScreen === "settings") {
    return (
      <SettingsScreen onLogout={handleLogout} onBack={handleBackFromSettings} />
    );
  }

  if (currentScreen === "activity-detail" && selectedActivity) {
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

  if (currentScreen === "direct-chat" && selectedDirectChat) {
    return (
      <DirectChatScreen
        directChat={selectedDirectChat}
        user={user!}
        onBack={handleBackFromDirectChat}
        onSendMessage={handleSendDirectMessage}
        onApproveRequest={handleApproveRequest}
        onDenyRequest={handleDenyRequest}
        onProfileClick={handleOpenOtherUserProfile}
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
        onProfileClick={handleOpenOtherUserProfile}
      />
    );
  }

  if (showChat && selectedActivity) {
    return (
      <ActivityChatScreen
        activity={selectedActivity}
        user={user!}
        onBack={handleCloseChat}
        onProfileClick={handleOpenOtherUserProfile}
      />
    );
  }

  if (currentScreen === "other-user-profile" && selectedOtherUserId) {
    return (
      <OtherUserProfileScreen
        userId={selectedOtherUserId}
        onBack={handleBackFromOtherUserProfile}
        onMessage={handleMessageFromOtherUserProfile}
      />
    );
  }

  const renderCurrentTab = () => {
    switch (currentTab) {
      case "home":
        return (
          <HomeScreen
            activities={activities}
            user={user!}
            onJoinActivity={handleJoinActivity}
            onCreateActivity={() => setShowCreateModal(true)}
            onOpenActivity={handleOpenActivity}
          />
        );
      case "chats":
        console.log("💬 App: Rendering ChatsScreen");
        return (
          <ChatsScreen
            onOpenChat={handleOpenActivityChat}
            onProfileClick={handleOpenOtherUserProfile}
          />
        );
      case "activities":
        return (
          <ActivitiesList
            activities={activities}
            user={user!}
            onOpenActivity={handleOpenActivity}
          />
        );
      case "profile":
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

      <BottomNavigation currentTab={currentTab} onTabChange={setCurrentTab} />

      <CreateActivityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateActivity={handleCreateActivity}
      />
    </div>
  );
}

export default App;
