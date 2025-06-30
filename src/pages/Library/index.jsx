import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Grid3X3, List, SortAsc, SortDesc } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import musicService from '../../services/musicService';

const Library = () => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'alphabetical', 'creator'
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'playlists', 'artists', 'albums'
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryItems, setLibraryItems] = useState([]);
  const { playTrack } = usePlayer();

  useEffect(() => {
    loadLibraryItems();
  }, []);

  const loadLibraryItems = async () => {
    try {
      // Load user's library items from the music service
      const [playlists, savedTracks] = await Promise.all([
        musicService.getUserPlaylists(10),
        musicService.getUserSavedTracks(20)
      ]);

      // Convert to library format
      const playlistItems = playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        type: 'playlist',
        image: playlist.images?.[0]?.url || '',
        creator: playlist.owner?.display_name || 'Unknown',
        tracks: playlist.tracks?.total || 0,
        lastPlayed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        description: playlist.description || ''
      }));

      // Add some mock liked songs as an album-like item
      const likedSongs = {
        id: 'liked-songs',
        name: 'Liked Songs',
        type: 'playlist',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        creator: 'You',
        tracks: savedTracks.length,
        lastPlayed: new Date(),
        description: 'Your favorite tracks'
      };

      setLibraryItems([likedSongs, ...playlistItems]);
    } catch (error) {
      console.error('Failed to load library items:', error);
    }
  };

  const filteredItems = libraryItems
    .filter(item => {
      if (filterBy === 'all') return true;
      return item.type === filterBy.slice(0, -1); // Remove 's' from plural
    })
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.creator.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'creator':
          return a.creator.localeCompare(b.creator);
        case 'recent':
        default:
          return new Date(b.lastPlayed) - new Date(a.lastPlayed);
      }
    });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' }
  ];

  const sortOptions = [
    { id: 'recent', label: 'Recently Played' },
    { id: 'alphabetical', label: 'Alphabetical' },
    { id: 'creator', label: 'Creator' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Your Library</h1>
        <Button className="space-x-2">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Create Playlist</span>
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search in Your Library"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-4">
          {/* Filters */}
          <Tabs value={filterBy} onValueChange={setFilterBy} className="w-auto">
            <TabsList>
              {filters.map((filter) => (
                <TabsTrigger key={filter.id} value={filter.id}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background border border-input rounded-lg px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View Mode */}
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-8 w-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Library Items */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredItems.map((item, index) => (
            <LibraryCard key={index} item={item} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item, index) => (
            <LibraryListItem key={index} item={item} />
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">
            {searchQuery ? 'No results found' : 'Your library is empty'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? 'Try searching for something else' 
              : 'Start by saving some music you like'
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Library Card Component for Grid View
const LibraryCard = ({ item }) => {
  const getItemLink = () => {
    switch (item.type) {
      case 'playlist':
        return `/playlist/${item.id}`;
      case 'album':
        return `/album/${item.id}`;
      case 'artist':
        return `/artist/${item.id}`;
      default:
        return '#';
    }
  };

  return (
    <Link to={getItemLink()}>
      <Card className="group transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="relative mb-4">
            <img
              src={item.image}
              alt={item.name}
              className={cn(
                "w-full aspect-square object-cover",
                item.type === 'artist' ? 'rounded-full' : 'rounded-lg'
              )}
            />
          </div>
          <h3 className="font-medium text-foreground truncate mb-1">{item.name}</h3>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs capitalize">
              {item.type}
            </Badge>
            <span className="text-sm text-muted-foreground truncate">• {item.creator}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Library List Item Component for List View
const LibraryListItem = ({ item }) => {
  const getItemLink = () => {
    switch (item.type) {
      case 'playlist':
        return `/playlist/${item.id}`;
      case 'album':
        return `/album/${item.id}`;
      case 'artist':
        return `/artist/${item.id}`;
      default:
        return '#';
    }
  };

  return (
    <Link to={getItemLink()}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="flex items-center space-x-4 p-3">
          <img
            src={item.image}
            alt={item.name}
            className={cn(
              "h-12 w-12 object-cover",
              item.type === 'artist' ? 'rounded-full' : 'rounded'
            )}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{item.name}</h3>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs capitalize">
                {item.type}
              </Badge>
              <span className="text-sm text-muted-foreground truncate">• {item.creator}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(item.lastPlayed).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Library;
