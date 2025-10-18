-- =========================================
-- SISTEMA DE SNAPSHOTS TEMPORALES PARA CRONAURUS
-- =========================================
-- Permite almacenar el estado histórico de conceptos y relaciones en fechas específicas
-- Versión: 1.0
-- Fecha: 2025-10-17
-- =========================================

-- =========================================
-- TABLA: snapshots
-- =========================================
-- Almacena snapshots puntuales del estado de conceptos y relaciones
-- =========================================

CREATE TABLE IF NOT EXISTS snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thesaurus_id UUID NOT NULL REFERENCES thesauruses(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('concept', 'relationship')),
    entity_id UUID NOT NULL,
    snapshot_date INTEGER NOT NULL, -- Año como INTEGER para consistencia temporal
    snapshot_data JSONB NOT NULL, -- Estado completo serializado del concepto/relación
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Índices para performance óptima en consultas temporales
    UNIQUE(entity_type, entity_id, snapshot_date)
);

-- =========================================
-- TABLA: snapshot_changes
-- =========================================
-- Registra cambios específicos entre snapshots para análisis detallado
-- =========================================

CREATE TABLE IF NOT EXISTS snapshot_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(20) DEFAULT 'modified' CHECK (change_type IN ('added', 'modified', 'deleted'))
);

-- =========================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =========================================

-- Habilitar RLS en las tablas
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshot_changes ENABLE ROW LEVEL SECURITY;

