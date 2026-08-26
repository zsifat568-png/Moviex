import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MessageSquare, Send, Check, ExternalLink, HelpCircle, Shield, LifeBuoy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveSupportMessageToFirebase } from '../utils/firebase';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    await saveSupportMessageToFirebase(msg.trim());
    setSent(true);
    confetti({ particleCount: 30, spread: 60 });
    setTimeout(() => {
      setSent(false);
      setMsg('');
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
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Help & Support</h3>
              <p className="text-xs text-slate-400">সার্ভিস ও প্লেয়ার সাপোর্ট সেন্টার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Fast Channel */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-500/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="font-bold text-sm text-cyan-300">অফিসিয়াল টেলিগ্রাম চ্যানেল</div>
            <p className="text-xs text-slate-400">সরাসরি লিংক, নোটিফিকেশন ও বটের জন্য</p>
          </div>
          <a
            href="https://t.me/MovieeLink_Bot"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <span>জয়েন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Common Help QA */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" /> সচরাচর জিজ্ঞাসিত প্রশ্ন:
          </h4>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-white/5 text-xs space-y-1">
            <span className="font-bold text-white block">❓ ভিডিওতে শব্দ (Audio) আসছে না কেন?</span>
            <p className="text-slate-300">
              অনেক মুভিতে মাল্টি-অডিও (Dolby 5.1/EAC3) থাকে। এটি সঠিকভাবে শুনতে ফাইলটি ডাউনলোড করে VLC বা MX Player দিয়ে ওপেন করুন।
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-white/5 text-xs space-y-1">
            <span className="font-bold text-white block">❓ ডাউনলোড স্পিড স্লো হলে কী করব?</span>
            <p className="text-slate-300">
              আমাদের "Telegram Bot Link" অথবা "Google Drive" সার্ভার অপশন নির্বাচন করুন, এতে সম্পূর্ণ ব্যান্ডউইথ পাবেন।
            </p>
          </div>
        </div>

        {/* Send message to Admin */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <h4 className="text-xs font-bold text-slate-300">অ্যাডমিনকে মেসেজ পাঠান:</h4>
          {sent ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে!
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-2">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={2}
                placeholder="সমস্যা বা মতামত লিখুন..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!msg.trim()}
                className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> মেসেজ পাঠান
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
