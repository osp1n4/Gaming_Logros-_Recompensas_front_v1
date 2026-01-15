import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/auth';
import StatsGrid from '../components/dashboard/StatsGrid';
import QuickEvents from '../components/dashboard/QuickEvents';
import RecentAchievements from '../components/dashboard/RecentAchievements';
import LatestRewards from '../components/dashboard/LatestRewards';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Panel Principal
        </h1>
        <p className="text-gray-400 mt-2">
          Bienvenido de nuevo, <span className="text-purple-300 font-semibold">{user?.username}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid />
      </div>

      {/* Quick Events */}
      <div className="mb-8">
        <QuickEvents />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentAchievements />
        <LatestRewards />
      </div>
    </DashboardLayout>
  );
}
