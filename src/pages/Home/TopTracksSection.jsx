import { Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

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
        <h2 className="text-2xl font-bold text-foreground mb-6">Top Bollywood Tracks</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-2">
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
      <h2 className="text-2xl font-bold text-foreground mb-6">Top Bollywood Tracks</h2>
      <div className="space-y-2">
        {topTracks.slice(0, 8).map((track, index) => (
          <Card
            key={track.id || index}
            className="cursor-pointer transition-colors hover:bg-accent/50 group"
            onClick={() => onPlayTrack(track)}
          >
            <CardContent className="flex items-center space-x-4 p-3">
              <span className="text-muted-foreground text-sm w-4 text-center">
                {index + 1}
              </span>
              <img
                src={track.image || track.youtube_image || (track.album?.images && track.album.images[0]?.url)}
                alt={track.name}
                className="h-12 w-12 rounded object-cover"
                onError={(e) => {
                  // Use default YouTube thumbnail if image fails to load
                  e.target.src = 'https://i.ytimg.com/vi/default/default.jpg';
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {track.name || 'Unknown Track'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist || (track.artists && track.artists[0]?.name) || 'Unknown Artist'}
                  {track.source && <span className="ml-2 opacity-50">({track.source})</span>}
                </p>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {track.duration || formatDuration(track.duration_ms) || '0:00'}
                </span>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Helper function to format duration from milliseconds
const formatDuration = (durationMs) => {
  if (!durationMs) return '0:00';
  
  try {
    // Handle string values that might be passed
    if (typeof durationMs === 'string') {
      // If it's already in MM:SS format, return as is
      if (durationMs.includes(':')) return durationMs;
      
      // Try to convert to a number
      durationMs = parseInt(durationMs, 10);
      if (isNaN(durationMs)) return '0:00';
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
