import React from 'react';
import { getSeasonNotes } from '../../data/seasonNotes';

interface Props {
  activeSeason: number;
}

const SeasonNotes: React.FC<Props> = ({ activeSeason }) => {
  const notes = getSeasonNotes(activeSeason);
  if (notes.length === 0) return null;

  return (
    <div className="mx-3 mt-2 mb-1 rounded border border-amber-200 bg-amber-50 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-1.5">
        {activeSeason} scoring notes
      </div>
      <ul className="space-y-1.5">
        {notes.map((note, i) => (
          <li key={i} className="text-[12px] leading-snug text-gray-700">
            <span className="font-semibold text-gray-900">{note.title}.</span>{' '}
            {note.detail}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SeasonNotes;
