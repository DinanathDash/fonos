// server.js - Express server that proxies YouTube Music API requests
import express from 'express';
import cors from 'cors';
import YTMusic from 'ytmusic-api';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Create an instance of YTMusic API
const ytmusic = new YTMusic();
let isInitialized = false;

// Initialize YTMusic API
async function initializeYTMusic() {
  if (!isInitialized) {
    try {
      await ytmusic.initialize();
      isInitialized = true;
      console.log('YouTube Music API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize YouTube Music API:', error);
      throw error;
    }
  }
  return isInitialized;
}

// Ensure the YTMusic API is initialized
app.use(async (req, res, next) => {
  try {
    await initializeYTMusic();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize YouTube Music API', details: error.message });
  }
});

// Format results to include URLs and other useful info
const formatResult = (result) => {
  if (!result) return result;
  
  if (result.videoId) {
    result.embedUrl = `https://www.youtube.com/embed/${result.videoId}`;
    result.watchUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
    result.isAudioAvailable = true;
  }
  
  return result;
};

// Search endpoint
app.get('/api/ytmusic/search', async (req, res) => {
  try {
    const { query, type = 'songs', limit = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const results = await ytmusic.search(query, { 
      filter: type, 
      limit: parseInt(limit) 
    });
    
    // Format results to include URLs and other useful info
    const formattedResults = results.map(result => formatResult(result));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error searching YouTube Music:', error);
    res.status(500).json({ error: 'Failed to search YouTube Music', details: error.message });
  }
});

// Track details endpoint
app.get('/api/ytmusic/track/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ error: 'videoId parameter is required' });
    }
    
    const trackDetails = await ytmusic.getTrack(videoId);
    res.json(formatResult(trackDetails));
  } catch (error) {
    console.error('Error fetching track details:', error);
    res.status(500).json({ error: 'Failed to fetch track details', details: error.message });
  }
});

// Artist details endpoint
app.get('/api/ytmusic/artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    
    if (!artistId) {
      return res.status(400).json({ error: 'artistId parameter is required' });
    }
    
    const artistDetails = await ytmusic.getArtist(artistId);
    res.json(artistDetails);
  } catch (error) {
    console.error('Error fetching artist details:', error);
    res.status(500).json({ error: 'Failed to fetch artist details', details: error.message });
  }
});

// Artist's albums endpoint
app.get('/api/ytmusic/artist/:artistId/albums', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = 20 } = req.query;
    
    if (!artistId) {
      return res.status(400).json({ error: 'artistId parameter is required' });
    }
    
    const artistDetails = await ytmusic.getArtist(artistId);
    const albums = artistDetails.albums?.items || [];
    
    res.json(albums.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    res.status(500).json({ error: 'Failed to fetch artist albums', details: error.message });
  }
});

// Artist's top tracks endpoint
app.get('/api/ytmusic/artist/:artistId/top-tracks', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { limit = 20 } = req.query;
    
    if (!artistId) {
      return res.status(400).json({ error: 'artistId parameter is required' });
    }
    
    const artistDetails = await ytmusic.getArtist(artistId);
    const tracks = artistDetails.songs?.items || [];
    
    // Format each track to include watch and embed URLs
    const formattedTracks = tracks
      .slice(0, parseInt(limit))
      .map(track => formatResult(track));
    
    res.json(formattedTracks);
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    res.status(500).json({ error: 'Failed to fetch artist top tracks', details: error.message });
  }
});

// Album details endpoint
app.get('/api/ytmusic/album/:albumId', async (req, res) => {
  try {
    const { albumId } = req.params;
    
    if (!albumId) {
      return res.status(400).json({ error: 'albumId parameter is required' });
    }
    
    const albumDetails = await ytmusic.getAlbum(albumId);
    
    // Format each track to include watch and embed URLs
    if (albumDetails.tracks) {
      albumDetails.tracks = albumDetails.tracks.map(track => formatResult(track));
    }
    
    res.json(albumDetails);
  } catch (error) {
    console.error('Error fetching album details:', error);
    res.status(500).json({ error: 'Failed to fetch album details', details: error.message });
  }
});

