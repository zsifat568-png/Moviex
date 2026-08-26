import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, Delete, X, ShieldCheck, Sparkles, Fingerprint } from 'lucide-react';

interface ApplePasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetPasscode?: string;
}

const KEYPAD_BUTTONS = [
  { num: '1', sub: '' },
  { num: '2', sub: 'ABC' },
  { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' },
  { num: '5', sub: 'JKL' },
  { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' },
  { num: '8', sub: 'TUV' },
  { num: '9', sub: 'WXYZ' },
  { num: 'empty', sub: '' },
  { num: '0', sub: '+' },
  { num: 'delete', sub: '' }
];

export const ApplePasscodeModal: React.FC<ApplePasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetPasscode = '37421237'
}) => {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [isError, setIsError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const targetLength = targetPasscode.length; // 8 digits

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setEnteredPin('');
      setIsError(false);
      setIsUnlocked(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  // Handle number input
  const handleDigitPress = useCallback((digit: string) => {
    if (isUnlocked) return;
    if (enteredPin.length >= targetLength) return;

    setIsError(false);
    setErrorMsg('');
    const newPin = enteredPin + digit;
    setEnteredPin(newPin);

    // If reached full length, check passcode
    if (newPin.length === targetLength) {
      if (newPin === targetPasscode) {
        setIsUnlocked(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
      } else {
        setIsError(true);
        setErrorMsg('ভুল পাসকোড! আবার চেষ্টা করুন।');
        setTimeout(() => {
          setEnteredPin('');
          setIsError(false);
        }, 800);
      }
    }
  }, [enteredPin, targetLength, targetPasscode, isUnlocked, onSuccess, onClose]);

  // Handle Backspace / Delete
  const handleDelete = useCallback(() => {
    if (isUnlocked) return;
    setIsError(false);
    setErrorMsg('');
    setEnteredPin(prev => prev.slice(0, -1));
  }, [isUnlocked]);

  // Physical Keyboard Listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigitPress, handleDelete, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl select-none"
      >
        {/* Subtle glowing ambient lights */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-sm rounded-[36px] bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black/95 border border-white/15 p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-white overflow-hidden flex flex-col items-center"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all active:scale-95"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>

          {/* iOS Lock Icon & Status */}
          <div className="flex flex-col items-center mt-1 mb-4 space-y-2">
            <motion.div
              animate={
                isUnlocked
                  ? { scale: [1, 1.25, 1], rotate: [0, 10, 0] }
                  : isError
                  ? { x: [-10, 10, -8, 8, -4, 4, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                isUnlocked
                  ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-300 shadow-emerald-500/30'
                  : isError
                  ? 'bg-rose-500/25 border border-rose-400 text-rose-300 shadow-rose-500/30'
                  : 'bg-white/10 border border-white/20 text-white shadow-white/5'
              }`}
            >
              {isUnlocked ? (
                <Unlock className="w-7 h-7 text-emerald-400" />
              ) : (
                <Lock className="w-6 h-6 text-slate-200" />
              )}
            </motion.div>

            <div className="text-center">
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
                <span>{isUnlocked ? 'আনলক সফল হয়েছে!' : 'Security Passcode'}</span>
                {isUnlocked && <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {errorMsg ? (
                  <span className="text-rose-400 font-semibold">{errorMsg}</span>
                ) : (
                  'এডমিন অ্যাক্সেসের জন্য ৮-সংখ্যার পাসকোড দিন'
                )}
              </p>
            </div>
          </div>

          {/* Apple-style PIN Indicator Dots */}
          <motion.div
            animate={isError ? { x: [-14, 14, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.45 }}
            className="flex items-center justify-center gap-3 my-3"
          >
            {Array.from({ length: targetLength }).map((_, index) => {
              const isFilled = index < enteredPin.length;
              return (
                <div
                  key={index}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isUnlocked
                      ? 'bg-emerald-400 scale-110 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                      : isError
                      ? 'bg-rose-500 border border-rose-400 scale-110 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                      : isFilled
                      ? 'bg-white scale-105 shadow-[0_0_8px_rgba(255,255,255,0.7)]'
                      : 'bg-transparent border-2 border-white/30'
                  }`}
                />
              );
            })}
          </motion.div>

          {/* Apple Keypad Grid */}
          <div className="grid grid-cols-3 gap-x-5 gap-y-3 mt-4 mb-2">
            {KEYPAD_BUTTONS.map((item, i) => {
              if (item.num === 'empty') {
                return (
                  <div
                    key={i}
                    className="w-16 h-16 sm:w-[68px] sm:h-[68px] flex items-center justify-center"
                  >
                    <Fingerprint className="w-7 h-7 text-white/20" />
                  </div>
                );
              }

              if (item.num === 'delete') {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={handleDelete}
                    disabled={enteredPin.length === 0}
                    className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full flex flex-col items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-all disabled:opacity-20 cursor-pointer"
                  >
                    <Delete className="w-6 h-6" />
                    <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">মুছুন</span>
                  </button>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDigitPress(item.num)}
                  disabled={isUnlocked}
                  className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:bg-white/30 active:scale-92 border border-white/10 flex flex-col items-center justify-center transition-all duration-150 shadow-inner group cursor-pointer backdrop-blur-md"
                >
                  <span className="text-xl sm:text-2xl font-light text-white group-hover:scale-105 transition-transform leading-none">
                    {item.num}
                  </span>
                  {item.sub && (
                    <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-widest mt-0.5 leading-none">
                      {item.sub}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Cancel & Info */}
          <div className="w-full flex items-center justify-between pt-2 px-2 text-xs text-slate-400">
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white font-medium transition-colors py-1 px-2 rounded-lg hover:bg-white/5 active:scale-95"
            >
              বাতিল (Cancel)
            </button>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Apple Secured</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
