interface Player {
  id: string;
  username: string;
  level: number;
  xp: number;
  coins: number;
}

interface RewardsHeaderProps {
  player?: Player | null;
}

export default function RewardsHeader({ player }: RewardsHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Recompensas y Balance
          </h1>
          <p className="text-gray-400">
            Gestiona tus recompensas y rastrea tus ganancias
          </p>
        </div>
        {player && (
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-xl px-6 py-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-400 text-3xl">
                military_tech
              </span>
              <div>
                <p className="text-gray-400 text-sm">Nivel Actual</p>
                <p className="text-white text-xl font-bold">Nivel {player.level}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
