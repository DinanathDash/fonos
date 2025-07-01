import { Play } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const RecentlyPlayedSection = ({ recentlyPlayed, onPlayTrack }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-foreground mb-6">Recently Played Bollywood</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentlyPlayed.map((item, index) => (
          <Card
            key={index}
            className={cn(
              "p-4 cursor-pointer transition-colors hover:bg-accent/50 group"
            )}
            onClick={() => onPlayTrack(item)}
          >
            <CardContent className="flex items-center space-x-4 p-0">
              <img
                src={item.youtube_image || item.image || item.track?.album?.images?.[0]?.url}
                alt={item.name || item.track?.name}
                className="h-16 w-16 rounded-md object-cover"
                onError={(e) => {
                  // Try using YouTube Music API's default album art if available
                  if (item.youtube_image && e.target.src !== item.youtube_image) {
                    e.target.src = item.youtube_image;
                  } else {
                    // Use YouTube default thumbnail as fallback
                    e.target.src = 'https://i.ytimg.com/vi/default/mqdefault.jpg';
                  }
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">
                  {item.name || item.track?.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {item.artist || item.track?.artists?.[0]?.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Play className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
