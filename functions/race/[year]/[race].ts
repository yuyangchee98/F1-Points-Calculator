interface Env {
  // Add environment variables here if needed in the future
}

interface RaceResult {
  driverId: string;
  teamId: string;
  position: number;
  fastestLap?: boolean;
}

interface PastRaceResults {
  [raceId: string]: RaceResult[];
}

interface RaceScheduleItem {
  id: string;
  name: string;
  displayName: string;
  isSprint: boolean;
  order: number;
  round: number;
  date: string;
  circuitId: string;
  country: string;
  locality: string;
}

interface Driver {
  id: string;
  code: string;
  givenName: string;
  familyName: string;
  nationality: string;
  team: string;
}

interface Team {
  id: string;
  name: string;
  nationality: string;
  color: string;
}

interface DriverStanding {
  driverId: string;
  position: number;
  points: number;
}

interface TeamStanding {
  teamId: string;
  position: number;
  points: number;
}

const API_BASE = 'https://f1-points-calculator-api.yuyangchee98.workers.dev';

// Helper function to format driver names (convert snake_case to readable)
function formatDriverName(driverId: string): string {
  return driverId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to get driver last name
function getDriverLastName(driver: Driver): string {
  return driver.familyName;
}

// Helper function to format team names
function formatTeamName(teamId: string): string {
  const teamMap: Record<string, string> = {
    'red_bull': 'Red Bull Racing',
    'mercedes': 'Mercedes',
    'ferrari': 'Ferrari',
    'mclaren': 'McLaren',
    'aston_martin': 'Aston Martin',
    'alpine': 'Alpine',
    'williams': 'Williams',
    'alphatauri': 'AlphaTauri',
    'rb': 'RB',
    'alfa': 'Alfa Romeo',
    'haas': 'Haas F1 Team',
    'sauber': 'Sauber',
    'racing_point': 'Racing Point',
    'renault': 'Renault',
  };

  return teamMap[teamId] || teamId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Current F1 points system
function getPoints(position: number, fastestLap?: boolean): number {
  const pointsMap: Record<number, number> = {
    1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
    6: 8, 7: 6, 8: 4, 9: 2, 10: 1
  };

  let points = pointsMap[position] || 0;

  // Fastest lap bonus (only if in top 10)
  if (fastestLap && position <= 10) {
    points += 1;
  }

  return points;
}

// Calculate championship standings up to a specific race
function calculateStandingsUpToRace(
  allResults: PastRaceResults,
  schedule: RaceScheduleItem[],
  targetRaceId: string,
  drivers: Driver[],
  teams: Team[]
): { driverStandings: DriverStanding[]; teamStandings: TeamStanding[] } {
  const driverPoints: Record<string, number> = {};
  const teamPoints: Record<string, number> = {};

  // Get races up to and including target race
  const targetRace = schedule.find(r => r.id === targetRaceId);
  if (!targetRace) {
    return { driverStandings: [], teamStandings: [] };
  }

  const racesUpToTarget = schedule
    .filter(r => r.order <= targetRace.order)
    .sort((a, b) => a.order - b.order);

  // Calculate points
  for (const race of racesUpToTarget) {
    const results = allResults[race.id];
    if (!results) continue;

    for (const result of results) {
      const points = getPoints(result.position, result.fastestLap);

      // Driver points
      driverPoints[result.driverId] = (driverPoints[result.driverId] || 0) + points;

      // Team points
      teamPoints[result.teamId] = (teamPoints[result.teamId] || 0) + points;
    }
  }

  // Create driver standings
  const driverStandings: DriverStanding[] = Object.entries(driverPoints)
    .map(([driverId, points]) => ({ driverId, points, position: 0 }))
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => ({ ...standing, position: index + 1 }));

  // Create team standings
  const teamStandings: TeamStanding[] = Object.entries(teamPoints)
    .map(([teamId, points]) => ({ teamId, points, position: 0 }))
    .sort((a, b) => b.points - a.points)
    .map((standing, index) => ({ ...standing, position: index + 1 }));

  return { driverStandings, teamStandings };
}

export async function onRequest(context: {
  params: { year: string; race: string };
  env: Env;
  request: Request;
}): Promise<Response> {
  const { year, race } = context.params;

  try {
    // Fetch all data in parallel
    const [resultsResponse, scheduleResponse, driversResponse, teamsResponse] = await Promise.all([
      fetch(`${API_BASE}/api/race-results?year=${year}`),
      fetch(`${API_BASE}/api/schedule/${year}`),
      fetch(`${API_BASE}/api/drivers/${year}`),
      fetch(`${API_BASE}/api/teams/${year}`)
    ]);

    if (!resultsResponse.ok || !scheduleResponse.ok || !driversResponse.ok || !teamsResponse.ok) {
      return new Response(generate404Page(year, race), {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        }
      });
    }

    const raceResults: PastRaceResults = await resultsResponse.json();
    const schedule: RaceScheduleItem[] = await scheduleResponse.json();
    const drivers: Driver[] = await driversResponse.json();
    const teams: Team[] = await teamsResponse.json();

    // Find the specific race
    const raceId = race.toLowerCase();
    const results = raceResults[raceId];

    if (!results || results.length === 0) {
      return new Response(generate404Page(year, race), {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        }
      });
    }

    // Find race metadata from schedule
    const raceInfo = schedule.find(r => r.id === raceId);

    if (!raceInfo) {
      return new Response(generate404Page(year, race), {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        }
      });
    }

    // Calculate standings up to this race
    const { driverStandings, teamStandings } = calculateStandingsUpToRace(
      raceResults,
      schedule,
      raceId,
      drivers,
      teams
    );

    // Generate the HTML page
    const html = generateRacePage(year, race, raceInfo, results, drivers, teams, driverStandings, teamStandings);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800',
      }
    });

  } catch (error) {
    console.error('Error generating race page:', error);
    return new Response(generateErrorPage(year, race), {
      status: 500,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    });
  }
}

