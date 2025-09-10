import { DemoConfig } from './FerrariItalianDemo';

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