# Plan de Implementación del Frontend por Fases

Este plan describe paso a paso la implementación del frontend, conectándolo con los microservicios del backend (`player-service`, `achievement-service`, `reward-service`). Cada fase corresponde a un diseño específico en `stitch_registration_and_login_screen` y debe implementarse en orden secuencial aplicando buenas prácticas de desarrollo de software.

---

## 📋 Principios y Lineamientos Transversales

### Arquitectura y Stack Tecnológico
- **Framework:** React 18+ con TypeScript
- **Build Tool:** Vite 5+ (rápido, HMR optimizado)
- **Routing:** React Router v6 con rutas tipadas
- **Estado Global:** 
  - Zustand o Context API para estado de autenticación
  - React Query (TanStack Query) para cache y sincronización de datos del servidor
- **Estilos:** Tailwind CSS 3+ (ya usado en los diseños HTML)
- **HTTP Client:** Axios con interceptores para autenticación y manejo de errores

### Estructura de Carpetas
```
frontend/
├── src/
│   ├── api/              # Clientes API por servicio
│   │   ├── player.api.ts
│   │   ├── achievement.api.ts
│   │   └── reward.api.ts
│   ├── components/       # Componentes reutilizables
│   │   ├── common/       # Button, Input, Modal, Card, etc.
│   │   ├── layout/       # Header, Sidebar, Footer
│   │   └── features/     # Componentes por dominio
│   ├── pages/            # Páginas completas (una por fase)
│   ├── hooks/            # Custom hooks
│   ├── store/            # Estado global
│   ├── types/            # Tipos TypeScript (sincronizados con DTOs backend)
│   ├── utils/            # Utilidades, helpers, constantes
│   ├── styles/           # CSS global, temas Tailwind
│   └── App.tsx           # Punto de entrada
├── public/               # Assets estáticos
└── tests/                # Tests unitarios e integración
```

### Estándares de Código
- **Linting:** ESLint + Prettier
- **Commits:** Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`)
- **Code Review:** Mínimo 1 aprobación antes de merge
- **Testing:** Cobertura mínima 80% en lógica de negocio

### Seguridad
- JWT almacenado en `httpOnly` cookies (configurar proxy en desarrollo)
- Sanitización de inputs (librería DOMPurify)
- Content Security Policy headers
- Validación client-side con Zod (sincronizada con validaciones backend)
- HTTPS obligatorio en producción

### Accesibilidad (WCAG 2.1 AA)
- Navegación completa con teclado
- ARIA labels y roles apropiados
- Contraste mínimo 4.5:1 para texto
- Focus visible en elementos interactivos
- Screen reader friendly

### Performance
- Code splitting por ruta
- Lazy loading de imágenes y componentes pesados
- Virtualización de listas largas (react-window)
- Optimización de re-renders (React.memo, useMemo, useCallback)
- Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

---

## 🎯 Fase 1: Registro e Inicio de Sesión

**Diseño base:** `1 registration_and_login_screen/code.html`

### Objetivo
Implementar el sistema completo de autenticación permitiendo a los usuarios registrarse e iniciar sesión con validaciones robustas y experiencia visual atractiva (neon glow effects).

### Pasos de Implementación

#### 1.1 Setup del Proyecto
```bash
# Crear proyecto con Vite
npm create vite@latest gaming-frontend -- --template react-ts
cd gaming-frontend
npm install

# Dependencias core
npm install react-router-dom axios zustand @tanstack/react-query zod react-hook-form
npm install -D @types/node tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Dependencias de desarrollo y testing
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D vitest @vitest/ui jsdom msw
```

#### 1.2 Configurar Tailwind con Tema Custom
- Migrar configuración de `tailwind.config` del HTML al proyecto
- Agregar colores personalizados: `primary: #8640e7`, fondos dark, etc.
- Configurar animaciones neon-glow en CSS global

#### 1.3 Crear Tipos TypeScript Sincronizados
```typescript
// src/types/player.types.ts
export interface CreatePlayerDto {
  username: string;
  email: string;
  password: string;
}

export interface PlayerResponseDto {
  id: string;
  username: string;
  email: string;
  coins: number;
  xp: number;
  level: number;
  createdAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  player: PlayerResponseDto;
  token: string;
}
```

#### 1.4 Cliente API para Player Service
```typescript
// src/api/player.api.ts
import axios from 'axios';

const API_BASE = import.meta.env.VITE_PLAYER_SERVICE_URL || 'http://localhost:3001';

const playerApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Para cookies httpOnly
});

export const registerPlayer = async (data: CreatePlayerDto): Promise<PlayerResponseDto> => {
  const response = await playerApi.put('/players', data);
  return response.data;
};

export const loginPlayer = async (data: LoginDto): Promise<AuthResponse> => {
  const response = await playerApi.post('/auth/login', data);
  return response.data;
};

export const getPlayerProfile = async (): Promise<PlayerResponseDto> => {
  const response = await playerApi.get('/players/me');
  return response.data;
};
```

#### 1.5 Store de Autenticación (Zustand)
```typescript
// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  player: PlayerResponseDto | null;
  isAuthenticated: boolean;
  setPlayer: (player: PlayerResponseDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      player: null,
      isAuthenticated: false,
      setPlayer: (player) => set({ player, isAuthenticated: true }),
      logout: () => set({ player: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

#### 1.6 Componentes Reutilizables
- **`<Input />`**: Input controlado con validación, iconos Material Symbols, estados error/success
- **`<Button />`**: Botón con variantes (primary, secondary), loading state, neon-glow hover
- **`<AuthLayout />`**: Layout wrapper con mesh background y efectos visuales

#### 1.7 Página de Registro
```typescript
// src/pages/Register.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { registerPlayer } from '../api/player.api';

const registerSchema = z.object({
  username: z.string().min(3, 'Mínimo 3 caracteres').max(20),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[0-9]/, 'Debe contener número'),
});

export const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });
  
  const mutation = useMutation({
    mutationFn: registerPlayer,
    onSuccess: (data) => {
      // Redirigir a login o auto-login
    },
    onError: (error) => {
      // Mostrar toast de error
    },
  });

  const onSubmit = (data) => mutation.mutate(data);

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Implementar según diseño HTML */}
      </form>
    </AuthLayout>
  );
};
```

#### 1.8 Página de Login
- Similar a registro, usando `loginPlayer` API
- Al éxito: guardar player en store y redirigir a dashboard
- Implementar "Forgot Password" como placeholder (fase futura)

#### 1.9 Rutas Protegidas
```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
```

#### 1.10 Testing
```typescript
// src/pages/__tests__/Register.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Register } from '../Register';
import { server } from '../../mocks/server'; // MSW mock server

test('muestra errores de validación', async () => {
  render(<Register />);
  const submitBtn = screen.getByRole('button', { name: /register/i });
  await userEvent.click(submitBtn);
  
  expect(await screen.findByText(/mínimo 3 caracteres/i)).toBeInTheDocument();
});

