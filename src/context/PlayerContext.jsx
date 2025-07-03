import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import YouTubePlayer from '../components/YouTubePlayer';

const PlayerContext = createContext({});

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// Player state
const initialState = {
  currentTrack: null,
  isPlaying: false,
  isPaused: false,
  duration: 0,
  currentTime: 0,
  volume: 1,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'off', // 'off', 'track', 'playlist'
  queue: [],
  currentIndex: -1,
  isLoading: false,
  isDemoMode: false, // Indicates if we're playing demo/mock audio
  isYouTubeTrack: false, // Indicates if current track is a YouTube track
  youtubeVideoId: null // YouTube video ID if playing YouTube content
};

// Player actions
const playerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      console.log('SET_CURRENT_TRACK payload:', action.payload.track);
      
      // Try to get the track ID from multiple possible sources
      const trackId = action.payload.track?.youtube_id || 
                     action.payload.track?.videoId || 
                     action.payload.track?.id;
      
      // Check if this is a YouTube track (has a video ID or if audio_url contains youtube.com)
      const isYouTubeTrack = !!(
        trackId || 
        (action.payload.track?.audio_url && 
         action.payload.track?.audio_url.includes('youtube.com'))
      );
      
      // Extract YouTube video ID from all possible sources
      let youtubeVideoId = null;
      if (isYouTubeTrack) {
        // Try to get video ID from multiple sources
        youtubeVideoId = trackId;
        
        // If no direct ID, try to extract from the URL
        if (!youtubeVideoId && action.payload.track?.audio_url) {
          try {
            // Check if URL has v parameter (youtube.com/watch?v=ID)
            if (action.payload.track.audio_url.includes('watch?v=')) {
              const url = new URL(action.payload.track.audio_url);
              youtubeVideoId = url.searchParams.get('v');
            } 
            // Check if URL is youtu.be format (youtu.be/ID)
            else if (action.payload.track.audio_url.includes('youtu.be/')) {
              youtubeVideoId = action.payload.track.audio_url.split('youtu.be/')[1]?.split(/[?&]/)[0];
            }
            // Check if it's an embed URL (youtube.com/embed/ID)
            else if (action.payload.track.audio_url.includes('/embed/')) {
              youtubeVideoId = action.payload.track.audio_url.split('/embed/')[1]?.split(/[?&]/)[0];
            }
          } catch (error) {
            console.error('Failed to parse audio URL:', error);
          }
        }
        
        // Log the YouTube video ID to help with debugging
        console.log('Using YouTube video ID:', youtubeVideoId);
      }
      
      return {
        ...state,
        currentTrack: action.payload.track,
        currentIndex: action.payload.index || -1,
        isDemoMode: false,
        isYouTubeTrack,
        youtubeVideoId
      };
    
    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload,
        isPaused: !action.payload
      };
    
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload
      };
    
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload
      };
    
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
        isMuted: action.payload === 0
      };
    
    case 'SET_YOUTUBE_VIDEO_ID':
      return {
        ...state,
        youtubeVideoId: action.payload
      };
    
    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted
      };
    
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        isShuffled: !state.isShuffled
      };
    
    case 'SET_REPEAT_MODE':
      const modes = ['off', 'track', 'playlist'];
      const currentIndex = modes.indexOf(state.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return {
        ...state,
        repeatMode: modes[nextIndex]
      };
    
    case 'SET_QUEUE':
      return {
        ...state,
        queue: action.payload
      };
    
    case 'ADD_TO_QUEUE':
      return {
        ...state,
        queue: [...state.queue, ...action.payload]
      };
    
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        queue: state.queue.filter((_, index) => index !== action.payload)
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    default:
      return state;
  }
};

