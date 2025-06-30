// Music service - providing comprehensive music streaming experience
// Uses multiple real free music APIs for vast music catalog and streaming

import realMusicService from './realMusicService.js';
import enhancedMusicService from './enhancedMusicService.js';
import additionalMusicService from './additionalMusicService.js';

class MusicService {
  constructor() {
    this.realService = realMusicService;
    this.enhancedService = enhancedMusicService;
    this.additionalService = additionalMusicService;
    this.useEnhancedAPI = true; // Toggle for enhanced multi-API support
  }

  // Get featured playlists from multiple sources
  async getFeaturedPlaylists(limit = 8) {
    try {
      if (this.useEnhancedAPI) {
        // Get playlists from enhanced service (multiple APIs)
        const enhancedPlaylists = await this.enhancedService.getFeaturedPlaylists(Math.ceil(limit * 0.6));
        const additionalPlaylists = await this.additionalService.getCuratedPlaylists(Math.ceil(limit * 0.4));
        
        return [...enhancedPlaylists, ...additionalPlaylists].slice(0, limit);
      } else {
        return await this.realService.getFeaturedPlaylists(limit);
      }
    } catch (error) {
      console.error('Error in getFeaturedPlaylists:', error);
      return await this.realService.getFeaturedPlaylists(limit);
    }
  }

  // Get top tracks from multiple sources
  async getTopTracks(limit = 20) {
    try {
      if (this.useEnhancedAPI) {
        // Combine tracks from multiple sources
        const [enhancedTracks, archiveTracks, ccmixterTracks] = await Promise.allSettled([
          this.enhancedService.getTopTracks(Math.ceil(limit * 0.6)),
          this.additionalService.getArchiveOrgTracks(Math.ceil(limit * 0.2)),
          this.additionalService.getCCMixterTracks(Math.ceil(limit * 0.2))
        ]);

        const allTracks = [
          ...(enhancedTracks.status === 'fulfilled' ? enhancedTracks.value : []),
          ...(archiveTracks.status === 'fulfilled' ? archiveTracks.value : []),
          ...(ccmixterTracks.status === 'fulfilled' ? ccmixterTracks.value : [])
        ];

        // Shuffle and return requested amount
        return allTracks.sort(() => Math.random() - 0.5).slice(0, limit);
      } else {
        return await this.realService.getTopTracks(limit);
      }
    } catch (error) {
      console.error('Error in getTopTracks:', error);
      return await this.realService.getTopTracks(limit);
    }
  }

  // Get recently played tracks
  async getRecentlyPlayedTracks(limit = 10) {
    return await this.realService.getRecentlyPlayedTracks(limit);
  }

  // Get genres
  async getGenres() {
    return await this.realService.getGenres();
  }

  // Get artists from multiple sources
  async getArtists(limit = 20) {
    try {
      if (this.useEnhancedAPI) {
        return await this.enhancedService.getArtists ? await this.enhancedService.getArtists(limit) : await this.realService.getArtists(limit);
      } else {
        return await this.realService.getArtists(limit);
      }
    } catch (error) {
      console.error('Error in getArtists:', error);
      return await this.realService.getArtists(limit);
    }
  }

  // Enhanced search across all APIs
  async search(query, type = 'all', limit = 20) {
    try {
      if (this.useEnhancedAPI) {
        // Search across all available APIs
        const [enhancedResults, additionalResults] = await Promise.allSettled([
          this.enhancedService.search(query, type, Math.ceil(limit * 0.7)),
          this.additionalService.searchAdditionalSources(query, Math.ceil(limit * 0.3))
        ]);

        const enhanced = enhancedResults.status === 'fulfilled' ? enhancedResults.value : { tracks: [], artists: [], albums: [], playlists: [] };
        const additional = additionalResults.status === 'fulfilled' ? additionalResults.value : { tracks: [] };

        return {
          tracks: [...enhanced.tracks, ...additional.tracks].slice(0, limit),
          artists: enhanced.artists || [],
          albums: enhanced.albums || [],
          playlists: enhanced.playlists || []
        };
      } else {
        return await this.realService.search(query, type, limit);
      }
    } catch (error) {
      console.error('Error in search:', error);
      return await this.realService.search(query, type, limit);
    }
  }

