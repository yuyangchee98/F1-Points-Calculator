import React from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataset,
  TooltipItem
} from 'chart.js';
import { RootState } from '../../store';

import { selectDriverPointsForCharts, selectTopDrivers } from '../../store/selectors/resultsSelectors';
import { selectDriversByIdMap, getDriverLastName, selectTeamsByIdMap } from '../../store/selectors/dataSelectors';

// Register ChartJS components (safe to call multiple times)
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DriverPointsChart: React.FC = () => {
  const driverById = useSelector(selectDriversByIdMap);
  const teamById = useSelector(selectTeamsByIdMap);

  const topDrivers = useSelector((state: RootState) => selectTopDrivers(state, 5));
  const driverPoints = useSelector((state: RootState) => selectDriverPointsForCharts(state, 5));
  const races = useSelector((state: RootState) => state.seasonData.races);

  const racesWithData = races
    .filter(race => {
      const raceHasData = Object.values(driverPoints).some(points => {
        const raceIndex = races.findIndex(r => r.id === race.id);
        return points[raceIndex] !== undefined;
      });
      return raceHasData;
    })
    .sort((a, b) => a.order - b.order);

  const raceLabels = racesWithData.map(race => {
    const baseName = race.name.replace(' Sprint', '');
    const suffix = race.isSprint ? ' (S)' : '';
    return baseName.slice(0, 3) + suffix;
  });

  const datasets = topDrivers.map(standing => {
    const driver = driverById[standing.driverId];
    if (!driver) return null;

    const team = teamById[driver.team];
    const color = team?.color || '#ccc';

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