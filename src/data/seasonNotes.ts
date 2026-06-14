// Per-season "footnotes" — things that explain why the app's standings/data
// look the way they do for a given year. Surfaced to users via the in-app
// SeasonNotes button (next to the SeasonSelector) and rendered statically
// into each year page's SEO content for crawlers.
//
// Keep entries focused on **data-impacting quirks** the user might wonder about,
// not general season narrative (that lives in each year page's highlights list).

export type NoteScope = 'season' | 'race' | 'team';

export interface SeasonNote {
  scope: NoteScope;
  // For race-scoped notes: matches the raceId used in pastResults keys
  // (e.g. 'united-states' for the 2005 USA GP). Derived from raceName by
  // .toLowerCase().replace(' grand prix', '').replace(/\s+/g, '-') in jolpica.ts.
  raceId?: string;
  // For team-scoped notes: matches the Ergast/Jolpica constructorId.
  teamId?: string;
  title: string;
  detail: string;
}

export const SEASON_NOTES: Record<number, SeasonNote[]> = {
  2005: [
    {
      scope: 'race',
      raceId: 'united-states',
      title: 'Indianapolis 6-car race',
      detail:
        '14 Michelin runners withdrew on the formation lap. Jolpica lists them at P7–P20; we drop "Withdrew" results so they score 0 (not 2pts for P7, 1pt for P8).',
    },
    {
      scope: 'team',
      teamId: 'bar',
      title: 'BAR 2-race ban',
      detail:
        'Excluded at Imola, banned from Spain and Monaco. Their drivers don\'t appear in those races\' results, so they score 0 — no override needed.',
    },
  ],

  2006: [
    {
      scope: 'season',
      title: 'MF1 → Spyker MF1 mid-season',
      detail:
        'Spyker bought the team and renamed it from round 15 (Italy). MF1 and Spyker MF1 are merged into a single team total in the standings.',
    },
  ],

  2007: [
    {
      scope: 'team',
      teamId: 'mclaren',
      title: 'McLaren stripped (Spygate)',
      detail:
        'Full-season Constructors\' exclusion → McLaren shows 0 in the team table. Driver points kept: Hamilton 109, Alonso 109.',
    },
  ],

  2009: [
    {
      scope: 'race',
      raceId: 'malaysian',
      title: 'Half points',
      detail:
        'Red-flagged at lap 31/56 (rain). All positions get half points — winner Button scores 5, not 10.',
    },
  ],

  2014: [
    {
      scope: 'race',
      raceId: 'abu-dhabi',
      title: 'Double points finale',
      detail:
        'One-off 2014 rule: every position pays 2× at the season-ender. Winner 50, P2 36, P10 2.',
    },
  ],

  2018: [
    {
      scope: 'team',
      teamId: 'force_india',
      title: 'Constructor points wiped at round 13',
      detail:
        'Administration → FIA zeroed Force India\'s Constructors\' total before Belgium. Rounds 13+ count under "Racing Point Force India". Drivers kept all their points.',
    },
  ],

  2021: [
    {
      scope: 'race',
      raceId: 'belgian',
      title: 'Half points (2 laps under SC)',
      detail:
        'Race halted after two safety-car laps (rain). All positions get half points — Verstappen wins with 12.5.',
    },
  ],
};

export const getSeasonNotes = (year: number): SeasonNote[] => SEASON_NOTES[year] || [];
export const hasSeasonNotes = (year: number): boolean => (SEASON_NOTES[year]?.length ?? 0) > 0;
