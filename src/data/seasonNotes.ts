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

const INDY_500_NOTE = (round: string, winner: string): SeasonNote => ({
  scope: 'race',
  raceId: 'indianapolis-500',
  title: 'Indianapolis 500 — drivers only',
  detail:
    `The Indy 500 (${round}) counted towards the Drivers' Championship, ${winner}, but not the Constructors' Cup, so its roadster teams score nothing in the team table. Its 33-car field is shown only as deep as the Grand Prix grid; nobody below the points finished high enough to score.`,
});

export const SEASON_NOTES: Record<number, SeasonNote[]> = {
  1958: [
    {
      scope: 'season',
      title: 'Fastest-lap point and the Constructors\' Cup',
      detail:
        'Drivers scored a point for fastest lap wherever they finished, even after retiring. The first Constructors\' Cup counted only each team\'s best-placed car, without the fastest-lap point.',
    },
    INDY_500_NOTE('round 4', 'so Jimmy Bryan\'s win is in the drivers\' standings'),
    {
      scope: 'race',
      raceId: 'german',
      title: 'German GP — Formula 2 class',
      detail:
        'Bruce McLaren finished 5th overall in a Formula 2 Cooper, which was not eligible for championship points, so his 5th scores nothing.',
    },
    {
      scope: 'race',
      raceId: 'italian',
      title: 'Italian GP — shared car',
      detail:
        'Carroll Shelby and Masten Gregory shared the Maserati that finished 4th. From 1958 a shared drive scored no points, so neither scores. The grid shows the first driver only (Brooks and Lewis-Evans also shared a Vanwall at the French GP, outside the points).',
    },
  ],

  1959: [
    {
      scope: 'season',
      title: 'Fastest-lap point and the Constructors\' Cup',
      detail:
        'Drivers scored a point for fastest lap wherever they finished. The Constructors\' Cup counted only each team\'s best-placed car, without the fastest-lap point.',
    },
    INDY_500_NOTE('round 2', 'so Rodger Ward\'s win is in the drivers\' standings'),
    {
      scope: 'race',
      raceId: 'french',
      title: 'French GP — Moss disqualified, fastest lap kept',
      detail:
        'Stirling Moss was disqualified for a push start but kept the fastest-lap point, which counts in his best-five total. He appears at his classified position, 12th.',
    },
    {
      scope: 'race',
      raceId: 'british',
      title: 'British GP — shared fastest lap',
      detail:
        'Moss and Bruce McLaren set the same fastest lap, so the point was split: 6.5 for Moss (2nd) and 4.5 for McLaren (3rd).',
    },
  ],

  1960: [
    INDY_500_NOTE('round 3', 'so Jim Rathmann\'s win is in the drivers\' standings'),
    {
      scope: 'race',
      raceId: 'argentine',
      title: 'Argentine GP — shared car',
      detail:
        'Maurice Trintignant and Stirling Moss shared the Cooper that finished 3rd. A shared drive scored no points, so neither scores. The grid shows the first driver only.',
    },
  ],

  1961: [
    {
      scope: 'season',
      title: 'Constructors still paid 8 for a win',
      detail:
        'Drivers moved to 9 points for a win in 1961, but the Constructors\' Cup stayed on 8-6-4-3-2-1 for one more year and counted only each team\'s best-placed car.',
    },
  ],

  1963: [
    {
      scope: 'race',
      raceId: 'french',
      title: 'French GP — Hill\'s 3rd scores nothing',
      detail:
        'Graham Hill finished 3rd but was given no points, penalised for a push start. The drivers behind him were not moved up.',
    },
  ],

  1966: [
    {
      scope: 'race',
      raceId: 'monaco',
      title: 'Monaco GP — only four finishers scored',
      detail:
        'Only four cars were classified. Richie Ginther (listed 5th after retiring) and Guy Ligier (running, but too far behind) score nothing.',
    },
    {
      scope: 'race',
      raceId: 'belgian',
      title: 'Belgian GP — Ligier not classified',
      detail:
        'Guy Ligier was running at the finish but too far behind to be classified, so he scores nothing.',
    },
  ],

  1967: [
    {
      scope: 'race',
      raceId: 'german',
      title: 'German GP — Formula 2 cars in the field',
      detail:
        'Formula 2 cars ran alongside the F1 field. F1 cars were scored by their position among F1 cars only, so Jackie Oliver (F2) scores nothing and Jo Bonnier and Guy Ligier take the points for 5th and 6th.',
    },
  ],

  1968: [
    {
      scope: 'race',
      raceId: 'spanish',
      title: 'Spanish GP — 6th place not a finisher',
      detail: 'Bruce McLaren was classified 6th after retiring, which did not score.',
    },
    {
      scope: 'race',
      raceId: 'monaco',
      title: 'Monaco GP — 6th place not a finisher',
      detail: 'John Surtees was classified 6th after retiring, which did not score.',
    },
  ],

  1970: [
    {
      scope: 'race',
      raceId: 'spanish',
      title: 'Spanish GP — 6th place not a finisher',
      detail: 'John Surtees was classified 6th after retiring, which did not score.',
    },
  ],

  1975: [
    {
      scope: 'race',
      raceId: 'spanish',
      title: 'Spanish GP — half points',
      detail:
        'Stopped after 29 laps when Rolf Stommelen\'s crash killed spectators. Under 60% distance, so all positions get half points. Lella Lombardi\'s 6th earned half a point.',
    },
    {
      scope: 'race',
      raceId: 'austrian',
      title: 'Austrian GP — half points',
      detail:
        'Stopped early in torrential rain with Vittorio Brambilla leading. Under 60% distance, so all positions get half points, which is why Lauda\'s total ends in .5.',
    },
  ],

  1984: [
    {
      scope: 'race',
      raceId: 'monaco',
      title: 'Monaco GP — half points',
      detail:
        'Stopped after 31 laps in torrential rain (with Senna closing fast on Prost). Under two race distance, so all positions get half points — which is why several 1984 totals end in .5 and Prost lost the title to Lauda by half a point (71.5 to 72).',
    },
  ],

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
