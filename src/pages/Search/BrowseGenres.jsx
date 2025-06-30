import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const BrowseGenres = ({ onGenreClick }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      setGenres(genreData);
    } catch (error) {
      console.error('Failed to load genres:', error);
    } finally {
      setLoading(false);
    }
  };

  // Genre color mapping for visual variety
  const genreColors = [
    'bg-gradient-to-br from-red-500 to-pink-600',
    'bg-gradient-to-br from-blue-500 to-indigo-600',
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-yellow-500 to-orange-600',
    'bg-gradient-to-br from-purple-500 to-violet-600',
    'bg-gradient-to-br from-teal-500 to-cyan-600',
    'bg-gradient-to-br from-rose-500 to-red-600',
    'bg-gradient-to-br from-indigo-500 to-blue-600',
  ];

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-8">Browse All</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6 bg-muted">
                <div className="h-6 bg-muted-foreground/20 rounded mb-4"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Browse All</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {genres.map((genre, index) => (
          <Card
            key={genre.id}
            className={cn(
              "cursor-pointer hover:scale-105 transition-transform relative overflow-hidden border-0",
              genreColors[index % genreColors.length]
            )}
            onClick={() => onGenreClick(genre.name)}
          >
            <CardContent className="p-6">
              <h3 className="text-white font-bold text-xl mb-4">{genre.name}</h3>
              {genre.image && (
                <div 
                  className="absolute bottom-2 right-2 w-16 h-16 bg-cover bg-center rounded-lg opacity-80"
                  style={{ backgroundImage: `url(${genre.image})` }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrowseGenres;
