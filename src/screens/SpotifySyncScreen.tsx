import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { fetchSpotifyTopTracks } from '../lib/spotify';
import { analyzeFromTracks } from '../lib/personality';
import { useNavigate } from 'react-router-dom';

const SpotifySyncScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.provider_token;
      const user = session?.user;

      if (!accessToken || !user) {
        console.warn('No Spotify token or user found');
        navigate('/integrate'); // go back to your social connect page
        return;
      }

      try {
        const tracks = await fetchSpotifyTopTracks(accessToken);
        const traits = analyzeFromTracks(tracks.items);

        await supabase.from('users').update({
          personality_traits: traits,
          connected_services: ['spotify'],
        }).eq('id', user.id);

        console.log('✅ Spotify traits saved:', traits);
      } catch (err) {
        console.error('❌ Failed to process Spotify:', err);
      }

      navigate('/integrate'); // or wherever your app wants to send them
    };

    sync();
  }, []);

  return (
    <div className="p-6 text-center text-gray-700">
      Connecting your Spotify account...
    </div>
  );
};

export default SpotifySyncScreen;
