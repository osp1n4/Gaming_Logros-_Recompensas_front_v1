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
- **`<Sidebar />`**: Navegación con items activos, iconos Material Symbols, perfil del jugador al final
- **`<TopBar />`**: Búsqueda, notificaciones, settings, balance de premium coins
- Implementar estados hover y active según diseño

#### 2.2 Hooks Custom para Datos Agregados
```typescript
// src/hooks/usePlayerDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { getPlayerProfile } from '../api/player.api';
import { getPlayerAchievements } from '../api/achievement.api';
import { getPlayerRewards } from '../api/reward.api';

export const usePlayerDashboard = (playerId: string) => {
  const playerQuery = useQuery({
    queryKey: ['player', playerId],
    queryFn: () => getPlayerProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutos
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

  return {
    player: playerQuery.data,
    achievements: achievementsQuery.data,
    rewards: rewardsQuery.data,
    isLoading: playerQuery.isLoading || achievementsQuery.isLoading,
    error: playerQuery.error || achievementsQuery.error,
  };
};
```

#### 2.3 Clientes API Adicionales
```typescript
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
  const { achievements } = usePlayerDashboard(player!.id);

  const stats = [
    {
      label: 'Coins',
      value: player?.coins.toLocaleString() || '0',
      icon: 'payments',
      color: 'yellow',
      change: '+12%',
    },
    {
      label: 'Experience Points',
      value: `${player?.xp.toLocaleString()} XP`,
      icon: 'bolt',
      color: 'primary',
      change: '+22%',
    },
    {
      label: 'Achievements',
      value: 'Grandmaster',
      icon: 'emoji_events',
      color: 'pink',
      badge: `${achievements?.filter(a => a.isUnlocked).length}/100`,
    },
    {
      label: 'Current Level',
      value: `Level ${player?.level}`,
      icon: 'military_tech',
      color: 'blue',
      badge: `Rank ${player?.level}`,
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
  const submitEventMutation = useMutation({
    mutationFn: (eventData: GameEventDto) => submitGameEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries(['player']);
      // Mostrar toast de éxito
    },
  });

  const events = [
    {
      title: 'Kill Monster',
      description: 'Defeat the Shadow Beast in the Dark Woods.',
      rewards: { gold: 500, xp: 1200 },
      action: 'Slay Now',
      color: 'red',
      icon: 'skull',
      eventType: 'KILL_ENEMY',
    },
    {
      title: '+30 min Played',
      description: 'Claim your daily playtime bonus rewards.',
      progress: { current: 26, max: 30 },
      action: 'Claim (Soon)',
      color: 'blue',
      icon: 'schedule',
      eventType: 'TIME_PLAYED',
      disabled: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.title}
          {...event}
          onAction={() => submitEventMutation.mutate({ playerId, eventType: event.eventType })}
        />
      ))}
    </div>
  );
};
```

