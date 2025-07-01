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
      // Check if this is a YouTube track (has youtube_id or if audio_url contains youtube.com)
      const isYouTubeTrack = !!(
        action.payload.track?.youtube_id || 
        (action.payload.track?.audio_url && 
         action.payload.track?.audio_url.includes('youtube.com'))
      );
      
      // Extract YouTube video ID if present
      let youtubeVideoId = null;
      if (isYouTubeTrack) {
        youtubeVideoId = action.payload.track?.youtube_id;
        
        // If no direct youtube_id, try to extract from the URL
        if (!youtubeVideoId && action.payload.track?.audio_url) {
          const url = new URL(action.payload.track.audio_url);
          youtubeVideoId = url.searchParams.get('v');
        }
      }
      
      return {
        ...state,
        currentTrack: action.payload.track,
        currentIndex: action.payload.index || -1,
        isDemoMode: !action.payload.track?.preview_url && !action.payload.track?.url && 
                   !action.payload.track?.audio_url && !isYouTubeTrack,
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
    
    // If it's a YouTube track, we'll handle it via the YouTube player component
    if (state.isYouTubeTrack && state.youtubeVideoId) {
      console.log('YouTube mode: Playing', state.currentTrack.title || state.currentTrack.name);
      // YouTube player will start playing when it gets isPlaying=true
      dispatch({ type: 'SET_PLAYING', payload: true });
      return;
    }

    // For non-YouTube tracks, check if we have a real audio URL
    const audioUrl = state.currentTrack.preview_url || state.currentTrack.url || state.currentTrack.audio_url;
    
    if (!audioUrl) {
      // Demo mode - simulate playing
      const trackName = state.currentTrack.name || state.currentTrack.title || 'Unknown Track';
      console.log('Demo mode: Playing', trackName);
      dispatch({ type: 'SET_PLAYING', payload: true });
      dispatch({ type: 'SET_DURATION', payload: 210 }); // 3:30 demo duration
      
      // Simulate progress for demo
      const simulateProgress = () => {
        if (state.isPlaying && state.currentTime < 210) {
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
        
        // Fall back to demo mode
        const trackName = state.currentTrack.name || state.currentTrack.title || 'Unknown Track';
        console.log('Falling back to demo mode for:', trackName);
        dispatch({ type: 'SET_PLAYING', payload: true });
        dispatch({ type: 'SET_DURATION', payload: 210 });
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
    if (!track || (!track.name && !track.title)) {
      console.error('Invalid track data:', track);
      return;
    }

    // Ensure track has required fields for player
    const normalizedTrack = {
      ...track,
      name: track.name || track.title,
      title: track.title || track.name,
      artist: track.artist || 'Unknown Artist',
      album: track.album || '',
      image: track.image || null
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
        // Demo mode - just update state
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
