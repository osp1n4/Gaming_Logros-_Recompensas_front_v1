import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { GlobalHeader } from './GlobalHeader';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from './Footer';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Breadcrumbs dinámicos basados en ruta
  const breadcrumbs = useBreadcrumbs(location.pathname);

  return (
    <div className="min-h-screen bg-background-dark">
      <GlobalHeader />
      
      {isAuthenticated && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      <Footer />
    </div>
  );
};