import { DemoConfig } from './FerrariItalianDemo';

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