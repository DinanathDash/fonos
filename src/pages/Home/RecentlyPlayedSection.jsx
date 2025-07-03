import { Play, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import MarqueeText from '../../components/ui/marquee-text';

const RecentlyPlayedSection = ({ recentlyPlayed, onPlayTrack }) => {
  if (!recentlyPlayed || recentlyPlayed.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 group flex items-center">
        <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Recently Played Bollywood
        </span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {recentlyPlayed.map((item, index) => (
          <Card
            key={`recently-played-${index}-${item.id || ''}`}
            className={cn(
              "overflow-hidden border-none hover:border hover:border-primary/20 transition-all duration-300 group cursor-pointer h-full"
            )}
            onClick={() => onPlayTrack(item)}
          >
            <CardContent className="p-0 relative">
              {/* Artwork with overlay */}
              <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                <img
                  src={item.youtube_image || item.image || item.track?.album?.images?.[0]?.url}
                  alt={item.name || item.track?.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
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

                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    variant="default"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <Play className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>

                {/* Gradient overlay at bottom for text readability */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              </div>

              {/* Track info positioned at bottom of card */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <MarqueeText className="font-medium text-white drop-shadow-md text-sm">
                  {item.name || item.track?.name || 'Unknown Track'}
                </MarqueeText>
                <MarqueeText className="text-xs text-white/80 drop-shadow-md">
                  {item.artist || item.track?.artists?.[0]?.name || 'Unknown Artist'}
                </MarqueeText>
              </div>

              {/* Subtle border glow on hover */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border-2 border-primary/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
