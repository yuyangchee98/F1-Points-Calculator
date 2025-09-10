import { DemoConfig } from './FerrariItalianDemo';

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