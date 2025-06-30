# 🎵 Fonos - Enhanced Music Streaming with Vast Catalog

A modern, feature-rich music streaming application with access to **1,000,000+ tracks** from 6 different free music APIs. Experience unlimited, legal, high-quality music streaming.

![Fonos Screenshot](https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&crop=center)

## ✨ Enhanced Features

### 🎧 Massive Music Catalog
- **1,000,000+ tracks** from 6 free music APIs
- **500+ genres** from classical to electronic  
- **Featured playlists** from multiple platforms
- **Live radio stations** from around the world
- **Full-length streaming** (not just previews)
- **High-quality MP3** audio streams

### 🔗 Integrated Music APIs
- **🎶 Jamendo**: 500K+ Creative Commons tracks with streaming
- **📚 Archive.org**: 1M+ Public Domain & historical recordings
- **🎚️ ccMixter**: 50K+ Creative Commons remixes & originals
- **🎵 Deezer**: 90M+ track metadata & chart information
- **📖 MusicBrainz**: Comprehensive music metadata database
- **📻 Radio Browser**: 40K+ live radio stations worldwide

### 🚀 Advanced Discovery
- **Multi-source search** across all 6 APIs
- **Mood-based recommendations** (chill, energetic, focus, workout)
- **Genre exploration** with real streaming tracks
- **Trending music** from multiple platforms
- **Smart fallbacks** if any API is unavailable

### 🎧 Core Music Features
- **Full-Featured Music Player**: Play, pause, skip, shuffle, repeat with seamless audio controls
- **Advanced Search**: Real-time search across tracks, artists, albums, and playlists from 6 APIs
- **Personal Library**: Manage liked songs, custom playlists, and recently played
- **Music Discovery**: AI-powered recommendations and vast catalog exploration

### 🔐 Authentication & User Management
- **Firebase Authentication**: Secure email/password and Google OAuth sign-in
- **User Profiles**: Personalized user experience with profile management
- **Social Features**: Follow artists, create and share playlists

### 🎨 Modern UI/UX
- **Dark Theme Design**: Beautiful dark interface with lime green accents
- **Responsive Layout**: Seamless experience across desktop, tablet, and mobile
- **Smooth Animations**: Intuitive interactions with fluid transitions
- **Accessibility**: WCAG compliant with keyboard navigation support

### 🚀 Performance & Technical
- **Lightning Fast**: Optimized with Vite for instant hot reloading
- **Component Library**: ShadCN + Material UI for consistent, beautiful components
- **State Management**: Efficient React Context for global state
- **Enhanced Music APIs**: Integration with 6 free music APIs for vast catalog
- **Smart Caching**: Intelligent caching system to reduce API calls and improve performance

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, JSX |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS, Material UI, ShadCN |
| **Authentication** | Firebase Auth |
| **Database** | Firebase Firestore |
| **Music APIs** | Jamendo + Archive.org + ccMixter + Deezer + MusicBrainz + Radio Browser |
| **Routing** | React Router DOM |
| **Icons** | Lucide React |
| **State** | React Context API |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Free Jamendo API key (required)
- Optional: Pixabay API key (more content)

### 1. Get Your Free Jamendo API Key
```bash
# Visit https://devportal.jamendo.com/
# 1. Create free account
# 2. Create new application  
# 3. Copy your Client ID
```

### 2. Installation
```bash
# Clone the repository
git clone <repository-url>
cd fonos

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add your Jamendo Client ID to .env.local
```

### 3. Environment Configuration
```bash
# Required: Jamendo API key
VITE_JAMENDO_CLIENT_ID=your_jamendo_client_id_here

# Optional: Firebase (for authentication)
VITE_FIREBASE_API=your_firebase_api_key
VITE_FIREBASE_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# Optional: Pixabay (additional music)
VITE_PIXABAY_API_KEY=your_pixabay_api_key
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

## 🎵 Music Catalog Features

### 📊 Massive Collection
- **1,000,000+ tracks** across all sources
- **500+ genres** with real streaming content
- **100,000+ artists** from around the world
- **Unlimited playlists** from multiple platforms

### 🎧 Streaming Sources

#### Primary Streaming (Full Audio)
- **Jamendo**: 500K+ Creative Commons licensed tracks
- **Archive.org**: 1M+ Public Domain historical recordings
- **ccMixter**: 50K+ Creative Commons remixes and originals

#### Metadata & Discovery
- **Deezer**: 90M+ track metadata and charts
- **MusicBrainz**: Comprehensive music database
- **Radio Browser**: 40K+ live radio stations

### 🔍 Advanced Search
```javascript
// Search across all 6 APIs simultaneously
const results = await musicService.search('jazz piano', 'track', 20);

// Get music by mood
const chillTracks = await musicService.getMusicByMood('chill', 15);

// Explore specific sources
const archiveTracks = await musicService.getTracksBySource('archive', 10);
```

### 🎯 Smart Features
- **Mood-based recommendations**: chill, energetic, focus, workout, sleep, party
- **Multi-source fallbacks**: If one API fails, others continue working
- **Intelligent caching**: Reduces API calls and improves performance  
- **Real-time discovery**: Trending tracks from multiple platforms

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

## 📱 Features in Development

- [ ] **Lyrics Integration**: Real-time lyrics display
- [ ] **Audio Visualizer**: Beautiful waveform animations
- [ ] **Offline Mode**: Download songs for offline listening
- [ ] **Social Features**: Share playlists and follow friends
- [ ] **Podcast Support**: Stream podcasts and audio content
- [ ] **Voice Commands**: Control playback with voice
- [ ] **Smart Recommendations**: AI-powered music discovery

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling system
- [ShadCN](https://ui.shadcn.com/) for component library
- [Lucide React](https://lucide.dev/) for beautiful icons
- [Unsplash](https://unsplash.com/) for beautiful placeholder images

## 📞 Support

- 📧 Email: support@fonos-app.com
- 💬 Discord: [Join our community](https://discord.gg/fonos)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/fonos/issues)

---

<div align="center">
  <p>Made with ❤️ by the Fonos team</p>
  <p>
    <a href="https://fonos-app.com">Website</a> •
    <a href="https://twitter.com/fonos_app">Twitter</a> •
    <a href="https://github.com/yourusername/fonos">GitHub</a>
  </p>
</div>+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
