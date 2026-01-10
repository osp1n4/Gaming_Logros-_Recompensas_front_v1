import { useState, useEffect } from 'react';
import { AchievementFilterType } from '../../types/achievement.types';

interface ToolbarProps {
  filter: AchievementFilterType;
  onFilterChange: (filter: AchievementFilterType) => void;
  onSearch: (query: string) => void;
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function Toolbar({ filter, onFilterChange, onSearch }: ToolbarProps) {
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  const filters: { id: AchievementFilterType; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'unlocked', label: 'Desbloqueados' },
    { id: 'locked', label: 'Bloqueados' },
    { id: 'timed', label: 'Temporales' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      {/* Filtros */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f.id
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Búsqueda */}
      <div className="flex-1 min-w-[300px] max-w-md relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar logros..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>
    </div>
  );
}
