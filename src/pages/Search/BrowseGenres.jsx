import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { Music, Layers, Loader2, Disc, Radio, Mic2, Headphones, Waves, Guitar, Piano, Drum } from 'lucide-react';
import musicService from '../../services/musicService';

const BrowseGenres = ({ onGenreClick }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState(new Set());
  
  // Function to get genre-specific images from Unsplash
  const getGenreImage = (genreName) => {
    // Standardize genre name format (handle case variations and special formatting)
    const normalizedName = genreName.toLowerCase().replace(/\band\b/g, '&');
    
    // Create a mapping of genres to specific Unsplash images
    // These are all free-to-use images from Unsplash with appropriate licenses
    const genreImages = {
      // Main genres
      'popular genres': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
      'pop': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
      'rock': 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=400&auto=format&fit=crop',
      'hip hop': 'https://images.unsplash.com/photo-1502773860571-211a597d6e4b?q=80&w=400&auto=format&fit=crop',
      'electronic': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=400&auto=format&fit=crop',
      'r&b': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop',
      'indie': 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=400&auto=format&fit=crop',
      'jazz': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=400&auto=format&fit=crop',
      'classical': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop',
      'country': 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?q=80&w=400&auto=format&fit=crop',
      'latin': 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=400&auto=format&fit=crop',
      'bollywood': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop',
      'edm': 'https://images.unsplash.com/photo-1563841930606-67e2bce48b78?q=80&w=400&auto=format&fit=crop',
      'metal': 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?q=80&w=400&auto=format&fit=crop',
      'reggae': 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop',
      'folk': 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=400&auto=format&fit=crop',
      'blues': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop',
      
      // Additional genres
      'indian': 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=400&auto=format&fit=crop',
      '2000s': 'https://images.unsplash.com/photo-1593698054409-8f3ce2c037c8?q=80&w=400&auto=format&fit=crop',
      '90s': 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=400&auto=format&fit=crop',
      '80s': 'https://images.unsplash.com/photo-1541014740747-10c939f5f5d1?q=80&w=400&auto=format&fit=crop',
      'disco': 'https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=400&auto=format&fit=crop',
      'workout': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop',
      'chill': 'https://images.unsplash.com/photo-1520052205864-92d242b3a76b?q=80&w=400&auto=format&fit=crop',
      'sleep': 'https://images.unsplash.com/photo-1631207188099-e04e66ec7832?q=80&w=400&auto=format&fit=crop',
      'focus': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop',
      'party': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop',
      'ambient': 'https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=400&auto=format&fit=crop',
      'punk': 'https://images.unsplash.com/photo-1564585222527-c2777a5bc6cb?q=80&w=400&auto=format&fit=crop',
      'soul': 'https://images.unsplash.com/photo-1621873495812-9a137d8a9b56?q=80&w=400&auto=format&fit=crop',
      'funk': 'https://images.unsplash.com/photo-1571081858339-939da4004aab?q=80&w=400&auto=format&fit=crop',
    };
    
    // Special cases for specific genres that might have different formats in the API
    if (normalizedName === 'r-and-b' || normalizedName === 'r and b') return genreImages['r&b'];
    if (normalizedName === 'hip-hop') return genreImages['hip hop'];
    if (normalizedName === 'edm' || normalizedName === 'electronic dance music') return genreImages['edm'];
    
    return genreImages[normalizedName];
  };
  
  // Icons to display for different genres (Spotify-like)
  const genreIcons = {
    'Popular Genres': <Disc className="h-6 w-6 text-white" />,
    'Rock': <Guitar className="h-6 w-6 text-white" />,
    'Pop': <Music className="h-6 w-6 text-white" />,
    'Hip hop': <Mic2 className="h-6 w-6 text-white" />,
    'R&B': <Headphones className="h-6 w-6 text-white" />,
    'Electronic': <Waves className="h-6 w-6 text-white" />,
    'Jazz': <Radio className="h-6 w-6 text-white" />,
    'Classical': <Piano className="h-6 w-6 text-white" />,
    'Bollywood': <Music className="h-6 w-6 text-white" />,
    'Indie': <Guitar className="h-6 w-6 text-white" />,
    'Metal': <Guitar className="h-6 w-6 text-white" />,
    'Country': <Guitar className="h-6 w-6 text-white" />,
    'Latin': <Disc className="h-6 w-6 text-white" />,
    'Edm': <Waves className="h-6 w-6 text-white" />,
    'Reggae': <Drum className="h-6 w-6 text-white" />,
    'Folk': <Guitar className="h-6 w-6 text-white" />,
    'Blues': <Guitar className="h-6 w-6 text-white" />,
    'Default': <Music className="h-6 w-6 text-white" />
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const genreData = await musicService.getGenres();
      
      // Check if we have valid genre data
      if (Array.isArray(genreData) && genreData.length > 0) {
        console.log('Loaded genres:', genreData.length);
        setGenres(genreData);
      } else {
        console.error('Invalid genre data received:', genreData);
        throw new Error('Invalid genre data received');
      }
    } catch (error) {
      console.error('Failed to load genres:', error);
      // Fallback genres if API fails
      setGenres([
        { id: 'popular-genres', name: 'Popular Genres', color: 'from-red-500 to-pink-600' },
        { id: 'rock', name: 'Rock', color: 'from-red-500 to-pink-600' },
        { id: 'pop', name: 'Pop', color: 'from-blue-500 to-indigo-600' },
        { id: 'hip-hop', name: 'Hip Hop', color: 'from-green-500 to-emerald-600' },
        { id: 'electronic', name: 'Electronic', color: 'from-yellow-500 to-orange-600' },
        { id: 'jazz', name: 'Jazz', color: 'from-purple-500 to-violet-600' },
        { id: 'classical', name: 'Classical', color: 'from-teal-500 to-cyan-600' },
        { id: 'indian', name: 'Indian', color: 'from-amber-500 to-orange-600' },
        { id: 'bollywood', name: 'Bollywood', color: 'from-rose-500 to-red-600' },
        { id: 'indie', name: 'Indie', color: 'from-indigo-500 to-blue-600' },
        { id: 'metal', name: 'Metal', color: 'from-stone-600 to-zinc-800' },
        { id: 'r-and-b', name: 'R&B', color: 'from-purple-600 to-indigo-600' },
        { id: 'edm', name: 'EDM', color: 'from-cyan-500 to-blue-600' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageError = (genreId) => {
    setImageErrors(prev => new Set(prev).add(genreId));
  };

  // Genre color mapping for visual variety - Spotify-style colors
  const genreColors = {
    'Popular Genres': 'from-rose-600 to-rose-900',
    'Pop': 'from-blue-600 to-blue-900',
    'Rock': 'from-red-600 to-red-900',
    'Hip hop': 'from-green-600 to-green-900',
    'Electronic': 'from-amber-500 to-amber-800',
    'R&B': 'from-purple-600 to-purple-900',
    'Indie': 'from-cyan-600 to-cyan-900',
    'Jazz': 'from-amber-600 to-orange-900',
    'Classical': 'from-rose-600 to-rose-900',
    'Country': 'from-blue-600 to-indigo-900',
    'Latin': 'from-neutral-700 to-neutral-900',
    'Bollywood': 'from-rose-600 to-rose-900',
    'Edm': 'from-blue-400 to-blue-700',
    'Metal': 'from-slate-700 to-slate-900',
    'Reggae': 'from-green-600 to-green-900',
    'Folk': 'from-amber-600 to-amber-900',
    'Blues': 'from-blue-700 to-indigo-900'
  };
  
  // Fallback colors for genres not in the map
  const fallbackColors = [
    'from-rose-600 to-rose-900',
    'from-blue-600 to-blue-900',
    'from-green-600 to-green-900',
    'from-amber-500 to-amber-800',
    'from-purple-600 to-purple-900',
    'from-indigo-600 to-indigo-900',
    'from-cyan-600 to-cyan-900',
  ];

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Layers className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Browse Genres</h1>
          </div>
          <Loader2 className="animate-spin h-6 w-6 text-primary" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Card key={index} className="animate-pulse aspect-square relative overflow-hidden border-none rounded-lg shadow-md">
              <CardContent className="absolute inset-0 p-0 bg-card/80">
                <div className="w-full h-full bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-muted/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-muted/60 animate-spin" />
                  </div>
                </div>
                {/* Simulated title area */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="h-5 w-24 bg-muted/40 rounded-md"></div>
                </div>
                {/* Simulate overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex flex-col mb-8">
        <div className="flex items-center mb-2">
          <Layers className="h-7 w-7 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Browse Genres</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Explore music across different genres and moods
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {genres.map((genre, index) => {
          const hasError = imageErrors.has(genre.id);
          // Get color from map or use fallback
          const colorClass = genreColors[genre.name] || fallbackColors[index % fallbackColors.length];
          
          // Get icon for this genre or use default
          const genreIcon = genreIcons[genre.name] || genreIcons.Default;
          
          return (
            <Card
              key={genre.id || `genre-${index}`}
              className="genre-card aspect-square relative overflow-hidden border-none rounded-lg shadow-md cursor-pointer bg-card hover:shadow-xl"
              onClick={() => onGenreClick(genre.name)}
            >
              <CardContent className="absolute inset-0 p-0">
                {/* Background: prioritize genre-specific images, then API image, then fallback to gradient */}
                <div className="absolute inset-0">
                  {getGenreImage(genre.name) ? (
                    <img
                      src={getGenreImage(genre.name)}
                      alt={genre.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                      onError={() => handleImageError(genre.id)}
                      loading="lazy"
                    />
                  ) : genre.image && !hasError ? (
                    <img
                      src={genre.image}
                      alt={genre.name}
                      className="w-full h-full object-cover transition-transform duration-500"
                      onError={() => handleImageError(genre.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className={cn(
                      "w-full h-full bg-gradient-to-br",
                      colorClass
                    )} />
                  )}
                </div>
                
                {/* Icon - improved visibility */}
                <div className="absolute top-3 left-3">
                  <div className="genre-icon bg-black/40 backdrop-blur-md rounded-full p-2.5 shadow-md border border-white/20">
                    {genreIcon}
                  </div>
                </div>
                
                {/* Enhanced overlay for better text readability and spotify-like feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                
                {/* Genre name - improved visibility */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h2 className="text-xl font-extrabold text-white drop-shadow-lg tracking-wide">
                    {genre.name}
                  </h2>
                </div>
                
                {/* Hover effect - spotify-style highlight */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-all duration-200 bg-white/10" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BrowseGenres;
