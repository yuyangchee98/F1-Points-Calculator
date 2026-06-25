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
  1991: [
    {
      scope: 'race',
      raceId: 'australian',
      title: 'Australian GP — half points',
      detail:
        'The Adelaide finale was stopped after 14 laps (torrential rain) — the shortest race in F1 history. All positions get half points.',
    },
  ],

  1997: [
    {
      scope: 'season',
      title: 'Michael Schumacher excluded from the championship',
      detail:
        'After deliberately colliding with title rival Jacques Villeneuve at the Jerez finale, Schumacher was disqualified from the entire 1997 Drivers\' Championship. He keeps his race results (so Ferrari keep their Constructors\' points), but he is removed from the drivers\' standings despite scoring 78 points.',
    },
  ],

  2002: [
    {
      scope: 'team',
      teamId: 'arrows',
      title: 'Arrows withdrew mid-season',
      detail:
        'Arrows last raced at the German GP (round 11) before folding due to financial collapse. Later 2002 races ran with only 20 cars, so the grid shows empty slots.',
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
        'Full-season Constructors\' exclusion → McLaren shows 0 in the team table. Driver points kept.',
    },
  ],

  2009: [
    {
      scope: 'race',
      raceId: 'malaysian',
      title: 'Half points',
      detail:
        'Red-flagged at lap 31/56 (rain). All positions get half points.',
    },
  ],

  2014: [
    {
      scope: 'race',
      raceId: 'abu-dhabi',
      title: 'Double points finale',
      detail:
        'One-off 2014 rule: every position pays 2× at the season-ender.',
    },
  ],

  2018: [
    {
      scope: 'team',
      teamId: 'force_india',
      title: 'Force India team points wiped before Belgium',
      detail:
        'Administration → FIA zeroed Force India\'s Constructors\' total before Belgium. Only Belgium onwards counts towards their team total. Driver points are kept for the whole season.',
    },
  ],

  2020: [
    {
      scope: 'team',
      teamId: 'racing_point',
      title: 'Racing Point −15 (brake ducts)',
      detail:
        'Flat −15 applied to Racing Point\'s Constructors\' total (copied Mercedes brake ducts). Drivers unaffected.',
    },
  ],

  2021: [
    {
      scope: 'race',
      raceId: 'belgian',
      title: 'Belgian GP — half points (2 laps under SC)',
      detail:
        'Belgian GP halted after two safety-car laps (rain). All positions get half points.',
    },
  ],
};

export const getSeasonNotes = (year: number): SeasonNote[] => SEASON_NOTES[year] || [];
export const hasSeasonNotes = (year: number): boolean => (SEASON_NOTES[year]?.length ?? 0) > 0;