function generateRacePage(
  year: string,
  race: string,
  raceInfo: RaceScheduleItem,
  results: RaceResult[],
  drivers: Driver[],
  teams: Team[],
  driverStandings: DriverStanding[],
  teamStandings: TeamStanding[]
): string {
  const title = `${year} ${raceInfo.displayName} Grand Prix Results | F1 Points Calculator`;
  const description = `Complete results from the ${year} ${raceInfo.displayName} Grand Prix. See final classification, points awarded, and championship standings.`;
  const raceDate = new Date(raceInfo.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create lookup maps
  const driverMap: Record<string, Driver> = {};
  drivers.forEach(d => driverMap[d.id] = d);

  const teamMap: Record<string, Team> = {};
  teams.forEach(t => teamMap[t.id] = t);

  // Sort results by position
  const sortedResults = [...results].sort((a, b) => a.position - b.position);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="https://f1pointscalculator.yaaaang.com/race/${year}/${race}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .podium-first {
      background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
    }
    .podium-second {
      background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
    }
    .podium-third {
      background: linear-gradient(135deg, #cd7f32 0%, #e6a85c 100%);
    }

    /* Podium container for reordering */
    .podium-container {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 1rem;
      max-width: 900px;
      margin: 0 auto;
      min-height: 220px;
    }

    @media (max-width: 768px) {
      .podium-container {
        flex-direction: column;
        align-items: stretch;
        min-height: auto;
      }
    }

    .podium-position-1 {
      order: 2;
      flex: 1;
      max-width: 280px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 2rem;
    }

    .podium-position-2 {
      order: 1;
      flex: 1;
      max-width: 280px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 1rem;
      margin-top: 4rem;
    }

    .podium-position-3 {
      order: 3;
      flex: 1;
      max-width: 280px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding-bottom: 1rem;
      margin-top: 5rem;
    }

    @media (max-width: 768px) {
      .podium-position-1,
      .podium-position-2,
      .podium-position-3 {
        order: initial !important;
        max-width: 100% !important;
        margin-top: 0 !important;
        padding-bottom: 0 !important;
      }
    }

    .blur-overlay {
      position: relative;
    }

    .blur-overlay::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      pointer-events: none;
    }
  </style>
</head>
<body class="min-h-screen bg-gray-100">
  <div class="flex flex-col sm:flex-row">
    <!-- Sidebar -->
    <aside class="hidden sm:block bg-white border-r border-gray-200 sm:w-72 lg:w-1/4 min-w-[280px] max-w-[450px] sm:sticky sm:top-0 sm:h-screen overflow-hidden shadow-md">
      <div class="h-full overflow-hidden flex flex-col bg-gray-50 pb-4">
        <!-- Red bar -->
        <div class="h-2 w-full bg-red-600"></div>

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <h2 class="text-2xl font-bold text-gray-800">Championship Standings</h2>
          <div class="flex items-center text-sm text-gray-500">
            <span class="mr-2">Updated</span>
            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Live</span>
          </div>
        </div>

        <!-- Standings tables with blur overlay -->
        <div class="overflow-auto flex-1 px-4 pt-4 relative">
          <div class="space-y-6 blur-overlay">
            <!-- Driver Standings -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <h2 class="text-lg font-medium p-3 border-b border-gray-200 sticky top-0 bg-white flex items-center">
                <span class="w-1 h-6 bg-red-600 mr-3 inline-block rounded-r-md"></span>
                Driver Standings
              </h2>
              <div class="overflow-x-auto">
                ${generateDriverStandingsTableTeaser(driverStandings, driverMap, teamMap)}
              </div>
            </div>

            <!-- Constructor Standings -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <h2 class="text-lg font-medium p-3 border-b border-gray-200 sticky top-0 bg-white flex items-center">
                <span class="w-1 h-6 bg-red-600 mr-3 inline-block rounded-r-md"></span>
                Constructor Standings
              </h2>
              <div class="overflow-x-auto">
                ${generateTeamStandingsTableTeaser(teamStandings, teamMap)}
              </div>
            </div>
          </div>

          <!-- CTA Overlay -->
          <div class="absolute inset-0 flex items-center justify-center px-6">
            <div class="rounded-xl shadow-xl p-6 text-center max-w-sm border border-gray-200" style="background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(249,250,251,0.98));">
              <div class="text-4xl mb-3">🏆</div>
              <h3 class="text-lg font-bold text-gray-900 mb-3">Want to see the current championship standings?</h3>
              <a href="/" class="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-base transition-colors shadow-md">
                View Live Standings →
              </a>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 relative pt-0 min-h-screen">
      <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <!-- Header section -->
        <div class="mb-3">
          <h1 class="text-xl sm:text-3xl md:text-4xl font-bold text-gray-800 flex items-center mb-2 sm:mb-3">
            <span class="bg-red-600 text-white px-2 py-0.5 sm:px-3 sm:py-1 mr-2 sm:mr-3 rounded-md text-base sm:text-xl">F1</span>
            <span>Points Calculator</span>
            <a href="/about.html" class="ml-2 sm:ml-3 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 flex-shrink-0" aria-label="About and FAQ" title="About & FAQ">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
          </h1>

          <div class="flex flex-wrap items-center gap-2">
            <a href="https://buymeacoffee.com/yaang" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center py-1.5 px-2.5 sm:py-3 sm:px-6 bg-red-600 text-white font-bold rounded-md shadow-lg hover:bg-red-700 transition-colors duration-200 text-xs sm:text-base whitespace-nowrap">
              <span class="mr-1 sm:mr-2">🔴</span>
              <span class="sm:hidden">Support</span>
              <span class="hidden sm:inline">Buy Chyuang a soft tyre</span>
            </a>

            <a href="https://github.com/yuyangchee98/F1-Points-Calculator/issues" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center py-1.5 px-2.5 sm:py-3 sm:px-6 bg-gray-700 text-white font-bold rounded-md shadow-lg hover:bg-gray-800 transition-colors duration-200 text-xs sm:text-base whitespace-nowrap">
              <span class="mr-1 sm:mr-2">💬</span>
              <span class="sm:hidden">Feedback</span>
              <span class="hidden sm:inline">Feature Requests / Report Bugs</span>
            </a>
          </div>
        </div>

        <!-- Race Info Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 border-b-4 border-red-600">
          <h2 class="text-3xl md:text-4xl font-bold text-red-600 mb-3">${year} ${raceInfo.displayName} Grand Prix</h2>
          <div class="flex flex-wrap gap-4 text-gray-600 text-sm md:text-base">
            <span class="flex items-center gap-1">📍 Round ${raceInfo.round}</span>
            <span class="flex items-center gap-1">📅 ${raceDate}</span>
            <span class="flex items-center gap-1">🏁 ${raceInfo.locality}, ${raceInfo.country}</span>
          </div>
        </div>

        <!-- Podium -->
        ${generatePodium(sortedResults, driverMap, teamMap)}

        <!-- Results Table -->
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Race Classification</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-900 text-white">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Pos</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Driver</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Team</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Points</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${sortedResults.map(result => {
                  const driver = driverMap[result.driverId];
                  const team = teamMap[result.teamId];
                  if (!driver || !team) return '';

                  return `
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="px-4 py-4 text-lg font-bold text-red-600">${result.position}</td>
                      <td class="px-4 py-4">
                        <span class="font-semibold text-gray-900">${formatDriverName(result.driverId)}</span>
                        ${result.fastestLap ? '<span class="ml-2 inline-block bg-purple-600 text-white text-xs px-2 py-1 rounded font-semibold">⚡ Fastest Lap</span>' : ''}
                      </td>
                      <td class="px-4 py-4 text-gray-600">${formatTeamName(result.teamId)}</td>
                      <td class="px-4 py-4 text-right font-semibold text-gray-900">${getPoints(result.position, result.fastestLap)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- CTA -->
        <div class="bg-white rounded-xl shadow-lg p-8 md:p-12 text-center mb-6 border-b-4 border-red-600">
          <h3 class="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Make Your Own Predictions</h3>
          <p class="text-lg mb-6 text-gray-600">Want to predict future race results and see how the championship could unfold?</p>
          <a href="/" class="inline-block bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 hover:shadow-xl transition-all duration-200">
            Try Our F1 Points Calculator →
          </a>
        </div>

        <!-- Navigation Links -->
        <div class="text-center space-x-6 text-sm md:text-base mb-12">
          <a href="/" class="text-blue-600 hover:underline font-semibold">← Home</a>
          <a href="/${year}.html" class="text-blue-600 hover:underline font-semibold">View ${year} Season</a>
          <a href="/about.html" class="text-blue-600 hover:underline font-semibold">About</a>
        </div>
      </div>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-8 mt-12 pb-24 sm:pb-8">
        <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between space-y-6 sm:space-y-0">
          <div>
            <h3 class="text-lg font-medium mb-3">F1 Points Calculator</h3>
            <p class="text-sm text-gray-400 mb-2">Created by <a href="https://yaaaang.com" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Chyuang</a></p>
            <p class="text-sm text-gray-400 mb-2"><a href="https://github.com/yuyangchee98/F1-Points-Calculator" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Open source on GitHub</a></p>
          </div>

          <div>
            <h3 class="text-lg font-medium mb-3">Seasons</h3>
            <ul class="text-sm text-gray-400 space-y-1">
              <li><a href="/" class="${year === '2025' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}">2025 Season</a></li>
              <li><a href="/2024" class="${year === '2024' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}">2024 Season</a></li>
              <li><a href="/2023" class="${year === '2023' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}">2023 Season</a></li>
              <li><a href="/2022" class="${year === '2022' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}">2022 Season</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-medium mb-3">F1 Resources</h3>
            <ul class="text-sm text-gray-400 space-y-1">
              <li><a href="https://f1-dash.com/" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">F1 Dash</a></li>
              <li><a href="https://f1calendar.com/" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">F1 Calendar</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-lg font-medium mb-3">Other Projects</h3>
            <ul class="text-sm text-gray-400 space-y-1">
              <li><a href="https://chyuang.com/" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Chyuang</a></li>
              <li><a href="https://solvethisoaforme.chyuang.com/" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Solve This OA For Me</a></li>
              <li><a href="https://japanese-patent-attorney-rankings.chyuang.com/" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Japanese Patent Attorney Rankings</a></li>
              <li><a href="https://try-pro-tools-for-google-patents-by-readpatents.chyuang.com/" class="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">Pro Tools for Google Patents</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </main>

    <!-- Mobile Navigation -->
    <div class="sm:hidden">
      <div class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-xl z-50 h-16">
        <div class="flex justify-around items-center h-full bg-gradient-to-t from-gray-900 to-gray-800">
          <a href="/${year}.html" class="flex flex-col items-center justify-center w-1/2 h-full text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span class="text-xs">Race Grid</span>
          </a>

          <button class="flex flex-col items-center justify-center w-1/2 h-full text-red-500 font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span class="text-xs">Standings</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateDriverStandingsTableTeaser(
  standings: DriverStanding[],
  driverMap: Record<string, Driver>,
  teamMap: Record<string, Team>
): string {
  if (standings.length === 0) {
    // Generate fake teaser data for visual effect
    const fakeDrivers = Array.from({ length: 10 }, (_, i) => ({ position: i + 1, name: 'Driver Name' }));
    return `
      <table class="w-full min-w-full table-auto">
        <thead>
          <tr class="text-gray-300 border-gray-600">
            <th class="w-12 text-left py-2 font-normal text-sm">Pos</th>
            <th class="text-left py-2 font-normal text-sm">Driver</th>
          </tr>
        </thead>
        <tbody>
          ${fakeDrivers.map(driver => `
            <tr>
              <td class="py-3 px-2 text-center font-bold text-gray-700 w-12">${driver.position}</td>
              <td class="py-3">
                <div class="flex items-center">
                  <div class="h-5 w-3 mr-2 rounded-sm bg-gray-400"></div>
                  <div class="font-medium text-gray-800">${driver.name}</div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  return `
    <table class="w-full min-w-full table-auto">
      <thead>
        <tr class="text-gray-300 border-gray-600">
          <th class="w-12 text-left py-2 font-normal text-sm">Pos</th>
          <th class="text-left py-2 font-normal text-sm">Driver</th>
        </tr>
      </thead>
      <tbody>
        ${standings.slice(0, 10).map(standing => {
          const driver = driverMap[standing.driverId];
          if (!driver) return '';

          const team = teamMap[driver.team];
          const teamColor = team?.color || '#ccc';

          return `
            <tr class="hover:bg-gray-50">
              <td class="py-3 px-2 text-center font-bold text-gray-700 w-12">
                <span>${standing.position}</span>
              </td>
              <td class="py-3">
                <div class="flex items-center">
                  <div class="h-5 w-3 mr-2 rounded-sm" style="background-color: ${teamColor}"></div>
                  <div class="font-medium text-gray-800">${getDriverLastName(driver)}</div>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function generateTeamStandingsTableTeaser(
  standings: TeamStanding[],
  teamMap: Record<string, Team>
): string {
  if (standings.length === 0) {
    // Generate fake teaser data for visual effect
    const fakeTeams = Array.from({ length: 10 }, (_, i) => ({ position: i + 1, name: 'Team Name' }));
    return `
      <table class="w-full min-w-full table-auto">
        <thead>
          <tr class="text-gray-300 border-gray-600">
            <th class="w-12 text-left py-2 font-normal text-sm">Pos</th>
            <th class="text-left py-2 font-normal text-sm">Constructor</th>
          </tr>
        </thead>
        <tbody>
          ${fakeTeams.map(team => `
            <tr>
              <td class="py-3 px-2 text-center font-bold text-gray-700 w-12">${team.position}</td>
              <td class="py-3">
                <div class="flex items-center">
                  <div class="h-5 w-4 mr-2 rounded-sm bg-gray-400"></div>
                  <div class="font-medium text-gray-800">${team.name}</div>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  return `
    <table class="w-full min-w-full table-auto">
      <thead>
        <tr class="text-gray-300 border-gray-600">
          <th class="w-12 text-left py-2 font-normal text-sm">Pos</th>
          <th class="text-left py-2 font-normal text-sm">Constructor</th>
        </tr>
      </thead>
      <tbody>
        ${standings.slice(0, 10).map(standing => {
          const team = teamMap[standing.teamId];
          if (!team) return '';

          return `
            <tr class="hover:bg-gray-50">
              <td class="py-3 px-2 text-center font-bold text-gray-700 w-12">${standing.position}</td>
              <td class="py-3">
                <div class="flex items-center">
                  <div class="h-5 w-4 mr-2 rounded-sm" style="background-color: ${team.color}"></div>
                  <div class="font-medium text-gray-800">${team.name}</div>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function generatePodium(
  results: RaceResult[],
  driverMap: Record<string, Driver>,
  teamMap: Record<string, Team>
): string {
  const top3 = results.slice(0, 3);

  if (top3.length < 3) return '';

  return `
    <div class="podium-container mb-6">
      ${top3.map((result, index) => {
        const driver = driverMap[result.driverId];
        const team = teamMap[result.teamId];
        if (!driver || !team) return '';

        const podiumClass = index === 0 ? 'podium-first' : index === 1 ? 'podium-second' : 'podium-third';
        const positionClass = `podium-position-${result.position}`;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

        return `
          <div class="${podiumClass} ${positionClass} rounded-xl p-6 text-center shadow-lg">
            <div class="text-2xl font-bold mb-2">${medal} P${result.position}</div>
            <div class="text-xl font-semibold mb-1 text-gray-900">${formatDriverName(result.driverId)}</div>
            <div class="text-sm text-gray-700">${formatTeamName(result.teamId)}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function generate404Page(year: string, race: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Race Not Found | F1 Points Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center p-4 bg-gray-100">
  <div class="max-w-2xl bg-white rounded-xl shadow-2xl p-8 md:p-12 text-center">
    <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-4">🏁 Race Not Found</h1>
    <p class="text-lg text-gray-600 mb-3">We couldn't find results for the <span class="font-semibold text-gray-900">${year} ${race}</span> Grand Prix.</p>
    <p class="text-gray-600 mb-8">This race may not have happened yet, or the race name might be incorrect.</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">Go to Calculator</a>
      <a href="/${year}.html" class="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors">View ${year} Season</a>
    </div>
  </div>
</body>
</html>`;
}

function generateErrorPage(year: string, race: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error | F1 Points Calculator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen flex items-center justify-center p-4 bg-gray-100">
  <div class="max-w-2xl bg-white rounded-xl shadow-2xl p-8 md:p-12 text-center">
    <h1 class="text-5xl md:text-6xl font-bold text-red-600 mb-4">⚠️ Something Went Wrong</h1>
    <p class="text-lg text-gray-600 mb-8">We encountered an error loading the race results.</p>
    <a href="/" class="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">Return Home</a>
  </div>
</body>
</html>`;
}
