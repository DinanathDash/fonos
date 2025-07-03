// YouTube Music API Service

class YTMusicApiService {
  constructor() {
    // Base URL for our server proxy API
    this.apiBaseUrl = import.meta.env.VITE_YTMUSIC_API_URL || 'http://localhost:3001/api/ytmusic';
    
    // Caching system to avoid repeated API calls
    this.cache = {
      search: new Map(),
      tracks: new Map(),
      artists: new Map(),
      albums: new Map(),
      playlists: new Map(),
      genres: new Map(),
      lyrics: new Map()
    };
    
    // Cache expiration time (30 minutes)
    this.cacheExpiration = 30 * 60 * 1000;
  }

  // SEARCH FUNCTIONS
  
  // General search function that can search for tracks, artists, albums, playlists
  async search(query, type = 'songs', limit = 10) {
    if (!query?.trim()) return [];
    
    // Create a cache key
    const cacheKey = `${query}-${type}-${limit}`.toLowerCase();
    
    // Check if we have a non-expired cache entry
    const cacheEntry = this.cache.search.get(cacheKey);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheExpiration) {
      return cacheEntry.data;
    }
    
    try {
      // Build URL with query parameters
      const url = new URL(`${this.apiBaseUrl}/search`);
      url.searchParams.append('query', query);
      url.searchParams.append('type', type);
      url.searchParams.append('limit', limit);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const searchResults = await response.json();
      
      // Format results according to their type
      let formattedResults = [];
      
      if (searchResults && searchResults.length > 0) {
        switch (type) {
          case 'songs':
            formattedResults = searchResults.map(item => this.normalizeTrack(item));
            break;
          case 'artists':
            formattedResults = searchResults.map(item => this.normalizeArtist(item));
            break;
          case 'albums':
            formattedResults = searchResults.map(item => this.normalizeAlbum(item));
            break;
          case 'playlists':
            formattedResults = searchResults.map(item => this.normalizePlaylist(item));
            break;
          default:
            formattedResults = searchResults;
        }
      }
      
      // Cache the result with timestamp
      this.cache.search.set(cacheKey, {
        data: formattedResults,
        timestamp: Date.now()
      });
      
      return formattedResults;
    } catch (error) {
      console.error(`Error searching for ${type} with query "${query}":`, error);
      return [];
    }
  }
  
  // Search specifically for tracks
  async searchTracks(query, limit = 10) {
    return this.search(query, 'songs', limit);
  }
  
  // Search specifically for artists
  async searchArtists(query, limit = 10) {
    return this.search(query, 'artists', limit);
  }
  
  // Search specifically for albums
  async searchAlbums(query, limit = 10) {
    return this.search(query, 'albums', limit);
  }
  
  // Search specifically for playlists
  async searchPlaylists(query, limit = 10) {
    return this.search(query, 'playlists', limit);
  }

  // DETAILED INFORMATION FUNCTIONS
  
  // Get track details by ID
  async getTrackDetails(videoId) {
    if (!videoId) return null;
    
    // Check cache
    if (this.cache.tracks.has(videoId)) {
      const cached = this.cache.tracks.get(videoId);
      if (Date.now() - cached.timestamp < this.cacheExpiration) {
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/track/${videoId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const trackDetails = await response.json();
      const normalizedTrack = this.normalizeTrack(trackDetails);
      
      // Cache the result
      this.cache.tracks.set(videoId, {
        data: normalizedTrack,
        timestamp: Date.now()
      });
      
      return normalizedTrack;
    } catch (error) {
      console.error(`Error fetching details for track ID ${videoId}:`, error);
      return null;
    }
  }
  
  // Get artist details by ID
  async getArtistDetails(artistId) {
    if (!artistId) return null;
    
    // Check cache
    if (this.cache.artists.has(artistId)) {
      const cached = this.cache.artists.get(artistId);
      if (Date.now() - cached.timestamp < this.cacheExpiration) {
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/artist/${artistId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const artistDetails = await response.json();
      const normalizedArtist = this.normalizeArtist(artistDetails);
      
      // Cache the result
      this.cache.artists.set(artistId, {
        data: normalizedArtist,
        timestamp: Date.now()
      });
      
      return normalizedArtist;
    } catch (error) {
      console.error(`Error fetching details for artist ID ${artistId}:`, error);
      return null;
    }
  }
  
  // Get album details by ID
  async getAlbumDetails(albumId) {
    if (!albumId) return null;
    
    // Check cache
    if (this.cache.albums.has(albumId)) {
      const cached = this.cache.albums.get(albumId);
      if (Date.now() - cached.timestamp < this.cacheExpiration) {
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/album/${albumId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const albumDetails = await response.json();
      const normalizedAlbum = {
        ...this.normalizeAlbum(albumDetails),
        tracks: albumDetails.tracks ? albumDetails.tracks.map(track => this.normalizeTrack(track)) : []
      };
      
      // Cache the result
      this.cache.albums.set(albumId, {
        data: normalizedAlbum,
        timestamp: Date.now()
      });
      
      return normalizedAlbum;
    } catch (error) {
      console.error(`Error fetching details for album ID ${albumId}:`, error);
      return null;
    }
  }
  
  // Get playlist details by ID
  async getPlaylistDetails(playlistId) {
    if (!playlistId) return null;
    
    // Check cache
    if (this.cache.playlists.has(playlistId)) {
      const cached = this.cache.playlists.get(playlistId);
      if (Date.now() - cached.timestamp < this.cacheExpiration) {
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/playlist/${playlistId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const playlistDetails = await response.json();
      const normalizedPlaylist = {
        ...this.normalizePlaylist(playlistDetails),
        tracks: playlistDetails.tracks ? playlistDetails.tracks.map(track => this.normalizeTrack(track)) : []
      };
      
      // Cache the result
      this.cache.playlists.set(playlistId, {
        data: normalizedPlaylist,
        timestamp: Date.now()
      });
      
      return normalizedPlaylist;
    } catch (error) {
      console.error(`Error fetching details for playlist ID ${playlistId}:`, error);
      return null;
    }
  }
  
  // Get lyrics for a track
  async getLyrics(videoId) {
    if (!videoId) return null;
    
    // Check cache
    if (this.cache.lyrics.has(videoId)) {
      const cached = this.cache.lyrics.get(videoId);
      if (Date.now() - cached.timestamp < this.cacheExpiration) {
        return cached.data;
      }
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/lyrics/${videoId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const lyrics = await response.json();
      
      // Cache the result
      this.cache.lyrics.set(videoId, {
        data: lyrics,
        timestamp: Date.now()
      });
      
      return lyrics;
    } catch (error) {
      console.error(`Error fetching lyrics for track ID ${videoId}:`, error);
      return null;
    }
  }
  
  // DISCOVERY ENDPOINTS
  
  // Get home page content (top charts, moods, new releases)
  async getHomeContent() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/home`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const homeContent = await response.json();
      
      // Normalize the results
      const normalizedContent = {
        topTracks: homeContent.topTracks?.map(track => this.normalizeTrack(track)) || [],
        featuredPlaylists: homeContent.featuredPlaylists?.map(playlist => this.normalizePlaylist(playlist)) || [],
        newReleases: homeContent.newReleases?.map(album => this.normalizeAlbum(album)) || [],
        moods: homeContent.moods || []
      };
      
      return normalizedContent;
    } catch (error) {
      console.error('Error fetching home content:', error);
      return {
        topTracks: [],
        featuredPlaylists: [],
        newReleases: [],
        moods: []
      };
    }
  }
  
  // Get top tracks/charts
  async getTopTracks(limit = 20) {
    try {
      const url = new URL(`${this.apiBaseUrl}/charts`);
      url.searchParams.append('limit', limit);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const charts = await response.json();
      return charts.map(track => this.normalizeTrack(track));
    } catch (error) {
      console.error('Error fetching charts/top tracks:', error);
      return [];
    }
  }
  
  // Get genres/categories
  async getGenres() {
    // Check cache first
    const cacheKey = 'all-genres';
    if (this.cache.genres.has(cacheKey)) {
      const cached = this.cache.genres.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiration) {
        console.log('Using cached genres data');
        return cached.data;
      }
    }
    
    try {
      console.log('Fetching genres from API');
      const response = await fetch(`${this.apiBaseUrl}/genres`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const genres = await response.json();
      
      // Cache the result
      this.cache.genres.set(cacheKey, {
        data: genres,
        timestamp: Date.now()
      });
      
      return genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return [];
    }
  }
  
  // Get content by genre
  async getGenreContent(genreId) {
    if (!genreId) return { playlists: [], featured: null };
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/genre/${genreId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const genreContent = await response.json();
      
      return {
        playlists: genreContent.playlists?.map(playlist => this.normalizePlaylist(playlist)) || [],
        featured: genreContent.featured ? this.normalizePlaylist(genreContent.featured) : null
      };
    } catch (error) {
      console.error(`Error fetching content for genre ID ${genreId}:`, error);
      return { playlists: [], featured: null };
    }
  }
  
  // Get artist albums
  async getArtistAlbums(artistId, limit = 20) {
    if (!artistId) return [];
    
    try {
      const url = new URL(`${this.apiBaseUrl}/artist/${artistId}/albums`);
      url.searchParams.append('limit', limit);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const albums = await response.json();
      return albums.map(album => this.normalizeAlbum(album));
    } catch (error) {
      console.error(`Error fetching albums for artist ID ${artistId}:`, error);
      return [];
    }
  }
  
  // Get artist top tracks
  async getArtistTopTracks(artistId, limit = 20) {
    if (!artistId) return [];
    
    try {
      const url = new URL(`${this.apiBaseUrl}/artist/${artistId}/top-tracks`);
      url.searchParams.append('limit', limit);
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const tracks = await response.json();
      return tracks.map(track => this.normalizeTrack(track));
    } catch (error) {
      console.error(`Error fetching top tracks for artist ID ${artistId}:`, error);
      return [];
    }
  }
  
  // UTILITY FUNCTIONS
  
  // Get the best thumbnail URL from a thumbnails array
  getBestThumbnail(thumbnails, size = 'medium') {
    if (!thumbnails || !thumbnails.length) {
      return null;
    }
    
    // Define size preferences
    const sizes = {
      small: { width: 120, height: 120 },
      medium: { width: 300, height: 300 },
      large: { width: 500, height: 500 }
    };
    
    const targetSize = sizes[size] || sizes.medium;
    
    // First try to find a thumbnail close to the target size
    let closest = thumbnails[0];
    let minDiff = Math.abs((closest.width * closest.height) - (targetSize.width * targetSize.height));
    
    for (let i = 1; i < thumbnails.length; i++) {
      const thumb = thumbnails[i];
      const diff = Math.abs((thumb.width * thumb.height) - (targetSize.width * targetSize.height));
      
      if (diff < minDiff) {
        closest = thumb;
        minDiff = diff;
      }
    }
    
    return closest.url;
  }
  
  // Normalize track data
  normalizeTrack(track) {
    if (!track) return null;
    
    try {
      // Safely access nested properties to avoid undefined errors
      const safeGetArtists = () => {
        if (!track.artists) return [];
        if (!Array.isArray(track.artists)) return [];
        
        return track.artists.map(artist => ({
          id: artist?.id || '',
          name: artist?.name || 'Artist'
        }));
      };
      
      const artists = safeGetArtists();
      const artistNames = artists.map(a => a.name).join(', ') || 'Artist';
      
      const albumObj = track.album ? {
        id: track.album?.id || '',
        name: track.album?.name || 'Album',
        images: Array.isArray(track.thumbnails) ? track.thumbnails : []
      } : null;
      
      // Get best thumbnail if available
      let thumbnailUrl = null;
      if (Array.isArray(track.thumbnails) && track.thumbnails.length > 0) {
        thumbnailUrl = this.getBestThumbnail(track.thumbnails);
      }
      
      // Default thumbnail if none available
      const defaultThumbnail = 'https://i.ytimg.com/vi/default/default.jpg';
      
      // Make sure we have a valid duration
      let duration = '0:00';
      let duration_ms = 0;
      
      if (track.duration) {
        duration = track.duration;
        duration_ms = this.convertDurationToMs(track.duration);
      } else if (track.lengthSeconds) {
        // Convert seconds to MM:SS format
        const minutes = Math.floor(track.lengthSeconds / 60);
        const seconds = track.lengthSeconds % 60;
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        duration_ms = track.lengthSeconds * 1000;
      }
      
      return {
        id: track.videoId || '',
        name: track.title || 'Track',
        artist: artistNames,
        artists: artists,
        album: albumObj,
        duration: duration,
        duration_ms: duration_ms,
        image: thumbnailUrl || defaultThumbnail,
        youtube_id: track.videoId || '',
        youtube_image: thumbnailUrl || defaultThumbnail,
        audio_url: track.watchUrl || (track.videoId ? `https://www.youtube.com/watch?v=${track.videoId}` : ''),
        embed_url: track.embedUrl || (track.videoId ? `https://www.youtube.com/embed/${track.videoId}` : ''),
        isDemo: false,
        source: ''
      };
    } catch (error) {
      console.error('Error normalizing track data:', error, track);
      // Return minimal object to avoid breaking the UI
      return {
        id: track.videoId || '',
        name: track.title || 'Track',
        artist: 'Artist',
        artists: [],
        duration: '0:00',
        duration_ms: 0,
        image: 'https://i.ytimg.com/vi/default/default.jpg',
        youtube_id: track.videoId || '',
        youtube_image: 'https://i.ytimg.com/vi/default/default.jpg',
        isDemo: false,
        source: ''
      };
    }
  }
  
  // Normalize artist data
  normalizeArtist(artist) {
    if (!artist) return null;
    
    return {
      id: artist.id || artist.channelId,
      name: artist.name,
      image: artist.thumbnails && artist.thumbnails.length > 0 ? this.getBestThumbnail(artist.thumbnails) : null,
      url: artist.url,
      source: 'YouTube Music'
    };
  }
  
  // Normalize album data
  normalizeAlbum(album) {
    if (!album) return null;
    
    return {
      id: album.id || album.browseId,
      name: album.title || album.name,
      artist: album.artists ? album.artists.map(artist => artist.name).join(', ') : '',
      artists: album.artists ? album.artists.map(artist => ({
        id: artist.id,
        name: artist.name
      })) : [],
      image: album.thumbnails && album.thumbnails.length > 0 ? this.getBestThumbnail(album.thumbnails) : null,
      year: album.year,
      trackCount: album.trackCount || 0,
      source: 'YouTube Music'
    };
  }
  
  // Normalize playlist data
  normalizePlaylist(playlist) {
    if (!playlist) return null;
    
    return {
      id: playlist.id || playlist.browseId,
      title: playlist.title || playlist.name,
      description: playlist.description || '',
      image: playlist.thumbnails && playlist.thumbnails.length > 0 ? this.getBestThumbnail(playlist.thumbnails) : null,
      trackCount: playlist.trackCount || 0,
      author: playlist.author ? {
        name: playlist.author.name,
        id: playlist.author.id
      } : null,
      source: 'YouTube Music'
    };
  }
  
  // Convert HH:MM:SS format to milliseconds
  convertDurationToMs(duration) {
    if (!duration) return 0;
    
    // Handle different formats of duration that might come from the API
    if (typeof duration === 'number') {
      // If it's already a number, assume it's seconds and convert to ms
      return duration * 1000;
    }
    
    if (typeof duration !== 'string') {
      return 0;
    }
    
    try {
      const parts = duration.split(':').map(part => parseInt(part, 10));
      
      if (parts.length === 3) {
        // HH:MM:SS
        return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
      } else if (parts.length === 2) {
        // MM:SS
        return (parts[0] * 60 + parts[1]) * 1000;
      }
    } catch (error) {
      console.error('Error converting duration to milliseconds:', error);
    }
    
    return 0;
  }
  
  // Clear all caches
  clearCache() {
    Object.values(this.cache).forEach(cache => cache.clear());
  }
}

// Create and export a singleton instance
const ytMusicApi = new YTMusicApiService();
export default ytMusicApi;
