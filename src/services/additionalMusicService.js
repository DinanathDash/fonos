// Additional Free Music APIs Service - Expanding the music catalog
// APIs: Free Music Archive, ccMixter, Pixabay Music, Zapsplat, Epidemic Sound (free tier)

const FREE_MUSIC_ARCHIVE_API = 'https://freemusicarchive.org/api';
const PIXABAY_API = 'https://pixabay.com/api';
const CCMIXTER_API = 'https://ccmixter.org/api';
const ARCHIVE_ORG_API = 'https://archive.org/advancedsearch.php';

class AdditionalMusicService {
  constructor() {
    this.cache = new Map();
    this.cacheDuration = 20 * 60 * 1000; // 20 minutes
    this.pixabayKey = import.meta.env.VITE_PIXABAY_API_KEY || ''; // Free registration at pixabay.com
  }

  // Get tracks from Internet Archive (huge collection of public domain music)
  async getArchiveOrgTracks(limit = 10, genre = '') {
    try {
      let query = 'collection:(etree OR opensource_audio OR audio_music) AND mediatype:audio AND format:mp3';
      if (genre) {
        query += ` AND subject:${genre}`;
      }

      const response = await fetch(
        `${ARCHIVE_ORG_API}?q=${encodeURIComponent(query)}&fl=identifier,title,creator,date,description,downloads,avg_rating,subject&rows=${limit}&output=json&sort[]=downloads desc`
      );

      if (!response.ok) throw new Error('Archive.org API failed');

      const data = await response.json();
      
      return data.docs.map(item => ({
        id: `archive_${item.identifier}`,
        name: item.title || 'Untitled',
        artists: [{
          id: `archive_creator_${item.creator}`,
          name: item.creator || 'Unknown Artist'
        }],
        album: {
          id: `archive_album_${item.identifier}`,
          name: item.title || 'Archive Collection',
          images: [{ 
            url: `https://archive.org/services/img/${item.identifier}`,
            height: 300, 
            width: 300 
          }]
        },
        duration_ms: 180000, // Default 3 minutes
        audio_url: `https://archive.org/download/${item.identifier}/${item.identifier}.mp3`,
        preview_url: `https://archive.org/download/${item.identifier}/${item.identifier}.mp3`,
        external_urls: { web: `https://archive.org/details/${item.identifier}` },
        type: 'track',
        popularity: Math.min(100, (item.downloads || 0) / 100),
        genres: item.subject || [],
        source: 'archive_org',
        description: item.description,
        date: item.date,
        license: 'Public Domain / Creative Commons'
      }));
    } catch (error) {
      console.error('Error fetching Archive.org tracks:', error);
      return [];
    }
  }

  // Get music from ccMixter (Creative Commons remixes and original music)
  async getCCMixterTracks(limit = 10) {
    try {
      const response = await fetch(
        `${CCMIXTER_API}/query?f=json&sort=rank&limit=${limit}&tags=instrumental,remix,original&format=mp3`
      );

      if (!response.ok) throw new Error('ccMixter API failed');

      const data = await response.json();
      
      return data.map(track => ({
        id: `ccmixter_${track.upload_id}`,
        name: track.upload_name,
        artists: [{
          id: `ccmixter_${track.user_name}`,
          name: track.user_name
        }],
        album: {
          id: `ccmixter_album_${track.upload_id}`,
          name: 'ccMixter Collection',
          images: [{ 
            url: track.upload_image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            height: 300, 
            width: 300 
          }]
        },
        duration_ms: (track.upload_length || 180) * 1000,
        audio_url: track.download_url,
        preview_url: track.download_url,
        external_urls: { web: track.file_page_url },
        type: 'track',
        popularity: Math.floor(Math.random() * 100),
        genres: track.upload_tags ? track.upload_tags.split(',') : [],
        source: 'ccmixter',
        description: track.upload_description,
        license: track.license_name || 'Creative Commons'
      }));
    } catch (error) {
      console.error('Error fetching ccMixter tracks:', error);
      return [];
    }
  }

  // Get music from Pixabay (requires free API key)
  async getPixabayMusic(limit = 10, category = 'music') {
    if (!this.pixabayKey) {
      console.warn('Pixabay API key not found. Get one free at pixabay.com/api/docs/');
      return [];
    }

    try {
      const response = await fetch(
        `${PIXABAY_API}/music/?key=${this.pixabayKey}&q=${category}&per_page=${limit}&category=music&audio_type=all`
      );

      if (!response.ok) throw new Error('Pixabay API failed');

      const data = await response.json();
      
      return data.hits.map(track => ({
        id: `pixabay_${track.id}`,
        name: track.tags.split(', ').slice(0, 3).join(' '), // Use tags as title
        artists: [{
          id: `pixabay_${track.user_id}`,
          name: track.user
        }],
        album: {
          id: `pixabay_album_${track.id}`,
          name: 'Pixabay Music',
          images: [{ 
            url: track.picture_id ? `https://cdn.pixabay.com/audio/${track.picture_id}/${track.picture_id}_640.jpg` : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
            height: 300, 
            width: 300 
          }]
        },
        duration_ms: track.duration * 1000,
        audio_url: track.audio,
        preview_url: track.audio,
        external_urls: { web: track.page_url },
        type: 'track',
        popularity: Math.floor((track.downloads || 0) / 100),
        genres: track.tags.split(', '),
        source: 'pixabay',
        license: 'Pixabay License'
      }));
    } catch (error) {
      console.error('Error fetching Pixabay music:', error);
      return [];
    }
  }

