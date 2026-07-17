import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function RadarChart({ data, title, className = '' }) {
  if (!data) return null;

  const isDark = document.documentElement.classList.contains('dark');

  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((ds, i) => ({
      label: ds.label || '',
      data: ds.values || [],
      backgroundColor: ds.color
        ? (ds.color + '30')
        : (i === 0
          ? 'rgba(99,102,241,0.2)'
          : 'rgba(168,85,247,0.2)'),
      borderColor: ds.color || (i === 0 ? '#6366f1' : '#a855f7'),
      borderWidth: 2,
      pointBackgroundColor: ds.color || (i === 0 ? '#6366f1' : '#a855f7'),
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          font: { family: 'Inter', size: 12 },
          color: isDark ? '#cbd5e1' : '#475569',
        },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
        titleColor: isDark ? '#f1f5f9' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { family: 'Inter', size: 10 },
          color: isDark ? '#94a3b8' : '#64748b',
          backdropColor: 'transparent',
        },
        grid: {
          color: isDark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.5)',
        },
        angleLines: {
          color: isDark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.5)',
        },
        pointLabels: {
          font: { family: 'Inter', size: 11 },
          color: isDark ? '#cbd5e1' : '#475569',
        },
      },
    },
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">{title}</h3>
      )}
      <div className="h-80">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
}
