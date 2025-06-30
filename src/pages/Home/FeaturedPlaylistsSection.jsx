import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const FeaturedPlaylistsSection = ({ featuredPlaylists }) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Featured Playlists</h2>
        <Link
          to="/playlists"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Show all
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {featuredPlaylists.map((playlist, index) => (
          <Link key={index} to={`/playlist/${playlist.id}`}>
            <Card className="group transition-colors hover:bg-accent/50">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <img
                    src={playlist.image || playlist.images?.[0]?.url}
                    alt={playlist.name}
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all shadow-lg"
                  >
                    <Play className="h-4 w-4 ml-0.5" />
                  </Button>
                </div>
                <h3 className="font-medium text-foreground truncate mb-1">{playlist.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{playlist.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPlaylistsSection;
