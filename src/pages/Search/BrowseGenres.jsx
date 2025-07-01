import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import musicService from '../../services/musicService';

const BrowseGenres = ({ onGenreClick }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState(new Set());

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const genreData = await musicService.getGenres();
      setGenres(genreData);
    } catch (error) {
      console.error('Failed to load genres:', error);
      // Fallback genres if API fails
      setGenres([
        { id: 'rock', name: 'Rock' },
        { id: 'pop', name: 'Pop' },
        { id: 'hip-hop', name: 'Hip Hop' },
        { id: 'electronic', name: 'Electronic' },
        { id: 'jazz', name: 'Jazz' },
        { id: 'classical', name: 'Classical' },
        { id: 'indie', name: 'Indie' },
        { id: 'metal', name: 'Metal' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (genreId) => {
    setImageErrors(prev => new Set(prev).add(genreId));
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
            <Card key={index} className="animate-pulse h-32 relative overflow-hidden border-0">
              <div className={cn("absolute inset-0", genreColors[index % genreColors.length])} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <CardContent className="relative p-4 z-10 flex mt-13">
                <div className="h-5 bg-black/20 rounded w-16"></div>
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
        {genres.map((genre, index) => {
          const hasImageError = imageErrors.has(genre.id);
          // Re-enable images with proper fallback handling
          const shouldShowImage = genre.image && !hasImageError;

          return (
            <Card
              key={`genre-${genre.id}-${index}`}
              className="cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden border-0 h-32 group"
              onClick={() => onGenreClick(genre.name)}
            >
              {/* Background Image or Gradient */}
              <div
                className={cn(
                  "absolute inset-0 transition-transform duration-300 group-hover:scale-110",
                  shouldShowImage ? "bg-cover bg-center" : genreColors[index % genreColors.length]
                )}
                style={shouldShowImage ? { backgroundImage: `url(${genre.image})` } : {}}
              >
                {/* Preload image for error handling */}
                {genre.image && !hasImageError && (
                  <img
                    src={genre.image}
                    alt={genre.name}
                    className="hidden"
                    loading="eager"
                    onError={() => handleImageError(genre.id)}
                  />
                )}
              </div>

              {/* Subtle glassmorphic gradient overlay from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Content positioned at bottom without container */}
              <CardContent className="relative p-4 z-10 flex mt-13">
                <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg capitalize">
                  {genre.name}
                </h3>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BrowseGenres;
