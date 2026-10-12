import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  type Plugin,
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

/** A dataset may name itself for its end label (a driver code, a short team name). */
export type LabelledDataset = ChartDataset<'line', (number | null)[]> & { endLabel?: string };

const LABEL_GAP = 12;
const END_LABEL_PAD = 66;

/**
 * Names each line at its last point instead of a legend: "ANT 340". Labels that
 * would overlap are pushed apart and joined to their line by a short leader, so
 * close finishes stay readable without hunting colours in a key.
 */
const endLabelsPlugin: Plugin<'line'> = {
  id: 'endLabels',
  afterDatasetsDraw(chart, _args, opts) {
    const { metric } = (opts ?? {}) as { metric?: ChartMetric };
    const { ctx, chartArea } = chart;
    const labels: Array<{ y: number; ly: number; x: number; color: string; dash: number[]; code: string; value: string }> = [];

    chart.data.datasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i);
      if (meta.hidden) return;
      const data = ds.data as (number | null)[];
      let last = data.length - 1;
      while (last >= 0 && data[last] == null) last--;
      if (last < 0) return;
      const pt = meta.data[last];
      if (!pt) return;
      const raw = Number(data[last]);
      const value = metric === 'gap' ? (raw === 0 ? 'lead' : `−${formatPoints(raw)}`) : formatPoints(raw);
      labels.push({
        x: pt.x,
        y: pt.y,
        ly: pt.y,
        color: String(ds.borderColor ?? '#9AA3AC'),
        dash: ((ds as { borderDash?: number[] }).borderDash ?? []),
        code: (ds as LabelledDataset).endLabel ?? String(ds.label ?? ''),
        value,
      });
    });
    if (labels.length === 0) return;

    // Push overlapping labels apart, then keep the stack inside the plot.
    labels.sort((a, b) => a.y - b.y);
    for (let pass = 0; pass < 30; pass++) {
      for (let i = 1; i < labels.length; i++) {
        const overlap = labels[i - 1].ly + LABEL_GAP - labels[i].ly;
        if (overlap > 0) {
          labels[i - 1].ly -= overlap / 2;
          labels[i].ly += overlap / 2;
        }
      }
    }
    const shift = Math.max(0, chartArea.top - labels[0].ly) - Math.max(0, labels[labels.length - 1].ly - chartArea.bottom);
    labels.forEach((l) => { l.ly += shift; });

    const lx = chartArea.right + 14;
    ctx.save();
    ctx.textBaseline = 'middle';
    for (const l of labels) {
      ctx.strokeStyle = l.color;
      ctx.lineWidth = 1.4;
      ctx.setLineDash(l.dash.length ? [3, 2] : []);
      ctx.beginPath();
      ctx.moveTo(l.x + 4, l.y);
      ctx.lineTo(lx - 7, l.y);
      ctx.lineTo(lx - 3, l.ly);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "800 11px Archivo, 'Archivo-fallback', system-ui, sans-serif";
      ctx.fillStyle = '#15181C';
      ctx.fillText(l.code, lx, l.ly);
      const w = ctx.measureText(l.code).width;
      ctx.font = "500 11px Archivo, 'Archivo-fallback', system-ui, sans-serif";
      ctx.fillStyle = '#4F5760';
      ctx.fillText(l.value, lx + w + 4, l.ly);
    }
    ctx.restore();
  },
};

const buildChartOptions = (metric: ChartMetric) => {
  const isGap = metric === 'gap';
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { right: END_LABEL_PAD } },
    // Cumulative points are monotonic; straight segments avoid Bézier overshoot
    // drawing totals that never occurred between rounds.
    elements: { line: { tension: 0 } },
    plugins: {
      // Lines are named at their ends (endLabelsPlugin), so no legend.
      legend: { display: false },
      endLabels: { metric },
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
  datasets: LabelledDataset[];
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
        <Line data={{ labels, datasets }} options={chartOptions} plugins={[endLabelsPlugin]} />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default PointsLineChart;
