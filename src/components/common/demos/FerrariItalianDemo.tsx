
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