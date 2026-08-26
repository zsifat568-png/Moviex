import React, { useState } from 'react';
import { 
  Film, Moon, Globe, LifeBuoy, ChevronRight, Sparkles, Clapperboard
} from 'lucide-react';
import { UserProfile, UserMovieRequest } from '../types';
import { MovieRequestModal } from './MovieRequestModal';
import { SupportModal } from './SupportModal';
import { LanguageSelectModal } from './LanguageSelectModal';
import { SupportedLanguage, LANGUAGE_OPTIONS, getTranslation } from '../utils/translations';

interface SettingsProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onClearAllData?: () => void;
  movieRequests: UserMovieRequest[];
  onAddMovieRequest: (request: Omit<UserMovieRequest, 'id' | 'submittedAt' | 'status'>) => void;
  onOpenAdmin?: () => void;
}

export const SettingsProfileView: React.FC<SettingsProfileViewProps> = ({
  userProfile,
  onUpdateProfile,
  movieRequests,
  onAddMovieRequest,
  onOpenAdmin
}) => {
  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const lang = userProfile.language || 'en';
  const t = (key: string) => getTranslation(lang, key);
  const currentLangObj = LANGUAGE_OPTIONS.find(l => l.code === lang) || LANGUAGE_OPTIONS[0];

  const handleSelectLanguage = (newLang: SupportedLanguage) => {
    onUpdateProfile({ language: newLang });
  };

  return (
    <div className="space-y-4 pb-28 max-w-xl mx-auto animate-in fade-in duration-300">
      {/* 🌟 Clean Aesthetic MovieX Member Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-white/10 flex items-center gap-4 relative overflow-hidden backdrop-blur-md shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-[1.5px] shadow-lg shadow-rose-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
              <Clapperboard className="w-7 h-7 text-rose-400" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-[9px] font-black text-white uppercase tracking-wider shadow-sm flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> VIP
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest">
              Premium Stream
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5">
            <span>MovieX Member</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">আনলিমিটেড স্ট্রিমিং ও দ্রুততম ডাউনলোড</p>
        </div>
      </div>

      {/* Prominent Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Movie Request Button */}
        <button
          id="movie-request-profile-btn"
          onClick={() => setIsRequestModalOpen(true)}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/20 flex items-center justify-between transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/20 text-white group-hover:rotate-6 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-bold text-sm">{t('movie_request_title')}</div>
              <div className="text-[11px] text-rose-100">{t('movie_request_desc')}</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        {/* 2. Support Button */}
        <button
          id="support-profile-btn"
          onClick={() => setIsSupportModalOpen(true)}
          className="w-full p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-500/40 transition-all flex items-center justify-between text-left shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">{t('support_btn')}</div>
              <div className="text-[11px] text-slate-400">{t('support_desc')}</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>
      </div>

      {/* General Settings */}
      <div className="p-4 rounded-3xl bg-slate-900/80 border border-white/10 space-y-3 backdrop-blur-md">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('app_preferences')}</h4>

        {/* Language Selection Row */}
        <button
          id="open-language-modal-btn"
          onClick={() => setIsLanguageModalOpen(true)}
          className="w-full flex items-center justify-between py-2 border-b border-white/5 hover:bg-white/5 px-2 rounded-xl transition-colors text-left group"
        >
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Globe className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span className="font-semibold">{t('language_setting')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/10 text-white flex items-center gap-1.5 border border-white/10 shadow-sm">
              <span>{currentLangObj.flag}</span>
              <span>{currentLangObj.nativeName}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Theme */}
        <div className="flex items-center justify-between py-2 px-2">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <Moon className="w-4 h-4 text-purple-400" />
            <span className="font-semibold">{t('theme_mode')}</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/10 text-white border border-white/10">
            Glass Dark
          </span>
        </div>
      </div>

      {/* 🌟 Discreet Admin Trigger Line disguised as Welcome Text */}
      <div className="pt-2 text-center select-none">
        <button
          id="secret-admin-panel-trigger-btn"
          type="button"
          onClick={onOpenAdmin}
          className="group inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 hover:from-slate-800 hover:to-slate-800 border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
        >
          <span className="text-sm font-black tracking-wide text-slate-300 group-hover:text-white transition-colors uppercase">
            Welcome
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500/60 group-hover:bg-rose-400 group-hover:scale-125 transition-all" />
        </button>
        <p className="text-[10px] text-slate-500 pt-1 font-medium">
          Moviee Link v2.5 • All Rights Reserved
        </p>
      </div>

      {/* Modals */}
      <LanguageSelectModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguage={lang}
        onSelectLanguage={handleSelectLanguage}
      />

      <MovieRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onRequestSubmitted={onAddMovieRequest}
        existingRequests={movieRequests}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
};
