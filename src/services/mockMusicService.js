// Mock music service providing realistic music data
// This service provides comprehensive music data including genres, artists, albums, tracks, and playlists

class MockMusicService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 10 * 60 * 1000; // 10 minutes
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

  // Simulate API delay
  async simulateDelay(ms = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get featured playlists
  async getFeaturedPlaylists(limit = 6) {
    await this.simulateDelay();
    const cacheKey = `featured_playlists_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const playlists = mockData.featuredPlaylists.slice(0, limit);
    this.setCache(cacheKey, playlists);
    return playlists;
  }

  // Get top tracks
  async getTopTracks(limit = 20) {
    await this.simulateDelay();
    const cacheKey = `top_tracks_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const tracks = mockData.topTracks.slice(0, limit);
    this.setCache(cacheKey, tracks);
    return tracks;
  }

  // Get recently played tracks
  async getRecentlyPlayedTracks(limit = 10) {
    await this.simulateDelay();
    const cacheKey = `recently_played_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const recentTracks = mockData.recentlyPlayed.slice(0, limit);
    this.setCache(cacheKey, recentTracks);
    return recentTracks;
  }

  // Get genres
  async getGenres() {
    await this.simulateDelay();
    const cached = this.getCache('genres');
    if (cached) return cached;

    const genres = mockData.genres;
    this.setCache('genres', genres);
    return genres;
  }

  // Get artists
  async getArtists(limit = 20) {
    await this.simulateDelay();
    const cacheKey = `artists_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const artists = mockData.artists.slice(0, limit);
    this.setCache(cacheKey, artists);
    return artists;
  }

  // Search functionality
  async search(query, type = 'all', limit = 20) {
    await this.simulateDelay(300);
    
    if (!query || query.trim() === '') {
      return {
        tracks: [],
        artists: [],
        albums: [],
        playlists: []
      };
    }

    const searchQuery = query.toLowerCase().trim();
    const results = {
      tracks: [],
      artists: [],
      albums: [],
      playlists: []
    };

    // Search tracks
    if (type === 'all' || type === 'track') {
      results.tracks = mockData.topTracks.filter(track =>
        track.name.toLowerCase().includes(searchQuery) ||
        track.artists.some(artist => artist.name.toLowerCase().includes(searchQuery)) ||
        track.album.name.toLowerCase().includes(searchQuery)
      ).slice(0, limit);
    }

    // Search artists
    if (type === 'all' || type === 'artist') {
      results.artists = mockData.artists.filter(artist =>
        artist.name.toLowerCase().includes(searchQuery) ||
        artist.genres.some(genre => genre.toLowerCase().includes(searchQuery))
      ).slice(0, limit);
    }

    // Search albums (derived from tracks)
    if (type === 'all' || type === 'album') {
      const albums = new Map();
      mockData.topTracks.forEach(track => {
        const album = track.album;
        if (album.name.toLowerCase().includes(searchQuery) ||
            track.artists.some(artist => artist.name.toLowerCase().includes(searchQuery))) {
          albums.set(album.id, album);
        }
      });
      results.albums = Array.from(albums.values()).slice(0, limit);
    }

    // Search playlists
    if (type === 'all' || type === 'playlist') {
      results.playlists = mockData.featuredPlaylists.filter(playlist =>
        playlist.name.toLowerCase().includes(searchQuery) ||
        playlist.description.toLowerCase().includes(searchQuery)
      ).slice(0, limit);
    }

    return results;
  }

  // Get tracks by genre
  async getTracksByGenre(genre, limit = 20) {
    await this.simulateDelay();
    const cacheKey = `tracks_genre_${genre}_${limit}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    // Filter tracks by genre (simple matching for demo)
    const tracks = mockData.topTracks.filter(track =>
      track.genres?.includes(genre.toLowerCase()) ||
      track.artists.some(artist => 
        mockData.artists.find(a => a.id === artist.id)?.genres.includes(genre.toLowerCase())
      )
    ).slice(0, limit);

    this.setCache(cacheKey, tracks);
    return tracks;
  }

  // Get album tracks
  async getAlbumTracks(albumId) {
    await this.simulateDelay();
    const tracks = mockData.topTracks.filter(track => track.album.id === albumId);
    return tracks;
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId, limit = 10) {
    await this.simulateDelay();
    const tracks = mockData.topTracks.filter(track =>
      track.artists.some(artist => artist.id === artistId)
    ).slice(0, limit);
    return tracks;
  }

  // Get recommendations based on seed
  async getRecommendations(seedTrackIds = [], seedArtistIds = [], seedGenres = [], limit = 20) {
    await this.simulateDelay();
    
    // Simple recommendation logic - return random tracks with some relevance
    let recommendations = [...mockData.topTracks];
    
    // If we have seed genres, prefer tracks from those genres
    if (seedGenres.length > 0) {
      const genreMatches = recommendations.filter(track =>
        track.genres?.some(genre => seedGenres.includes(genre)) ||
        track.artists.some(artist => {
          const artistData = mockData.artists.find(a => a.id === artist.id);
          return artistData?.genres.some(genre => seedGenres.includes(genre));
        })
      );
      
      if (genreMatches.length > 0) {
        recommendations = genreMatches;
      }
    }
    
    // Shuffle and limit
    return recommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }
}

// Comprehensive mock data
const mockData = {
  featuredPlaylists: [
    {
      id: 'playlist-1',
      name: 'Today\'s Top Hits',
      description: 'The most played songs right now',
      images: [
        { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
      ],
      tracks: { total: 50 },
      external_urls: { web: '#' },
      type: 'playlist',
      owner: { display_name: 'Fonos', id: 'fonos' }
    },
    {
      id: 'playlist-2',
      name: 'Chill Indie',
      description: 'Relaxed indie vibes for any moment',
      images: [
        { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop', height: 300, width: 300 }
      ],
      tracks: { total: 35 },
      external_urls: { web: '#' },
      type: 'playlist',
      owner: { display_name: 'Indie Curator', id: 'indie-curator' }
    },
    {
      id: 'playlist-3',
      name: 'Electronic Beats',
      description: 'High-energy electronic music',
      images: [
        { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }
      ],
      tracks: { total: 42 },
      external_urls: { web: '#' },
      type: 'playlist',
      owner: { display_name: 'EDM Central', id: 'edm-central' }
    },
    {
      id: 'playlist-4',
      name: 'Jazz Classics',
      description: 'Timeless jazz standards',
      images: [
        { url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
      ],
      tracks: { total: 28 },
      external_urls: { web: '#' },
      type: 'playlist',
      owner: { display_name: 'Jazz Legends', id: 'jazz-legends' }
    },
    {
      id: 'playlist-5',
      name: 'Rock Anthems',
      description: 'Epic rock songs that never get old',
      images: [
        { url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop', height: 300, width: 300 }
      ],
      tracks: { total: 38 },
      external_urls: { web: '#' },
      type: 'playlist',
      owner: { display_name: 'Rock Vault', id: 'rock-vault' }
    },
    {
      id: 'playlist-6',
      name: 'Lo-Fi Study',
      description: 'Perfect background music for focus',
      images: [
        { url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop', height: 300, width: 300 }
      ],
      tracks: { total: 45 },
      external_urls: { web: '#' },
      type: 'playlist',
      owner: { display_name: 'Study Beats', id: 'study-beats' }
    }
  ],

  topTracks: [
    {
      id: 'track-1',
      name: 'Midnight Drive',
      artists: [{ id: 'artist-1', name: 'Luna Eclipse', external_urls: { web: '#' } }],
      album: {
        id: 'album-1',
        name: 'Neon Nights',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 234000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 85,
      genres: ['synthwave', 'electronic']
    },
    {
      id: 'track-2',
      name: 'Ocean Waves',
      artists: [{ id: 'artist-2', name: 'Coastal Drift', external_urls: { web: '#' } }],
      album: {
        id: 'album-2',
        name: 'Tidal',
        images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 198000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 78,
      genres: ['indie', 'ambient']
    },
    {
      id: 'track-3',
      name: 'Thunder & Lightning',
      artists: [{ id: 'artist-3', name: 'Storm Riders', external_urls: { web: '#' } }],
      album: {
        id: 'album-3',
        name: 'Electric Sky',
        images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 267000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 92,
      genres: ['rock', 'hard rock']
    },
    {
      id: 'track-4',
      name: 'Coffee Shop Blues',
      artists: [{ id: 'artist-4', name: 'Miles Davis Jr.', external_urls: { web: '#' } }],
      album: {
        id: 'album-4',
        name: 'Urban Jazz',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 312000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 71,
      genres: ['jazz', 'blues']
    },
    {
      id: 'track-5',
      name: 'Digital Dreams',
      artists: [{ id: 'artist-5', name: 'Cyber Pulse', external_urls: { web: '#' } }],
      album: {
        id: 'album-5',
        name: 'Future Sounds',
        images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 245000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 88,
      genres: ['electronic', 'techno']
    },
    {
      id: 'track-6',
      name: 'Mountain High',
      artists: [{ id: 'artist-6', name: 'Alpine Echo', external_urls: { web: '#' } }],
      album: {
        id: 'album-6',
        name: 'Peaks & Valleys',
        images: [{ url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 189000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 76,
      genres: ['folk', 'indie']
    },
    {
      id: 'track-7',
      name: 'Neon Lights',
      artists: [{ id: 'artist-7', name: 'City Nights', external_urls: { web: '#' } }],
      album: {
        id: 'album-7',
        name: 'Urban Glow',
        images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 221000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 83,
      genres: ['synthpop', 'electronic']
    },
    {
      id: 'track-8',
      name: 'Sunset Boulevard',
      artists: [{ id: 'artist-8', name: 'Golden Hour', external_urls: { web: '#' } }],
      album: {
        id: 'album-8',
        name: 'California Dreams',
        images: [{ url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', height: 300, width: 300 }]
      },
      duration_ms: 203000,
      external_urls: { web: '#' },
      preview_url: null,
      type: 'track',
      popularity: 79,
      genres: ['pop', 'indie pop']
    }
  ],

  recentlyPlayed: [
    {
      track: {
        id: 'track-1',
        name: 'Midnight Drive',
        artists: [{ id: 'artist-1', name: 'Luna Eclipse', external_urls: { web: '#' } }],
        album: {
          id: 'album-1',
          name: 'Neon Nights',
          images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }]
        },
        duration_ms: 234000,
        external_urls: { web: '#' },
        preview_url: null,
        type: 'track'
      },
      played_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      track: {
        id: 'track-3',
        name: 'Thunder & Lightning',
        artists: [{ id: 'artist-3', name: 'Storm Riders', external_urls: { web: '#' } }],
        album: {
          id: 'album-3',
          name: 'Electric Sky',
          images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }]
        },
        duration_ms: 267000,
        external_urls: { web: '#' },
        preview_url: null,
        type: 'track'
      },
      played_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    }
  ],

  genres: [
    { id: 'pop', name: 'Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
    { id: 'rock', name: 'Rock', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop' },
    { id: 'hip-hop', name: 'Hip Hop', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop' },
    { id: 'jazz', name: 'Jazz', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
    { id: 'electronic', name: 'Electronic', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop' },
    { id: 'indie', name: 'Indie', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop' },
    { id: 'classical', name: 'Classical', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
    { id: 'country', name: 'Country', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop' }
  ],

  artists: [
    {
      id: 'artist-1',
      name: 'Luna Eclipse',
      images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }],
      genres: ['synthwave', 'electronic'],
      popularity: 85,
      followers: { total: 1250000 },
      external_urls: { web: '#' },
      type: 'artist'
    },
    {
      id: 'artist-2',
      name: 'Coastal Drift',
      images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop', height: 300, width: 300 }],
      genres: ['indie', 'ambient'],
      popularity: 78,
      followers: { total: 890000 },
      external_urls: { web: '#' },
      type: 'artist'
    },
    {
      id: 'artist-3',
      name: 'Storm Riders',
      images: [{ url: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop', height: 300, width: 300 }],
      genres: ['rock', 'hard rock'],
      popularity: 92,
      followers: { total: 2100000 },
      external_urls: { web: '#' },
      type: 'artist'
    },
    {
      id: 'artist-4',
      name: 'Miles Davis Jr.',
      images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }],
      genres: ['jazz', 'blues'],
      popularity: 71,
      followers: { total: 650000 },
      external_urls: { web: '#' },
      type: 'artist'
    },
    {
      id: 'artist-5',
      name: 'Cyber Pulse',
      images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }],
      genres: ['electronic', 'techno'],
      popularity: 88,
      followers: { total: 1500000 },
      external_urls: { web: '#' },
      type: 'artist'
    }
  ]
};

// Create and export a singleton instance
const mockMusicService = new MockMusicService();
export default mockMusicService;
