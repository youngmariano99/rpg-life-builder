-- ==========================================
-- LIFE RPG PLANNER - Esquema de Base de Datos
-- Sintaxis: PostgreSQL
-- Versión: 1.0.0
-- ==========================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABLA: users
-- Usuarios principales del sistema
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    mission TEXT,
    vision TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ==========================================
-- TABLA: roles
-- Roles/Clases del personaje (máximo 7 por usuario)
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL, -- Nombre del icono de lucide-react
    color VARCHAR(50) NOT NULL, -- Clase de color Tailwind
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    xp_to_next_level INTEGER DEFAULT 100 CHECK (xp_to_next_level > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT max_roles_per_user CHECK (
        (SELECT COUNT(*) FROM roles r WHERE r.user_id = user_id) <= 7
    )
);

CREATE INDEX idx_roles_user_id ON roles(user_id);
CREATE INDEX idx_roles_is_active ON roles(is_active);

-- ==========================================
-- TABLA: quests
-- Misiones/Hábitos diarios, semanales, mensuales
-- ==========================================
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    streak INTEGER DEFAULT 0 CHECK (streak >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quests_user_id ON quests(user_id);
CREATE INDEX idx_quests_role_id ON quests(role_id);
CREATE INDEX idx_quests_frequency ON quests(frequency);
CREATE INDEX idx_quests_is_completed ON quests(is_completed);

-- ==========================================
-- TABLA: quest_logs
-- Registro histórico de misiones completadas
-- ==========================================
CREATE TABLE quest_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    xp_earned INTEGER NOT NULL CHECK (xp_earned > 0)
);

CREATE INDEX idx_quest_logs_user_id ON quest_logs(user_id);
CREATE INDEX idx_quest_logs_quest_id ON quest_logs(quest_id);
CREATE INDEX idx_quest_logs_completed_at ON quest_logs(completed_at);

-- ==========================================
-- TABLA: skills
-- Habilidades del árbol de habilidades
-- ==========================================
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL,
    cost_xp INTEGER NOT NULL CHECK (cost_xp >= 0),
    cost_money DECIMAL(10, 2),
    cost_time VARCHAR(50), -- Ej: "40 horas"
    is_unlocked BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT FALSE,
    parent_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_role_id ON skills(role_id);
CREATE INDEX idx_skills_parent_id ON skills(parent_skill_id);
CREATE INDEX idx_skills_is_unlocked ON skills(is_unlocked);

-- ==========================================
-- TABLA: objectives
-- Objetivos trimestrales (Boss Battles)
-- ==========================================
CREATE TABLE objectives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    xp_reward INTEGER NOT NULL CHECK (xp_reward > 0),
    deadline DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_objectives_user_id ON objectives(user_id);
CREATE INDEX idx_objectives_role_id ON objectives(role_id);
CREATE INDEX idx_objectives_quarter_year ON objectives(quarter, year);
CREATE INDEX idx_objectives_status ON objectives(status);

-- ==========================================
-- TABLA: time_blocks
-- Bloques de tiempo (Técnica de la Represa)
-- ==========================================
CREATE TABLE time_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_period VARCHAR(20) NOT NULL CHECK (day_period IN ('morning', 'afternoon', 'evening')),
    block_type VARCHAR(20) NOT NULL CHECK (block_type IN ('focus', 'rest', 'admin')),
    is_recurring BOOLEAN DEFAULT FALSE,
    days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) <= 7), -- 0-6 (Dom-Sab)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_time_blocks_user_id ON time_blocks(user_id);
CREATE INDEX idx_time_blocks_role_id ON time_blocks(role_id);
CREATE INDEX idx_time_blocks_day_period ON time_blocks(day_period);

-- ==========================================
-- TABLA: campaigns
-- Temporadas/Campañas trimestrales
-- ==========================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    theme VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_campaign_dates CHECK (end_date > start_date),
    CONSTRAINT one_active_campaign UNIQUE (user_id, is_active) 
        -- Solo puede haber una campaña activa por usuario
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_quarter_year ON campaigns(quarter, year);
CREATE INDEX idx_campaigns_is_active ON campaigns(is_active);

-- ==========================================
-- TABLA: investments
-- Inversiones para objetivos/habilidades
-- ==========================================
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    objective_id UUID REFERENCES objectives(id) ON DELETE SET NULL,
    skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('money', 'time', 'course', 'tool', 'other')),
    amount DECIMAL(10, 2),
    estimated_time VARCHAR(50),
    url TEXT,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_objective_id ON investments(objective_id);
CREATE INDEX idx_investments_skill_id ON investments(skill_id);
CREATE INDEX idx_investments_status ON investments(status);

