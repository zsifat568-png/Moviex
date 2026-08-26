// TMDB API Service
// API Key provided by user: 739d9fdd6b14360060fc9317889f87f8
import { MovieActor, UpcomingMovie } from '../types';

export const TMDB_API_KEY = '739d9fdd6b14360060fc9317889f87f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_W780 = 'https://image.tmdb.org/t/p/w780';
const IMAGE_BASE_W185 = 'https://image.tmdb.org/t/p/w185';
const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';

export interface TMDBMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  original_language?: string;
}

export interface TMDBMovieDetails extends TMDBMovieResult {
  runtime?: number;
  genres?: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: {
    results: { key: string; name: string; site: string; type: string }[];
  };
  images?: {
    backdrops?: { file_path: string; aspect_ratio: number }[];
    posters?: { file_path: string; aspect_ratio: number }[];
  };
}

export interface AutoFetchedMovieData {
  tmdbId: number;
  titleBn: string;
  titleEn: string;
  posterUrl: string;
  backdropUrl: string;
  additionalPosters?: string[];
  category: 'bengali' | 'natok' | 'bollywood' | 'hollywood' | 'south' | 'anime';
  genres: string[];
  releaseYear: number;
  releaseDate: string;
  duration: string;
  rating: number;
  synopsisBn: string;
  cast: string[];
  actors: MovieActor[];
  director: string;
  isNew: boolean;
  trailerKey?: string;
}

// Map TMDB genre IDs or names & language to app categories
export function mapTMDBToCategory(
  originalLanguage?: string,
  genres?: { id: number; name: string }[] | string[]
): 'bengali' | 'natok' | 'bollywood' | 'hollywood' | 'south' | 'anime' {
  const lang = (originalLanguage || '').toLowerCase();
  const genreNames = Array.isArray(genres) 
    ? genres.map(g => (typeof g === 'string' ? g : g.name).toLowerCase())
    : [];

  if (lang === 'bn') return 'bengali';
  if (lang === 'ja' || genreNames.includes('animation') || genreNames.includes('anime')) return 'anime';
  if (lang === 'hi') return 'bollywood';
  if (['te', 'ta', 'ml', 'kn'].includes(lang)) return 'south';
  if (lang === 'en') return 'hollywood';

  return 'hollywood';
}

// Search movies by title on TMDB
export async function searchTMDBMovies(query: string): Promise<TMDBMovieResult[]> {
  if (!query.trim()) return [];
  try {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      query.trim()
    )}&include_adult=false&language=en-US&page=1`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('TMDB Search Error:', error);
    return [];
  }
}

// Get full movie details by TMDB ID with images and credits
export async function getTMDBMovieDetails(id: number): Promise<TMDBMovieDetails | null> {
  try {
    const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,images&language=en-US`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('TMDB Details Error:', error);
    return null;
  }
}

// In-memory cache to avoid redundant network hits
const movieCastCache = new Map<string, { actors: MovieActor[]; director?: string; duration?: string; rating?: number; synopsis?: string; posterUrl?: string; backdropUrl?: string; additionalPosters?: string[]; trailerKey?: string }>();

