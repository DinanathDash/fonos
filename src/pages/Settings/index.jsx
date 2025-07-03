import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, LogOut, Save, Globe, Moon, Sun, Volume2, Music, Bell, Shield, Database } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [settings, setSettings] = useState({
    account: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      profilePicture: user?.photoURL || '',
    },
    appearance: {
      theme: 'dark',
      enableAnimations: true,
      compactMode: false,
      accentColor: 'blue',
    },
    playback: {
      audioQuality: 'high',
      gaplessModeEnabled: true,
      normalizeVolume: true,
      crossfadeTime: 5,
      autoPlay: true,
      volumeLevel: 80,
    },
    notifications: {
      newReleases: true,
      playlistUpdates: true,
      artistUpdates: false,
      promotions: false,
      emailDigest: true,
    },
    privacy: {
      shareListeningHistory: true,
      includeInRecommendations: true,
      dataCollection: true,
      usageData: true,
    },
    storage: {
      cacheLimit: '4',
      downloadQuality: 'high',
      offlineMode: false,
      clearDataOnLogout: false,
      storageUsed: '256MB'
    }
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({
          ...prevSettings,
          ...parsedSettings
        }));
        
        // Apply theme from settings
        if (parsedSettings.appearance?.theme === 'dark') {
          setIsDarkTheme(true);
          document.documentElement.classList.add('dark');
        } else {
          setIsDarkTheme(false);
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error('Error parsing saved settings:', e);
      }
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = isDarkTheme ? 'light' : 'dark';
    setIsDarkTheme(!isDarkTheme);
    
    // Update settings state
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: newTheme
      }
    }));
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveSettings = () => {
    setSaving(true);
    
    // Simulate saving delay
    setTimeout(() => {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setSaving(false);
    }, 1000);
  };

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-muted/50 p-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex flex-grow overflow-hidden"
      >
        <div className="w-60 flex-shrink-0 border-r p-4 hidden md:block">
          <TabsList className="flex flex-col items-start w-full h-auto bg-transparent space-y-1">
            <TabsTrigger 
              value="account" 
              className="w-full justify-start px-3"
            >
              Account
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="w-full justify-start px-3"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="playback" 
              className="w-full justify-start px-3"
            >
              Playback
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="w-full justify-start px-3"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="w-full justify-start px-3"
            >
              Privacy
            </TabsTrigger>
            <TabsTrigger 
              value="storage" 
              className="w-full justify-start px-3"
            >
              Storage
            </TabsTrigger>
          </TabsList>

          <Separator className="my-4" />
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground gap-2"
            onClick={handleSignOut}
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
        
        <ScrollArea className="flex-grow">
          <div className="max-w-3xl p-6">
            <TabsContent value="account" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center justify-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={settings.account.profilePicture || 'https://github.com/shadcn.png'} 
                          alt={settings.account.displayName} 
                        />
                        <AvatarFallback>
                          {settings.account.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" className="mt-4">
                        Change Avatar
                      </Button>
                    </div>
                    
                    <div className="space-y-4 flex-grow">
                      <div className="grid gap-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          value={settings.account.displayName} 
                          onChange={(e) => handleChange('account', 'displayName', e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={settings.account.email} 
                          onChange={(e) => handleChange('account', 'email', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Account Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline">Change Password</Button>
                      <Button variant="outline">Linked Accounts</Button>
                      <Button variant="destructive">Delete Account</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Subscription</h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="font-medium">Free Plan</div>
                      <div className="text-sm text-muted-foreground">
                        You are currently on the free plan with limited features.
                      </div>
                      <Button className="mt-4" variant="default">
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how Fonos looks and feels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="theme">Theme</Label>
                        <div className="text-sm text-muted-foreground">
                          Choose between light and dark themes
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun size={16} className="text-muted-foreground" />
                        <Switch 
                          id="theme" 
                          checked={isDarkTheme} 
                          onCheckedChange={handleThemeToggle}
                        />
                        <Moon size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="animations">Enable animations</Label>
                        <div className="text-sm text-muted-foreground">
                          Toggle interface animations on or off
                        </div>
                      </div>
                      <Switch 
                        id="animations" 
                        checked={settings.appearance.enableAnimations} 
                        onCheckedChange={(checked) => handleChange('appearance', 'enableAnimations', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="compact">Compact mode</Label>
                        <div className="text-sm text-muted-foreground">
                          Use a denser layout with smaller elements
                        </div>
                      </div>
                      <Switch 
                        id="compact" 
                        checked={settings.appearance.compactMode} 
                        onCheckedChange={(checked) => handleChange('appearance', 'compactMode', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Accent color</Label>
                      <div className="flex gap-2 flex-wrap">
                        {['blue', 'green', 'purple', 'orange', 'pink', 'red'].map((color) => (
                          <div 
                            key={color}
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                              settings.appearance.accentColor === color 
                                ? 'border-primary' 
                                : 'border-transparent'
                            }`}
                            style={{
                              backgroundColor: `var(--${color})`,
                              boxShadow: settings.appearance.accentColor === color ? '0 0 0 2px var(--background), 0 0 0 4px var(--primary)' : 'none'
                            }}
                            onClick={() => handleChange('appearance', 'accentColor', color)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select
                        value="en-US"
                        onValueChange={(value) => console.log(value)}
                      >
                        <SelectTrigger id="language">
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="playback" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Playback Settings</CardTitle>
                  <CardDescription>
                    Adjust audio quality and playback preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="audio-quality">Audio quality</Label>
                      <Select
                        value={settings.playback.audioQuality}
                        onValueChange={(value) => handleChange('playback', 'audioQuality', value)}
                      >
                        <SelectTrigger id="audio-quality">
                          <SelectValue placeholder="Select audio quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (96 kbps)</SelectItem>
                          <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                          <SelectItem value="high">High (256 kbps)</SelectItem>
                          <SelectItem value="ultra">Ultra (320 kbps)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="gapless">Gapless playback</Label>
                        <div className="text-sm text-muted-foreground">
                          Eliminate pauses between tracks
                        </div>
                      </div>
                      <Switch 
                        id="gapless" 
                        checked={settings.playback.gaplessModeEnabled} 
                        onCheckedChange={(checked) => handleChange('playback', 'gaplessModeEnabled', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="normalize">Normalize volume</Label>
                        <div className="text-sm text-muted-foreground">
                          Set the same volume level for all tracks
                        </div>
                      </div>
                      <Switch 
                        id="normalize" 
                        checked={settings.playback.normalizeVolume} 
                        onCheckedChange={(checked) => handleChange('playback', 'normalizeVolume', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoplay">Autoplay</Label>
                        <div className="text-sm text-muted-foreground">
                          Automatically play music when app starts
                        </div>
                      </div>
                      <Switch 
                        id="autoplay" 
                        checked={settings.playback.autoPlay} 
                        onCheckedChange={(checked) => handleChange('playback', 'autoPlay', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="crossfade-time">Crossfade between songs</Label>
                        <span className="text-sm text-muted-foreground">
                          {settings.playback.crossfadeTime} seconds
                        </span>
                      </div>
                      <Slider 
                        id="crossfade-time"
                        min={0}
                        max={12}
                        step={1}
                        value={[settings.playback.crossfadeTime]}
                        onValueChange={([value]) => handleChange('playback', 'crossfadeTime', value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="volume-level">Default volume level</Label>
                        <div className="flex items-center gap-2">
                          <Volume2 size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground w-8 text-right">
                            {settings.playback.volumeLevel}%
                          </span>
                        </div>
                      </div>
                      <Slider 
                        id="volume-level"
                        min={0}
                        max={100}
                        step={1}
                        value={[settings.playback.volumeLevel]}
                        onValueChange={([value]) => handleChange('playback', 'volumeLevel', value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Configure what notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="new-releases">New releases</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive alerts when followed artists release new music
                        </div>
                      </div>
                      <Switch 
                        id="new-releases" 
                        checked={settings.notifications.newReleases} 
                        onCheckedChange={(checked) => handleChange('notifications', 'newReleases', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="playlist-updates">Playlist updates</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive alerts when your followed playlists are updated
                        </div>
                      </div>
                      <Switch 
                        id="playlist-updates" 
                        checked={settings.notifications.playlistUpdates} 
                        onCheckedChange={(checked) => handleChange('notifications', 'playlistUpdates', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="artist-updates">Artist updates</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive news about artists you follow
                        </div>
                      </div>
                      <Switch 
                        id="artist-updates" 
                        checked={settings.notifications.artistUpdates} 
                        onCheckedChange={(checked) => handleChange('notifications', 'artistUpdates', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="promotions">Promotions</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive special offers and promotional updates
                        </div>
                      </div>
                      <Switch 
                        id="promotions" 
                        checked={settings.notifications.promotions} 
                        onCheckedChange={(checked) => handleChange('notifications', 'promotions', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-digest">Email digest</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive a weekly summary of new music and activity
                        </div>
                      </div>
                      <Switch 
                        id="email-digest" 
                        checked={settings.notifications.emailDigest} 
                        onCheckedChange={(checked) => handleChange('notifications', 'emailDigest', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Manage how your data is used and shared
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="share-history">Share listening history</Label>
                        <div className="text-sm text-muted-foreground">
                          Let friends see what you're listening to
                        </div>
                      </div>
                      <Switch 
                        id="share-history" 
                        checked={settings.privacy.shareListeningHistory} 
                        onCheckedChange={(checked) => handleChange('privacy', 'shareListeningHistory', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="recommendations">Include in recommendations</Label>
                        <div className="text-sm text-muted-foreground">
                          Use my listening history for personalized recommendations
                        </div>
                      </div>
                      <Switch 
                        id="recommendations" 
                        checked={settings.privacy.includeInRecommendations} 
                        onCheckedChange={(checked) => handleChange('privacy', 'includeInRecommendations', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="data-collection">Data collection</Label>
                        <div className="text-sm text-muted-foreground">
                          Allow collection of anonymous usage data to improve the service
                        </div>
                      </div>
                      <Switch 
                        id="data-collection" 
                        checked={settings.privacy.dataCollection} 
                        onCheckedChange={(checked) => handleChange('privacy', 'dataCollection', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="usage-data">Usage data</Label>
                        <div className="text-sm text-muted-foreground">
                          Share anonymous usage data for research purposes
                        </div>
                      </div>
                      <Switch 
                        id="usage-data" 
                        checked={settings.privacy.usageData} 
                        onCheckedChange={(checked) => handleChange('privacy', 'usageData', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Privacy Actions</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline">Download my data</Button>
                        <Button variant="destructive">Clear listening history</Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Button variant="link" className="p-0">
                        View privacy policy
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="storage" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Storage and Data</CardTitle>
                  <CardDescription>
                    Manage cache, downloads, and data usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label>Storage usage</Label>
                        <span className="text-sm font-medium">{settings.storage.storageUsed}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: '25%' }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        25% of available storage used
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="cache-limit">Cache size limit</Label>
                      <Select
                        value={settings.storage.cacheLimit}
                        onValueChange={(value) => handleChange('storage', 'cacheLimit', value)}
                      >
                        <SelectTrigger id="cache-limit">
                          <SelectValue placeholder="Select cache limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 GB</SelectItem>
                          <SelectItem value="2">2 GB</SelectItem>
                          <SelectItem value="4">4 GB</SelectItem>
                          <SelectItem value="8">8 GB</SelectItem>
                          <SelectItem value="16">16 GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="download-quality">Download quality</Label>
                      <Select
                        value={settings.storage.downloadQuality}
                        onValueChange={(value) => handleChange('storage', 'downloadQuality', value)}
                      >
                        <SelectTrigger id="download-quality">
                          <SelectValue placeholder="Select download quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low (96 kbps)</SelectItem>
                          <SelectItem value="medium">Medium (128 kbps)</SelectItem>
                          <SelectItem value="high">High (256 kbps)</SelectItem>
                          <SelectItem value="ultra">Ultra (320 kbps)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="offline-mode">Offline mode</Label>
                        <div className="text-sm text-muted-foreground">
                          Only show downloaded content when enabled
                        </div>
                      </div>
                      <Switch 
                        id="offline-mode" 
                        checked={settings.storage.offlineMode} 
                        onCheckedChange={(checked) => handleChange('storage', 'offlineMode', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="clear-logout">Clear data on logout</Label>
                        <div className="text-sm text-muted-foreground">
                          Remove all cached data when signing out
                        </div>
                      </div>
                      <Switch 
                        id="clear-logout" 
                        checked={settings.storage.clearDataOnLogout} 
                        onCheckedChange={(checked) => handleChange('storage', 'clearDataOnLogout', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold">Data Management</h3>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline">Clear cache</Button>
                        <Button variant="outline">Clear downloads</Button>
                        <Button variant="destructive">Reset all settings</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
