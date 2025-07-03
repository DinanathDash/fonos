import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import MarqueeText from '../../components/ui/marquee-text';

const SearchResultArtists = ({ artists }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {artists.map((artist, index) => (
        <Card key={index} className="group cursor-pointer transition-colors hover:bg-accent/50">
          <CardContent className="p-4 text-center">
            <div className="relative mb-4">
              <img
                src={artist.image || artist.images?.[0]?.url}
                alt={artist.name}
                className="w-full aspect-square rounded-full object-cover"
              />
            </div>
            <MarqueeText className="font-medium text-foreground">{artist.name}</MarqueeText>
            <Badge variant="secondary" className="mt-1">Artist</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SearchResultArtists;
