// Auto movie poster & metadata resolver helper
// Given a movie title or keyword, returns high quality banner and poster visuals and details

interface AutoMovieMeta {
  posterUrl: string;
  backdropUrl: string;
  category: 'bengali' | 'natok' | 'bollywood' | 'hollywood' | 'south' | 'anime';
  genres: string[];
  year: number;
  duration: string;
  rating: number;
  synopsis: string;
}

const MOVIE_PRESETS: Record<string, AutoMovieMeta> = {
  toofan: {
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    category: 'bengali',
    genres: ['Action', 'Thriller', 'Crime'],
    year: 2024,
    duration: '2 Hours 25 Mins',
    rating: 8.9,
    synopsis: 'A stylish 90s era underworld drama capturing the rise of an unstoppable gangster and his empire.'
  },
  jawan: {
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80',
    category: 'bollywood',
    genres: ['Action', 'Thriller', 'Drama'],
    year: 2023,
    duration: '2 Hours 49 Mins',
    rating: 8.6,
    synopsis: 'A high-octane action thriller outlining the emotional journey of a man set to rectify wrongs in society.'
  },
  avatar: {
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    category: 'hollywood',
    genres: ['Sci-Fi', 'Adventure', 'Fantasy'],
    year: 2025,
    duration: '3 Hours 12 Mins',
    rating: 9.1,
    synopsis: 'Explore the uncharted biomes and underwater wonders of Pandora in this epic visual journey.'
  },
  batman: {
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
    category: 'hollywood',
    genres: ['Action', 'Mystery', 'Crime'],
    year: 2025,
    duration: '2 Hours 55 Mins',
    rating: 8.8,
    synopsis: 'The dark knight navigates Gotham city shadows to uncover deep-seated corruption and perilous plots.'
  },
  anime: {
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    category: 'anime',
    genres: ['Anime', 'Action', 'Supernatural'],
    year: 2026,
    duration: '1 Hour 50 Mins',
    rating: 9.0,
    synopsis: 'Epic sword battles and mythical spirit transformations in an ancient enchanted realm.'
  },
  natok: {
    posterUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    category: 'natok',
    genres: ['Drama', 'Comedy', 'Friendship'],
    year: 2026,
    duration: '45 Mins',
    rating: 9.3,
    synopsis: 'A hilarious and heart-warming story celebrating youth, friendship, and urban life adventures.'
  },
  south: {
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
    category: 'south',
    genres: ['Action', 'Mass Masala', 'Thriller'],
    year: 2025,
    duration: '2 Hours 40 Mins',
    rating: 8.7,
    synopsis: 'Mind-blowing mass action stunts, thunderous background scores, and a righteous hero.'
  }
};

const GENERIC_POSTERS = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=800&q=80'
];

const GENERIC_BACKDROPS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80'
];

export function resolveMovieMetadata(title: string, userPosterUrl?: string, userBackdropUrl?: string) {
  const normalized = title.toLowerCase().trim();
  
  // Check preset keywords
  for (const [key, preset] of Object.entries(MOVIE_PRESETS)) {
    if (normalized.includes(key)) {
      return {
        posterUrl: userPosterUrl && userPosterUrl.trim() ? userPosterUrl.trim() : preset.posterUrl,
        backdropUrl: userBackdropUrl && userBackdropUrl.trim() ? userBackdropUrl.trim() : preset.backdropUrl,
        category: preset.category,
        genres: preset.genres,
        releaseYear: preset.year,
        duration: preset.duration,
        rating: preset.rating,
        synopsisBn: preset.synopsis
      };
    }
  }

  // Generate deterministic index based on title hash
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }
  const posIndex = Math.abs(hash) % GENERIC_POSTERS.length;
  const ratingVal = Number((7.8 + ((Math.abs(hash) % 20) / 10)).toFixed(1));

  return {
    posterUrl: userPosterUrl && userPosterUrl.trim() ? userPosterUrl.trim() : GENERIC_POSTERS[posIndex],
    backdropUrl: userBackdropUrl && userBackdropUrl.trim() ? userBackdropUrl.trim() : GENERIC_BACKDROPS[posIndex],
    category: 'bengali' as const,
    genres: ['Action', 'Drama', 'Thriller'],
    releaseYear: 2026,
    duration: '2 Hours 10 Mins',
    rating: Math.min(9.8, ratingVal),
    synopsisBn: `Moviex বিশেষ প্রিমিয়ার: "${title}" মুভির রোমাঞ্চকর ও দৃষ্টিনন্দন গল্প, ডিরেক্ট এইচডি প্রিন্ট ও হাই-স্পিড সার্ভার ডাউনলোড লিংক সহ প্রস্তুত।`
  };
}
