import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Disc, Mic2, PlaySquare, ListMusic, Loader2 } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';
import BrowseGenres from './BrowseGenres';
import SearchResultTracks from './SearchResultTracks';
import SearchResultArtists from './SearchResultArtists';
import SearchResultAlbums from './SearchResultAlbums';
import SearchResultPlaylists from './SearchResultPlaylists';
import musicService from '../../services/musicService';

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
      
      const results = await musicService.search(searchQuery, activeTab === 'all' ? 'all' : activeTab);
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
      const results = await musicService.search(genreName, 'tracks');
      setSearchResults(results);
    } catch (error) {
      console.error('Genre search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All', icon: <SearchIcon className="h-4 w-4 mr-2" /> },
    { id: 'tracks', label: 'Songs', icon: <Disc className="h-4 w-4 mr-2" /> },
    { id: 'artists', label: 'Artists', icon: <Mic2 className="h-4 w-4 mr-2" /> },
    { id: 'albums', label: 'Albums', icon: <PlaySquare className="h-4 w-4 mr-2" /> },
    { id: 'playlists', label: 'Playlists', icon: <ListMusic className="h-4 w-4 mr-2" /> }
  ];

  const hasSearchResults = Object.values(searchResults).some(arr => arr.length > 0);

  return (
    <div className="space-y-8 pb-20">
      {!query ? (
        // Browse page when no search - load genres from music service
        <div className="container mx-auto px-0 md:px-2 lg:px-4">
          <BrowseGenres onGenreClick={handleGenreClick} />
        </div>
      ) : (
        // Search results
        <div>
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground flex-1 flex items-center gap-3">
              {loading ? (
                <>
                  <span>Searching for "{query}"</span>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </>
              ) : (
                <span>Results for "<span className="text-primary">{query}</span>"</span>
              )}
            </h1>
          </div>

          {/* Search Results */}
          <div className="relative">
            {/* Decoration elements */}
            <div className="absolute -top-12 -left-6 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-70 -z-10" />
            <div className="absolute top-40 right-6 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl opacity-60 -z-10" />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-8 p-1 bg-background/50 backdrop-blur-sm border border-white/5 rounded-full w-fit">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className={cn(
                      "rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 px-4",
                      "transition-all duration-300 flex items-center"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-10 animate-in fade-in-50 duration-500">
                {searchResults.tracks.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Songs</h2>
                      {searchResults.tracks.length > 6 && (
                        <button 
                          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center"
                          onClick={() => setActiveTab('tracks')}
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <SearchResultTracks 
                      tracks={searchResults.tracks.slice(0, 6)} 
                      onPlayTrack={handlePlayTrack} 
                    />
                  </section>
                )}

                {searchResults.artists.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Artists</h2>
                      {searchResults.artists.length > 6 && (
                        <button 
                          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center"
                          onClick={() => setActiveTab('artists')}
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <SearchResultArtists artists={searchResults.artists.slice(0, 6)} />
                  </section>
                )}

                {searchResults.albums.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Albums</h2>
                      {searchResults.albums.length > 6 && (
                        <button 
                          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center"
                          onClick={() => setActiveTab('albums')}
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <SearchResultAlbums albums={searchResults.albums.slice(0, 6)} />
                  </section>
                )}

                {searchResults.playlists.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-foreground">Playlists</h2>
                      {searchResults.playlists.length > 6 && (
                        <button 
                          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors flex items-center"
                          onClick={() => setActiveTab('playlists')}
                        >
                          View all
                        </button>
                      )}
                    </div>
                    <SearchResultPlaylists playlists={searchResults.playlists.slice(0, 6)} />
                  </section>
                )}
              </TabsContent>

              <TabsContent value="tracks" className="animate-in fade-in-50 duration-500">
                <SearchResultTracks tracks={searchResults.tracks} onPlayTrack={handlePlayTrack} />
              </TabsContent>

              <TabsContent value="artists" className="animate-in fade-in-50 duration-500">
                <SearchResultArtists artists={searchResults.artists} />
              </TabsContent>

              <TabsContent value="albums" className="animate-in fade-in-50 duration-500">
                <SearchResultAlbums albums={searchResults.albums} />
              </TabsContent>

              <TabsContent value="playlists" className="animate-in fade-in-50 duration-500">
                <SearchResultPlaylists playlists={searchResults.playlists} />
              </TabsContent>
            </Tabs>
            
            {/* No Results */}
            {!loading && query && !hasSearchResults && (
              <div className="text-center py-16 bg-card/30 border border-white/5 rounded-xl">
                <SearchIcon className="h-20 w-20 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-medium text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any matches for "{query}". 
                  Try checking your spelling or using different keywords.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
