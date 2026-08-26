import React, { useState, useEffect, useMemo, useRef } from 'react';
import { INITIAL_MOVIES } from './data/moviesData';
import { MovieItem, UserProfile, UserMovieRequest } from './types';
import { 
  subscribeToFirebaseMovies, 
  saveMovieToFirebase, 
  deleteMovieFromFirebase, 
  syncAllMoviesToFirebase,
  updateMovieLikesInFirebase,
  addCommentToFirebase,
  subscribeToFirebaseRequests,
  saveMovieRequestToFirebase,
  deleteMovieRequestFromFirebase,
  subscribeToFirebaseAppSettings,
  saveFirebaseAppSettings
} from './utils/firebase';
import { IntroSplash } from './components/IntroSplash';
import { WelcomeGuideModal } from './components/WelcomeGuideModal';
import { TopHeader } from './components/TopHeader';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoryChips } from './components/CategoryChips';
import { MovieCard } from './components/MovieCard';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { SearchModal } from './components/SearchModal';
import { FavoriteView } from './components/FavoriteView';
import { TopRatedView } from './components/TopRatedView';
import { UpcomingView } from './components/UpcomingView';
import { SettingsProfileView } from './components/SettingsProfileView';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ApplePasscodeModal } from './components/ApplePasscodeModal';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { getTranslation, SupportedLanguage } from './utils/translations';
import { ArrowUp, RotateCw, Sparkles, Pin, Film, UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEYS = {
  MOVIES: 'moviee_link_movies_tmdb_v10_fresh',
  PROFILE: 'moviee_link_profile_v10',
  REQUESTS: 'moviee_link_requests_v10',
  HERO_IDS: 'moviee_link_hero_ids_v10',
  TRENDING_HERO_IDS: 'moviee_link_trending_hero_ids_v10',
  PINNED_IDS: 'moviee_link_pinned_ids_v10',
  CATEGORIES: 'moviee_link_categories_v10',
  HAS_SEEN_WELCOME: 'moviee_link_welcome_seen_v10'
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Dewan Sifat',
  username: '@sifat3742',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  memberType: 'Moviee Link Member',
  email: 'zsifat678@gmail.com',
  is18PlusAllowed: true,
  notificationsEnabled: true,
  savedMovieIds: [],
  watchHistoryIds: [],
  themeMode: 'dark-glass',
  language: 'en'
};

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Persisted state
  const [movies, setMovies] = useState<MovieItem[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.MOVIES);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return INITIAL_MOVIES;
      }
    }
    return INITIAL_MOVIES;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          savedMovieIds: Array.isArray(parsed?.savedMovieIds) ? parsed.savedMovieIds : DEFAULT_PROFILE.savedMovieIds,
          watchHistoryIds: Array.isArray(parsed?.watchHistoryIds) ? parsed.watchHistoryIds : DEFAULT_PROFILE.watchHistoryIds,
        };
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const [movieRequests, setMovieRequests] = useState<UserMovieRequest[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'req-sample-1',
        movieName: 'তুফান ২ (Toofan 2)',
        year: '2026',
        language: 'Bengali',
        notes: 'Full HD প্রিন্ট দরকার',
        submittedAt: '১ দিন আগে',
        status: 'pending'
      }
    ];
  });

  // Admin and customization state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [heroMovieIds, setHeroMovieIds] = useState<string[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.HERO_IDS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [trendingHeroIds, setTrendingHeroIds] = useState<string[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.TRENDING_HERO_IDS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [pinnedMovieIds, setPinnedMovieIds] = useState<string[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.PINNED_IDS);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [customCategories, setCustomCategories] = useState<{ id: string; label: string; icon?: string }[]>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: 'all', label: 'All', icon: '🎬' },
      { id: 'bengali', label: 'Bangla', icon: '🇧🇩' },
      { id: 'bollywood', label: 'Bollywood', icon: '🇮🇳' },
      { id: 'hollywood', label: 'Hollywood', icon: '🇺🇸' },
      { id: 'south', label: 'South Indian', icon: '💥' },
      { id: 'anime', label: 'Anime', icon: '⚡' }
    ];
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
  }, [movies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(movieRequests));
  }, [movieRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HERO_IDS, JSON.stringify(heroMovieIds));
  }, [heroMovieIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRENDING_HERO_IDS, JSON.stringify(trendingHeroIds));
  }, [trendingHeroIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PINNED_IDS, JSON.stringify(pinnedMovieIds));
  }, [pinnedMovieIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(customCategories));
  }, [customCategories]);

  // Real-time synchronization with Firebase Realtime Database
  useEffect(() => {
    const unsubMovies = subscribeToFirebaseMovies((remoteMovies) => {
      if (remoteMovies && remoteMovies.length > 0) {
        setMovies(remoteMovies);
      }
    });

    const unsubRequests = subscribeToFirebaseRequests((remoteReqs) => {
      if (remoteReqs && remoteReqs.length > 0) {
        setMovieRequests(remoteReqs);
      }
    });

    const unsubSettings = subscribeToFirebaseAppSettings((remoteSettings) => {
      if (remoteSettings) {
        if (remoteSettings.heroIds && remoteSettings.heroIds.length > 0) {
          setHeroMovieIds(remoteSettings.heroIds);
        }
        if (remoteSettings.trendingHeroIds && remoteSettings.trendingHeroIds.length > 0) {
          setTrendingHeroIds(remoteSettings.trendingHeroIds);
        }
        if (remoteSettings.pinnedMovieIds && Array.isArray(remoteSettings.pinnedMovieIds)) {
          setPinnedMovieIds(remoteSettings.pinnedMovieIds);
        }
        if (remoteSettings.categories && remoteSettings.categories.length > 0) {
          setCustomCategories(remoteSettings.categories);
        }
      }
    });

    return () => {
      unsubMovies();
      unsubRequests();
      unsubSettings();
    };
  }, []);

  const currentLang = userProfile.language || 'en';
  const t = (key: string) => getTranslation(currentLang, key);

  // Like Toggle
  const handleToggleLike = (movieId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setMovies(prev =>
      prev.map(movie => {
        if (movie.id === movieId) {
          const isCurrentlyLiked = !!movie.userLiked;
          const newLiked = !isCurrentlyLiked;
          const newLikesCount = newLiked ? movie.likesCount + 1 : Math.max(0, movie.likesCount - 1);
          const newTargetCurrent = newLiked 
            ? movie.targetLikes.current + 1 
            : Math.max(0, movie.targetLikes.current - 1);

          if (newLiked) {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
          }

          const updatedTarget = {
            ...movie.targetLikes,
            current: newTargetCurrent
          };

          // Update in Firebase Realtime Database
          updateMovieLikesInFirebase(movieId, newLikesCount, updatedTarget);

          return {
            ...movie,
            userLiked: newLiked,
            likesCount: newLikesCount,
            targetLikes: updatedTarget
          };
        }
        return movie;
      })
    );
  };

  // Favorite Bookmark Toggle
  const handleToggleFavorite = (movieId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setUserProfile(prev => {
      const currentSaved = Array.isArray(prev?.savedMovieIds) ? prev.savedMovieIds : [];
      const exists = currentSaved.includes(movieId);
      const updatedSaved = exists
        ? currentSaved.filter(id => id !== movieId)
        : [...currentSaved, movieId];

      if (!exists) {
        confetti({ particleCount: 25, spread: 45, origin: { y: 0.85 } });
      }

      return {
        ...prev,
        savedMovieIds: updatedSaved
      };
    });
  };

  // Add user comment
  const handleAddComment = (movieId: string, text: string) => {
    if (!text.trim()) return;

    const newComment = {
      id: `comment-${Date.now()}`,
      author: userProfile.name,
      avatar: userProfile.avatarUrl,
      text: text.trim(),
      time: 'এইমাত্র',
      likes: 0
    };

    setMovies(prev =>
      prev.map(movie => {
        if (movie.id === movieId) {
          const newComments = [newComment, ...movie.comments];
          const newCount = movie.commentsCount + 1;
          addCommentToFirebase(movieId, newComments, newCount);
          return {
            ...movie,
            commentsCount: newCount,
            comments: newComments
          };
        }
        return movie;
      })
    );
  };

  // Movie Request submission
  const handleAddMovieRequest = (reqData: Omit<UserMovieRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newReq: UserMovieRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      submittedAt: 'এইমাত্র',
      status: 'pending'
    };
    setMovieRequests(prev => [newReq, ...prev]);
    saveMovieRequestToFirebase(newReq);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  // Update additional posters for a movie
  const handleUpdateMoviePosters = (movieId: string, newPosters: string[]) => {
    setMovies(prev =>
      prev.map(m => {
        if (m.id === movieId) {
          const updated = {
            ...m,
            additionalPosters: newPosters
          };
          saveMovieToFirebase(updated);
          return updated;
        }
        return m;
      })
    );
    setSelectedMovie(prev => {
      if (prev && prev.id === movieId) {
        return {
          ...prev,
          additionalPosters: newPosters
        };
      }
      return prev;
    });
  };

  // Clear all cached local data
  const handleClearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.MOVIES);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    setMovies(INITIAL_MOVIES);
    setUserProfile(DEFAULT_PROFILE);
  };

  // Filter and sort movies for home tab with strict priority
  // 1. Pinned movies (set by Admin) ALWAYS on top
  // 2. Movies marked as NEW (isNew) right next
  // 3. Other movies
  const filteredMovies = useMemo(() => {
    const base = selectedCategory === 'all' 
      ? [...movies] 
      : movies.filter(m => m.category === selectedCategory);

    return base.sort((a, b) => {
      const aPinned = pinnedMovieIds.includes(a.id);
      const bPinned = pinnedMovieIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // Prioritize NEW movies
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;

      return 0;
    });
  }, [movies, selectedCategory, pinnedMovieIds]);

  // Tab scroll memory for independent scroll per page
  const tabScrollPositions = useRef<Record<string, number>>({});

  const handleSelectTab = (newTab: TabType) => {
    if (newTab === activeTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Record current scroll for this tab
    tabScrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(newTab);
    // Smoothly set to saved scroll for the target tab
    requestAnimationFrame(() => {
      const targetScroll = tabScrollPositions.current[newTab] || 0;
      window.scrollTo({ top: targetScroll, behavior: 'instant' });
    });
  };

  // State for ultra-fast progressive batch loading (20 initial, 10 on scroll)
  const INITIAL_BATCH_SIZE = 20;
  const BATCH_INCREMENT = 10;
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top & Auto Reload state
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadToast, setReloadToast] = useState('');

  // Track window scroll for scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to Top & Quick Refresh
  const handleScrollToTopAndReload = () => {
    setIsReloading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setVisibleCount(INITIAL_BATCH_SIZE);

    setTimeout(() => {
      setIsReloading(false);
      setReloadToast('মুভি তালিকা রিফ্রেশ করা হয়েছে! ✨');
      confetti({ particleCount: 20, spread: 45, origin: { y: 0.9 } });
      setTimeout(() => setReloadToast(''), 2500);
    }, 400);
  };

  // Reset pagination when category or active tab changes
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [selectedCategory, activeTab]);

  // High-performance Intersection Observer for instant sub-second infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoadingMore(true);
          // Instant sub-second microtask dispatch for lightning render without freezing UI
          requestAnimationFrame(() => {
            setVisibleCount(prev => prev + BATCH_INCREMENT);
            setIsLoadingMore(false);
          });
        }
      },
      { rootMargin: '350px 0px', threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [filteredMovies.length]);

  // Paginated slice of filtered movies
  const displayedMovies = useMemo(() => {
    return filteredMovies.slice(0, visibleCount);
  }, [filteredMovies, visibleCount]);

  const savedMoviesList = useMemo(() => {
    const saved = userProfile?.savedMovieIds || [];
    return movies.filter(m => saved.includes(m.id));
  }, [movies, userProfile?.savedMovieIds]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-rose-500 selection:text-white pb-10">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl mx-auto min-h-screen flex flex-col">
        {/* Top Header */}
        <TopHeader
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenWelcome={() => setIsPasscodeOpen(true)}
          totalMovies={movies.length}
          language={currentLang}
        />

        {/* Dynamic Tab Views */}
        <main className="flex-1 px-3.5 pt-3">
          {/* TAB 1: HOME FEED */}
          {activeTab === 'home' && (
            <div className="space-y-4 pb-24 animate-in fade-in duration-300">
              {/* Hero Carousel with bounce icon transitions */}
              <HeroCarousel
                movies={movies}
                onSelectMovie={(movie) => setSelectedMovie(movie)}
                heroMovieIds={heroMovieIds}
              />

              {/* Category Chips Bar */}
              <CategoryChips
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                totalCount={movies.length}
                language={currentLang}
                categories={customCategories}
              />

              {/* Movie Feed - 1 item per row with sub-second lazy pagination */}
              <div className="space-y-3.5 pt-1">
                {displayedMovies.length > 0 ? (
                  <>
                    {displayedMovies.map(movie => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onSelect={(m) => setSelectedMovie(m)}
                        onToggleLike={handleToggleLike}
                        onToggleFavorite={handleToggleFavorite}
                        isSaved={(userProfile?.savedMovieIds || []).includes(movie.id)}
                        isPinned={pinnedMovieIds.includes(movie.id)}
                      />
                    ))}

                    {/* Infinite Scroll Sensor & Sub-Second Loading Status */}
                    {visibleCount < filteredMovies.length && (
                      <div ref={loadMoreRef} className="py-4 flex flex-col items-center justify-center space-y-2">
                        <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          <span>আরও মুভি লোড হচ্ছে ({displayedMovies.length}/{filteredMovies.length})...</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : movies.length === 0 ? (
                  <div className="py-16 px-6 text-center space-y-4 bg-slate-900/60 rounded-3xl border border-white/10 p-8 backdrop-blur-xl">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10">
                      <Film className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-white">এখনো কোনো মুভি আপলোড করা হয়নি</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        ওয়েবসাইটটি সম্পূর্ণ ফ্রেশ ও নতুন অবস্থায় রয়েছে। এডমিন প্যানেল থেকে নতুন মুভি আপলোড বা TMDB থেকে ১-ক্লিকে যোগ করলেই তা এখানে সাথে সাথে প্রদর্শিত হবে।
                      </p>
                    </div>
                    <button
                      onClick={() => setIsPasscodeOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>এডমিন প্যানেল থেকে মুভি আপলোড করুন</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-3 bg-slate-900/60 rounded-3xl border border-white/5 p-6">
                    <p className="text-sm text-slate-400">এই ক্যাটাগরিতে কোনো মুভি পাওয়া যায়নি।</p>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                    >
                      সকল মুভি দেখুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FAVORITES */}
          {activeTab === 'favorite' && (
            <FavoriteView
              savedMovies={savedMoviesList}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
              onRemoveFavorite={handleToggleFavorite}
              onGoHome={() => setActiveTab('home')}
              language={currentLang}
            />
          )}

          {/* TAB 3: TOP RATED / TRENDING */}
          {activeTab === 'tools' && (
            <TopRatedView
              movies={movies}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              savedMovieIds={userProfile?.savedMovieIds || []}
              trendingHeroIds={trendingHeroIds}
              language={currentLang}
            />
          )}

          {/* TAB 4: UPCOMING */}
          {activeTab === 'upcoming' && (
            <UpcomingView 
              language={currentLang} 
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          )}

          {/* TAB 5: SETTING / PROFILE */}
          {activeTab === 'setting' && (
            <SettingsProfileView
              userProfile={userProfile}
              onUpdateProfile={setUserProfile}
              movieRequests={movieRequests}
              onAddMovieRequest={handleAddMovieRequest}
              onClearAllData={handleClearAllData}
              onOpenAdmin={() => setIsPasscodeOpen(true)}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          savedCount={(userProfile?.savedMovieIds || []).length}
          movies={movies}
          language={currentLang}
        />

        {/* Floating Scroll to Top & Auto Reload Button */}
        {showScrollTop && (
          <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {reloadToast && (
              <div className="px-3 py-1.5 rounded-full bg-slate-900/95 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold shadow-2xl backdrop-blur-md animate-bounce">
                {reloadToast}
              </div>
            )}
            <button
              onClick={handleScrollToTopAndReload}
              disabled={isReloading}
              title="উপরে যান ও মুভি রিফ্রেশ করুন"
              className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/25 border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowUp className={`w-4 h-4 transition-transform group-hover:-translate-y-0.5 ${isReloading ? 'hidden' : 'block'}`} />
              <RotateCw className={`w-4 h-4 ${isReloading ? 'animate-spin block text-yellow-300' : 'hidden group-hover:block'}`} />
              <span className="text-xs font-bold whitespace-nowrap">
                {isReloading ? 'রিফ্রেশ হচ্ছে...' : 'উপরে যান'}
              </span>
            </button>
          </div>
        )}

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          movies={movies}
          onSelectMovie={(movie) => setSelectedMovie(movie)}
          language={currentLang}
        />

        {/* Admin Panel Modal (Opened secretly by Welcome button in Settings) */}
        <AdminPanelModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          movies={movies}
          onAddMovie={(newMovie) => {
            setMovies(prev => [newMovie, ...prev]);
            saveMovieToFirebase(newMovie);
            setSelectedCategory('all');
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          }}
          onUpdateMovie={(updated) => {
            setMovies(prev => prev.map(m => m.id === updated.id ? updated : m));
            saveMovieToFirebase(updated);
          }}
          onDeleteMovie={(movieId) => {
            setMovies(prev => prev.filter(m => m.id !== movieId));
            deleteMovieFromFirebase(movieId);
          }}
          onUpdateHeroCarousel={(ids) => {
            setHeroMovieIds(ids);
            saveFirebaseAppSettings({ heroIds: ids });
          }}
          onUpdateTrendingHeroCarousel={(ids) => {
            setTrendingHeroIds(ids);
            saveFirebaseAppSettings({ trendingHeroIds: ids });
          }}
          onUpdatePinnedMovies={(ids) => {
            setPinnedMovieIds(ids);
            saveFirebaseAppSettings({ pinnedMovieIds: ids });
          }}
          onUpdateCategories={(cats) => {
            setCustomCategories(cats);
            saveFirebaseAppSettings({ categories: cats });
          }}
          categories={customCategories}
          trendingHeroIds={trendingHeroIds}
          pinnedMovieIds={pinnedMovieIds}
        />

        {/* Full Movie Details Modal */}
        {selectedMovie && (
          <MovieDetailsModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onToggleLike={handleToggleLike}
            onToggleFavorite={handleToggleFavorite}
            isSaved={(userProfile?.savedMovieIds || []).includes(selectedMovie.id)}
            onAddComment={handleAddComment}
            onSelectRelated={(rel) => setSelectedMovie(rel)}
            allMovies={movies}
            onUpdateMoviePosters={handleUpdateMoviePosters}
          />
        )}

        {/* Apple iOS Passcode Lockscreen Modal */}
        <ApplePasscodeModal
          isOpen={isPasscodeOpen}
          onClose={() => setIsPasscodeOpen(false)}
          onSuccess={() => {
            setIsAdminOpen(true);
            confetti({ particleCount: 50, spread: 75, origin: { y: 0.6 } });
          }}
          targetPasscode="37421237"
        />

        {/* Welcome Guide Modal */}
        <WelcomeGuideModal
          isOpen={showWelcome}
          onClose={() => setShowWelcome(false)}
          language={currentLang}
        />
      </div>
    </div>
  );
}
