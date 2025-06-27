import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Music, Gamepad2, Brain, Upload, Check, ArrowRight, X, FileText, AlertCircle, Video, ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConnectedService } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import type { MusicAnalysis, SpotifyTrack, SpotifyArtist } from '../../lib/spotify';
import type { User } from '../../types';

interface SocialIntegrationScreenProps {
  onComplete: (connectedServices: string[]) => void;
  onBack: () => void;
}

export const SocialIntegrationScreen: React.FC<SocialIntegrationScreenProps> = ({ 
  onComplete, 
  onBack 
}) => {
  const { user } = useAuth();
  const [services, setServices] = useState<ConnectedService[]>([
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'instagram',
      connected: false,
      description: 'Photos and interests to understand your lifestyle'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      type: 'spotify',
      connected: false,
      description: 'Music taste for better activity matching'
    },
    {
      id: 'google-play',
      name: 'Google Play Games',
      type: 'google-play',
      connected: false,
      description: 'Gaming preferences and social connections'
    },
    {
      id: 'openai',
      name: 'OpenAI ChatGPT',
      type: 'openai',
      connected: false,
      description: 'Personality analysis for enhanced matching'
    }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [copied, setCopied] = useState(false);
  const [pastedJson, setPastedJson] = useState('');

  const chatGptPrompt = `write everything you know or can confidently infer about me in a json file using the following datapoints as lowercase c++-safe variable names with underscores only. use previous conversations and contextual knowledge to fill in as many fields as possible, even if exact answers were not explicitly stated. only leave a field blank ("") if absolutely no information or strong guess is available. do not ask questions or request clarification. just return the final json object, fully populated and ready to be parsed by a program. here are the datapoints: first_name, age, gender, pronouns, sexual_orientation, relationship_status, nationality, location, timezone, languages_spoken, religion, ethnicity, political_views, education_level, occupation, work_schedule, student_status, income_range, living_situation, willingness_to_relocate, myers_briggs_type, enneagram_type, personality_type, outlook, competitiveness, humor_style, love_language, conflict_resolution_style, cleanliness_level, pet_peeves, sleep_schedule, wake_up_time, bedtime, diet, alcohol_use, smoking_habits, drug_use, fitness_level, exercise_routine, indoor_vs_outdoor, chronotype, workday_schedule, weekend_habits, preferred_activity_time, social_energy_level, favorite_music_genres, favorite_movies_shows, favorite_books, gaming_interests, travel_preferences, favorite_places_to_hang, sports, hobbies, cooking_interest, artistic_interests, communication_style, response_time_habits, conversation_depth, social_media_usage, contact_frequency, contact_preference, partying_preference, gifting_behavior, cooking_behavior, gpt_opinion, hangout_frequency, friendship_depth, friendship_duration_pref, online_friendship_ok, long_distance_friendship_ok, willingness_to_travel_to_meet, supportive_experience, comfort_with_vulnerability, noise_tolerance, cleanliness_habits, overnight_guest_opinion, sharing_items, room_temp_pref, pet_allergies, childcare_plans, home_decor_style, career_goals, work_life_balance, remote_vs_office, networking_interest, volunteering_interest, financial_priority, lazy_day_importance, privacy_boundaries, open_mindedness, supportiveness, inclusivity, core_values, social_justice_stance, dealbreakers, personality_conflicts_to_avoid, activities_to_avoid, top_3_values, ideal_friend_traits.`;

  // Listen for Spotify OAuth completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      console.log('Raw event data:', event.data);
      if (event.data.type === 'SPOTIFY_OAUTH_SUCCESS') {
        // Mark Spotify as connected
        setServices(prev =>
          prev.map(service =>
            service.id === 'spotify'
              ? { ...service, connected: true }
              : service
          )
        );
      } else if (event.data.type === 'SPOTIFY_OAUTH_ERROR') {
        alert('Failed to connect Spotify. Please try again.');
      } else if (event.data.type === 'SPOTIFY_OAUTH_SPOTIFY_DATA') {
        console.log('Received Spotify data:', event.data.data);
        if (!user) {
          alert('Please log in to connect Spotify.');
          return;
        }
        saveSpotifyDataToSupabase(event.data.data, user)
          .then(() => {
            // Mark Spotify as connected
            setServices(prev =>
              prev.map(service =>
                service.id === 'spotify'
                  ? { ...service, connected: true }
                  : service
              )
            );
          })
          .catch((err) => {
            alert('Failed to save Spotify data: ' + (err?.message || err));
          });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  const handleConnect = async (serviceId: string) => {
    if (serviceId === 'spotify') {
      try {
        // Check if user is logged in
        if (!user?.id) {
          alert('Please log in to connect Spotify.');
          return;
        }
        // Import the Spotify OAuth function
        const { getSpotifyAuthUrl } = await import('../../lib/spotify');
        // Generate Spotify OAuth URL
        const authUrl = getSpotifyAuthUrl();
        // Open OAuth in a popup window
        const popup = window.open(
          authUrl,
          'spotify-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );
        if (!popup) {
          throw new Error('Popup blocked. Please allow popups for this site.');
        }
        // Check if popup was closed
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Clean up the user ID from localStorage
            localStorage.removeItem('spotify_user_id');
          }
        }, 1000);
      } catch (error) {
        console.error('Failed to initiate Spotify OAuth:', error);
        // Clean up the user ID from localStorage
        localStorage.removeItem('spotify_user_id');
        // Show a more specific error message
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        alert(`Failed to connect Spotify: ${errorMessage}\n\nPlease check the developer console for more details.`);
      }
      return;
    }
    if (serviceId === 'openai') {
      setShowUploadModal(true);
      return;
    }
    // Default mock behavior for Instagram, Google Play, etc.
    setServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, connected: true }
          : service
      )
    );
  };

  const handleVideoChat = () => {
    setShowVideoModal(true);
  };

  const handleVideoComplete = () => {
    setShowVideoModal(false);
    // Mark video chat as completed
    setServices(prev => [...prev, {
      id: 'video-chat',
      name: 'AI Video Chat',
      type: 'openai',
      connected: true,
      description: 'Personality insights from AI conversation'
    }]);
  };

  // Add this function to process and validate OpenAI data
  function processOpenAIData(rawData: unknown) {
    if (typeof rawData !== 'object' || rawData === null) {
      throw new Error('Invalid data format: not an object');
    }
    const data = rawData as Record<string, unknown>;
    // Remove required field checks
    // Normalize age if present
    if (typeof data.age !== 'undefined') {
      if (typeof data.age === 'string' || typeof data.age === 'number') {
        const ageNum = Number(data.age);
        data.age = isNaN(ageNum) ? null : ageNum;
      } else {
        data.age = null;
      }
    }
    // Normalize comma-separated lists to arrays for some fields if present
    const arrayFields = [
      'languages_spoken',
      'favorite_music_genres',
      'favorite_movies_shows',
      'hobbies',
      'core_values',
      'top_3_values',
      'ideal_friend_traits'
    ];
    for (const field of arrayFields) {
      if (typeof data[field] === 'string') {
        data[field] = (data[field] as string)
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }
    return data;
  }

  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file: File | undefined = event.target.files?.[0];
    setUploadError('');
    if (file) {
      if (file.type !== 'application/json') {
        setUploadError('Please upload a JSON file from your ChatGPT data export.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setUploadError('File is too large. Please ensure your export is under 50MB.');
        return;
      }
      try {
        const text = await file.text();
        const rawData = JSON.parse(text);
        const processedData = processOpenAIData(rawData);
        // Save to Supabase user_openai_analysis table
        const { supabase } = await import('../../lib/supabase');
        if (!user?.id) throw new Error('Not logged in');
        // Upsert analysis
        const { error: upsertError } = await supabase
          .from('user_openai_analysis')
          .upsert({ user_id: user.id, analysis: processedData }, { onConflict: 'user_id' });
        if (upsertError) throw upsertError;
        // Mark OpenAI as connected
        const { data: profile } = await supabase
          .from('profiles')
          .select('connected_services')
          .eq('id', user.id)
          .single();
        const currentServices = Array.isArray(profile?.connected_services) ? profile.connected_services : [];
        if (!currentServices.includes('openai')) {
          const updatedServices = [...currentServices, 'openai'];
          await supabase.from('profiles').update({ connected_services: updatedServices }).eq('id', user.id);
        }
        setUploadedFile(file);
        setServices(prev =>
          prev.map((service: ConnectedService) =>
            service.id === 'openai'
              ? { ...service, connected: true }
              : service
          )
        );
        setShowUploadModal(false);
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : 'Failed to process or save your data.');
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(chatGptPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'instagram': return Instagram;
      case 'spotify': return Music;
      case 'google-play': return Gamepad2;
      case 'openai': return Brain;
      default: return Upload;
    }
  };

  const connectedServices = services.filter(service => service.connected);
  const canContinue = connectedServices.length >= 2;

  // Add the saveSpotifyDataToSupabase function
  async function saveSpotifyDataToSupabase(
    { analysis, tracks, artists }: { analysis: MusicAnalysis; tracks: SpotifyTrack[]; artists: SpotifyArtist[] },
    user: User
  ) {
    console.log('Received Spotify data:', { analysis, tracks, artists });
    if (!user?.id) throw new Error('Not logged in');
    if (!analysis || !analysis.topGenres || !analysis.musicPersonality) {
      throw new Error('Spotify analysis data is missing or invalid');
    }
    const { supabase } = await import('../../lib/supabase');
    // Save music analysis
    await supabase.from('user_music_analysis').upsert({
      user_id: user.id,
      top_genres: analysis.topGenres,
      music_personality: analysis.musicPersonality,
      audio_features_summary: analysis.audioFeatures,
      mood_analysis: analysis.moods
    }, { onConflict: 'user_id' });
    // Save top tracks
    for (const track of tracks.slice(0, 20)) {
      await supabase.from('user_spotify_tracks').upsert({
        user_id: user.id,
        spotify_id: track.id,
        name: track.name,
        artist_names: track.artists.map((a: { name: string }) => a.name),
        album_name: track.album?.name || 'Unknown',
        popularity: track.popularity || 0
      }, { onConflict: 'user_id,spotify_id' });
    }
    // Save top artists
    for (const artist of artists.slice(0, 20)) {
      await supabase.from('user_spotify_artists').upsert({
        user_id: user.id,
        spotify_id: artist.id,
        name: artist.name,
        genres: artist.genres || [],
        popularity: artist.popularity || 0
      }, { onConflict: 'user_id,spotify_id' });
    }
    // Update connected_services in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('connected_services')
      .eq('id', user.id)
      .single();
    if (profileError) {
      console.warn('Could not fetch profile for connected_services update:', profileError);
      return;
    }
    const currentServices = Array.isArray(profile.connected_services) ? profile.connected_services : [];
    if (!currentServices.includes('spotify')) {
      const updatedServices = [...currentServices, 'spotify'];
      await supabase.from('profiles').update({ connected_services: updatedServices }).eq('id', user.id);
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Boost Your Profile</h2>
            <p className="text-gray-600 leading-relaxed">
              Connect at least 2 accounts to help us understand your interests, routines, and style.
            </p>
            
            {/* Progress Indicator */}
            <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium text-blue-600">{connectedServices.length}/2 minimum</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((connectedServices.length / 2) * 100, 100)}%` }}
                />
              </div>
              {connectedServices.length >= 2 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm mt-2 font-medium"
                >
                  ✓ Ready to continue!
                </motion.p>
              )}
            </div>
          </motion.div>

          <div className="space-y-4 mb-8">
            {services.map((service, index) => {
              const Icon = getServiceIcon(service.type);
              
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          service.connected 
                            ? 'bg-gradient-to-r from-green-100 to-green-200' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-200'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            service.connected ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      {service.connected ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">Connected</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleConnect(service.id)}
                          variant="outline"
                          size="sm"
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* AI Video Chat Option */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">Let's Have a Chat!</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Talk with our AI to get personalized insights about your personality
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleVideoChat}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    size="sm"
                  >
                    Start Chat
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex space-x-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
              
              <Button
                onClick={() => onComplete(connectedServices.map(s => s.id))}
                className="flex-2 flex items-center justify-center space-x-2"
                disabled={!canContinue}
              >
                <span>{canContinue ? 'Continue' : `Connect ${2 - connectedServices.length} more`}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            
            {!canContinue && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-gray-500"
              >
                Please connect at least 2 services to continue
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Get Your ChatGPT Personality Data</h3>
              <Button
                onClick={() => setShowUploadModal(false)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Step 1: Instructions */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Open ChatGPT and Copy This Prompt
                </h4>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Copy this prompt to ChatGPT:</span>
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto border">
                    {chatGptPrompt}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => window.open('https://chatgpt.com', '_blank')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Open ChatGPT
                  </Button>
                  <span className="text-sm text-blue-700">
                    Make sure you're logged in, then paste the prompt above
                  </span>
                </div>
              </div>

              {/* Step 2: Upload */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Upload the JSON Response
                </h4>
                
                <p className="text-purple-800 mb-4">
                  ChatGPT will generate a JSON file with your personality data. Copy that JSON response and save it as a .json file, then upload it here.
                </p>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-purple-600" />
                  </div>
                  
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer mb-4">
                      <FileText className="w-4 h-4 mr-2" />
                      Choose JSON File
                    </Button>
                  </label>

                  {uploadError && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 text-sm">{uploadError}</span>
                      </div>
                    </div>
                  )}

                  {uploadedFile && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-center space-x-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 font-medium">{uploadedFile.name}</span>
                      </div>
                      <p className="text-green-600 text-xs mt-1">
                        File uploaded successfully! Your personality analysis is ready.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-start space-x-3">
                  <Brain className="w-6 h-6 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
                    <p className="text-sm text-gray-700">
                      Your personality data is processed locally and used only for friend matching. 
                      We never store, share, or access your personal conversations or sensitive information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-bold text-blue-900 mb-2">Or Paste JSON Data</h4>
                <textarea
                  className="w-full min-h-[120px] border border-gray-300 rounded-lg p-2 text-sm font-mono"
                  placeholder="Paste your OpenAI JSON here..."
                  value={pastedJson}
                  onChange={e => setPastedJson(e.target.value)}
                />
                <Button
                  className="mt-2"
                  onClick={async () => {
                    setUploadError('');
                    try {
                      const rawData = JSON.parse(pastedJson);
                      const processedData = processOpenAIData(rawData);
                      const { supabase } = await import('../../lib/supabase');
                      if (!user?.id) throw new Error('Not logged in');
                      const { error: upsertError } = await supabase
                        .from('user_openai_analysis')
                        .upsert({ user_id: user.id, analysis: processedData }, { onConflict: 'user_id' });
                      if (upsertError) throw upsertError;
                      const { data: profile } = await supabase
                        .from('profiles')
                        .select('connected_services')
                        .eq('id', user.id)
                        .single();
                      const currentServices = Array.isArray(profile?.connected_services) ? profile.connected_services : [];
                      if (!currentServices.includes('openai')) {
                        const updatedServices = [...currentServices, 'openai'];
                        await supabase.from('profiles').update({ connected_services: updatedServices }).eq('id', user.id);
                      }
                      setUploadedFile(null); // No file, but mark as uploaded
                      setServices(prev =>
                        prev.map((service: ConnectedService) =>
                          service.id === 'openai'
                            ? { ...service, connected: true }
                            : service
                        )
                      );
                      setShowUploadModal(false);
                      setPastedJson('');
                    } catch (err: unknown) {
                      setUploadError(err instanceof Error ? err.message : 'Failed to process or save your data.');
                    }
                  }}
                >
                  Save Pasted JSON
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Video Chat Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">AI Personality Chat</h3>
              <Button
                onClick={() => setShowVideoModal(false)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-10 h-10 text-purple-600" />
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Ready to Chat?</h4>
              <p className="text-gray-600 mb-6">
                Our AI will have a friendly conversation with you to understand your personality, interests, and what makes you unique.
              </p>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-6">
                <h5 className="font-medium text-purple-900 mb-2">What to expect:</h5>
                <ul className="text-sm text-purple-700 space-y-1 text-left">
                  <li>• 5-10 minute friendly conversation</li>
                  <li>• Questions about your interests and goals</li>
                  <li>• Voice and video interaction</li>
                  <li>• Personalized insights about your personality</li>
                </ul>
              </div>

              <Button
                onClick={handleVideoComplete}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 mb-4"
              >
                Start Video Chat
              </Button>
              
              <Button
                onClick={() => setShowVideoModal(false)}
                variant="ghost"
                className="w-full"
              >
                Maybe Later
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};