-- Políticas para snapshots: solo el propietario del tesauro puede ver/modificar
CREATE POLICY "Users can view their own thesaurus snapshots" ON snapshots
    FOR SELECT USING (
        thesaurus_id IN (
            SELECT id FROM thesauruses WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own thesaurus snapshots" ON snapshots
    FOR INSERT WITH CHECK (
        thesaurus_id IN (
            SELECT id FROM thesauruses WHERE user_id = auth.uid()
        ) AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own thesaurus snapshots" ON snapshots
    FOR UPDATE USING (
        thesaurus_id IN (
            SELECT id FROM thesauruses WHERE user_id = auth.uid()
        ) AND user_id = auth.uid()
    );

CREATE POLICY "Users can delete their own thesaurus snapshots" ON snapshots
    FOR DELETE USING (
        thesaurus_id IN (
            SELECT id FROM thesauruses WHERE user_id = auth.uid()
        ) AND user_id = auth.uid()
    );

-- Políticas para snapshot_changes: siguen la misma lógica que snapshots
CREATE POLICY "Users can view their own snapshot changes" ON snapshot_changes
    FOR SELECT USING (
        snapshot_id IN (
            SELECT s.id FROM snapshots s
            JOIN thesauruses t ON s.thesaurus_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own snapshot changes" ON snapshot_changes
    FOR INSERT WITH CHECK (
        snapshot_id IN (
            SELECT s.id FROM snapshots s
            JOIN thesauruses t ON s.thesaurus_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own snapshot changes" ON snapshot_changes
    FOR UPDATE USING (
        snapshot_id IN (
            SELECT s.id FROM snapshots s
            JOIN thesauruses t ON s.thesaurus_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own snapshot changes" ON snapshot_changes
    FOR DELETE USING (
        snapshot_id IN (
            SELECT s.id FROM snapshots s
            JOIN thesauruses t ON s.thesaurus_id = t.id
            WHERE t.user_id = auth.uid()
        )
    );

-- =========================================
-- FUNCIONES HELPER
-- =========================================

-- Función para obtener el estado de un concepto en un año específico
CREATE OR REPLACE FUNCTION get_concept_state_at_year(
    p_concept_id UUID,
    p_year INTEGER,
    p_thesaurus_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Si no se especifica thesaurus_id, buscar en todos (útil para debugging)
    IF p_thesaurus_id IS NULL THEN
        SELECT snapshot_data INTO result
        FROM snapshots
        WHERE entity_type = 'concept'
          AND entity_id = p_concept_id
          AND snapshot_date <= p_year
        ORDER BY snapshot_date DESC
        LIMIT 1;
    ELSE
        SELECT snapshot_data INTO result
        FROM snapshots
        WHERE thesaurus_id = p_thesaurus_id
          AND entity_type = 'concept'
          AND entity_id = p_concept_id
          AND snapshot_date <= p_year
        ORDER BY snapshot_date DESC
        LIMIT 1;
    END IF;

    RETURN result;
END;
$$;

-- Función para obtener años disponibles con snapshots para un tesauro
CREATE OR REPLACE FUNCTION get_snapshot_years_for_thesaurus(
    p_thesaurus_id UUID
)
RETURNS TABLE(year INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT s.snapshot_date
    FROM snapshots s
    WHERE s.thesaurus_id = p_thesaurus_id
    ORDER BY s.snapshot_date DESC;
END;
$$;

-- Función para limpiar snapshots antiguos (útil para mantenimiento)
CREATE OR REPLACE FUNCTION cleanup_old_snapshots(
    p_thesaurus_id UUID,
    p_keep_years INTEGER DEFAULT 10
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_year INTEGER;
BEGIN
    -- Calcular año límite (mantener últimos N años)
    cutoff_year := EXTRACT(YEAR FROM NOW())::INTEGER - p_keep_years;

    -- Eliminar snapshots antiguos
    DELETE FROM snapshots
    WHERE thesaurus_id = p_thesaurus_id
      AND snapshot_date < cutoff_year;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$;

-- =========================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =========================================

COMMENT ON TABLE snapshots IS 'Almacena snapshots puntuales del estado histórico de conceptos y relaciones en fechas específicas';
COMMENT ON TABLE snapshot_changes IS 'Registra cambios específicos entre snapshots para análisis detallado de evolución';

COMMENT ON COLUMN snapshots.entity_type IS 'Tipo de entidad: concept o relationship';
COMMENT ON COLUMN snapshots.entity_id IS 'ID del concepto o relación';
COMMENT ON COLUMN snapshots.snapshot_date IS 'Año del snapshot (INTEGER para consistencia)';
COMMENT ON COLUMN snapshots.snapshot_data IS 'Estado completo serializado en JSONB';

COMMENT ON FUNCTION get_concept_state_at_year(UUID, INTEGER, UUID) IS 'Obtiene el estado de un concepto en un año específico';
COMMENT ON FUNCTION get_snapshot_years_for_thesaurus(UUID) IS 'Obtiene lista de años con snapshots disponibles para un tesauro';
COMMENT ON FUNCTION cleanup_old_snapshots(UUID, INTEGER) IS 'Limpia snapshots antiguos, manteniendo solo los últimos N años';

-- =========================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =========================================

-- Índice compuesto para consultas por tesauro y fecha
CREATE INDEX IF NOT EXISTS idx_snapshots_thesaurus_date
ON snapshots(thesaurus_id, snapshot_date);

-- Índice para consultas de evolución de entidades específicas
CREATE INDEX IF NOT EXISTS idx_snapshots_entity_evolution
ON snapshots(entity_type, entity_id, snapshot_date);

-- Índice para snapshot_changes por snapshot
CREATE INDEX IF NOT EXISTS idx_snapshot_changes_snapshot
ON snapshot_changes(snapshot_id);

-- Índice para snapshot_changes por campo
CREATE INDEX IF NOT EXISTS idx_snapshot_changes_field
ON snapshot_changes(field_name);

-- Índice para snapshot_changes por campo y snapshot
CREATE INDEX IF NOT EXISTS idx_snapshot_changes_field_date
ON snapshot_changes(snapshot_id, field_name);

-- =========================================
-- DATOS DE EJEMPLO (DESCOMENTAR PARA TESTING)
-- =========================================

/*
-- Insertar datos de ejemplo para testing
-- NOTA: Descomentar solo para desarrollo/testing

INSERT INTO snapshots (thesaurus_id, entity_type, entity_id, snapshot_date, snapshot_data, user_id)
SELECT
    t.id as thesaurus_id,
    'concept'::VARCHAR(20) as entity_type,
    c.id as entity_id,
    2020 as snapshot_date,
    jsonb_build_object(
        'id', c.id,
        'labels', jsonb_agg(DISTINCT jsonb_build_object('type', l.label_type, 'text', l.label_text)),
        'temporal_start', c.temporal_start,
        'temporal_end', c.temporal_end,
        'temporal_relevance', c.temporal_relevance
    ),
    t.user_id
FROM concepts c
JOIN thesauruses t ON c.thesaurus_id = t.id
JOIN labels l ON l.concept_id = c.id
WHERE t.title LIKE '%test%' -- Solo para tesauros de testing
GROUP BY t.id, c.id, t.user_id
LIMIT 5; -- Limitar para evitar sobrecarga

*/

-- =========================================
-- FIN DE LA MIGRACIÓN
-- =========================================

-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'snapshots') THEN
        RAISE EXCEPTION 'Table snapshots was not created successfully';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'snapshot_changes') THEN
        RAISE EXCEPTION 'Table snapshot_changes was not created successfully';
    END IF;

    RAISE NOTICE '✅ Snapshots system migration completed successfully';
END $$;