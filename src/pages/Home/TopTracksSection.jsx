import { Heart, MoreHorizontal, Play, Music } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import MarqueeText from '../../components/ui/marquee-text';

const TopTracksSection = ({ topTracks, onPlayTrack, loading }) => {
  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Top Bollywood Tracks</h2>
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="flex items-center space-x-4 p-3">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <div className="h-12 w-12 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (!topTracks || topTracks.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
            Top Bollywood Tracks
          </span>
        </h2>
        <Card className="border border-white/10">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg text-foreground mb-2">
              🎵 Loading Bollywood tracks...
            </p>
            <p className="text-sm text-muted-foreground">
              If tracks don't load, check the browser console. The app will use YouTube Music to find tracks.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 group flex items-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          Top Bollywood Tracks
        </span>
        <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full text-xs h-7 px-3 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary"
          >
            View All
          </Button>
        </div>
      </h2>
      
      <div className="space-y-2">
        {topTracks.slice(0, 8).map((track, index) => (
          <Card
            key={`top-track-${index}-${track.id || ''}`}
            className="cursor-pointer transition-all hover:bg-accent/30 hover:border-primary/20 group border border-transparent"
            onClick={() => onPlayTrack(track)}
          >
            <CardContent className="flex items-center p-3 relative overflow-hidden">
              {/* Rank */}
              <span className="text-muted-foreground w-8 text-center font-mono">
                {index + 1}
              </span>
              
              {/* Album Art */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded group-hover:shadow-md group-hover:shadow-primary/20">
                <img
                  src={track.image || track.youtube_image || (track.album?.images && track.album.images[0]?.url)}
                  alt={track.name}
                  className="h-12 w-12 object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // Use default YouTube thumbnail if image fails to load
                    e.target.src = 'https://i.ytimg.com/vi/default/default.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* Track Info */}
              <div className="flex-1 min-w-0 px-4">
                <MarqueeText className="font-medium text-foreground">
                  {track.name || track.title || 'Track'}
                </MarqueeText>
                <MarqueeText className="text-sm text-muted-foreground">
                  {track.artist || (track.artists && track.artists[0]?.name) || 'Artist'}
                  {track.source ? <span className="ml-2 opacity-50 text-xs">({track.source})</span> : null}
                </MarqueeText>
              </div>
              
              {/* Track Controls */}
              <div className="flex items-center space-x-2">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white/10">
                    <Heart className="h-3.5 w-3.5" />
                  </Button>
                </div>
                
                <span className="text-sm text-muted-foreground tabular-nums">
                  {track.duration || formatDuration(track.duration_ms) || '0:00'}
                </span>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white/10">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              
              {/* Hover Indicator */}
              <div className="absolute left-0 top-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Helper function to format duration from milliseconds
const formatDuration = (durationMs) => {
  if (durationMs === undefined || durationMs === null) return '0:00';
  
  try {
    // If it's already a properly formatted string with a colon, return as is
    if (typeof durationMs === 'string' && durationMs.includes(':')) {
      // Validate format is MM:SS
      const parts = durationMs.split(':');
      if (parts.length === 2 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1]))) {
        return durationMs;
      }
    }
    
    // Convert to number if it's a string number
    if (typeof durationMs === 'string') {
      durationMs = parseInt(durationMs, 10);
      if (isNaN(durationMs)) return '0:00';
    }
    
    // If duration is in seconds (less than 5000), convert to ms
    if (durationMs < 5000 && durationMs > 0) {
      durationMs *= 1000;
    }
    
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '0:00';
  }
};

export default TopTracksSection;
