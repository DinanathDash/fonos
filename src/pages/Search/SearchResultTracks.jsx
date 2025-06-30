import { Clock } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const SearchResultTracks = ({ tracks, onPlayTrack }) => {
  return (
    <div className="space-y-4">
      {tracks.map((track, index) => (
        <Card
          key={index}
          className="cursor-pointer transition-colors hover:bg-accent/50 group"
          onClick={() => onPlayTrack(track)}
        >
          <CardContent className="flex items-center space-x-4 p-3">
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
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {track.duration || formatDuration(track.duration_ms)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const formatDuration = (durationMs) => {
  if (!durationMs) return '0:00';
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default SearchResultTracks;