  // Get podcast episodes as music content
  async getPodcastMusic(limit = 5) {
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=music&media=podcast&limit=${limit}&country=US`
      );

      if (!response.ok) throw new Error('iTunes API failed');

      const data = await response.json();
      
      return data.results.map(podcast => ({
        id: `podcast_${podcast.trackId}`,
        name: podcast.trackName,
        artists: [{
          id: `podcast_${podcast.artistId}`,
          name: podcast.artistName
        }],
        album: {
          id: `podcast_album_${podcast.collectionId}`,
          name: podcast.collectionName,
          images: [{ 
            url: podcast.artworkUrl600 || podcast.artworkUrl100,
            height: 300, 
            width: 300 
          }]
        },
        duration_ms: 1800000, // Default 30 minutes for podcasts
        preview_url: null, // No direct audio URL from iTunes search
        external_urls: { web: podcast.trackViewUrl },
        type: 'podcast',
        popularity: Math.floor(Math.random() * 100),
        genres: podcast.genres || [],
        source: 'itunes_podcast',
        description: podcast.description
      }));
    } catch (error) {
      console.error('Error fetching podcast music:', error);
      return [];
    }
  }

  // Search across additional APIs
  async searchAdditionalSources(query, limit = 10) {
    try {
      const results = await Promise.allSettled([
        this.searchArchiveOrg(query, Math.ceil(limit / 2)),
        this.searchCCMixter(query, Math.ceil(limit / 2))
      ]);

      const archiveResults = results[0].status === 'fulfilled' ? results[0].value : [];
      const ccmixterResults = results[1].status === 'fulfilled' ? results[1].value : [];

      return {
        tracks: [...archiveResults, ...ccmixterResults].slice(0, limit),
        source: 'additional_apis'
      };
    } catch (error) {
      console.error('Error searching additional sources:', error);
      return { tracks: [] };
    }
  }

  // Search Archive.org
  async searchArchiveOrg(query, limit = 5) {
    try {
      const searchQuery = `collection:(etree OR opensource_audio OR audio_music) AND mediatype:audio AND format:mp3 AND title:${query}`;
      
      const response = await fetch(
        `${ARCHIVE_ORG_API}?q=${encodeURIComponent(searchQuery)}&fl=identifier,title,creator,date,description&rows=${limit}&output=json&sort[]=downloads desc`
      );

      if (!response.ok) throw new Error('Archive.org search failed');

      const data = await response.json();
      
      return data.docs.map(item => ({
        id: `archive_search_${item.identifier}`,
        name: item.title || 'Untitled',
        artists: [{ name: item.creator || 'Unknown Artist' }],
        audio_url: `https://archive.org/download/${item.identifier}/${item.identifier}.mp3`,
        source: 'archive_org_search'
      }));
    } catch (error) {
      console.error('Error searching Archive.org:', error);
      return [];
    }
  }

  // Search ccMixter
  async searchCCMixter(query, limit = 5) {
    try {
      const response = await fetch(
        `${CCMIXTER_API}/query?f=json&search=${encodeURIComponent(query)}&limit=${limit}&format=mp3`
      );

      if (!response.ok) throw new Error('ccMixter search failed');

      const data = await response.json();
      
      return data.map(track => ({
        id: `ccmixter_search_${track.upload_id}`,
        name: track.upload_name,
        artists: [{ name: track.user_name }],
        audio_url: track.download_url,
        source: 'ccmixter_search'
      }));
    } catch (error) {
      console.error('Error searching ccMixter:', error);
      return [];
    }
  }

  // Get curated playlists from multiple sources
  async getCuratedPlaylists(limit = 6) {
    try {
      const playlists = [
        {
          id: 'archive_classical',
          name: 'Classical Archive',
          description: 'Public domain classical music from Archive.org',
          images: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop' }],
          tracks: { total: 100 },
          type: 'playlist',
          source: 'archive_org',
          query: 'classical'
        },
        {
          id: 'archive_jazz',
          name: 'Jazz Collection',
          description: 'Historic jazz recordings',
          images: [{ url: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop' }],
          tracks: { total: 80 },
          type: 'playlist',
          source: 'archive_org',
          query: 'jazz'
        },
        {
          id: 'ccmixter_remix',
          name: 'Creative Commons Remixes',
          description: 'Best remixes from ccMixter',
          images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop' }],
          tracks: { total: 50 },
          type: 'playlist',
          source: 'ccmixter',
          query: 'remix'
        },
        {
          id: 'archive_folk',
          name: 'Folk Music Archive',
          description: 'Traditional and contemporary folk',
          images: [{ url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop' }],
          tracks: { total: 120 },
          type: 'playlist',
          source: 'archive_org',
          query: 'folk'
        }
      ];

      return playlists.slice(0, limit);
    } catch (error) {
      console.error('Error getting curated playlists:', error);
      return [];
    }
  }

  // Get tracks for a specific playlist
  async getPlaylistTracks(playlistId) {
    try {
      // Extract source and query from playlist ID
      const playlist = {
        'archive_classical': { source: 'archive', genre: 'classical' },
        'archive_jazz': { source: 'archive', genre: 'jazz' },
        'ccmixter_remix': { source: 'ccmixter', query: 'remix' },
        'archive_folk': { source: 'archive', genre: 'folk' }
      }[playlistId];

      if (!playlist) return [];

      if (playlist.source === 'archive') {
        return await this.getArchiveOrgTracks(20, playlist.genre);
      } else if (playlist.source === 'ccmixter') {
        return await this.getCCMixterTracks(20);
      }

      return [];
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      return [];
    }
  }
}

export default new AdditionalMusicService();
