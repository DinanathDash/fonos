import React, { useRef, useEffect } from 'react';

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
    if (!playerContainerRef.current || !videoId) return;
    
    try {
      playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handlePlayerStateChange,
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };
  
  // Handle player ready event
  const handlePlayerReady = (event) => {
    loadingRef.current = false;
    
    // Set initial volume
    if (playerInstanceRef.current) {
      isMuted ? playerInstanceRef.current.mute() : playerInstanceRef.current.unMute();
      playerInstanceRef.current.setVolume(volume * 100);
    }
    
    // Start playing if needed
    if (isPlaying && playerInstanceRef.current) {
      playerInstanceRef.current.playVideo();
    }
    
    // Report duration
    if (onDuration && playerInstanceRef.current) {
      const duration = playerInstanceRef.current.getDuration();
      onDuration(duration);
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
    const interval = setInterval(() => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
        const currentTime = playerInstanceRef.current.getCurrentTime();
        if (onTimeUpdate) {
          onTimeUpdate(currentTime);
        }
      }
    }, 1000);
    
    // Store the interval ID for cleanup
    playerRef.current = interval;
  };
  
  // Update player state when props change
  useEffect(() => {
    if (!playerInstanceRef.current || loadingRef.current) return;
    
    try {
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
    } catch (error) {
      console.error('Error updating YouTube player state:', error);
    }
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
