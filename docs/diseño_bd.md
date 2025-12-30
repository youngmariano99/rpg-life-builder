# Life RPG Planner - Diseño de Base de Datos

## Diagrama Entidad-Relación

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   USERS     │───┐   │   ROLES     │───┐   │   SKILLS    │
│             │   │   │             │   │   │             │
│ id (PK)     │   │   │ id (PK)     │   │   │ id (PK)     │
│ email       │   │   │ user_id(FK) │◀──┘   │ role_id(FK) │◀──┐
│ username    │   │   │ name        │       │ name        │   │
│ level       │   │   │ level       │       │ cost_xp     │   │
│ total_xp    │   │   │ current_xp  │       │ is_unlocked │   │
│ mission     │   │   │ icon        │       │ parent_id   │───┘
│ vision      │   │   │ color       │       └─────────────┘
└──────┬──────┘   │   └──────┬──────┘
       │          │          │
       │          │          │
       ▼          │          ▼
┌─────────────┐   │   ┌─────────────┐
│   QUESTS    │   │   │ OBJECTIVES  │
│             │   │   │             │
│ id (PK)     │   │   │ id (PK)     │
│ user_id(FK) │◀──┤   │ user_id(FK) │◀──┐
│ role_id(FK) │   │   │ role_id(FK) │   │
│ title       │   │   │ title       │   │
│ xp_reward   │   │   │ quarter     │   │
│ frequency   │   │   │ year        │   │
│ is_completed│   │   │ status      │   │
│ streak      │   │   │ xp_reward   │   │
└──────┬──────┘   │   └─────────────┘   │
       │          │                     │
       ▼          │                     │
┌─────────────┐   │   ┌─────────────┐   │
│ QUEST_LOGS  │   │   │ INVESTMENTS │   │
│             │   │   │             │   │
│ id (PK)     │   │   │ id (PK)     │   │
│ quest_id(FK)│   │   │ user_id(FK) │◀──┤
│ user_id(FK) │◀──┤   │ objective_id│   │
│ xp_earned   │   │   │ skill_id    │   │
│ completed_at│   │   │ type        │   │
└─────────────┘   │   │ amount      │   │
                  │   └─────────────┘   │
                  │                     │
                  │   ┌─────────────┐   │
                  │   │ TIME_BLOCKS │   │
                  │   │             │   │
                  │   │ id (PK)     │   │
                  └──▶│ user_id(FK) │   │
                      │ role_id(FK) │   │
                      │ title       │   │
                      │ start_time  │   │
                      │ end_time    │   │
                      │ block_type  │   │
                      └─────────────┘   │
                                        │
                      ┌─────────────┐   │
                      │  CAMPAIGNS  │   │
                      │             │   │
                      │ id (PK)     │   │
                      │ user_id(FK) │◀──┤
                      │ name        │   │
                      │ quarter     │   │
                      │ year        │   │
                      │ is_active   │   │
                      └─────────────┘   │
                                        │
                      ┌─────────────┐   │
                      │  XP_LOGS    │   │
                      │             │   │
                      │ id (PK)     │   │
                      │ user_id(FK) │◀──┘
                      │ role_id(FK) │
                      │ source_type │
                      │ xp_amount   │
                      └─────────────┘
