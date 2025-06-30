import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import PlayerBar from '../components/PlayerBar';
import Header from '../components/Header';
import AuthPopover from '../pages/Auth/AuthPopover';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();
  const [showAuthPopover, setShowAuthPopover] = useState(false);

  // Show auth popover automatically after 3 seconds if user is not authenticated
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthPopover(true);
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleAuthSuccess = () => {
    setShowAuthPopover(false);
  };

  const handleOpenAuth = () => {
    setShowAuthPopover(true);
  };

  const handleCloseAuth = () => {
    setShowAuthPopover(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header onOpenAuth={handleOpenAuth} />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet context={{ onOpenAuth: handleOpenAuth }} />
          </main>
        </div>
      </div>
      
      {/* Player Bar */}
      <PlayerBar />

      {/* Auth Popover */}
      <AuthPopover 
        isOpen={showAuthPopover}
        onClose={handleCloseAuth}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default MainLayout;