test('registro exitoso redirige a dashboard', async () => {
  // Mock API success response
  // Test flow
});
```

### Criterios de Aceptación
- [ ] Usuario puede registrarse con validaciones en tiempo real
- [ ] Usuario puede iniciar sesión y el token se almacena de forma segura
- [ ] Errores del backend se muestran claramente en el formulario
- [ ] Animaciones neon-glow funcionan correctamente
- [ ] Responsive en móvil, tablet y desktop
- [ ] Navegación con teclado (tab, enter) funciona
- [ ] Screen reader puede navegar el formulario
- [ ] Tests unitarios con cobertura >80%

### Endpoints Backend Utilizados
- `PUT /players` → Registro (player-service)
- `POST /auth/login` → Login (player-service)
- `GET /players/me` → Obtener perfil autenticado

---

---

## 🎯 Fase 2: Panel del Jugador (Dashboard Overview)

**Diseño base:** `2 player_dashboard_overview/code.html`

### Objetivo
Crear el panel principal del jugador con sidebar de navegación, widgets de estadísticas en tiempo real (coins, XP, achievements, level) y eventos rápidos interactivos.

### Pasos de Implementación

#### 2.1 Layout Maestro con Sidebar
```typescript
// src/components/layout/DashboardLayout.tsx
export const DashboardLayout = ({ children }) => {
  const { player } = useAuthStore();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <TopBar />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
```

**Componentes:**
- **`<Sidebar />`**: Navegación con items activos, iconos Material Symbols, perfil básico del jugador al final (nombre, id)
- **`<TopBar />`**: Notificaciones y balance de coins/saldo (omitir búsqueda y settings - no soportados por backend)
- Implementar estados hover y active según diseño

#### 2.2 Hooks Custom para Datos Agregados
```typescript
// src/hooks/usePlayerDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { getPlayerById } from '../api/player.api';
import { getPlayerAchievements } from '../api/achievement.api';
import { getPlayerRewards, getPlayerBalance } from '../api/reward.api';

export const usePlayerDashboard = (playerId: string) => {
  const playerQuery = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => getPlayerById(playerId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!playerId,
  });

  const achievementsQuery = useQuery({
    queryKey: ['achievements', playerId],
    queryFn: () => getPlayerAchievements(playerId),
    enabled: !!playerId,
  });

  const rewardsQuery = useQuery({
    queryKey: ['rewards', playerId],
    queryFn: () => getPlayerRewards(playerId),
    enabled: !!playerId,
  });

  const balanceQuery = useQuery({
    queryKey: ['balance', playerId],
    queryFn: () => getPlayerBalance(playerId),
    enabled: !!playerId,
  });

  return {
    player: playerQuery.data,
    achievements: achievementsQuery.data,
    rewards: rewardsQuery.data,
    balance: balanceQuery.data,
    isLoading: playerQuery.isLoading || achievementsQuery.isLoading,
    error: playerQuery.error || achievementsQuery.error,
  };
};
```

#### 2.3 Clientes API Adicionales
```typescript
// src/api/player.api.ts
const PLAYER_BASE = import.meta.env.VITE_PLAYER_SERVICE_URL || 'http://localhost:3001';

export const getPlayerById = async (playerId: string) => {
  const res = await axios.get(`${PLAYER_BASE}/players/${playerId}`);
  return res.data;
};

export const submitGameEvent = async (eventData: GameEventDto) => {
  const res = await axios.post(`${PLAYER_BASE}/players/events`, eventData);
  return res.data;
};

// src/api/achievement.api.ts
const ACHIEVEMENT_BASE = import.meta.env.VITE_ACHIEVEMENT_SERVICE_URL || 'http://localhost:3002';

export const getPlayerAchievements = async (playerId: string) => {
  const res = await axios.get(`${ACHIEVEMENT_BASE}/achievements/players/${playerId}`);
  return res.data;
};

// src/api/reward.api.ts
const REWARD_BASE = import.meta.env.VITE_REWARD_SERVICE_URL || 'http://localhost:3003';

export const getPlayerRewards = async (playerId: string) => {
  const res = await axios.get(`${REWARD_BASE}/rewards/players/${playerId}`);
  return res.data;
};

export const getPlayerBalance = async (playerId: string) => {
  const res = await axios.get(`${REWARD_BASE}/rewards/balance/${playerId}`);
  return res.data;
};
```

#### 2.4 Widgets de Estadísticas (Stats Grid)
```typescript
// src/components/features/dashboard/StatsGrid.tsx
export const StatsGrid = () => {
  const { player } = useAuthStore();
  const { achievements, balance } = usePlayerDashboard(player!.id);

  const unlockedCount = achievements?.filter(a => a.progress >= a.targetValue).length || 0;
  const totalAchievements = achievements?.length || 0;

  const stats = [
    {
      label: 'Coins',
      value: player?.coins?.toLocaleString() || '0',
      icon: 'payments',
      color: 'yellow',
    },
    {
      label: 'Experience Points',
      value: `${player?.xp?.toLocaleString() || '0'} XP`,
      icon: 'bolt',
      color: 'primary',
    },
    {
      label: 'Achievements',
      value: `${unlockedCount} Unlocked`,
      icon: 'emoji_events',
      color: 'pink',
      badge: `${unlockedCount}/${totalAchievements}`,
    },
    {
      label: 'Current Level',
      value: `Level ${player?.level || 1}`,
      icon: 'military_tech',
      color: 'blue',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};
```

#### 2.5 Componente StatCard Reutilizable
- Variantes de borde por color (neon-border-gold, purple, pink, blue)
- Efecto hover con animación
- Estados de loading con skeleton
- Badges y cambios porcentuales

#### 2.6 Sección de Eventos Rápidos (Quick Events)
```typescript
// src/components/features/dashboard/QuickEvents.tsx
export const QuickEvents = () => {
  const { player } = useAuthStore();
  const queryClient = useQueryClient();

  const submitEventMutation = useMutation({
    mutationFn: (eventData: GameEventDto) => submitGameEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries(['player', player?.id]);
      queryClient.invalidateQueries(['achievements', player?.id]);
      // Mostrar toast de éxito
    },
  });

  const events = [
    {
      title: 'Kill Monster',
      description: 'Defeat an enemy and earn rewards.',
      action: 'Slay Now',
      color: 'red',
      icon: 'skull',
      eventType: 'KILL_ENEMY',
    },
    {
      title: 'Play Time',
      description: 'Register your gameplay session.',
      action: 'Log Time',
      color: 'blue',
      icon: 'schedule',
      eventType: 'TIME_PLAYED',
    },
  ];

  const handleEventSubmit = (eventType: string) => {
    if (!player?.id) return;
    
    submitEventMutation.mutate({
      playerId: player.id,
      eventType,
      metadata: {}, // Datos adicionales según el tipo de evento
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.title}
          {...event}
          onAction={() => handleEventSubmit(event.eventType)}
          loading={submitEventMutation.isPending}
        />
      ))}
    </div>
  );
};
```

#### 2.7 Sección de Logros Recientes y Últimas Recompensas
- **Recent Achievements**: Lista con progress bars basado en `progress/targetValue`, nombre e iconos del achievement
- **Latest Rewards**: Lista simple con tipo de recompensa, cantidad otorgada y fecha de obtención (según estructura del backend)
- Botones "View All" que navegan a las páginas correspondientes (Fase 3 y 4)

**Nota**: Mostrar solo datos disponibles del backend. No inventar rarities o fuentes si no están en la respuesta API.

#### 2.8 Manejo de Estados de Carga
```typescript
// src/components/common/SkeletonCard.tsx
export const SkeletonCard = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-8 bg-gray-700 rounded mb-4" />
    <div className="h-4 bg-gray-700 rounded w-3/4" />
  </div>
);

// Uso en Dashboard:
{isLoading ? (
  <div className="grid grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
  </div>
) : (
  <StatsGrid />
)}
```

#### 2.9 Testing
```typescript
// src/pages/__tests__/Dashboard.test.tsx
test('renderiza stats del jugador correctamente', async () => {
  render(<Dashboard />);
  
  await waitFor(() => {
    expect(screen.getByText(/12,500\.00/i)).toBeInTheDocument(); // Coins
    expect(screen.getByText(/4,200 XP/i)).toBeInTheDocument();
  });
});