```

## Descripción de Tablas

### 1. USERS (Usuarios)

Tabla principal de usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| email | VARCHAR(255) | Email único del usuario |
| username | VARCHAR(100) | Nombre de usuario único |
| password_hash | VARCHAR(255) | Hash de contraseña (bcrypt) |
| avatar_url | TEXT | URL de la imagen de perfil |
| level | INTEGER | Nivel global del usuario (1-100) |
| total_xp | INTEGER | XP total acumulada |
| mission | TEXT | Misión personal del usuario |
| vision | TEXT | Visión personal del usuario |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### 2. ROLES (Roles/Clases)

Representa las áreas de vida del usuario (máximo 7).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| user_id | UUID | Referencia al usuario (FK) |
| name | VARCHAR(100) | Nombre del rol |
| description | TEXT | Descripción del rol |
| icon | VARCHAR(50) | Nombre del icono (lucide-react) |
| color | VARCHAR(50) | Clase de color Tailwind |
| level | INTEGER | Nivel del rol (1-100) |
| current_xp | INTEGER | XP actual del nivel |
| xp_to_next_level | INTEGER | XP necesaria para subir |
| is_active | BOOLEAN | Si el rol está activo |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

**Reglas de negocio:**
- Máximo 7 roles activos por usuario
- El nivel comienza en 1 y máximo es 100
- XP necesaria aumenta con cada nivel

### 3. QUESTS (Misiones/Hábitos)

Representa los hábitos diarios, semanales o mensuales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| user_id | UUID | Referencia al usuario (FK) |
| role_id | UUID | Referencia al rol (FK) |
| title | VARCHAR(255) | Título de la misión |
| description | TEXT | Descripción detallada |
| xp_reward | INTEGER | XP que otorga al completar |
| frequency | ENUM | 'daily', 'weekly', 'monthly' |
| is_completed | BOOLEAN | Si está completada hoy |
| completed_at | TIMESTAMP | Cuándo se completó |
| streak | INTEGER | Días consecutivos completados |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

**Reglas de negocio:**
- Las misiones diarias se reinician cada día
- El streak se rompe si no se completa un día
- La XP se otorga al rol asociado

### 4. SKILLS (Habilidades)

Representa las habilidades en el árbol de habilidades.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| role_id | UUID | Referencia al rol (FK) |
| name | VARCHAR(100) | Nombre de la habilidad |
| description | TEXT | Descripción de la habilidad |
| icon | VARCHAR(50) | Nombre del icono |
| cost_xp | INTEGER | Costo en XP para desbloquear |
| cost_money | DECIMAL | Costo en dinero (opcional) |
| cost_time | VARCHAR(50) | Tiempo estimado |
| is_unlocked | BOOLEAN | Si está desbloqueada |
| is_available | BOOLEAN | Si puede desbloquearse |
| parent_skill_id | UUID | Habilidad requisito (FK) |
| position_x | INTEGER | Posición X en el árbol |
| position_y | INTEGER | Posición Y en el árbol |
| created_at | TIMESTAMP | Fecha de creación |

**Reglas de negocio:**
- Una habilidad solo puede desbloquearse si el padre está desbloqueado
- Las habilidades raíz (sin padre) están disponibles desde el inicio

### 5. OBJECTIVES (Objetivos)

Representa los objetivos trimestrales (Boss Battles).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| user_id | UUID | Referencia al usuario (FK) |
| role_id | UUID | Referencia al rol (FK, opcional) |
| title | VARCHAR(255) | Título del objetivo |
| description | TEXT | Descripción detallada |
| quarter | ENUM | 'Q1', 'Q2', 'Q3', 'Q4' |
| year | INTEGER | Año del objetivo |
| status | ENUM | 'pending', 'in_progress', 'completed', 'failed' |
| xp_reward | INTEGER | XP que otorga al completar |
| deadline | DATE | Fecha límite |
| completed_at | TIMESTAMP | Cuándo se completó |
| created_at | TIMESTAMP | Fecha de creación |
| updated_at | TIMESTAMP | Última actualización |

### 6. TIME_BLOCKS (Bloques de Tiempo)

Representa los bloques de la Técnica de la Represa.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| user_id | UUID | Referencia al usuario (FK) |
| role_id | UUID | Referencia al rol (FK, opcional) |
| title | VARCHAR(100) | Título del bloque |
| description | TEXT | Descripción |
| start_time | TIME | Hora de inicio |
| end_time | TIME | Hora de fin |
| day_period | ENUM | 'morning', 'afternoon', 'evening' |
| block_type | ENUM | 'focus', 'rest', 'admin' |
| is_recurring | BOOLEAN | Si se repite |
| days_of_week | INTEGER[] | Días de la semana (0-6) |
| created_at | TIMESTAMP | Fecha de creación |

### 7. CAMPAIGNS (Campañas)

Representa las temporadas trimestrales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| user_id | UUID | Referencia al usuario (FK) |
| name | VARCHAR(100) | Nombre de la campaña |
| description | TEXT | Descripción narrativa |
| quarter | ENUM | 'Q1', 'Q2', 'Q3', 'Q4' |
| year | INTEGER | Año de la campaña |
| theme | VARCHAR(255) | Tema narrativo |
| start_date | DATE | Fecha de inicio |
| end_date | DATE | Fecha de fin |
| is_active | BOOLEAN | Si es la campaña activa |
| created_at | TIMESTAMP | Fecha de creación |

**Reglas de negocio:**
- Solo puede haber una campaña activa por usuario

### 8. INVESTMENTS (Inversiones)

Representa recursos invertidos para objetivos o habilidades.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (PK) |
| user_id | UUID | Referencia al usuario (FK) |
| objective_id | UUID | Referencia a objetivo (FK, opcional) |
| skill_id | UUID | Referencia a habilidad (FK, opcional) |
| title | VARCHAR(255) | Título de la inversión |
| type | ENUM | 'money', 'time', 'course', 'tool', 'other' |
| amount | DECIMAL | Cantidad monetaria |
| estimated_time | VARCHAR(50) | Tiempo estimado |
| url | TEXT | URL del recurso |
| status | ENUM | 'planned', 'in_progress', 'completed' |
| created_at | TIMESTAMP | Fecha de creación |

## Índices Recomendados

```sql
-- Búsquedas frecuentes
CREATE INDEX idx_quests_user_date ON quests(user_id, created_at);
CREATE INDEX idx_roles_user_active ON roles(user_id, is_active);
CREATE INDEX idx_objectives_user_quarter ON objectives(user_id, quarter, year);

-- Foreign keys
CREATE INDEX idx_skills_parent ON skills(parent_skill_id);
CREATE INDEX idx_time_blocks_user ON time_blocks(user_id, day_period);
```

## Entidades .NET Correspondientes

```csharp
// Ejemplo de entidad para Entity Framework
public class Role
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Icon { get; set; }
    public string Color { get; set; }
    public int Level { get; set; }
    public int CurrentXp { get; set; }
    public int XpToNextLevel { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navegación
    public User User { get; set; }
    public ICollection<Quest> Quests { get; set; }
    public ICollection<Skill> Skills { get; set; }
}
```

## Migración de Datos

El archivo `database/schema.sql` contiene todo el esquema listo para ejecutar en PostgreSQL. Para aplicarlo:

```bash
psql -U usuario -d liferpg -f database/schema.sql
```
