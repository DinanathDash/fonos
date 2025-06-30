import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { router } from './routes';

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <div className="dark">
          <RouterProvider router={router} />
        </div>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
