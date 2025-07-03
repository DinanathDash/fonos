import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Library, 
  Heart, 
  Plus, 
  Music,
  Settings,
  User,
  Lock,
  History,
  Radio,
  Sparkles,
  ListMusic,
  Clock,
  LayoutList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Your Library', href: '/library', icon: Library, requiresAuth: true },
  ];

  const library = [
    { name: 'Liked Songs', href: '/liked', icon: Heart, count: '23' },
    { name: 'Recently Played', href: '/recent', icon: History },
    { name: 'Your Top Tracks', href: '/top-tracks', icon: Sparkles },
    { name: 'Albums', href: '/albums', icon: ListMusic }
  ];

  const playlists = [
    { name: 'Discover Weekly', href: '/playlist/discover-weekly', color: 'from-purple-500 to-blue-500', updated: true },
    { name: 'Release Radar', href: '/playlist/release-radar', color: 'from-green-500 to-teal-500' },
    { name: 'Chill Vibes', href: '/playlist/chill', color: 'from-blue-500 to-sky-500' },
    { name: 'Bollywood Hits', href: '/playlist/bollywood', color: 'from-red-500 to-orange-500', new: true },
    { name: '2000s Throwbacks', href: '/playlist/throwbacks', color: 'from-amber-500 to-yellow-600' },
    { name: 'Workout Mix', href: '/playlist/workout', color: 'from-indigo-500 to-violet-500' }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-black to-card border-r border-white/10 flex flex-col h-full">
      {/* Logo */}
      <div className="p-5">
        <Link to="/" className="flex items-center space-x-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="p-1.5 bg-primary/20 rounded-xl backdrop-blur-sm border border-primary/30">
            <Music className="h-6 w-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
            Fonos
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const isDisabled = item.requiresAuth && !user;
            
            if (isDisabled) {
              return (
                <div
                  key={item.name}
                  className={cn(
                    "flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-lg",
                    "text-muted-foreground cursor-not-allowed opacity-60 group"
                  )}
                >
                  <Lock className="mr-3 h-4.5 w-4.5 group-hover:text-white transition-colors" />
                  <span className="group-hover:text-white transition-colors">{item.name}</span>
                </div>
              );
            }
            
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start px-4 py-2.5 h-auto",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                )}
              >
                <Link to={item.href}>
                  <Icon className={cn("mr-3 h-4.5 w-4.5", isActive ? "text-primary-foreground" : "text-white/80")} />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Library Section */}
      <ScrollArea className="flex-1">
        <div className="px-3 pb-6">
          {user ? (
            <>
              <Separator className="my-3 bg-white/10" />

              {/* Playlists */}
              <div>
                <h3 className="text-xs font-medium text-white/80 px-2 mb-3 flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                  Made For You
                </h3>
                
                <div className="space-y-1">
                  {playlists.map((playlist, index) => (
                    <Button 
                      key={playlist.name}
                      asChild 
                      variant="ghost" 
                      className="w-full justify-start px-3 py-2.5 h-auto hover:bg-white/5 text-white/80 hover:text-white"
                    >
                      <Link to={playlist.href} className="flex items-center">
                        <div className={cn(
                          "h-10 w-10 rounded bg-gradient-to-br mr-3",
                          playlist.color
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm flex items-center space-x-2">
                            <span>{playlist.name}</span>
                            {playlist.new && <Badge className="bg-primary text-primary-foreground ml-1 text-[10px]">NEW</Badge>}
                          </div>
                          <div className="text-xs text-white/60">
                            Playlist • Fonos
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Sign In Prompt for unauthenticated users */
            <div className="px-3 py-5 bg-gradient-to-br from-primary/20 to-purple-500/10 backdrop-blur-sm rounded-lg mt-4">
              <div className="text-center">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-6 w-6 text-white/80" />
                </div>
                <h4 className="text-sm font-medium text-white mb-2">
                  Enjoy Your Library
                </h4>
                <p className="text-xs text-white/70 mb-4">
                  Sign in to access saved tracks, playlists, and personalized recommendations
                </p>
                <Button className="bg-white hover:bg-white/90 text-black font-medium rounded-full w-full">
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User Profile / Settings - Only show if authenticated */}
      {user && (
        <div className="border-t border-white/10">
          <div className="h-[60px] px-3 flex items-center">
            <div className="flex items-center justify-between bg-black/40 rounded-lg w-full">
              <Button asChild variant="ghost" size="sm" className="flex-1 justify-start hover:bg-white/5">
                <Link to="/profile" className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{user.displayName || 'Profile'}</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/5">
                <Link to="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
