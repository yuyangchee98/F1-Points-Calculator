// Mirrors the /api/circuit response shape from the Worker (lib/circuits.ts).
export interface PodiumEntry {
  position: number;
  driverId: string;
  driverName: string;
  driverLast: string;
  driverCode?: string;
  teamId: string;
  teamName: string;
  teamColor?: string;
}

export interface CircuitEdition {
  season: number;
  raceId: string;
  name: string;
  date: string;
  locked: boolean;
  results?: PodiumEntry[]; // full finishing classification (position 1..N)
}

export interface StatLeader {
  name: string;
  count: number;
}

export interface CircuitStats {
  mostWinsDriver?: StatLeader;
  mostWinsTeam?: StatLeader;
  mostPodiumsDriver?: StatLeader;
  uniqueWinners: number;
  totalEditions: number;
}

export interface CircuitHistory {
  circuitId: string;
  fullName: string;
  country: string;
  locality: string;
  editions: CircuitEdition[];
  stats: CircuitStats;
  hasLockedEditions: boolean;
}

export interface CircuitListItem {
  circuitId: string;
  slug: string;
  fullName: string;
  country: string;
}
