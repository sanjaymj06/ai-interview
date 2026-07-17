import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

export default function PieChart({ data, title, className = '' }) {
  if (!data) return null;

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        data: data.values || [],
        backgroundColor: COLORS.slice(0, (data.values || []).length),
        borderColor: 'rgba(255,255,255,0.8)',
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { family: 'Inter', size: 12 },
          color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
        },
      },
      tooltip: {
        backgroundColor: document.documentElement.classList.contains('dark')
          ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
        titleColor: document.documentElement.classList.contains('dark') ? '#f1f5f9' : '#0f172a',
        bodyColor: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
        borderColor: document.documentElement.classList.contains('dark')
          ? 'rgba(51,65,85,0.5)' : 'rgba(226,232,240,0.5)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((context.parsed / total) * 100).toFixed(1);
            return ` ${context.label}: ${context.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">{title}</h3>
      )}
      <div className="flex justify-center">
        <div className="w-full max-w-sm">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
}
