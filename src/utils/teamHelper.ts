/**
 * Normalizes a team name to match the team ID format
 * @param teamName - The team name to normalize (e.g., "Red Bull", "Aston Martin")
 * @returns The normalized team ID (e.g., "red-bull", "aston-martin")
 */
export const normalizeTeamId = (teamName: string): string => {
  return teamName.toLowerCase().replace(/\s/g, '-');
};