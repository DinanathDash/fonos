import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const SearchResultAlbums = ({ albums = [] }) => {
  if (!albums.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No albums found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {albums.map((album, index) => (
        <Card 
          key={`album-${album.id}-${index}`} 
          className="hover:bg-accent cursor-pointer transition-colors group"
        >
          <CardContent className="p-4">
            <div className="aspect-square bg-muted rounded-md mb-3 overflow-hidden">
              {album.image ? (
                <img 
                  src={album.image} 
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No image</span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h4 className="font-medium text-sm text-foreground line-clamp-2">
                {album.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {album.artist}
              </p>
              
              {album.playcount && (
                <Badge variant="secondary" className="text-xs">
                  {album.playcount.toLocaleString()} plays
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResultAlbums;
