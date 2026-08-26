import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Film, Send, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { UserMovieRequest } from '../types';
import confetti from 'canvas-confetti';

interface MovieRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: (request: UserMovieRequest) => void;
  existingRequests: UserMovieRequest[];
}

export const MovieRequestModal: React.FC<MovieRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted,
  existingRequests
}) => {
  const [movieName, setMovieName] = useState('');
  const [year, setYear] = useState('');
  const [language, setLanguage] = useState('Bengali');
  const [notes, setNotes] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieName.trim()) return;

    const newReq: UserMovieRequest = {
      id: 'req-' + Date.now(),
      movieName: movieName.trim(),
      year: year.trim() || undefined,
      language,
      notes: notes.trim() || undefined,
      submittedAt: 'এইমাত্র',
      status: 'pending'
    };

    onRequestSubmitted(newReq);
    setSubmittedSuccess(true);
    confetti({ particleCount: 40, spread: 70 });

    setTimeout(() => {
      setSubmittedSuccess(false);
      setMovieName('');
      setYear('');
      setNotes('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar text-slate-100"
      >
        {/* Header matching video */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Movie Request</h3>
              <p className="text-xs text-slate-400">আপনার পছন্দের মুভির অনুরোধ জানান</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-white text-base">অনুরোধ সফলভাবে গৃহীত হয়েছে!</h4>
            <p className="text-xs text-slate-400">আমরা ২৪ ঘণ্টার মধ্যে মুভিটি আপলোড করার চেষ্টা করব।</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                মুভি / সিরিজের নাম <span className="text-rose-400">*</span>:
              </label>
              <input
                type="text"
                required
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                placeholder="যেমন: তুফান ২, ব্যাচেলর পয়েন্ট..."
                className="w-full bg-slate-800/90 border border-white/10 focus:border-rose-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">রিলিজ বছর:</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="যেমন: 2026"
                  className="w-full bg-slate-800/90 border border-white/10 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ভাষা:</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Bengali">বাংলা (Bengali)</option>
                  <option value="Hindi">হিন্দি (Hindi)</option>
                  <option value="English">ইংরেজি (English)</option>
                  <option value="South">সাউথ ডাবিং (South Indian)</option>
                  <option value="Anime">এনিমে (Anime / Sub)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">বাড়তি তথ্য / নোট:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="কোন নির্দিষ্ট কোয়ালিটি বা সাবটাইটেল প্রয়োজন হলে লিখুন..."
                className="w-full bg-slate-800/90 border border-white/10 focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> অনুরোধ পাঠান
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
