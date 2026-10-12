import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

import { selectTeamPointsForCharts, selectTeamStandings } from '../../store/selectors/resultsSelectors';
import { selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { buildRaceLabels, toMetricData, resolveChartSelection, dashesForRepeatedColours } from './chartHelpers';
import PointsLineChart, { type LabelledDataset } from './PointsLineChart';

// End labels sit in a narrow gutter, so teams get codes like drivers do.
const TEAM_CODES: Record<string, string> = {
  red_bull: 'RBR', rb: 'RB', aston_martin: 'AMR', mclaren: 'MCL', alphatauri: 'AT',
  racing_point: 'RP', force_india: 'FI', toro_rosso: 'STR', alfa: 'ALF', sauber: 'SAU',
};
const teamCode = (id: string, name: string) =>
  TEAM_CODES[id] ?? name.normalize('NFD').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();

const TeamPointsChart: React.FC = () => {
  const teamById = useSelector(selectTeamsByIdMap);

  const selection = useSelector((state: RootState) => state.ui.teamChartSelection);
  const chartMetric = useSelector((state: RootState) => state.ui.teamChartMetric);
  const standings = useSelector(selectTeamStandings);
  const { axis, series, leader } = useSelector(selectTeamPointsForCharts);

  const plottedIds = resolveChartSelection(selection, standings.map(s => s.teamId));

  const teams = plottedIds.map(id => teamById[id]).filter(Boolean);
  // Ferrari, Haas and Audi are all red: a repeated colour is dashed.
  const dashes = dashesForRepeatedColours(teams.map(t => t.color));

  const datasets: LabelledDataset[] = teams.map((team, i) => ({
    label: team.name,
    endLabel: teamCode(team.id, team.name),
    data: toMetricData(series[team.id] ?? [], leader, chartMetric),
    borderColor: team.color,
    backgroundColor: team.color,
    borderDash: dashes[i],
    pointRadius: 2,
    spanGaps: false,
  }));

  return <PointsLineChart labels={buildRaceLabels(axis)} datasets={datasets} metric={chartMetric} />;
};

export default TeamPointsChart;
