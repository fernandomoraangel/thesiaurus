-- ============================================
-- QUERIES DE PRUEBA Y VERIFICACIÓN
-- Sistema de Vistas Analíticas
-- ============================================

-- 1. VERIFICAR QUE LAS TABLAS FUERON CREADAS
-- ============================================

-- Ver estructura de la tabla analytical_views
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'analytical_views'
ORDER BY ordinal_position;

-- Ver estructura de la tabla active_analytical_views
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'active_analytical_views'
ORDER BY ordinal_position;

-- 2. VERIFICAR ÍNDICES CREADOS
-- ============================================

SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('analytical_views', 'active_analytical_views');

-- 3. VERIFICAR POLÍTICAS RLS
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('analytical_views', 'active_analytical_views');

-- 4. CONSULTAS DE DIAGNÓSTICO
-- ============================================

-- Contar vistas por usuario
SELECT 
    u.email,
    COUNT(av.id) as total_views,
    COUNT(CASE WHEN av.is_default THEN 1 END) as default_views,
    COUNT(CASE WHEN NOT av.is_default THEN 1 END) as custom_views
FROM auth.users u
LEFT JOIN analytical_views av ON av.user_id = u.id
GROUP BY u.email
ORDER BY total_views DESC;

-- Contar vistas activas por usuario y tesauro
SELECT 
    u.email as usuario,
    t.title as tesauro,
    COUNT(aav.id) as vistas_activas
FROM auth.users u
LEFT JOIN thesauruses t ON t.user_id = u.id
LEFT JOIN active_analytical_views aav ON aav.user_id = u.id AND aav.thesaurus_id = t.id
GROUP BY u.email, t.title
ORDER BY vistas_activas DESC;

-- Ver todas las vistas con sus filtros
SELECT 
    av.name,
    av.description,
    av.color,
    av.is_default,
    av.filters,
    COUNT(aav.id) as users_using
FROM analytical_views av
LEFT JOIN active_analytical_views aav ON aav.view_id = av.id
GROUP BY av.id, av.name, av.description, av.color, av.is_default, av.filters
ORDER BY av.name;

-- 5. CONSULTAS ÚTILES PARA ADMINISTRACIÓN
-- ============================================

-- Encontrar vistas sin usar
SELECT 
    av.name,
    av.description,
    av.created_at
FROM analytical_views av
LEFT JOIN active_analytical_views aav ON aav.view_id = av.id
WHERE aav.id IS NULL
  AND av.is_default = false
ORDER BY av.created_at DESC;

-- Vistas más populares
SELECT 
    av.name,
    av.description,
    COUNT(aav.id) as active_count,
    av.is_default
FROM analytical_views av
JOIN active_analytical_views aav ON aav.view_id = av.id
GROUP BY av.id, av.name, av.description, av.is_default
ORDER BY active_count DESC;

-- Ver configuración completa de una vista específica
SELECT 
    av.id,
    av.name,
    av.description,
    av.color,
    av.is_default,
    av.filters::jsonb,
    av.created_at,
    av.updated_at,
    u.email as created_by,
    t.title as tesauro
FROM analytical_views av
JOIN auth.users u ON u.id = av.user_id
JOIN thesauruses t ON t.id = av.thesaurus_id
WHERE av.name = 'Vista Tecnológica'; -- Cambiar nombre según necesidad

-- 6. QUERIES DE MANTENIMIENTO
-- ============================================

-- Limpiar vistas huérfanas (sin tesauro asociado)
DELETE FROM analytical_views
WHERE thesaurus_id NOT IN (SELECT id FROM thesauruses);

-- Limpiar activaciones huérfanas
DELETE FROM active_analytical_views
WHERE view_id NOT IN (SELECT id FROM analytical_views);

-- 7. QUERIES DE ANÁLISIS DE DATOS
-- ============================================

-- Análisis de filtros más usados
SELECT 
    jsonb_object_keys(filters) as filter_type,
    COUNT(*) as usage_count
FROM analytical_views
WHERE filters IS NOT NULL AND filters != '{}'::jsonb
GROUP BY filter_type
ORDER BY usage_count DESC;

-- Distribución de vistas por color
SELECT 
    color,
    COUNT(*) as count
FROM analytical_views
GROUP BY color
ORDER BY count DESC;

-- Vistas creadas por mes
SELECT 
    DATE_TRUNC('month', created_at) as mes,
    COUNT(*) as vistas_creadas,
    COUNT(CASE WHEN is_default THEN 1 END) as predefinidas,
    COUNT(CASE WHEN NOT is_default THEN 1 END) as personalizadas
FROM analytical_views
GROUP BY mes
ORDER BY mes DESC;

-- 8. QUERIES PARA DEBUGGING
-- ============================================

-- Ver todas las vistas de un usuario específico
SELECT 
    av.*,
    t.title as tesauro_nombre,
    CASE 
        WHEN aav.id IS NOT NULL THEN 'ACTIVA'
        ELSE 'INACTIVA'
    END as estado
