import ytMusicApi from './ytMusicApi.js';
import lastFmApi from './lastFmApi.js';

// Main music service that uses YouTube Music API for all functionality
// and Last.fm API for enhanced metadata
class MusicService {
  constructor() {
    this.ytmusic = ytMusicApi;
    this.lastfm = lastFmApi;
  }

  // Search functionality across all types
  async search(query, type = 'all', limit = 50, page = 1) {
    if (!query?.trim()) {
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      };
    }

    try {
      // Calculate items per type for 'all' searches
      const itemsPerType = Math.floor(limit / 4); // Divide by 4 for tracks, artists, albums, playlists
      
      switch (type) {
        case 'tracks':
          const tracks = await this.ytmusic.searchTracks(query, limit);
          return {
            tracks,
            artists: [],
            albums: [],
            playlists: [],
            pagination: {
              totalResults: tracks.length,
              itemsPerPage: limit,
              startIndex: (page - 1) * limit
            }
          };

        case 'artists':
          const artists = await this.ytmusic.searchArtists(query, limit);
          return {
            tracks: [],
            artists,
            albums: [],
            playlists: [],
            pagination: {
              totalResults: artists.length,
              itemsPerPage: limit,
              startIndex: (page - 1) * limit
            }
          };

        case 'albums':
          const albums = await this.ytmusic.searchAlbums(query, limit);
          return {
            tracks: [],
            artists: [],
            albums,
            playlists: [],
            pagination: {
              totalResults: albums.length,
              itemsPerPage: limit,
              startIndex: (page - 1) * limit
            }
          };
          
        case 'playlists':
          const playlists = await this.ytmusic.searchPlaylists(query, limit);
          return {
            tracks: [],
            artists: [],
            albums: [],
            playlists,
            pagination: {
              totalResults: playlists.length,
              itemsPerPage: limit,
              startIndex: (page - 1) * limit
            }
          };

        case 'all':
        default:
          // Run searches in parallel for better performance
          const [tracksAll, artistsAll, albumsAll, playlistsAll] = await Promise.all([
            this.ytmusic.searchTracks(query, itemsPerType),
            this.ytmusic.searchArtists(query, itemsPerType),
            this.ytmusic.searchAlbums(query, itemsPerType),
            this.ytmusic.searchPlaylists(query, itemsPerType)
          ]);

          return {
            tracks: tracksAll,
            artists: artistsAll,
            albums: albumsAll,
            playlists: playlistsAll
          };
      }
    } catch (error) {
      console.error('Search failed:', error);
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      };
    }
  }

  // Get home page data
  async getHomeData() {
    try {
      // Default empty values
      let topTracks = [];
      let featuredPlaylists = [];
      let recentlyPlayed = [];
      
      // Try to get home content, but have fallbacks
      try {
        const homeContent = await this.ytmusic.getHomeContent();
        if (homeContent) {
          featuredPlaylists = homeContent.featuredPlaylists || [];
          // Only use home content top tracks as fallback
          if (homeContent.topTracks && homeContent.topTracks.length > 0) {
            topTracks = homeContent.topTracks;
          }
        }
      } catch (error) {
        console.error('Failed to fetch home content:', error);
      }
      
      // Try to get Bollywood tracks directly if we still don't have top tracks
      if (topTracks.length === 0) {
        try {
          console.log('Searching for Bollywood tracks...');
          const bollywoodTracks = await this.ytmusic.searchTracks('bollywood hits', 10);
          if (bollywoodTracks && bollywoodTracks.length > 0) {
            console.log('Found Bollywood tracks:', bollywoodTracks.length);
            topTracks = bollywoodTracks;
          }
        } catch (error) {
          console.error('Failed to fetch Bollywood tracks:', error);
        }
      }
      
      // If we still don't have tracks, try a more general search
      if (topTracks.length === 0) {
        try {
          console.log('Searching for popular music...');
          const popularTracks = await this.ytmusic.searchTracks('popular music', 10);
          if (popularTracks && popularTracks.length > 0) {
            console.log('Found popular tracks:', popularTracks.length);
            topTracks = popularTracks;
          }
        } catch (error) {
          console.error('Failed to fetch popular tracks:', error);
        }
      }
      
      // Enhance the track metadata using Last.fm where needed
      if (topTracks.length > 0) {
        const enhancedTracks = await Promise.all(
          topTracks.map(async (track) => {
            // Only try to enhance tracks that have generic names or are missing data
            if (!track.name || track.name === 'Track' || !track.artist || track.artist === 'Artist') {
              try {
                // Extract potential track name and artist from YouTube title
                const videoTitle = track.title || track.name;
                const { title, artist } = this.lastfm.extractTrackInfo(videoTitle);
                
                // If we got something useful, try to get additional data from Last.fm
                if (title) {
                  const lastFmData = await this.lastfm.searchTrack(title, artist);
                  
                  if (lastFmData) {
                    console.log('Enhanced track with Last.fm data:', videoTitle);
                    return {
                      ...track,
                      name: lastFmData.name || title || track.name,
                      title: lastFmData.name || title || track.title,
                      artist: lastFmData.artist || artist || track.artist,
                      image: lastFmData.image || track.image,
                      // Make sure we keep the YouTube ID and URLs
                      youtube_id: track.youtube_id || track.videoId || track.id,
                      videoId: track.videoId || track.youtube_id || track.id,
                      id: track.id || track.videoId || track.youtube_id
                    };
                  }
                }
              } catch (error) {
                console.error('Error enhancing track with Last.fm:', error);
              }
            }
            return track;
          })
        );
        
        topTracks = enhancedTracks;
      }
      
      // Store recently played tracks in local storage if not available yet
      try {
        // Check if localStorage is available (it won't be in Node.js environment)
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedRecent = localStorage.getItem('recentlyPlayed');
          if (storedRecent) {
            recentlyPlayed = JSON.parse(storedRecent);
          }
        }
      } catch (e) {
        console.error('Failed to load recently played from storage:', e);
      }
      
      return {
        featuredPlaylists,
        topTracks,
        recentlyPlayed
      };
    } catch (error) {
      console.error('Failed to load home data:', error);
      return {
        featuredPlaylists: [],
        topTracks: [],
        recentlyPlayed: []
      };
    }
  }

  // Get top tracks (now directly from YouTube Music charts)
  async getTopTracks(limit = 50, page = 1) {
    try {
      // Try to get Bollywood tracks first
      let tracks = await this.ytmusic.searchTracks('bollywood hits', limit);
      
      // If that fails, get general top tracks
      if (!tracks || tracks.length === 0) {
        tracks = await this.ytmusic.getTopTracks(limit);
      }
      
      return {
        tracks,
        pagination: {
          totalPages: 1,
          page: page,
          perPage: limit,
          total: tracks.length
        }
      };
    } catch (error) {
      console.error('Failed to get top tracks:', error);
      return { tracks: [], pagination: {} };
    }
  }

  // Get top artists (via search for popular artists)
  async getTopArtists(limit = 50, page = 1) {
    try {
      // Get top artists - in a real app, we'd have a more sophisticated way
      // to determine top artists, but for now we'll search for popular ones
      const artists = await this.ytmusic.searchArtists('top popular artists', limit);
      
      return {
        artists,
        pagination: {
          totalPages: 1,
          page: page,
          perPage: limit,
          total: artists.length
        }
      };
    } catch (error) {
      console.error('Failed to get top artists:', error);
      return { artists: [], pagination: {} };
    }
  }

  // Get top albums (via search for popular albums)
  async getTopAlbums(limit = 50, page = 1) {
    try {
      // Search for popular albums
      const albums = await this.ytmusic.searchAlbums('top albums', limit);
      
      return {
        albums,
        pagination: {
          totalPages: 1,
          page: page,
          perPage: limit,
          total: albums.length
        }
      };
    } catch (error) {
      console.error('Failed to get top albums:', error);
      return { albums: [], pagination: {} };
    }
  }

  // Get artist details by ID or name
  async getArtistDetails(artistId) {
    try {
      // If we receive a mock artist ID (starts with "artist-"), handle it specially
      if (artistId.startsWith('artist-')) {
        console.log(`Received mock artist ID: ${artistId}, searching for a real artist instead`);
        const searchResults = await this.ytmusic.searchArtists('popular artists', 1);
        if (searchResults && searchResults.length > 0) {
          artistId = searchResults[0].id;
          console.log(`Using real artist ID instead: ${artistId}`);
        } else {
          // If we can't find a real artist, return mock data
          return this._getMockArtistDetails(artistId);
        }
      }
      // If we receive a name instead of an ID, search for it first
      else if (!artistId.startsWith('UC')) {
        // This is probably a name, not an ID
        const searchResults = await this.ytmusic.searchArtists(artistId, 1);
        if (searchResults && searchResults.length > 0) {
          artistId = searchResults[0].id;
        } else {
          throw new Error(`Artist not found: ${artistId}`);
        }
      }
      
      try {
        // Variables to store the artist data
        let artist = null;
        let topTracks = [];
        let albums = [];
        let similarArtists = [];
        
        // Get artist details
        artist = await this.ytmusic.getArtistDetails(artistId);
        
        // Get artist's top tracks and albums in parallel
        if (artist) {
          [topTracks, albums] = await Promise.all([
            this.ytmusic.getArtistTopTracks(artistId, 10),
            this.ytmusic.getArtistAlbums(artistId, 10)
          ]);
          
          // For similar artists, we'll use a search based on the artist name
          if (artist.name) {
            similarArtists = await this.ytmusic.searchArtists(`artists similar to ${artist.name}`, 10);
            // Remove the original artist if it appears in the results
            similarArtists = similarArtists.filter(similar => similar.id !== artistId);
          }
        }

        return {
          artist,
          topTracks,
          topAlbums: albums,
          similarArtists
        };
      } catch (apiError) {
        console.error(`API error getting artist details for ${artistId}:`, apiError);
        // Fall back to mock data if the API request fails
        return this._getMockArtistDetails(artistId);
      }
    } catch (error) {
      console.error(`Failed to get artist details for ${artistId}:`, error);
      // Instead of throwing, return mock data so the UI doesn't break
      return this._getMockArtistDetails(artistId);
    }
  }
  
  // Private method to generate mock artist details when real data is unavailable
  _getMockArtistDetails(artistId) {
    console.log(`Returning mock artist data for ID: ${artistId}`);
    
    // Create mock artist data
    const artist = {
      id: artistId,
      name: 'Sample Artist',
      image: 'https://picsum.photos/seed/artist/300/300',
      bannerImage: 'https://picsum.photos/seed/artist-banner/1200/300',
      description: 'This is a sample artist with mock data.',
      subscribers: 500000
    };
    
    // Create mock top tracks
    const topTracks = Array.from({ length: 10 }, (_, i) => ({
      id: `track-${artistId}-${i + 1}`,
      name: `Popular Track ${i + 1}`,
      artist: artist.name,
      album: `Album ${Math.floor(i / 3) + 1}`,
      duration: 180 + (i * 15), // 3-5.5 minutes
      image: `https://picsum.photos/seed/track-${artistId}-${i}/300/300`
    }));
    
    // Create mock albums
    const albums = Array.from({ length: 5 }, (_, i) => ({
      id: `album-${artistId}-${i + 1}`,
      name: `Album ${i + 1}`,
      artist: artist.name,
      year: 2025 - i,
      trackCount: 8 + (i % 4),
      image: `https://picsum.photos/seed/album-${artistId}-${i}/300/300`
    }));
    
    // Create mock similar artists
    const similarArtists = Array.from({ length: 5 }, (_, i) => ({
      id: `artist-similar-${i + 1}`,
      name: `Similar Artist ${i + 1}`,
      image: `https://picsum.photos/seed/similar-${i}/300/300`
    }));
    
    return {
      artist,
      topTracks,
      topAlbums: albums,
      similarArtists
    };
  }

  // Get album details by ID
  async getAlbumDetails(albumId) {
    try {
      // Handle mock album IDs (starting with "album-") by searching for a real album instead
      if (albumId.startsWith('album-')) {
        // For mock IDs, search for popular albums and return the first one
        console.log(`Received mock album ID: ${albumId}, searching for a real album instead`);
        const searchResults = await this.ytmusic.searchAlbums('popular albums', 1);
        if (searchResults && searchResults.length > 0) {
          albumId = searchResults[0].id;
          console.log(`Using real album ID instead: ${albumId}`);
        } else {
          // If we can't find a real album, return mock data
          return this._getMockAlbumDetails(albumId);
        }
      }
      // If we receive names instead of an ID, search for it first
      else if (!albumId.startsWith('MPR') && arguments.length > 1) {
        const artistName = arguments[0];
        const albumName = arguments[1];
        
        // Search for the album
        const searchResults = await this.ytmusic.searchAlbums(`${artistName} ${albumName}`, 1);
        if (searchResults && searchResults.length > 0) {
          albumId = searchResults[0].id;
        } else {
          throw new Error(`Album not found: ${albumName} by ${artistName}`);
        }
      }
      
      try {
        // Get album details
        const albumDetails = await this.ytmusic.getAlbumDetails(albumId);
        
        return {
          album: albumDetails,
          tracks: albumDetails.tracks || []
        };
      } catch (apiError) {
        console.error(`API error getting album details for ${albumId}:`, apiError);
        // Fall back to mock data if the API request fails
        return this._getMockAlbumDetails(albumId);
      }
    } catch (error) {
      console.error(`Failed to get album details for ${albumId}:`, error);
      // Instead of throwing, return mock data so the UI doesn't break
      return this._getMockAlbumDetails(albumId);
    }
  }
  
  // Private method to generate mock album details when real data is unavailable
  _getMockAlbumDetails(albumId) {
    console.log(`Returning mock album data for ID: ${albumId}`);
    const mockAlbum = {
      id: albumId,
      name: 'Sample Album',
      artist: 'Various Artists',
      artistId: 'artist-1',
      releaseYear: '2025',
      description: 'This is a sample album with mock data.',
      duration: 2160, // 36 minutes
      image: 'https://picsum.photos/seed/album/300/300',
      tracks: Array.from({ length: 8 }, (_, i) => ({
        id: `track-${albumId}-${i + 1}`,
        name: `Track ${i + 1}`,
        artist: 'Various Artists',
        album: 'Sample Album',
        duration: 180 + (i * 30), // 3-6 minutes per track
        image: `https://picsum.photos/seed/${albumId}-${i}/300/300`
      }))
    };
    
    return {
      album: mockAlbum,
      tracks: mockAlbum.tracks || []
    };
  }

  // Get track details by ID or by artist/track name
  async getTrackDetails(trackIdOrArtist, trackName) {
    try {
      let trackId = trackIdOrArtist;
      
      // If we receive names instead of an ID, search for it first
      if (trackName) {
        // This is artist + track name format
        const searchResults = await this.ytmusic.searchTracks(`${trackIdOrArtist} ${trackName}`, 1);
        if (searchResults && searchResults.length > 0) {
          trackId = searchResults[0].id;
        } else {
          throw new Error(`Track not found: ${trackName} by ${trackIdOrArtist}`);
        }
      }
      
      // Get track details
      const track = await this.ytmusic.getTrackDetails(trackId);
      
      // Get similar tracks based on the artist and title
      let similarTracks = [];
      if (track) {
        similarTracks = await this.ytmusic.searchTracks(`${track.artist} similar to ${track.name}`, 10);
        // Remove the original track if it appears in the results
        similarTracks = similarTracks.filter(similar => similar.id !== trackId);
      }

      return {
        track,
        similarTracks
      };
    } catch (error) {
      const identifier = trackName ? `${trackName} by ${trackIdOrArtist}` : trackIdOrArtist;
      console.error(`Failed to get track details for ${identifier}:`, error);
      throw error;
    }
  }
  
  // Get lyrics for a track
  async getTrackLyrics(trackId) {
    try {
      return this.ytmusic.getLyrics(trackId);
    } catch (error) {
      console.error(`Failed to get lyrics for track ${trackId}:`, error);
      return null;
    }
  }

  // Get genres from YouTube Music
  async getGenres() {
    try {
      const genres = await this.ytmusic.getGenres();
      // Ensure we're returning an array of genres
      if (!Array.isArray(genres)) {
        console.error('Invalid genres data format:', genres);
        return [];
      }
      return genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }

  // Get content by genre
  async getGenreContent(genreId, contentType = 'playlists', limit = 50, page = 1) {
    try {
      const genreContent = await this.ytmusic.getGenreContent(genreId);
      
      // Depending on the content type, return different aspects of the genre content
      switch (contentType) {
        case 'playlists':
          return {
            playlists: genreContent.playlists.slice(0, limit),
            pagination: {
              totalPages: 1,
              page: page,
              perPage: limit,
              total: genreContent.playlists.length
            }
          };
          
        case 'tracks':
          // If we have a featured playlist, get its tracks
          if (genreContent.featured && genreContent.featured.id) {
            const playlist = await this.ytmusic.getPlaylistDetails(genreContent.featured.id);
            return {
              tracks: playlist.tracks || [],
              pagination: {
                totalPages: 1,
                page: page,
                perPage: limit,
                total: playlist.tracks?.length || 0
              }
            };
          }
          // Otherwise, search for tracks in this genre
          else {
            const tracks = await this.ytmusic.searchTracks(`${genreId} music`, limit);
            return {
              tracks,
              pagination: {
                totalPages: 1,
                page: page,
                perPage: limit,
                total: tracks.length
              }
            };
          }
          
        case 'artists':
          // Search for artists in this genre
          const artists = await this.ytmusic.searchArtists(`top ${genreId} artists`, limit);
          return {
            artists,
            pagination: {
              totalPages: 1,
              page: page,
              perPage: limit,
              total: artists.length
            }
          };
          
        case 'albums':
          // Search for albums in this genre
          const albums = await this.ytmusic.searchAlbums(`best ${genreId} albums`, limit);
          return {
            albums,
            pagination: {
              totalPages: 1,
              page: page,
              perPage: limit,
              total: albums.length
            }
          };
          
        default:
          return { [contentType]: [], pagination: {} };
      }
    } catch (error) {
      console.error(`Failed to get ${contentType} for genre ${genreId}:`, error);
      return { [contentType]: [], pagination: {} };
    }
  }

  // Get recommendations based on a seed track, artist, or genre
  async getRecommendations(seedType, seedValue, limit = 20) {
    try {
      switch (seedType) {
        case 'track':
          // Get similar tracks
          const trackDetails = await this.getTrackDetails(seedValue);
          return {
            tracks: trackDetails.similarTracks.slice(0, limit),
            source: `Similar to "${trackDetails.track?.name}"`
          };
          
        case 'artist':
          // Get artist's top tracks
          const artistDetails = await this.getArtistDetails(seedValue);
          return {
            tracks: artistDetails.topTracks.slice(0, limit),
            source: `Top tracks by ${artistDetails.artist?.name}`
          };
          
        case 'genre':
          // Get tracks for genre
          const genreContent = await this.getGenreContent(seedValue, 'tracks', limit);
          return {
            tracks: genreContent.tracks,
            source: `Top ${seedValue} tracks`
          };
          
        default:
          // Get general top tracks as fallback
          const topTracks = await this.getTopTracks(limit);
          return {
            tracks: topTracks.tracks,
            source: 'Popular tracks'
          };
      }
    } catch (error) {
      console.error(`Failed to get recommendations for ${seedType} ${seedValue}:`, error);
      return { tracks: [], source: 'Recommended tracks' };
    }
  }

  // Get featured playlists from YouTube Music
  async getFeaturedPlaylists() {
    try {
      const homeContent = await this.ytmusic.getHomeContent();
      return homeContent.featuredPlaylists;
    } catch (error) {
      console.error('Failed to get featured playlists:', error);
      return [];
    }
  }

  // Get recently played tracks from local storage
  async getRecentlyPlayed(limit = 10) {
    try {
      // In a real app, this might come from a backend service that tracks user history
      // For now, we'll use localStorage to simulate recently played tracks
      let recentlyPlayed = [];
      try {
        const storedRecent = localStorage.getItem('recentlyPlayed');
        if (storedRecent) {
          recentlyPlayed = JSON.parse(storedRecent);
        }
      } catch (e) {
        console.error('Failed to load recently played from storage:', e);
      }
      
      return {
        tracks: recentlyPlayed.slice(0, limit),
        pagination: {
          totalPages: 1,
          page: 1,
          perPage: limit,
          total: recentlyPlayed.length
        }
      };
    } catch (error) {
      console.error('Failed to get recently played tracks:', error);
      return { tracks: [], pagination: {} };
    }
  }
  
  // Add a track to recently played
  addToRecentlyPlayed(track) {
    if (!track) return;
    
    try {
      // Check if localStorage is available (browser environment only)
      if (typeof window === 'undefined' || !window.localStorage) {
        return; // Exit if localStorage is not available
      }
      
      // Get current recently played
      let recentlyPlayed = [];
      try {
        const storedRecent = localStorage.getItem('recentlyPlayed');
        if (storedRecent) {
          recentlyPlayed = JSON.parse(storedRecent);
        }
      } catch (e) {
        console.error('Failed to load recently played from storage:', e);
      }
      
      // Remove the track if it already exists
      recentlyPlayed = recentlyPlayed.filter(t => t.id !== track.id);
      
      // Add the track to the beginning
      recentlyPlayed.unshift(track);
      
      // Keep only the last 50 tracks
      recentlyPlayed = recentlyPlayed.slice(0, 50);
      
      // Save back to storage
      localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
    } catch (error) {
      console.error('Failed to add track to recently played:', error);
    }
  }

  // Health check for the service
  async healthCheck() {
    try {
      // Try to get a small amount of data to check if the API is working
      await this.ytmusic.getTopTracks(1);
      return { status: 'healthy', timestamp: new Date().toISOString() };
    } catch (error) {
      return { 
        status: 'error', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  // Get music by mood - using YT Music search
  async getMusicByMood(mood, limit = 20) {
    try {
      const tracks = await this.ytmusic.searchTracks(`${mood} music`, limit);
      return {
        tracks,
        pagination: {
          totalPages: 1,
          page: 1,
          perPage: limit,
          total: tracks.length
        }
      };
    } catch (error) {
      console.error(`Failed to get ${mood} music:`, error);
      return { tracks: [], pagination: {} };
    }
  }

  // Get tracks by source (like 'archive', 'youtube', etc.)
  // This is now a wrapper around our search functionality
  async getTracksBySource(source, limit = 20) {
    try {
      const tracks = await this.ytmusic.searchTracks(`${source} music collection`, limit);
      return {
        tracks,
        pagination: {
          totalPages: 1,
          page: 1,
          perPage: limit,
          total: tracks.length
        }
      };
    } catch (error) {
      console.error(`Failed to get tracks from ${source}:`, error);
      return { tracks: [], pagination: {} };
    }
  }

  // Get playlist details by ID
  async getPlaylistDetails(playlistId) {
    try {
      // Handle 'liked-songs' as a special case
      if (playlistId === 'liked-songs') {
        // In a real app, this would be fetched from a user's liked songs
        // For now, we'll use top tracks as a placeholder
        const topTracks = await this.getTopTracks(30);
        
        return {
          id: 'liked-songs',
          name: 'Liked Songs',
          description: 'Your favorite tracks',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          creator: 'You',
          tracks: topTracks.tracks || [],
          totalTracks: topTracks.tracks?.length || 0,
          gradient: 'from-purple-500 to-indigo-700',
          followers: 1,
          duration: topTracks.tracks?.reduce((sum, track) => sum + (track.duration || 0), 0) || 0
        };
      }
      
      // Handle mock playlist IDs (starting with "playlist-")
      if (playlistId.startsWith('playlist-')) {
        console.log(`Received mock playlist ID: ${playlistId}, searching for a real playlist instead`);
        const searchResults = await this.ytmusic.searchPlaylists('popular playlists', 1);
        if (searchResults && searchResults.length > 0) {
          playlistId = searchResults[0].id;
          console.log(`Using real playlist ID instead: ${playlistId}`);
        } else {
          // If we can't find a real playlist, return mock data
          return this._getMockPlaylistDetails(playlistId);
        }
      }
      
      // Try to get playlist details
      let playlistDetails = null;
      try {
        playlistDetails = await this.ytmusic.getPlaylistDetails(playlistId);
      } catch (error) {
        console.error(`Failed to get playlist details for ${playlistId}:`, error);
        // If not found, search for playlists with that ID in the name
        try {
          const searchResults = await this.ytmusic.searchPlaylists(`playlist ${playlistId}`, 1);
          if (searchResults && searchResults.length > 0) {
            playlistDetails = await this.ytmusic.getPlaylistDetails(searchResults[0].id);
          } else {
            return this._getMockPlaylistDetails(playlistId);
          }
        } catch (searchError) {
          console.error(`Failed to search for alternative playlists: ${searchError}`);
          return this._getMockPlaylistDetails(playlistId);
        }
      }
      
      if (!playlistDetails) {
        console.warn(`Playlist details not available: ${playlistId}, using mock data`);
        return this._getMockPlaylistDetails(playlistId);
      }
      
      return {
        id: playlistDetails.id || playlistId,
        name: playlistDetails.name || playlistDetails.title || 'Playlist',
        description: playlistDetails.description || '',
        image: playlistDetails.image || 'https://picsum.photos/seed/playlist/300/300',
        creator: playlistDetails.creator || 'Fonos',
        tracks: playlistDetails.tracks || [],
        totalTracks: playlistDetails.trackCount || playlistDetails.tracks?.length || 0,
        gradient: 'from-blue-500 to-indigo-700',
        followers: playlistDetails.subscribers || Math.floor(Math.random() * 1000),
        duration: playlistDetails.tracks?.reduce((sum, track) => sum + (track.duration || 0), 0) || 0
      };
    } catch (error) {
      console.error(`Failed to get playlist details for ${playlistId}:`, error);
      // Instead of throwing an error, return mock data so the UI doesn't break
      return this._getMockPlaylistDetails(playlistId);
    }
  }
  
  // Private method to generate mock playlist details when real data is unavailable
  _getMockPlaylistDetails(playlistId) {
    console.log(`Returning mock playlist data for ID: ${playlistId}`);
    
    // Create mock tracks
    const tracks = Array.from({ length: 12 }, (_, i) => ({
      id: `track-${playlistId}-${i + 1}`,
      name: `Track ${i + 1}`,
      artist: `Artist ${(i % 4) + 1}`,
      album: `Album ${Math.floor(i / 3) + 1}`,
      duration: 180 + (i * 20), // 3-7 minutes
      image: `https://picsum.photos/seed/track-${playlistId}-${i}/300/300`
    }));
    
    // Calculate total duration
    const duration = tracks.reduce((sum, track) => sum + track.duration, 0);
    
    // Create mock playlist data
    const playlistDetails = {
      id: playlistId,
      name: playlistId === 'playlist-1' ? 'Featured Playlist' : `Playlist ${playlistId.split('-')[1]}`,
      description: 'This is a sample playlist with mock data.',
      image: `https://picsum.photos/seed/${playlistId}/300/300`,
      creator: 'Fonos',
      tracks: tracks,
      totalTracks: tracks.length,
      gradient: 'from-blue-500 to-indigo-700',
      followers: Math.floor(Math.random() * 1000) + 10,
      duration: duration
    };
    
    return playlistDetails;
  }
}

// Create and export singleton instance
const musicService = new MusicService();
export default musicService;
