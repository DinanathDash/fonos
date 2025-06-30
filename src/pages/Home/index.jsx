import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import HomeLoadingSkeleton from './HomeLoadingSkeleton';
import WelcomeBanner from './WelcomeBanner';
import RecentlyPlayedSection from './RecentlyPlayedSection';
import FeaturedPlaylistsSection from './FeaturedPlaylistsSection';
import TopTracksSection from './TopTracksSection';
import musicService from '../../services/musicService';
import { getTimeOfDay } from './utils';

const Home = () => {
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const { onOpenAuth } = useOutletContext();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load data from the new music service
      const [playlists, recent, tracks] = await Promise.all([
        musicService.getFeaturedPlaylists(6),
        musicService.getRecentlyPlayedTracks(10),
        musicService.getTopTracks(20)
      ]);
      
      setFeaturedPlaylists(playlists);
      setRecentlyPlayed(recent);
      setTopTracks(tracks);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    playTrack(track, topTracks);
  };

  if (loading) {
    return <HomeLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner for unauthenticated users */}
      {!user && onOpenAuth && (
        <WelcomeBanner onOpenAuth={onOpenAuth} />
      )}

      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Good {getTimeOfDay()}
        </h1>
        <p className="text-muted-foreground">
          {!user 
            ? "Discover amazing music and create your perfect playlist."
            : "Welcome back! Enjoy your personalized music experience."
          }
        </p>
      </section>

      {/* Recently Played */}
      <RecentlyPlayedSection 
        recentlyPlayed={recentlyPlayed} 
        onPlayTrack={handlePlayTrack} 
      />

      {/* Featured Playlists */}
      <FeaturedPlaylistsSection featuredPlaylists={featuredPlaylists} />

      {/* Your Top Tracks */}
      <TopTracksSection 
        topTracks={topTracks} 
        onPlayTrack={handlePlayTrack} 
      />
    </div>
  );
};

export default Home;
