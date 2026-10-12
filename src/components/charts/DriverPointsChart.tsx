import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

import { selectDriverPointsForCharts, selectDriverStandings } from '../../store/selectors/resultsSelectors';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';
import { buildRaceLabels, toMetricData, resolveChartSelection, dashesForRepeatedColours } from './chartHelpers';
import PointsLineChart, { type LabelledDataset } from './PointsLineChart';
import { driverCode } from '../../utils/titleRace';

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

  const drivers = plottedIds.map(id => driverById[id]).filter(Boolean);
  const colours = drivers.map(d => teamById[d.team]?.color || '#ccc');
  // Teammates share a colour: the lower-placed one is dashed.
  const dashes = dashesForRepeatedColours(colours);

  const datasets: LabelledDataset[] = drivers.map((driver, i) => ({
    label: getDriverLastName(driver.id),
    endLabel: driverCode(driver, driver.id),
    data: toMetricData(series[driver.id] ?? [], leader, chartMetric),
    borderColor: colours[i],
    backgroundColor: colours[i],
    borderDash: dashes[i],
    pointRadius: 2,
    spanGaps: false,
  }));

  return <PointsLineChart labels={buildRaceLabels(axis)} datasets={datasets} metric={chartMetric} />;
};

export default DriverPointsChart;
