// Last.fm API integration for metadata enhancement
// This service helps get better metadata for tracks with limited information

class LastFmApi {
  constructor() {
    // Use the Last.fm API key from environment variables
    this.apiKey = import.meta.env.VITE_LASTFM_API_KEY;
    this.apiBaseUrl = 'https://ws.audioscrobbler.com/2.0/';
    
    // Caching system to avoid repeated API calls
    this.cache = {
      tracks: new Map(),
      artists: new Map(),
      albums: new Map()
    };
    
    // Cache expiration time (24 hours)
    this.cacheExpiration = 24 * 60 * 60 * 1000;
  }

  // Search for a track by name and artist
  async searchTrack(trackName, artistName = '') {
    if (!trackName) return null;
    
    // Create a cache key
    const cacheKey = `${trackName}-${artistName}`.toLowerCase();
    
    // Check if we have a non-expired cache entry
    const cacheEntry = this.cache.tracks.get(cacheKey);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheExpiration) {
      return cacheEntry.data;
    }
    
    try {
      // Build URL with query parameters
      const url = new URL(this.apiBaseUrl);
      url.searchParams.append('method', 'track.search');
      url.searchParams.append('track', trackName);
      if (artistName) {
        url.searchParams.append('artist', artistName);
      }
      url.searchParams.append('api_key', this.apiKey);
      url.searchParams.append('format', 'json');
      url.searchParams.append('limit', 1); // Just get the top match
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Check if we got any results
      if (!data.results || !data.results.trackmatches || !data.results.trackmatches.track || data.results.trackmatches.track.length === 0) {
        return null;
      }
      
      const track = data.results.trackmatches.track[0];
      
      // Format the track data
      const formattedTrack = {
        name: track.name,
        artist: track.artist,
        url: track.url,
        image: track.image && track.image.length > 0 ? track.image[track.image.length - 1]['#text'] : null,
        listeners: track.listeners
      };
      
      // Cache the result
      this.cache.tracks.set(cacheKey, {
        data: formattedTrack,
        timestamp: Date.now()
      });
      
      return formattedTrack;
    } catch (error) {
      console.error(`Error searching Last.fm for track ${trackName}:`, error);
      return null;
    }
  }

  // Get detailed track info by track name and artist
  async getTrackInfo(trackName, artistName) {
    if (!trackName || !artistName) return null;
    
    // Create a cache key
    const cacheKey = `info-${trackName}-${artistName}`.toLowerCase();
    
    // Check if we have a non-expired cache entry
    const cacheEntry = this.cache.tracks.get(cacheKey);
    if (cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheExpiration) {
      return cacheEntry.data;
    }
    
    try {
      // Build URL with query parameters
      const url = new URL(this.apiBaseUrl);
      url.searchParams.append('method', 'track.getInfo');
      url.searchParams.append('track', trackName);
      url.searchParams.append('artist', artistName);
      url.searchParams.append('api_key', this.apiKey);
      url.searchParams.append('format', 'json');
      
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      
      // Check if we got valid results
      if (!data.track) {
        return null;
      }
      
      // Format the track data
      const formattedTrack = {
        name: data.track.name,
        artist: data.track.artist.name,
        album: data.track.album?.title,
        url: data.track.url,
        image: data.track.album?.image && data.track.album.image.length > 0 ? 
               data.track.album.image[data.track.album.image.length - 1]['#text'] : null,
        duration: data.track.duration ? Math.floor(data.track.duration / 1000) : null,
        listeners: data.track.listeners,
        playcount: data.track.playcount,
        tags: data.track.toptags?.tag?.map(tag => tag.name) || []
      };
      
      // Cache the result
      this.cache.tracks.set(cacheKey, {
        data: formattedTrack,
        timestamp: Date.now()
      });
      
      return formattedTrack;
    } catch (error) {
      console.error(`Error getting Last.fm track info for ${trackName} by ${artistName}:`, error);
      return null;
    }
  }
  
  // Extract a potential track name from a YouTube title
  // This helps clean up YouTube titles that might contain extra information
  extractTrackInfo(youtubeTitle) {
    if (!youtubeTitle) return { title: '', artist: '' };
    
    // Remove common YouTube suffixes/prefixes
    let cleaned = youtubeTitle
      .replace(/\(Official (Music|Video|Audio|Lyric|Full Song|Full Track)\)/gi, '')
      .replace(/\[Official (Music|Video|Audio|Lyric|Full Song|Full Track)\]/gi, '')
      .replace(/(Official (Music|Video|Audio|Lyric|Full Song|Full Track))/gi, '')
      .replace(/\(Audio\)/gi, '')
      .replace(/\(Lyrics\)/gi, '')
      .replace(/\(Full Song\)/gi, '')
      .replace(/\(Full Track\)/gi, '')
      .replace(/\(Lyric Video\)/gi, '')
      .replace(/\(Official\)/gi, '')
      .replace(/\(OFFICIAL\)/gi, '')
      .replace(/\(HD\)/gi, '')
      .replace(/\[HD\]/gi, '')
      .replace(/\(HQ\)/gi, '')
      .replace(/\[HQ\]/gi, '')
      .replace(/\(4K\)/gi, '')
      .replace(/\[4K\]/gi, '')
      .replace(/\(Full HD\)/gi, '')
      .replace(/\[Full HD\]/gi, '')
      .replace(/\(\d+\)/g, '') // Remove (2019), (2020) etc.
      .replace(/\[\d+\]/g, '') // Remove [2019], [2020] etc.
      .replace(/ +/g, ' ') // Remove extra spaces
      .trim();
    
    // Try to split artist and track name (if contains " - ")
    const parts = cleaned.split(' - ');
    if (parts.length > 1) {
      const artist = parts[0].trim();
      const title = parts.slice(1).join(' - ').trim();
      return { title, artist };
    }
    
    // If no dash found, try to extract artist from the beginning if song is in format "Artist Song Title"
    // This is a very basic heuristic and won't work for all cases
    const words = cleaned.split(' ');
    if (words.length > 2) {
      // Assume first 1-2 words might be the artist name
      const possibleArtist = words.slice(0, Math.min(2, Math.floor(words.length / 3))).join(' ');
      const possibleTitle = words.slice(Math.min(2, Math.floor(words.length / 3))).join(' ');
      
      return { 
        title: possibleTitle,
        artist: possibleArtist
      };
    }
    
    // Fallback: just return the whole string as title
    return { title: cleaned, artist: '' };
  }
}

// Create and export a singleton instance
const lastFmApi = new LastFmApi();
export default lastFmApi;