  // Get tracks by genre from multiple sources
  async getTracksByGenre(genre, limit = 20) {
    try {
      if (this.useEnhancedAPI) {
        // Get tracks from Archive.org for specific genres
        const archiveTracks = await this.additionalService.getArchiveOrgTracks(Math.ceil(limit * 0.4), genre);
        const realTracks = await this.realService.getTracksByGenre(genre, Math.ceil(limit * 0.6));
        
        return [...realTracks, ...archiveTracks].slice(0, limit);
      } else {
        return await this.realService.getTracksByGenre(genre, limit);
      }
    } catch (error) {
      console.error('Error in getTracksByGenre:', error);
      return await this.realService.getTracksByGenre(genre, limit);
    }
  }

  // Get enhanced genres
  async getGenres() {
    try {
      if (this.useEnhancedAPI) {
        return await this.enhancedService.getGenres();
      } else {
        return await this.realService.getGenres();
      }
    } catch (error) {
      console.error('Error in getGenres:', error);
      return await this.realService.getGenres();
    }
  }

  // Get album tracks
  async getAlbumTracks(albumId) {
    return await this.realService.getAlbumTracks(albumId);
  }

  // Get artist's top tracks
  async getArtistTopTracks(artistId, limit = 10) {
    return await this.realService.getArtistTopTracks(artistId, limit);
  }

  // Get recommendations
  async getRecommendations(seedTrackIds = [], seedArtistIds = [], seedGenres = [], limit = 20) {
    return await this.realService.getRecommendations(seedTrackIds, seedArtistIds, seedGenres, limit);
  }

  // Get user's saved tracks
  async getUserSavedTracks(limit = 50) {
    return await this.realService.getUserSavedTracks(limit);
  }

  // Get user's playlists
  async getUserPlaylists(limit = 20) {
    return await this.realService.getUserPlaylists(limit);
  }

  // Get playlist tracks (enhanced for additional sources)
  async getPlaylistTracks(playlistId, limit = 100) {
    try {
      // Check if it's from additional music service
      if (playlistId.startsWith('archive_') || playlistId.startsWith('ccmixter_')) {
        return await this.additionalService.getPlaylistTracks(playlistId);
      } else {
        return await this.realService.getPlaylistTracks(playlistId, limit);
      }
    } catch (error) {
      console.error('Error in getPlaylistTracks:', error);
      return await this.realService.getPlaylistTracks(playlistId, limit);
    }
  }

  // Save track to user's library
  async saveTrack(trackId) {
    return await this.realService.saveTrack(trackId);
  }

  // Remove track from user's library
  async removeTrack(trackId) {
    return await this.realService.removeTrack(trackId);
  }

  // Check if track is saved
  async isTrackSaved(trackId) {
    return await this.realService.isTrackSaved(trackId);
  }

  // Create playlist (mock implementation)
  async createPlaylist(name, description = '', isPublic = true) {
    // Mock implementation
    const playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description,
      public: isPublic,
      images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', height: 300, width: 300 }],
      tracks: { total: 0 },
      owner: { display_name: 'You', id: 'current-user' },
      type: 'playlist'
    };
    