// Helper to generate a clean avatar fallback
export const getActorAvatarFallback = (name: string): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=f43f5e&size=180&bold=true&font-size=0.42`;
};

// Dynamically fetch cast, actor photos, additional posters and details for ANY movie title or TMDB ID
export async function fetchCastAndDetailsForMovie(
  title: string,
  tmdbId?: number
): Promise<{ actors: MovieActor[]; director?: string; duration?: string; rating?: number; synopsis?: string; posterUrl?: string; backdropUrl?: string; additionalPosters?: string[]; trailerKey?: string } | null> {
  const cacheKey = tmdbId ? `id-${tmdbId}` : `title-${title.toLowerCase().trim()}`;
  if (movieCastCache.has(cacheKey)) {
    return movieCastCache.get(cacheKey)!;
  }

  try {
    let details: TMDBMovieDetails | null = null;
    if (tmdbId) {
      details = await getTMDBMovieDetails(tmdbId);
    }

    if (!details && title) {
      // Clean title for search (e.g. remove Bengali subtitle or season info for searching)
      const cleanSearch = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
      const results = await searchTMDBMovies(cleanSearch || title);
      if (results && results.length > 0) {
        details = await getTMDBMovieDetails(results[0].id);
      }
    }

    if (!details) return null;

    const actors: MovieActor[] = (details.credits?.cast || []).slice(0, 14).map(c => ({
      id: c.id,
      name: c.name,
      character: c.character || 'Actor',
      profileUrl: c.profile_path ? `${IMAGE_BASE_W185}${c.profile_path}` : getActorAvatarFallback(c.name)
    }));

    const directorObj = (details.credits?.crew || []).find(c => c.job === 'Director');
    const directorName = directorObj ? directorObj.name : undefined;

    const runtimeMins = details.runtime;
    let durationStr: string | undefined = undefined;
    if (runtimeMins) {
      const hours = Math.floor(runtimeMins / 60);
      const mins = runtimeMins % 60;
      durationStr = hours > 0 ? `${hours} Hours ${mins} Mins` : `${mins} Mins`;
    }

    const tmdbPoster = details.poster_path ? `${IMAGE_BASE_W780}${details.poster_path}` : undefined;
    const tmdbBackdrop = details.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${details.backdrop_path}` : undefined;

    // Extract YouTube trailer key
    const trailer = details.videos?.results?.find((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || details.videos?.results?.[0];
    const trailerKey = trailer?.key;

    // Extract additional backdrops & posters from TMDB images
    const extraPosters: string[] = [];
    if (tmdbBackdrop) extraPosters.push(tmdbBackdrop);
    if (tmdbPoster) extraPosters.push(tmdbPoster);
    if (details.images?.backdrops && details.images.backdrops.length > 0) {
      details.images.backdrops.slice(0, 6).forEach((b: any) => {
        if (b.file_path) {
          const url = `${IMAGE_BASE_ORIGINAL}${b.file_path}`;
          if (!extraPosters.includes(url)) extraPosters.push(url);
        }
      });
    }
    if (details.images?.posters && details.images.posters.length > 0) {
      details.images.posters.slice(0, 4).forEach((p: any) => {
        if (p.file_path) {
          const url = `${IMAGE_BASE_W780}${p.file_path}`;
          if (!extraPosters.includes(url)) extraPosters.push(url);
        }
      });
    }

    const payload = {
      actors,
      director: directorName,
      duration: durationStr,
      rating: details.vote_average ? Number(details.vote_average.toFixed(1)) : undefined,
      synopsis: details.overview || undefined,
      posterUrl: tmdbPoster,
      backdropUrl: tmdbBackdrop,
      additionalPosters: extraPosters.length > 0 ? extraPosters : undefined,
      trailerKey
    };

    movieCastCache.set(cacheKey, payload);
    return payload;
  } catch (err) {
    console.error('Failed to fetch cast for movie:', title, err);
    return null;
  }
}

