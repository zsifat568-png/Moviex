import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue, 
  remove, 
  update,
  push,
  child
} from 'firebase/database';
import { MovieItem, UserMovieRequest } from '../types';

// Firebase configuration provided by the user
export const firebaseConfig = {
  apiKey: "AIzaSyABIa-FyaAftiTRnQMUyD8e0fdEQ_YonDs",
  authDomain: "moviex-2bd01.firebaseapp.com",
  databaseURL: "https://moviex-2bd01-default-rtdb.firebaseio.com",
  projectId: "moviex-2bd01",
  storageBucket: "moviex-2bd01.firebasestorage.app",
  messagingSenderId: "181563390433",
  appId: "1:181563390433:web:107c2de225f3c32494faa0",
  measurementId: "G-02JJPN1P09"
};

// Initialize Firebase App safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);

/**
 * Real-time listener for all movies in Firebase
 */
export function subscribeToFirebaseMovies(onData: (movies: MovieItem[]) => void) {
  const moviesRef = ref(db, 'movies');
  const unsubscribe = onValue(moviesRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const movieList: MovieItem[] = [];
      if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item && item.id) {
            movieList.push(item);
          }
        });
      }
      // Sort newest first by default or id
      onData(movieList.reverse());
    } else {
      onData([]);
    }
  }, (error) => {
    console.warn('Firebase Realtime Database Movies read warning:', error);
  });

  return unsubscribe;
}

/**
 * Save or update a single movie in Firebase
 */
export async function saveMovieToFirebase(movie: MovieItem): Promise<boolean> {
  try {
    const movieRef = ref(db, `movies/${movie.id}`);
    await set(movieRef, movie);
    return true;
  } catch (error) {
    console.error('Error saving movie to Firebase:', error);
    return false;
  }
}

/**
 * Delete a movie from Firebase
 */
export async function deleteMovieFromFirebase(movieId: string): Promise<boolean> {
  try {
    const movieRef = ref(db, `movies/${movieId}`);
    await remove(movieRef);
    return true;
  } catch (error) {
    console.error('Error deleting movie from Firebase:', error);
    return false;
  }
}

/**
 * Sync entire movie array to Firebase
 */
export async function syncAllMoviesToFirebase(movies: MovieItem[]): Promise<boolean> {
  try {
    const updates: Record<string, MovieItem> = {};
    movies.forEach(m => {
      updates[`movies/${m.id}`] = m;
    });
    await update(ref(db), updates);
    return true;
  } catch (error) {
    console.error('Error syncing all movies to Firebase:', error);
    return false;
  }
}

/**
 * Toggle or update movie likes in Firebase
 */
export async function updateMovieLikesInFirebase(movieId: string, likesCount: number, targetLikes: { current: number; target: number }) {
  try {
    const movieRef = ref(db, `movies/${movieId}`);
    await update(movieRef, {
      likesCount,
      targetLikes
    });
  } catch (err) {
    console.warn('Could not update likes in Firebase:', err);
  }
}

/**
 * Add comment to a movie in Firebase
 */
export async function addCommentToFirebase(movieId: string, comments: any[], commentsCount: number) {
  try {
    const movieRef = ref(db, `movies/${movieId}`);
    await update(movieRef, {
      comments,
      commentsCount
    });
  } catch (err) {
    console.warn('Could not add comment in Firebase:', err);
  }
}

/**
 * Real-time listener for Movie Requests
 */
export function subscribeToFirebaseRequests(onData: (requests: UserMovieRequest[]) => void) {
  const requestsRef = ref(db, 'movie_requests');
  const unsubscribe = onValue(requestsRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const reqList: UserMovieRequest[] = [];
      if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item && item.id) {
            reqList.push(item);
          }
        });
      }
      onData(reqList.reverse());
    } else {
      onData([]);
    }
  }, (err) => {
    console.warn('Firebase requests read warning:', err);
  });

  return unsubscribe;
}

/**
 * Submit user movie request to Firebase
 */
export async function saveMovieRequestToFirebase(request: UserMovieRequest): Promise<boolean> {
  try {
    const reqRef = ref(db, `movie_requests/${request.id}`);
    await set(reqRef, request);
    return true;
  } catch (error) {
    console.error('Error saving request to Firebase:', error);
    return false;
  }
}

/**
 * Delete a movie request from Firebase
 */
export async function deleteMovieRequestFromFirebase(requestId: string): Promise<boolean> {
  try {
    const reqRef = ref(db, `movie_requests/${requestId}`);
    await remove(reqRef);
    return true;
  } catch (error) {
    console.error('Error deleting request from Firebase:', error);
    return false;
  }
}

/**
 * Support & Help Messages
 */
export async function saveSupportMessageToFirebase(text: string, userName?: string): Promise<boolean> {
  try {
    const msgId = `msg-${Date.now()}`;
    const msgRef = ref(db, `support_messages/${msgId}`);
    await set(msgRef, {
      id: msgId,
      text,
      sender: userName || 'Anonymous Visitor',
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleString()
    });
    return true;
  } catch (err) {
    console.warn('Error sending support message to Firebase:', err);
    return false;
  }
}

/**
 * App Settings (Hero Carousel, Trending Hero Carousel, Pinned Movies, Custom Categories)
 */
export function subscribeToFirebaseAppSettings(onData: (settings: {
  heroIds?: string[];
  trendingHeroIds?: string[];
  pinnedMovieIds?: string[];
  categories?: { id: string; label: string; icon?: string }[];
}) => void) {
  const settingsRef = ref(db, 'app_settings');
  const unsubscribe = onValue(settingsRef, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.val());
    }
  }, (err) => {
    console.warn('Firebase settings read warning:', err);
  });

  return unsubscribe;
}

export async function saveFirebaseAppSettings(settings: {
  heroIds?: string[];
  trendingHeroIds?: string[];
  pinnedMovieIds?: string[];
  categories?: { id: string; label: string; icon?: string }[];
}) {
  try {
    const settingsRef = ref(db, 'app_settings');
    await update(settingsRef, settings);
  } catch (err) {
    console.warn('Error saving app settings to Firebase:', err);
  }
}
