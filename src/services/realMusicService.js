// Real Music API Service - Free APIs for streaming music
// Combines Jamendo API (streaming tracks) and MusicBrainz API (metadata)

// Free API endpoints
const JAMENDO_API = 'https://api.jamendo.com/v3.0';
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const LAST_FM_API = 'http://ws.audioscrobbler.com/2.0';

// API Keys - Jamendo requires free registration at https://devportal.jamendo.com/
const JAMENDO_CLIENT_ID = process.env.VITE_JAMENDO_CLIENT_ID || 'your_jamendo_client_id';

class RealMusicService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 15 * 60 * 1000; // 15 minutes
    this.userAgent = 'Fonos/1.0 ( https://github.com/dinanathdash/fonos )';
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // Helper to handle rate limiting for MusicBrainz (1 request per second)
  async rateLimitedFetch(url, options = {}) {
    const headers = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
      ...options.headers
    };

    // MusicBrainz rate limiting
    if (url.includes('musicbrainz.org')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return fetch(url, { ...options, headers });
  }

  // Get featured playlists from Jamendo
  async getFeaturedPlaylists(limit = 6) {
    const cacheKey = `featured_playlists_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${JAMENDO_API}/playlists/featured?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&include=tracks`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured playlists');
      }

      const data = await response.json();
      
      const playlists = data.results.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || 'Curated playlist from Jamendo',
        images: [
          { url: playlist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
        ],
        tracks: { total: playlist.tracks?.length || 0 },
        external_urls: { web: playlist.shareurl || '#' },
        type: 'playlist',
        owner: { display_name: 'Jamendo', id: 'jamendo' }
      }));

      this.setCache(cacheKey, playlists);
      return playlists;
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      return this.getFallbackPlaylists();
    }
  }

  // Get top tracks from Jamendo
  async getTopTracks(limit = 20) {
    const cacheKey = `top_tracks_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${JAMENDO_API}/tracks/featured?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch top tracks');
      }

      const data = await response.json();
      
      const tracks = data.results.map(track => ({
        id: track.id,
        name: track.name,
        artists: [{
          id: track.artist_id,
          name: track.artist_name,
          external_urls: { web: track.artist_shareurl || '#' }
        }],
        album: {
          id: track.album_id,
          name: track.album_name,
          images: [
            { url: track.album_image || track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
          ]
        },
        duration_ms: track.duration * 1000, // Convert seconds to milliseconds
        external_urls: { web: track.shareurl || '#' },
        preview_url: track.audiodownload_allowed ? track.audiodownload : null,
        audio_url: track.audio, // Full streaming URL from Jamendo
        type: 'track',
        popularity: Math.floor(Math.random() * 100), // Simulated popularity
        genres: track.musicinfo?.tags?.vartags || []
      }));

      this.setCache(cacheKey, tracks);
      return tracks;
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return this.getFallbackTracks();
    }
  }

  // Get recently played tracks (simulated with random selection)
  async getRecentlyPlayedTracks(limit = 10) {
    try {
      const allTracks = await this.getTopTracks(50);
      const recentTracks = allTracks
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .map(track => ({
          track,
          played_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }));

      return recentTracks;
    } catch (error) {
      console.error('Error fetching recently played tracks:', error);
      return [];
    }
  }

  // Get genres from MusicBrainz
  async getGenres() {
    const cached = this.getCache('genres');
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${MUSICBRAINZ_API}/genre/all?limit=50&fmt=json`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }

      const data = await response.json();
      
      const genres = data.genres.map(genre => ({
        id: genre.id,
        name: genre.name,
        image: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=300&h=300&fit=crop`
      }));

      this.setCache('genres', genres);
      return genres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      return this.getFallbackGenres();
    }
  }

  // Search functionality combining both APIs
  async search(query, type = 'all', limit = 20) {
    if (!query || query.trim() === '') {
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      };
    }

    try {
      const results = {
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      };

      // Search tracks on Jamendo
      if (type === 'all' || type === 'track') {
        const trackResponse = await fetch(
          `${JAMENDO_API}/tracks?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&search=${encodeURIComponent(query)}&include=musicinfo&audioformat=mp32`
        );
        
        if (trackResponse.ok) {
          const trackData = await trackResponse.json();
          results.tracks = trackData.results.map(track => ({
            id: track.id,
            name: track.name,
            artists: [{
              id: track.artist_id,
              name: track.artist_name,
              external_urls: { web: track.artist_shareurl || '#' }
            }],
            album: {
              id: track.album_id,
              name: track.album_name,
              images: [
                { url: track.album_image || track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
              ]
            },
            duration_ms: track.duration * 1000,
            external_urls: { web: track.shareurl || '#' },
            preview_url: track.audiodownload_allowed ? track.audiodownload : null,
            audio_url: track.audio,
            type: 'track',
            popularity: Math.floor(Math.random() * 100),
            genres: track.musicinfo?.tags?.vartags || []
          }));
        }
      }

      // Search artists on Jamendo
      if (type === 'all' || type === 'artist') {
        const artistResponse = await fetch(
          `${JAMENDO_API}/artists?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&search=${encodeURIComponent(query)}`
        );
        
        if (artistResponse.ok) {
          const artistData = await artistResponse.json();
          results.artists = artistData.results.map(artist => ({
            id: artist.id,
            name: artist.name,
            images: [
              { url: artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
            ],
            genres: [],
            popularity: Math.floor(Math.random() * 100),
            followers: { total: Math.floor(Math.random() * 100000) },
            external_urls: { web: artist.shareurl || '#' },
            type: 'artist'
          }));
        }
      }

      // Search albums on Jamendo
      if (type === 'all' || type === 'album') {
        const albumResponse = await fetch(
          `${JAMENDO_API}/albums?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&search=${encodeURIComponent(query)}&include=musicinfo`
        );
        
        if (albumResponse.ok) {
          const albumData = await albumResponse.json();
          results.albums = albumData.results.map(album => ({
            id: album.id,
            name: album.name,
            artists: [{
              id: album.artist_id,
              name: album.artist_name
            }],
            images: [
              { url: album.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
            ],
            release_date: album.releasedate,
            total_tracks: 0,
            type: 'album'
          }));
        }
      }

      return results;
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

  // Get tracks by genre
  async getTracksByGenre(genre, limit = 20) {
    const cacheKey = `tracks_genre_${genre}_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${JAMENDO_API}/tracks?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&tags=${encodeURIComponent(genre)}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch tracks by genre');
      }

      const data = await response.json();
      
      const tracks = data.results.map(track => ({
        id: track.id,
        name: track.name,
        artists: [{
          id: track.artist_id,
          name: track.artist_name,
          external_urls: { web: track.artist_shareurl || '#' }
        }],
        album: {
          id: track.album_id,
          name: track.album_name,
          images: [
            { url: track.album_image || track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
          ]
        },
        duration_ms: track.duration * 1000,
        external_urls: { web: track.shareurl || '#' },
        preview_url: track.audiodownload_allowed ? track.audiodownload : null,
        audio_url: track.audio,
        type: 'track',
        popularity: Math.floor(Math.random() * 100),
        genres: track.musicinfo?.tags?.vartags || [genre]
      }));

      this.setCache(cacheKey, tracks);
      return tracks;
    } catch (error) {
      console.error('Error fetching tracks by genre:', error);
      return [];
    }
  }

  // Get artists from Jamendo
  async getArtists(limit = 20) {
    const cacheKey = `artists_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(
        `${JAMENDO_API}/artists/featured?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }

      const data = await response.json();
      
      const artists = data.results.map(artist => ({
        id: artist.id,
        name: artist.name,
        images: [
          { url: artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
        ],
        genres: [],
        popularity: Math.floor(Math.random() * 100),
        followers: { total: Math.floor(Math.random() * 100000) },
        external_urls: { web: artist.shareurl || '#' },
        type: 'artist'
      }));

      this.setCache(cacheKey, artists);
      return artists;
    } catch (error) {
      console.error('Error fetching artists:', error);
      return [];
    }
  }

  // Get album tracks
  async getAlbumTracks(albumId) {
    try {
      const response = await fetch(
        `${JAMENDO_API}/albums/tracks?client_id=${JAMENDO_CLIENT_ID}&format=json&id=${albumId}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch album tracks');
      }

      const data = await response.json();
      
      return data.results.map(track => ({
        id: track.id,
        name: track.name,
        artists: [{
          id: track.artist_id,
          name: track.artist_name,
          external_urls: { web: track.artist_shareurl || '#' }
        }],
        album: {
          id: track.album_id,
          name: track.album_name,
          images: [
            { url: track.album_image || track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
          ]
        },
        duration_ms: track.duration * 1000,
        external_urls: { web: track.shareurl || '#' },
        preview_url: track.audiodownload_allowed ? track.audiodownload : null,
        audio_url: track.audio,
        type: 'track',
        track_number: track.position || 1
      }));
    } catch (error) {
      console.error('Error fetching album tracks:', error);
      return [];
    }
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId, limit = 10) {
    try {
      const response = await fetch(
        `${JAMENDO_API}/artists/tracks?client_id=${JAMENDO_CLIENT_ID}&format=json&id=${artistId}&limit=${limit}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch artist tracks');
      }

      const data = await response.json();
      
      return data.results.map(track => ({
        id: track.id,
        name: track.name,
        artists: [{
          id: track.artist_id,
          name: track.artist_name,
          external_urls: { web: track.artist_shareurl || '#' }
        }],
        album: {
          id: track.album_id,
          name: track.album_name,
          images: [
            { url: track.album_image || track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
          ]
        },
        duration_ms: track.duration * 1000,
        external_urls: { web: track.shareurl || '#' },
        preview_url: track.audiodownload_allowed ? track.audiodownload : null,
        audio_url: track.audio,
        type: 'track',
        popularity: Math.floor(Math.random() * 100)
      }));
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
      return [];
    }
  }

  // Get recommendations (random selection for now)
  async getRecommendations(seedTrackIds = [], seedArtistIds = [], seedGenres = [], limit = 20) {
    try {
      // Use genre-based recommendations if genres are provided
      if (seedGenres.length > 0) {
        const genre = seedGenres[0];
        return await this.getTracksByGenre(genre, limit);
      }
      
      // Otherwise return random featured tracks
      const tracks = await this.getTopTracks(limit * 2);
      return tracks.sort(() => Math.random() - 0.5).slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // User library methods (using local storage for demo)
  async getUserSavedTracks(limit = 50) {
    try {
      const savedTrackIds = JSON.parse(localStorage.getItem('fonos_saved_tracks') || '[]');
      if (savedTrackIds.length === 0) {
        // Return some featured tracks as default saved tracks
        return await this.getTopTracks(Math.min(limit, 10));
      }
      
      // For demo, return featured tracks (in real app, fetch by IDs)
      return await this.getTopTracks(Math.min(limit, savedTrackIds.length));
    } catch (error) {
      console.error('Error fetching saved tracks:', error);
      return [];
    }
  }

  async getUserPlaylists(limit = 20) {
    return await this.getFeaturedPlaylists(limit);
  }

  async getPlaylistTracks(playlistId, limit = 100) {
    try {
      const response = await fetch(
        `${JAMENDO_API}/playlists/tracks?client_id=${JAMENDO_CLIENT_ID}&format=json&id=${playlistId}&limit=${limit}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch playlist tracks');
      }

      const data = await response.json();
      
      return data.results.map(track => ({
        id: track.id,
        name: track.name,
        artists: [{
          id: track.artist_id,
          name: track.artist_name,
          external_urls: { web: track.artist_shareurl || '#' }
        }],
        album: {
          id: track.album_id,
          name: track.album_name,
          images: [
            { url: track.album_image || track.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
          ]
        },
        duration_ms: track.duration * 1000,
        external_urls: { web: track.shareurl || '#' },
        preview_url: track.audiodownload_allowed ? track.audiodownload : null,
        audio_url: track.audio,
        type: 'track',
        added_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching playlist tracks:', error);
      return [];
    }
  }

  // Save/remove tracks (local storage simulation)
  async saveTrack(trackId) {
    try {
      const savedTracks = JSON.parse(localStorage.getItem('fonos_saved_tracks') || '[]');
      if (!savedTracks.includes(trackId)) {
        savedTracks.push(trackId);
        localStorage.setItem('fonos_saved_tracks', JSON.stringify(savedTracks));
      }
      return { success: true };
    } catch (error) {
      console.error('Error saving track:', error);
      return { success: false };
    }
  }

  async removeTrack(trackId) {
    try {
      const savedTracks = JSON.parse(localStorage.getItem('fonos_saved_tracks') || '[]');
      const updatedTracks = savedTracks.filter(id => id !== trackId);
      localStorage.setItem('fonos_saved_tracks', JSON.stringify(updatedTracks));
      return { success: true };
    } catch (error) {
      console.error('Error removing track:', error);
      return { success: false };
    }
  }

  async isTrackSaved(trackId) {
    try {
      const savedTracks = JSON.parse(localStorage.getItem('fonos_saved_tracks') || '[]');
      return savedTracks.includes(trackId);
    } catch (error) {
      console.error('Error checking if track is saved:', error);
      return false;
    }
  }

  // Fallback methods for when APIs are unavailable
  getFallbackPlaylists() {
    return [
      {
        id: 'fallback-1',
        name: 'Chill Vibes',
        description: 'Relaxing music for any time',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }],
        tracks: { total: 25 },
        external_urls: { web: '#' },
        type: 'playlist',
        owner: { display_name: 'Fonos', id: 'fonos' }
      },
      {
        id: 'fallback-2',
        name: 'Electronic Beats',
        description: 'High energy electronic music',
        images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }],
        tracks: { total: 30 },
        external_urls: { web: '#' },
        type: 'playlist',
        owner: { display_name: 'Fonos', id: 'fonos' }
      }
    ];
  }

  getFallbackTracks() {
    return [
      {
        id: 'fallback-track-1',
        name: 'Demo Track',
        artists: [{ id: 'fallback-artist-1', name: 'Demo Artist', external_urls: { web: '#' } }],
        album: {
          id: 'fallback-album-1',
          name: 'Demo Album',
          images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }]
        },
        duration_ms: 180000,
        external_urls: { web: '#' },
        preview_url: null,
        audio_url: null,
        type: 'track',
        popularity: 75
      }
    ];
  }

  getFallbackGenres() {
    return [
      { id: 'rock', name: 'Rock', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop' },
      { id: 'pop', name: 'Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
      { id: 'electronic', name: 'Electronic', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop' },
      { id: 'jazz', name: 'Jazz', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }
    ];
  }
}

// Create and export a singleton instance
const realMusicService = new RealMusicService();
export default realMusicService;