// Playlist details endpoint
app.get('/api/ytmusic/playlist/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    if (!playlistId) {
      return res.status(400).json({ error: 'playlistId parameter is required' });
    }
    
    const playlistDetails = await ytmusic.getPlaylist(playlistId);
    
    // Format each track to include watch and embed URLs
    if (playlistDetails.tracks) {
      playlistDetails.tracks = playlistDetails.tracks.map(track => formatResult(track));
    }
    
    res.json(playlistDetails);
  } catch (error) {
    console.error('Error fetching playlist details:', error);
    res.status(500).json({ error: 'Failed to fetch playlist details', details: error.message });
  }
});

// Lyrics endpoint
app.get('/api/ytmusic/lyrics/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ error: 'videoId parameter is required' });
    }
    
    const trackDetails = await ytmusic.getTrack(videoId);
    
    // YouTube Music API doesn't directly support lyrics, so we return what we can
    if (trackDetails && trackDetails.lyrics) {
      res.json({ lyrics: trackDetails.lyrics });
    } else {
      res.json({ lyrics: null, message: 'Lyrics not available for this track' });
    }
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    res.status(500).json({ error: 'Failed to fetch lyrics', details: error.message });
  }
});

// Home content endpoint
app.get('/api/ytmusic/home', async (req, res) => {
  try {
    // We'll create a custom home page content from various YouTube Music resources
    // Using search instead of direct API calls which might not exist in the library
    const [topTracks, featuredPlaylists, newReleases] = await Promise.all([
      // Search for top songs instead of using getCharts
      ytmusic.search('top songs', { filter: 'songs', limit: 20 })
        .then(results => results.map(track => formatResult(track)))
        .catch(() => []),
        
      // Search for popular playlists instead of using getMoodsAndGenres
      ytmusic.search('popular playlists', { filter: 'playlists', limit: 10 })
        .catch(() => []),
        
      // Search for new releases
      ytmusic.search('new releases this week', { filter: 'albums', limit: 10 })
        .catch(() => [])
    ]);
    
    // Format playlists data - ensure we have proper titles
    const formattedPlaylists = (featuredPlaylists || []).map((playlist, index) => {
      // Generate a title if it's missing
      const defaultTitles = [
        'Pop Hits', 'Today\'s Hits', 'Classic Hits', 'Dance Pop',
        'Trending Now', 'Viral Hits', 'Summer Hits', 'Weekend Playlist',
        'Feel Good Music', 'Workout Mix', 'Party Playlist', 'Chill Vibes',
        'Road Trip Mix', 'Study Playlist', 'Morning Coffee Mix'
      ];
      
      return {
        playlistId: playlist.playlistId || playlist.browseId || '',
        title: playlist.title || defaultTitles[index % defaultTitles.length],
        author: playlist.author?.name || 'YouTube Music',
        thumbnails: playlist.thumbnails || [],
        description: playlist.description || 'A curated playlist by YouTube Music',
        count: playlist.trackCount || playlist.videoCount || 0
      };
    });

    // Prepare the home content object
    const homeContent = {
      topTracks: topTracks || [],
      featuredPlaylists: formattedPlaylists,
      newReleases: newReleases || [],
      moods: []  // Will be populated from genres endpoint
    };
    
    res.json(homeContent);
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ error: 'Failed to fetch home content', details: error.message });
  }
});

// Charts endpoint
app.get('/api/ytmusic/charts', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Using search for top songs instead of getCharts which doesn't exist
    const results = await ytmusic.search('top songs charts', { 
      filter: 'songs', 
      limit: parseInt(limit) 
    });
    
    // Format tracks to include watch and embed URLs
    const tracks = results.map(track => formatResult(track));
    
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching charts:', error);
    res.status(500).json({ error: 'Failed to fetch charts', details: error.message });
  }
});

