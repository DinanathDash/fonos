import React, { useRef, useEffect } from 'react';

// Helper function to extract YouTube video ID from different URL formats
const extractYouTubeId = (url) => {
  if (!url) return null;
  
  try {
    // Check for youtu.be format
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split(/[?&]/)[0];
    }
    
    // Check for youtube.com/watch?v= format
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    }
    
    // Check for youtube.com/embed/ format
    if (url.includes('/embed/')) {
      return url.split('/embed/')[1]?.split(/[?&]/)[0];
    }
    
    // If it's just a plain ID
    if (/^[A-Za-z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting YouTube ID:', e);
    return null;
  }
};

const YouTubePlayer = ({ 
  videoId, 
  isPlaying, 
  volume = 1, 
  isMuted = false, 
  onReady, 
  onStateChange, 
  onDuration, 
  onTimeUpdate, 
  onEnded 
}) => {
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const loadingRef = useRef(true);
  const playerInstanceRef = useRef(null);

  // YouTube API loading
  useEffect(() => {
    // Create and load the YouTube API script if it doesn't exist
    if (!window.YT) {
      // Create a script tag for the YouTube IFrame API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Callback once the API is ready
      window.onYouTubeIframeAPIReady = initializePlayer;
      
      // Insert the script tag before the first script tag on the page
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else if (window.YT.Player) {
      // If the API is already loaded, initialize directly
      initializePlayer();
    }

    return () => {
      // Clean up player when component unmounts
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [videoId]);
  
  // Initialize YouTube player
  const initializePlayer = () => {
    if (!playerContainerRef.current) return;
    
    // Log video ID to help with debugging
    console.log('Initializing YouTube player with videoId:', videoId);
    
    // Check if videoId exists
    if (!videoId) {
      console.error('No YouTube video ID provided');
      // Call onReady anyway to signal that we attempted to initialize
      if (onReady) onReady();
      return;
    }
    
    // Clean the videoId to make sure it's valid
    // Sometimes videoIds can have extra query parameters or be full URLs
    const cleanVideoId = videoId.includes('youtube.com') || videoId.includes('youtu.be')
      ? extractYouTubeId(videoId)
      : videoId;
    
    if (!cleanVideoId) {
      console.error('Invalid YouTube video ID:', videoId);
      if (onReady) onReady();
      return;
    }
    
    try {
      // First, clear any existing player
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.log('Failed to destroy previous player instance:', e);
        }
        playerInstanceRef.current = null;
      }
      
      // Make sure the container div is empty and ready
      if (playerContainerRef.current) {
        while (playerContainerRef.current.firstChild) {
          playerContainerRef.current.removeChild(playerContainerRef.current.firstChild);
        }
      }
      
      console.log('Creating YouTube player with clean ID:', cleanVideoId);
      
      // Create a new div for the player
      const playerDiv = document.createElement('div');
      playerDiv.id = 'youtube-player-' + Date.now();
      playerContainerRef.current.appendChild(playerDiv);
      
      playerInstanceRef.current = new window.YT.Player(playerDiv.id, {
        height: '0',
        width: '0',
        videoId: cleanVideoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          origin: window.location.origin
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handlePlayerStateChange,
          onError: (event) => {
            console.error('YouTube player error:', event.data);
            // Notify parent that we're ready even if there was an error
            // to prevent the app from getting stuck
            if (onReady) onReady(event);
          }
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      if (onReady) onReady(); // Still call onReady to prevent UI from getting stuck
    }
  };
  
  // Handle player ready event
  const handlePlayerReady = (event) => {
    loadingRef.current = false;
    console.log('YouTube player is ready');
    
    // Make sure we have a valid player instance and it has all necessary methods
    if (!playerInstanceRef.current || 
        typeof playerInstanceRef.current.mute !== 'function' || 
        typeof playerInstanceRef.current.unMute !== 'function' ||
        typeof playerInstanceRef.current.setVolume !== 'function') {
      console.error('YouTube player is missing required methods');
      if (onReady) onReady(event);
      return;
    }
    
    // Safely execute a player method with error handling
    const safeExecute = (method, ...args) => {
      try {
        if (playerInstanceRef.current && typeof playerInstanceRef.current[method] === 'function') {
          return playerInstanceRef.current[method](...args);
        }
      } catch (error) {
        console.error(`Error executing YouTube player.${method}:`, error);
      }
      return null;
    };
    
    // Set initial volume
    if (isMuted) {
      safeExecute('mute');
    } else {
      safeExecute('unMute');
      safeExecute('setVolume', volume * 100);
    }
    
    // Start playing if needed
    if (isPlaying) {
      setTimeout(() => {
        safeExecute('playVideo');
      }, 300); // Add a slight delay to ensure the player is fully initialized
    }
    
    // Report duration
    if (onDuration) {
      const duration = safeExecute('getDuration');
      if (duration) onDuration(duration);
    }
    
    // Notify parent component
    if (onReady) {
      onReady(event);
    }
    
    // Start time update interval
    startTimeUpdateInterval();
  };
  
  // Handle player state changes
  const handlePlayerStateChange = (event) => {
    if (onStateChange) {
      onStateChange(event);
    }
    
    // Handle video ended
    if (event.data === window.YT.PlayerState.ENDED) {
      if (onEnded) {
        onEnded();
      }
    }
  };
  
  // Start interval to report current time
  const startTimeUpdateInterval = () => {
    // First clear any existing interval
    if (playerRef.current) {
      clearInterval(playerRef.current);
      playerRef.current = null;
    }
    
    const interval = setInterval(() => {
      try {
        if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
          const currentTime = playerInstanceRef.current.getCurrentTime();
          if (onTimeUpdate && typeof currentTime === 'number' && !isNaN(currentTime)) {
            onTimeUpdate(currentTime);
          }
        }
      } catch (error) {
        console.error('Error getting current time from YouTube player:', error);
      }
    }, 1000);
    
    // Store the interval ID for cleanup
    playerRef.current = interval;
  };
  
  // Update player state when props change
  useEffect(() => {
    if (!playerInstanceRef.current || loadingRef.current) return;
    
    // Ensure the YouTube player is fully initialized before calling methods
    const checkPlayerReady = () => {
      if (!playerInstanceRef.current) return false;
      
      // Check if essential methods exist
      return typeof playerInstanceRef.current.playVideo === 'function' &&
             typeof playerInstanceRef.current.pauseVideo === 'function' &&
             typeof playerInstanceRef.current.mute === 'function' &&
             typeof playerInstanceRef.current.unMute === 'function' &&
             typeof playerInstanceRef.current.setVolume === 'function';
    };
    
    // Wait for player to be ready or timeout after 2 seconds
    let attempts = 0;
    const maxAttempts = 20;
    const attemptInterval = 100; // 100ms between checks
    
    const attemptPlayerUpdate = () => {
      try {
        if (checkPlayerReady()) {
          console.log('YouTube player is ready for commands');
          
          // Update playback state
          if (isPlaying) {
            playerInstanceRef.current.playVideo();
          } else {
            playerInstanceRef.current.pauseVideo();
          }
          
          // Update volume/mute
          if (isMuted) {
            playerInstanceRef.current.mute();
          } else {
            playerInstanceRef.current.unMute();
            playerInstanceRef.current.setVolume(volume * 100);
          }
        } else if (attempts < maxAttempts) {
          // Try again after a short delay
          attempts++;
          setTimeout(attemptPlayerUpdate, attemptInterval);
        } else {
          console.error('YouTube player methods not available after multiple attempts');
        }
      } catch (error) {
        console.error('Error updating YouTube player state:', error);
      }
    };
    
    // Start attempting to update the player
    attemptPlayerUpdate();
  }, [isPlaying, volume, isMuted]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        clearInterval(playerRef.current);
      }
    };
  }, []);

  // Invisible container for YouTube iframe
  return <div ref={playerContainerRef} style={{ display: 'none' }} />;
};

export default YouTubePlayer;
