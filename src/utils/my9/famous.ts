/**
 * The famous races: starred in the list and behind the "famous" chip, with the
 * words people search them by and the drivers they remember them for.
 *
 * Keyed by season + raceId (the results key), never by round, and every id was
 * checked against the catalog — a race or driver that does not resolve is
 * dropped at load, never shown. Note that a disqualified driver is not a starter
 * in the results (Senna, Suzuka 1989), so they cannot be suggested here.
 */
export interface FamousRace {
  y: number;
  race: string;
  /** Extra search words: nicknames, conditions, what happened. */
  tags: string;
  /** Who people remember it for, most likely first. */
  drivers: string[];
}

export const FAMOUS: FamousRace[] = [
  { y: 2021, race: 'abu-dhabi', tags: 'title decider safety car last lap masi', drivers: ['max_verstappen', 'hamilton'] },
  { y: 2008, race: 'brazilian', tags: 'title decider last corner glock rain', drivers: ['hamilton', 'massa', 'glock'] },
  { y: 1984, race: 'monaco', tags: 'rain red flag toleman half points', drivers: ['senna', 'prost'] },
  { y: 1993, race: 'european', tags: 'donington rain first lap', drivers: ['senna'] },
  { y: 2011, race: 'canadian', tags: 'rain longest race last lap', drivers: ['button', 'vettel'] },
  { y: 1976, race: 'japanese', tags: 'fuji rain monsoon title decider', drivers: ['hunt', 'lauda', 'mario_andretti'] },
  { y: 2016, race: 'brazilian', tags: 'rain wet', drivers: ['max_verstappen', 'hamilton'] },
  { y: 2008, race: 'singapore', tags: 'crashgate night race', drivers: ['alonso', 'piquet_jr', 'massa'] },
  { y: 1979, race: 'french', tags: 'dijon duel wheel to wheel first turbo win', drivers: ['gilles_villeneuve', 'arnoux', 'jabouille'] },
  { y: 1986, race: 'australian', tags: 'adelaide tyre blowout title decider', drivers: ['prost', 'mansell', 'piquet'] },
  { y: 2012, race: 'brazilian', tags: 'title decider rain spin', drivers: ['vettel', 'button', 'alonso'] },
  { y: 1991, race: 'brazilian', tags: 'interlagos home win sixth gear', drivers: ['senna'] },
  { y: 2005, race: 'japanese', tags: 'suzuka last lap overtake 17th', drivers: ['raikkonen', 'fisichella', 'alonso'] },
  { y: 1998, race: 'belgian', tags: 'spa rain pile up jordan one two', drivers: ['damon_hill', 'michael_schumacher', 'coulthard'] },
  { y: 2020, race: 'italian', tags: 'monza red flag first win', drivers: ['gasly', 'sainz'] },
  { y: 2016, race: 'spanish', tags: 'mercedes crash first win teenager', drivers: ['max_verstappen', 'rosberg', 'hamilton'] },
  { y: 2003, race: 'brazilian', tags: 'rain red flag first win', drivers: ['fisichella', 'raikkonen', 'alonso'] },
  { y: 2006, race: 'hungarian', tags: 'rain first win', drivers: ['button'] },
  { y: 2020, race: 'turkish', tags: 'seventh title wet', drivers: ['hamilton'] },
  { y: 2024, race: 'são-paulo', tags: 'brazil interlagos rain 17th', drivers: ['max_verstappen'] },
  { y: 1990, race: 'japanese', tags: 'suzuka first corner title decider', drivers: ['senna', 'prost'] },
  { y: 1988, race: 'japanese', tags: 'suzuka stall title decider', drivers: ['senna', 'prost'] },
  { y: 1992, race: 'monaco', tags: 'last laps defence', drivers: ['senna', 'mansell'] },
  { y: 1985, race: 'portuguese', tags: 'estoril rain first win', drivers: ['senna'] },
  { y: 2007, race: 'brazilian', tags: 'title decider one point', drivers: ['raikkonen', 'hamilton', 'alonso'] },
  { y: 2010, race: 'abu-dhabi', tags: 'title decider four way', drivers: ['vettel', 'alonso'] },
  { y: 1997, race: 'european', tags: 'jerez title decider collision', drivers: ['villeneuve', 'michael_schumacher'] },
  { y: 1994, race: 'australian', tags: 'adelaide title decider collision', drivers: ['michael_schumacher', 'damon_hill', 'mansell'] },
  { y: 1994, race: 'san-marino', tags: 'imola', drivers: ['senna', 'michael_schumacher'] },
  { y: 2000, race: 'japanese', tags: 'suzuka title decider ferrari', drivers: ['michael_schumacher', 'hakkinen'] },
  { y: 2000, race: 'belgian', tags: 'spa overtake zonta', drivers: ['hakkinen', 'michael_schumacher'] },
  { y: 1996, race: 'spanish', tags: 'rain first ferrari win', drivers: ['michael_schumacher'] },
  { y: 1999, race: 'european', tags: 'nurburgring chaos rain', drivers: ['herbert'] },
  { y: 1971, race: 'italian', tags: 'monza closest finish slipstream', drivers: ['gethin', 'peterson'] },
  { y: 1969, race: 'italian', tags: 'monza slipstream title decider', drivers: ['stewart'] },
  { y: 1961, race: 'italian', tags: 'monza title decider', drivers: ['phil_hill', 'trips'] },
  { y: 1958, race: 'moroccan', tags: 'title decider', drivers: ['hawthorn', 'moss'] },
  { y: 1967, race: 'dutch', tags: 'zandvoort cosworth dfv debut', drivers: ['clark'] },
  { y: 1968, race: 'german', tags: 'nurburgring fog rain', drivers: ['stewart'] },
  { y: 1978, race: 'italian', tags: 'monza title decider', drivers: ['mario_andretti', 'peterson'] },
  { y: 1981, race: 'spanish', tags: 'jarama train defence', drivers: ['gilles_villeneuve'] },
  { y: 1982, race: 'san-marino', tags: 'imola team orders', drivers: ['pironi', 'gilles_villeneuve'] },
  { y: 2009, race: 'brazilian', tags: 'title decider brawn', drivers: ['button', 'webber'] },
  { y: 2014, race: 'bahrain', tags: 'duel in the desert night', drivers: ['hamilton', 'rosberg'] },
  { y: 2021, race: 'british', tags: 'silverstone copse crash', drivers: ['hamilton', 'max_verstappen', 'leclerc'] },
  { y: 2021, race: 'italian', tags: 'monza halo crash mclaren one two', drivers: ['ricciardo', 'norris', 'max_verstappen'] },
  { y: 2021, race: 'hungarian', tags: 'first win chaos', drivers: ['ocon', 'alonso'] },
  { y: 2020, race: 'sakhir', tags: 'first win mercedes', drivers: ['perez', 'russell'] },
  { y: 2020, race: 'bahrain', tags: 'fire crash', drivers: ['grosjean', 'hamilton'] },
  { y: 2017, race: 'azerbaijan', tags: 'baku chaos', drivers: ['ricciardo', 'stroll'] },
  { y: 2018, race: 'german', tags: 'hockenheim rain crash', drivers: ['hamilton', 'vettel'] },
  { y: 2019, race: 'german', tags: 'hockenheim rain chaos', drivers: ['max_verstappen', 'kvyat'] },
  { y: 2019, race: 'brazilian', tags: 'interlagos podium', drivers: ['max_verstappen', 'gasly', 'hamilton'] },
  { y: 2019, race: 'austrian', tags: 'overtake honda', drivers: ['max_verstappen', 'leclerc'] },
  { y: 2008, race: 'italian', tags: 'monza rain first win toro rosso', drivers: ['vettel'] },
  { y: 2012, race: 'european', tags: 'valencia home win', drivers: ['alonso'] },
  { y: 2012, race: 'spanish', tags: 'first win williams', drivers: ['maldonado'] },
  { y: 2013, race: 'malaysian', tags: 'multi 21 team orders', drivers: ['vettel', 'webber'] },
  { y: 2007, race: 'chinese', tags: 'gravel pit lane', drivers: ['raikkonen', 'hamilton'] },
  { y: 2024, race: 'miami', tags: 'first win', drivers: ['norris'] },
  { y: 2025, race: 'abu-dhabi', tags: 'title decider', drivers: ['norris', 'piastri', 'max_verstappen'] },
];

/**
 * Quick searches under the box. "famous", "title deciders" and "first wins" are
 * filters, not words; the rest are ordinary searches.
 */
export const CHIPS = ['famous', 'title deciders', 'first wins', 'rain', 'senna', 'monaco'];
