interface NavigationBadgeProps {
  count: number;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const NavigationBadge = ({ count, type = 'info' }: NavigationBadgeProps) => {
  if (!count || count === 0) return null;

  const colors = {
    info: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
  };

  return (
    <span className={`absolute -top-1 -right-1 min-w-[1.25rem] h-5 ${colors[type]} text-xs font-bold rounded-full flex items-center justify-center px-1`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};