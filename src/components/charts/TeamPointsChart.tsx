import React from 'react';
import { useSelector } from 'react-redux';
import { type ChartDataset } from 'chart.js';
import type { RootState } from '../../store';

import { selectTeamPointsForCharts, selectTeamStandings } from '../../store/selectors/resultsSelectors';
import { selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { buildRaceLabels, toMetricData, resolveChartSelection } from './chartHelpers';
import PointsLineChart from './PointsLineChart';

const TeamPointsChart: React.FC = () => {
  const teamById = useSelector(selectTeamsByIdMap);

  const selection = useSelector((state: RootState) => state.ui.teamChartSelection);
  const chartMetric = useSelector((state: RootState) => state.ui.teamChartMetric);
  const standings = useSelector(selectTeamStandings);
  const { axis, series, leader } = useSelector(selectTeamPointsForCharts);

  const plottedIds = resolveChartSelection(selection, standings.map(s => s.teamId));

  const datasets = plottedIds.map(teamId => {
    const team = teamById[teamId];
    if (!team) return null;

    return {
      label: team.name,
      data: toMetricData(series[teamId] ?? [], leader, chartMetric),
      borderColor: team.color,
      backgroundColor: team.color,
      pointRadius: 3,
      spanGaps: false,
    };
  }).filter(Boolean) as ChartDataset<'line', (number | null)[]>[];

  return <PointsLineChart labels={buildRaceLabels(axis)} datasets={datasets} metric={chartMetric} />;
};

export default TeamPointsChart;
