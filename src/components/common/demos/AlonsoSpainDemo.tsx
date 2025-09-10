import { DemoConfig } from './FerrariItalianDemo';

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