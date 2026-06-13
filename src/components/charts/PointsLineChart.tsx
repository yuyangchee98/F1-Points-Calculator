import React from 'react';
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
  type ChartDataset,
  type TooltipItem
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  // Cumulative points are monotonic; straight segments avoid Bézier overshoot
  // drawing totals that never occurred between rounds.
  elements: { line: { tension: 0 } },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 12,
        padding: 10,
        font: { size: 11 }
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
        label: function (context: TooltipItem<'line'>) {
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

interface PointsLineChartProps {
  labels: string[];
  datasets: ChartDataset<'line', (number | null)[]>[];
  emptyMessage?: string;
}

const PointsLineChart: React.FC<PointsLineChartProps> = ({
  labels,
  datasets,
  emptyMessage = 'Place drivers in race positions to see points charts'
}) => {
  const hasData = labels.length > 0 && datasets.length > 0;

  return (
    <div className="chart-container">
      {hasData ? (
        <Line data={{ labels, datasets }} options={chartOptions} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default PointsLineChart;
