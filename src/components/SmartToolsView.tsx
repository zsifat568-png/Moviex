import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Search, Calculator, Activity, CircleDollarSign, 
  Heart, KeyRound, Droplet, QrCode, Dices, CalendarDays, Zap 
} from 'lucide-react';
import { SMART_TOOLS } from '../data/toolsData';
import { ToolModalContainer } from './tools/ToolModals';
import { SupportedLanguage, getTranslation } from '../utils/translations';

interface SmartToolsViewProps {
  language?: SupportedLanguage;
}

export const SmartToolsView: React.FC<SmartToolsViewProps> = ({ language = 'en' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const t = (key: string) => getTranslation(language, key);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-6 h-6" />;
      case 'Activity': return <Activity className="w-6 h-6" />;
      case 'CircleDollarSign': return <CircleDollarSign className="w-6 h-6" />;
      case 'Heart': return <Heart className="w-6 h-6" />;
      case 'KeyRound': return <KeyRound className="w-6 h-6" />;
      case 'Droplet': return <Droplet className="w-6 h-6" />;
      case 'QrCode': return <QrCode className="w-6 h-6" />;
      case 'Dices': return <Dices className="w-6 h-6" />;
      case 'CalendarDays': return <CalendarDays className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const q = (searchQuery || '').toLowerCase();
  const filteredTools = SMART_TOOLS.filter(tool => 
    (tool.nameBn && tool.nameBn.toLowerCase().includes(q)) ||
    (tool.nameEn && tool.nameEn.toLowerCase().includes(q)) ||
    (tool.descriptionBn && tool.descriptionBn.toLowerCase().includes(q))
  );

  const popularTools = filteredTools.filter(item => item.category === 'popular');
  const utilityTools = filteredTools.filter(item => item.category === 'utility');
  const exclusiveTools = filteredTools.filter(item => item.category === 'exclusive');

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="text-center space-y-1 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20 mb-1">
          <Sparkles className="w-3.5 h-3.5" /> {t('tools_title')}
        </div>
        <h2 className="text-xl font-extrabold text-white">✨ {t('tools_title')} ✨</h2>
        <p className="text-xs text-slate-400">{t('tools_subtitle')}</p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full bg-slate-900/80 border border-white/10 focus:border-rose-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none backdrop-blur-md"
        />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 text-center backdrop-blur-md">
          <div className="text-2xl font-black text-white">20</div>
          <div className="text-[10px] font-semibold text-slate-400">Total Tools</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 text-center backdrop-blur-md">
          <div className="text-2xl font-black text-cyan-400">7</div>
          <div className="text-[10px] font-semibold text-slate-400">New Added</div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 text-center backdrop-blur-md">
          <div className="text-2xl font-black text-emerald-400">100%</div>
          <div className="text-[10px] font-semibold text-slate-400">Free</div>
        </div>
      </div>

      {/* Popular Tools Section */}
      {popularTools.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🔥</span> Popular Tools
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popularTools.map(tool => (
              <div
                key={tool.id}
                id={`tool-card-${tool.id}`}
                onClick={() => setActiveToolId(tool.id)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-rose-500/40 cursor-pointer transition-all duration-200 shadow-lg group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.accentColor} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                  {getToolIcon(tool.iconName)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {language === 'bn' ? tool.nameBn : tool.nameEn}
                    </h4>
                    {tool.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {language === 'bn' ? tool.descriptionBn : tool.nameEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Utility Tools Section */}
      {utilityTools.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>💡</span> Utility Tools
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {utilityTools.map(tool => (
              <div
                key={tool.id}
                id={`tool-card-${tool.id}`}
                onClick={() => setActiveToolId(tool.id)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-rose-500/40 cursor-pointer transition-all duration-200 shadow-lg group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.accentColor} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                  {getToolIcon(tool.iconName)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {language === 'bn' ? tool.nameBn : tool.nameEn}
                    </h4>
                    {tool.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {language === 'bn' ? tool.descriptionBn : tool.nameEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exclusive Tools Section */}
      {exclusiveTools.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>🌟</span> Exclusive Tools
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exclusiveTools.map(tool => (
              <div
                key={tool.id}
                id={`tool-card-${tool.id}`}
                onClick={() => setActiveToolId(tool.id)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-rose-500/40 cursor-pointer transition-all duration-200 shadow-lg group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tool.accentColor} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0`}>
                  {getToolIcon(tool.iconName)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                      {language === 'bn' ? tool.nameBn : tool.nameEn}
                    </h4>
                    {tool.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {language === 'bn' ? tool.descriptionBn : tool.nameEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Modal */}
      <ToolModalContainer toolId={activeToolId} onClose={() => setActiveToolId(null)} />
    </div>
  );
};
