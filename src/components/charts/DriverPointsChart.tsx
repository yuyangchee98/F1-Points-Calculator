import React from 'react';
import { useSelector } from 'react-redux';
import { type ChartDataset } from 'chart.js';
import type { RootState } from '../../store';

import { selectDriverPointsForCharts, selectDriverStandings } from '../../store/selectors/resultsSelectors';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { buildRaceLabels, toMetricData, resolveChartSelection } from './chartHelpers';
import PointsLineChart from './PointsLineChart';

const DriverPointsChart: React.FC = () => {
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  const selection = useSelector((state: RootState) => state.ui.driverChartSelection);
  const chartMetric = useSelector((state: RootState) => state.ui.driverChartMetric);
  const standings = useSelector(selectDriverStandings);
  const { axis, series, leader } = useSelector(selectDriverPointsForCharts);

  // Which drivers to plot: explicit selection (or default top 5), ordered by
  // standings so the legend reads top-down.
  const plottedIds = resolveChartSelection(selection, standings.map(s => s.driverId));

  const datasets = plottedIds.map(driverId => {
    const driver = driverById[driverId];
    if (!driver) return null;

    const color = teamById[driver.team]?.color || '#ccc';

    return {
      label: getDriverLastName(driver.id),
      data: toMetricData(series[driverId] ?? [], leader, chartMetric),
      borderColor: color,
      backgroundColor: color,
      pointRadius: 3,
      spanGaps: false,
    };
  }).filter(Boolean) as ChartDataset<'line', (number | null)[]>[];

  return <PointsLineChart labels={buildRaceLabels(axis)} datasets={datasets} metric={chartMetric} />;
};

export default DriverPointsChart;