#### 2.7 Sección de Logros Recientes y Últimas Recompensas
- **Recent Achievements**: Lista con progress bars, iconos, porcentaje de completitud
- **Latest Rewards**: Lista con rarities (Legendary, Epic, Common), iconos, fuente de obtención
- Botones "View All" que navegan a las páginas correspondientes (Fase 3 y 4)

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
  const { player } = useAuthStore();
  
  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards', 'assigned', player?.id],
    queryFn: () => getPlayerRewards(player!.id),
    select: (data) => data.filter(r => r.status === 'ASSIGNED'),
  });

  const claimMutation = useMutation({
    mutationFn: (rewardId: string) => claimReward(rewardId),
    onSuccess: () => {
      queryClient.invalidateQueries(['rewards']);
      queryClient.invalidateQueries(['balance']);
      // Mostrar toast de éxito con confetti animation
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold">Available Rewards</h2>
        <span className="text-slate-400 text-sm">{rewards?.length || 0} rewards pending</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {rewards?.map(reward => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onClaim={() => claimMutation.mutate(reward.id)}
            isLoading={claimMutation.isLoading}
          />
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
  reward: Reward;
  onClaim?: () => void;
  isLoading?: boolean;
}

export const RewardCard = ({ reward, onClaim, isLoading }: RewardCardProps) => {
  const rarityConfig = {
    COMMON: { color: 'green', label: 'Common' },
    RARE: { color: 'blue', label: 'Rare' },
    EPIC: { color: 'pink', label: 'Epic' },
    LEGENDARY: { color: 'yellow', label: 'Legendary' },
  };

  const config = rarityConfig[reward.rarity] || rarityConfig.COMMON;

  return (
    <div className="flex flex-col gap-3 p-4 bg-card-dark rounded-xl border border-border-dark hover:border-primary transition-all neon-glow">
      {/* Icon Area */}
      <div className={`w-full aspect-square bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-500/5 rounded-lg flex items-center justify-center`}>
        <span className={`material-symbols-outlined text-6xl text-${config.color}-500`}>
          {reward.iconType || 'card_giftcard'}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <p className="text-white text-lg font-bold leading-tight">{reward.name}</p>
          <span className={`text-${config.color}-500 text-xs font-bold uppercase`}>
            {config.label}
          </span>
        </div>
        <p className="text-slate-400 text-sm">{reward.type}</p>
      </div>

      {/* Claim Button */}
      {onClaim && (
        <button
          onClick={onClaim}
          disabled={isLoading}
          className="w-full py-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-sm"
        >
          {isLoading ? 'Claiming...' : 'Claim Now'}
        </button>
      )}
    </div>
  );
};
```

#### 4.6 API Client para Rewards
```typescript
// src/api/reward.api.ts (extensión)
export const claimReward = async (rewardId: string): Promise<Reward> => {
  const res = await axios.post(`${REWARD_BASE}/rewards/${rewardId}/claim`);
  return res.data;
};

export const getClaimedRewards = async (playerId: string): Promise<Reward[]> => {
  const res = await axios.get(`${REWARD_BASE}/rewards/players/${playerId}/claimed`);
  return res.data;
};
```

#### 4.7 Vista de Balance Resumen
```typescript
// src/components/features/rewards/BalanceView.tsx
export const BalanceView = () => {
  const { player } = useAuthStore();
  
  const { data: balance } = useQuery({
    queryKey: ['balance', player?.id],
    queryFn: () => getPlayerBalance(player!.id),
  });

  return (
    <div className="space-y-12">
      {/* Balance Summary Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BalanceCard
          title="Total Currency"
          value={balance?.totalCoins.toLocaleString() || '0'}
          unit="G"
          icon="savings"
          color="primary"
        />
        <BalanceCard
          title="Lifetime Experience"
          value={formatNumber(balance?.totalXP) || '0'}
          unit="XP"
          icon="military_tech"
          color="blue"
        />
      </div>

      {/* Inventory Gallery */}
      <InventoryGallery />
    </div>
  );
};

// Helper para formatear números grandes
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};
```

#### 4.8 Componente BalanceCard
```typescript
// src/components/features/rewards/BalanceCard.tsx
export const BalanceCard = ({ title, value, unit, icon, color }) => {
  return (
    <div className={`bg-gradient-to-r from-${color}-600/30 to-${color}-600/5 p-8 rounded-xl border border-${color}-500/20 flex items-center justify-between neon-glow`}>
      <div className="flex flex-col">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-white text-5xl font-black">{value}</h3>
          <span className={`text-${color}-400 text-xl font-bold`}>{unit}</span>
        </div>
      </div>
      <div className={`size-20 bg-${color}-500/20 rounded-full flex items-center justify-center border border-${color}-500/40`}>
        <span className={`material-symbols-outlined text-4xl text-${color}-400`}>
          {icon}
        </span>
      </div>
    </div>
  );
};
```

#### 4.9 Galería de Inventario
```typescript
// src/components/features/rewards/InventoryGallery.tsx
export const InventoryGallery = () => {
  const { player } = useAuthStore();
  
  const { data: inventory } = useQuery({
    queryKey: ['inventory', player?.id],
    queryFn: () => getPlayerInventory(player!.id),
  });

  const items = [
    { name: 'Fire Amulet', icon: 'auto_awesome', rarity: 'epic' },
    { name: 'Mana Wand', icon: 'auto_fix_high', rarity: 'rare' },
    { name: 'Season 1 Token', icon: 'token', rarity: 'common' },
    { name: 'Founder', icon: 'workspace_premium', rarity: 'legendary', special: true },
    { name: 'Vault Key', icon: 'key', rarity: 'rare' },
  ];

  return (
    <div>
      <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">grid_view</span>
        Inventory Gallery
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {items.map((item, index) => (
          <button
            key={index}
            className={`aspect-square bg-card-dark rounded-lg border border-border-dark flex flex-col items-center justify-center p-2 hover:bg-primary/10 transition-colors ${
              item.special ? 'border-yellow-500' : ''
            }`}
          >
            <span className={`material-symbols-outlined text-3xl ${
              item.special ? 'text-yellow-500' : 'text-slate-400'
            }`}>
              {item.icon}
            </span>
            <span className={`text-xs font-medium text-center mt-1 ${
              item.special ? 'text-yellow-500' : 'text-slate-400'
            }`}>
              {item.name}
            </span>
          </button>
        ))}

        {/* View All Button */}
        <button className="aspect-square bg-primary/10 rounded-lg border-2 border-dashed border-primary/30 flex flex-col items-center justify-center hover:bg-primary/20">
          <span className="material-symbols-outlined text-2xl text-primary">add</span>
          <span className="text-xs text-primary font-bold">View All</span>
        </button>
      </div>
    </div>
  );
};
```

#### 4.10 Prevención de Doble Claim (Idempotencia)
```typescript
// En el componente AssignedRewards, añadir estado local:
const [claimingIds, setClaimingIds] = useState<Set<string>>(new Set());

const handleClaim = async (rewardId: string) => {
  if (claimingIds.has(rewardId)) return; // Ya está procesando
  
  setClaimingIds(prev => new Set(prev).add(rewardId));
  
  try {
    await claimMutation.mutateAsync(rewardId);
  } finally {
    setClaimingIds(prev => {
      const next = new Set(prev);
      next.delete(rewardId);
      return next;
    });
  }
};
```

#### 4.11 Testing
```typescript
// src/pages/__tests__/Rewards.test.tsx
test('claim reward actualiza balance', async () => {
  render(<RewardsPage />);
  
  const claimBtn = await screen.findByRole('button', { name: /claim now/i });
  await userEvent.click(claimBtn);
  
  await waitFor(() => {
    expect(screen.getByText(/claimed successfully/i)).toBeInTheDocument();
  });
  
  // Verificar que el balance se actualizó
  expect(screen.getByText(/12,700/)).toBeInTheDocument(); // +200 coins
});

test('previene doble claim del mismo reward', async () => {
  const claimSpy = vi.fn();
  render(<RewardsPage />);
  
  const claimBtn = await screen.findByRole('button', { name: /claim now/i });
  
  // Click rápido múltiple
  await userEvent.click(claimBtn);
  await userEvent.click(claimBtn);
  await userEvent.click(claimBtn);
  
  await waitFor(() => {
    expect(claimSpy).toHaveBeenCalledTimes(1); // Solo una vez
  });
});
```

### Criterios de Aceptación
- [ ] Tabs de navegación funcionan correctamente (Assigned/Claimed/Balance)
- [ ] Rewards assigned se muestran con rarities y tipos correctos
- [ ] Botón "Claim Now" funciona y actualiza balance instantáneamente
- [ ] Prevención de doble claim (idempotencia del botón)
- [ ] Balance summary muestra totales correctos de coins y XP
- [ ] Inventory gallery renderiza items con iconos y rarities
- [ ] Transiciones y animaciones neon-glow funcionan
- [ ] Responsive en todos los breakpoints
- [ ] Tests cubren claiming y actualización de balance

### Endpoints Backend Utilizados
- `GET /rewards/players/:playerId` → Rewards del jugador
- `POST /rewards/:id/claim` → Reclamar recompensa (crear si no existe)
- `GET /rewards/balance/:playerId` → Balance total de coins/XP
- `GET /rewards/players/:playerId/claimed` → Historial de claimed

---

---

## 🎯 Fase 5: Ranking Global (Global Leaderboard)

**Diseño base:** `5. global_leaderboard_ranking/code.html`

### Objetivo
Implementar leaderboard global con podio de top 3, tabla de rankings, filtros por métrica (Coins/XP/Achievements), y banner sticky de posición personal del jugador.

### Pasos de Implementación

#### 5.1 Página de Leaderboard
```typescript
// src/pages/Leaderboard.tsx
type MetricType = 'coins' | 'xp' | 'achievements';

export const LeaderboardPage = () => {
  const { player } = useAuthStore();
  const [metric, setMetric] = useState<MetricType>('coins');
  const [page, setPage] = useState(1);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', metric, page],
    queryFn: () => getLeaderboard({ metric, page, limit: 10 }),
    keepPreviousData: true,
  });

  const { data: personalRank } = useQuery({
    queryKey: ['leaderboard', 'personal', player?.id, metric],
    queryFn: () => getPersonalRank(player!.id, metric),
    enabled: !!player,
  });

  return (
    <DashboardLayout>
      <LeaderboardHeader />
      <MetricTabs metric={metric} onMetricChange={setMetric} />
      <Podium topThree={leaderboard?.slice(0, 3)} />
      <RankingsTable rankings={leaderboard?.slice(3)} isLoading={isLoading} />
      <PersonalRankBanner personalRank={personalRank} />
    </DashboardLayout>
  );
};
```

#### 5.2 Header con Timer de Temporada
```typescript
// src/components/features/leaderboard/LeaderboardHeader.tsx
export const LeaderboardHeader = () => {
  const { timeRemaining } = useSeasonCountdown();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-white">Global Ranking</h1>
        <div className="flex items-center gap-2 text-slate-400 mt-2">
          <span className="material-symbols-outlined">schedule</span>
          <p className="text-sm">
            Season 12 ends in: <span className="text-primary font-bold">{timeRemaining}</span>
          </p>
        </div>
      </div>
      <button className="flex items-center gap-2 px-6 py-3 bg-primary rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
        <span className="material-symbols-outlined">redeem</span>
        Claim Rewards
      </button>
    </div>
  );
};

