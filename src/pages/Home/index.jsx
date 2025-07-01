import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import HomeLoadingSkeleton from './HomeLoadingSkeleton';
import WelcomeBanner from './WelcomeBanner';
import RecentlyPlayedSection from './RecentlyPlayedSection';
import FeaturedPlaylistsSection from './FeaturedPlaylistsSection';
import TopTracksSection from './TopTracksSection';
import { getTimeOfDay } from './utils';
import musicService from '../../services/musicService';

const Home = () => {
  const [featuredPlaylists, setFeaturedPlaylists] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const { onOpenAuth } = useOutletContext();

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      const homeData = await musicService.getHomeData();
      setFeaturedPlaylists(homeData.featuredPlaylists);
      setTopTracks(homeData.topTracks);
      
      // Only set recently played if user is authenticated
      if (user) {
        setRecentlyPlayed(homeData.recentlyPlayed);
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
      
      // Fallback data if API fails
      setFeaturedPlaylists([
        {
          id: 'fallback-1',
          title: "Popular Music",
          description: "Great music for everyone",
          image: "https://picsum.photos/300/300?random=1",
          trackCount: 25
        }
      ]);
      
      setTopTracks([
        {
          id: 'fallback-track-1',
          title: "Sample Track",
          artist: "Sample Artist",
          album: "Sample Album",
          image: "https://picsum.photos/200/200?random=6",
          duration: "3:30"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

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
        loading={loading}
      />
    </div>
  );
};

export default Home;
