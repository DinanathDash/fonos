import { Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const TopTracksSection = ({ topTracks, onPlayTrack }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6">Your Top Tracks</h2>
      <div className="space-y-2">
        {topTracks.slice(0, 5).map((track, index) => (
          <Card
            key={index}
            className="cursor-pointer transition-colors hover:bg-accent/50 group"
            onClick={() => onPlayTrack(track)}
          >
            <CardContent className="flex items-center space-x-4 p-3">
              <span className="text-muted-foreground text-sm w-4 text-center">
                {index + 1}
              </span>
              <img
                src={track.image || track.album?.images?.[0]?.url}
                alt={track.name}
                className="h-12 w-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{track.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist || track.artists?.[0]?.name}
                </p>
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {track.duration || formatDuration(track.duration_ms)}
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
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default TopTracksSection;
