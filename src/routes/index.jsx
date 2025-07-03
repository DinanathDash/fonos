import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Search from '../pages/Search';
import Library from '../pages/Library';
import Playlist from '../pages/Playlist';
import Album from '../pages/Album';
import Artist from '../pages/Artist';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

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
      {
        path: 'playlist/:id',
        element: <Playlist />
      },
      {
        path: 'album/:id',
        element: <Album />
      },
      {
        path: 'artist/:id',
        element: <Artist />
      },
      {
        path: 'liked',
        element: <Playlist /> // We can reuse the Playlist component for Liked Songs
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
