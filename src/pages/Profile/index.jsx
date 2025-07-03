import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Settings, Share2, User, Music, Disc, ListMusic, Clock, Calendar, BarChart, Play, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import musicService from '../../services/musicService';

// Mock profile data
const mockUserData = {
  name: 'User',
  username: 'user',
  profileImage: 'https://github.com/shadcn.png',
  bio: 'Music enthusiast',
  following: 0,
  followers: 0,
  playlists: [],
  recentlyPlayed: [],
  topArtists: [],
  topTracks: [],
  joinedDate: new Date().toLocaleDateString()
};

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(mockUserData);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('short_term'); // short_term, medium_term, long_term

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Get data from our music service
        const [recentlyPlayed, topArtists, topTracks] = await Promise.all([
          musicService.getRecentlyPlayed(12),
          musicService.getTopArtists(8),
          musicService.getTopTracks(10)
        ]);
        
        // Get playlists - since we don't have a direct method for user playlists,
        // we'll use featured playlists from the home data
        let playlists = [];
        try {
          const homeData = await musicService.getHomeData();
          playlists = homeData.featuredPlaylists.slice(0, 6).map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            image: playlist.image || `https://picsum.photos/seed/${playlist.id}/300/300`,
            tracks: playlist.trackCount || Math.floor(Math.random() * 50) + 5,
            description: playlist.description || 'Featured playlist'
          }));
        } catch (error) {
          console.error('Error fetching playlists:', error);
          // Create mock playlists as fallback
          playlists = Array.from({ length: 6 }, (_, i) => ({
            id: `playlist-${i}`,
            name: `My Playlist ${i + 1}`,
            image: `https://picsum.photos/seed/${i+100}/300/300`,
            tracks: Math.floor(Math.random() * 50) + 5,
            description: 'Created by you'
          }));
        }

        // Format artists data
        const formattedArtists = topArtists?.artists?.map(artist => ({
          id: artist.id,
          name: artist.name,
          image: artist.image || `https://picsum.photos/seed/${artist.id}/300/300`,
          genre: artist.genre || 'Music'
        })) || [];
        
        // Format tracks data
        const formattedTracks = topTracks?.tracks?.map(track => ({
          id: track.id,
          name: track.name || track.title,
          artist: track.artist,
          image: track.image || `https://picsum.photos/seed/${track.id}/300/300`,
          album: track.album || 'Unknown Album',
          duration: track.duration || 180
        })) || [];
        
        // Update user data with real user info and API data
        setUserData({
          name: user?.displayName || 'User',
          username: user?.email?.split('@')[0] || 'user',
          profileImage: user?.photoURL || 'https://github.com/shadcn.png',
          bio: 'Music enthusiast and playlist curator',
          following: 42,
          followers: 18,
          playlists: playlists,
          recentlyPlayed: recentlyPlayed.tracks || [],
          topArtists: formattedArtists,
          topTracks: formattedTracks,
          joinedDate: new Date().toLocaleDateString()
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Get the appropriate data based on the selected time range
  const getTimeRangeData = (dataType) => {
    // In a real app, we would have different data for different time ranges
    // For this mock, we'll just return the same data but with a different sort
    if (dataType === 'artists') {
      return [...userData.topArtists].sort(() => timeRange === 'short_term' ? 0.5 - Math.random() : Math.random() - 0.5);
    } else {
      return [...userData.topTracks].sort(() => timeRange === 'short_term' ? 0.5 - Math.random() : Math.random() - 0.5);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-b from-muted/60 to-background p-6">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          {/* Profile Image */}
          {loading ? (
            <Skeleton className="h-32 w-32 rounded-full" />
          ) : (
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={userData.profileImage} alt={userData.name} />
              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}

          {/* Profile Info */}
          <div className="flex flex-col text-center md:text-left">
            <div className="text-sm uppercase font-semibold text-muted-foreground mb-1">
              Profile
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {loading ? <Skeleton className="h-10 w-48" /> : userData.name}
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
              {loading ? (
                <Skeleton className="h-5 w-60" />
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <span><strong>{userData.playlists.length}</strong> Playlists</span>
                    <span><strong>{userData.following}</strong> Following</span>
                    <span><strong>{userData.followers}</strong> Followers</span>
                  </div>
                  <div className="hidden md:block text-muted-foreground">•</div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar size={14} />
                    <span>Joined {userData.joinedDate}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-grow"></div>
          
          {/* Action buttons */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <Link to="/settings" key="settings-link">
                <Edit2 size={14} /> Edit profile
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs 
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-grow flex flex-col"
      >
        <div className="px-6 border-b">
          <TabsList className="bg-transparent">
            <TabsTrigger key="overview-tab" value="overview">Overview</TabsTrigger>
            <TabsTrigger key="playlists-tab" value="playlists">Playlists</TabsTrigger>
            <TabsTrigger key="artists-tab" value="artists">Artists</TabsTrigger>
            <TabsTrigger key="tracks-tab" value="tracks">Tracks</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-grow">
          <TabsContent value="overview" className="p-6 mt-0 space-y-8">
            {/* Recently Played Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Recently played</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  asChild
                >
                  <Link to="/recent" key="recent-link">
                    Show all
                  </Link>
                </Button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {userData.recentlyPlayed.slice(0, 6).map((item) => (
                    <Link 
                      key={item.id} 
                      to={`/album/${item.albumId || 'album-1'}`}
                      className="group"
                    >
                      <Card className="bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-md mb-3 overflow-hidden relative group">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg">
                                <Play size={20} />
                              </Button>
                            </div>
                          </div>
                          <div className="font-medium line-clamp-1">{item.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {item.artist}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Top Artists Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your top artists</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('artists')}
                >
                  Show all
                </Button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userData.topArtists.slice(0, 4).map((artist) => (
                    <Link 
                      key={artist.id} 
                      to={`/artist/${artist.id}`}
                      className="group"
                    >
                      <Card className="bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                          <div className="h-32 w-32 rounded-full overflow-hidden mb-3 relative">
                            <img 
                              src={artist.image} 
                              alt={artist.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="font-medium line-clamp-1">{artist.name}</div>
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
            
            {/* Your Playlists Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Your playlists</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('playlists')}
                >
                  Show all
                </Button>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {userData.playlists.map((playlist) => (
                    <Link 
                      key={playlist.id} 
                      to={`/playlist/${playlist.id}`}
                      className="group"
                    >
                      <Card className="bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="aspect-square rounded-md mb-3 overflow-hidden relative group">
                            <img 
                              src={playlist.image} 
                              alt={playlist.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg">
                                <Play size={20} />
                              </Button>
                            </div>
                          </div>
                          <div className="font-medium line-clamp-1">{playlist.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {playlist.tracks} songs
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="p-6 mt-0">
            <h2 className="text-2xl font-bold mb-6">Your playlists</h2>
            
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Create Playlist Card */}
                <div key="create-playlist">
                  <Card className="bg-background border-dashed">
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full aspect-square">
                      <div className="rounded-full bg-muted/50 p-4 mb-4">
                        <Plus size={24} className="text-primary" />
                      </div>
                      <div className="font-medium">Create new playlist</div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Liked Songs Playlist */}
                <Link to="/liked" key="liked-songs">
                  <Card className="bg-gradient-to-br from-blue-600 to-purple-700">
                    <CardContent className="p-4 h-full aspect-square flex flex-col justify-end">
                      <div className="font-bold text-lg text-white">Liked Songs</div>
                      <div className="text-sm text-white/80">
                        {userData.topTracks.length} songs
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                {/* User Playlists */}
                {userData.playlists.map((playlist) => (
                  <Link 
                    key={playlist.id} 
                    to={`/playlist/${playlist.id}`}
                    className="group"
                  >
                    <Card className="bg-background hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="aspect-square rounded-md mb-3 overflow-hidden relative group">
                          <img 
                            src={playlist.image} 
                            alt={playlist.name} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" className="rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-lg">
                              <Play size={20} />
                            </Button>
                          </div>
                        </div>
                        <div className="font-medium line-clamp-1">{playlist.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {playlist.tracks} songs
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="artists" className="p-6 mt-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Top artists</h2>
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button 
                  key="short-term-button"
                  variant={timeRange === 'short_term' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setTimeRange('short_term')}
                >
                  4 weeks
                </Button>
                <Separator key="separator-1" orientation="vertical" className="h-6" />
                <Button 
                  key="medium-term-button"
                  variant={timeRange === 'medium_term' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setTimeRange('medium_term')}
                >
                  6 months
                </Button>
                <Separator key="separator-2" orientation="vertical" className="h-6" />
                <Button 
                  key="long-term-button"
                  variant={timeRange === 'long_term' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setTimeRange('long_term')}
                >
                  All time
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Card key={i} className="bg-background">
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <Skeleton className="h-36 w-36 rounded-full mb-3" />
                      <Skeleton className="h-5 w-full mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {getTimeRangeData('artists').map((artist, index) => (
                  <Link 
                    key={artist.id} 
                    to={`/artist/${artist.id}`}
                    className="group"
                  >
                    <Card className="bg-background hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4 flex flex-col items-center text-center relative">
                        <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="h-36 w-36 rounded-full overflow-hidden mb-3 relative">
                          <img 
                            src={artist.image} 
                            alt={artist.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="font-medium line-clamp-1">{artist.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Artist
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="tracks" className="p-6 mt-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Top tracks</h2>
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button 
                  key="short-term-tracks-button"
                  variant={timeRange === 'short_term' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setTimeRange('short_term')}
                >
                  4 weeks
                </Button>
                <Separator key="tracks-separator-1" orientation="vertical" className="h-6" />
                <Button 
                  key="medium-term-tracks-button"
                  variant={timeRange === 'medium_term' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setTimeRange('medium_term')}
                >
                  6 months
                </Button>
                <Separator key="tracks-separator-2" orientation="vertical" className="h-6" />
                <Button 
                  key="long-term-tracks-button"
                  variant={timeRange === 'long_term' ? 'secondary' : 'ghost'} 
                  size="sm"
                  className="rounded-none"
                  onClick={() => setTimeRange('long_term')}
                >
                  All time
                </Button>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8" />
                    <div className="h-12 w-12">
                      <Skeleton className="h-full w-full" />
                    </div>
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
                {getTimeRangeData('tracks').map((track, index) => (
                  <div 
                    key={track.id}
                    className="flex items-center gap-4 p-2 rounded-md group hover:bg-muted/80 cursor-pointer"
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
                      <div className="font-medium truncate">
                        {track.name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {track.artist}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {track.album}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
