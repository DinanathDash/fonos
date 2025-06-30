import { Music, Play, Heart, Library } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';

const WelcomeBanner = ({ onOpenAuth }) => {
  return (
    <Card className="bg-gradient-to-r from-primary/20 to-purple-600/20 border-primary/30 mb-8">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-primary/20 backdrop-blur-sm rounded-xl border border-primary/30">
                <Music className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-white">Welcome to Fonos</h1>
            </div>
            
            <p className="text-white/80 text-lg mb-6 max-w-2xl">
              Discover millions of songs, create playlists, and enjoy your favorite music. 
              Sign in to unlock your personalized music experience.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center space-x-2 text-white/70">
                <Play className="h-5 w-5 text-primary" />
                <span>Stream millions of songs</span>
              </div>
              <div className="flex items-center space-x-2 text-white/70">
                <Heart className="h-5 w-5 text-primary" />
                <span>Create your favorites</span>
              </div>
              <div className="flex items-center space-x-2 text-white/70">
                <Library className="h-5 w-5 text-primary" />
                <span>Build your library</span>
              </div>
            </div>
            
            <Button
              onClick={onOpenAuth}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Get Started - Sign In
            </Button>
          </div>
          
          {/* Decorative elements */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="w-32 h-32 bg-primary/10 rounded-full backdrop-blur-sm border border-primary/20" />
              <div className="absolute top-4 left-4 w-24 h-24 bg-purple-500/10 rounded-full backdrop-blur-sm border border-purple-500/20" />
              <div className="absolute top-8 left-8 w-16 h-16 bg-primary/20 rounded-full backdrop-blur-sm border border-primary/30 flex items-center justify-center">
                <Music className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
