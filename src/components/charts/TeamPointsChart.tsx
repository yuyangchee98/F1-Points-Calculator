import React from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { ChartDataset, TooltipItem } from 'chart.js';
import { RootState } from '../../store';
import { selectTeamPointsForCharts, selectTopTeams } from '../../store/selectors/resultsSelectors';
import { selectTeamsByIdMap } from '../../store/selectors/dataSelectors';

const TeamPointsChart: React.FC = () => {
  const teamById = useSelector(selectTeamsByIdMap);

  const topTeams = useSelector((state: RootState) => selectTopTeams(state, 5));
  const teamPoints = useSelector((state: RootState) => selectTeamPointsForCharts(state, 5));
  const races = useSelector((state: RootState) => state.seasonData.races);

  const racesWithData = races
    .filter(race => {
      const raceHasData = Object.values(teamPoints).some(points => {
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

  const datasets = topTeams.map(standing => {
    const team = teamById[standing.teamId];
    if (!team) return null;

    const filteredData = racesWithData.map(race => {
      const raceIndex = races.findIndex(r => r.id === race.id);
      const allTeamPoints = teamPoints[standing.teamId] || [];
      return allTeamPoints[raceIndex] || 0;
    });
    
    return {
      label: team.name,
      data: filteredData,
      borderColor: team.color,
      backgroundColor: team.color,
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
      legend: { 
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 41, 59, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
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
        title: { display: true, text: 'Points', font: { size: 11 } },
        ticks: { font: { size: 10 } }
      },
      x: {
        title: { display: true, text: 'Races', font: { size: 11 } },
        ticks: { 
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45
        }
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

export default TeamPointsChart;