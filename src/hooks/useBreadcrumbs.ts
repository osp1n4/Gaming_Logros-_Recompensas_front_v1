interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export const useBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const routes = {
    '/dashboard': 'Panel Principal',
    '/achievements': 'Logros',
    '/rewards': 'Recompensas',
    '/leaderboard': 'Clasificación',
    '/notifications': 'Notificaciones',
    '/login': 'Iniciar Sesión',
    '/register': 'Registro',
  };

  const parts = pathname.split('/').filter(Boolean);
  
  return parts.map((part, index) => {
    const path = '/' + parts.slice(0, index + 1).join('/');
    return {
      label: routes[path] || part.charAt(0).toUpperCase() + part.slice(1),
      path,
      isLast: index === parts.length - 1,
    };
  });
};