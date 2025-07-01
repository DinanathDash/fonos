import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Play } from 'lucide-react';

const SearchResultPlaylists = ({ playlists = [] }) => {
  if (!playlists.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No playlists found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {playlists.map((playlist, index) => (
        <Card 
          key={`playlist-${playlist.id}-${index}`} 
          className="hover:bg-accent cursor-pointer transition-colors group"
        >
          <CardContent className="p-4">
            <div className="aspect-square bg-muted rounded-md mb-3 overflow-hidden relative">
              {playlist.image ? (
                <img 
                  src={playlist.image} 
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                  <Play className="h-8 w-8 text-primary" />
                </div>
              )}
              
              {/* Play button overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-primary rounded-full p-2">
                  <Play className="h-4 w-4 text-primary-foreground fill-current" />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="font-medium text-sm text-foreground line-clamp-2">
                {playlist.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {playlist.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {playlist.trackCount} tracks
                </Badge>
                
                {playlist.type && (
                  <Badge 
                    variant={playlist.type === 'curated' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {playlist.type}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResultPlaylists;
