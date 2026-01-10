import DashboardLayout from '../components/layout/DashboardLayout';

export default function Leaderboard() {
  return (
    <DashboardLayout>
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
        Clasificación Global
      </h1>
      <p className="text-gray-400">Vista temporal del ranking global (Fase 5).</p>
    </DashboardLayout>
  );
}
