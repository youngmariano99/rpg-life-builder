# Life RPG Planner - Arquitectura del Sistema

## Visión General

Life RPG Planner es una aplicación web de planificación personal que fusiona metodologías de productividad con mecánicas de videojuegos RPG. Este documento describe la arquitectura frontend y la estrategia de integración con el backend.

## Stack Tecnológico

### Frontend (Actual)
- **Framework**: React 18 + Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Shadcn/UI
- **Animaciones**: Framer Motion
- **Visualización**: @xyflow/react (árboles de habilidades)
- **Estado**: React Query (TanStack Query)
- **Routing**: React Router DOM v6
- **Iconos**: Lucide React

### Backend (Futuro - .NET)
- **Framework**: ASP.NET Core Web API
- **ORM**: Entity Framework Core
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT + Identity

## Estructura del Proyecto

```
src/
├── assets/              # Imágenes y recursos estáticos
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes Shadcn/UI
│   ├── dashboard/      # Componentes del dashboard
│   ├── roles/          # Componentes de roles/clases
│   ├── quests/         # Componentes de misiones
│   ├── skills/         # Componentes del árbol de habilidades
│   └── shared/         # Componentes compartidos
├── hooks/              # Custom hooks
├── lib/                # Utilidades y helpers
├── pages/              # Páginas/Vistas principales
├── services/           # Capa de servicios
│   └── api/            # Servicios de API (mock → real)
├── types/              # Interfaces TypeScript
└── App.tsx             # Componente raíz

database/
└── schema.sql          # Esquema PostgreSQL

docs/
├── arquitectura.md     # Este documento
├── diseño_bd.md        # Documentación de base de datos
└── guia_usuario.md     # Guía de mecánicas RPG
```

## Estrategia de Conexión Frontend-Backend

### Fase 1: Datos Simulados (Actual)

El frontend utiliza datos mock en `src/services/api/mockData.ts`. Todas las funciones de servicio son **asíncronas** y simulan latencia de red:

```typescript
// Ejemplo: src/services/api/roleService.ts
export async function getRoles(): Promise<IRole[]> {
  await simulateDelay(300); // Simula latencia
  return [...mockRoles];
}
```

### Fase 2: Integración con API .NET

Para migrar a una API real, solo se necesita modificar el interior de cada función:

```typescript
// ANTES (Mock)
export async function getRoles(): Promise<IRole[]> {
  await simulateDelay(300);
  return [...mockRoles];
}

// DESPUÉS (API Real)
export async function getRoles(): Promise<IRole[]> {
  const response = await fetch('/api/roles', {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error('Error al obtener roles');
  return response.json();
}
```

### Configuración de API Base

Crear archivo `src/services/api/config.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.liferpg.com';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

## Controladores .NET Requeridos

### RolesController
```
GET    /api/roles           → Obtener todos los roles del usuario
GET    /api/roles/{id}      → Obtener rol por ID
POST   /api/roles           → Crear nuevo rol
PUT    /api/roles/{id}      → Actualizar rol
DELETE /api/roles/{id}      → Eliminar rol
POST   /api/roles/{id}/xp   → Agregar XP a un rol
```

### QuestsController
```
GET    /api/quests           → Obtener todas las misiones
GET    /api/quests/today     → Obtener misiones del día
GET    /api/quests/{id}      → Obtener misión por ID
POST   /api/quests           → Crear nueva misión
PUT    /api/quests/{id}      → Actualizar misión
DELETE /api/quests/{id}      → Eliminar misión
POST   /api/quests/{id}/complete   → Completar misión
POST   /api/quests/reset-daily     → Reiniciar misiones diarias
```

### SkillsController
```
GET    /api/skills              → Obtener todas las habilidades
GET    /api/skills?roleId={id}  → Obtener habilidades por rol
GET    /api/skills/{id}         → Obtener habilidad por ID
POST   /api/skills              → Crear nueva habilidad
PUT    /api/skills/{id}         → Actualizar habilidad
DELETE /api/skills/{id}         → Eliminar habilidad
POST   /api/skills/{id}/unlock  → Desbloquear habilidad
```

### ObjectivesController
```
GET    /api/objectives                      → Obtener todos los objetivos
GET    /api/objectives?quarter={q}&year={y} → Filtrar por trimestre
POST   /api/objectives                      → Crear objetivo
PUT    /api/objectives/{id}                 → Actualizar objetivo
DELETE /api/objectives/{id}                 → Eliminar objetivo
POST   /api/objectives/{id}/complete        → Completar objetivo
```

## Flujo de Datos

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Componente    │────▶│    Servicio      │────▶│   API (.NET)    │
│   React         │     │   TypeScript     │     │   Controller    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Estado UI     │◀────│   React Query    │◀────│   PostgreSQL    │
│   (Local)       │     │   (Cache)        │     │   Database      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Manejo de Estado

### React Query para Cache de Servidor

```typescript
// hooks/useRoles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, addXPToRole } from '@/services/api';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useAddXP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, amount }: { roleId: string; amount: number }) =>
      addXPToRole(roleId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}
```

## Autenticación (Implementación Futura)

1. **Login**: POST /api/auth/login → Retorna JWT
2. **Registro**: POST /api/auth/register
3. **Refresh Token**: POST /api/auth/refresh
4. **Logout**: POST /api/auth/logout

### Almacenamiento de Token
```typescript
// Guardar token
localStorage.setItem('token', jwt);

// Incluir en headers
fetch('/api/roles', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Consideraciones de Seguridad

1. **CORS**: Configurar en .NET para permitir el dominio del frontend
2. **Rate Limiting**: Implementar en API para prevenir abuso
3. **Validación**: Validar todos los inputs en frontend y backend
4. **Sanitización**: Escapar contenido generado por usuarios

## Variables de Entorno

```env
# .env.local (Frontend)
VITE_API_URL=https://api.liferpg.com
VITE_APP_NAME=Life RPG Planner

# appsettings.json (.NET)
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=liferpg;Username=user;Password=pass"
  },
  "Jwt": {
    "Key": "your-secret-key",
    "Issuer": "liferpg",
    "Audience": "liferpg-users"
  }
}
```

## Próximos Pasos

1. Implementar API .NET Core con los controladores descritos
2. Configurar Entity Framework Core con las entidades
3. Implementar autenticación JWT
4. Migrar servicios mock a llamadas fetch reales
5. Configurar CI/CD para despliegue automático
