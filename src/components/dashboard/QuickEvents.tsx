import { useAuthStore } from '../../store/auth';
import EventCard from './EventCard';

export default function QuickEvents() {
  const user = useAuthStore((state) => state.user);

  const handleKillMonster = async () => {
    // TODO: Implementar llamada al backend para enviar evento
    console.log('Ejecutando evento: Kill Monster');
    
    // Simular actualización de datos
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Aquí se enviaría el evento al backend:
    // await submitGameEvent({ playerId: user.id, eventType: 'KILL_ENEMY' });
    
    alert('¡Monstruo derrotado! +500 Gold, +1200 XP');
  };

  const handlePlayTime = async () => {
    console.log('Evento de tiempo de juego - Próximamente');
  };

  const events = [
    {
      title: 'Matar Monstruo',
      description: 'Derrota a la Bestia de las Sombras en el Bosque Oscuro.',
      rewards: { gold: 500, xp: 1200 },
      action: 'Derrotar Ahora',
      color: 'red' as const,
      icon: 'skull',
      onAction: handleKillMonster,
    },
    {
      title: '+30 min Jugados',
      description: 'Reclama tu bonificación diaria de tiempo de juego.',
      progress: { current: 26, max: 30 },
      action: 'Reclamar (Pronto)',
      color: 'blue' as const,
      icon: 'schedule',
      disabled: true,
      onAction: handlePlayTime,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Eventos Rápidos</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => (
          <EventCard key={event.title} {...event} />
        ))}
      </div>
    </div>
  );
}
