import { useState } from 'react';
import { LeaderboardPlayer, MetricType } from '../../types/leaderboard.types';
import { getMetricValue, getMetricLabel } from '../../services/leaderboard.service';

interface TableProps {
  players: LeaderboardPlayer[];
  metric: MetricType;
  startRank: number;
}

export const LeaderboardTable = ({ players, metric, startRank }: TableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage, setPlayersPerPage] = useState(20);

  // Calcular paginación
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = players.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(players.length / playersPerPage);

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Manejar cambio de elementos por página
  const handlePlayersPerPageChange = (value: number) => {
    setPlayersPerPage(value);
    setCurrentPage(1); // Reset a la primera página
  };

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 mb-8">
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">leaderboard</span>
            Clasificación General
          </h2>
          
          {/* Selector de elementos por página */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Mostrar:</span>
            <select
              value={playersPerPage}
              onChange={(e) => handlePlayersPerPageChange(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            >
              <option value={5}>5</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-400 text-sm">jugadores</span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-gray-400 text-sm font-bold uppercase">
              <th className="px-6 py-4 text-left">Posición</th>
              <th className="px-6 py-4 text-left">Jugador</th>
              <th className="px-6 py-4 text-right">{getMetricLabel(metric)}</th>
              <th className="px-6 py-4 text-center hidden md:table-cell">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {currentPlayers.map((player, index) => {
              const rank = startRank + indexOfFirstPlayer + index;
              const isTopTen = rank <= 10;
              
              return (
                <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isTopTen ? 'text-purple-400' : 'text-gray-400'}`}>
                        #{rank}
                      </span>
                      {isTopTen && (
                        <span className="material-symbols-outlined text-purple-400 text-sm">
                          trending_up
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-sm">
                          person
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-white">{player.username}</span>
                        <p className="text-gray-500 text-xs">{player.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-purple-400 text-lg">
                      {getMetricValue(player, metric).toLocaleString('es-ES')}
                    </span>
                    <p className="text-gray-500 text-xs">
                      {metric === 'monsters' ? 'eliminados' : 'minutos'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400 text-sm hidden md:table-cell">
                    {new Date(player.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Paginación */}
      {players.length > 0 && totalPages > 1 && (
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Información de paginación */}
            <div className="text-sm text-gray-400">
              Mostrando {indexOfFirstPlayer + 1} a {Math.min(indexOfLastPlayer, players.length)} de {players.length} jugadores
            </div>
            
            {/* Controles de paginación */}
            <div className="flex items-center justify-center gap-1">
              {/* Botón Anterior */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              {/* Números de página */}
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                  disabled={page === '...'}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-purple-600 text-white'
                      : page === '...'
                      ? 'text-gray-500 cursor-default'
                      : 'text-white hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {/* Botón Siguiente */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-white hover:bg-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {players.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">
            sentiment_dissatisfied
          </span>
          <h3 className="text-white text-xl font-bold mb-2">
            No hay más jugadores
          </h3>
          <p className="text-gray-400">
            ¡Los primeros puestos están esperándote!
          </p>
        </div>
      )}
    </div>
  );
};