test('botón de evento rápido ejecuta acción', async () => {
  const user = userEvent.setup();
  render(<Dashboard />);
  
  const slayBtn = await screen.findByRole('button', { name: /slay now/i });
  await user.click(slayBtn);
  
  // Verificar que se llamó la API y se actualizaron los datos
});
```

### Criterios de Aceptación
- [ ] Dashboard carga y muestra todas las estadísticas del jugador
- [ ] Navegación del sidebar funciona y marca la sección activa
- [ ] Eventos rápidos son interactivos y actualizan los datos
- [ ] Progress bars reflejan el progreso real de achievements
- [ ] Estados de carga muestran skeletons apropiados
- [ ] Datos se cachean y refrescan según invalidaciones de React Query
- [ ] Responsive en todos los breakpoints
- [ ] Tests e2e validan flujo completo de navegación

### Endpoints Backend Utilizados
- `GET /players/:id` → Obtener datos del jugador
- `GET /achievements/players/:playerId` → Logros del jugador
- `GET /rewards/players/:playerId` → Recompensas del jugador
- `POST /players/events` → Enviar evento de juego
- `GET /rewards/balance/:playerId` → Balance total

---

---

## 🎯 Fase 3: Cuadrícula de Logros (Achievements Progress Grid)

**Diseño base:** `3. achievements_progress_grid/code.html`

### Objetivo
Implementar una vista completa de logros con filtros (All/Unlocked/Locked/Timed), búsqueda, progress tracking, y estados visuales diferenciados (desbloqueado, en progreso, limitado por tiempo, bloqueado).

### Pasos de Implementación

#### 3.1 Página de Achievements
```typescript
// src/pages/Achievements.tsx
export const AchievementsPage = () => {
  const { player } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'timed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', player?.id, filter],
    queryFn: () => getPlayerAchievements(player!.id),
  });

  const filteredAchievements = useMemo(() => {
    let result = achievements || [];
    
    // Filtrar por tipo
    if (filter === 'unlocked') result = result.filter(a => a.isUnlocked);
    if (filter === 'locked') result = result.filter(a => !a.isUnlocked && !a.progress);
    if (filter === 'timed') result = result.filter(a => a.isTimed && !a.isUnlocked);
    
    // Buscar por nombre o descripción
    if (searchQuery) {
      result = result.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [achievements, filter, searchQuery]);

  return (
    <DashboardLayout>
      <AchievementsHeader />
      <StatsOverview achievements={achievements} />
      <OverallProgress achievements={achievements} />
      <Toolbar filter={filter} onFilterChange={setFilter} onSearch={setSearchQuery} />
      <AchievementGrid achievements={filteredAchievements} isLoading={isLoading} />
      <Pagination />
    </DashboardLayout>
  );
};
```

#### 3.2 Header con Estadísticas Globales
```typescript
// src/components/features/achievements/StatsOverview.tsx
export const StatsOverview = ({ achievements }) => {
  const totalXP = achievements?.reduce((sum, a) => sum + (a.isUnlocked ? a.xpReward : 0), 0);
  const completionRate = achievements ? 
    (achievements.filter(a => a.isUnlocked).length / achievements.length) * 100 : 0;
  
  const stats = [
    {
      label: 'Total XP',
      value: totalXP.toLocaleString(),
      icon: 'bolt',
      trend: '+150% this week',
      trendColor: 'green',
    },
    {
      label: 'Completion',
      value: `${Math.round(completionRate)}%`,
      icon: 'analytics',
      progress: completionRate,
    },
    {
      label: 'Global Rank',
      value: 'Elite',
      icon: 'military_tech',
      subtitle: 'Top 5% of players',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
    </div>
  );
};
```

#### 3.3 Barra de Progreso General ("Grandmaster Journey")
```typescript
// src/components/features/achievements/OverallProgress.tsx
export const OverallProgress = ({ achievements }) => {
  const unlocked = achievements?.filter(a => a.isUnlocked).length || 0;
  const total = achievements?.length || 200;
  const percentage = (unlocked / total) * 100;

  return (
    <div className="bg-card-dark border rounded-xl p-6 mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-white text-lg font-bold">Grandmaster Journey</h3>
          <p className="text-slate-400 text-sm">{total - unlocked} achievements left to reach Grandmaster</p>
        </div>
        <p className="text-primary text-2xl font-black italic">{unlocked}/{total}</p>
      </div>
      <div className="rounded-full bg-border-dark p-1">
        <div 
          className="h-4 rounded-full bg-gradient-to-r from-primary to-purple-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

#### 3.4 Toolbar con Filtros y Búsqueda
```typescript
// src/components/features/achievements/Toolbar.tsx
export const Toolbar = ({ filter, onFilterChange, onSearch }) => {
  const [localSearch, setLocalSearch] = useState('');
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch]);

  const filters = [
    { id: 'all', label: 'All', active: true },
    { id: 'unlocked', label: 'Unlocked' },
    { id: 'locked', label: 'Locked' },
    { id: 'timed', label: 'Timed' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => onFilterChange(f.id)}
            className={`px-5 py-2 rounded-lg font-medium ${
              filter === f.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-card-dark border border-border-dark hover:border-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-[300px] max-w-md">
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search achievements by name or description..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-card-dark border border-border-dark"
        />
      </div>
    </div>
  );
};
```

#### 3.5 Grid de Achievement Cards
```typescript
// src/components/features/achievements/AchievementGrid.tsx
export const AchievementGrid = ({ achievements, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => <SkeletonAchievementCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {achievements.map(achievement => (
        <AchievementCard key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
};
```

#### 3.6 Componente AchievementCard con Estados
```typescript
// src/components/features/achievements/AchievementCard.tsx
interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard = ({ achievement }: AchievementCardProps) => {
  const getCardStyle = () => {
    if (achievement.isUnlocked) {
      return 'border-2 border-yellow-500/50 glow-gold';
    }
    if (achievement.progress > 0) {
      return 'border-2 border-primary glow-primary';
    }
    if (achievement.isTimed && !achievement.isUnlocked) {
      return 'border-2 pulse-orange';
    }
    return 'bg-card-dark/40 border-2 border-transparent opacity-60 grayscale';
  };

  return (
    <div className={`flex flex-col gap-4 rounded-xl p-5 transition-all hover:-translate-y-1 ${getCardStyle()}`}>
      {/* Header con icono y estado */}
      <div className="flex justify-between items-start">
        <div className={`size-14 rounded-lg flex items-center justify-center ${
          achievement.isUnlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
            : 'bg-primary/20 border border-primary/40'
        }`}>
          <span className="material-symbols-outlined text-3xl">
            {achievement.icon || 'emoji_events'}
          </span>
        </div>
        {achievement.isUnlocked && (
          <span className="material-symbols-outlined text-yellow-500 fill-1">check_circle</span>
        )}
        {achievement.isTimed && !achievement.isUnlocked && (
          <div className="flex items-center gap-1 text-orange-500 animate-pulse">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span className="text-xs font-black">{achievement.timeRemaining}</span>
          </div>
        )}
      </div>

      {/* Título y descripción */}
      <div>
        <h4 className="text-white font-bold text-lg">{achievement.name}</h4>
        <p className="text-slate-400 text-sm line-clamp-2">{achievement.description}</p>
      </div>

      {/* Footer: Progress o Recompensas */}
      {achievement.progress > 0 && !achievement.isUnlocked ? (
        <div className="mt-auto pt-4 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Progress</span>
            <span>{achievement.currentValue}/{achievement.targetValue}</span>
          </div>
          <div className="w-full bg-border-dark h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full"
              style={{ width: `${achievement.progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-auto pt-4 border-t border-border-dark flex justify-between items-center">
          <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
            {achievement.rarity || 'Common'}
          </span>
          <span className="text-white text-xs px-2 py-1 bg-primary rounded">
            {achievement.xpReward} XP
          </span>
        </div>
      )}
    </div>
  );
};
```

#### 3.7 Modal de Detalle de Achievement (onClick)
```typescript
// src/components/features/achievements/AchievementModal.tsx
export const AchievementModal = ({ achievementId, onClose }) => {
  const { data: achievement } = useQuery({
    queryKey: ['achievement', achievementId],
    queryFn: () => getAchievementById(achievementId),
    enabled: !!achievementId,
  });

  const trackMutation = useMutation({
    mutationFn: () => trackAchievement(achievementId),
    onSuccess: () => {
      // Mostrar toast "Achievement tracked!"
      onClose();
    },
  });

  return (
    <Modal isOpen onClose={onClose}>
      <div className="bg-card-dark rounded-2xl max-w-[500px]">
        {/* Header con icono grande y efecto neon */}
        <div className="h-48 flex items-center justify-center bg-gradient-to-b from-primary/20">
          <div className="size-24 rounded-2xl bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center border-2 border-white/20">
            <span className="material-symbols-outlined text-5xl text-white">
              {achievement?.icon}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">{achievement?.name}</h2>
          <p className="text-slate-400 mb-6">{achievement?.description}</p>

          {/* Progress */}
          {achievement?.progress > 0 && (
            <ProgressSection achievement={achievement} />
          )}

          {/* Rewards */}
          <RewardsSection rewards={achievement?.rewards} />

          {/* Actions */}
          <button 
            onClick={() => trackMutation.mutate()}
            className="w-full h-12 bg-primary rounded-xl font-bold hover:bg-primary/90"
          >
            Track Objective
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

#### 3.8 Paginación
```typescript
// src/components/features/achievements/Pagination.tsx
export const Pagination = ({ currentPage, totalPages, onChange }) => {
  return (
    <div className="mt-12 flex items-center justify-center gap-4">
      <button 
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="h-10 w-10 rounded-lg border disabled:opacity-50"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      
      <div className="flex gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i + 1)}
            className={`h-10 w-10 rounded-lg ${
              currentPage === i + 1 ? 'bg-primary' : 'border hover:bg-primary/20'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button 
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="h-10 w-10 rounded-lg border disabled:opacity-50"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
};
```

#### 3.9 Testing
```typescript
// src/pages/__tests__/Achievements.test.tsx
test('filtrar por unlocked muestra solo logros desbloqueados', async () => {
  render(<AchievementsPage />);
  
  const unlockedBtn = screen.getByRole('button', { name: /unlocked/i });
  await userEvent.click(unlockedBtn);
  
  const cards = screen.getAllByTestId('achievement-card');
  cards.forEach(card => {
    expect(card).toHaveClass('border-yellow-500');
  });
});

test('búsqueda filtra achievements por nombre', async () => {
  render(<AchievementsPage />);
  
  const searchInput = screen.getByPlaceholderText(/search achievements/i);
  await userEvent.type(searchInput, 'Dragon');
  
  await waitFor(() => {
    expect(screen.getByText(/dragon slayer/i)).toBeInTheDocument();
    expect(screen.queryByText(/arena master/i)).not.toBeInTheDocument();
  });
});
```

### Criterios de Aceptación
- [ ] Grid muestra todos los achievements con estados visuales correctos
- [ ] Filtros (All/Unlocked/Locked/Timed) funcionan correctamente
- [ ] Búsqueda en tiempo real con debounce de 300ms
- [ ] Progress bars reflejan el progreso preciso de cada logro
- [ ] Modal de detalle muestra información completa y botón "Track"
- [ ] Paginación funciona y carga datos dinámicamente
- [ ] Achievements con tiempo limitado muestran countdown
- [ ] Responsive en todos los breakpoints
- [ ] Tests cubren filtros, búsqueda y paginación

### Endpoints Backend Utilizados
- `GET /achievements` → Todos los achievements disponibles
- `GET /achievements/players/:playerId` → Progress del jugador
- `GET /achievements/players/:playerId/:achievementId/progress` → Detalle de progreso
- `POST /achievements/:id/track` → Marcar como objetivo activo (si existe)

---

---

## 🎯 Fase 4: Recompensas y Balance del Jugador

**Diseño base:** `4. player_rewards_and_balance/code.html`

### Objetivo
Implementar sistema completo de gestión de recompensas con tabs (Assigned/Claimed/My Balance), claiming de recompensas, visualización de balance total y galería de inventario.

### Pasos de Implementación

#### 4.1 Página de Rewards con Tabs
```typescript
// src/pages/Rewards.tsx
type TabType = 'assigned' | 'claimed' | 'balance';

export const RewardsPage = () => {
  const { player } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('assigned');

  return (
    <DashboardLayout>
      <RewardsHeader player={player} />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'assigned' && <AssignedRewards />}
      {activeTab === 'claimed' && <ClaimedRewards />}
      {activeTab === 'balance' && <BalanceView />}
    </DashboardLayout>
  );
};
```

#### 4.2 Header con Badge de Nivel
```typescript
// src/components/features/rewards/RewardsHeader.tsx
export const RewardsHeader = ({ player }) => {
  return (
    <div className="flex flex-wrap justify-between items-end gap-3 mb-8">
      <div>
        <h1 className="text-4xl font-black text-white">Player Rewards & Balance</h1>
        <p className="text-slate-400">Track your achievements and unlockable content.</p>
      </div>
      <div className="flex items-center bg-primary/20 px-4 py-2 rounded-lg border border-primary/30">
        <span className="material-symbols-outlined text-primary mr-2">verified</span>
        <span className="text-white font-bold">Level {player?.level} Guardian</span>
      </div>
    </div>
  );
};
```

#### 4.3 Navegación de Tabs
```typescript
// src/components/features/rewards/TabNavigation.tsx
export const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'assigned', label: 'Assigned', badge: { text: 'Active', color: 'green' } },
    { id: 'claimed', label: 'Claimed' },
    { id: 'balance', label: 'My Balance' },
  ];

  return (
    <div className="mb-8 border-b border-border-dark">
      <div className="flex gap-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 border-b-3 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold">{tab.label}</span>
              {tab.badge && (
                <span className={`bg-${tab.badge.color}-500 text-xs px-1.5 py-0.5 rounded uppercase font-black`}>
                  {tab.badge.text}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### 4.4 Vista de Recompensas Asignadas (Assigned Rewards)
```typescript
// src/components/features/rewards/AssignedRewards.tsx
export const AssignedRewards = () => {
  const { user } = useAuthStore();
  const playerId = user?.player?.id;
  
  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards', 'assigned', playerId],
    queryFn: () => getAssignedRewards(playerId!),
    enabled: !!playerId,
  });

  if (isLoading) return <RewardsLoadingSkeleton />;
  if (!rewards || rewards.length === 0) return <EmptyRewardsState />;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">Recompensas Asignadas</h2>
        <p className="text-gray-400 text-sm">Tienes {rewards.length} recompensa{rewards.length !== 1 ? 's' : ''} asignada{rewards.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map(reward => (
          <RewardCard key={reward.playerRewardId} reward={reward} />
        ))}
      </div>
    </div>
  );
};
```

#### 4.5 Componente RewardCard
```typescript
// src/components/features/rewards/RewardCard.tsx
interface RewardCardProps {
  reward: RewardWithStatus;
}

export const RewardCard = ({ reward }: RewardCardProps) => {
  const getRarityColor = (rewardType: string) => {
    switch (rewardType) {
      case 'coins':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' };
      case 'points':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' };
      default:
        return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' };
    }
  };

  const colors = getRarityColor(reward.rewardType);

  return (
    <div className={`bg-gray-800/50 border-2 ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all`}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`${colors.bg} rounded-lg p-3 flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${colors.text} text-3xl`}>
            {reward.icon || 'emoji_events'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{reward.name || `${reward.rewardAmount} ${reward.rewardType}`}</h3>
          <p className="text-gray-400 text-xs">De: {reward.source || 'Logro'}</p>
        </div>
      </div>

      {reward.isClaimed ? (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            Reclamada
          </span>
        </div>
      ) : (
        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3">
          <span className="text-purple-400 font-bold text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">schedule</span>
            Pendiente
          </span>
        </div>
      )}
    </div>
  );
};
```

#### 4.6 API Client para Rewards
```typescript
// src/services/reward.service.ts
// Endpoints disponibles en el backend:
// - GET /rewards/players/:playerId (todas las recompensas del jugador)
// - GET /rewards/balance/:playerId (balance total)

export const getAssignedRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const allRewards = await getPlayerRewards(playerId);
  return allRewards.filter(r => !r.isClaimed);
};

export const getClaimedRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const allRewards = await getPlayerRewards(playerId);
  return allRewards.filter(r => r.isClaimed);
};
```

#### 4.7 Vista de Balance
```typescript
// src/components/features/rewards/MyBalance.tsx
export const MyBalance = () => {
  const { user } = useAuthStore();
  const playerId = user?.player?.id;
  
  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance', playerId],
    queryFn: () => getPlayerBalance(playerId!),
    enabled: !!playerId,
  });

  if (isLoading) return <BalanceLoadingSkeleton />;
  if (!balance) return <BalanceErrorState />;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">Mi Balance</h2>
        <p className="text-gray-400 text-sm">Resumen de tus ganancias totales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard
          title="Monedas Totales"
          value={balance.totalCoins.toLocaleString()}
          icon="payments"
          color="yellow"
        />
        <BalanceCard
          title="Puntos Totales"
          value={balance.totalPoints.toLocaleString()}
          icon="bolt"
          color="purple"
        />
      </div>
    </div>
  );
};
```

#### 4.8 Componente BalanceCard
```typescript
// src/components/features/rewards/BalanceCard.tsx
export const BalanceCard = ({ title, value, icon, color }) => {
  const colorMap = {
    yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
    purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  };

  const colors = colorMap[color] || colorMap.yellow;

  return (
    <div className={`${colors.bg} border-2 ${colors.border} p-8 rounded-xl flex items-center justify-between`}>
      <div className="flex flex-col">
        <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-widest">{title}</p>
        <h3 className={`${colors.text} text-5xl font-black`}>{value}</h3>
      </div>
      <div className={`${colors.bg} rounded-full p-4 flex items-center justify-center`}>
        <span className={`material-symbols-outlined ${colors.text} text-5xl`}>{icon}</span>
      </div>
    </div>
  );
};
```

#### 4.9 Testing
```typescript
// src/components/rewards/__tests__/MyBalance.test.tsx
test('muestra balance de monedas y puntos', async () => {
  const mockBalance = { totalCoins: 1000, totalPoints: 500, lastUpdated: new Date().toISOString() };
  
  render(<MyBalance />);
  
  await waitFor(() => {
    expect(screen.getByText('1,000')).toBeInTheDocument(); // Monedas
    expect(screen.getByText('500')).toBeInTheDocument();   // Puntos
  });
});

test('carga recompensas asignadas correctamente', async () => {
  render(<AssignedRewards />);
  
  await waitFor(() => {
    expect(screen.getByText(/Recompensas Asignadas/i)).toBeInTheDocument();
  });
});
```

### Criterios de Aceptación
- [x] Tabs de navegación funcionan correctamente (Assigned/Claimed/Balance) ✅
- [x] Rewards asignadas se muestran correctamente ✅
- [x] Balance summary muestra totales de coins y points ✅
- [x] Filtrado local de recompensas asignadas vs reclamadas ✅
- [x] Transiciones y animaciones funcionan ✅
- [x] Responsive en todos los breakpoints ✅
- [x] Tests de balance y rewards implementados ✅

### Endpoints Backend Utilizados
- `GET /rewards/players/:playerId` → Todas las recompensas del jugador
- `GET /rewards/balance/:playerId` → Balance total (coins/points)

**NOTA:** El filtrado de recompensas asignadas vs reclamadas se realiza **en el frontend** utilizando el campo `isClaimed` de cada recompensa, sin necesidad de endpoints adicionales en el backend.

---

---

## 🎯 Fase 5: Ranking Global (Global Leaderboard)

**Diseño base:** `5. global_leaderboard_ranking/code.html`

### Objetivo
Implementar leaderboard simple con listado de jugadores ordenados por métricas disponibles del backend (Monsters Killed, Time Played), mostrando podio básico de top 3 y tabla de rankings.

**NOTA:** Simplificada para alinear con el backend actual que solo tiene campos `monstersKilled` y `timePlayed` en la entidad Player.

### Pasos de Implementación

#### 5.1 Tipos TypeScript Alineados con Backend
```typescript
// src/types/leaderboard.types.ts
export interface LeaderboardPlayer {
  id: string;
  username: string;
  email: string;
  monstersKilled: number;
  timePlayed: number; // en minutos
  createdAt: string;
  isActive: boolean;
}

export type MetricType = 'monsters' | 'time';

export interface LeaderboardData {
  players: LeaderboardPlayer[];
  currentUserRank?: {
    rank: number;
    player: LeaderboardPlayer;
  };
}
```

#### 5.2 Servicio de Leaderboard
```typescript
// src/services/leaderboard.service.ts
import { apiClient } from '../lib/api';
import { LeaderboardPlayer, MetricType, LeaderboardData } from '../types/leaderboard.types';

export const getLeaderboard = async (metric: MetricType): Promise<LeaderboardData> => {
  // Usar endpoint existente del backend
  const response = await apiClient.get<LeaderboardPlayer[]>('/players');
  const players = response.data.filter(player => player.isActive);
  
  // Ordenar localmente según la métrica seleccionada
  const sortedPlayers = players.sort((a, b) => {
    if (metric === 'monsters') {
      return b.monstersKilled - a.monstersKilled;
    } else {
      return b.timePlayed - a.timePlayed;
    }
  });

  return {
    players: sortedPlayers,
  };
};

export const getCurrentUserRank = (players: LeaderboardPlayer[], userId: string) => {
  const rank = players.findIndex(player => player.id === userId) + 1;
  const player = players.find(player => player.id === userId);
  
  if (player) {
    return { rank, player };
  }
  
  return null;
};
```

#### 5.3 Página de Leaderboard Principal
```typescript
// src/pages/Leaderboard.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricType } from '../types/leaderboard.types';
import { getLeaderboard, getCurrentUserRank } from '../services/leaderboard.service';
import { useAuthStore } from '../store/auth';
import { LeaderboardHeader } from '../components/leaderboard/LeaderboardHeader';
import { MetricTabs } from '../components/leaderboard/MetricTabs';
import { LeaderboardPodium } from '../components/leaderboard/LeaderboardPodium';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { PersonalRankCard } from '../components/leaderboard/PersonalRankCard';

export default function Leaderboard() {
  const user = useAuthStore((s) => s.user);
  const [metric, setMetric] = useState<MetricType>('monsters');

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['leaderboard', metric],
    queryFn: () => getLeaderboard(metric),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const currentUserRank = leaderboardData?.players && user
    ? getCurrentUserRank(leaderboardData.players, user.id)
    : null;

  const topThree = leaderboardData?.players.slice(0, 3) || [];
  const otherPlayers = leaderboardData?.players.slice(3) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-800 rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-2xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <LeaderboardHeader />
        
        <MetricTabs metric={metric} onMetricChange={setMetric} />
        
        {topThree.length >= 3 && (
          <LeaderboardPodium topThree={topThree} metric={metric} />
        )}
        
        <LeaderboardTable players={otherPlayers} metric={metric} startRank={4} />
        
        {currentUserRank && (
          <PersonalRankCard rank={currentUserRank} metric={metric} />
        )}
      </div>
    </div>
  );
}
```

#### 5.4 Header Simplificado
```typescript
// src/components/leaderboard/LeaderboardHeader.tsx
export const LeaderboardHeader = () => {
  return (
    <div className="text-center mb-10">
      <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
        Ranking Global
      </h1>
      <p className="text-gray-400 text-lg">
        Compite con otros jugadores y demuestra tu habilidad
      </p>
    </div>
  );
};
```

#### 5.5 Tabs de Métricas Simplificadas
```typescript
// src/components/leaderboard/MetricTabs.tsx
import { MetricType } from '../../types/leaderboard.types';

interface MetricTabsProps {
  metric: MetricType;
  onMetricChange: (metric: MetricType) => void;
}

export const MetricTabs = ({ metric, onMetricChange }: MetricTabsProps) => {
  const metrics = [
    { id: 'monsters' as MetricType, label: 'Monstruos Eliminados', icon: 'psychology' },
    { id: 'time' as MetricType, label: 'Tiempo Jugado', icon: 'schedule' },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex bg-gray-800 rounded-xl p-2">
        {metrics.map((m) => (
          <button
            key={m.id}
            onClick={() => onMetricChange(m.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-all ${
              metric === m.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span className="material-symbols-outlined text-base">{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### 5.6 Podio de Top 3
```typescript
// src/components/leaderboard/LeaderboardPodium.tsx
import { LeaderboardPlayer, MetricType } from '../../types/leaderboard.types';

interface PodiumProps {
  topThree: LeaderboardPlayer[];
  metric: MetricType;
}

export const LeaderboardPodium = ({ topThree, metric }: PodiumProps) => {
  // Orden visual: 2do, 1ro, 3ro
  const orderedPodium = [topThree[1], topThree[0], topThree[2]];
  const positions = [2, 1, 3];
  const medals = ['silver', 'gold', 'bronze'];

  const getMetricValue = (player: LeaderboardPlayer): number => {
    return metric === 'monsters' ? player.monstersKilled : player.timePlayed;
  };

  const getMetricLabel = (): string => {
    return metric === 'monsters' ? 'Monstruos' : 'Minutos';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
      {orderedPodium.map((player, index) => {
        if (!player) return <div key={index}></div>;
        
        const position = positions[index];
        const medal = medals[index];
        const isFirst = position === 1;

        return (
          <div key={player.id} className={`text-center ${isFirst ? 'order-2' : index === 0 ? 'order-1' : 'order-3'}`}>
            {/* Corona para el 1er lugar */}
            {isFirst && (
              <div className="mb-4">
                <span className="material-symbols-outlined text-yellow-400 text-5xl animate-pulse">
                  workspace_premium
                </span>
              </div>
            )}

            {/* Avatar */}
            <div className="relative mb-4">
              <div className={`${isFirst ? 'w-24 h-24' : 'w-20 h-20'} mx-auto rounded-full border-4 ${
                medal === 'gold' ? 'border-yellow-400' : medal === 'silver' ? 'border-gray-400' : 'border-orange-600'
              } bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white text-3xl">
                  person
                </span>
              </div>
              
              {/* Badge de posición */}
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${
                medal === 'gold' ? 'bg-yellow-500' : medal === 'silver' ? 'bg-gray-400' : 'bg-orange-600'
              } text-white font-black px-3 py-1 rounded-full text-sm`}>
                #{position}
              </div>
            </div>

            {/* Card de información */}
            <div className={`bg-gray-800 rounded-xl p-6 border-2 ${
              medal === 'gold' ? 'border-yellow-400' : medal === 'silver' ? 'border-gray-400' : 'border-orange-600'
            }`}>
              <h3 className={`font-bold ${isFirst ? 'text-xl' : 'text-lg'} text-white mb-2`}>
                {player.username}
              </h3>
              <p className={`${
                medal === 'gold' ? 'text-yellow-400' : medal === 'silver' ? 'text-gray-300' : 'text-orange-400'
              } font-bold ${isFirst ? 'text-lg' : 'text-base'}`}>
                {getMetricValue(player).toLocaleString()} {getMetricLabel()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

#### 5.7 Tabla de Rankings
```typescript
// src/components/leaderboard/LeaderboardTable.tsx
import { LeaderboardPlayer, MetricType } from '../../types/leaderboard.types';

interface TableProps {
  players: LeaderboardPlayer[];
  metric: MetricType;
  startRank: number;
}

export const LeaderboardTable = ({ players, metric, startRank }: TableProps) => {
  const getMetricValue = (player: LeaderboardPlayer): number => {
    return metric === 'monsters' ? player.monstersKilled : player.timePlayed;
  };

  const getMetricLabel = (): string => {
    return metric === 'monsters' ? 'Monstruos Eliminados' : 'Tiempo Jugado (min)';
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700">
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <h2 className="text-white text-xl font-bold">Clasificación General</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900 text-gray-400 text-sm font-bold uppercase">
              <th className="px-6 py-4 text-left">Posición</th>
              <th className="px-6 py-4 text-left">Jugador</th>
              <th className="px-6 py-4 text-right">{getMetricLabel()}</th>
              <th className="px-6 py-4 text-center">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {players.map((player, index) => (
              <tr key={player.id} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-400">
                  #{startRank + index}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">
                        person
                      </span>
                    </div>
                    <span className="font-bold text-white">{player.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-purple-400">
                  {getMetricValue(player).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center text-gray-400 text-sm">
                  {new Date(player.createdAt).toLocaleDateString('es-ES')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {players.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">
            leaderboard
          </span>
          <h3 className="text-white text-xl font-bold mb-2">
            No hay jugadores en el ranking
          </h3>
          <p className="text-gray-400">
            ¡Sé el primero en aparecer aquí!
          </p>
        </div>
      )}
    </div>
  );
};
```

#### 5.8 Card de Posición Personal
```typescript
// src/components/leaderboard/PersonalRankCard.tsx
import { LeaderboardPlayer, MetricType } from '../../types/leaderboard.types';

interface PersonalRankProps {
  rank: {
    rank: number;
    player: LeaderboardPlayer;
  };
  metric: MetricType;
}

export const PersonalRankCard = ({ rank, metric }: PersonalRankProps) => {
  const getMetricValue = (): number => {
    return metric === 'monsters' ? rank.player.monstersKilled : rank.player.timePlayed;
  };

  const getMetricLabel = (): string => {
    return metric === 'monsters' ? 'Monstruos Eliminados' : 'Minutos Jugados';
  };

  return (
    <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl z-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <span className="font-black text-white text-lg">#{rank.rank}</span>
        </div>
        
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">Tu Posición</h3>
          <p className="text-white/80 text-sm">
            {getMetricValue().toLocaleString()} {getMetricLabel()}
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-white">
              {rank.rank <= 3 ? 'star' : 'trending_up'}
            </span>
          </div>
          <span className="text-white/80 text-xs font-bold">
            {rank.rank <= 3 ? 'TOP 3!' : 'SUBIENDO'}
          </span>
        </div>
      </div>
    </div>
  );
};
```

### Criterios de Aceptación
- [ ] Podio muestra top 3 jugadores con medallas y diferenciación visual
- [ ] Tabla de rankings muestra todos los jugadores ordenados por métrica seleccionada
- [ ] Filtros por métrica (Monstruos/Tiempo) funcionan correctamente
- [ ] Card personal muestra la posición actual del jugador autenticado
- [ ] Datos se refrescan automáticamente cada 30 segundos
- [ ] Responsive en móviles, tablets y desktop
- [ ] Estados de loading y vacío manejados correctamente
- [ ] Formato de números con separadores de miles
- [ ] Fechas formateadas en español

### Endpoints Backend Utilizados
- `GET /players` → Lista todos los jugadores (ordenamiento local por `monstersKilled` o `timePlayed`)

---

---

## 🎯 Fase 6: Notificaciones y Modal de Logros

**Diseño base:** `6. notifications_and_achievement_modal/code.html`

### Objetivo
Implementar sistema básico de notificaciones toast (éxito, info, error) con eventos locales del frontend, y modal simple de achievements mostrando información disponible del backend actual.

**NOTA:** Simplificada para alinearse con el backend actual. No incluye WebSocket ni endpoints especializados que no están implementados.

### Pasos de Implementación

#### 6.1 Sistema de Notificaciones Local (Toast Stack)
```typescript
// src/store/notification.store.ts
import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  icon?: string;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const newNotif = {
      ...notification,
      id,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotif],
    }));
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    }, 5000);
  },
  
  removeNotification: (id) => 
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
  
  clearAll: () => set({ notifications: [] }),
}));
```

#### 6.2 Componente NotificationCenter
```typescript
// src/components/features/notifications/NotificationCenter.tsx
export const NotificationCenter = () => {
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <div className="fixed top-20 right-6 z-50 space-y-4 w-96 max-w-[90vw]">
      {notifications.map((notif) => (
        <ToastNotification key={notif.id} notification={notif} />
      ))}
    </div>
  );
};
```

#### 6.3 Componente ToastNotification
```typescript
// src/components/features/notifications/ToastNotification.tsx
interface ToastProps {
  notification: Notification;
}

export const ToastNotification = ({ notification }: ToastProps) => {
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  const typeConfig = {
    success: {
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      shadow: 'shadow-green-500/20',
      defaultIcon: 'check_circle',
      accentIcon: 'celebration',
    },
    info: {
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      shadow: 'shadow-blue-500/20',
      defaultIcon: 'info',
      accentIcon: 'lightbulb',
    },
    error: {
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      shadow: 'shadow-red-500/20',
      defaultIcon: 'error',
      accentIcon: 'warning',
    },
  };

  const config = typeConfig[notification.type];

  return (
    <div 
      className={`flex items-center gap-4 bg-gray-800 border ${config.borderColor} rounded-xl p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-4 duration-300`}
      role="alert"
      aria-live="polite"
    >
      {/* Main Icon */}
      <div className={`${config.textColor} ${config.bgColor} rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined">
          {notification.icon || config.defaultIcon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-white text-sm font-bold">{notification.title}</p>
        <p className="text-gray-400 text-xs">{notification.message}</p>
      </div>

      {/* Accent Icon */}
      <div className={`flex-shrink-0 ${config.textColor}`}>
        <span className="material-symbols-outlined">{config.accentIcon}</span>
      </div>

      {/* Close Button */}
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 text-gray-500 hover:text-white ml-2"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};
```

#### 6.4 Eventos de Aplicación para Notificaciones
```typescript
// src/hooks/useAppNotifications.ts
export const useAppNotifications = () => {
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Función para mostrar notificación de éxito
  const notifySuccess = (title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      icon: 'emoji_events',
    });
  };

  // Función para mostrar notificación de info
  const notifyInfo = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      icon: 'info',
    });
  };

  // Función para mostrar notificación de error
  const notifyError = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      icon: 'error',
    });
  };

  return {
    notifySuccess,
    notifyInfo,
    notifyError,
  };
};
```

#### 6.5 Modal de Achievement Simple
```typescript
// src/components/features/achievements/AchievementDetailModal.tsx
interface AchievementDetailModalProps {
  achievement: any; // Del backend actual
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementDetailModal = ({ 
  achievement, 
  isOpen, 
  onClose 
}: AchievementDetailModalProps) => {
  if (!isOpen || !achievement) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-40 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/50 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {/* Icono principal */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-white/20 shadow-lg">
            <span className="material-symbols-outlined text-4xl text-white">
              {achievement.type === 'kill' ? 'psychology' : 'explore'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {achievement.name}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {achievement.description}
          </p>

          {/* Progress Section */}
          {achievement.progress && (
            <div className="w-full space-y-2 mb-6">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-purple-400">Progress</span>
                <span className="text-white">
                  {achievement.progress.toFixed(0)}% Complete
                </span>
              </div>
              <div className="h-3 w-full bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-300"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Info básica */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-3">
              <span className="material-symbols-outlined text-purple-400 text-2xl mb-1">
                flag
              </span>
              <p className="text-xs text-gray-400">Type</p>
              <p className="font-bold text-white capitalize">{achievement.type}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-3">
              <span className="material-symbols-outlined text-purple-400 text-2xl mb-1">
                {achievement.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-bold text-white">
                {achievement.completed ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 transition-all rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 6.6 Modal Base Reutilizable (Simplificado)
```typescript
// src/components/common/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, size = 'medium', children }: ModalProps) => {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-4xl',
  };

  // Focus trap y cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`w-full ${sizeClasses[size]} animate-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
```

#### 6.7 Integración con Achievement Grid
```typescript
// Modificar src/components/achievements/AchievementGrid.tsx
// Agregar click handler para abrir modal:

const [selectedAchievement, setSelectedAchievement] = useState(null);

const handleAchievementClick = (achievement: any) => {
  setSelectedAchievement(achievement);
};

// En el return agregar:
{selectedAchievement && (
  <AchievementDetailModal
    achievement={selectedAchievement}
    isOpen={!!selectedAchievement}
    onClose={() => setSelectedAchievement(null)}
  />
)}
```

#### 6.8 Notificaciones de Estado de Red
```typescript
// src/hooks/useNetworkStatus.ts
export const useNetworkStatus = () => {
  const { notifySuccess, notifyError } = useAppNotifications();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notifySuccess('Back Online', 'Connection restored successfully');
    };

    const handleOffline = () => {
      setIsOnline(false);
      notifyError('Connection Lost', 'Working offline. Changes will sync when reconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
```

#### 6.9 Integración en App Root
```typescript
// src/App.tsx - Agregar NotificationCenter
export const App = () => {
  useNetworkStatus(); // Monitorear conexión

  return (
    <div className="App">
      <NotificationCenter />
      <Router>
        {/* Rutas existentes */}
      </Router>
    </div>
  );
};
```

#### 6.10 Testing Básico
```typescript
// src/components/features/notifications/__tests__/NotificationCenter.test.tsx
test('muestra notificación y auto-desaparece en 5 segundos', async () => {
  vi.useFakeTimers();
  
  render(<NotificationCenter />);
  
  act(() => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Test',
      message: 'This is a test notification',
    });
  });
  
  expect(screen.getByText('Test')).toBeInTheDocument();
  
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  
  await waitFor(() => {
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
  
  vi.useRealTimers();
});

test('modal de achievement muestra información básica', async () => {
  const mockAchievement = {
    name: 'Monster Slayer',
    description: 'Defeat 10 monsters',
    type: 'kill',
    completed: false,
    progress: 45,
  };

  render(
    <AchievementDetailModal 
      achievement={mockAchievement} 
      isOpen 
      onClose={vi.fn()} 
    />
  );
  
  expect(screen.getByText('Monster Slayer')).toBeInTheDocument();
  expect(screen.getByText('Defeat 10 monsters')).toBeInTheDocument();
  expect(screen.getByText('45% Complete')).toBeInTheDocument();
});
```

### Criterios de Aceptación
- [ ] Toast notifications aparecen con animaciones suaves
- [ ] Notificaciones se auto-ocultan después de 5 segundos
- [ ] Modal de achievement muestra información del backend actual
- [ ] Focus trap funciona correctamente en el modal
- [ ] Estado online/offline se detecta y notifica
- [ ] Click en achievement card abre modal con detalles
- [ ] Accesibilidad: aria-live, role="alert", navegación con teclado
- [ ] Tests cubren ciclo de vida de notificaciones y modal

### Endpoints Backend Utilizados
- `GET /achievements` → Lista de achievements (para modal)
- `GET /achievements/players/:playerId` → Achievements del jugador (para modal)
- **NO requiere endpoints adicionales** - Funciona con backend actual

### Limitaciones por Backend
- **Sin WebSocket**: Notificaciones solo con eventos locales
- **Sin tracking**: No se puede marcar achievements como objetivos activos
- **Sin recompensas detalladas**: Modal usa información básica disponible
      ...notification,
      id,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotif],
    }));
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    }, 5000);
  },
  
  removeNotification: (id) => 
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
  
  clearAll: () => set({ notifications: [] }),
}));
```

#### 6.2 Componente NotificationCenter
```typescript
// src/components/features/notifications/NotificationCenter.tsx
export const NotificationCenter = () => {
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <div className="fixed top-20 left-6 z-50 space-y-4 w-96">
      {notifications.map((notif) => (
        <ToastNotification key={notif.id} notification={notif} />
      ))}
    </div>
  );
};
```

#### 6.3 Componente ToastNotification
```typescript
// src/components/features/notifications/ToastNotification.tsx
interface ToastProps {
  notification: Notification;
}

export const ToastNotification = ({ notification }: ToastProps) => {
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  const typeConfig = {
    success: {
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      shadow: 'neon-shadow-success',
      defaultIcon: 'emoji_events',
      accentIcon: 'celebration',
    },
    info: {
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      shadow: 'neon-shadow-info',
      defaultIcon: 'redeem',
      accentIcon: 'info',
    },
    error: {
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      shadow: 'neon-shadow-error',
      defaultIcon: 'error',
      accentIcon: 'warning',
    },
  };

  const config = typeConfig[notification.type];

  return (
    <div 
      className={`flex items-center gap-4 bg-card-dark border ${config.borderColor} rounded-xl p-4 ${config.shadow} backdrop-blur-sm animate-in fade-in slide-in-from-left-4 duration-300`}
      role="alert"
      aria-live="polite"
    >
      {/* Main Icon */}
      <div className={`${config.textColor} ${config.bgColor} rounded-lg size-12 flex items-center justify-center shrink-0`}>
        <span className="material-symbols-outlined">
          {notification.icon || config.defaultIcon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-white text-sm font-bold">{notification.title}</p>
        <p className="text-slate-400 text-xs">{notification.message}</p>
      </div>

      {/* Accent Icon */}
      <div className={`shrink-0 ${config.textColor}`}>
        <span className="material-symbols-outlined">{config.accentIcon}</span>
      </div>

      {/* Close Button */}
      <button
        onClick={() => removeNotification(notification.id)}
        className="shrink-0 text-slate-500 hover:text-white ml-2"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};
```

#### 6.4 WebSocket para Eventos en Tiempo Real
```typescript
// src/hooks/useRealtimeNotifications.ts
export const useRealtimeNotifications = () => {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { player } = useAuthStore();

  useEffect(() => {
    if (!player) return;

    const ws = new WebSocket(
      `${import.meta.env.VITE_WS_URL}/notifications?playerId=${player.id}`
    );

    ws.onopen = () => {
      console.log('WebSocket connected for notifications');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Mapear eventos del backend a notificaciones
      switch (data.type) {
        case 'ACHIEVEMENT_UNLOCKED':
          addNotification({
            type: 'success',
            title: 'Achievement Unlocked',
            message: `${data.achievementName}: ${data.description}`,
            icon: 'emoji_events',
          });
          break;
          
        case 'REWARD_ASSIGNED':
          addNotification({
            type: 'info',
            title: 'New Reward',
            message: `${data.rewardName} added to your inventory`,
            icon: 'redeem',
          });
          break;
          
        case 'SYNC_ERROR':
          addNotification({
            type: 'error',
            title: 'Connection Error',
            message: 'Unable to sync achievements. Retrying...',
            icon: 'error',
          });
          break;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      addNotification({
        type: 'error',
        title: 'Connection Lost',
        message: 'Reconnecting to server...',
      });
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Implementar reconnect logic
    };

    return () => {
      ws.close();
    };
  }, [player?.id]);
};
```

#### 6.5 Modal de Achievement Detallado
```typescript
// src/components/features/achievements/AchievementDetailModal.tsx
interface AchievementDetailModalProps {
  achievementId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementDetailModal = ({ 
  achievementId, 
  isOpen, 
  onClose 
}: AchievementDetailModalProps) => {
  const { data: achievement, isLoading } = useQuery({
    queryKey: ['achievement', 'detail', achievementId],
    queryFn: () => getAchievementDetail(achievementId),
    enabled: isOpen && !!achievementId,
  });

  const trackMutation = useMutation({
    mutationFn: () => trackAchievementObjective(achievementId),
    onSuccess: () => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Objective Tracked',
        message: `${achievement.name} is now being tracked`,
      });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="medium">
      <div className="bg-card-dark border border-white/10 rounded-2xl overflow-hidden">
        {/* Header con icono grande y efecto neon */}
        <div className="relative h-48 flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="relative">
            {/* Efecto glow de fondo */}
            <div className="absolute inset-0 bg-primary blur-3xl opacity-30 rounded-full" />
            
            {/* Icono principal */}
            <div className="relative size-24 rounded-2xl bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center border-2 border-white/20 shadow-lg">
              <span className="material-symbols-outlined !text-5xl text-white">
                {achievement?.icon || 'explore'}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {achievement?.name}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {achievement?.description}
          </p>

          {/* Progress Section */}
          {achievement?.progress > 0 && achievement?.progress < 100 && (
            <div className="w-full space-y-2 mb-8">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-primary">Progress</span>
                <span className="text-white">
                  {achievement.currentValue} / {achievement.targetValue} Found
                </span>
              </div>
              <div className="h-4 w-full bg-border-dark rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-purple-400 rounded-full shadow-[0_0_10px_rgba(134,64,231,0.6)]"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Rewards Section */}
          <div className="w-full bg-surface-dark rounded-xl border border-white/5 p-4 mb-8">
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">
              Rewards upon completion
            </p>
            <div className="grid grid-cols-3 gap-2">
              <RewardItem icon="bolt" label={`${achievement?.xpReward} XP`} color="yellow" />
              <RewardItem icon="savings" label={`${achievement?.coinReward} Gold`} color="amber" />
              <RewardItem icon="workspace_premium" label={achievement?.badgeName} color="primary" special />
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => trackMutation.mutate()}
            disabled={trackMutation.isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 transition-all rounded-xl font-bold text-white shadow-lg neon-shadow-primary flex items-center justify-center gap-2"
          >
            <span>Track Objective</span>
            <span className="material-symbols-outlined text-sm">gps_fixed</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Componente auxiliar
const RewardItem = ({ icon, label, color, special = false }) => (
  <div className={`flex flex-col items-center p-2 rounded-lg ${
    special ? `bg-${color}-500/20 border border-${color}-500/30` : 'bg-border-dark/30'
  }`}>
    <span className={`material-symbols-outlined text-${color}-500 mb-1`}>{icon}</span>
    <span className="text-xs font-bold text-white">{label}</span>
  </div>
);
```

#### 6.6 Componente Modal Base Reutilizable
```typescript
// src/components/common/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, size = 'medium', children }: ModalProps) => {
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-[500px]',
    large: 'max-w-[800px]',
  };

  // Focus trap y cerrar con ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className={`w-full ${sizeClasses[size]} animate-in zoom-in-95 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
```

#### 6.7 Persistencia de Notificaciones (IndexedDB)
```typescript
// src/utils/notificationPersistence.ts
import { openDB } from 'idb';

const DB_NAME = 'gaming-notifications';
const STORE_NAME = 'notifications';

export const initNotificationDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
};

export const saveNotification = async (notification: Notification) => {
  const db = await initNotificationDB();
  await db.put(STORE_NAME, notification);
};

export const getRecentNotifications = async (limit = 10): Promise<Notification[]> => {
  const db = await initNotificationDB();
  const all = await db.getAll(STORE_NAME);
  return all
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};
```

#### 6.8 Notificación de Estado Offline/Online
```typescript
// src/hooks/useNetworkStatus.ts
export const useNetworkStatus = () => {
  const addNotification = useNotificationStore((s) => s.addNotification);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Connection restored. Syncing data...',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification({
        type: 'error',
        title: 'Connection Lost',
        message: 'Working offline. Changes will sync when reconnected.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
```

#### 6.9 Integración en App Root
```typescript
// src/App.tsx
export const App = () => {
  useRealtimeNotifications(); // Conectar WebSocket
  useNetworkStatus(); // Monitorear conexión

  return (
    <>
      <NotificationCenter />
      <Router>
        {/* Rutas... */}
      </Router>
    </>
  );
};
```

#### 6.10 Testing
```typescript
// src/components/features/notifications/__tests__/NotificationCenter.test.tsx
test('muestra notificación y auto-desaparece en 5 segundos', async () => {
  vi.useFakeTimers();
  
  render(<NotificationCenter />);
  
  act(() => {
    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Test',
      message: 'This is a test notification',
    });
  });
  
  expect(screen.getByText('Test')).toBeInTheDocument();
  
  act(() => {
    vi.advanceTimersByTime(5000);
  });
  
  await waitFor(() => {
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
  
  vi.useRealTimers();
});

test('modal de achievement muestra progreso y recompensas', async () => {
  render(<AchievementDetailModal achievementId="ach-1" isOpen onClose={vi.fn()} />);
  
  await waitFor(() => {
    expect(screen.getByText(/master explorer/i)).toBeInTheDocument();
    expect(screen.getByText(/45 \/ 100 found/i)).toBeInTheDocument();
    expect(screen.getByText(/500 XP/i)).toBeInTheDocument();
  });
});
```

### Criterios de Aceptación
- [ ] Toast notifications aparecen con animaciones suaves
- [ ] Notificaciones se auto-ocultan después de 5 segundos
- [ ] WebSocket conecta y recibe eventos en tiempo real
- [ ] Modal de achievement muestra toda la información relevante
- [ ] Focus trap funciona correctamente en el modal
- [ ] Notificaciones persisten en IndexedDB para histórico
- [ ] Estado online/offline se detecta y notifica
- [ ] Accesibilidad: aria-live, role="alert", navegación con teclado
- [ ] Tests cubren ciclo de vida de notificaciones y modal

### Endpoints Backend Utilizados
- WebSocket: `ws://localhost:XXXX/notifications?playerId=...` → Eventos en tiempo real
- `GET /achievements/:id` → Detalle completo del achievement
- `POST /achievements/:id/track` → Marcar como objetivo activo

