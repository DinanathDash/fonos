import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from '../components/Sidebar';
import PlayerBar from '../components/PlayerBar';
import Header from '../components/Header';
import AuthPopover from '../pages/Auth/AuthPopover';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const { user } = useAuth();
  const [showAuthPopover, setShowAuthPopover] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Show auth popover automatically after 3 seconds if user is not authenticated
  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setShowAuthPopover(true);
      }, 3000); // 3 second delay

      return () => clearTimeout(timer);
    }
  }, [user]);

  // Listen for scroll events to add background to header when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add scroll event listener
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      return () => mainContent.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthPopover(false);
  };

  const handleOpenAuth = () => {
    setShowAuthPopover(true);
  };

  const handleCloseAuth = () => {
    setShowAuthPopover(false);
  };

  const toggleSidebar = () => {
    setSidebarVisible(prev => !prev);
  };

  return (
    <div 
      className="h-screen flex flex-col bg-gradient-to-b from-background to-background/95 text-foreground overflow-hidden"
      style={{ "--sidebar-width": sidebarVisible ? "16rem" : "0px" }}
    >
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[120px] opacity-30" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] opacity-30" />
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-[150px] opacity-30" />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - can be toggled */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            sidebarVisible ? 'w-64 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {sidebarVisible && <Sidebar />}
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header 
            onOpenAuth={handleOpenAuth} 
            isScrolled={isScrolled} 
            onToggleSidebar={toggleSidebar}
            sidebarVisible={sidebarVisible}
          />
          
          {/* Page Content - with improved padding and max width */}
          <main className="flex-1 overflow-y-auto px-6 pb-10 pt-2">
            <div className="max-w-7xl mx-auto">
              <Outlet context={{ onOpenAuth: handleOpenAuth }} />
            </div>
          </main>
          
          {/* Player Bar - positioned within the main content column */}
          <div className="fixed bottom-0 right-0 z-10" style={{ width: "calc(100% - var(--sidebar-width))", maxWidth: "100%", transition: "width 300ms ease" }}>
            <PlayerBar />
          </div>
        </div>
      </div>
      
      {/* Auth Popover */}
      <AuthPopover 
        isOpen={showAuthPopover}
        onClose={handleCloseAuth}
        onSuccess={handleAuthSuccess}
      />
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </div>
  );
};

export default MainLayout;
