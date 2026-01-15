export const LeaderboardHeader = () => {
  return (
    <div className="text-center mb-10">
      <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
        Ranking Global
      </h1>
      <p className="text-gray-400 text-lg">
        Compite con otros jugadores y demuestra tu habilidad
      </p>
      
      {/* Indicador decorativo */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-100"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
      </div>
    </div>
  );
};