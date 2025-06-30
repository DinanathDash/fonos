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
  MoreHorizontal
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Card } from './ui/card';

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

  if (!currentTrack) {
    return null;
  }

  return (
    <Card className="border-t rounded-none px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Currently Playing */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <img
              src={currentTrack.album?.images?.[0]?.url || currentTrack.image || '/placeholder-album.png'}
              alt={currentTrack.name}
              className="h-14 w-14 rounded-md object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-foreground truncate">
              {currentTrack.name}
              {isDemoMode && (
                <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                  Demo
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate">
              {currentTrack.artists?.map(artist => artist.name).join(', ') || currentTrack.artist || 'Unknown Artist'}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleShuffle}
              className={cn(
                "h-8 w-8",
                isShuffled 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playPrevious}
              className="h-8 w-8"
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              onClick={togglePlayPause}
              className="h-8 w-8 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={playNext}
              className="h-8 w-8"
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleRepeat}
              className={cn(
                "h-8 w-8 relative",
                repeatMode !== 'off' 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Repeat className="h-4 w-4" />
              {repeatMode === 'track' && (
                <span className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                  1
                </span>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1">
              <Slider
                value={[progressPercentage]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume and Additional Controls */}
        <div className="flex items-center space-x-3 flex-1 justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {/* Volume Control */}
          <div
            className="flex items-center space-x-2 group"
            onMouseEnter={() => setIsVolumeHovered(true)}
            onMouseLeave={() => setIsVolumeHovered(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* Volume Slider */}
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerBar;
