import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Music, Radio, Database, Sparkles } from 'lucide-react';
import musicService from '@/services/musicService';

const MusicCatalogShowcase = () => {
  const [stats, setStats] = useState(null);
  const [serviceInfo, setServiceInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [demoTracks, setDemoTracks] = useState([]);

  useEffect(() => {
    loadMusicInfo();
  }, []);

  const loadMusicInfo = async () => {
    try {
      setIsLoading(true);
      
      // Get service information
      const info = musicService.getServiceInfo();
      setServiceInfo(info);

      // Get music statistics
      const musicStats = await musicService.getMusicStats();
      setStats(musicStats);

      // Get some demo tracks
      const tracks = await musicService.getDiscoveryTracks(6);
      setDemoTracks(tracks);

    } catch (error) {
      console.error('Error loading music info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAPI = async (source) => {
    try {
      const tracks = await musicService.getTracksBySource(source, 5);
      console.log(`${source} tracks:`, tracks);
      alert(`Successfully loaded ${tracks.length} tracks from ${source}!`);
    } catch (error) {
      console.error(`Error testing ${source}:`, error);
      alert(`Error testing ${source}. Check console for details.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-lime-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading music catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="w-8 h-8 text-lime-400" />
            <h1 className="text-4xl font-bold text-white">Enhanced Music Catalog</h1>
            <Sparkles className="w-8 h-8 text-lime-400" />
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Fonos now integrates 6 different free music APIs to provide access to over 1 million tracks!
          </p>
        </div>

        {/* Service Information */}
        {serviceInfo && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Database className="w-5 h-5 text-lime-400" />
                <span>{serviceInfo.name} v{serviceInfo.version}</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enhanced Mode: {serviceInfo.enhanced ? '✅ Enabled' : '❌ Disabled'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Connected APIs:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceInfo.apis.map((api, index) => (
                    <Badge key={index} variant="secondary" className="bg-lime-400/20 text-lime-300">
                      {api.name} ({api.tracks || api.stations})
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Features:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {serviceInfo.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="border-gray-600 text-gray-300">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Music Statistics */}
        {stats && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Music className="w-5 h-5 text-lime-400" />
                <span>Music Catalog Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-lime-400">1M+</div>
                  <div className="text-gray-400 text-sm">Total Tracks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lime-400">{stats.totalSources}</div>
                  <div className="text-gray-400 text-sm">API Sources</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lime-400">{stats.genres}</div>
                  <div className="text-gray-400 text-sm">Genres</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-lime-400">∞</div>
                  <div className="text-gray-400 text-sm">Playlists</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Quality:</span>
                    <span className="text-white ml-2">{stats.streamingQuality}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">License:</span>
                    <span className="text-white ml-2">{stats.license}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* API Testing */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Test Individual APIs</CardTitle>
            <CardDescription className="text-gray-300">
              Test each music source to verify connectivity and content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                onClick={() => handleTestAPI('jamendo')} 
                variant="outline" 
                className="border-lime-400/50 text-lime-400 hover:bg-lime-400/20"
              >
                Test Jamendo
              </Button>
              <Button 
                onClick={() => handleTestAPI('archive')} 
                variant="outline"
                className="border-blue-400/50 text-blue-400 hover:bg-blue-400/20"
              >
                Test Archive.org
              </Button>
              <Button 
                onClick={() => handleTestAPI('ccmixter')} 
                variant="outline"
                className="border-purple-400/50 text-purple-400 hover:bg-purple-400/20"
              >
                Test ccMixter
              </Button>
              <Button 
                onClick={() => handleTestAPI('pixabay')} 
                variant="outline"
                className="border-orange-400/50 text-orange-400 hover:bg-orange-400/20"
              >
                Test Pixabay
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sample Tracks */}
        {demoTracks.length > 0 && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Radio className="w-5 h-5 text-lime-400" />
                <span>Discovery Tracks</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Random tracks from across all music sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoTracks.map((track, index) => (
                  <div key={track.id || index} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-12 h-12 bg-lime-400/20 rounded-lg flex items-center justify-center">
                      <Music className="w-6 h-6 text-lime-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{track.name}</div>
                      <div className="text-gray-400 text-sm truncate">
                        {track.artists?.[0]?.name || 'Unknown Artist'}
                      </div>
                      {track.source && (
                        <Badge variant="secondary" className="text-xs bg-gray-600 text-gray-300 mt-1">
                          {track.source}
                        </Badge>
                      )}
                    </div>
                    {track.audio_url && (
                      <Button size="sm" variant="ghost" className="text-lime-400 hover:bg-lime-400/20">
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Instructions */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Setup</CardTitle>
            <CardDescription className="text-gray-300">
              Get started with the enhanced music catalog
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-white font-semibold">1. Required API Key (Jamendo)</h4>
              <p className="text-gray-400 text-sm">
                Get your free API key at <a href="https://devportal.jamendo.com/" target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline">devportal.jamendo.com</a>
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-white font-semibold">2. Environment Setup</h4>
              <div className="bg-gray-900 p-3 rounded-lg text-sm">
                <code className="text-lime-400">VITE_JAMENDO_CLIENT_ID=your_api_key_here</code>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-semibold">3. Optional APIs</h4>
              <p className="text-gray-400 text-sm">
                Archive.org, ccMixter, Deezer, MusicBrainz, and Radio Browser work without API keys!
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default MusicCatalogShowcase;
