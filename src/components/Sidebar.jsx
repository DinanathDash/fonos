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
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Your Library', href: '/library', icon: Library, requiresAuth: true },
  ];

  const library = [
    { name: 'Liked Songs', href: '/liked', icon: Heart },
    { name: 'Recently Played', href: '/recent', icon: Music },
  ];

  return (
    <div className="w-64 bg-card border-r flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2">
          <Music className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">Fonos</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4">
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
                    "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                    "text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  <Lock className="mr-3 h-4 w-4" />
                  {item.name}
                </div>
              );
            }
            
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Link to={item.href}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </nav>

        <Separator className="my-6" />

        {/* Library Section - Only show if authenticated */}
        {user && (
          <>
            <div>
              <div className="flex items-center justify-between px-3 mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Library
                </h3>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <nav className="space-y-1">
                {library.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  
                  return (
                    <Button
                      key={item.name}
                      asChild
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Link to={item.href}>
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </div>

            <Separator className="my-6" />

            {/* Playlists */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-4">
                Made for You
              </h3>
              <nav className="space-y-1">
                {/* Placeholder playlists */}
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/playlist/discover-weekly">
                    <div className="mr-3 h-5 w-5 bg-gradient-to-r from-purple-500 to-blue-500 rounded" />
                    Discover Weekly
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link to="/playlist/release-radar">
                    <div className="mr-3 h-5 w-5 bg-gradient-to-r from-green-500 to-teal-500 rounded" />
                    Release Radar
                  </Link>
                </Button>
              </nav>
            </div>
          </>
        )}

        {/* Sign In Prompt for unauthenticated users */}
        {!user && (
          <div className="px-3 py-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                Sign in to access your music library
              </p>
              <p className="text-xs text-muted-foreground">
                Create playlists, save tracks, and sync across devices
              </p>
            </div>
          </div>
        )}
      </div>

      {/* User Profile / Settings - Only show if authenticated */}
      {user && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
