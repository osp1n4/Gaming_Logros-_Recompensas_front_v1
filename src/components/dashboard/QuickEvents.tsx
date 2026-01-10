import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth';
import { submitGameEvent } from '../../services/player.service';
import { getPlayerAchievements } from '../../services/achievement.service';
import { getPlayerBalance } from '../../services/reward.service';
import EventCard from './EventCard';
import { useEffect, useState } from 'react';

export default function QuickEvents() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [previousAchievements, setPreviousAchievements] = useState<any[]>([]);

  // Cargar logros iniciales
  useEffect(() => {
    if (user?.id) {
      getPlayerAchievements(user.id).then(achievements => {
        setPreviousAchievements(achievements.filter(a => a.unlockedAt !== null));
      }).catch(() => {});
    }
  }, [user?.id]);

  const submitEventMutation = useMutation({
    mutationFn: submitGameEvent,
    onSuccess: async () => {
      // Invalidar todas las queries relevantes
      await queryClient.invalidateQueries({ queryKey: ['player', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['achievements', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['rewards', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['balance', user?.id] });
      
      // Esperar un momento para que los datos se actualicen en el backend
      setTimeout(async () => {
        try {
          // Obtener logros actualizados para detectar nuevos desbloqueados
          const currentAchievements = await getPlayerAchievements(user!.id);
          const unlockedAchievements = currentAchievements.filter(a => a.unlockedAt !== null);
          
          // Detectar nuevos logros desbloqueados
          const newUnlocked = unlockedAchievements.filter(current => 
            !previousAchievements.some(prev => prev.achievementId === current.achievementId)
          );
          
          if (newUnlocked.length > 0) {
            // Obtener balance actualizado
            const balance = await getPlayerBalance(user!.id);
            
            // Mostrar notificación de logros desbloqueados
            const achievementNames = newUnlocked.map(a => a.achievement.name).join(', ');
            alert(`🎉 ¡Logro Desbloqueado! ${achievementNames}\n\n` +
                  `💰 Monedas: ${balance.totalCoins}\n` +
                  `⭐ Puntos: ${balance.totalPoints}`);
            
            // Actualizar el estado de logros previos
            setPreviousAchievements(unlockedAchievements);
          } else {
            alert('✅ ¡Evento registrado exitosamente!');
          }
        } catch (error) {
          console.error('Error al verificar logros:', error);
          alert('✅ ¡Evento registrado exitosamente!');
        }
      }, 1000); // Esperar 1 segundo para que el backend procese
    },
    onError: (error: any) => {
      console.error('Error completo al enviar evento:', error);
      console.error('Error response:', error?.response);
      console.error('Error message:', error?.message);
      
      let errorMessage = 'Error desconocido';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.code) {
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'No se puede conectar al backend. ¿Está corriendo en http://localhost:3001?';
        } else {
          errorMessage = `Error de conexión: ${error.code}`;
        }
      }
      
      alert(`Error al registrar evento: ${errorMessage}`);
    },
  });

  const handleEventSubmit = (eventType: string, value: number = 1) => {
    console.log('Usuario completo:', user);
    console.log('ID del jugador:', user?.id);
    console.log('Tipo de evento:', eventType);
    console.log('Valor:', value);
    
    if (!user?.id) {
      alert('Error: No se encontró el ID del jugador');
      return;
    }
    
    const eventData = {
      playerId: user.id,
      eventType,
      value,
    };
    
    console.log('Datos del evento a enviar:', eventData);
    console.log('URL del backend:', 'http://localhost:3001/players/events');
    
    submitEventMutation.mutate(eventData);
  };

  const events = [
    {
      title: 'Matar Monstruo',
      description: 'Derrota un enemigo y gana recompensas.',
      action: 'Derrotar Ahora',
      color: 'red' as const,
      icon: 'skull',
      onAction: () => handleEventSubmit('monster_killed', 1),
      loading: submitEventMutation.isPending,
    },
    {
      title: 'Tiempo de Juego',
      description: 'Registra tu sesión de juego.',
      action: 'Registrar Tiempo',
      color: 'blue' as const,
      icon: 'schedule',
      onAction: () => handleEventSubmit('time_played', 10),
      loading: submitEventMutation.isPending,
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
