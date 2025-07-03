import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Heart,
  MoreHorizontal,
  Share2,
  ListMusic,
  RadioIcon
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';
import MarqueeText from './ui/marquee-text';
import AudioVisualizer from './ui/audio-visualizer';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

const PlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    isDemoMode,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat
  } = usePlayer();

  const [isVolumeHovered, setIsVolumeHovered] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show player bar with animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle seek
  const handleSeek = (value) => {
    const newTime = (value[0] / 100) * duration;
    seek(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (value) => {
    setVolume(value[0] / 100);
  };

  // Toggle like status (placeholder for future implementation)
  const toggleLike = () => {
    setLiked(!liked);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <Card 
      className={cn(
        "border-t border-white/10 rounded-none px-4 py-2 backdrop-blur-md",
        "bg-gradient-to-r from-card/95 to-card/90 shadow-lg w-full h-[auto] flex items-center",
        "transition-all duration-500 ease-in-out transform",
        isVisible ? "translate-y-0" : "translate-y-full opacity-0",
        "hover:shadow-2xl hover:border-white/20"
      )}
    >
      <div className="grid grid-cols-3 items-center w-full">
        {/* Currently Playing - Left Section */}
        <div className="flex items-center space-x-4 min-w-0 col-span-1">
          <div className="flex-shrink-0 relative group">
            <img
              src={currentTrack.album?.images?.[0]?.url || currentTrack.image || '/placeholder-album.png'}
              alt={currentTrack.name}
              className="h-12 w-12 rounded-md object-cover shadow-md group-hover:shadow-xl transition-all duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity duration-200">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            {isDemoMode && (
              <div className="absolute -top-1 -right-1 bg-primary rounded-full px-1.5 py-0.5 shadow-sm">
                <RadioIcon className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5">
              <MarqueeText className="font-medium text-foreground">
                {currentTrack.name}
              </MarqueeText>
            </div>
            <div className="flex items-center">
              <MarqueeText className="text-xs text-muted-foreground mr-2 flex-shrink-0 max-w-[80px] md:max-w-[180px]">
                {currentTrack.artists?.map(artist => artist.name).join(', ') || currentTrack.artist || 'Unknown Artist'}
              </MarqueeText>
              <AudioVisualizer 
                isPlaying={isPlaying} 
                intensity={volume * 0.8} 
                barCount={12}
                minHeight={1}
                maxHeight={8}
                className="h-4 flex-grow max-w-[80px]" 
              />
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    liked ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={toggleLike}
                >
                  <Heart className={cn("h-4 w-4", liked && "fill-current")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Player Controls - Middle Section */}
        <div className="flex flex-col items-center justify-center space-y-2 col-span-1">
          {/* Control Buttons */}
          <div className="flex items-center space-x-3 justify-center pt-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleShuffle}
                    className={cn(
                      "h-8 w-8 rounded-full",
                      isShuffled 
                        ? "text-primary hover:text-primary/80" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isShuffled ? 'Turn shuffle off' : 'Turn shuffle on'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPrevious}
                    className="h-8 w-8 rounded-full text-foreground hover:text-white hover:bg-white/10"
                  >
                    <SkipBack className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Previous</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              onClick={togglePlayPause}
              className="h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110 transition-all duration-200 shadow-md"
              style={{
                animation: isPlaying ? 'pulse 2s infinite' : 'none'
              }}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNext}
                    className="h-8 w-8 rounded-full text-foreground hover:text-white hover:bg-white/10"
                  >
                    <SkipForward className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Next</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleRepeat}
                    className={cn(
                      "h-8 w-8 rounded-full relative",
                      repeatMode !== 'off' 
                        ? "text-primary hover:text-primary/80" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Repeat className="h-4 w-4" />
                    {repeatMode === 'track' && (
                      <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full h-3.5 w-3.5 flex items-center justify-center">
                        1
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {repeatMode === 'off' && 'Turn on repeat'}
                  {repeatMode === 'all' && 'Turn on repeat one'}
                  {repeatMode === 'track' && 'Turn off repeat'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <Slider
                value={[progressPercentage]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full cursor-pointer z-10 relative h-1.5 hover:opacity-100 opacity-90"
                thumbClassName="h-3.5 w-3.5 hover:scale-125 transition-transform duration-200 shadow-md shadow-primary/20"
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume and Additional Controls - Right Section */}
        <div className="flex items-center space-x-3 justify-end col-span-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ListMusic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Queue</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {/* Volume Control */}
          <div
            className="flex items-center space-x-2"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8 rounded-full"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {isMuted ? 'Unmute' : 'Mute'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Volume Slider */}
            <div 
              className={cn(
                "w-0 overflow-hidden transition-all duration-300",
                isVolumeHovered && "w-24"
              )}
            >
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full hover:opacity-100 opacity-90"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerBar;
