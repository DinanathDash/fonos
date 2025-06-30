import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Search from '../pages/Search';
import Library from '../pages/Library';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'search',
        element: <Search />
      },
      {
        path: 'library',
        element: <Library />
      },
      // Add more routes as needed
      {
        path: 'playlist/:id',
        element: <div>Playlist Page - Coming Soon</div>
      },
      {
        path: 'album/:id',
        element: <div>Album Page - Coming Soon</div>
      },
      {
        path: 'artist/:id',
        element: <div>Artist Page - Coming Soon</div>
      },
      {
        path: 'liked',
        element: <div>Liked Songs Page - Coming Soon</div>
      },
      {
        path: 'recent',
        element: <div>Recently Played Page - Coming Soon</div>
      },
      {
        path: 'profile',
        element: <div>Profile Page - Coming Soon</div>
      },
      {
        path: 'settings',
        element: <div>Settings Page - Coming Soon</div>
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
