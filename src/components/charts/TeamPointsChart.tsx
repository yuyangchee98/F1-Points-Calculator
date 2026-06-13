import React from 'react';
import { useSelector } from 'react-redux';
import { type ChartDataset } from 'chart.js';
import type { RootState } from '../../store';

import { selectTeamPointsForCharts, selectTopTeams } from '../../store/selectors/resultsSelectors';
import { selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { buildRaceLabels } from './chartHelpers';
import PointsLineChart from './PointsLineChart';

const TeamPointsChart: React.FC = () => {
  const teamById = useSelector(selectTeamsByIdMap);

  const topTeams = useSelector((state: RootState) => selectTopTeams(state, 5));
  const { axis, series } = useSelector((state: RootState) => selectTeamPointsForCharts(state, 5));

  const datasets = topTeams.map(standing => {
    const team = teamById[standing.teamId];
    if (!team) return null;

    return {
      label: team.name,
      data: series[standing.teamId] ?? [],
      borderColor: team.color,
      backgroundColor: team.color,
      tension: 0.1,
      pointRadius: 3,
      spanGaps: false,
    };
  }).filter(Boolean) as ChartDataset<'line', (number | null)[]>[];

  return <PointsLineChart labels={buildRaceLabels(axis)} datasets={datasets} />;
};

export default TeamPointsChart;
