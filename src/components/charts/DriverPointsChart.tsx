import React from 'react';
import { useSelector } from 'react-redux';
import { type ChartDataset } from 'chart.js';
import type { RootState } from '../../store';

import { selectDriverPointsForCharts, selectTopDrivers } from '../../store/selectors/resultsSelectors';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { buildRaceLabels } from './chartHelpers';
import PointsLineChart from './PointsLineChart';

const DriverPointsChart: React.FC = () => {
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  const topDrivers = useSelector((state: RootState) => selectTopDrivers(state, 5));
  const { axis, series } = useSelector((state: RootState) => selectDriverPointsForCharts(state, 5));

  const datasets = topDrivers.map(standing => {
    const driver = driverById[standing.driverId];
    if (!driver) return null;

    const team = teamById[driver.team];
    const color = team?.color || '#ccc';

    return {
      label: getDriverLastName(driver.id),
      data: series[standing.driverId] ?? [],
      borderColor: color,
      backgroundColor: color,
      tension: 0.1,
      pointRadius: 3,
      spanGaps: false,
    };
  }).filter(Boolean) as ChartDataset<'line', (number | null)[]>[];

  return <PointsLineChart labels={buildRaceLabels(axis)} datasets={datasets} />;
};

export default DriverPointsChart;