// Auto-resolve a movie by title using TMDB API
export async function autoFetchMovieByTitle(
  title: string,
  userCustomPoster?: string,
  userCustomCategory?: 'bengali' | 'natok' | 'bollywood' | 'hollywood' | 'south' | 'anime'
): Promise<AutoFetchedMovieData | null> {
  const results = await searchTMDBMovies(title);
  if (!results || results.length === 0) return null;

  const topMatch = results[0];
  const details = await getTMDBMovieDetails(topMatch.id);
  if (!details) return null;

  // Format runtime
  const runtimeMins = details.runtime || 120;
  const hours = Math.floor(runtimeMins / 60);
  const mins = runtimeMins % 60;
  const durationStr = hours > 0 ? `${hours} Hours ${mins} Mins` : `${mins} Mins`;

  // Extract actors with profile image URLs
  const actors: MovieActor[] = (details.credits?.cast || []).slice(0, 12).map(c => ({
    id: c.id,
    name: c.name,
    character: c.character || 'Actor',
    profileUrl: c.profile_path ? `${IMAGE_BASE_W185}${c.profile_path}` : getActorAvatarFallback(c.name)
  }));

  const topCast = (details.credits?.cast || []).slice(0, 5).map(c => c.name);
  const directorObj = (details.credits?.crew || []).find(c => c.job === 'Director');
  const directorName = directorObj ? directorObj.name : 'Director Selection';

  // Extract release year
  const releaseYear = details.release_date ? parseInt(details.release_date.split('-')[0], 10) : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const isNew = releaseYear >= currentYear;

  // Rating formatted to 1 decimal
  const rating = Number((details.vote_average || 8.0).toFixed(1));

  // Poster & Backdrop from TMDB or Admin custom
  const tmdbPoster = details.poster_path ? `${IMAGE_BASE_W780}${details.poster_path}` : '';
  const tmdbBackdrop = details.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${details.backdrop_path}` : (tmdbPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80');

  // Extra posters
  const extraPosters: string[] = [];
  if (details.images?.backdrops && details.images.backdrops.length > 0) {
    details.images.backdrops.slice(0, 5).forEach((b: any) => {
      if (b.file_path) extraPosters.push(`${IMAGE_BASE_ORIGINAL}${b.file_path}`);
    });
  }
  if (details.images?.posters && details.images.posters.length > 0) {
    details.images.posters.slice(0, 2).forEach((p: any) => {
      if (p.file_path) extraPosters.push(`${IMAGE_BASE_W780}${p.file_path}`);
    });
  }

  // User override check for poster and category
  const finalPoster = userCustomPoster && userCustomPoster.trim() ? userCustomPoster.trim() : (tmdbPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80');
  const finalBackdrop = tmdbBackdrop || finalPoster;

  const detectedCategory = mapTMDBToCategory(details.original_language, details.genres);
  const finalCategory = userCustomCategory || detectedCategory;

  const genreList = (details.genres || []).map(g => g.name);
  if (genreList.length === 0) genreList.push('Action', 'Drama');

  // Find trailer if available
  const trailer = (details.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube') || (details.videos?.results || [])[0];

  return {
    tmdbId: details.id,
    titleBn: details.title,
    titleEn: details.original_title || details.title,
    posterUrl: finalPoster,
    backdropUrl: finalBackdrop,
    additionalPosters: extraPosters.length > 0 ? extraPosters : undefined,
    category: finalCategory,
    genres: genreList,
    releaseYear: releaseYear || 2026,
    releaseDate: details.release_date || '2026',
    duration: durationStr,
    rating: rating || 8.2,
    synopsisBn: details.overview || `Watch ${details.title} in Full HD print on Moviex.`,
    cast: topCast.length > 0 ? topCast : ['Lead Star', 'Featured Cast'],
    actors: actors.length > 0 ? actors : [],
    director: directorName,
    isNew,
    trailerKey: trailer ? trailer.key : undefined
  };
}

// Fetch upcoming movies from TMDB API across ALL categories (STRICTLY UNRELEASED ONLY)
export async function fetchTMDBUpcomingMovies(): Promise<UpcomingMovie[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayTimestamp = new Date(today).getTime();

    // Query 1: General Global / Hollywood Upcoming (strictly >= today)
    const urlHollywood = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`;

    // Query 2: Bollywood Upcoming (Hindi, strictly >= today)
    const urlBollywood = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`;

    // Query 3: South Indian Upcoming (Telugu, Tamil, Malayalam, Kannada, strictly >= today)
    const urlSouth = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=te|ta|ml|kn&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`;

    // Query 4: Anime / Japan Upcoming (strictly >= today)
    const urlAnime = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ja&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`;

    // Query 5: Bengali Upcoming (strictly >= today)
    const urlBengali = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=bn&primary_release_date.gte=${today}&sort_by=popularity.desc&page=1`;

    const [resH, resB, resS, resA, resBn] = await Promise.allSettled([
      fetch(urlHollywood).then(r => r.json()),
      fetch(urlBollywood).then(r => r.json()),
      fetch(urlSouth).then(r => r.json()),
      fetch(urlAnime).then(r => r.json()),
      fetch(urlBengali).then(r => r.json())
    ]);

    const resultsList: UpcomingMovie[] = [];
    const seenIds = new Set<number>();

    const processItems = (data: any, forcedCountry?: string) => {
      if (data && Array.isArray(data.results)) {
        for (const m of data.results) {
          if (!m.id || seenIds.has(m.id)) continue;
          
          // Strict check: Movie MUST have a release date and it MUST be in the future
          if (!m.release_date) continue;
          const movieReleaseTime = new Date(m.release_date).getTime();
          if (isNaN(movieReleaseTime) || movieReleaseTime <= todayTimestamp) {
            continue; // Skip already released movies completely
          }

          seenIds.add(m.id);
          
          const lang = (m.original_language || '').toLowerCase();
          let country = forcedCountry || 'Hollywood';
          if (!forcedCountry) {
            if (lang === 'hi') country = 'Bollywood';
            else if (lang === 'bn') country = 'Dhallywood';
            else if (lang === 'ja') country = 'Japanese';
            else if (['te', 'ta', 'ml', 'kn'].includes(lang)) country = 'South';
            else country = 'Hollywood';
          }

          resultsList.push({
            id: `tmdb-up-${m.id}`,
            tmdbId: m.id,
            title: m.title || m.original_title,
            titleBn: m.title,
            poster: m.poster_path ? `${IMAGE_BASE_W780}${m.poster_path}` : (m.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${m.backdrop_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'),
            backdrop: m.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${m.backdrop_path}` : undefined,
            country,
            language: lang.toUpperCase(),
            releaseDate: m.release_date,
            rating: Number((m.vote_average || 8.0).toFixed(1)),
            isReleased: false,
            genres: ['Featured', country],
            overview: m.overview || 'Upcoming cinema premiere.'
          });
        }
      }
    };

    if (resH.status === 'fulfilled') processItems(resH.value, 'Hollywood');
    if (resB.status === 'fulfilled') processItems(resB.value, 'Bollywood');
    if (resS.status === 'fulfilled') processItems(resS.value, 'South');
    if (resA.status === 'fulfilled') processItems(resA.value, 'Japanese');
    if (resBn.status === 'fulfilled') processItems(resBn.value, 'Dhallywood');

    return resultsList;
  } catch (error) {
    console.error('Fetch TMDB Upcoming Error:', error);
    return [];
  }
}

// Fetch dynamic curated blockbusters directly from TMDB API for the Home feed across all categories
export async function fetchTMDBHomeMovies(): Promise<AutoFetchedMovieData[]> {
  try {
    const [resH, resB, resS, resA, resTrending, resBn] = await Promise.allSettled([
      fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=en&sort_by=popularity.desc&vote_count.gte=500&page=1`).then(r => r.json()),
      fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&vote_count.gte=50&page=1`).then(r => r.json()),
      fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=te|ta|ml|kn&sort_by=popularity.desc&vote_count.gte=30&page=1`).then(r => r.json()),
      fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=ja&with_genres=16&sort_by=popularity.desc&vote_count.gte=50&page=1`).then(r => r.json()),
      fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=1`).then(r => r.json()),
      fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=bn&sort_by=popularity.desc&page=1`).then(r => r.json())
    ]);

    const collected: any[] = [];
    const seenIds = new Set<number>();

    const addList = (data: any, forcedCategory?: 'bengali' | 'natok' | 'bollywood' | 'hollywood' | 'south' | 'anime', limit = 3) => {
      if (data && Array.isArray(data.results)) {
        let added = 0;
        for (const m of data.results) {
          if (!m.id || seenIds.has(m.id) || !m.poster_path) continue;
          seenIds.add(m.id);
          collected.push({ movie: m, forcedCategory });
          added++;
          if (added >= limit) break;
        }
      }
    };

    if (resTrending.status === 'fulfilled') addList(resTrending.value, undefined, 2);
    if (resBn.status === 'fulfilled') addList(resBn.value, 'bengali', 3);
    if (resH.status === 'fulfilled') addList(resH.value, 'hollywood', 3);
    if (resB.status === 'fulfilled') addList(resB.value, 'bollywood', 3);
    if (resS.status === 'fulfilled') addList(resS.value, 'south', 3);
    if (resA.status === 'fulfilled') addList(resA.value, 'anime', 3);

    // Fetch details for each collected movie from TMDB
    const results = await Promise.allSettled(
      collected.map(async item => {
        const m = item.movie;
        const details = await getTMDBMovieDetails(m.id);
        if (!details) return null;

        const runtimeMins = details.runtime || 120;
        const hours = Math.floor(runtimeMins / 60);
        const mins = runtimeMins % 60;
        const durationStr = hours > 0 ? `${hours} Hours ${mins} Mins` : `${mins} Mins`;

        const actors: MovieActor[] = (details.credits?.cast || []).slice(0, 10).map(c => ({
          id: c.id,
          name: c.name,
          character: c.character || 'Actor',
          profileUrl: c.profile_path ? `${IMAGE_BASE_W185}${c.profile_path}` : getActorAvatarFallback(c.name)
        }));

        const topCast = (details.credits?.cast || []).slice(0, 5).map(c => c.name);
        const directorObj = (details.credits?.crew || []).find(c => c.job === 'Director');
        const directorName = directorObj ? directorObj.name : 'Director';

        const releaseYear = details.release_date ? parseInt(details.release_date.split('-')[0], 10) : new Date().getFullYear();
        const currentYear = new Date().getFullYear();
        const isNew = releaseYear >= currentYear;

        const rating = Number((details.vote_average || 8.0).toFixed(1));
        const tmdbPoster = details.poster_path ? `${IMAGE_BASE_W780}${details.poster_path}` : '';
        const tmdbBackdrop = details.backdrop_path ? `${IMAGE_BASE_ORIGINAL}${details.backdrop_path}` : (tmdbPoster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80');

        // Extra posters from TMDB images
        const extraPosters: string[] = [];
        if (details.images?.backdrops && details.images.backdrops.length > 0) {
          details.images.backdrops.slice(0, 4).forEach((b: any) => {
            if (b.file_path) extraPosters.push(`${IMAGE_BASE_ORIGINAL}${b.file_path}`);
          });
        }
        if (details.images?.posters && details.images.posters.length > 0) {
          details.images.posters.slice(0, 2).forEach((p: any) => {
            if (p.file_path) extraPosters.push(`${IMAGE_BASE_W780}${p.file_path}`);
          });
        }

        const detectedCategory = mapTMDBToCategory(details.original_language, details.genres);
        const finalCategory = item.forcedCategory || detectedCategory;

        const genreList = (details.genres || []).map(g => g.name);
        if (genreList.length === 0) genreList.push('Cinema', 'Featured');

        return {
          tmdbId: details.id,
          titleBn: details.title,
          titleEn: details.original_title || details.title,
          posterUrl: tmdbPoster,
          backdropUrl: tmdbBackdrop,
          additionalPosters: extraPosters.length > 0 ? extraPosters : undefined,
          category: finalCategory,
          genres: genreList,
          releaseYear: releaseYear || 2024,
          releaseDate: details.release_date || '2024',
          duration: durationStr,
          rating: rating || 8.2,
          synopsisBn: details.overview || `Watch ${details.title} in Full HD print on Moviex.`,
          cast: topCast.length > 0 ? topCast : ['Lead Star', 'Featured Cast'],
          actors: actors.length > 0 ? actors : [],
          director: directorName,
          isNew,
          trailerKey: undefined
        } as AutoFetchedMovieData;
      })
    );

    const validMovies: AutoFetchedMovieData[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value && r.value.posterUrl) {
        validMovies.push(r.value);
      }
    }

    return validMovies;
  } catch (error) {
    console.error('Fetch TMDB Home Movies Error:', error);
    return [];
  }
}

