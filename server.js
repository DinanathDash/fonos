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
  
  // First, ensure we have a valid videoId from any source
  const videoId = result.videoId || result.id || result.youtube_id;
  
  // For album or playlist results, try to get a videoId from tracks if available
  if (!videoId && (result.type === 'ALBUM' || result.type === 'PLAYLIST')) {
    // Check if we have tracks directly
    if (result.tracks && result.tracks.length > 0) {
      // Use the first track's videoId if available
      const firstTrackWithId = result.tracks.find(track => track.videoId || track.id);
      if (firstTrackWithId) {
        result.videoId = firstTrackWithId.videoId || firstTrackWithId.id;
      }
    } 
    // For album results, sometimes we need to use the playlistId
    else if (result.playlistId) {
      console.log(`Converting album/playlist to playable track using playlistId: ${result.playlistId}`);
      // Use the playlistId as a fallback - this will at least make it clickable to view the playlist
      result.videoId = result.playlistId;
    }
  }
  
  // Final check for videoId
  const finalVideoId = result.videoId || result.id || result.youtube_id;
  
  if (finalVideoId) {
    console.log(`Formatting track with ID: ${finalVideoId}, title: ${result.title || result.name || 'no title'}`);
    
    // Set explicit properties needed for playback - standardize across different property names
    result.videoId = finalVideoId;
    result.youtube_id = finalVideoId;
    result.id = finalVideoId;
    
    // Log the original artist format to help with debugging
    console.log(`Artist before formatting: ${JSON.stringify(result.artist)}`); 
    
    result.embedUrl = `https://www.youtube.com/embed/${finalVideoId}`;
    result.embed_url = `https://www.youtube.com/embed/${finalVideoId}`;
    result.watchUrl = `https://www.youtube.com/watch?v=${finalVideoId}`;
    result.audio_url = `https://www.youtube.com/watch?v=${finalVideoId}`;
    result.isAudioAvailable = true;
    
    // Ensure duration is set
    if (!result.duration && result.lengthSeconds) {
      const minutes = Math.floor(result.lengthSeconds / 60);
      const seconds = result.lengthSeconds % 60;
      result.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      // Also set duration_ms for proper time display
      result.duration_ms = result.lengthSeconds * 1000;
    } else if (!result.duration) {
      result.duration = "3:00"; // Default duration if none is provided
      result.duration_ms = 180000; // 3 minutes in ms
    }
    
    // Make sure we have a title
    if (!result.title) {
      result.title = result.name || "Track";
    }
    
    // Also set name field for consistency
    if (!result.name) {
      result.name = result.title;
    }
    
    // Handle artist information - ensure it exists in all formats
    
    // First, normalize artist if it's an object
    if (typeof result.artist === 'object' && result.artist !== null) {
      if (result.artist.name) {
        result.artist = result.artist.name;
      } else if (Array.isArray(result.artist)) {
        // Handle case where artist might be an array
        result.artist = result.artist.map(a => typeof a === 'string' ? a : (a && a.name) || '').filter(Boolean).join(', ');
        if (!result.artist) result.artist = "Artist";
      } else {
        result.artist = "Artist";
      }
    }
    
    // Ensure artist is a string at this point
    if (typeof result.artist !== 'string') {
      result.artist = "Artist";
    }
    
    if (result.artists && result.artists.length > 0) {
      // We have artists array, extract artist name if needed
      if (!result.artist || result.artist === "Artist") {
        result.artist = result.artists.map(a => a.name || '').filter(Boolean).join(', ');
        if (!result.artist) result.artist = "Artist";
      }
    } else if (result.artist && typeof result.artist === 'string') {
      // We have artist string but no artists array
      result.artists = [{ name: result.artist }];
    } else {
      // No artist info at all
      result.artist = "Artist";
      result.artists = [{ name: "Artist" }];
    }
    
    // Extract artist from title if still missing proper artist info
    if (((typeof result.artist === 'string' && result.artist === "Artist") || typeof result.artist !== 'string') && 
        result.title && result.title.includes(' - ')) {
      const parts = result.title.split(' - ');
      if (parts.length >= 2) {
        // Check if format is "Artist - Title" or "Title - Artist"
        const potentialArtist = parts[parts.length - 1].trim();
        if (potentialArtist && potentialArtist.length < 30) { // Reasonable length for artist name
          result.artist = potentialArtist;
          result.artists = [{ name: potentialArtist }];
        }
      }
    }
    
    // Remove "YouTube Music" from title
    if (result.title && result.title.includes(" (YouTube Music)")) {
      result.title = result.title.replace(" (YouTube Music)", "");
      result.name = result.title;
    }
    
    // Ensure artist is a string for logging
    const artistForLog = typeof result.artist === 'string' ? result.artist : 
                         (result.artist && typeof result.artist === 'object' && result.artist.name) ? 
                         result.artist.name : 'Unknown Artist';
    
    // Log what we're returning for debugging
    console.log(`Track formatted: ${result.name} by ${artistForLog} (ID: ${finalVideoId})`);
  } else {
    console.warn('Track missing videoId:', result);
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
      // Search specifically for Bollywood tracks for top songs section
      Promise.all([
        ytmusic.search('popular bollywood songs 2024', { filter: 'songs', limit: 15 }),
        ytmusic.search('bollywood hits', { filter: 'songs', limit: 15 }),
        ytmusic.search('best bollywood songs', { filter: 'songs', limit: 15 })
      ])
        .then(async ([results1, results2, results3]) => {
          // Combine all results
          const allResults = [...results1, ...results2, ...results3];
          console.log('Found total Bollywood tracks across searches:', allResults.length);
          
          // First, filter out any results that don't have a videoId (like albums or playlists)
          let playableTracks = allResults.filter(track => track.videoId || track.id);
          
          // Deduplicate the tracks by videoId to prevent duplicates in the UI
          const videoIdMap = new Map();
          playableTracks = playableTracks.filter(track => {
            const videoId = track.videoId || track.id;
            if (!videoId) return false;
            
            if (videoIdMap.has(videoId)) {
              return false; // Already have this track, skip it
            } else {
              videoIdMap.set(videoId, true);
              return true;
            }
          });
          console.log('Playable tracks after filtering:', playableTracks.length);
          
          // If we still don't have enough tracks, try more specific search queries
          if (playableTracks.length < 10) {
            console.log('Not enough playable tracks, trying additional searches...');
            try {
              const [altResults1, altResults2] = await Promise.all([
                ytmusic.search('arijit singh hits', { filter: 'songs', limit: 10 }),
                ytmusic.search('neha kakkar songs', { filter: 'songs', limit: 10 })
              ]);
              
              const altPlayableTracks = [...altResults1, ...altResults2].filter(track => track.videoId || track.id);
              playableTracks = [...playableTracks, ...altPlayableTracks].slice(0, 20);
              console.log('Total playable tracks after additional searches:', playableTracks.length);
            } catch (error) {
              console.error('Error in additional searches:', error);
            }
          }
          
          // Ensure each track has necessary data formatted properly
          return playableTracks.map(track => {
            const formattedTrack = formatResult(track);
            
            // Log the track data to help with debugging
            console.log('Track videoId:', formattedTrack.videoId);
            
            // Make sure we have a valid title
            if (!formattedTrack.title || formattedTrack.title.toLowerCase().includes('unknown')) {
              formattedTrack.title = track.title || 'Bollywood Track';
            }
            
            // Always ensure artist is a string before operations
            if (typeof formattedTrack.artist === 'object' && formattedTrack.artist !== null) {
              // If it's an object with a name property, use that
              if (formattedTrack.artist.name) {
                formattedTrack.artist = formattedTrack.artist.name;
              } else {
                // If no name property, set a default
                formattedTrack.artist = 'Bollywood Artist';
              }
            }
            
            // Extract artist name from video title if missing or 'unknown'
            if (!formattedTrack.artist || 
                (typeof formattedTrack.artist === 'string' && 
                 formattedTrack.artist.toLowerCase().includes('unknown'))) {
              // Try to extract artist from title (Title - Artist format)
              const titleParts = formattedTrack.title.split(' - ');
              if (titleParts.length > 1) {
                formattedTrack.artist = titleParts[1].trim();
              } else {
                formattedTrack.artist = 'Bollywood Artist';
              }
            }
            
            // Make sure artist is properly formatted
            if (!formattedTrack.artists || formattedTrack.artists.length === 0) {
              formattedTrack.artists = [{ name: formattedTrack.artist || 'Bollywood Artist' }];
            }
            
            // Ensure we have all the necessary IDs for playback
            formattedTrack.id = formattedTrack.videoId;
            formattedTrack.youtube_id = formattedTrack.videoId;
            
            // Final check for playability - if still no videoId, log it and skip this track
            if (!formattedTrack.videoId) {
              console.warn('Track still missing videoId after formatting:', formattedTrack.title);
              return null; // Will be filtered out below
            }
            
            return formattedTrack;
          })
          // Filter out any null tracks from our check above
          .filter(track => track !== null);
        })
        .catch((error) => {
          console.error('Error searching for Bollywood tracks:', error);
          return [];
        }),
        
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
      'country music', 'latin music', 'bollywood music', 'edm music',
      'metal music', 'reggae music', 'folk music', 'blues music'
    ];
    
    // Transform to a flat array format that BrowseGenres component expects
    const genres = genreQueries.map(query => {
      // Extract just the genre name without "music"
      let displayName = query.replace(' music', '');
      displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      
      return {
        id: query.replace(/\s+/g, '-').toLowerCase(),
        name: displayName,
        // Define specific colors for some genres for better visual consistency
        color: getGenreColor(displayName)
      };
    });
    
    // Add a "Popular Genres" item at the beginning
    genres.unshift({
      id: 'popular-genres',
      name: 'Popular Genres',
      color: 'from-red-500 to-pink-600'
    });
    
    res.json(genres);
    
    // Helper function to assign consistent colors to genres
    function getGenreColor(genre) {
      const colorMap = {
        'Pop': 'from-blue-500 to-indigo-600',
        'Rock': 'from-red-500 to-pink-600',
        'Hip hop': 'from-green-500 to-emerald-600',
        'Electronic': 'from-yellow-500 to-orange-600',
        'R&b': 'from-purple-500 to-violet-600',
        'Indie': 'from-teal-500 to-cyan-600',
        'Jazz': 'from-amber-500 to-orange-600',
        'Classical': 'from-rose-500 to-red-600',
        'Country': 'from-indigo-500 to-blue-600',
        'Latin': 'from-stone-600 to-zinc-800',
        'Bollywood': 'from-rose-500 to-red-600',
        'Edm': 'from-cyan-500 to-blue-600',
        'Metal': 'from-slate-700 to-slate-900',
        'Reggae': 'from-green-600 to-lime-500',
        'Folk': 'from-amber-700 to-yellow-600',
        'Blues': 'from-blue-700 to-indigo-800'
      };
      
      return colorMap[genre] || 'from-gray-500 to-gray-700';
    }
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