-- ==========================================
-- TABLA: xp_logs
-- Registro histórico de XP ganada
-- ==========================================
CREATE TABLE xp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('quest', 'objective', 'bonus')),
    source_id UUID NOT NULL,
    xp_amount INTEGER NOT NULL CHECK (xp_amount != 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX idx_xp_logs_role_id ON xp_logs(role_id);
CREATE INDEX idx_xp_logs_created_at ON xp_logs(created_at);

-- ==========================================
-- TABLA: user_stats
-- Estadísticas agregadas del usuario (para rendimiento)
-- ==========================================
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_quests_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    objectives_completed INTEGER DEFAULT 0,
    total_xp_earned INTEGER DEFAULT 0,
    hours_focused DECIMAL(10, 2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- FUNCIONES Y TRIGGERS
-- ==========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quests_updated_at
    BEFORE UPDATE ON quests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at
    BEFORE UPDATE ON objectives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular XP necesaria para el siguiente nivel
CREATE OR REPLACE FUNCTION calculate_xp_for_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Fórmula: 100 * nivel * 1.5
    RETURN FLOOR(100 * current_level * 1.5);
END;
$$ LANGUAGE plpgsql;

-- Función para agregar XP a un rol y manejar subida de nivel
CREATE OR REPLACE FUNCTION add_xp_to_role(
    p_role_id UUID,
    p_xp_amount INTEGER
)
RETURNS TABLE(new_level INTEGER, leveled_up BOOLEAN) AS $$
DECLARE
    v_current_xp INTEGER;
    v_xp_needed INTEGER;
    v_level INTEGER;
    v_leveled_up BOOLEAN := FALSE;
BEGIN
    SELECT current_xp, xp_to_next_level, level
    INTO v_current_xp, v_xp_needed, v_level
    FROM roles WHERE id = p_role_id;
    
    v_current_xp := v_current_xp + p_xp_amount;
    
    WHILE v_current_xp >= v_xp_needed AND v_level < 100 LOOP
        v_current_xp := v_current_xp - v_xp_needed;
        v_level := v_level + 1;
        v_xp_needed := calculate_xp_for_level(v_level);
        v_leveled_up := TRUE;
    END LOOP;
    
    UPDATE roles
    SET current_xp = v_current_xp,
        level = v_level,
        xp_to_next_level = v_xp_needed
    WHERE id = p_role_id;
    
    RETURN QUERY SELECT v_level, v_leveled_up;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- DATOS INICIALES (SEEDS)
-- ==========================================

-- Usuario de ejemplo (solo para desarrollo)
INSERT INTO users (id, email, username, password_hash, level, total_xp, mission, vision)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'heroe@liferpg.com',
    'ElGuerrero',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYn',
    15,
    4250,
    'Convertirme en la mejor versión de mí mismo cada día',
    'Ser un líder que inspira a otros a alcanzar su máximo potencial'
);

-- Estadísticas iniciales
INSERT INTO user_stats (user_id, total_quests_completed, current_streak, longest_streak, objectives_completed, total_xp_earned, hours_focused)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    156,
    12,
    45,
    3,
    4250,
    234
);

-- ==========================================
-- VISTAS ÚTILES
-- ==========================================

-- Vista de dashboard del usuario
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.username,
    u.level,
    u.total_xp,
    us.current_streak,
    us.total_quests_completed,
    (SELECT COUNT(*) FROM quests q WHERE q.user_id = u.id AND q.is_completed = FALSE) as pending_quests,
    (SELECT COUNT(*) FROM objectives o WHERE o.user_id = u.id AND o.status = 'in_progress') as active_objectives
FROM users u
LEFT JOIN user_stats us ON us.user_id = u.id;

-- Vista de progreso de roles
CREATE VIEW role_progress AS
SELECT 
    r.id,
    r.user_id,
    r.name,
    r.level,
    r.current_xp,
    r.xp_to_next_level,
    ROUND((r.current_xp::DECIMAL / r.xp_to_next_level) * 100, 2) as progress_percentage,
    (SELECT COUNT(*) FROM quests q WHERE q.role_id = r.id AND q.is_completed = TRUE) as quests_completed,
    (SELECT COUNT(*) FROM skills s WHERE s.role_id = r.id AND s.is_unlocked = TRUE) as skills_unlocked
FROM roles r
WHERE r.is_active = TRUE;

-- ==========================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ==========================================

COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema Life RPG Planner';
COMMENT ON TABLE roles IS 'Roles/Clases del personaje, máximo 7 por usuario';
COMMENT ON TABLE quests IS 'Misiones diarias, semanales o mensuales (hábitos gamificados)';
COMMENT ON TABLE skills IS 'Habilidades del árbol de habilidades por rol';
COMMENT ON TABLE objectives IS 'Objetivos trimestrales (Boss Battles)';
COMMENT ON TABLE time_blocks IS 'Bloques de tiempo para la técnica de la represa';
COMMENT ON TABLE campaigns IS 'Temporadas/Campañas trimestrales con narrativa';
COMMENT ON TABLE investments IS 'Inversiones en recursos para objetivos/habilidades';
COMMENT ON TABLE xp_logs IS 'Registro histórico de toda la XP ganada';
COMMENT ON TABLE user_stats IS 'Estadísticas agregadas para rendimiento de queries';
