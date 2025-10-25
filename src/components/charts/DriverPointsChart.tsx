import React from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { ChartDataset, TooltipItem } from 'chart.js';
import { RootState } from '../../store';
import { selectDriverPointsForCharts, selectTopDrivers } from '../../store/selectors/resultsSelectors';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';

const DriverPointsChart: React.FC = () => {
  // Get drivers and teams from Redux
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  // Get top 5 drivers and their points history for the chart
  const topDrivers = useSelector((state: RootState) => selectTopDrivers(state, 5));
  const driverPoints = useSelector((state: RootState) => selectDriverPointsForCharts(state, 5));
  const races = useSelector((state: RootState) => state.seasonData.races);

  // Get races with data and sort them by calendar order
  const racesWithData = races
    .filter(race => {
      // Check if any driver has points for this race
      const raceHasData = Object.values(driverPoints).some(points => {
        const raceIndex = races.findIndex(r => r.id === race.id);
        return points[raceIndex] !== undefined;
      });
      return raceHasData;
    })
    .sort((a, b) => a.order - b.order);

  // Get race names for x-axis labels - using more meaningful abbreviations
  const raceLabels = racesWithData.map(race => {
    // Create better abbreviations
    const baseName = race.name.replace(' Sprint', '');
    const suffix = race.isSprint ? ' (S)' : '';
    return baseName.slice(0, 3) + suffix;
  });
  
  // Prepare datasets for the chart
  const datasets = topDrivers.map(standing => {
    const driver = driverById[standing.driverId];
    if (!driver) return null;
    
    const team = teamById[driver.team];
    const color = team?.color || '#ccc';
    
    // Get data points corresponding to the filtered races
    const filteredData = racesWithData.map(race => {
      const raceIndex = races.findIndex(r => r.id === race.id);
      const allDriverPoints = driverPoints[standing.driverId] || [];
      return allDriverPoints[raceIndex] || 0;
    });
    
    return {
      label: getDriverLastName(driver.id),
      data: filteredData,
      borderColor: color,
      backgroundColor: color,
      tension: 0.1,
      pointRadius: 3,
    };
  }).filter(Boolean) as ChartDataset<'line', number[]>[];
  
  const chartData = { 
    labels: raceLabels, 
    datasets 
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'line'>) {
            return `${context.dataset.label}: ${context.raw} pts`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Points' }
      },
      x: {
        title: { display: true, text: 'Races' }
      }
    }
  };
  
  return (
    <div className="chart-container">
      {datasets.length > 0 ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          Place drivers in race positions to see points charts
        </div>
      )}
    </div>
  );
};

export default DriverPointsChart;