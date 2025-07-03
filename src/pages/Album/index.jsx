import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Heart, Share2, MoreHorizontal, Clock, ExternalLink } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import MarqueeText from '../../components/ui/marquee-text';
import musicService from '../../services/musicService';
import { cn, formatDuration } from '../../lib/utils';

// Mock album data for initial render
const mockAlbum = {
  id: 'album-1',
  name: 'Album Name',
  artist: 'Artist Name',
  artistId: 'artist-1',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
  releaseDate: '2023',
  tracks: [],
  totalTracks: 0,
  duration: 0,
  genre: 'Pop',
  label: 'Record Label',
  copyright: '© 2023 Record Label',
  description: 'Loading album information...'
};

export default function Album() {
  const { id } = useParams();
  const { currentTrack, setTrack, isPlaying, togglePlayPause } = usePlayer();
  const [album, setAlbum] = useState(mockAlbum);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      setLoading(true);
      try {
        // For mock implementation, we'll use hardcoded data
        // In a real app, this would be fetched from the musicService
        const albumDetails = await fetchAlbumData(id);
        setAlbum(albumDetails);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch album:', err);
        setError('Failed to load album information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
  }, [id]);

  const handlePlayTrack = (track, index) => {
    setTrack(track, album.tracks, index);
    if (!isPlaying) togglePlayPause();
  };

  const handlePlayAlbum = () => {
    if (album.tracks.length > 0) {
      setTrack(album.tracks[0], album.tracks, 0);
      if (!isPlaying) togglePlayPause();
    }
  };

  // Fetch album data using the music service
  const fetchAlbumData = async (albumId) => {
    try {
      const albumDetails = await musicService.getAlbumDetails(albumId);
      
      if (!albumDetails) {
        throw new Error('Album not found');
      }
      
      // Calculate total duration if not provided
      if (!albumDetails.duration && albumDetails.tracks) {
        albumDetails.duration = albumDetails.tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
      }
      
      // Set default values for missing fields
      return {
        ...albumDetails,
        totalTracks: albumDetails.tracks?.length || 0,
        genre: albumDetails.genre || 'Unknown',
        label: albumDetails.label || 'Unknown Label',
        copyright: albumDetails.copyright || `© ${new Date().getFullYear()} Music Label`,
        description: albumDetails.description || 'No description available'
      };
    } catch (error) {
      console.error('Error fetching album details:', error);
      throw error;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-2xl font-bold mb-4">😢 Oops!</div>
        <div className="text-muted-foreground mb-6">{error}</div>
        <Button asChild>
          <Link to="/search">Back to Search</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Album Header */}
      <div className="relative flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-b from-muted/60 to-background">
        {/* Album Cover Image */}
        {loading ? (
          <Skeleton className="h-48 w-48 rounded-md flex-shrink-0" />
        ) : (
          <div className="h-48 w-48 rounded-md overflow-hidden shadow-lg flex-shrink-0">
            <img 
              src={album.image} 
              alt={album.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Album Info */}
        <div className="flex flex-col justify-end">
          <div className="text-sm uppercase font-semibold text-muted-foreground">
            {loading ? <Skeleton className="h-5 w-20" /> : 'Album'}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mt-1 mb-2">
            {loading ? <Skeleton className="h-10 w-48" /> : album.name}
          </h1>
          <div className="text-sm flex items-center gap-2 mb-1">
            {loading ? (
              <Skeleton className="h-4 w-80" />
            ) : (
              <>
                <Link to={`/artist/${album.artistId}`} className="font-semibold hover:underline">
                  {album.artist}
                </Link>
                <span>•</span>
                <span>{album.releaseDate}</span>
                <span>•</span>
                <span>{album.totalTracks} songs</span>
                <span>•</span>
                <span>{formatDuration(album.duration)}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {loading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              album.genre.split(',').map((genre, i) => (
                <Badge key={i} variant="outline" className="bg-muted/60">
                  {genre.trim()}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 p-6 pt-0">
        <Button 
          onClick={handlePlayAlbum}
          variant="default" 
          size="sm" 
          className="gap-1"
          disabled={loading || album.tracks.length === 0}
        >
          <Play size={16} /> Play
        </Button>
        <Button variant="outline" size="icon" className="rounded-full">
          <Heart size={16} className="text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Share2 size={16} />
        </Button>
        <div className="flex-grow"></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Add to playlist</DropdownMenuItem>
            <DropdownMenuItem>View artist</DropdownMenuItem>
            <DropdownMenuItem>Copy album link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
                  <th className="text-right font-normal pb-3 w-16">
                    <Clock size={16} />
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {album.tracks.map((track, index) => {
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
                            {track.trackNumber || index + 1}
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
                        <div className={cn(
                          "font-medium line-clamp-1",
                          isActive && "text-primary"
                        )}>
                          {track.name.length > 30 ? (
                            <MarqueeText text={track.name} />
                          ) : track.name}
                        </div>
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

            {/* Album metadata */}
            <div className="mt-8 text-sm text-muted-foreground space-y-2">
              <div>
                <span className="font-medium">Released:</span> {album.releaseDate}
              </div>
              <div>
                <span className="font-medium">Label:</span> {album.label}
              </div>
              <div>
                <span className="font-medium">Copyright:</span> {album.copyright}
              </div>
              {album.description && (
                <div className="mt-4">
                  <p>{album.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