FROM analytical_views av
JOIN thesauruses t ON t.id = av.thesaurus_id
LEFT JOIN active_analytical_views aav ON aav.view_id = av.id
WHERE av.user_id = 'UUID_DEL_USUARIO' -- Reemplazar con UUID real
ORDER BY av.name;

-- Ver estructura de filtros de una vista
SELECT 
    name,
    jsonb_pretty(filters) as filtros_formateados
FROM analytical_views
WHERE id = 'UUID_DE_LA_VISTA'; -- Reemplazar con UUID real

-- Verificar integridad referencial
SELECT 
    'analytical_views sin usuario válido' as issue,
    COUNT(*) as count
FROM analytical_views av
LEFT JOIN auth.users u ON u.id = av.user_id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'analytical_views sin tesauro válido' as issue,
    COUNT(*) as count
FROM analytical_views av
LEFT JOIN thesauruses t ON t.id = av.thesaurus_id
WHERE t.id IS NULL

UNION ALL

SELECT 
    'active_analytical_views sin vista válida' as issue,
    COUNT(*) as count
FROM active_analytical_views aav
LEFT JOIN analytical_views av ON av.id = aav.view_id
WHERE av.id IS NULL;

-- 9. QUERIES DE PERFORMANCE
-- ============================================

-- Analizar tamaño de tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('analytical_views', 'active_analytical_views')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver queries lentas relacionadas con vistas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query LIKE '%analytical_views%'
ORDER BY mean_time DESC
LIMIT 10;

-- 10. CONSULTAS DE EJEMPLO PARA FRONTEND
-- ============================================

-- Obtener todas las vistas disponibles para un usuario/tesauro
SELECT 
    av.*
FROM analytical_views av
WHERE av.user_id = 'UUID_DEL_USUARIO' -- auth.uid() en RLS
  AND av.thesaurus_id = 'UUID_DEL_TESAURO'
ORDER BY av.is_default DESC, av.name;

-- Obtener vistas activas
SELECT 
    av.*
FROM analytical_views av
JOIN active_analytical_views aav ON aav.view_id = av.id
WHERE aav.user_id = 'UUID_DEL_USUARIO'
  AND aav.thesaurus_id = 'UUID_DEL_TESAURO'
ORDER BY av.name;

-- Insertar nueva vista personalizada
INSERT INTO analytical_views (
    user_id,
    thesaurus_id,
    name,
    description,
    color,
    filters,
    is_default
) VALUES (
    'UUID_DEL_USUARIO',
    'UUID_DEL_TESAURO',
    'Mi Vista Personalizada',
    'Descripción de mi vista',
    '#ff6b6b',
    '{
        "categories": ["uuid-cat-1", "uuid-cat-2"],
        "use_temporal": true,
        "temporal_range": [2000, 2020],
        "min_connections": 2
    }'::jsonb,
    false
) RETURNING *;

-- Activar una vista
INSERT INTO active_analytical_views (
    user_id,
    thesaurus_id,
    view_id
) VALUES (
    'UUID_DEL_USUARIO',
    'UUID_DEL_TESAURO',
    'UUID_DE_LA_VISTA'
) ON CONFLICT DO NOTHING
RETURNING *;

-- Desactivar una vista
DELETE FROM active_analytical_views
WHERE user_id = 'UUID_DEL_USUARIO'
  AND thesaurus_id = 'UUID_DEL_TESAURO'
  AND view_id = 'UUID_DE_LA_VISTA';

-- 11. RESTAURACIÓN Y BACKUP
-- ============================================

-- Crear backup de vistas
CREATE TABLE analytical_views_backup AS
SELECT * FROM analytical_views;

CREATE TABLE active_analytical_views_backup AS
SELECT * FROM active_analytical_views;

-- Restaurar desde backup
INSERT INTO analytical_views
SELECT * FROM analytical_views_backup
ON CONFLICT (id) DO NOTHING;

INSERT INTO active_analytical_views
SELECT * FROM active_analytical_views_backup
ON CONFLICT (id) DO NOTHING;

-- 12. TESTING DE POLÍTICAS RLS
-- ============================================

-- IMPORTANTE: Ejecutar estos queries como usuario autenticado
-- Para testear RLS, necesitas estar autenticado como un usuario específico

-- Ver mis propias vistas (debería funcionar)
SELECT * FROM analytical_views;

-- Intentar ver vistas de otro usuario (debería devolver vacío)
SELECT * FROM analytical_views WHERE user_id != auth.uid();

-- Intentar insertar vista para otro usuario (debería fallar)
INSERT INTO analytical_views (user_id, thesaurus_id, name)
VALUES ('otro-uuid', 'tesauro-uuid', 'Test'); -- Debería fallar por RLS

-- Intentar eliminar vista predefinida (debería fallar)
DELETE FROM analytical_views 
WHERE is_default = true; -- Debería fallar por política

-- ============================================
-- NOTAS DE USO:
-- ============================================
-- 1. Reemplazar 'UUID_DEL_USUARIO' con IDs reales
-- 2. Ejecutar queries de verificación después de la migración
-- 3. Usar queries de diagnóstico periódicamente
-- 4. Mantener backups antes de operaciones de mantenimiento
-- 5. Monitorear performance con las queries de la sección 9
-- ============================================
