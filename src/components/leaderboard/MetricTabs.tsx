import { MetricType } from '../../types/leaderboard.types';

interface MetricTabsProps {
  metric: MetricType;
  onMetricChange: (metric: MetricType) => void;
}

export const MetricTabs = ({ metric, onMetricChange }: MetricTabsProps) => {
  const metrics = [
    { id: 'monsters' as MetricType, label: 'Monstruos Eliminados', icon: 'psychology' },
    { id: 'time' as MetricType, label: 'Tiempo Jugado', icon: 'schedule' },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex bg-gray-800 rounded-xl p-2">
        {metrics.map((m) => (
          <button
            key={m.id}
            onClick={() => onMetricChange(m.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              metric === m.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};