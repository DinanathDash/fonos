import { useState } from 'react';
import { Music, Mail, Lock, Eye, EyeOff, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { cn } from '../../lib/utils';

const AuthPopover = ({ isOpen, onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('signin');

    const { signIn, signUp, signInWithGoogle } = useAuth();

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setDisplayName('');
        setShowPassword(false);
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await signIn(email, password);
            onSuccess?.();
            handleClose();
        } catch (error) {
            setError(error.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!email || !password || !confirmPassword || !displayName) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await signUp(email, password, displayName);
            onSuccess?.();
            handleClose();
        } catch (error) {
            setError(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError('');
            await signInWithGoogle();
            onSuccess?.();
            handleClose();
        } catch (error) {
            setError(error.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Glassmorphic Popover */}
            <div className={cn(
                "relative w-full max-w-md max-h-[90vh] overflow-y-auto",
                "bg-black/30 backdrop-blur-lg border border-white/10",
                "rounded-2xl shadow-2xl",
                "animate-in fade-in-0 zoom-in-95 duration-300"
            )}>

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-white/70 hover:text-white hover:bg-white/10 z-10 rounded-full"
                >
                    <X className="h-4 w-4" />
                </Button>

                {/* Header */}
                <div className="text-center pt-8 pb-6 px-6">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="p-2 bg-primary/20 rounded-xl border border-primary/30">
                            <Music className="h-8 w-8 text-primary" />
                        </div>
                        <span className="text-2xl font-bold text-white">
                            Fonos
                        </span>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Welcome to Your Music
                    </h2>
                    <p className="text-white/80 text-sm">
                        Sign in to access your personalized music experience
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                            <p className="text-red-100 text-sm">{error}</p>
                        </div>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full bg-white/10 border border-white/20 rounded-lg p-1">
                            <TabsTrigger 
                                value="signin"
                                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-md font-medium transition-all duration-200"
                            >
                                Sign In
                            </TabsTrigger>
                            <TabsTrigger 
                                value="signup"
                                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70 rounded-md font-medium transition-all duration-200"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="signin" className="space-y-4 mt-6">
                            <form onSubmit={handleSignIn} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label className="text-white text-sm font-medium">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2 h-5 w-5 text-white/60" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={cn(
                                                "pl-10 bg-white/10 border-white/20",
                                                "text-white placeholder:text-white/60",
                                                "focus:border-primary/50 focus:ring-primary/25",
                                                "rounded-lg transition-all duration-200",
                                                "hover:bg-white/15 focus:bg-white/15"
                                            )}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label className="text-white text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2 h-5 w-5 text-white/60" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={cn(
                                                "pl-10 pr-10 bg-white/10 border-white/20",
                                                "text-white placeholder:text-white/60",
                                                "focus:border-primary/50 focus:ring-primary/25",
                                                "rounded-lg transition-all duration-200",
                                                "hover:bg-white/15 focus:bg-white/15"
                                            )}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-white/10 rounded-r-lg"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 rounded-lg"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup" className="space-y-4 mt-6">
                            <form onSubmit={handleSignUp} className="space-y-4">
                                {/* Display Name Field */}
                                <div className="space-y-2">
                                    <Label className="text-white text-sm font-medium">Display Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2 h-5 w-5 text-white/60" />
                                        <Input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className={cn(
                                                "pl-10 bg-white/10 border-white/20",
                                                "text-white placeholder:text-white/60",
                                                "focus:border-primary/50 focus:ring-primary/25",
                                                "rounded-lg transition-all duration-200",
                                                "hover:bg-white/15 focus:bg-white/15"
                                            )}
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label className="text-white text-sm font-medium">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2 h-5 w-5 text-white/60" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={cn(
                                                "pl-10 bg-white/10 border-white/20",
                                                "text-white placeholder:text-white/60",
                                                "focus:border-primary/50 focus:ring-primary/25",
                                                "rounded-lg transition-all duration-200",
                                                "hover:bg-white/15 focus:bg-white/15"
                                            )}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label className="text-white text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2 h-5 w-5 text-white/60" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className={cn(
                                                "pl-10 pr-10 bg-white/10 border-white/20",
                                                "text-white placeholder:text-white/60",
                                                "focus:border-primary/50 focus:ring-primary/25",
                                                "rounded-lg transition-all duration-200",
                                                "hover:bg-white/15 focus:bg-white/15"
                                            )}
                                            placeholder="Create a password"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white hover:bg-white/10 rounded-r-lg"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <Label className="text-white text-sm font-medium">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2 h-5 w-5 text-white/60" />
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={cn(
                                                "pl-10 bg-white/10 border-white/20",
                                                "text-white placeholder:text-white/60",
                                                "focus:border-primary/50 focus:ring-primary/25",
                                                "rounded-lg transition-all duration-200",
                                                "hover:bg-white/15 focus:bg-white/15"
                                            )}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 rounded-lg"
                                >
                                    {loading ? 'Creating account...' : 'Create Account'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-3 bg-black/80 text-white/80">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className={cn(
                            "w-full bg-white/10 border-white/20",
                            "text-white hover:bg-white/15 hover:text-white",
                            "font-semibold transition-all duration-200",
                            "hover:border-white/30 rounded-lg"
                        )}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AuthPopover;
