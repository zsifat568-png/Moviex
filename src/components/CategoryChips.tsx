import React from 'react';
import { SupportedLanguage, getTranslation } from '../utils/translations';

export interface CategoryChipItem {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryChipsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categories?: CategoryChipItem[];
  totalCount?: number;
  language?: SupportedLanguage;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
  categories,
  totalCount,
  language = 'en'
}) => {
  const t = (key: string) => getTranslation(language, key);

  // Default categories from pure TMDB cinema categories
  const defaultCategories: CategoryChipItem[] = [
    { id: 'all', label: `${t('cat_all') || 'All'} ${totalCount ? `(${totalCount})` : ''}`, icon: '🎬' },
    { id: 'bengali', label: t('cat_bangla') || 'Bangla', icon: '🇧🇩' },
    { id: 'bollywood', label: t('cat_bollywood') || 'Bollywood', icon: '🇮🇳' },
    { id: 'hollywood', label: t('cat_hollywood') || 'Hollywood', icon: '🇺🇸' },
    { id: 'south', label: t('cat_south') || 'South Indian', icon: '💥' },
    { id: 'anime', label: t('cat_anime') || 'Anime', icon: '⚡' }
  ];

  const chipList = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {(chipList || []).map(cat => {
        const isSelected = selectedCategory === cat.id;

        return (
          <button
            key={cat.id}
            id={`cat-chip-${cat.id}`}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-1 ring-rose-400'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10'
            }`}
          >
            {cat.icon && <span>{cat.icon}</span>}
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};
