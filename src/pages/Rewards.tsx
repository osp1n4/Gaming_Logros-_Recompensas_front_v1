import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/layout/DashboardLayout';
import RewardsHeader from '../components/rewards/RewardsHeader';
import TabNavigation from '../components/rewards/TabNavigation';
import AssignedRewards from '../components/rewards/AssignedRewards';
import ClaimedRewards from '../components/rewards/ClaimedRewards';
import MyBalance from '../components/rewards/MyBalance';
import { getAssignedRewards, getClaimedRewards } from '../services/reward.service';
import { useAuthStore } from '../store/auth';
import { RewardTabType } from '../types/reward.types';

export default function Rewards() {
  const user = useAuthStore((s) => s.user);
  const playerId = user?.id;
  const [activeTab, setActiveTab] = useState<RewardTabType>('assigned');

  // Obtener contadores para los tabs
  const { data: assignedRewards } = useQuery({
    queryKey: ['rewards', 'assigned', playerId],
    queryFn: () => getAssignedRewards(playerId!),
    enabled: !!playerId,
  });

  const { data: claimedRewards } = useQuery({
    queryKey: ['rewards', 'claimed', playerId],
    queryFn: () => getClaimedRewards(playerId!),
    enabled: !!playerId,
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'assigned':
        return <AssignedRewards />;
      case 'claimed':
        return <ClaimedRewards />;
      case 'balance':
        return <MyBalance />;
      default:
        return <AssignedRewards />;
    }
  };

  return (
    <DashboardLayout>
      <RewardsHeader player={user?.player} />
      
      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        assignedCount={assignedRewards?.length || 0}
        claimedCount={claimedRewards?.length || 0}
      />

      {renderTabContent()}
    </DashboardLayout>
  );
}
