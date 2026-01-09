# Gaming Logros & Recompensas - Frontend

Frontend en React + TypeScript + Vite para el sistema de logros y recompensas.

## Requisitos
- Node.js 20+
- npm 10+

## Configuración
1. Copia `.env.example` a `.env` y ajusta URLs:
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_ACHIEVEMENTS_API_URL=http://localhost:3002
VITE_REWARDS_API_URL=http://localhost:3003
VITE_WS_URL=ws://localhost:3001
```

2. Instala dependencias:
```bash
npm install
```

## Scripts
- `npm run dev`: Inicia el servidor de desarrollo (Vite)
- `npm run build`: Construye la app para producción
- `npm run preview`: Sirve el build localmente
- `npm run test`: Ejecuta tests con Vitest
- `npm run lint`: Lint de código
- `npm run type-check`: Verificación de tipos

## Estructura
- `src/`
  - `pages/`: pantallas stub por fase
  - `lib/api.ts`: cliente Axios
  - `store/auth.ts`: estado global con Zustand
  - `styles/index.css`: Tailwind

## Próximos pasos
- Implementar cada fase siguiendo el plan en `stitch_registration_and_login_screen/plan.md`
- Conectar APIs del backend (`player-service`, `achievement-service`, `reward-service`)

Frontend para el sistema de logros y recompensas de gaming - React + TypeScript + Vite
