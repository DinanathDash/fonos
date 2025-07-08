import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SparklesIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePlayer } from '../../context/PlayerContext';
import HomeLoadingSkeleton from './HomeLoadingSkeleton';
import WelcomeBanner from './WelcomeBanner';
import RecentlyPlayedSection from './RecentlyPlayedSection';
import FeaturedPlaylistsSection from './FeaturedPlaylistsSection';
import TopTracksSection from './TopTracksSection';
import { getTimeOfDay } from './utils';
import musicService from '../../services/musicService';
import { cn } from '../../lib/utils';

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

      // Handle recently played tracks
      if (user && homeData.recentlyPlayed && homeData.recentlyPlayed.length > 0) {
        // Use stored recently played tracks if available
        setRecentlyPlayed(homeData.recentlyPlayed);
      } else {
        // If no recently played tracks or user isn't authenticated,
        // use top tracks as a fallback for Recently Played section
        console.log('No recently played tracks found, using top tracks as fallback');
        setRecentlyPlayed(homeData.topTracks.slice(0, 6)); // Just show first 6 tracks
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
    console.log('Playing track from Home page:', track);

    // Check for YouTube ID - critical for playback
    const youtubeId = track.youtube_id || track.videoId || track.id;

    if (!youtubeId) {
      console.error('Track missing YouTube ID:', track);
      // Try to extract ID from audio_url if present
      const idFromUrl = track.audio_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)?.[1];
      if (!idFromUrl) {
        console.error('Cannot play track without YouTube ID');
        return;
      }
    }

    // Add to recently played
    if (track) {
      try {
        // Add track to recently played and update state
        const updatedRecentlyPlayed = [
          track, // Add current track at the beginning
          ...recentlyPlayed.filter(t => t.id !== track.id) // Filter out duplicates
        ].slice(0, 20); // Keep only 20 most recent tracks

        setRecentlyPlayed(updatedRecentlyPlayed);

        // Also save to localStorage
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('recentlyPlayed', JSON.stringify(updatedRecentlyPlayed));
        }
      } catch (error) {
        console.error('Failed to update recently played:', error);
      }
    }

    // Ensure track has all necessary properties for playback
    const enhancedTrack = {
      ...track,
      // Ensure it has a YouTube video ID
      youtube_id: youtubeId || track.youtube_id || track.videoId || track.id,
      videoId: youtubeId || track.videoId || track.youtube_id || track.id,
      id: track.id || youtubeId || track.videoId || track.youtube_id,
      // Ensure name is properly set
      name: track.name || track.title || 'Track',
      title: track.title || track.name || 'Track',
      // Ensure artist is properly set
      artist: track.artist || (track.artists && track.artists[0]?.name) || 'Artist',
      // Make sure we have a duration
      duration: track.duration || '0:00',
      duration_ms: track.duration_ms || 0,
      // Ensure we have an audio URL based on YouTube ID
      audio_url: track.audio_url ||
        (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null) ||
        (track.youtube_id ? `https://www.youtube.com/watch?v=${track.youtube_id}` : null) ||
        (track.videoId ? `https://www.youtube.com/watch?v=${track.videoId}` : null) ||
        (track.id ? `https://www.youtube.com/watch?v=${track.id}` : null),
      embed_url: track.embed_url ||
        (youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null) ||
        (track.youtube_id ? `https://www.youtube.com/embed/${track.youtube_id}` : null) ||
        (track.videoId ? `https://www.youtube.com/embed/${track.videoId}` : null) ||
        (track.id ? `https://www.youtube.com/embed/${track.id}` : null),
      // Set isDemo to false
      isDemo: false
    };

    console.log('Enhanced track ready for playback:', enhancedTrack);

    // Pass the enhanced track and the queue to the player
    playTrack(enhancedTrack, topTracks);
  };

  if (loading) {
    return <HomeLoadingSkeleton />;
  }

  // Get time of day for greeting
  const timeOfDay = getTimeOfDay();

  return (
    <div className="px-6 py-4">
      {/* Welcome Banner for unauthenticated users */}
      {!user && onOpenAuth && (
        <WelcomeBanner onOpenAuth={onOpenAuth} />
      )}

      <div className="space-y-8">
        {/* Welcome Section with gradient accent */}
        <section className="relative">
          <div className="absolute -top-12 -left-6 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-70 -z-10" />
          <div className="absolute top-0 right-6 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl opacity-60 -z-10" />

          <h1 className={cn(
            "text-4xl font-bold mb-2 bg-clip-text text-transparent",
            timeOfDay === "morning" && "bg-gradient-to-r from-yellow-400 to-orange-500",
            timeOfDay === "afternoon" && "bg-gradient-to-r from-blue-400 to-teal-500",
            timeOfDay === "evening" && "bg-gradient-to-r from-purple-400 to-pink-500",
            timeOfDay === "night" && "bg-gradient-to-r from-indigo-500 to-purple-700"
          )}>
            Good {timeOfDay}
            <SparklesIcon className="h-6 w-6 inline-block ml-2 text-primary" />
          </h1>
          <p className="text-muted-foreground text-lg">
            {!user
              ? "Discover amazing music and create your perfect playlist."
              : `Welcome back${user?.displayName ? ', ' + user.displayName : ''}! Enjoy your personalized music experience.`
            }
          </p>
        </section>

        {/* Recently Played with enhanced card design */}
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
    </div>
  );
};

export default Home;
