import React, { useState } from 'react';
import { 
  X, Calculator, Activity, CircleDollarSign, Heart, 
  KeyRound, Droplet, QrCode, Dices, CalendarDays, Zap, 
  Copy, Check, Sparkles, RefreshCw, Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ToolModalProps {
  toolId: string | null;
  onClose: () => void;
}

export const ToolModalContainer: React.FC<ToolModalProps> = ({ toolId, onClose }) => {
  if (!toolId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {toolId === 'age-calc' && 'Age Calculator (বয়স নির্ণয়)'}
              {toolId === 'bmi-calc' && 'BMI Calculator (স্বাস্থ্য মাপক)'}
              {toolId === 'currency-converter' && 'Currency Converter (মুদ্রা রূপান্তর)'}
              {toolId === 'love-match' && 'Love Match (প্রেমের শতকরা)'}
              {toolId === 'password-gen' && 'Password Generator (পাসওয়ার্ড)'}
              {toolId === 'blood-group' && 'Blood Group Finder (রক্তের গ্রুপ)'}
              {toolId === 'qr-generator' && 'QR Code Generator (কিউআর কোড)'}
              {toolId === 'random-picker' && 'Random Movie Picker (লটারি)'}
              {toolId === 'bangla-date' && 'Bangla Calendar (বাংলা তারিখ)'}
              {toolId === 'download-speed' && 'Movie Speed Estimator (সময় হিসাব)'}
            </h3>
          </div>
          <button 
            id="close-tool-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div>
          {toolId === 'age-calc' && <AgeCalculatorComponent />}
          {toolId === 'bmi-calc' && <BmiCalculatorComponent />}
          {toolId === 'currency-converter' && <CurrencyConverterComponent />}
          {toolId === 'love-match' && <LoveMatchComponent />}
          {toolId === 'password-gen' && <PasswordGenComponent />}
          {toolId === 'blood-group' && <BloodGroupComponent />}
          {toolId === 'qr-generator' && <QrGeneratorComponent />}
          {toolId === 'random-picker' && <RandomPickerComponent />}
          {toolId === 'bangla-date' && <BanglaDateComponent />}
          {toolId === 'download-speed' && <SpeedEstimatorComponent />}
        </div>
      </div>
    </div>
  );
};

// 1. Age Calculator
const AgeCalculatorComponent = () => {
  const [birthDate, setBirthDate] = useState('2002-05-15');
  const [result, setResult] = useState<{ years: number; months: number; days: number; totalDays: number; nextBdayDays: number } | null>(null);

  const calculateAge = () => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (today > nextBirthday) {
      nextBirthday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const nextBdayDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    setResult({ years, months, days, totalDays, nextBdayDays });
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">আপনার জন্ম তারিখ নির্বাচন করুন:</label>
        <input 
          id="birth-date-input"
          type="date" 
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
        />
      </div>
      <button 
        id="calc-age-btn"
        onClick={calculateAge}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium hover:opacity-95 shadow-lg shadow-amber-500/20"
      >
        বয়স হিসাব করুন
      </button>

      {result && (
        <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/30 space-y-2 animate-in fade-in">
          <div className="text-center font-bold text-xl text-amber-400">
            {result.years} বছর, {result.months} মাস, {result.days} দিন
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-slate-300">
            <div className="bg-slate-900/60 p-2 rounded-lg text-center">
              <span className="text-slate-400 block">মোট অতিক্রান্ত দিন:</span>
              <span className="font-semibold text-white text-sm">{result.totalDays.toLocaleString()} দিন</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg text-center">
              <span className="text-slate-400 block">পরবর্তী জন্মদিন বাকি:</span>
              <span className="font-semibold text-rose-400 text-sm">{result.nextBdayDays} দিন</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. BMI Calculator
const BmiCalculatorComponent = () => {
  const [height, setHeight] = useState('170'); // cm
  const [weight, setWeight] = useState('65'); // kg
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string; color: string; advice: string } | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const bmi = +(w / (h * h)).toFixed(1);
    let category = 'স্বাভাবিক ওজন (Normal)';
    let color = 'text-emerald-400';
    let advice = 'আপনার ওজন একদম আদর্শ সীমার মধ্যে রয়েছে। পুষ্টিকর খাবার ও নিয়মিত ব্যায়াম বজায় রাখুন।';

    if (bmi < 18.5) {
      category = 'কম ওজন (Underweight)';
      color = 'text-sky-400';
      advice = 'পুষ্টিকর খাদ্য গ্রহণ করুন এবং পর্যাপ্ত ক্যালোরি বাড়ান।';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'অতিরিক্ত ওজন (Overweight)';
      color = 'text-amber-400';
      advice = 'হালকা শরীরচর্চা করুন ও মিষ্টি/চর্বিযুক্ত খাবার কিছুটা কমান।';
    } else if (bmi >= 30) {
      category = 'স্থূলতা (Obesity)';
      color = 'text-rose-400';
      advice = 'নিয়মিত হাঁটাচলা ও স্বাস্থ্যকর ডায়েট প্ল্যান অনুসরণ করা প্রয়োজন।';
    }

    setBmiResult({ bmi, category, color, advice });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">উচ্চতা (Height in CM):</label>
          <input 
            type="number" 
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="170"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">ওজন (Weight in KG):</label>
          <input 
            type="number" 
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="65"
          />
        </div>
      </div>
      <button 
        id="calc-bmi-btn"
        onClick={calculateBMI}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:opacity-95 shadow-lg shadow-emerald-500/20"
      >
        BMI হিসাব করুন
      </button>

      {bmiResult && (
        <div className="p-4 rounded-xl bg-slate-800/80 border border-emerald-500/30 space-y-2 text-center">
          <div className="text-3xl font-extrabold text-white">{bmiResult.bmi}</div>
          <div className={`font-bold text-sm ${bmiResult.color}`}>{bmiResult.category}</div>
          <p className="text-xs text-slate-300 pt-2 border-t border-white/10">{bmiResult.advice}</p>
        </div>
      )}
    </div>
  );
};

// 3. Currency Converter
const CurrencyConverterComponent = () => {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('BDT');
  const [to, setTo] = useState('USD');

  const rates: Record<string, number> = {
    BDT: 1,
    USD: 122.5,
    EUR: 132.8,
    INR: 1.45,
    SAR: 32.6,
    AED: 33.3,
    MYR: 27.8,
    GBP: 155.2
  };

  const calculateConverted = () => {
    const num = parseFloat(amount) || 0;
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;
    // convert to BDT first then to target
    const bdt = num * fromRate;
    const result = bdt / toRate;
    return result.toFixed(2);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">পরিমাণ (Amount):</label>
        <input 
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white text-lg font-semibold focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 items-center">
        <div>
          <label className="block text-xs text-slate-400 mb-1">থেকে (From):</label>
          <select 
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white"
          >
            {Object.keys(rates).map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">রূপান্তর হবে (To):</label>
          <select 
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white"
          >
            {Object.keys(rates).map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-800/80 border border-cyan-500/30 text-center">
        <span className="text-xs text-slate-400 block mb-1">বর্তমান আনুমানিক মান:</span>
        <div className="text-2xl font-bold text-cyan-400">
          {amount} {from} = <span className="text-white">{calculateConverted()}</span> {to}
        </div>
      </div>
    </div>
  );
};

// 4. Love Match
const LoveMatchComponent = () => {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const calculateLove = () => {
    if (!name1.trim() || !name2.trim()) return;
    const combined = (name1 + name2).toLowerCase();
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash * 31 + combined.charCodeAt(i)) % 100;
    }
    const score = 65 + (hash % 35); // 65% to 99%
    setMatchScore(score);
    confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">প্রথম ব্যক্তির নাম:</label>
        <input 
          type="text" 
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          placeholder="যেমন: সিফাত"
          className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">দ্বিতীয় ব্যক্তির নাম:</label>
        <input 
          type="text" 
          value={name2}
          onChange={(e) => setName2(e.target.value)}
          placeholder="যেমন: অনুষ্কা"
          className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
        />
      </div>
      <button 
        id="check-love-btn"
        onClick={calculateLove}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium hover:opacity-95 shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
      >
        <Heart className="w-4 h-4 fill-white" /> সামঞ্জস্য পরীক্ষা করুন
      </button>

      {matchScore !== null && (
        <div className="p-4 rounded-xl bg-slate-800/80 border border-rose-500/30 text-center space-y-2">
          <div className="text-4xl font-black text-rose-400 animate-bounce">{matchScore}%</div>
          <p className="text-sm font-semibold text-white">
            {matchScore > 85 ? '💖 অসাধারণ ও নিখুঁত জুটি! আপনাদের বন্ধন চিরকাল অটুট থাকুক।' : '💞 সুন্দর সামঞ্জস্য! একে অপরকে ভালোবাসা ও সময় দিন।'}
          </p>
        </div>
      )}
    </div>
  );
};

// 5. Password Generator
const PasswordGenComponent = () => {
  const [length, setLength] = useState(12);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+';
    let res = '';
    for (let i = 0; i < length; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">দৈর্ঘ্য: {length} অক্ষর</label>
        <input 
          type="range" 
          min="8" 
          max="24" 
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </div>
      <button 
        id="gen-pwd-btn"
        onClick={generate}
        className="w-full py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500"
      >
        নতুন পাসওয়ার্ড তৈরি করুন
      </button>

      {password && (
        <div className="flex items-center justify-between p-3 bg-slate-800 border border-indigo-500/30 rounded-xl">
          <span className="font-mono text-sm text-emerald-400 font-semibold truncate mr-2">{password}</span>
          <button 
            onClick={copyToClipboard}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};

// 6. Blood Group Component
const BloodGroupComponent = () => {
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const info: Record<string, { canGive: string; canReceive: string; notes: string }> = {
    'O+': { canGive: 'O+, A+, B+, AB+', canReceive: 'O+, O-', notes: 'সর্বাধিক চাহিদাসম্পন্ন রক্তের গ্রুপ।' },
    'O-': { canGive: 'সকল রক্ত গ্রুপ (Universal Donor)', canReceive: 'শুধুমাত্র O-', notes: 'যেকোনো ব্যক্তিকে জরুরি মুহূর্তে দেওয়া যায়।' },
    'A+': { canGive: 'A+, AB+', canReceive: 'A+, A-, O+, O-', notes: 'সাধারণ ও গুরুত্বপূর্ণ রক্ত গ্রুপ।' },
    'A-': { canGive: 'A+, A-, AB+, AB-', canReceive: 'A-, O-', notes: 'তুলনামূলকভাবে বিরল।' },
    'B+': { canGive: 'B+, AB+', canReceive: 'B+, B-, O+, O-', notes: 'বাংলাদেশে প্রচুর ডোনার সহজলভ্য।' },
    'B-': { canGive: 'B+, B-, AB+, AB-', canReceive: 'B-, O-', notes: 'জরুরি প্রয়োজনে আগে থেকে ডোনার রাখা ভালো।' },
    'AB+': { canGive: 'শুধুমাত্র AB+', canReceive: 'সকল গ্রুপ (Universal Recipient)', notes: 'যেকোনো গ্রুপ থেকে রক্ত গ্রহণ করতে পারে।' },
    'AB-': { canGive: 'AB+, AB-', canReceive: 'A-, B-, AB-, O-', notes: 'বিশ্বের সবচেয়ে বিরল রক্ত গ্রুপগুলোর একটি।' }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {Object.keys(info).map(grp => (
          <button
            key={grp}
            onClick={() => setSelectedGroup(grp)}
            className={`py-2 rounded-xl text-sm font-bold transition-all ${
              selectedGroup === grp 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {grp}
          </button>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-slate-800/80 border border-red-500/30 space-y-2 text-xs">
        <div className="text-base font-bold text-red-400">{selectedGroup} গ্রুপের বিবরণ:</div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg">
          <span className="text-slate-400 block font-medium">রক্ত দিতে পারবেন (Can Donate To):</span>
          <span className="text-white font-semibold text-sm">{info[selectedGroup].canGive}</span>
        </div>
        <div className="bg-slate-900/60 p-2.5 rounded-lg">
          <span className="text-slate-400 block font-medium">রক্ত নিতে পারবেন (Can Receive From):</span>
          <span className="text-emerald-400 font-semibold text-sm">{info[selectedGroup].canReceive}</span>
        </div>
        <p className="text-slate-300 italic pt-1">{info[selectedGroup].notes}</p>
      </div>
    </div>
  );
};

// 7. QR Generator Component
const QrGeneratorComponent = () => {
  const [text, setText] = useState('https://movielink.bot');
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;

  return (
    <div className="space-y-4 text-center">
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="লিংক বা টেক্সট লিখুন..."
        className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500"
      />
      <div className="flex justify-center p-3 bg-white rounded-xl shadow-inner max-w-[200px] mx-auto">
        <img src={qrUrl} alt="Generated QR" className="w-40 h-40 object-contain" />
      </div>
      <a 
        href={qrUrl} 
        download="qrcode.png" 
        target="_blank" 
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl"
      >
        <Download className="w-3.5 h-3.5" /> ডাউনলোড QR কোড
      </a>
    </div>
  );
};

// 8. Random Movie Picker Component
const RandomPickerComponent = () => {
  const [options, setOptions] = useState('ভানুপ্রিয়া ভূতের হোটেল, ব্যাচেলর পয়েন্ট ১১২, তুফান, টক্সিক, রঘু ডাকাত, সোলো লেভেলিং');
  const [selected, setSelected] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const pickRandom = () => {
    const list = options.split(',').map(s => s.trim()).filter(Boolean);
    if (!list.length) return;

    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomItem = list[Math.floor(Math.random() * list.length)];
      setSelected(randomItem);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({ particleCount: 40, spread: 70 });
      }
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1">মুভি বা অপশনগুলো লিখুন (কমা দিয়ে আলাদা করুন):</label>
        <textarea 
          value={options}
          onChange={(e) => setOptions(e.target.value)}
          rows={3}
          className="w-full bg-slate-800/90 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-violet-500"
        />
      </div>
      <button 
        id="spin-random-btn"
        disabled={isSpinning}
        onClick={pickRandom}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-medium hover:opacity-95 shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2"
      >
        <Dices className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
        {isSpinning ? 'বাছাই করা হচ্ছে...' : 'লটারি করে নির্বাচন করুন'}
      </button>

      {selected && (
        <div className="p-4 rounded-xl bg-slate-800/80 border border-violet-500/30 text-center">
          <span className="text-xs text-slate-400 block mb-1">আজকে আপনার দেখার জন্য নির্বাচিত:</span>
          <div className="text-xl font-extrabold text-violet-400">{selected}</div>
        </div>
      )}
    </div>
  );
};

// 9. Bangla Date Component
const BanglaDateComponent = () => {
  const banglaMonths = ['বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন', 'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'];
  const seasons = ['গ্রীষ্ম', 'বর্ষা', 'শরৎ', 'হেমন্ত', 'শীত', 'বসন্ত'];

  // Current Bangla Year approximation (Bengali era = Gregorian - 593)
  const today = new Date();
  const currentBanglaYear = today.getFullYear() - 593;

  return (
    <div className="space-y-3 text-center">
      <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 space-y-1">
        <div className="text-xs text-amber-400 font-semibold">আজকের বাংলা তারিখ (আনুমানিক):</div>
        <div className="text-2xl font-black text-white">০৬ ভাদ্র, ১৪৩১ বঙ্গাব্দ</div>
        <div className="text-xs text-slate-300">ঋতু: বর্ষাকাল 🌧️</div>
      </div>
      <div className="text-left text-xs text-slate-400 bg-slate-800/60 p-3 rounded-xl">
        <span className="font-semibold text-slate-200 block mb-1">বাংলা ১২ মাসের নাম:</span>
        <p>{banglaMonths.join(' • ')}</p>
      </div>
    </div>
  );
};

// 10. Speed Estimator Component
const SpeedEstimatorComponent = () => {
  const [fileSizeMB, setFileSizeMB] = useState('1285'); // 1.28 GB
  const [speedMbps, setSpeedMbps] = useState('10'); // 10 Mbps

  const calculateTime = () => {
    const mb = parseFloat(fileSizeMB) || 0;
    const mbps = parseFloat(speedMbps) || 1;
    // 1 Byte = 8 bits, so MBps = Mbps / 8
    const downloadSpeedMBps = mbps / 8;
    const totalSeconds = mb / downloadSpeedMBps;
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return { mins, secs, totalSeconds };
  };

  const { mins, secs } = calculateTime();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-300 mb-1">ফাইলের সাইজ (MB):</label>
          <input 
            type="number" 
            value={fileSizeMB}
            onChange={(e) => setFileSizeMB(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-300 mb-1">ইন্টারনেট স্পিড (Mbps):</label>
          <input 
            type="number" 
            value={speedMbps}
            onChange={(e) => setSpeedMbps(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm"
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-800/80 border border-blue-500/30 text-center">
        <span className="text-xs text-slate-400 block mb-1">ডাউনলোড হতে সময় লাগবে:</span>
        <div className="text-2xl font-bold text-blue-400">
          {mins > 0 ? `${mins} মিনিট ` : ''}{secs} সেকেন্ড
        </div>
      </div>
    </div>
  );
};
