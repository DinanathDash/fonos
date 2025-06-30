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
      
      // Mock data for featured playlists
      const mockFeaturedPlaylists = [
        {
          id: 1,
          title: "Today's Top Hits",
          description: "The biggest hits right now",
          image: "https://picsum.photos/300/300?random=1",
          trackCount: 50
        },
        {
          id: 2,
          title: "Chill Vibes",
          description: "Relax and unwind with these chill tracks",
          image: "https://picsum.photos/300/300?random=2",
          trackCount: 30
        },
        {
          id: 3,
          title: "Workout Mix",
          description: "High energy tracks for your workout",
          image: "https://picsum.photos/300/300?random=3",
          trackCount: 40
        }
      ];

      // Mock data for recently played (only if user is authenticated)
      const mockRecentlyPlayed = user ? [
        {
          id: 1,
          title: "Song One",
          artist: "Artist One",
          image: "https://picsum.photos/200/200?random=4",
          duration: "3:45"
        },
        {
          id: 2,
          title: "Song Two",
          artist: "Artist Two",
          image: "https://picsum.photos/200/200?random=5",
          duration: "4:12"
        }
      ] : [];

      // Mock data for top tracks
      const mockTopTracks = [
        {
          id: 1,
          title: "Popular Song 1",
          artist: "Popular Artist 1",
          album: "Album 1",
          image: "https://picsum.photos/200/200?random=6",
          duration: "3:30",
          preview_url: null
        },
        {
          id: 2,
          title: "Popular Song 2",
          artist: "Popular Artist 2",
          album: "Album 2",
          image: "https://picsum.photos/200/200?random=7",
          duration: "4:05",
          preview_url: null
        },
        {
          id: 3,
          title: "Popular Song 3",
          artist: "Popular Artist 3",
          album: "Album 3",
          image: "https://picsum.photos/200/200?random=8",
          duration: "3:55",
          preview_url: null
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setFeaturedPlaylists(mockFeaturedPlaylists);
      setRecentlyPlayed(mockRecentlyPlayed);
      setTopTracks(mockTopTracks);
    } catch (error) {
      console.error('Error loading home data:', error);
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

      {/* Your Top Tracks */}      <TopTracksSection 
        topTracks={topTracks} 
        onPlayTrack={handlePlayTrack}
        loading={loading}
      />
    </div>
  );
};

export default Home;
