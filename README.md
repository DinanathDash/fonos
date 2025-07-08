# 🎵 Fonos - Modern Music Streaming App

A sleek and modern music streaming application built with React and Firebase. Stream music from YouTube Music and get rich metadata from Last.fm.

![Fonos Screenshot](https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&crop=center)

## ✨ Enhanced Features

### ✨ Key Features
- **🎵 YouTube Music Integration**: Access to millions of songs through YouTube Music
- **📊 Last.fm Metadata**: Rich artist and track information
- **🎧 Full Music Player**: Play, pause, skip, shuffle, and repeat functionality
- **� Playlist Support**: Create and manage playlists
- **� Beautiful UI**: Dark mode interface with modern design
- **� Responsive Design**: Works on desktop, tablet, and mobile

### 🎵 Music Features
- **YouTube Music Integration**: Stream millions of songs
- **Advanced Search**: Search tracks, artists, albums, and playlists
- **Music Discovery**: Featured playlists and recommendations
- **Personal Library**: Save your favorite songs and create playlists

### 🔐 User Features
- **Firebase Authentication**: Secure email/password and Google sign-in
- **User Profiles**: Personalized user experience
- **Library Management**: Create and manage playlists
- **Recently Played**: Track your listening history

### 🎨 UI/UX Features
- **Dark Theme**: Beautiful dark interface with accent colors
- **Responsive Design**: Works on all devices
- **ShadcnUI Components**: Modern, accessible UI components
- **Smooth Animations**: Clean transitions and loading states

### 🚀 Technical Features
- **React + Vite**: Fast development and build times
- **Firebase Backend**: Authentication and data storage
- **YouTube Music API**: Vast music catalog access
- **Last.fm Integration**: Rich music metadata
- **Context API**: Efficient state management

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19 |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + ShadcnUI |
| **Authentication** | Firebase Auth |
| **Database** | Firebase Firestore |
| **Music APIs** | YouTube Music API + Last.fm |
| **Routing** | React Router DOM |
| **Icons** | Lucide React |
| **State** | React Context API |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project
- YouTube Music API key (required)
- Last.fm API key (required)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd fonos

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Configuration
```bash
# Required: API Keys
VITE_YOUTUBE_MUSIC_API_KEY=your_youtube_music_api_key
VITE_LASTFM_API_KEY=your_lastfm_api_key

# Required: Firebase Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Application
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎵 Music Features

### 🎧 YouTube Music Integration
- Stream millions of songs from YouTube Music
- Access official music videos and audio tracks
- Get high-quality audio playback
- Discover trending and popular music

### 📊 Last.fm Integration
- Rich artist and track metadata
- Similar artist recommendations
- Album artwork and descriptions
- User scrobbling support

### 🔍 Search & Discovery
```javascript
// Search YouTube Music
const results = await musicService.search('jazz piano', 'track', 20);

// Get track metadata from Last.fm
const metadata = await lastFmApi.getTrackInfo(track);

// Get personalized recommendations
const recommendations = await musicService.getRecommendations(userId);
```

### 🎯 Key Features
- **Smart Search**: Search across YouTube Music's vast catalog
- **Rich Metadata**: Enhanced track info from Last.fm
- **Offline Support**: Cache frequently played tracks
- **Discovery**: Personalized music recommendations

## 📁 Project Structure
```
fonos/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── services/           # API services and music integration
│   │   ├── musicService.js           # Main music service coordinator
│   │   ├── realMusicService.js       # Jamendo + MusicBrainz integration
│   │   ├── enhancedMusicService.js   # Multi-API service (6 sources)
│   │   └── additionalMusicService.js # Archive.org + ccMixter + more
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   └── utils/              # Utility functions
└── README.md               # This file
``` 
- npm or yarn
- Firebase project
- Jamendo API key (free registration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fonos.git
   cd fonos
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password + Google)
   - Enable Firestore Database
   - Copy your config to `src/lib/firebase.js`

4. **Configure Music APIs**
   - Register for a free Jamendo API key at [Jamendo Developer Portal](https://devportal.jamendo.com/)
   - Add your Jamendo Client ID to `.env.local`
   - MusicBrainz API requires no registration (completely free)

5. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase and Jamendo configuration

6. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
fonos/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Sidebar.jsx   # Navigation sidebar
│   │   ├── Header.jsx    # Top navigation header
│   │   └── PlayerBar.jsx # Music player controls
│   ├── pages/            # Application pages
│   │   ├── Home.jsx      # Dashboard with featured content
│   │   ├── Search.jsx    # Music search interface
│   │   ├── Library.jsx   # User's music library
│   │   ├── Login.jsx     # Authentication page
│   │   └── Signup.jsx    # User registration
│   ├── context/          # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── PlayerContext.jsx  # Music player state
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.js    # Authentication hooks
│   ├── services/         # API integrations
│   │   ├── musicService.js    # Music API service
│   │   └── mockMusicService.js # Mock music data
│   ├── lib/              # Utilities and configs
│   │   ├── firebase.js   # Firebase configuration
│   │   └── utils.js      # Helper functions
│   ├── layouts/          # Page layouts
│   │   └── MainLayout.jsx # Main app layout
│   └── routes/           # Routing configuration
│       └── index.jsx     # Route definitions
├── tailwind.config.js    # Tailwind CSS configuration
├── vite.config.js        # Vite build configuration
└── package.json          # Project dependencies
```

## 🎨 Design System

### Color Palette
```css
--background: #18181b     /* Main background */
--surface: #27272a        /* Card/surface background */
--primary: #84cc16        /* Lime green accent */
--accent: #facc15         /* Yellow accent */
--text: #f4f4f5          /* Primary text */
--muted: #6b7280         /* Secondary text */
```

### Typography
- **Font Family**: Inter (system fallback)
- **Headings**: Bold weights with proper hierarchy
- **Body**: Regular weight with optimal line height

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_JAMENDO_CLIENT_ID=your_jamendo_client_id
```

### Firebase Setup
1. Enable Authentication methods:
   - Email/Password
   - Google Sign-in
2. Create Firestore database
3. Set up security rules

### Music API Setup
1. **Jamendo API (Free)**:
   - Register at [Jamendo Developer Portal](https://devportal.jamendo.com/)
   - Create a new application
   - Copy your Client ID to your `.env.local` file
   - Provides: Streaming tracks, playlists, artists, albums

2. **MusicBrainz API (Free)**:
   - No registration required
   - Automatically used for metadata and genres
   - Provides: Artist information, genres, detailed metadata

## 🚦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 📱 Roadmap

- [ ] **Lyrics Integration**: Display synchronized lyrics
- [ ] **Audio Visualizer**: Add waveform animations
- [ ] **Offline Mode**: Cache songs for offline play
- [ ] **Social Features**: Share music with friends
- [ ] **Desktop App**: Electron-based desktop version
- [ ] **Mobile Apps**: React Native mobile versions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Fonos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ShadcnUI](https://ui.shadcn.com/) - UI components
- [YouTube Music API](https://music.youtube.com/) - Music streaming
- [Last.fm API](https://www.last.fm/api) - Music metadata
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/fonos/issues)
- 💻 Source: [GitHub Repository](https://github.com/yourusername/fonos)

---

<div align="center">
  <p>Made with ❤️ by the Fonos team</p>
</div>
