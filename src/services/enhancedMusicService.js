// Enhanced Music API Service - Combining multiple free music APIs for vast catalog
// Primary APIs: Jamendo, FreeCodeCamp, Internet Archive, Bandcamp, SoundCloud

const JAMENDO_API = 'https://api.jamendo.com/v3.0';
const FREESOUND_API = 'https://freesound.org/apiv2';
const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const DEEZER_API = 'https://api.deezer.com';
const RADIO_BROWSER_API = 'https://de1.api.radio-browser.info/json';

class EnhancedMusicService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 15 * 60 * 1000; // 15 minutes
    this.userAgent = 'Fonos/1.0 ( https://github.com/dinanathdash/fonos )';
    this.jamendoClientId = import.meta.env.VITE_JAMENDO_CLIENT_ID || 'your_jamendo_client_id';
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

  // Enhanced rate limiting for different APIs
  async rateLimitedFetch(url, options = {}) {
    const headers = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
      ...options.headers
    };

    // Different rate limits for different APIs
    if (url.includes('musicbrainz.org')) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 request per second
    } else if (url.includes('freesound.org')) {
      await new Promise(resolve => setTimeout(resolve, 200)); // 5 requests per second
    }

    return fetch(url, { ...options, headers });
  }

  // Get expanded featured playlists from multiple sources
  async getFeaturedPlaylists(limit = 8) {
    const cached = this.getCache('featured_playlists');
    if (cached) return cached.slice(0, limit);

    try {
      const results = await Promise.allSettled([
        this.getJamendoPlaylists(4),
        this.getDeezerPlaylists(4),
        this.getRadioStations(4)
      ]);

      const jamendoPlaylists = results[0].status === 'fulfilled' ? results[0].value : [];
      const deezerPlaylists = results[1].status === 'fulfilled' ? results[1].value : [];
      const radioPlaylists = results[2].status === 'fulfilled' ? results[2].value : [];

      const allPlaylists = [
        ...jamendoPlaylists,
        ...deezerPlaylists,
        ...radioPlaylists
      ].slice(0, limit);

      this.setCache('featured_playlists', allPlaylists);
      return allPlaylists;
    } catch (error) {
      console.error('Error fetching featured playlists:', error);
      return this.getFallbackPlaylists();
    }
  }

  // Get Jamendo playlists
  async getJamendoPlaylists(limit = 4) {
    try {
      const response = await this.rateLimitedFetch(
        `${JAMENDO_API}/playlists/?client_id=${this.jamendoClientId}&format=json&limit=${limit}&order=popularity_total`
      );

      if (!response.ok) throw new Error('Jamendo playlists failed');

      const data = await response.json();
      return data.results.map(playlist => ({
        id: `jamendo_${playlist.id}`,
        name: playlist.name,
        description: playlist.text || `Popular ${playlist.name} playlist`,
        images: [{ 
          url: playlist.sharepic || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          height: 300, 
          width: 300 
        }],
        tracks: { total: playlist.num_tracks || 20 },
        external_urls: { web: playlist.shareurl || '#' },
        type: 'playlist',
        source: 'jamendo'
      }));
    } catch (error) {
      console.error('Error fetching Jamendo playlists:', error);
      return [];
    }
  }

  // Get Deezer playlists (metadata only - no streaming)
  async getDeezerPlaylists(limit = 4) {
    try {
      const response = await this.rateLimitedFetch(
        `${DEEZER_API}/chart/0/playlists?limit=${limit}`
      );

      if (!response.ok) throw new Error('Deezer playlists failed');

      const data = await response.json();
      return data.data.map(playlist => ({
        id: `deezer_${playlist.id}`,
        name: playlist.title,
        description: `${playlist.nb_tracks} tracks • Popular playlist`,
        images: [{ 
          url: playlist.picture_medium || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
          height: 300, 
          width: 300 
        }],
        tracks: { total: playlist.nb_tracks },
        external_urls: { web: playlist.link },
        type: 'playlist',
        source: 'deezer'
      }));
    } catch (error) {
      console.error('Error fetching Deezer playlists:', error);
      return [];
    }
  }

  // Get radio stations as playlists
  async getRadioStations(limit = 4) {
    try {
      const response = await this.rateLimitedFetch(
        `${RADIO_BROWSER_API}/stations/topvote/${limit}`
      );

      if (!response.ok) throw new Error('Radio stations failed');

      const data = await response.json();
      return data.map(station => ({
        id: `radio_${station.stationuuid}`,
        name: `${station.name} Radio`,
        description: `Live radio • ${station.country} • ${station.tags}`,
        images: [{ 
          url: station.favicon || 'https://images.unsplash.com/photo-1487537023671-8dce1a785863?w=300&h=300&fit=crop',
          height: 300, 
          width: 300 
        }],
        tracks: { total: 1 },
        external_urls: { web: station.homepage || '#' },
        type: 'radio',
        source: 'radio-browser',
        streamUrl: station.url_resolved
      }));
    } catch (error) {
      console.error('Error fetching radio stations:', error);
      return [];
    }
  }

  // Enhanced track search across multiple APIs
  async getTopTracks(limit = 20) {
    const cached = this.getCache('top_tracks');
    if (cached) return cached.slice(0, limit);

    try {
      const results = await Promise.allSettled([
        this.getJamendoTracks(Math.ceil(limit * 0.7)), // 70% from Jamendo
        this.getDeezerTracks(Math.ceil(limit * 0.3))   // 30% from Deezer
      ]);

      const jamendoTracks = results[0].status === 'fulfilled' ? results[0].value : [];
      const deezerTracks = results[1].status === 'fulfilled' ? results[1].value : [];

      const allTracks = [...jamendoTracks, ...deezerTracks]
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, limit);

      this.setCache('top_tracks', allTracks);
      return allTracks;
    } catch (error) {
      console.error('Error fetching top tracks:', error);
      return this.getFallbackTracks();
    }
  }

  // Get tracks from Jamendo with streaming URLs
  async getJamendoTracks(limit = 15) {
    try {
      const response = await this.rateLimitedFetch(
        `${JAMENDO_API}/tracks/?client_id=${this.jamendoClientId}&format=json&limit=${limit}&order=popularity_total&include=musicinfo,licenses`
      );

      if (!response.ok) throw new Error('Jamendo tracks failed');

      const data = await response.json();
      return data.results.map(track => ({
        id: `jamendo_${track.id}`,
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
            { url: track.album_image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }
          ]
        },
        duration_ms: track.duration * 1000,
        external_urls: { web: track.shareurl || '#' },
        audio_url: track.audio, // Full streaming URL
        preview_url: track.audiodownload_allowed ? track.audiodownload : null,
        type: 'track',
        popularity: Math.floor(Math.random() * 100),
        genres: track.musicinfo?.tags?.vartags || [],
        source: 'jamendo',
        explicit: false, // Jamendo is family-friendly
        license: track.license_ccurl || 'Creative Commons'
      }));
    } catch (error) {
      console.error('Error fetching Jamendo tracks:', error);
      return [];
    }
  }

  // Get track metadata from Deezer (no streaming - just for discovery)
  async getDeezerTracks(limit = 5) {
    try {
      const response = await this.rateLimitedFetch(
        `${DEEZER_API}/chart/0/tracks?limit=${limit}`
      );

      if (!response.ok) throw new Error('Deezer tracks failed');

      const data = await response.json();
      return data.data.map(track => ({
        id: `deezer_${track.id}`,
        name: track.title,
        artists: [{
          id: track.artist.id,
          name: track.artist.name,
          external_urls: { web: track.artist.link }
        }],
        album: {
          id: track.album.id,
          name: track.album.title,
          images: [
            { url: track.album.cover_medium, height: 300, width: 300 }
          ]
        },
        duration_ms: track.duration * 1000,
        external_urls: { web: track.link },
        preview_url: track.preview, // 30-second preview
        type: 'track',
        popularity: track.rank,
        source: 'deezer',
        explicit: track.explicit_lyrics
      }));
    } catch (error) {
      console.error('Error fetching Deezer tracks:', error);
      return [];
    }
  }

  // Enhanced search across multiple APIs
  async search(query, type = 'all', limit = 20) {
    if (!query || query.trim() === '') {
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }

    try {
      const results = await Promise.allSettled([
        this.searchJamendo(query, limit),
        this.searchDeezer(query, Math.ceil(limit / 2)),
        this.searchMusicBrainz(query, Math.ceil(limit / 3))
      ]);

      const jamendoResults = results[0].status === 'fulfilled' ? results[0].value : { tracks: [], artists: [], albums: [] };
      const deezerResults = results[1].status === 'fulfilled' ? results[1].value : { tracks: [], artists: [], albums: [] };
      const musicbrainzResults = results[2].status === 'fulfilled' ? results[2].value : { artists: [], albums: [] };

      return {
        tracks: [...jamendoResults.tracks, ...deezerResults.tracks].slice(0, limit),
        artists: [...jamendoResults.artists, ...deezerResults.artists, ...musicbrainzResults.artists].slice(0, limit),
        albums: [...jamendoResults.albums, ...deezerResults.albums, ...musicbrainzResults.albums].slice(0, limit),
        playlists: jamendoResults.playlists || []
      };
    } catch (error) {
      console.error('Error in enhanced search:', error);
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }
  }

  // Search Jamendo
  async searchJamendo(query, limit = 10) {
    try {
      const [tracksResponse, artistsResponse] = await Promise.all([
        this.rateLimitedFetch(`${JAMENDO_API}/tracks/?client_id=${this.jamendoClientId}&format=json&limit=${limit}&search=${encodeURIComponent(query)}`),
        this.rateLimitedFetch(`${JAMENDO_API}/artists/?client_id=${this.jamendoClientId}&format=json&limit=${limit}&search=${encodeURIComponent(query)}`)
      ]);

      const tracksData = tracksResponse.ok ? await tracksResponse.json() : { results: [] };
      const artistsData = artistsResponse.ok ? await artistsResponse.json() : { results: [] };

      return {
        tracks: tracksData.results.map(track => ({
          id: `jamendo_${track.id}`,
          name: track.name,
          artists: [{ id: track.artist_id, name: track.artist_name }],
          album: { id: track.album_id, name: track.album_name },
          audio_url: track.audio,
          preview_url: track.audiodownload_allowed ? track.audiodownload : null,
          duration_ms: track.duration * 1000,
          source: 'jamendo'
        })),
        artists: artistsData.results.map(artist => ({
          id: `jamendo_${artist.id}`,
          name: artist.name,
          images: [{ url: artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }],
          external_urls: { web: artist.shareurl },
          source: 'jamendo'
        })),
        albums: [],
        playlists: []
      };
    } catch (error) {
      console.error('Error searching Jamendo:', error);
      return { tracks: [], artists: [], albums: [], playlists: [] };
    }
  }

  // Search Deezer
  async searchDeezer(query, limit = 5) {
    try {
      const [tracksResponse, artistsResponse, albumsResponse] = await Promise.all([
        this.rateLimitedFetch(`${DEEZER_API}/search/track?q=${encodeURIComponent(query)}&limit=${limit}`),
        this.rateLimitedFetch(`${DEEZER_API}/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`),
        this.rateLimitedFetch(`${DEEZER_API}/search/album?q=${encodeURIComponent(query)}&limit=${limit}`)
      ]);

      const tracksData = tracksResponse.ok ? await tracksResponse.json() : { data: [] };
      const artistsData = artistsResponse.ok ? await artistsResponse.json() : { data: [] };
      const albumsData = albumsResponse.ok ? await albumsResponse.json() : { data: [] };

      return {
        tracks: tracksData.data.map(track => ({
          id: `deezer_${track.id}`,
          name: track.title,
          artists: [{ id: track.artist.id, name: track.artist.name }],
          album: { id: track.album.id, name: track.album.title },
          preview_url: track.preview,
          duration_ms: track.duration * 1000,
          source: 'deezer'
        })),
        artists: artistsData.data.map(artist => ({
          id: `deezer_${artist.id}`,
          name: artist.name,
          images: [{ url: artist.picture_medium }],
          external_urls: { web: artist.link },
          source: 'deezer'
        })),
        albums: albumsData.data.map(album => ({
          id: `deezer_${album.id}`,
          name: album.title,
          artists: [{ id: album.artist.id, name: album.artist.name }],
          images: [{ url: album.cover_medium }],
          external_urls: { web: album.link },
          source: 'deezer'
        }))
      };
    } catch (error) {
      console.error('Error searching Deezer:', error);
      return { tracks: [], artists: [], albums: [] };
    }
  }

  // Search MusicBrainz
  async searchMusicBrainz(query, limit = 3) {
    try {
      const [artistsResponse, albumsResponse] = await Promise.all([
        this.rateLimitedFetch(`${MUSICBRAINZ_API}/artist?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`),
        this.rateLimitedFetch(`${MUSICBRAINZ_API}/release?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`)
      ]);

      const artistsData = artistsResponse.ok ? await artistsResponse.json() : { artists: [] };
      const albumsData = albumsResponse.ok ? await albumsResponse.json() : { releases: [] };

      return {
        artists: artistsData.artists.map(artist => ({
          id: `mb_${artist.id}`,
          name: artist.name,
          type: artist.type,
          country: artist.country,
          source: 'musicbrainz'
        })),
        albums: albumsData.releases.map(album => ({
          id: `mb_${album.id}`,
          name: album.title,
          date: album.date,
          country: album.country,
          source: 'musicbrainz'
        }))
      };
    } catch (error) {
      console.error('Error searching MusicBrainz:', error);
      return { artists: [], albums: [] };
    }
  }

  // Get genres from multiple sources
  async getGenres() {
    const cached = this.getCache('enhanced_genres');
    if (cached) return cached;

    try {
      const genres = [
        // Popular music genres
        { id: 'pop', name: 'Pop', color: '#ff6b6b', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
        { id: 'rock', name: 'Rock', color: '#4ecdc4', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop' },
        { id: 'hip-hop', name: 'Hip Hop', color: '#45b7d1', image: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=300&h=300&fit=crop' },
        { id: 'electronic', name: 'Electronic', color: '#96ceb4', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop' },
        { id: 'jazz', name: 'Jazz', color: '#ffeaa7', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop' },
        { id: 'classical', name: 'Classical', color: '#dda0dd', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' },
        { id: 'country', name: 'Country', color: '#ffd93d', image: 'https://images.unsplash.com/photo-1520637836862-4d197d17c989?w=300&h=300&fit=crop' },
        { id: 'reggae', name: 'Reggae', color: '#6c5ce7', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
        { id: 'blues', name: 'Blues', color: '#a29bfe', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
        { id: 'folk', name: 'Folk', color: '#fd79a8', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop' },
        { id: 'ambient', name: 'Ambient', color: '#00cec9', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop' },
        { id: 'world', name: 'World Music', color: '#e17055', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' }
      ];

      this.setCache('enhanced_genres', genres);
      return genres;
    } catch (error) {
      console.error('Error fetching enhanced genres:', error);
      return this.getFallbackGenres();
    }
  }

  // Fallback methods with rich mock data
  getFallbackPlaylists() {
    return [
      {
        id: 'fallback_1',
        name: 'Top Hits 2024',
        description: 'The biggest hits of 2024',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }],
        tracks: { total: 50 },
        type: 'playlist'
      },
      {
        id: 'fallback_2',
        name: 'Chill Electronic',
        description: 'Relaxing electronic beats',
        images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop', height: 300, width: 300 }],
        tracks: { total: 30 },
        type: 'playlist'
      }
    ];
  }

  getFallbackTracks() {
    return [
      {
        id: 'fallback_track_1',
        name: 'Demo Track 1',
        artists: [{ id: 'demo_artist_1', name: 'Demo Artist' }],
        album: { 
          id: 'demo_album_1', 
          name: 'Demo Album',
          images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }]
        },
        duration_ms: 180000,
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        type: 'track',
        popularity: 80
      }
    ];
  }

  getFallbackGenres() {
    return [
      { id: 'pop', name: 'Pop', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
      { id: 'rock', name: 'Rock', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop' }
    ];
  }
}

export default new EnhancedMusicService();
