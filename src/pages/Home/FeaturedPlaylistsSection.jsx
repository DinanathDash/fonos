import { Link } from 'react-router-dom';
import { Play, ListMusic, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import MarqueeText from '../../components/ui/marquee-text';
import { cn } from '../../lib/utils';

const FeaturedPlaylistsSection = ({ featuredPlaylists }) => {
  if (!featuredPlaylists || featuredPlaylists.length === 0) {
    return null;
  }

  // Generate random gradient colors for playlists that don't have images
  const generateRandomGradient = (index) => {
    const gradients = [
      'from-blue-600 to-indigo-600',
      'from-green-600 to-teal-600',
      'from-purple-600 to-pink-600',
      'from-yellow-600 to-orange-600',
      'from-red-600 to-pink-600',
      'from-indigo-600 to-purple-600',
    ];

    return gradients[index % gradients.length];
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <ListMusic className="h-6 w-6 mr-2 text-muted-foreground" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-500">
            Featured Playlists
          </span>
        </h2>
        <Link
          to="/playlists"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
        >
          Show all
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {featuredPlaylists.map((playlist, index) => (
          <Link key={`playlist-${playlist.id || index}`} to={`/playlist/${playlist.id}`}>
            <Card className="group hover:scale-[1.02] transition-all duration-300 border-none hover:border hover:border-primary/20 hover:shadow-md overflow-hidden bg-card/50 h-full">
              <CardContent className="p-0 relative">
                {/* Playlist cover image with fallback gradient */}
                <div className="relative w-full aspect-square overflow-hidden rounded-xl">
                  {playlist.image || playlist.images?.[0]?.url ? (
                    <img
                      src={playlist.image || playlist.images?.[0]?.url}
                      alt={playlist.name || playlist.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={cn(
                        'h-full w-full flex items-center justify-center bg-gradient-to-br',
                        generateRandomGradient(index)
                      )}
                    >
                      <ListMusic className="h-8 w-8 text-white/80" />
                    </div>
                  )}

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

                  {/* Track info positioned at bottom of card */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <MarqueeText className="font-medium text-white drop-shadow-md text-sm">
                      {playlist.name || playlist.title}
                    </MarqueeText>
                    <div className="flex items-center">
                      <span className="text-xs text-white/80 drop-shadow-md">
                        {playlist.tracks?.total || playlist.trackCount || '?'} tracks
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPlaylistsSection;