    console.log(`Playlist "${name}" created`);
    return playlist;
  }

  // Add tracks to playlist (mock implementation)
  async addTracksToPlaylist(playlistId, trackIds) {
    // Mock implementation
    console.log(`Added ${trackIds.length} tracks to playlist ${playlistId}`);
    return { success: true };
  }

  // Remove tracks from playlist (mock implementation)
  async removeTracksFromPlaylist(playlistId, trackIds) {
    // Mock implementation
    console.log(`Removed ${trackIds.length} tracks from playlist ${playlistId}`);
    return { success: true };
  }

  // Enhanced methods for vast music catalog

  // Toggle between basic and enhanced API mode
  setEnhancedMode(enabled = true) {
    this.useEnhancedAPI = enabled;
    console.log(`Enhanced music API mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get music from specific sources
  async getTracksBySource(source = 'jamendo', limit = 20) {
    try {
      switch (source) {
        case 'archive':
          return await this.additionalService.getArchiveOrgTracks(limit);
        case 'ccmixter':
          return await this.additionalService.getCCMixterTracks(limit);
        case 'pixabay':
          return await this.additionalService.getPixabayMusic(limit);
        case 'jamendo':
        default:
          return await this.realService.getTopTracks(limit);
      }
    } catch (error) {
      console.error(`Error getting tracks from ${source}:`, error);
      return [];
    }
  }

  // Get music statistics across all APIs
  async getMusicStats() {
    try {
      const stats = {
        totalSources: 6, // Jamendo, Deezer, Archive.org, ccMixter, Pixabay, MusicBrainz
        estimatedTracks: 500000, // Conservative estimate
        genres: (await this.getGenres()).length,
        featuredPlaylists: (await this.getFeaturedPlaylists(20)).length,
        license: 'Creative Commons / Public Domain',
        streamingQuality: 'High Quality MP3',
        lastUpdated: new Date().toISOString()
      };
      return stats;
    } catch (error) {
      console.error('Error getting music stats:', error);
      return null;
    }
  }

  // Get trending tracks across all sources
  async getTrendingTracks(limit = 20) {
    try {
      if (this.useEnhancedAPI) {
        // Mix tracks from different sources
        const sources = [
          this.enhancedService.getTopTracks(Math.ceil(limit * 0.4)),
          this.additionalService.getArchiveOrgTracks(Math.ceil(limit * 0.3)),
          this.additionalService.getCCMixterTracks(Math.ceil(limit * 0.3))
        ];

        const results = await Promise.allSettled(sources);
        const allTracks = results
          .filter(result => result.status === 'fulfilled')
          .flatMap(result => result.value);

        return allTracks
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, limit);
      } else {
        return await this.realService.getTopTracks(limit);
      }
    } catch (error) {
      console.error('Error getting trending tracks:', error);
      return await this.realService.getTopTracks(limit);
    }
  }

  // Get random discovery tracks
  async getDiscoveryTracks(limit = 10) {
    try {
      const allTracks = await this.getTopTracks(50);
      return allTracks
        .sort(() => Math.random() - 0.5)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting discovery tracks:', error);
      return [];
    }
  }

  // Get music by mood/activity
  async getMusicByMood(mood = 'chill', limit = 20) {
    try {
      const moodKeywords = {
        'chill': 'ambient electronic calm relaxing',
        'energetic': 'upbeat dance electronic rock',
        'focus': 'instrumental ambient classical',
        'workout': 'electronic rock hip-hop energetic',
        'sleep': 'ambient calm slow peaceful',
        'party': 'dance electronic pop upbeat'
      };

      const query = moodKeywords[mood] || mood;
      const results = await this.search(query, 'track', limit);
      return results.tracks || [];
    } catch (error) {
      console.error('Error getting music by mood:', error);
      return [];
    }
  }

  // Export music service info
  getServiceInfo() {
    return {
      name: 'Fonos Enhanced Music Service',
      version: '2.0.0',
      apis: [
        { name: 'Jamendo', type: 'streaming', tracks: '500K+' },
        { name: 'Deezer', type: 'metadata', tracks: '90M+' },
        { name: 'Archive.org', type: 'streaming', tracks: '1M+' },
        { name: 'ccMixter', type: 'streaming', tracks: '50K+' },
        { name: 'MusicBrainz', type: 'metadata', tracks: 'Unlimited' },
        { name: 'Radio Browser', type: 'streaming', stations: '40K+' }
      ],
      features: [
        'Free streaming',
        'Creative Commons licensed',
        'No download limits',
        'High quality audio',
        'Multiple genres',
        'Artist discovery',
        'Playlist creation'
      ],
      enhanced: this.useEnhancedAPI
    };
  }
}

// Create and export a singleton instance
const musicService = new MusicService();
export default musicService;
