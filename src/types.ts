export interface CommentItem {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  userLiked?: boolean;
}

export interface StreamDownloadLink {
  quality: string; // '480p' | '720p' | '1080p' | '4K' | 'HEVC'
  size: string;
  serverName: string;
  url: string;
  type: 'direct' | 'drive' | 'telegram' | 'stream';
}

export interface MovieActor {
  id?: number;
  name: string;
  character?: string;
  profileUrl?: string; // TMDB profile photo: https://image.tmdb.org/t/p/w185/...
}

export interface MovieItem {
  id: string;
  tmdbId?: number;
  titleBn: string;
  titleEn: string;
  posterUrl: string;
  backdropUrl: string;
  trailerVideoUrl?: string;
  category: 'bengali' | 'natok' | 'bollywood' | 'hollywood' | 'south' | 'anime';
  genres: string[];
  releaseYear: number;
  duration: string;
  sizeMb: string;
  likesCount: number;
  userLiked?: boolean;
  downloadsCount: number;
  commentsCount: number;
  rating: number;
  isNew?: boolean;
  isTrending?: boolean;
  is18Plus?: boolean;
  episodeBadge?: string;
  synopsisBn: string;
  cast: string[];
  actors?: MovieActor[];
  additionalPosters?: string[];
  director: string;
  targetLikes: {
    current: number;
    target: number;
  };
  streamLinks: StreamDownloadLink[];
  comments: CommentItem[];
}

export interface UpcomingMovie {
  id: string;
  tmdbId?: number;
  title: string;
  titleBn?: string;
  releaseDate: string;
  poster: string;
  backdrop?: string;
  country: 'Hollywood' | 'Bollywood' | 'Dhallywood' | 'Japanese' | 'South' | string;
  language: string;
  rating: number;
  isReleased: boolean;
  genres: string[];
  trailerUrl?: string;
  expectedDateFormatted?: string;
  notified?: boolean;
  overview?: string;
}

export interface SmartToolItem {
  id: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  iconName: string;
  category: 'popular' | 'utility' | 'exclusive' | 'fun';
  accentColor: string;
  badge?: string;
}

export interface UserMovieRequest {
  id: string;
  movieName: string;
  year?: string;
  language: string;
  notes?: string;
  submittedAt: string;
  status: 'pending' | 'in_review' | 'added' | 'rejected';
}

import { SupportedLanguage } from './utils/translations';

export interface UserProfile {
  name: string;
  username: string;
  avatarUrl: string;
  memberType: string;
  email: string;
  is18PlusAllowed: boolean;
  notificationsEnabled: boolean;
  savedMovieIds: string[];
  watchHistoryIds: string[];
  themeMode: 'dark-glass' | 'midnight-neon' | 'cyber-amber';
  language: SupportedLanguage;
}
