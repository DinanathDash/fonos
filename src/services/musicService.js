import ytMusicApi from './ytMusicApi.js';

// Main music service that uses YouTube Music API for all functionality
class MusicService {
  constructor() {
    this.ytmusic = ytMusicApi;
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
          const bollywoodTracks = await this.ytmusic.searchTracks('bollywood hits', 10);
          if (bollywoodTracks && bollywoodTracks.length > 0) {
            topTracks = bollywoodTracks;
          }
        } catch (error) {
          console.error('Failed to fetch Bollywood tracks:', error);
        }
      }
      
      // If we still don't have tracks, try a more general search
      if (topTracks.length === 0) {
        try {
          const popularTracks = await this.ytmusic.searchTracks('popular music', 10);
          if (popularTracks && popularTracks.length > 0) {
            topTracks = popularTracks;
          }
        } catch (error) {
          console.error('Failed to fetch popular tracks:', error);
        }
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
      // If we receive a name instead of an ID, search for it first
      let artist = null;
      let topTracks = [];
      let albums = [];
      let similarArtists = [];
      
      if (!artistId.startsWith('UC')) {
        // This is probably a name, not an ID
        const searchResults = await this.ytmusic.searchArtists(artistId, 1);
        if (searchResults && searchResults.length > 0) {
          artistId = searchResults[0].id;
        } else {
          throw new Error(`Artist not found: ${artistId}`);
        }
      }
      
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
    } catch (error) {
      console.error(`Failed to get artist details for ${artistId}:`, error);
      throw error;
    }
  }

  // Get album details by ID
  async getAlbumDetails(albumId) {
    try {
      // If we receive names instead of an ID, search for it first
      if (!albumId.startsWith('MPR') && arguments.length > 1) {
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
      
      // Get album details
      const albumDetails = await this.ytmusic.getAlbumDetails(albumId);
      
      return {
        album: albumDetails,
        tracks: albumDetails.tracks || []
      };
    } catch (error) {
      console.error(`Failed to get album details for ${albumId}:`, error);
      throw error;
    }
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
    return this.ytmusic.getGenres();
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
}

// Create and export singleton instance
const musicService = new MusicService();
export default musicService;
