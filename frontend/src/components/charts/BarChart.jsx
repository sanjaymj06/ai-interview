import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ data, title, horizontal = false, className = '' }) {
  if (!data) return null;

  const isDark = document.documentElement.classList.contains('dark');

  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((ds, i) => ({
      label: ds.label || '',
      data: ds.values || [],
      backgroundColor: ds.color || (i === 0
        ? (isDark
          ? 'rgba(99,102,241,0.7)'
          : 'rgba(99,102,241,0.6)')
        : (isDark
          ? 'rgba(168,85,247,0.7)'
          : 'rgba(168,85,247,0.6)')),
      borderColor: ds.color || (i === 0 ? '#6366f1' : '#a855f7'),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    })),
  };

  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: (data.datasets || []).length > 1,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 16,
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
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: 'Inter' },
          color: isDark ? '#94a3b8' : '#64748b',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.5)',
        },
        ticks: {
          font: { family: 'Inter' },
          color: isDark ? '#94a3b8' : '#64748b',
          callback: (value) => value + '%',
        },
      },
    },
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">{title}</h3>
      )}
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
