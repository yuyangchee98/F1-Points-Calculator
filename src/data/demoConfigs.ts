export interface DemoConfig {
  command: string;
  races: Array<{
    code: string;
    name: string;
    flag?: string;
    blur?: boolean;
  }>;
  drivers: {
    [position: string]: { name: string; team: string; color: string };
  };
  positions: string[]; // Which positions to show (e.g., ['P1', 'P2'])
}

export const FerrariItalianDemo: DemoConfig = {
  command: "Ferrari 1-2 at Italian GP",
  races: [
    { code: 'NED', name: 'Dutch', blur: true },
    { code: 'BEL', name: 'Belgian', blur: true },
    { code: 'ITA', name: 'Italian', flag: '🇮🇹' },
  ],
  drivers: {
    P1: { name: 'HAMILTON', team: 'Ferrari', color: '#DC0000' },
    P2: { name: 'LECLERC', team: 'Ferrari', color: '#DC0000' },
  },
  positions: ['P1', 'P2']
};

export const AlonsoSpainDemo: DemoConfig = {
  command: "Alonso podium at Spanish GP",
  races: [
    { code: 'ESP', name: 'Spanish', flag: '🇪🇸' },
  ],
  drivers: {
    P1: { name: 'VERSTAPPEN', team: 'Red Bull', color: '#1E40AF' },
    P2: { name: 'NORRIS', team: 'McLaren', color: '#FF8700' },
    P3: { name: 'ALONSO', team: 'Aston Martin', color: '#006F62' },
  },
  positions: ['P1', 'P2', 'P3']
};

export const ColapintoPointsDemo: DemoConfig = {
  command: "Colapinto scores first points",
  races: [
    { code: 'SIN', name: 'Singapore', flag: '🇸🇬' },
  ],
  drivers: {
    P8: { name: 'COLAPINTO', team: 'Alpine', color: '#0090FF' },
  },
  positions: ['P8']
};

export const MaxNext3Demo: DemoConfig = {
  command: "Max wins next 3 races",
  races: [
    { code: 'BEL', name: 'Belgian', flag: '🇧🇪' },
    { code: 'NED', name: 'Dutch', flag: '🇳🇱' },
    { code: 'ITA', name: 'Italian', flag: '🇮🇹' },
  ],
  drivers: {
    P1: { name: 'VERSTAPPEN', team: 'Red Bull', color: '#1E3A8A' },
  },
  positions: ['P1']
};

export const NorrisRemainingDemo: DemoConfig = {
  command: "Norris wins all remaining races",
  races: [
    { code: 'LV', name: 'Las Vegas', flag: '🇺🇸' },
    { code: 'QAT', name: 'Qatar', flag: '🇶🇦' },
    { code: 'ABU', name: 'Abu Dhabi', flag: '🇦🇪' },
  ],
  drivers: {
    P1: { name: 'NORRIS', team: 'McLaren', color: '#FF8700' },
  },
  positions: ['P1']
};

export const McLarenSprintsDemo: DemoConfig = {
  command: "McLaren 1-2 next 3 sprints",
  races: [
    { code: 'CHN', name: 'China Sprint', flag: '🇨🇳' },
    { code: 'MIA', name: 'Miami Sprint', flag: '🇺🇸' },
    { code: 'BRA', name: 'Brazil Sprint', flag: '🇧🇷' },
  ],
  drivers: {
    'CHN-P1': { name: 'NORRIS', team: 'McLaren', color: '#FF8700' },
    'CHN-P2': { name: 'PIASTRI', team: 'McLaren', color: '#FF8700' },
    'MIA-P1': { name: 'PIASTRI', team: 'McLaren', color: '#FF8700' },
    'MIA-P2': { name: 'NORRIS', team: 'McLaren', color: '#FF8700' },
    'BRA-P1': { name: 'NORRIS', team: 'McLaren', color: '#FF8700' },
    'BRA-P2': { name: 'PIASTRI', team: 'McLaren', color: '#FF8700' },
  },
  positions: ['P1', 'P2']
};

export const demos: DemoConfig[] = [
  FerrariItalianDemo,
  NorrisRemainingDemo,
  MaxNext3Demo,
  McLarenSprintsDemo,
  AlonsoSpainDemo,
  ColapintoPointsDemo
];
