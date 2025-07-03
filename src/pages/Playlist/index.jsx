import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Clock, MoreHorizontal, Heart, Share2, Download, Plus } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import MarqueeText from '../../components/ui/marquee-text';
import musicService from '../../services/musicService';
import { cn, formatDuration } from '../../lib/utils';

// Mock playlist data for initial render
const mockPlaylist = {
  id: 'playlist-1',
  name: 'Playlist',
  description: 'Loading playlist...',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  creator: 'User',
  tracks: [],
  totalTracks: 0,
  gradient: 'from-blue-500 to-indigo-700',
  followers: 0,
  duration: 0
};

export default function Playlist() {
  const { id } = useParams();
  const { currentTrack, setTrack, isPlaying, togglePlayPause } = usePlayer();
  const [playlist, setPlaylist] = useState(mockPlaylist);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlaylistDetails = async () => {
      setLoading(true);
      try {
        // For mock implementation, we'll use hardcoded data
        // In a real app, this would be fetched from the musicService
        const playlistDetails = await fetchPlaylistData(id);
        setPlaylist(playlistDetails);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch playlist:', err);
        setError('Failed to load playlist. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistDetails();
  }, [id]);

  const handlePlayTrack = (track, index) => {
    setTrack(track, playlist.tracks, index);
    if (!isPlaying) togglePlayPause();
  };

  const handlePlayAll = () => {
    if (playlist.tracks.length > 0) {
      setTrack(playlist.tracks[0], playlist.tracks, 0);
      if (!isPlaying) togglePlayPause();
    }
  };

  // Fetch playlist data using our music service
  const fetchPlaylistData = async (playlistId) => {
    try {
      const playlistDetails = await musicService.getPlaylistDetails(playlistId);
      
      // Save to recently played if this is a real playlist (not liked songs)
      if (playlistId !== 'liked-songs' && playlistDetails.tracks && playlistDetails.tracks.length > 0) {
        const firstTrack = playlistDetails.tracks[0];
        if (firstTrack) {
          musicService.addToRecentlyPlayed({
            ...firstTrack,
            playlistId,
            playlistName: playlistDetails.name
          });
        }
      }
      
      return playlistDetails;
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      throw error;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-2xl font-bold mb-4">😢 Oops!</div>
        <div className="text-muted-foreground mb-6">{error}</div>
        <Button asChild>
          <Link to="/library">Back to Library</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Playlist Header */}
      <div className={cn(
        "relative flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-b rounded-xl",
        playlist.gradient || "from-blue-500 to-indigo-700"
      )}>
        {/* Playlist Cover Image */}
        {loading ? (
          <Skeleton className="h-48 w-48 rounded-md flex-shrink-0" />
        ) : (
          <div className="h-48 w-48 rounded-md overflow-hidden shadow-lg flex-shrink-0">
            <img 
              src={playlist.image} 
              alt={playlist.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Playlist Info */}
        <div className="flex flex-col justify-end">
          <div className="text-sm uppercase font-semibold text-white/80">
            {loading ? <Skeleton className="h-5 w-20" /> : 'Playlist'}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mt-1 mb-2">
            {loading ? <Skeleton className="h-10 w-48" /> : playlist.name}
          </h1>
          <div className="text-sm text-white/80 mb-1">
            {loading ? (
              <Skeleton className="h-4 w-80" />
            ) : (
              <div>{playlist.description}</div>
            )}
          </div>
          <div className="text-sm text-white/90 mt-2 flex items-center gap-2">
            {loading ? (
              <Skeleton className="h-4 w-60" />
            ) : (
              <>
                <span className="font-semibold">{playlist.creator}</span>
                <span>•</span>
                <span>{playlist.followers.toLocaleString()} followers</span>
                <span>•</span>
                <span>{playlist.totalTracks} songs</span>
                <span>•</span>
                <span>{formatDuration(playlist.duration)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 p-6 bg-background/50">
        <Button 
          onClick={handlePlayAll}
          variant="default" 
          size="sm" 
          className="gap-1"
          disabled={loading || playlist.tracks.length === 0}
        >
          <Play size={16} /> Play
        </Button>
        <Button variant="outline" size="icon" className="rounded-full">
          <Heart size={16} className="text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Download size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 size={16} />
        </Button>
        <div className="flex-grow"></div>
        <Button variant="ghost" size="sm">
          <Plus size={16} className="mr-1" /> Add to playlist
        </Button>
      </div>
      
      <Separator />

      {/* Tracklist */}
      <ScrollArea className="flex-grow">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8" />
                <div className="flex-grow">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-muted-foreground text-sm border-b">
                  <th className="w-12 text-center font-normal pb-3">#</th>
                  <th className="text-left font-normal pb-3">Title</th>
                  <th className="text-left font-normal pb-3 hidden md:table-cell">Album</th>
                  <th className="text-left font-normal pb-3 hidden md:table-cell w-32">Date added</th>
                  <th className="text-right font-normal pb-3 w-16">
                    <Clock size={16} />
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {playlist.tracks.map((track, index) => {
                  const isActive = currentTrack?.id === track.id;
                  return (
                    <tr 
                      key={track.id} 
                      className={cn(
                        "group hover:bg-muted/50 transition-colors",
                        isActive && "bg-muted/60"
                      )}
                    >
                      <td className="py-3 text-center">
                        <div className="relative flex items-center justify-center w-full h-full">
                          <span className="group-hover:hidden">
                            {index + 1}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hidden group-hover:flex h-8 w-8"
                            onClick={() => handlePlayTrack(track, index)}
                          >
                            <Play size={16} />
                          </Button>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className={cn(
                              "font-medium line-clamp-1",
                              isActive && "text-primary"
                            )}>
                              {track.name.length > 30 ? (
                                <MarqueeText text={track.name} />
                              ) : track.name}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{track.artist}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell text-muted-foreground text-sm">
                        <div className="line-clamp-1">{track.album}</div>
                      </td>
                      <td className="py-3 hidden md:table-cell text-muted-foreground text-sm">
                        {new Date().toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right text-muted-foreground text-sm">
                        {formatDuration(track.duration)}
                      </td>
                      <td className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Add to queue</DropdownMenuItem>
                            <DropdownMenuItem>Add to playlist</DropdownMenuItem>
                            <DropdownMenuItem>Go to artist</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
