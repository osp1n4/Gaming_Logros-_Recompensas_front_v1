interface BalanceCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'yellow' | 'purple';
}

export default function BalanceCard({ title, value, icon, color }: BalanceCardProps) {
  const colorMap = {
    yellow: { 
      bg: 'bg-yellow-500/20', 
      text: 'text-yellow-400', 
      border: 'border-yellow-500/50' 
    },
    purple: { 
      bg: 'bg-purple-500/20', 
      text: 'text-purple-400', 
      border: 'border-purple-500/50' 
    },
  };

  const colors = colorMap[color];

  return (
    <div className={`${colors.bg} border-2 ${colors.border} p-8 rounded-xl flex items-center justify-between hover:shadow-lg transition-all`}>
      <div className="flex flex-col">
        <p className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-widest">
          {title}
        </p>
        <h3 className={`${colors.text} text-5xl font-black`}>{value}</h3>
      </div>
      <div className={`${colors.bg} rounded-full p-4 flex items-center justify-center`}>
        <span className={`material-symbols-outlined ${colors.text} text-5xl`}>
          {icon}
        </span>
      </div>
    </div>
  );
}
