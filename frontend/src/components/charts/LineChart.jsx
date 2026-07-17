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
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function LineChart({ data, title, className = '' }) {
  if (!data) return null;

  const isDark = document.documentElement.classList.contains('dark');

  const chartData = {
    labels: data.labels || [],
    datasets: (data.datasets || []).map((ds, i) => ({
      label: ds.label || '',
      data: ds.values || [],
      borderColor: ds.color || (i === 0 ? '#6366f1' : '#a855f7'),
      backgroundColor: ds.color
        ? (ds.color + '20')
        : (i === 0
          ? 'rgba(99,102,241,0.1)'
          : 'rgba(168,85,247,0.1)'),
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: ds.color || (i === 0 ? '#6366f1' : '#a855f7'),
      pointBorderWidth: 2,
      borderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
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
        max: 100,
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
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
