import React, { useState } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  currentPosters: string[];
  onSavePosters: (newPosters: string[]) => void;
}

export const AdminPosterModal: React.FC<AdminPosterModalProps> = ({
  isOpen,
  onClose,
  movieTitle,
  currentPosters,
  onSavePosters
}) => {
  const [posters, setPosters] = useState<string[]>(currentPosters);
  const [newUrl, setNewUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddPoster = (e: React.FormEvent) => {
    e.preventDefault();
    const url = newUrl.trim();
    if (!url) {
      setErrorMsg('অনুগ্রহ করে একটি সঠিক ছবির লিঙ্ক (URL) দিন');
      return;
    }

    if ((posters || []).includes(url)) {
      setErrorMsg('এই পোস্টারটি ইতিমধ্যে তালিকায় যুক্ত আছে');
      return;
    }

    setPosters(prev => [...prev, url]);
    setNewUrl('');
    setErrorMsg('');
  };

  const handleRemovePoster = (indexToRemove: number) => {
    if (posters.length <= 1) {
      setErrorMsg('কমপক্ষে ১টি পোস্টার থাকা বাধ্যতামূলক');
      return;
    }
    setPosters(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setErrorMsg('');
  };

  const handleSave = () => {
    if (posters.length === 0) {
      setErrorMsg('কমপক্ষে ১টি পোস্টার যুক্ত করুন');
      return;
    }
    onSavePosters(posters);
    setSavedSuccess(true);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">পোস্টার ম্যানেজার (Admin)</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px] sm:max-w-xs">{movieTitle}</p>
            </div>
          </div>

          <button
            id="close-admin-poster-modal"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="py-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
          {/* Add Poster Input Form */}
          <form onSubmit={handleAddPoster} className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              নতুন পোস্টার বা ব্যানারের URL যুক্ত করুন:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="https://image.tmdb.org/t/p/... বা ছবির লিঙ্ক"
                className="flex-1 bg-slate-950/80 border border-white/15 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                id="add-poster-url-btn"
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-md shadow-rose-600/30 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>যোগ করুন</span>
              </button>
            </div>
            {errorMsg && (
              <div className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Current Posters List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                বর্তমান পোস্টার তালিকা ({posters.length} টি):
              </span>
              <span className="text-[11px] text-slate-400">
                (একাধিক পোস্টার থাকলে হিরো ক্যারোসেল হবে)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {posters.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden bg-slate-950 aspect-[16/9] border border-white/10"
                >
                  <img
                    src={url}
                    alt={`Poster ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-1.5">
                    <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-black/60">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePoster(idx)}
                      className="p-1 rounded-md bg-rose-600/90 hover:bg-rose-500 text-white transition-all shadow-md"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-colors"
          >
            বাতিল
          </button>
          <button
            type="button"
            id="save-posters-admin-btn"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>সংরক্ষণ হয়েছে!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>সংরক্ষণ করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
