import React, { useMemo } from 'react';
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
import type { ChartMetric } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Format a value for display only — keep fractional totals (half-points /
// square-root systems) readable without rounding the plotted data.
const formatPoints = (raw: unknown): string => {
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(raw);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const buildChartOptions = (metric: ChartMetric) => {
  const isGap = metric === 'gap';
  return {
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
            const label = context.dataset.label ?? '';
            if (isGap) {
              const gap = Number(context.raw);
              return gap === 0
                ? `${label}: leader`
                : `${label}: ${formatPoints(gap)} behind`;
            }
            return `${label}: ${formatPoints(context.raw)} pts`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        // Gap = points behind leader (0 = leader). Reverse so the leader sits
        // on top and trailing entities drop below, matching how fans read a
        // championship table.
        reverse: isGap,
        title: {
          display: true,
          text: isGap ? 'Points behind leader' : 'Points',
          font: { size: 11 }
        },
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
};

interface PointsLineChartProps {
  labels: string[];
  datasets: ChartDataset<'line', (number | null)[]>[];
  metric?: ChartMetric;
  emptyMessage?: string;
}

const PointsLineChart: React.FC<PointsLineChartProps> = ({
  labels,
  datasets,
  metric = 'cumulative',
  emptyMessage = 'Place drivers in race positions to see points charts'
}) => {
  const hasData = labels.length > 0 && datasets.length > 0;
  const chartOptions = useMemo(() => buildChartOptions(metric), [metric]);

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
