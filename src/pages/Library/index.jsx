import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Grid3X3, List, Clock, Sparkles, LayoutGrid, Music, Library as LibraryIcon } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import MarqueeText from '../../components/ui/marquee-text';

// Mock data for library
const mockLibraryItems = [
	{
		id: 'liked-songs',
		name: 'Liked Songs',
		type: 'playlist',
		image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
		creator: 'You',
		tracks: 42,
		lastPlayed: new Date(),
		description: 'Your favorite tracks',
		gradient: 'from-purple-500 to-indigo-700',
	},
	{
		id: 'playlist-1',
		name: 'Chill Vibes',
		type: 'playlist',
		image: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=300&h=300&fit=crop',
		creator: 'Fonos',
		tracks: 24,
		lastPlayed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
		description: 'Relax with these smooth tracks',
		gradient: 'from-blue-500 to-cyan-500',
	},
	{
		id: 'playlist-2',
		name: 'Workout Mix',
		type: 'playlist',
		image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=300&fit=crop',
		creator: 'You',
		tracks: 18,
		lastPlayed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
		description: 'High-energy tracks to keep you moving',
		gradient: 'from-red-500 to-orange-500',
	},
	{
		id: 'artist-1',
		name: 'Taylor Swift',
		type: 'artist',
		image: 'https://images.unsplash.com/photo-1604435585148-6d8d58c107a4?w=300&h=300&fit=crop',
		creator: 'Artist',
		tracks: 64,
		lastPlayed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
		description: 'American singer-songwriter',
		gradient: 'from-pink-500 to-rose-500',
	},
	{
		id: 'album-1',
		name: 'After Hours',
		type: 'album',
		image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
		creator: 'The Weeknd',
		tracks: 14,
		lastPlayed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
		description: 'Fourth studio album by The Weeknd',
		gradient: 'from-violet-600 to-indigo-700',
	},
	{
		id: 'album-2',
		name: 'DAMN.',
		type: 'album',
		image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop',
		creator: 'Kendrick Lamar',
		tracks: 14,
		lastPlayed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
		description: 'Fourth studio album by Kendrick Lamar',
		gradient: 'from-red-600 to-pink-600',
	},
	{
		id: 'playlist-3',
		name: 'Road Trip',
		type: 'playlist',
		image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=300&h=300&fit=crop',
		creator: 'You',
		tracks: 32,
		lastPlayed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
		description: 'Perfect soundtrack for your adventures',
		gradient: 'from-green-500 to-emerald-600',
	},
	{
		id: 'playlist-4',
		name: '90s Hits',
		type: 'playlist',
		image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300&h=300&fit=crop',
		creator: 'Fonos',
		tracks: 50,
		lastPlayed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
		description: 'Take a trip down memory lane',
		gradient: 'from-yellow-400 to-orange-500',
	},
];