// Genres/moods endpoint
app.get('/api/ytmusic/genres', async (req, res) => {
  try {
    // Search for various popular genres instead of using getMoodsAndGenres
    const genreQueries = [
      'pop music', 'rock music', 'hip hop', 'electronic music',
      'r&b music', 'indie music', 'jazz music', 'classical music',
      'country music', 'latin music', 'bollywood music'
    ];
    
    // Transform to a more usable format
    const genres = [
      {
        id: 'popular-genres',
        name: 'Popular Genres',
        items: genreQueries.map(query => ({
          id: query.replace(/\s+/g, '-').toLowerCase(),
          name: query.charAt(0).toUpperCase() + query.slice(1),
          color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
        }))
      }
    ];
    
    res.json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Failed to fetch genres', details: error.message });
  }
});

// Genre content endpoint
app.get('/api/ytmusic/genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    
    if (!genreId) {
      return res.status(400).json({ error: 'genreId parameter is required' });
    }
    
    // Convert genreId back to readable format for search
    const genreName = genreId.replace(/-/g, ' ');
    
    // Search for playlists in this genre
    const playlists = await ytmusic.search(`${genreName} playlists`, { 
      filter: 'playlists', 
      limit: 15 
    }).catch(() => []);
    
    // Format the playlists data - ensure we have proper titles
    const formattedPlaylists = (playlists || []).map((playlist, index) => {
      // Generate a title if it's missing
      const genrePrefix = genreName.split(' ')[0];
      const defaultTitles = [
        `Best ${genrePrefix}`, `Top ${genrePrefix} Hits`, `${genrePrefix} Essentials`, 
        `${genrePrefix} Classics`, `${genrePrefix} Mix`, `${genrePrefix} Radio`, 
        `${genrePrefix} Vibes`, `${genrePrefix} Favorites`, `${genrePrefix} Now`, 
        `${genrePrefix} Collection`, `Ultimate ${genrePrefix}`, `${genrePrefix} Party`, 
        `${genrePrefix} Discovery`, `${genrePrefix} Stars`, `${genrePrefix} Legends`
      ];
      
      return {
        playlistId: playlist.playlistId || playlist.browseId || '',
        title: playlist.title || defaultTitles[index % defaultTitles.length],
        author: playlist.author?.name || 'YouTube Music',
        thumbnails: playlist.thumbnails || [],
        description: playlist.description || `A collection of great ${genreName} tracks`,
        count: playlist.trackCount || playlist.videoCount || 0
      };
    });
    
    // Format the response
    const response = {
      playlists: formattedPlaylists,
      featured: {
        title: genreName.charAt(0).toUpperCase() + genreName.slice(1),
        description: `Top ${genreName} playlists on YouTube Music`
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching genre content:', error);
    res.status(500).json({ error: 'Failed to fetch genre content', details: error.message });
  }
});

// Get new releases
app.get('/api/ytmusic/new-releases', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // The ytmusic-api library might not have a direct method for new releases,
    // so we're simulating this with a search
    const newReleases = await ytmusic.search('new releases this week', {
      filter: 'albums',
      limit: parseInt(limit)
    });
    
    res.json(newReleases);
  } catch (error) {
    console.error('Error fetching new releases:', error);
    res.status(500).json({ error: 'Failed to fetch new releases', details: error.message });
  }
});

// Enhanced track search for specific artists and titles
app.get('/api/ytmusic/find-exact', async (req, res) => {
  try {
    const { artist, title } = req.query;
    
    if (!artist || !title) {
      return res.status(400).json({ error: 'Both artist and title parameters are required' });
    }
    
    // Create a specific search query for exact matching
    const query = `${artist} ${title}`;
    const results = await ytmusic.search(query, {
      filter: 'songs',
      limit: 5
    });
    
    // Format results
    const formattedResults = results.map(result => formatResult(result));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Error finding exact track:', error);
    res.status(500).json({ error: 'Failed to find exact track', details: error.message });
  }
});

// Serve static files from the build directory in production
if (process.env.NODE_ENV === 'production') {
  // Serve the Vite-built frontend
  const staticPath = join(__dirname, 'dist');
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
    
    // For SPA routing - serve index.html for all unknown paths
    app.get('*', (req, res) => {
      res.sendFile(join(staticPath, 'index.html'));
    });
  }
}

// Start the server
app.listen(port, () => {
  console.log(`YTMusic API server running at http://localhost:${port}`);
});

export default app;