// Hook para countdown
const useSeasonCountdown = () => {
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    const endDate = new Date('2026-01-15T23:59:59');
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { timeRemaining };
};
```

#### 5.3 Tabs de Métricas
```typescript
// src/components/features/leaderboard/MetricTabs.tsx
export const MetricTabs = ({ metric, onMetricChange }) => {
  const metrics = [
    { id: 'coins', label: 'Coins' },
    { id: 'xp', label: 'XP' },
    { id: 'achievements', label: 'Achievements' },
  ];

  return (
    <div className="flex mb-8">
      <div className="flex h-12 w-full max-w-md items-center justify-center rounded-xl bg-surface-dark p-1.5">
        {metrics.map(m => (
          <button
            key={m.id}
            onClick={() => onMetricChange(m.id)}
            className={`flex-1 h-full rounded-lg font-bold text-sm transition-all ${
              metric === m.id
                ? 'bg-background-dark text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### 5.4 Podio Top 3
```typescript
// src/components/features/leaderboard/Podium.tsx
export const Podium = ({ topThree }) => {
  if (!topThree || topThree.length < 3) return <PodiumSkeleton />;

  // Orden visual: 2do, 1ro, 3ro
  const orderedPodium = [topThree[1], topThree[0], topThree[2]];
  const medals = ['silver', 'gold', 'bronze'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
      {orderedPodium.map((player, index) => (
        <PodiumCard
          key={player.id}
          player={player}
          rank={index === 1 ? 1 : index === 0 ? 2 : 3}
          medal={medals[index]}
        />
      ))}
    </div>
  );
};
```

#### 5.5 Componente PodiumCard
```typescript
// src/components/features/leaderboard/PodiumCard.tsx
interface PodiumCardProps {
  player: LeaderboardPlayer;
  rank: number;
  medal: 'gold' | 'silver' | 'bronze';
}

export const PodiumCard = ({ player, rank, medal }: PodiumCardProps) => {
  const medalConfig = {
    gold: {
      gradient: 'from-yellow-400 to-orange-500',
      border: 'border-gold',
      ring: 'ring-4 ring-primary/20',
      size: 'size-32',
      iconSize: 'text-4xl',
    },
    silver: {
      gradient: 'from-gray-400 to-gray-300',
      border: 'border-silver',
      ring: '',
      size: 'size-24',
      iconSize: 'text-3xl',
    },
    bronze: {
      gradient: 'from-orange-700 to-orange-900',
      border: 'border-bronze',
      ring: '',
      size: 'size-24',
      iconSize: 'text-3xl',
    },
  };

  const config = medalConfig[medal];

  return (
    <div className={`flex flex-col items-center gap-4 group ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}>
      {/* Avatar */}
      <div className="relative">
        <div className={`${config.size} rounded-full border-4 ${config.border} ${config.ring} p-1 bg-background-dark overflow-hidden`}>
          <img
            src={player.avatar}
            alt={player.username}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        {/* Crown para #1 */}
        {rank === 1 && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-gold animate-bounce">
            <span className="material-symbols-outlined text-4xl fill-1">workspace_premium</span>
          </div>
        )}
        
        {/* Badge de rank */}
        <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${medal}-gradient text-white font-black px-4 py-1.5 rounded-full shadow-xl`}>
          #{rank}
        </div>
      </div>

      {/* Card con info */}
      <div className={`w-full bg-card-dark p-${rank === 1 ? '8' : '6'} rounded-2xl text-center border-b-4 ${config.border} transition-transform group-hover:-translate-y-1`}>
        <h3 className={`font-black ${rank === 1 ? 'text-2xl' : 'text-lg'} mb-1`}>
          {player.username}
        </h3>
        <p className={`text-primary font-bold ${rank === 1 ? 'text-lg' : ''}`}>
          {player.score.toLocaleString()} {player.metric}
        </p>
        
        {/* Badge de título */}
        <div className="mt-4 flex justify-center gap-1 items-center">
          <span className={`material-symbols-outlined text-${medal}`}>
            {rank === 1 ? 'military_tech' : rank === 2 ? 'stars' : 'shield'}
          </span>
          <span className="text-xs uppercase font-black text-slate-400">
            {player.title}
          </span>
        </div>
      </div>
    </div>
  );
};
```

#### 5.6 Tabla de Rankings (4-10+)
```typescript
// src/components/features/leaderboard/RankingsTable.tsx
export const RankingsTable = ({ rankings, isLoading }) => {
  if (isLoading) return <TableSkeleton />;

  return (
    <div className="bg-card-dark/30 rounded-2xl overflow-hidden border border-border-dark">
      <table className="w-full">
        <thead>
          <tr className="bg-surface-dark text-slate-400 text-xs font-black uppercase">
            <th className="px-6 py-4 text-left">Rank</th>
            <th className="px-6 py-4 text-left">Player</th>
            <th className="px-6 py-4 text-left hidden sm:table-cell">Status</th>
            <th className="px-6 py-4 text-right">Score</th>
            <th className="px-6 py-4 w-16"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark">
          {rankings?.map((player, index) => (
            <tr key={player.id} className="hover:bg-white/5 transition-colors">
              <td className="px-6 py-4 font-black text-lg text-slate-400">
                {String(index + 4).padStart(2, '0')}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={player.avatar}
                    alt={player.username}
                    className="size-10 rounded-full"
                  />
                  <span className="font-bold">{player.username}</span>
                </div>
              </td>
              <td className="px-6 py-4 hidden sm:table-cell">
                <StatusBadge status={player.status} />
              </td>
              <td className="px-6 py-4 text-right font-black text-primary">
                {player.score.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="p-4 bg-surface-dark/50 text-center">
        <button className="text-sm font-bold text-primary hover:underline">
          View Full Leaderboard (100+)
        </button>
      </div>
    </div>
  );
};
```

#### 5.7 Banner Sticky de Posición Personal
```typescript
// src/components/features/leaderboard/PersonalRankBanner.tsx
export const PersonalRankBanner = ({ personalRank }) => {
  if (!personalRank) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background-dark border-t border-primary/30 p-4 md:px-40 z-50 shadow-2xl">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Rank Badge */}
        <div className="flex items-center gap-4">
          <div className="size-12 bg-primary/20 rounded-xl border border-primary/30 flex items-center justify-center">
            <span className="font-black text-primary">#{personalRank.rank}</span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={personalRank.player.avatar}
              alt="You"
              className="size-10 rounded-full hidden sm:block"
            />
            <div>
              <p className="text-xs uppercase font-black text-slate-400">Your Standing</p>
              <h4 className="font-bold">{personalRank.player.username} (You)</h4>
            </div>
          </div>
        </div>

        {/* Progress to Next Rank */}
        <div className="hidden md:flex flex-col items-center gap-1 flex-1 px-20">
          <div className="w-full h-2 bg-border-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary"
              style={{ width: `${personalRank.progressToNext}%` }}
            />
          </div>
          <p className="text-xs font-bold text-slate-400">
            {personalRank.pointsToNext.toLocaleString()} XP to next rank (#{personalRank.nextRank})
          </p>
        </div>

        {/* Score */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs font-black text-slate-400">COINS</p>
            <p className="font-black text-primary">{personalRank.score.toLocaleString()}</p>
          </div>
          <button className="hidden sm:flex size-10 items-center justify-center bg-surface-dark rounded-lg hover:bg-primary transition-all">
            <span className="material-symbols-outlined">leaderboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 5.8 API Client para Leaderboard
```typescript
// src/api/leaderboard.api.ts
interface LeaderboardParams {
  metric: 'coins' | 'xp' | 'achievements';
  page?: number;
  limit?: number;
}

export const getLeaderboard = async (params: LeaderboardParams) => {
  const res = await axios.get(`${PLAYER_BASE}/leaderboard`, { params });
  return res.data;
};

export const getPersonalRank = async (playerId: string, metric: string) => {
  const res = await axios.get(`${PLAYER_BASE}/leaderboard/me`, {
    params: { playerId, metric },
  });
  return res.data;
};
```

#### 5.9 WebSocket para Actualizaciones en Tiempo Real
```typescript
// src/hooks/useLeaderboardUpdates.ts
export const useLeaderboardUpdates = (metric: string) => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'LEADERBOARD_UPDATE' && data.metric === metric) {
        queryClient.invalidateQueries(['leaderboard', metric]);
      }
    };
    
    return () => ws.close();
  }, [metric]);
};
```

#### 5.10 Testing
```typescript
// src/pages/__tests__/Leaderboard.test.tsx
test('renderiza podio con top 3 correctamente', async () => {
  render(<LeaderboardPage />);
  
  await waitFor(() => {
    expect(screen.getByText('ShadowMaster')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });
});

test('cambiar métrica recarga leaderboard', async () => {
  render(<LeaderboardPage />);
  
  const xpTab = screen.getByRole('button', { name: /xp/i });
  await userEvent.click(xpTab);
  
  await waitFor(() => {
    // Verificar que los datos cambiaron
    expect(screen.getByText(/XP/i)).toBeInTheDocument();
  });
});
```

### Criterios de Aceptación
- [ ] Podio muestra top 3 con medallas y tamaños diferenciados
- [ ] Tabla de rankings carga datos paginados correctamente
- [ ] Filtros por métrica (Coins/XP/Achievements) funcionan
- [ ] Banner personal sticky muestra posición y progreso del jugador
- [ ] Countdown de temporada funciona correctamente
- [ ] WebSocket actualiza rankings en tiempo real
- [ ] Responsive en todos los breakpoints
- [ ] Accesibilidad: tabla navegable con teclado
- [ ] Tests cubren cambios de métrica y actualizaciones

### Endpoints Backend Utilizados
- `GET /leaderboard?metric=coins&page=1&limit=10` → Leaderboard paginado (player-service o dedicado)
- `GET /leaderboard/me?playerId=...&metric=coins` → Posición personal

---

---

## 🎯 Fase 6: Notificaciones y Modal de Logros

**Diseño base:** `6. notifications_and_achievement_modal/code.html`

### Objetivo
Implementar sistema completo de notificaciones toast (éxito, info, error) en tiempo real vía WebSocket/RabbitMQ, y modal detallado de achievements con progreso, recompensas y acciones.

### Pasos de Implementación

#### 6.1 Sistema de Notificaciones (Toast Stack)
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

---

---

## 🎯 Fase 7: Navegación y Estados UI Globales

**Diseño base:** `7. navigation_and_ui_states/code.html`

### Objetivo
Refinar el shell global de la aplicación con navegación completa, selector de idioma, estados de carga (skeleton, progress), estados vacíos (empty states), internacionalización, y optimizaciones de performance.

### Pasos de Implementación

#### 7.1 Shell de Aplicación (App Shell)
```typescript
// src/components/layout/AppShell.tsx
export const AppShell = ({ children }) => {
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
```

#### 7.2 Header Global con Idioma y Perfil
```typescript
// src/components/layout/GlobalHeader.tsx
export const GlobalHeader = () => {
  const { player, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl shadow-[0_0_15px_rgba(134,64,231,0.5)] flex items-center justify-center">
            <span className="material-symbols-outlined text-white fill-1">
              sports_esports
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">GameQuest</h1>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/dashboard" icon="dashboard" label="Dashboard" />
          <NavLink to="/achievements" icon="emoji_events" label="Achievements" />
          <NavLink to="/rewards" icon="card_giftcard" label="Rewards" />
          <NavLink to="/leaderboard" icon="leaderboard" label="Leaderboard" />
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <LanguageSelector language={language} onChange={setLanguage} />

          {/* User Profile & Menu */}
          {player && (
            <div className="relative flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{player.username}</p>
                <p className="text-xs text-primary font-bold uppercase">
                  Lvl {player.level} Elite
                </p>
              </div>
              
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="size-10 rounded-full border-2 border-primary overflow-hidden hover:ring-4 hover:ring-primary/20 transition-all"
              >
                <img src={player.avatar} alt="Profile" className="w-full h-full object-cover" />
              </button>

              {showProfileMenu && (
                <ProfileDropdown onClose={() => setShowProfileMenu(false)} onLogout={logout} />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Componente NavLink activo
const NavLink = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'text-primary border-b-2 border-primary'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">{icon}</span>
        {label}
      </span>
    </Link>
  );
};
```

#### 7.3 Selector de Idioma
```typescript
// src/components/layout/LanguageSelector.tsx
export const LanguageSelector = ({ language, onChange }) => {
  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'es', label: 'ES', name: 'Español' },
  ];

  return (
    <div className="flex items-center gap-2 bg-surface-dark p-1 rounded-lg border border-white/5">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`px-3 py-1 text-xs font-bold rounded transition-all ${
            language === lang.code
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          aria-label={`Switch to ${lang.name}`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
```

#### 7.4 Menú Dropdown de Perfil
```typescript
// src/components/layout/ProfileDropdown.tsx
export const ProfileDropdown = ({ onClose, onLogout }) => {
  const { player } = useAuthStore();
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={ref}
      className="absolute top-full right-0 mt-2 w-64 bg-card-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-primary/10">
        <p className="text-sm font-bold text-white">{player.username}</p>
        <p className="text-xs text-slate-400">{player.email}</p>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        <MenuItem icon="person" label="My Profile" to="/profile" />
        <MenuItem icon="settings" label="Settings" to="/settings" />
        <MenuItem icon="help" label="Help & Support" to="/support" />
        <div className="h-px bg-white/5 my-2" />
        <MenuItem 
          icon="logout" 
          label="Logout" 
          onClick={onLogout} 
          danger 
        />
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, to, onClick, danger = false }) => {
  const Component = to ? Link : 'button';
  
  return (
    <Component
      to={to}
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-slate-300 hover:bg-white/5'
      }`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </Component>
  );
};
```

#### 7.5 Breadcrumbs Dinámicos
```typescript
// src/hooks/useBreadcrumbs.ts
export const useBreadcrumbs = (pathname: string) => {
  const routes = {
    '/dashboard': 'Dashboard',
    '/achievements': 'Achievements',
    '/rewards': 'Rewards',
    '/leaderboard': 'Leaderboard',
    '/profile': 'Profile',
    '/settings': 'Settings',
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

// Componente Breadcrumbs
export const Breadcrumbs = ({ items }) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
    <Link to="/" className="text-slate-400 hover:text-white">
      <span className="material-symbols-outlined text-lg">home</span>
    </Link>
    {items.map((item, index) => (
      <React.Fragment key={item.path}>
        <span className="text-slate-600">/</span>
        {item.isLast ? (
          <span className="text-white font-medium">{item.label}</span>
        ) : (
          <Link to={item.path} className="text-slate-400 hover:text-white">
            {item.label}
          </Link>
        )}
      </React.Fragment>
    ))}
  </nav>
);
```

#### 7.6 Estados de Carga con Skeleton
```typescript
// src/components/common/LoadingStates.tsx
export const SkeletonCard = () => (
  <div className="bg-card-dark rounded-xl p-4 border border-border-dark space-y-4 animate-pulse">
    <div className="aspect-square rounded-lg bg-surface-dark skeleton-pulse" />
    <div className="space-y-2">
      <div className="h-4 w-3/4 rounded bg-surface-dark skeleton-pulse" />
      <div className="h-3 w-1/2 rounded bg-surface-dark skeleton-pulse opacity-60" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-2 animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-card-dark rounded-lg">
        <div className="size-10 rounded-full bg-surface-dark skeleton-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/4 rounded bg-surface-dark skeleton-pulse" />
          <div className="h-3 w-1/3 rounded bg-surface-dark skeleton-pulse opacity-60" />
        </div>
      </div>
    ))}
  </div>
);

export const ProgressBar = ({ progress, label }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <span className="text-primary font-medium">{label}</span>
      <span className="text-white font-bold">{progress}% Complete</span>
    </div>
    <div className="w-full h-1.5 bg-surface-dark rounded-full overflow-hidden">
      <div 
        className="h-full bg-primary shadow-[0_0_10px_rgba(134,64,231,0.5)] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);
```

#### 7.7 Estado Vacío (Empty State)
```typescript
// src/components/common/EmptyState.tsx
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="relative mb-8">
      <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full" />
      <div className="relative size-48 flex items-center justify-center bg-card-dark rounded-full border border-primary/30 shadow-[0_0_40px_rgba(134,64,231,0.1)]">
        <span className="material-symbols-outlined text-8xl text-primary" style={{ fontWeight: 200 }}>
          {icon}
        </span>
      </div>
      <div className="absolute -bottom-2 -right-2 size-12 bg-primary rounded-lg flex items-center justify-center shadow-lg transform rotate-12">
        <span className="material-symbols-outlined text-white">lock_open</span>
      </div>
    </div>

    <div className="max-w-md space-y-4">
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      <p className="text-slate-400 text-lg leading-relaxed">{description}</p>
      
      {action && (
        <div className="pt-6">
          <button 
            onClick={action.onClick}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(134,64,231,0.4)] hover:shadow-[0_0_30px_rgba(134,64,231,0.6)] transform hover:-translate-y-1"
          >
            <span className="material-symbols-outlined">explore</span>
            {action.label}
          </button>
        </div>
      )}
    </div>
  </div>
);
```

#### 7.8 Internacionalización (i18n)
```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// src/i18n/locales/en.json
{
  "nav": {
    "dashboard": "Dashboard",
    "achievements": "Achievements",
    "rewards": "Rewards",
    "leaderboard": "Leaderboard"
  },
  "achievements": {
    "title": "Achievements",
    "description": "Track your progress and unlock legendary rewards",
    "filters": {
      "all": "All",
      "unlocked": "Unlocked",
      "locked": "Locked",
      "timed": "Timed"
    }
  },
  "empty": {
    "achievements": {
      "title": "No Trophies Yet!",
      "description": "Your shelf is looking a bit dusty. Start your adventure today and earn your very first legendary badge.",
      "action": "Browse Quests"
    }
  }
}

// Uso en componentes:
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('achievements.title')}</h1>
```

#### 7.9 Optimizaciones de Performance
```typescript
// src/utils/performance.ts

// 1. Lazy Loading de Rutas
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Achievements = lazy(() => import('../pages/Achievements'));
// ... etc

// 2. Prefetch de datos en hover
export const usePrefetchOnHover = (queryKey: string[], queryFn: () => Promise<any>) => {
  const queryClient = useQueryClient();
  
  const handleMouseEnter = () => {
    queryClient.prefetchQuery(queryKey, queryFn);
  };
  
  return { onMouseEnter: handleMouseEnter };
};

// Uso:
const prefetchProps = usePrefetchOnHover(
  ['achievements', playerId],
  () => getPlayerAchievements(playerId)
);

<Link to="/achievements" {...prefetchProps}>Achievements</Link>

// 3. Virtualización de listas largas
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualizedAchievementList = ({ items }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }} className="relative">
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            className="absolute top-0 left-0 w-full"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <AchievementCard achievement={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 7.10 Monitoreo de Web Vitals
```typescript
// src/utils/webVitals.ts
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals';

export const reportWebVitals = (metric) => {
  // Enviar a servicio de analytics (Google Analytics, Datadog, etc.)
  console.log(metric);
  
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
};

// src/main.tsx
import { reportWebVitals } from './utils/webVitals';

onCLS(reportWebVitals);
onFID(reportWebVitals);
onLCP(reportWebVitals);
onTTFB(reportWebVitals);
```

#### 7.11 Testing de Integración Final
```typescript
// tests/e2e/full-flow.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('flujo completo: registro → dashboard → achievement → reward', async ({ page }) => {
  // 1. Registro
  await page.goto('/register');
  await page.fill('[name="username"]', 'testuser');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  // 2. Dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
  
  // 3. Navegar a Achievements
  await page.click('a[href="/achievements"]');
  await expect(page).toHaveURL('/achievements');
  
  // 4. Filtrar y abrir modal
  await page.click('button:has-text("Unlocked")');
  await page.click('.achievement-card:first-child');
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  
  // 5. Navegar a Rewards y claim
  await page.click('a[href="/rewards"]');
  await page.click('button:has-text("Claim Now"):first-child');
  await expect(page.locator('text=claimed successfully')).toBeVisible();
});
```

### Criterios de Aceptación
- [ ] Navegación global funciona en todos los breakpoints
- [ ] Breadcrumbs reflejan la ruta actual correctamente
- [ ] Selector de idioma cambia el idioma en toda la app
- [ ] Dropdown de perfil abre/cierra correctamente
- [ ] Estados de carga muestran skeletons apropiados
- [ ] Empty states guían al usuario con CTAs claros
- [ ] Prefetch de datos optimiza la navegación
- [ ] Web Vitals cumplen umbrales (LCP < 2.5s, CLS < 0.1)
- [ ] Tests e2e validan el flujo completo autenticado
- [ ] App es totalmente responsive y accesible

### Performance Targets
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1
- **Time to Interactive (TTI):** < 3.5s
- **Bundle Size:** < 200KB (gzipped)

---


