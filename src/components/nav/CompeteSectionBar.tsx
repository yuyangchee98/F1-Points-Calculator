import React from 'react';
import type { CompeteTab } from '../../views/compete/useCompeteTab';
import { SECTION_BAR_CLASS } from './sectionBar';

/**
 * Compete's section bar — tier 2, the same slot the calculator gives its season
 * selector. Predict/Results/Leaderboard are movements within Compete, so they
 * belong here and not in the spine, which only ever switches sections.
 *
 * Full-bleed like the bar on every other section, with the contents constrained
 * to max-w-7xl so they line up with Compete's <main>.
 */
interface Props {
  tabs: { id: CompeteTab; label: string; icon: React.ReactNode }[];
  activeTab: CompeteTab;
  onChange: (tab: CompeteTab) => void;
}

const CompeteSectionBar: React.FC<Props> = ({ tabs, activeTab, onChange }) => (
  <div className={SECTION_BAR_CLASS}>
    <div className="max-w-7xl w-full mx-auto sm:px-2 lg:px-4 flex items-center gap-1">
      <nav className="flex items-center gap-1" aria-label="Compete views">
        {tabs.map((t) => {
          const selected = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={selected ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-sm font-medium transition-colors ${
                selected
                  ? 'bg-surface text-ink shadow-xs border'
                  : 'text-ink-secondary hover:text-ink hover:bg-carbon-100'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  </div>
);

export default CompeteSectionBar;
