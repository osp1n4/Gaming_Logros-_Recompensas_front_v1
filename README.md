# 🎮 Gaming Logros & Recompensas - Frontend

Sistema completo de frontend para plataforma de gaming con logros, recompensas y ranking global. Construido con **React 18**, **TypeScript** y **Vite**.

## 📋 Estado del Proyecto

| Fase | Descripción | Estado |
|------|------------|--------|
| 1️⃣ | Sistema de Autenticación | ✅ Completado |
| 2️⃣ | Panel Principal (Dashboard) | ✅ Completado |
| 3️⃣ | Catálogo de Logros | ✅ Completado |
| 4️⃣ | Sistema de Recompensas | ✅ Completado |
| 5️⃣ | Ranking Global (Leaderboard) | ✅ Completado |
| 6️⃣ | Sistema de Notificaciones | ✅ Completado |

## 🚀 Inicio Rápido

### Requisitos
- **Node.js** 20+
- **npm** 10+
- **Backend** ejecutándose en puertos 3001, 3002, 3003

### 1. Configuración del Proyecto
```bash
# Clonar repositorio
git clone <repo-url>
cd Gaming_Logros-_Recompensas_front_v1

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

### 2. Variables de Entorno (.env)
```
VITE_PLAYER_SERVICE_URL=http://localhost:3001
VITE_ACHIEVEMENT_SERVICE_URL=http://localhost:3002
VITE_REWARD_SERVICE_URL=http://localhost:3003
```

### 3. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`

## 📦 Stack Tecnológico

### Framework & Build
- **React 18.3.1** - UI moderno con Hooks
- **TypeScript 5.x** - Tipado seguro
- **Vite 5.x** - Build rápido y HMR optimizado
- **React Router 6.x** - Navegación entre páginas

### Estado & Datos
- **Zustand** - Gestión de estado global (autenticación)
- **React Query** - Sincronización y caching de datos del servidor
- **Axios** - Cliente HTTP con interceptores

### Estilos
- **Tailwind CSS 3.x** - Utilidades de CSS
- **Efectos Neon** - Animaciones personalizadas
- **Glassmorphism** - Estilos modernos

### Testing & Linting
- **Vitest** - Tests unitarios
- **ESLint** - Análisis de código
- **Prettier** - Formato automático

## 📂 Estructura del Proyecto

```
src/
├── pages/                    # Vistas principales
│   ├── Login.tsx            # Autenticación
│   ├── Dashboard.tsx        # Panel principal
│   ├── Achievements.tsx     # Catálogo de logros
│   ├── Rewards.tsx          # Sistema de recompensas
│   ├── Leaderboard.tsx      # Ranking global
│   └── Notifications.tsx    # Historial de notificaciones
│
├── components/              # Componentes reutilizables
│   ├── common/              # UI genéricos (Button, Input, Modal, etc)
│   ├── layout/              # Layout (Sidebar, TopBar, Header)
│   ├── dashboard/           # Componentes del Dashboard
│   ├── achievements/        # Grid, Cards, Modal de logros
│   ├── rewards/             # Tabs, Cards, Balance
│   └── leaderboard/         # Podio, Tabla, Metrics
│
├── services/                # Comunicación con backend
│   ├── auth.service.ts      # Player Service
│   ├── achievement.service.ts # Achievement Service
│   ├── player.service.ts    # Player Service
│   ├── reward.service.ts    # Reward Service
│   └── leaderboard.service.ts # Ranking
│
├── store/                   # Estado global
│   ├── auth.ts              # Autenticación (Zustand)
│   └── notification.store.ts # Notificaciones (Zustand)
│
├── hooks/                   # Custom Hooks
│   ├── useAuth.ts          # Lógica de autenticación
│   ├── usePlayerDashboard.ts # Dashboard
│   ├── useAppNotifications.ts # Notificaciones
│   └── useNetworkStatus.ts  # Estado de red
│
├── types/                   # Definiciones TypeScript
│   ├── achievement.types.ts
│   ├── leaderboard.types.ts
│   └── reward.types.ts
│
├── lib/                     # Utilidades
│   └── api.ts              # Configuración Axios
│
└── styles/                  # Estilos globales
    └── index.css           # Tailwind + animaciones
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (Vite)
npm run build            # Construye para producción
npm run preview          # Sirve el build localmente

```

## 🔌 Integración con Backend

### Microservicios Conectados

**1. Player Service (puerto 3001)**
- Autenticación y registro
- Perfil del jugador
- Eventos de juego

**2. Achievement Service (puerto 3002)**
- Logros disponibles
- Progreso del jugador
- Detalles de logros

**3. Reward Service (puerto 3003)**
- Recompensas asignadas
- Balance de coins/points
- Historial de recompensas

### Endpoints Utilizados

#### Player Service
```
POST   /players              # Registrar nuevo jugador
POST   /auth/login           # Iniciar sesión
GET    /players/me           # Obtener perfil autenticado
GET    /players/:id          # Obtener datos de jugador
POST   /players/events       # Registrar evento de juego
GET    /players              # Listar todos los jugadores (para leaderboard)
```

#### Achievement Service
```
GET    /achievements         # Todos los logros
GET    /achievements/players/:playerId              # Logros del jugador
GET    /achievements/players/:playerId/:achievementId/progress # Progreso
```

#### Reward Service
```
GET    /rewards/players/:playerId        # Recompensas del jugador
GET    /rewards/balance/:playerId        # Balance total (coins/points)
```

## ✨ Características Principales

### 🔐 Fase 1: Autenticación
- Registro de usuarios con validación
- Rutas protegidas
- Gestión de sesión persistente

### 📊 Fase 2: Dashboard
- Estadísticas principales (coins, XP, achievements, level)
- Eventos rápidos (matar monstruos, tiempo jugado)
- Logros recientes en progreso
- Últimas recompensas obtenidas

### 🏆 Fase 3: Logros
- Grid de logros con estados visuales
- Filtros: All, Unlocked, Locked, Timed
- Búsqueda en tiempo real
- Barras de progreso por logro
- Modal de detalle

### 💎 Fase 4: Recompensas
- 3 tabs: Assigned, Claimed, My Balance
- Visualización de recompensas pendientes
- Balance total de monedas y puntos
- Filtrado automático en frontend

### 🥇 Fase 5: Leaderboard
- Podio visual de top 3 con medallas
- Tabla de rankings completa
- Filtros por métrica: Monsters Killed, Time Played
- Posición personal destacada
- Actualización automática cada 30s

### 🔔 Fase 6: Notificaciones
- Sistema de toast (success, info, error)
- Auto-dismiss después de 5 segundos
- Stack de múltiples notificaciones
- Página de historial centralizada
- Animaciones suaves


## 🔒 Seguridad

- ✅ Sanitización de inputs
- ✅ Validación client-side con Zod
- ✅ Protección XSS
- ✅ HTTPS obligatorio en producción

## 📱 Responsividad

- Mobile First approach
- Breakpoints: 640px, 768px, 1024px, 1280px
- Touch-friendly en dispositivos móviles
- Soporte para todas las pantallas modernas

## 🎨 Diseño Visual

- **Colores**: Tema oscuro con acentos neon (púrpura, dorado, rosa)
- **Animaciones**: Neon glow, transiciones suaves
- **Fuentes**: Sans-serif moderna (Tailwind defaults)
- **Efectos**: Glassmorphism, sombras personalizadas