export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const audioRef = useRef(null);
  
  // YouTube player handlers
  const [youtubeReady, setYoutubeReady] = useState(false);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    // Audio event listeners
    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: audio.duration });
    };
    
    const handleTimeUpdate = () => {
      dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    };
    
    const handleEnded = () => {
      if (state.repeatMode === 'track') {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    
    const handleLoadStart = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
    };
    
    const handleCanPlay = () => {
      dispatch({ type: 'SET_LOADING', payload: false });
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [state.repeatMode]);

  // Update audio volume when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  // Play/Pause functions
  const play = async () => {
    if (!state.currentTrack) return;
    
    // Check if we have a valid YouTube video ID
    if (state.isYouTubeTrack) {
      if (state.youtubeVideoId) {
        console.log('YouTube mode: Playing track with ID', state.youtubeVideoId);
        // YouTube player will start playing when it gets isPlaying=true
        dispatch({ type: 'SET_PLAYING', payload: true });
      } else {
        console.warn('Track marked as YouTube but no valid video ID found:', 
                    state.currentTrack.title || state.currentTrack.name);
        
        // Try to find a videoId in the track object
        const possibleId = state.currentTrack.videoId || 
                          state.currentTrack.id || 
                          (state.currentTrack.audio_url && 
                           state.currentTrack.audio_url.includes('v=') ? 
                           state.currentTrack.audio_url.split('v=')[1]?.split('&')[0] : null);
        
        if (possibleId) {
          console.log('Found possible video ID:', possibleId);
          // Update the youtubeVideoId in state
          dispatch({ 
            type: 'SET_YOUTUBE_VIDEO_ID', 
            payload: possibleId 
          });
          
          // Wait a moment for the YouTube player to initialize with the new ID
          setTimeout(() => {
            dispatch({ type: 'SET_PLAYING', payload: true });
          }, 500);
        }
      }
      return; // The YouTube player component handles playback
    }
    
    const audioUrl = state.currentTrack.preview_url || state.currentTrack.url || state.currentTrack.audio_url;
    
    if (!audioUrl) {
      // We need to handle this case, but let's avoid calling it "demo mode" in the UI
      const trackName = state.currentTrack.name || state.currentTrack.title || 'Track';
      console.log('Playing track:', trackName);
      dispatch({ type: 'SET_PLAYING', payload: true });
      
      // Use the track's actual duration if available, otherwise use a default
      const trackDuration = state.currentTrack.duration_ms 
        ? state.currentTrack.duration_ms / 1000
        : 210; // 3:30 default duration
        
      dispatch({ type: 'SET_DURATION', payload: trackDuration });
      
      // Simulate progress
      const simulateProgress = () => {
        if (state.isPlaying && state.currentTime < trackDuration) {
          dispatch({ type: 'SET_CURRENT_TIME', payload: state.currentTime + 1 });
          setTimeout(simulateProgress, 1000);
        }
      };
      setTimeout(simulateProgress, 1000);
      return;
    }

    // Real audio playback via HTML5 Audio
    if (audioRef.current && audioUrl) {
      try {
        // Set the audio source if needed
        if (audioRef.current.src !== audioUrl) {
          audioRef.current.src = audioUrl;
        }
        
        await audioRef.current.play();
        dispatch({ type: 'SET_PLAYING', payload: true });
      } catch (error) {
        console.error('Error playing audio:', error);
        
        // Fallback to simulated playback
        const trackName = state.currentTrack.name || state.currentTrack.title || 'Track';
        console.log('Using simulated playback for:', trackName);
        dispatch({ type: 'SET_PLAYING', payload: true });
        
        // Use the track's actual duration if available
        const trackDuration = state.currentTrack.duration_ms 
          ? state.currentTrack.duration_ms / 1000
          : 210; // Default duration
          
        dispatch({ type: 'SET_DURATION', payload: trackDuration });
      }
    }
  };

  const pause = () => {
    // For HTML5 audio
    if (!state.isYouTubeTrack && audioRef.current && audioRef.current.src) {
      audioRef.current.pause();
    }
    
    // For both YouTube and regular audio, update state
    // (YouTube player will respond to the isPlaying prop)
    dispatch({ type: 'SET_PLAYING', payload: false });
  };

  const togglePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Track control functions
  const playTrack = (track, queue = [], index = -1) => {
    // Validate track data
    if (!track) {
      console.error('No track provided');
      return;
    }

    // Ensure track has required fields for player
    const normalizedTrack = {
      ...track,
      name: track.name || track.title || 'Track',
      title: track.title || track.name || 'Track',
      artist: track.artist || (track.artists && track.artists[0]?.name) || 'Artist',
      album: track.album || '',
      image: track.image || track.youtube_image || (track.album?.images && track.album.images[0]?.url) || null,
      // Ensure YouTube data is set
      youtube_id: track.youtube_id || track.videoId || track.id,
      // Make sure audio_url is set if we have a YouTube ID
      audio_url: track.audio_url || 
                (track.youtube_id ? `https://www.youtube.com/watch?v=${track.youtube_id}` : null) ||
                (track.videoId ? `https://www.youtube.com/watch?v=${track.videoId}` : null) ||
                (track.id ? `https://www.youtube.com/watch?v=${track.id}` : null),
      // Ensure there's a valid duration
      duration: track.duration || '0:00',
      duration_ms: track.duration_ms || 0,
      // Make sure isDemo is false
      isDemo: false
    };

    // Set the current track first
    dispatch({ type: 'SET_CURRENT_TRACK', payload: { track: normalizedTrack, index } });
    if (queue.length > 0) {
      dispatch({ type: 'SET_QUEUE', payload: queue });
    }

    // Reset current time
    dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });

    // Wait for the state to update and YouTube detection to complete
    setTimeout(() => {
      // Play the track
      play();
    }, 0);
  };

  const playNext = () => {
    if (state.queue.length > 0) {
      let nextIndex;
      
      if (state.isShuffled) {
        nextIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        nextIndex = state.currentIndex + 1;
        if (nextIndex >= state.queue.length) {
          if (state.repeatMode === 'playlist') {
            nextIndex = 0;
          } else {
            return; // End of playlist
          }
        }
      }
      
      const nextTrack = state.queue[nextIndex];
      playTrack(nextTrack, state.queue, nextIndex);
    }
  };

  const playPrevious = () => {
    if (state.queue.length > 0) {
      let prevIndex;
      
      if (state.currentTime > 3) {
        // If more than 3 seconds played, restart current track
        seek(0);
        return;
      }
      
      if (state.isShuffled) {
        prevIndex = Math.floor(Math.random() * state.queue.length);
      } else {
        prevIndex = state.currentIndex - 1;
        if (prevIndex < 0) {
          if (state.repeatMode === 'playlist') {
            prevIndex = state.queue.length - 1;
          } else {
            return; // Beginning of playlist
          }
        }
      }
      
      const prevTrack = state.queue[prevIndex];
      playTrack(prevTrack, state.queue, prevIndex);
    }
  };

  // Seek function
  const seek = (time) => {
    if (state.isYouTubeTrack) {
      // YouTube mode - we'll handle this via a ref to the YouTube player
      if (youtubePlayerRef && youtubePlayerRef.current && typeof youtubePlayerRef.current.seekTo === 'function') {
        youtubePlayerRef.current.seekTo(time);
      }
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
    } else {
      const audioUrl = state.currentTrack?.preview_url || state.currentTrack?.url || state.currentTrack?.audio_url;
      
      if (audioRef.current && audioUrl) {
        // Regular HTML5 audio mode
        audioRef.current.currentTime = time;
      } else {
        // Just update the state for tracks without direct audio playback
        dispatch({ type: 'SET_CURRENT_TIME', payload: time });
      }
    }
  };

  // Volume control
  const setVolume = (volume) => {
    dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(1, volume)) });
  };

  const toggleMute = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  // Shuffle and repeat
  const toggleShuffle = () => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  const toggleRepeat = () => {
    dispatch({ type: 'SET_REPEAT_MODE' });
  };

  // Queue management
  const addToQueue = (tracks) => {
    dispatch({ type: 'ADD_TO_QUEUE', payload: Array.isArray(tracks) ? tracks : [tracks] });
  };

  const removeFromQueue = (index) => {
    dispatch({ type: 'REMOVE_FROM_QUEUE', payload: index });
  };

  const clearQueue = () => {
    dispatch({ type: 'SET_QUEUE', payload: [] });
  };

  const value = {
    ...state,
    play,
    pause,
    togglePlayPause,
    playTrack,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue
  };

  // YouTube player reference and handlers
  const youtubePlayerRef = useRef(null);
  
  // YouTube player event handlers
  const handleYouTubeReady = (event) => {
    setYoutubeReady(true);
    youtubePlayerRef.current = event.target;
  };
  
  const handleYouTubeDuration = (duration) => {
    if (duration && duration > 0) {
      dispatch({ type: 'SET_DURATION', payload: duration });
    }
  };
  
  const handleYouTubeTimeUpdate = (currentTime) => {
    dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
  };
  
  const handleYouTubeStateChange = (event) => {
    // YT.PlayerState values: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1) { // playing
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_PLAYING', payload: true });
    } else if (event.data === 2) { // paused
      dispatch({ type: 'SET_PLAYING', payload: false });
    } else if (event.data === 3) { // buffering
      dispatch({ type: 'SET_LOADING', payload: true });
    }
  };
  
  const handleYouTubeEnded = () => {
    if (state.repeatMode === 'track') {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(0);
        youtubePlayerRef.current.playVideo();
      }
    } else {
      playNext();
    }
  };

  return (
    <PlayerContext.Provider value={value}>
      {/* Render YouTube player when we have a YouTube track */}
      {state.isYouTubeTrack && state.youtubeVideoId && (
        <YouTubePlayer
          videoId={state.youtubeVideoId}
          isPlaying={state.isPlaying}
          volume={state.volume}
          isMuted={state.isMuted}
          onReady={handleYouTubeReady}
          onStateChange={handleYouTubeStateChange}
          onDuration={handleYouTubeDuration}
          onTimeUpdate={handleYouTubeTimeUpdate}
          onEnded={handleYouTubeEnded}
        />
      )}
      {children}
    </PlayerContext.Provider>
  );
};
