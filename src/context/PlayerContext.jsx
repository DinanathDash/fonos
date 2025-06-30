import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

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
  isDemoMode: false // Indicates if we're playing demo/mock audio
};

// Player actions
const playerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload.track,
        currentIndex: action.payload.index || -1,
        isDemoMode: !action.payload.track?.preview_url && !action.payload.track?.url && !action.payload.track?.audio_url
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

    // Check if we have a real audio URL
    const audioUrl = state.currentTrack.preview_url || state.currentTrack.url || state.currentTrack.audio_url;
    
    if (!audioUrl) {
      // Demo mode - simulate playing
      console.log('Demo mode: Playing', state.currentTrack.name);
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

    // Real audio playback
    if (audioRef.current && audioUrl) {
      try {
        await audioRef.current.play();
        dispatch({ type: 'SET_PLAYING', payload: true });
      } catch (error) {
        console.error('Error playing audio:', error);
        // Fall back to demo mode
        console.log('Falling back to demo mode for:', state.currentTrack.name);
        dispatch({ type: 'SET_PLAYING', payload: true });
        dispatch({ type: 'SET_DURATION', payload: 210 });
      }
    }
  };

  const pause = () => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.pause();
    }
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
    // Set the current track first
    dispatch({ type: 'SET_CURRENT_TRACK', payload: { track, index } });
    if (queue.length > 0) {
      dispatch({ type: 'SET_QUEUE', payload: queue });
    }

    // Check if we have a real audio URL
    const audioUrl = track.preview_url || track.url || track.audio_url;
    
    if (audioUrl && audioRef.current) {
      // Real audio mode
      audioRef.current.src = audioUrl;
      play();
    } else {
      // Demo mode - just update state
      console.log('Demo mode: Setting up track', track.name);
      play();
    }
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
    const audioUrl = state.currentTrack?.preview_url || state.currentTrack?.url || state.currentTrack?.audio_url;
    
    if (audioRef.current && audioUrl) {
      // Real audio mode
      audioRef.current.currentTime = time;
    } else {
      // Demo mode - just update state
      dispatch({ type: 'SET_CURRENT_TIME', payload: time });
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

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
