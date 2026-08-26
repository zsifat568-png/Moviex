import { MovieItem, UpcomingMovie } from '../types';

export const INITIAL_MOVIES: MovieItem[] = [];

// STRICTLY UNRELEASED UPCOMING MOVIES ONLY
export const UPCOMING_MOVIES: UpcomingMovie[] = [
  {
    id: 'up-h1',
    tmdbId: 83533,
    title: 'Avatar: Fire and Ash (Avatar 3)',
    titleBn: 'অ্যাভাটার: ফায়ার অ্যান্ড অ্যাশ',
    releaseDate: '19 Dec 2026',
    poster: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    country: 'Hollywood',
    language: 'English',
    rating: 9.4,
    isReleased: false,
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    expectedDateFormatted: '19 December 2026',
    overview: 'The Na’vi confront the violent Ash People clan in the volcanic regions of Pandora.'
  },
  {
    id: 'up-b1',
    tmdbId: 1084199,
    title: 'War 2 (Hrithik vs Jr NTR)',
    titleBn: 'ওয়ার ২ (হৃত্বিক রোশন vs জুনিয়র এনটিআর)',
    releaseDate: '14 Aug 2026',
    poster: 'https://image.tmdb.org/t/p/w780/jFt1g94B0RWH2g7tq5Z0p3q8s5w.jpg',
    country: 'Bollywood',
    language: 'Hindi',
    rating: 8.9,
    isReleased: false,
    genres: ['Action', 'Thriller', 'Spy Universe'],
    expectedDateFormatted: '14 August 2026',
    overview: 'Major Kabir Dhaliwal faces an uncompromising new adversary in the high-stakes Spy Universe.'
  },
  {
    id: 'up-s1',
    tmdbId: 1184918,
    title: 'Kantara: A Legend Chapter 1',
    titleBn: 'কান্তারা: চ্যাপ্টার ১',
    releaseDate: '02 Oct 2026',
    poster: 'https://image.tmdb.org/t/p/w780/b0t1aA6i1b9K3x6Y4w9e2b1o4q1.jpg',
    country: 'South',
    language: 'Kannada / Telugu / Tamil / Hindi',
    rating: 9.2,
    isReleased: false,
    genres: ['Mythology', 'Action', 'Drama'],
    expectedDateFormatted: '02 October 2026',
    overview: 'The prequel exploring the ancient coastal folklore and divine origins of Panjurli Daiva.'
  },
  {
    id: 'up-d1',
    title: 'Toofan 2 (তুফান ২ - শাকিব খান)',
    titleBn: 'তুফান ২ (শাকিব খান)',
    releaseDate: '2026 Eid Premiere',
    poster: 'https://image.tmdb.org/t/p/w780/q66RkUjNqR5pE8F2rO5qF3c1r0h.jpg',
    country: 'Dhallywood',
    language: 'Bengali',
    rating: 9.3,
    isReleased: false,
    genres: ['Action', 'Crime', 'Thriller'],
    expectedDateFormatted: 'Eid 2026',
    overview: 'রায়হান রাফী ও শাকিব খানের মেগা ব্লকবাস্টার তুফানের দ্বিতীয় চ্যাপ্টার।'
  },
  {
    id: 'up-a1',
    tmdbId: 1104844,
    title: 'Demon Slayer: Infinity Castle Arc (Movie 1)',
    titleBn: 'ডিমন স্লেয়ার: ইনফিনিটি ক্যাসল',
    releaseDate: '2026 World Premiere',
    poster: 'https://image.tmdb.org/t/p/w780/h8Rb9gBr48ODIwYUtZ05aqvgUr0.jpg',
    country: 'Japanese',
    language: 'Japanese',
    rating: 9.8,
    isReleased: false,
    genres: ['Anime', 'Action', 'Dark Fantasy'],
    expectedDateFormatted: 'Summer 2026',
    overview: 'The final battle of the Demon Slayer Corps against Muzan Kibutsuji inside Infinity Castle.'
  },
  {
    id: 'up-h2',
    tmdbId: 1034541,
    title: 'Avengers: Secret Wars',
    titleBn: 'অ্যাভেঞ্জার্স: সিক্রেট ওয়ার্স',
    releaseDate: '07 May 2027',
    poster: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    country: 'Hollywood',
    language: 'English',
    rating: 9.5,
    isReleased: false,
    genres: ['Action', 'Sci-Fi', 'Superhero'],
    expectedDateFormatted: '07 May 2027',
    overview: 'The multiverse collapses as heroes from across dimensions battle to save reality.'
  }
];