const Library = () => {
	const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
	const [sortBy, setSortBy] = useState('recent'); // 'recent', 'alphabetical', 'creator'
	const [filterBy, setFilterBy] = useState('all'); // 'all', 'playlists', 'artists', 'albums'
	const [searchQuery, setSearchQuery] = useState('');
	const [libraryItems, setLibraryItems] = useState([]);
	const { playTrack } = usePlayer();

	useEffect(() => {
		// Simulate loading data
		const timer = setTimeout(() => {
			setLibraryItems(mockLibraryItems);
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	const filteredItems = libraryItems
		.filter((item) => {
			if (filterBy === 'all') return true;
			return item.type === filterBy.slice(0, -1); // Remove 's' from plural
		})
		.filter(
			(item) =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.creator.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.sort((a, b) => {
			switch (sortBy) {
				case 'alphabetical':
					return a.name.localeCompare(b.name);
				case 'creator':
					return a.creator.localeCompare(b.creator);
				case 'recent':
				default:
					return new Date(b.lastPlayed) - new Date(a.lastPlayed);
			}
		});

	const filters = [
		{ id: 'all', label: 'All' },
		{ id: 'playlists', label: 'Playlists' },
		{ id: 'artists', label: 'Artists' },
		{ id: 'albums', label: 'Albums' },
	];

	const sortOptions = [
		{ id: 'recent', label: 'Recently Played', icon: <Clock className="h-4 w-4 mr-2" /> },
		{ id: 'alphabetical', label: 'Alphabetical', icon: <Sparkles className="h-4 w-4 mr-2" /> },
		{ id: 'creator', label: 'Creator', icon: <Music className="h-4 w-4 mr-2" /> },
	];

	return (
		<div className="space-y-8 px-4 pb-24">
			{/* Decorative elements */}
			<div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-primary/5 to-background pointer-events-none -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_40%)]"></div>
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(120,0,255,0.1),transparent_40%)]"></div>
			</div>

			{/* Header */}
			<div className="flex items-center justify-between pt-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-bold text-foreground tracking-tight">Your Library</h1>
					<p className="text-muted-foreground">
						{libraryItems.length} {libraryItems.length === 1 ? 'item' : 'items'} in your collection
					</p>
				</div>
				<Button className="bg-primary hover:bg-primary/90 text-primary-foreground space-x-2 rounded-full shadow-sm shadow-primary/20">
					<Plus className="h-4 w-4" />
					<span className="hidden md:inline">Create Playlist</span>
				</Button>
			</div>

			{/* Controls */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
				{/* Search */}
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search in Your Library"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10 bg-secondary/50 border-secondary/50 backdrop-blur-sm focus-visible:ring-primary/50"
					/>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{/* Filters */}
					<Tabs value={filterBy} onValueChange={setFilterBy} className="w-auto">
						<TabsList className="bg-secondary/50 backdrop-blur-sm border border-secondary/50 p-1">
							{filters.map((filter) => (
								<TabsTrigger
									key={filter.id}
									value={filter.id}
									className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
								>
									{filter.label}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>

					{/* Sort */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="flex items-center space-x-1 bg-secondary/50 border-secondary/50 backdrop-blur-sm"
							>
								<span>Sort</span>
								<span className="hidden md:inline-block">
									: {sortOptions.find((o) => o.id === sortBy)?.label}
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56">
							{sortOptions.map((option) => (
								<DropdownMenuItem
									key={option.id}
									onClick={() => setSortBy(option.id)}
									className={cn(
										'flex items-center cursor-pointer',
										sortBy === option.id && 'bg-accent'
									)}
								>
									{option.icon}
									{option.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* View Mode */}
					<div className="flex space-x-1 bg-secondary/50 backdrop-blur-sm rounded-lg p-1 border border-secondary/50">
						<Button
							variant={viewMode === 'grid' ? 'default' : 'ghost'}
							size="icon"
							onClick={() => setViewMode('grid')}
							className="h-8 w-8 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							<LayoutGrid className="h-4 w-4" />
						</Button>
						<Button
							variant={viewMode === 'list' ? 'default' : 'ghost'}
							size="icon"
							onClick={() => setViewMode('list')}
							className="h-8 w-8 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
						>
							<List className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			{/* Library Items */}
			{viewMode === 'grid' ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
					{filteredItems.map((item, index) => (
						<LibraryCard key={index} item={item} />
					))}
				</div>
			) : (
				<div className="space-y-2">
					{filteredItems.map((item, index) => (
						<LibraryListItem key={index} item={item} />
					))}
				</div>
			)}

			{/* Empty State */}
			{filteredItems.length === 0 && (
				<div className="text-center py-16 rounded-xl bg-secondary/10 backdrop-blur-sm border border-secondary/20">
					<div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
						<LibraryIcon className="h-10 w-10 text-primary/60" />
					</div>
					<h3 className="text-2xl font-semibold text-foreground mb-3">
						{searchQuery ? 'No results found' : 'Your library is empty'}
					</h3>
					<p className="text-muted-foreground max-w-md mx-auto mb-6">
						{searchQuery
							? `We couldn't find anything matching "${searchQuery}". Try searching for something else`
							: 'Start building your collection by creating playlists and saving your favorite music'}
					</p>
					{!searchQuery && (
						<Button className="bg-primary hover:bg-primary/90 text-primary-foreground space-x-2 shadow-sm shadow-primary/20">
							<Plus className="h-4 w-4" />
							<span>Create Playlist</span>
						</Button>
					)}
				</div>
			)}
		</div>
	);
};

// Library Card Component for Grid View
const LibraryCard = ({ item }) => {
	const getItemLink = () => {
		switch (item.type) {
			case 'playlist':
				return `/playlist/${item.id}`;
			case 'album':
				return `/album/${item.id}`;
			case 'artist':
				return `/artist/${item.id}`;
			default:
				return '#';
		}
	};

	return (
		<Link to={getItemLink()}>
			<Card
				className="overflow-hidden border-none hover:border hover:border-primary/20 transition-all duration-300 group cursor-pointer h-full"
			>
				<CardContent className="p-0 relative">
					{/* Artwork with overlay */}
					<div className="relative w-full aspect-square overflow-hidden rounded-xl">
						{item.image ? (
							<img
								src={item.image}
								alt={item.name}
								className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
							/>
						) : (
							<div
								className={`h-full w-full bg-gradient-to-br ${
									item.gradient || 'from-primary to-secondary'
								} flex items-center justify-center`}
							>
								<Music className="h-8 w-8 text-primary-foreground/70" />
							</div>
						)}

						{/* Play button overlay */}
						<div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
							<Button
								variant="default"
								size="icon"
								className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
							>
								<Play className="h-4 w-4 ml-0.5" />
							</Button>
						</div>

						{/* Gradient overlay at bottom for text readability */}
						<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
					</div>

					{/* Track info positioned at bottom of card */}
					<div className="absolute bottom-0 left-0 right-0 p-2">
						<MarqueeText className="font-medium text-white drop-shadow-md text-sm">
							{item.name}
						</MarqueeText>
						<div className="flex items-center">
							<span className="text-xs text-white/80 drop-shadow-md capitalize">
								{item.type} • {item.tracks} tracks
							</span>
						</div>
					</div>

					{/* Subtle hover glow effect */}
					<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-primary/30 rounded-xl" />
				</CardContent>
			</Card>
		</Link>
	);
};

// Library List Item Component for List View
const LibraryListItem = ({ item }) => {
	const getItemLink = () => {
		switch (item.type) {
			case 'playlist':
				return `/playlist/${item.id}`;
			case 'album':
				return `/album/${item.id}`;
			case 'artist':
				return `/artist/${item.id}`;
			default:
				return '#';
		}
	};

	return (
		<Link to={getItemLink()}>
			<Card className="group transition-all hover:bg-accent/40 duration-200 overflow-hidden bg-secondary/10 backdrop-blur-sm border-none hover:border hover:border-accent/30">
				<CardContent className="flex items-center space-x-4 p-3">
					<div className="relative h-14 w-14 flex-shrink-0">
						{item.image ? (
							<img
								src={item.image}
								alt={item.name}
								className={cn(
									'h-full w-full object-cover',
									item.type === 'artist' ? 'rounded-full' : 'rounded-md'
								)}
							/>
						) : (
							<div
								className={`h-full w-full rounded-md bg-gradient-to-br ${
									item.gradient || 'from-primary to-secondary'
								} flex items-center justify-center`}
							>
								<Music className="h-6 w-6 text-primary-foreground/70" />
							</div>
						)}
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-medium text-foreground truncate">{item.name}</h3>
						<div className="flex items-center space-x-1">
							<Badge
								variant="outline"
								className="text-xs capitalize px-2 py-0 bg-primary/10 text-primary/70 border-primary/20"
							>
								{item.type}
							</Badge>
							<span className="text-sm text-muted-foreground truncate">
								• {item.creator}
							</span>
						</div>
					</div>
					<div className="text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-full">
						{new Date(item.lastPlayed).toLocaleDateString(undefined, {
							month: 'short',
							day: 'numeric',
						})}
					</div>
				</CardContent>
			</Card>
		</Link>
	);
};

// Import missing Play component
const Play = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<polygon points="5 3 19 12 5 21 5 3"></polygon>
	</svg>
);

export default Library;
