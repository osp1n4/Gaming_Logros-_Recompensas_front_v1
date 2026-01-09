import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Achievements from './pages/Achievements';
import Rewards from './pages/Rewards';
import Leaderboard from './pages/Leaderboard';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/achievements" element={<Achievements />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="*" element={<div>404</div>} />
    </Routes>
  );
}
