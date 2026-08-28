import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Bookmark, Play, 
  Film, Tv, Star, Clock, Sparkles, Clapperboard,
  User, Users, Loader2, Download, HardDrive, Send, 
  ChevronLeft, ChevronRight, Image as ImageIcon, Plus, Flame,
  CheckCircle2, X, MessageSquareQuote, Check
} from 'lucide-react';
import { MovieItem, MovieActor } from '../types';
import { fetchCastAndDetailsForMovie, getActorAvatarFallback } from '../utils/tmdbService';
import { sendTelegramMessageData, extractTelegramMessageId, closeTelegramWebApp, openBotChat, TG_BOT_USERNAME } from '../utils/telegramService';
import { AdminPosterModal } from './AdminPosterModal';

interface MovieDetailsModalProps {
  movie: MovieItem | null;
  onClose: () => void;
  onToggleLike?: (movieId: string) => void;
  onToggleFavorite: (movieId: string) => void;
  isSaved: boolean;
  onAddComment?: (movieId: string, text: string) => void;
  onSelectRelated: (movie: MovieItem) => void;
  allMovies: MovieItem[];
  onUpdateMoviePosters?: (movieId: string, posters: string[]) => void;
}

const CATEGORY_NAMES: Record<string, string> = {
  bengali: 'বাংলা সিনেমা (Bangla Movie)',
  natok: 'নাটক ও ওয়েব সিরিজ (Natok & Series)',
  bollywood: 'বলিউড মুভি (Bollywood Movie)',
  hollywood: 'হলিউড মুভি (Hollywood Movie)',
  south: 'সাউথ ইন্ডিয়ান (South Indian)',
  anime: 'অ্যানিমে (Anime)'
};

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onToggleFavorite,
  isSaved,
  onSelectRelated,
  allMovies,
  onUpdateMoviePosters
}) => {
  if (!movie) return null;

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [actorsList, setActorsList] = useState<MovieActor[]>(movie.actors || []);
  const [isLoadingCast, setIsLoadingCast] = useState(false);
  const [synopsisText, setSynopsisText] = useState(movie.synopsisBn);
  const [directorName, setDirectorName] = useState(movie.director);
  
  // Posters & Carousel State
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isPaused, setIsPaused] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);

  // Combine unique posters list
  const allPosters = Array.from(
    new Set(
      [
        movie.posterUrl,
        movie.backdropUrl,
        ...(movie.additionalPosters || [])
      ].filter(url => url && typeof url === 'string' && url.trim().length > 0)
    )
  );

  const relatedMovies = allMovies.filter(m => m.id !== movie.id).slice(0, 3);
  const categoryLabel = CATEGORY_NAMES[movie.category] || movie.category.toUpperCase();

  // Auto slide carousel when multiple posters exist
  useEffect(() => {
    if (allPosters.length <= 1 || isPaused || isPlayingPreview) return;

    const timer = setInterval(() => {
      setSlideDirection('right');
      setCurrentPosterIndex(prev => (prev + 1) % allPosters.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [allPosters.length, isPaused, isPlayingPreview]);

  // Dynamically load Cast photos & details from TMDB API
  useEffect(() => {
    setActorsList(movie.actors || []);
    setSynopsisText(movie.synopsisBn);
    setDirectorName(movie.director);
    setCurrentPosterIndex(0);

    const loadLiveTMDBData = async () => {
      setIsLoadingCast(true);
      try {
        const result = await fetchCastAndDetailsForMovie(
          movie.titleEn || movie.titleBn,
          movie.tmdbId
        );

        if (result) {
          if (result.actors && result.actors.length > 0) {
            setActorsList(result.actors);
          }
          if (result.director) setDirectorName(result.director);
          if (result.trailerKey) setTrailerKey(result.trailerKey);
          if (result.synopsis && (!movie.synopsisBn || movie.synopsisBn.length < 30)) {
            setSynopsisText(result.synopsis);
          }
          if (result.additionalPosters && result.additionalPosters.length > 0 && onUpdateMoviePosters) {
            const combined = Array.from(new Set([...allPosters, ...result.additionalPosters]));
            onUpdateMoviePosters(movie.id, combined);
          }
        } else if (movie.cast && movie.cast.length > 0 && (!movie.actors || movie.actors.length === 0)) {
          const fallbackActors: MovieActor[] = movie.cast.map(name => ({
            name,
            character: 'Lead Cast',
            profileUrl: getActorAvatarFallback(name)
          }));
          setActorsList(fallbackActors);
        }
      } catch (err) {
        console.error('Error fetching live cast:', err);
      } finally {
        setIsLoadingCast(false);
      }
    };

    loadLiveTMDBData();
  }, [movie.id, movie.titleEn, movie.titleBn, movie.tmdbId]);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlideDirection('left');
    setCurrentPosterIndex(prev => (prev === 0 ? allPosters.length - 1 : prev - 1));
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlideDirection('right');
    setCurrentPosterIndex(prev => (prev + 1) % allPosters.length);
  };

  const handleSavePosters = (newPosters: string[]) => {
    if (onUpdateMoviePosters) {
      onUpdateMoviePosters(movie.id, newPosters);
    }
  };

  const activePoster = allPosters[currentPosterIndex] || movie.posterUrl || movie.backdropUrl;

  const handleTelegramDownload = () => {
    // 1. Get Message ID or Telegram stream link
    const tgStream = movie.streamLinks?.find(l => l.type === 'telegram');
    const rawIdOrUrl = movie.messageId || tgStream?.messageId || tgStream?.url || movie.streamLinks?.[0]?.url || '';
    const messageId = extractTelegramMessageId(rawIdOrUrl) || rawIdOrUrl || movie.id;

    // 2. Direct send to Telegram bot inbox via Telegram.WebApp.sendData()
    sendTelegramMessageData(messageId);

    // 3. Show stylish glass notification popup
    setShowDownloadPopup(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex justify-center overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl min-h-screen bg-slate-900 border-x border-white/10 pb-24 text-slate-100 flex flex-col">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <button
            id="back-to-feed-btn"
            onClick={onClose}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-full bg-white/10 hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold">মুভি ডিটেইলস</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Admin Poster Manager Button */}
            <button
              id="admin-manage-posters-btn"
              onClick={() => setIsAdminModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="Admin: পোস্টার যোগ বা পরিবর্তন করুন"
            >
              <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">পোস্টার ম্যানেজ</span>
            </button>

            {/* Favorite Bookmark */}
            <button
              id={`detail-fav-btn-${movie.id}`}
              onClick={() => onToggleFavorite(movie.id)}
              className={`p-2 rounded-xl transition-all ${
                isSaved 
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40' 
                  : 'bg-white/10 hover:bg-white/20 text-slate-300'
              }`}
              title="Save to favorites"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>

        {/* 🌟 16:9 Mobile & Desktop Hero Carousel / Poster Stage (Identical to Home Hero Banner Size) */}
        <div className="p-3 sm:p-4 pb-0">
          <div 
            className="relative aspect-[16/9] h-44 sm:h-52 md:h-60 w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 group select-none bg-slate-950 backdrop-blur-xl ring-1 ring-white/10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={(e) => {
              setIsPaused(true);
              setTouchStartX(e.touches[0].clientX);
            }}
            onTouchEnd={(e) => {
              setIsPaused(false);
              if (touchStartX !== null && allPosters.length > 1) {
                const touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;
                if (diff > 45) {
                  handleNextSlide();
                } else if (diff < -45) {
                  handlePrevSlide();
                }
              }
              setTouchStartX(null);
            }}
          >
            {/* Top Subtle Glass Shimmer */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none" />

            {isPlayingPreview ? (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                {/* Embedded YouTube Trailer Player */}
                <iframe
                  src={
                    trailerKey 
                      ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
                      : `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent((movie.titleEn || movie.titleBn) + ' official trailer')}&autoplay=1`
                  }
                  title={`${movie.titleBn} Official Trailer`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* 🌟 Corner Action Button: "ডাউনলোড করে দেখুন" */}
                <button
                  id="trailer-download-corner-btn"
                  onClick={handleTelegramDownload}
                  className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-700 active:scale-95 text-white border border-blue-400/50 shadow-2xl text-[11px] font-bold flex items-center gap-1.5 transition-all duration-150 cursor-pointer z-30 select-none"
                  title="ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5 text-sky-300 stroke-[2.5]" />
                  <span>ডাউনলোড করে দেখুন</span>
                </button>

                {/* Corner Return Button: "✕ পোস্টার" */}
                <button
                  onClick={() => setIsPlayingPreview(false)}
                  className="absolute top-2.5 left-2.5 px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-black/95 text-slate-200 border border-white/20 shadow-xl text-[11px] font-bold flex items-center gap-1 transition-all z-30 cursor-pointer"
                  title="পোস্টারে ফিরুন"
                >
                  ✕ পোস্টার
                </button>
              </div>
            ) : (
              <>
                {/* Smooth Animated Poster Slide with Direction & Ken-Burns Zoom */}
                <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                  <motion.img
                    key={`poster-slide-${currentPosterIndex}-${activePoster}`}
                    src={activePoster}
                    alt={movie.titleBn}
                    custom={slideDirection}
                    variants={{
                      enter: (direction: 'left' | 'right') => ({
                        x: direction === 'right' ? '100%' : '-100%',
                        opacity: 0,
                        scale: 1.04
                      }),
                      center: {
                        x: 0,
                        opacity: 1,
                        scale: 1,
                        transition: {
                          x: { type: 'spring', stiffness: 280, damping: 28 },
                          opacity: { duration: 0.35 },
                          scale: { duration: 0.5 }
                        }
                      },
                      exit: (direction: 'left' | 'right') => ({
                        x: direction === 'right' ? '-100%' : '100%',
                        opacity: 0,
                        scale: 0.96,
                        transition: {
                          x: { type: 'spring', stiffness: 280, damping: 28 },
                          opacity: { duration: 0.35 }
                        }
                      })
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                </AnimatePresence>

                {/* Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-black/50 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                
                {/* Top Badges & Poster Counter */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
                  {movie.isTrending && (
                    <div className="px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white text-[9px] font-bold tracking-tight flex items-center gap-0.5 shadow-md shadow-rose-600/30 border border-rose-400/30">
                      <Flame className="w-2.5 h-2.5 fill-white text-white" />
                      <span>TRENDING</span>
                    </div>
                  )}
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[9px] font-semibold border border-white/15 shadow-md">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                  {movie.isNew && (
                    <span className="px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[8.5px] font-black uppercase tracking-tight shadow-sm">
                      NEW
                    </span>
                  )}
                  {allPosters.length > 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-slate-200 text-[9px] font-bold border border-white/15 shadow-md flex items-center gap-1">
                      <ImageIcon className="w-3 h-3 text-rose-400" />
                      <span>{currentPosterIndex + 1} / {allPosters.length}</span>
                    </span>
                  )}
                </div>

                {/* Carousel Left / Right Arrows when multiple posters exist */}
                {allPosters.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSlide}
                      aria-label="Previous poster"
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 opacity-90 hover:opacity-100 transition-all z-20 active:scale-95 shadow-xl"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      aria-label="Next poster"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 opacity-90 hover:opacity-100 transition-all z-20 active:scale-95 shadow-xl"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Play Trailer Button in Center */}
                <button
                  id="play-stream-preview-btn"
                  onClick={() => setIsPlayingPreview(true)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 hover:scale-110 transition-all cursor-pointer z-10"
                  title="Play Trailer"
                >
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </button>

                {/* Bottom Right Duration */}
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 z-10 pointer-events-none">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-slate-200 text-[10px] font-semibold border border-white/15 shadow-md">
                    <Clock className="w-3 h-3 text-rose-400" />
                    <span>{movie.duration}</span>
                  </div>
                </div>

                {/* Slide Duration Progress Bar */}
                {allPosters.length > 1 && !isPaused && !isPlayingPreview && (
                  <motion.div
                    key={`progress-${currentPosterIndex}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4.5, ease: 'linear' }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 z-20 pointer-events-none"
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-5">
          {/* Main Info: Title, Genres & Metadata */}
          <div className="space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {movie.titleBn}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium pt-0.5">
                {movie.titleEn}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-xs shadow-sm">
                <Clapperboard className="w-3.5 h-3.5" />
                <span>{categoryLabel}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 font-semibold text-xs border border-white/5 shadow-sm">
                📅 {movie.releaseYear}
              </div>
            </div>

            {/* 🌟 Solid Deep Blue Full-Width DOWNLOAD Button (No Glass Effect) */}
            <button
              id="movie-details-main-full-download-btn"
              onClick={handleTelegramDownload}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white font-black text-base sm:text-lg tracking-wider uppercase shadow-xl shadow-blue-950/60 flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer select-none border-0"
              title="ডাউনলোড করুন"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
              <span>DOWNLOAD</span>
            </button>
          </div>

          {/* 🌟 100% VISIBLE ACTOR PHOTOS & NAMES */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span>অভিনয়শিল্পী ({actorsList.length} জন)</span>
              </h3>
              {isLoadingCast && (
                <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> TMDB তথ্য লোড হচ্ছে...
                </span>
              )}
            </div>

            {/* Borderless Round Actor Profile Avatars with TMDB Live Photos */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1">
              {actorsList.length > 0 ? (
                actorsList.map((actor, idx) => {
                  const avatarSrc = actor.profileUrl || getActorAvatarFallback(actor.name);
                  return (
                    <div
                      key={actor.id ? `actor-${actor.id}` : `actor-idx-${idx}`}
                      className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center text-center space-y-1.5 group/actor cursor-pointer"
                    >
                      {/* Clean Round High-Res Avatar */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-slate-800 ring-2 ring-white/10 group-hover/actor:ring-rose-500 group-hover/actor:shadow-lg group-hover/actor:shadow-rose-500/30 transition-all shrink-0 shadow-md relative">
                        <img
                          src={avatarSrc}
                          alt={actor.name}
                          className="w-full h-full object-cover group-hover/actor:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallback = getActorAvatarFallback(actor.name);
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </div>

                      {/* Actor Name & Character underneath */}
                      <div className="w-full px-0.5">
                        <h4 className="text-[11px] sm:text-xs font-bold text-slate-200 line-clamp-1 group-hover/actor:text-rose-400 transition-colors">
                          {actor.name}
                        </h4>
                        {actor.character && (
                          <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 font-medium">
                            {actor.character}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-xs text-slate-400 bg-slate-950/50 rounded-xl border border-white/5 w-full">
                  অভিনয়শিল্পীদের তথ্য লোড হচ্ছে...
                </div>
              )}
            </div>
          </div>

          {/* Synopsis (Storyline) */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>গল্প সংক্ষেপ</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-2xl border border-white/5">
              {synopsisText}
            </p>
          </div>


          {/* Related / Recommended Movies */}
          {relatedMovies.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>আরও যা দেখতে পারেন</span>
              </h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {relatedMovies.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="group/rel cursor-pointer space-y-1.5 bg-slate-950/60 p-2 rounded-xl border border-white/5 hover:border-rose-500/40 transition-all"
                  >
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-800">
                      <img 
                        src={rel.posterUrl} 
                        alt={rel.titleBn} 
                        className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    </div>
                    <h5 className="text-[11px] font-semibold text-slate-200 truncate">{rel.titleBn}</h5>
                    <span className="text-[10px] text-slate-500 block">{rel.releaseYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Poster Manager Modal */}
      <AdminPosterModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        movieTitle={movie.titleBn}
        currentPosters={allPosters}
        onSavePosters={handleSavePosters}
      />

      {/* 🌟 Stylish Glass-Effect Download / Bot Inbox Popup Modal */}
      <AnimatePresence>
        {showDownloadPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with strong blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDownloadPopup(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Glass Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm sm:max-w-md bg-slate-900/90 border border-sky-400/30 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl text-center space-y-5 ring-1 ring-white/10 overflow-hidden"
            >
              {/* Background ambient lighting */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 right-0 w-32 h-32 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

              {/* Close Icon in corner */}
              <button
                onClick={() => setShowDownloadPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all active:scale-95"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated Icon Badge */}
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 ring-4 ring-sky-400/20 animate-bounce duration-1000">
                <Send className="w-8 h-8 -rotate-12 translate-x-0.5 -translate-y-0.5" />
              </div>

              {/* Header Title */}
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  মুভি পাঠানো সম্পন্ন হয়েছে! 🚀
                </h3>
                <p className="text-xs text-sky-300/90 font-medium">
                  {movie.titleBn} ({movie.releaseYear})
                </p>
              </div>

              {/* Crystal Clear Readable Message Box */}
              <div className="bg-slate-950/70 border border-sky-400/25 rounded-2xl p-4 text-left space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-400">অটো মেসেজ টার্গেট:</span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    @{TG_BOT_USERNAME}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                  মুভিটি সেন্ড করার রিকোয়েস্ট পাঠানো হয়েছে। নিচের বাটন দিয়ে সরাসরি বটের ইনবক্সে গিয়ে ফাইলটি ডাউনলোড বা দেখতে পারবেন।
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  id="open-telegram-bot-direct-btn"
                  onClick={() => {
                    const tgStream = movie.streamLinks?.find(l => l.type === 'telegram');
                    const rawIdOrUrl = movie.messageId || tgStream?.messageId || tgStream?.url || movie.streamLinks?.[0]?.url || '';
                    const messageId = extractTelegramMessageId(rawIdOrUrl) || rawIdOrUrl || movie.id;
                    openBotChat(messageId);
                    setShowDownloadPopup(false);
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer select-none border border-sky-300/30"
                >
                  <Send className="w-4 h-4" />
                  <span>বট ইনবক্সে যান (@{TG_BOT_USERNAME})</span>
                </button>

                <button
                  id="close-telegram-webapp-btn"
                  onClick={() => {
                    closeTelegramWebApp();
                    setShowDownloadPopup(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none border border-white/10"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>মিনি অ্যাপ ক্লোজ করুন</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
