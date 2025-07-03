import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Heart, Share2, MoreHorizontal, Music, Disc, Radio, Clock } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import MarqueeText from '../../components/ui/marquee-text';
import musicService from '../../services/musicService';
import { cn, formatDuration, abbreviateNumber } from '../../lib/utils';

// Mock artist data for initial render
const mockArtist = {
  id: 'artist-1',
  name: 'Artist Name',
  image: 'https://images.unsplash.com/photo-1604435585148-6d8d58c107a4?w=500&h=500&fit=crop',
  bannerImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=400&fit=crop',
  biography: 'Loading artist information...',
  monthlyListeners: 0,
  followers: 0,
  topTracks: [],
  albums: [],
  singles: [],
  relatedArtists: []
};

export default function ArtistProfile() {
  const { id } = useParams();
  const { currentTrack, setTrack, isPlaying, togglePlayPause } = usePlayer();
  const [artist, setArtist] = useState(mockArtist);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchArtistDetails = async () => {
      setLoading(true);
      try {
        // For mock implementation, we'll use hardcoded data
        // In a real app, this would be fetched from the musicService
        const artistDetails = await fetchArtistData(id);
        setArtist(artistDetails);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch artist:', err);
        setError('Failed to load artist information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [id]);

  const handlePlayTrack = (track, allTracks, index) => {
    setTrack(track, allTracks, index);
    if (!isPlaying) togglePlayPause();
  };

  const handlePlayPopular = () => {
    if (artist.topTracks.length > 0) {
      setTrack(artist.topTracks[0], artist.topTracks, 0);
      if (!isPlaying) togglePlayPause();
    }
  };

  // Fetch artist data using the music service
  const fetchArtistData = async (artistId) => {
    try {
      const artistDetails = await musicService.getArtistDetails(artistId);
      
      if (!artistDetails || !artistDetails.artist) {
        throw new Error('Artist not found');
      }
      
      // Extract data from the response
      const { artist, topTracks, topAlbums, similarArtists } = artistDetails;
      
      // Split albums into albums and singles (singles have only one track)
      const albums = topAlbums?.filter(album => album.trackCount > 1) || [];
      const singles = topAlbums?.filter(album => album.trackCount === 1) || [];
      
      // Format artist data for our UI
      return {
        id: artistId,
        name: artist.name,
        image: artist.image || 'https://images.unsplash.com/photo-1604435585148-6d8d58c107a4?w=500&h=500&fit=crop',
        bannerImage: artist.bannerImage || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&h=400&fit=crop',
        biography: artist.description || 'No biography available for this artist.',
        monthlyListeners: artist.subscribers || Math.floor(Math.random() * 10000000) + 500000,
        followers: artist.subscribers || Math.floor(Math.random() * 1000000) + 100000,
        topTracks: topTracks?.map(track => ({
          id: track.id || `track-${Math.random().toString(36).substring(2, 9)}`,
          name: track.name || track.title || 'Unknown Track',
          artist: track.artist || artist.name,
          album: track.album || 'Unknown Album',
          duration: track.duration || 180,
          image: track.image || artist.image,
          youtube_id: track.videoId || track.youtube_id || track.id,
          plays: track.viewCount || Math.floor(Math.random() * 1000000)
        })) || [],
        albums: albums?.map(album => ({
          id: album.id || `album-${Math.random().toString(36).substring(2, 9)}`,
          name: album.name || album.title || 'Unknown Album',
          artist: album.artist || artist.name,
          releaseDate: album.year || new Date().getFullYear().toString(),
          image: album.image || 'https://picsum.photos/300/300',
          tracks: album.trackCount || 0
        })) || [],
        singles: singles?.map(single => ({
          id: single.id || `single-${Math.random().toString(36).substring(2, 9)}`,
          name: single.name || single.title || 'Unknown Single',
          artist: single.artist || artist.name,
          releaseDate: single.year || new Date().getFullYear().toString(),
          image: single.image || 'https://picsum.photos/300/300',
          tracks: 1
        })) || [],
        relatedArtists: similarArtists?.map(artist => ({
          id: artist.id || `artist-${Math.random().toString(36).substring(2, 9)}`,
          name: artist.name || 'Unknown Artist',
          image: artist.image || 'https://picsum.photos/300/300',
          monthlyListeners: artist.subscribers || Math.floor(Math.random() * 5000000) + 100000
        })) || []
      };
    } catch (error) {
      console.error('Error fetching artist details:', error);
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
      {/* Artist Header with Banner */}
      <div 
        className="relative h-72 md:h-96 bg-cover bg-center" 
        style={{ backgroundImage: `url(${artist.bannerImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/10"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row items-end md:items-center gap-6">
          {/* Artist Image */}
          {loading ? (
            <Skeleton className="h-36 w-36 md:h-48 md:w-48 rounded-full" />
          ) : (
            <div className="h-36 w-36 md:h-48 md:w-48 rounded-full overflow-hidden border-4 border-background">
              <img 
                src={artist.image} 
                alt={artist.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Artist Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                VERIFIED ARTIST
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-2 text-white">
              {loading ? <Skeleton className="h-10 w-48" /> : artist.name}
            </h1>
            <div className="text-sm text-white/80 flex items-center gap-3">
              {loading ? (
                <Skeleton className="h-4 w-60" />
              ) : (
                <>
                  <span>{abbreviateNumber(artist.monthlyListeners)} monthly listeners</span>
                  <span>•</span>
                  <span>{abbreviateNumber(artist.followers)} followers</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 p-6 bg-background/80">
        <Button 
          onClick={handlePlayPopular}
          variant="default" 
          size="sm" 
          className="gap-1"
          disabled={loading || artist.topTracks.length === 0}
        >
          <Play size={16} /> Play
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <Heart size={16} /> Follow
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
            <DropdownMenuItem>Copy artist link</DropdownMenuItem>
            <DropdownMenuItem>View in Last.fm</DropdownMenuItem>
            <DropdownMenuItem>Report this artist</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <Tabs 
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-grow flex flex-col"
      >
        <div className="px-6 border-b">
          <TabsList className="bg-transparent">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="discography">Discography</TabsTrigger>
            <TabsTrigger value="similar">Similar Artists</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-grow">
          <TabsContent value="overview" className="p-6 mt-0 space-y-8">
            {/* Popular Tracks Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Popular</h2>
              
              {loading ? (
                <div className="space-y-4">
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
                <div className="space-y-1">
                  {artist.topTracks.slice(0, 5).map((track, index) => {
                    const isActive = currentTrack?.id === track.id;
                    return (
                      <div 
                        key={track.id}
                        onClick={() => handlePlayTrack(track, artist.topTracks, index)}
                        className={cn(
                          "flex items-center gap-4 p-2 rounded-md group hover:bg-muted/80 cursor-pointer",
                          isActive && "bg-muted"
                        )}
                      >
                        <div className="w-6 text-center text-muted-foreground">
                          <div className="relative flex items-center justify-center w-full h-full">
                            <span className="group-hover:hidden">
                              {index + 1}
                            </span>
                            <Play size={14} className="hidden group-hover:block" />
                          </div>
                        </div>
                        
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className={cn(
                            "font-medium truncate",
                            isActive && "text-primary"
                          )}>
                            {track.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {abbreviateNumber(track.plays)} plays
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(track.duration)}
                        </div>
                      </div>
                    );
                  })}
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setActiveTab('discography')}
                  >
                    Show all tracks
                  </Button>
                </div>
              )}
            </div>
            
            {/* Albums & Singles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Discography</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('discography')}
                >
                  Show all
                </Button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="bg-background">
                      <CardContent className="p-4">
                        <Skeleton className="h-40 w-full mb-3" />
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {artist.albums.slice(0, 5).map(album => (
                    <Link 
                      key={album.id} 
                      to={`/album/${album.id}`}
                      className="group"
                    >
                      <Card className="bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-md mb-3 overflow-hidden relative group">
                            <img 
                              src={album.image} 
                              alt={album.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg">
                                <Play size={20} />
                              </Button>
                            </div>
                          </div>
                          <div className="font-medium line-clamp-1">{album.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {album.releaseDate} • Album
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Related Artists */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Fans also like</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('similar')}
                >
                  Show all
                </Button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-background">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <Skeleton className="h-28 w-28 rounded-full mb-3" />
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {artist.relatedArtists.map(relatedArtist => (
                    <Link 
                      key={relatedArtist.id} 
                      to={`/artist/${relatedArtist.id}`}
                      className="group"
                    >
                      <Card className="bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <div className="h-28 w-28 rounded-full overflow-hidden mb-3 relative">
                            <img 
                              src={relatedArtist.image} 
                              alt={relatedArtist.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="font-medium line-clamp-1">{relatedArtist.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Artist
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="discography" className="p-6 mt-0 space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Albums</h2>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="bg-background">
                      <CardContent className="p-4">
                        <Skeleton className="h-40 w-full mb-3" />
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artist.albums.map(album => (
                    <Link 
                      key={album.id} 
                      to={`/album/${album.id}`}
                      className="group"
                    >
                      <Card className="bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-md mb-3 overflow-hidden relative group">
                            <img 
                              src={album.image} 
                              alt={album.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg">
                                <Play size={20} />
                              </Button>
                            </div>
                          </div>
                          <div className="font-medium line-clamp-1">{album.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {album.releaseDate} • {album.tracks} tracks
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">Singles</h2>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="bg-background">
                      <CardContent className="p-4">
                        <Skeleton className="h-40 w-full mb-3" />
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {artist.singles.map(single => (
                    <Link 
                      key={single.id} 
                      to={`/album/${single.id}`}
                      className="group"
                    >
                      <Card className="bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-md mb-3 overflow-hidden relative group">
                            <img 
                              src={single.image} 
                              alt={single.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg">
                                <Play size={20} />
                              </Button>
                            </div>
                          </div>
                          <div className="font-medium line-clamp-1">{single.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {single.releaseDate} • Single
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">All Tracks</h2>
              
              {loading ? (
                <div className="space-y-4">
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
                <div className="space-y-1">
                  {artist.topTracks.map((track, index) => {
                    const isActive = currentTrack?.id === track.id;
                    return (
                      <div 
                        key={track.id}
                        onClick={() => handlePlayTrack(track, artist.topTracks, index)}
                        className={cn(
                          "flex items-center gap-4 p-2 rounded-md group hover:bg-muted/80 cursor-pointer",
                          isActive && "bg-muted"
                        )}
                      >
                        <div className="w-6 text-center text-muted-foreground">
                          <div className="relative flex items-center justify-center w-full h-full">
                            <span className="group-hover:hidden">
                              {index + 1}
                            </span>
                            <Play size={14} className="hidden group-hover:block" />
                          </div>
                        </div>
                        
                        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className={cn(
                            "font-medium truncate",
                            isActive && "text-primary"
                          )}>
                            {track.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {track.album}
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {formatDuration(track.duration)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="similar" className="p-6 mt-0">
            <h2 className="text-2xl font-bold mb-6">Similar Artists</h2>
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Card key={i} className="bg-background">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <Skeleton className="h-32 w-32 rounded-full mb-3" />
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {artist.relatedArtists.concat(artist.relatedArtists).map((relatedArtist, index) => (
                  <Link 
                    key={`${relatedArtist.id}-${index}`}
                    to={`/artist/${relatedArtist.id}`}
                    className="group"
                  >
                    <Card className="bg-background hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <div className="h-32 w-32 rounded-full overflow-hidden mb-3 relative">
                          <img 
                            src={relatedArtist.image} 
                            alt={relatedArtist.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-medium line-clamp-1">{relatedArtist.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {abbreviateNumber(relatedArtist.monthlyListeners)} monthly listeners
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="about" className="p-6 mt-0">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">About</h2>
              
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
              ) : (
                <>
                  <div className="prose prose-invert max-w-none mb-8">
                    <h3 className="text-xl font-semibold mb-4">Biography</h3>
                    <p>{artist.biography}</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Phasellus euismod, nunc vel tincidunt lacinia, nisi nisl aliquam nisl, vel aliquam nisl nisl sit amet nisl. Nulla facilisi. Phasellus euismod, nunc vel tincidunt lacinia, nisi nisl aliquam nisl, vel aliquam nisl nisl sit amet nisl.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Phasellus euismod, nunc vel tincidunt lacinia, nisi nisl aliquam nisl, vel aliquam nisl nisl sit amet nisl.</p>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Monthly Listeners</div>
                        <div className="text-2xl font-bold">{artist.monthlyListeners.toLocaleString()}</div>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground">Followers</div>
                        <div className="text-2xl font-bold">{artist.followers.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Where people listen</h3>
                    <div className="space-y-3">
                      {["New York, USA", "London, UK", "Tokyo, Japan", "Sydney, Australia", "Berlin, Germany"].map((city, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span>{i+1}. {city}</span>
                          <span className="text-sm text-muted-foreground">
                            {abbreviateNumber(Math.floor(Math.random() * 500000) + 100000)} listeners
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
