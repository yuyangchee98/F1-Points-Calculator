import React from 'react';
import type { Race } from '../../types';

const SIZES = { sm: 'w-6 h-4', md: 'w-9 h-6' } as const;

/**
 * The /flags/{code}.webp image every Compete row and header leads with. Races
 * with no country code still get a blank box of the same size, so rows that
 * lay out on a grid keep their columns.
 */
const RaceFlag: React.FC<{ race: Pick<Race, 'countryCode' | 'country'>; size?: keyof typeof SIZES }> = ({
  race,
  size = 'sm',
}) =>
  race.countryCode ? (
    <img
      src={`/flags/${race.countryCode}.webp`}
      alt={race.country}
      className={`${SIZES[size]} object-cover rounded-sm shadow-xs flex-shrink-0`}
    />
  ) : (
    <span className={`${SIZES[size]} rounded-sm bg-carbon-200 flex-shrink-0`} aria-hidden="true" />
  );

export default RaceFlag;
