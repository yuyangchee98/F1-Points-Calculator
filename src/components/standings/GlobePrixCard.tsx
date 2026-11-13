import React from 'react';
import { useSelector } from 'react-redux';
import { selectRaces } from '../../store/selectors/dataSelectors';
import { GLOBE_PRIX_HOME, globePrixCountry, globePrixHref, nextRace } from '../../utils/globePrix';

/**
 * A card under the standings that points at the next race's country in Globe
 * Prix. The race comes from the season already loaded, against today's date;
 * once that season's last race has started (or on any past season) it links to
 * the Globe Prix home page instead.
 *
 * Clicks are counted by SiteSpine's house-ad listener via data-ad /
 * data-ad-placement.
 */
const GlobePrixCard: React.FC = () => {
  const races = useSelector(selectRaces);
  const race = nextRace(races);
  const country = race ? globePrixCountry(race.country) : null;

  const title = country ? `Think you'd beat them in ${country.name}?` : "Think you'd beat them?";
  const body = country
    ? `Race ${country.name} in Globe Prix.`
    : 'Globe Prix has a track for every country. Race yours.';
  const button = country ? `Race ${country.name}` : 'Play Globe Prix';
  const href = country ? globePrixHref(race!.country) : GLOBE_PRIX_HOME;

  return (
    <div className="bg-surface rounded-lg shadow-xs overflow-hidden border">
      {/* Button under the text rather than beside it: "Race the United States"
          does not fit next to the copy in a 360-px sidebar without wrapping. */}
      <div className="p-3 flex items-start gap-3">
        <span className="text-lg leading-6" aria-hidden="true">🌍</span>
        <div className="flex-1 min-w-0 flex flex-col items-start gap-2">
          <div>
            <h3 className="text-sm font-display font-semibold text-ink">{title}</h3>
            <p className="text-xs text-ink-muted">{body}</p>
          </div>
          {/* noopener without noreferrer on purpose: Globe Prix needs the
              referrer to count these visits as the calculator's. */}
          {/* eslint-disable-next-line react/jsx-no-target-blank */}
          <a
            href={href}
            target="_blank"
            rel="noopener"
            data-ad="globeprix"
            data-ad-placement="standings"
            className="max-w-full text-center bg-brand hover:bg-brand-strong text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors"
          >
            {button}
          </a>
        </div>
      </div>
    </div>
  );
};

export default GlobePrixCard;
