import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import BrowseGenres from './BrowseGenres';
import SearchResultTracks from './SearchResultTracks';
import SearchResultArtists from './SearchResultArtists';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState({
    tracks: [],
    artists: [],
    albums: [],
    playlists: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { playTrack } = usePlayer();

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      // Reset results on error
      setSearchResults({
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track) => {
    playTrack(track, searchResults.tracks);
  };

  const handleGenreClick = async (genreName) => {
    setQuery(genreName);
    try {
      setLoading(true);
      setSearchResults({
        tracks: results,
        artists: [],
        albums: [],
        playlists: []
      });
    } catch (error) {
      console.error('Genre search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'tracks', label: 'Songs' },
    { id: 'artists', label: 'Artists' },
    { id: 'albums', label: 'Albums' },
    { id: 'playlists', label: 'Playlists' }
  ];

  return (
    <div className="space-y-6">
      {!query ? (
        // Browse page when no search - load genres from music service
        <BrowseGenres onGenreClick={handleGenreClick} />
      ) : (
        // Search results
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              Search results for "{query}"
            </h1>
            {loading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            )}
          </div>

          {/* Search Results */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {searchResults.tracks.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-4">Songs</h2>
                  <SearchResultTracks 
                    tracks={searchResults.tracks.slice(0, 6)} 
                    onPlayTrack={handlePlayTrack} 
                  />
                </section>
              )}

              {searchResults.artists.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-4">Artists</h2>
                  <SearchResultArtists artists={searchResults.artists.slice(0, 6)} />
                </section>
              )}
            </TabsContent>

            <TabsContent value="tracks">
              <SearchResultTracks tracks={searchResults.tracks} onPlayTrack={handlePlayTrack} />
            </TabsContent>

            <TabsContent value="artists">
              <SearchResultArtists artists={searchResults.artists} />
            </TabsContent>

            <TabsContent value="albums">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Albums component would go here */}
                <p className="text-muted-foreground">Albums results coming soon...</p>
              </div>
            </TabsContent>

            <TabsContent value="playlists">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Playlists component would go here */}
                <p className="text-muted-foreground">Playlists results coming soon...</p>
              </div>
            </TabsContent>

            {!loading && query && Object.values(searchResults).every(arr => arr.length === 0) && (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try searching for something else or check your spelling
                </p>
              </div>
            )}
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Search;
