import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Bell, 
  User,
  LogOut,
  Settings,
  History,
  Heart,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { cn } from '../lib/utils';

const Header = ({ onOpenAuth, isScrolled = false, onToggleSidebar = () => {}, sidebarVisible = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <header 
      className={cn(
        "px-6 py-4 sticky top-0 z-10 transition-all duration-300",
        isScrolled 
          ? "bg-card/95 backdrop-blur-md shadow-sm border-b border-white/5" 
          : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Navigation with sidebar toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {/* Sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8 rounded-full hover:bg-white/10"
              aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarVisible ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-8 w-8 rounded-full hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(1)}
              className="h-8 w-8 rounded-full hover:bg-white/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Bar */}
          {location.pathname === '/search' && (
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="What do you want to listen to?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full bg-white/10 border-white/20 focus:border-primary/50 focus:ring-primary/25 hover:bg-white/15 focus:bg-white/15 transition-all duration-200"
                />
              </div>
            </form>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {/* Quick Search Button (for non-search pages) */}
          {location.pathname !== '/search' && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/search')}
              className="h-8 w-8 rounded-full border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30"
            >
              <Search className="h-4 w-4" />
            </Button>
          )}

          {user ? (
            <>
              {/* Notifications */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/30"
              >
                <Bell className="h-4 w-4" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-1 ring-white/20 hover:ring-primary/50">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {user?.displayName?.[0] || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 bg-popover/95 backdrop-blur-sm border-white/20" 
                  align="end" 
                  forceMount
                >
                  <div className="flex flex-col space-y-1 p-2 border-b border-white/10">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        {user?.displayName && (
                          <p className="font-medium">{user.displayName}</p>
                        )}
                        {user?.email && (
                          <p className="w-full truncate text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                  </div>
                  
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/library')} className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Your Library
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="p-1">
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-900/20 focus:bg-red-900/20"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Sign In Button for unauthenticated users */
            <Button
              onClick={onOpenAuth}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4"
            >
              <User className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
