# Sistema de Snapshots Temporales - Diseño Arquitectónico

## 📋 Resumen Ejecutivo

El sistema de snapshots temporales permite que el tesauro refleje la evolución histórica de términos y relaciones. Cada cambio significativo crea un snapshot puntual que captura el estado completo de un concepto o relación en una fecha específica.

## 🎯 Requerimientos Funcionales

### Campos que Evolucionan
- **Todos los campos editables**: labels, definiciones, notas, campos temporales, citas, obras, multimedia
- **Campos específicos**: prefLabel, altLabels, hiddenLabels, definition, scopeNote, example, temporal_start/end/relevance, citations, works, media

### Tipo de Evolución
- **Snapshots puntuales**: Cada modificación crea un registro histórico con timestamp exacto
- **Recuperación temporal**: Al navegar a una fecha específica, se muestra el estado del snapshot más reciente anterior
- **Visualización**: El formulario se puebla automáticamente con datos históricos al pausar la animación

## 🏗️ Arquitectura del Sistema

### 1. Modelo de Datos

#### Tabla `snapshots`
```sql
CREATE TABLE snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    thesaurus_id UUID NOT NULL REFERENCES thesauruses(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('concept', 'relationship')),
    entity_id UUID NOT NULL,
    snapshot_date INTEGER NOT NULL, -- Año como INTEGER para consistencia
    snapshot_data JSONB NOT NULL, -- Estado completo serializado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Índices para performance
    UNIQUE(entity_type, entity_id, snapshot_date),
    INDEX idx_snapshots_thesaurus (thesaurus_id),
    INDEX idx_snapshots_entity (entity_type, entity_id),
    INDEX idx_snapshots_date (snapshot_date)
);
```

#### Tabla `snapshot_changes`
```sql
CREATE TABLE snapshot_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(20) DEFAULT 'modified' CHECK (change_type IN ('added', 'modified', 'deleted')),

    -- Índices
    INDEX idx_snapshot_changes_snapshot (snapshot_id),
    INDEX idx_snapshot_changes_field (field_name)
);
```

### 2. Lógica de Negocio

#### Creación de Snapshots
- **Automática**: Se crea snapshot cada vez que se guarda un concepto/relación
- **Manual**: Usuario puede crear snapshot en fecha específica
- **Condicional**: Solo si hay cambios reales en campos relevantes

#### Recuperación de Estado Histórico
```javascript
function getEntityStateAtDate(entityId, entityType, targetDate) {
    // Buscar snapshot más reciente anterior o igual a targetDate
    const snapshot = snapshots
        .filter(s => s.entity_id === entityId && s.entity_type === entityType)
        .filter(s => s.snapshot_date <= targetDate)
        .sort((a, b) => b.snapshot_date - a.snapshot_date)[0];

    return snapshot ? snapshot.snapshot_data : null;
}
```

#### Interpolación Temporal
- Si no hay snapshot exacto, usar el más reciente anterior
- Para campos numéricos (relevance), podría interpolación lineal entre snapshots
- Labels y texto: usar valor del snapshot más reciente

### 3. Interfaz de Usuario

#### Timeline Mejorada
- **Marcadores de snapshots**: Puntos en la línea temporal indicando cambios importantes
- **Tooltips informativos**: Mostrar qué cambió en cada snapshot
- **Navegación directa**: Clic en marcador salta a esa fecha

#### Modal de Historial
```html
<div class="snapshot-history-modal">
    <h3>Historial de Cambios - [Nombre del Concepto]</h3>
    <div class="timeline">
        <div class="snapshot-item" data-date="1990">
            <div class="snapshot-date">1990</div>
            <div class="snapshot-changes">
                <span class="change-field">prefLabel:</span>
                "Inteligencia Artificial" → "IA"
            </div>
        </div>
        <!-- Más snapshots... -->
    </div>
</div>
```

#### Formulario Temporal
- **Modo histórico**: Al pausar timeline, formulario muestra datos del snapshot correspondiente
- **Indicador visual**: Banner "Vista histórica: [año]" cuando se muestra estado pasado
- **Edición bloqueada**: No se puede editar en modo histórico (solo visualización)

### 4. Integración con Sistema Temporal Existente

#### Modificaciones al Slider Temporal
```javascript
// En handleTimelineChange
function handleTimelineChange(event) {
    const year = parseInt(event.target.value);
    updateYearDisplay(year);

    // Nuevo: actualizar formularios con estado histórico
    updateFormsWithHistoricalState(year);

    updateGraphByYear(year, false);
}
```

#### Estados del Sistema
- **Modo Actual**: Edición normal, snapshots automáticos
- **Modo Histórico**: Solo lectura, formularios poblados con datos pasados
- **Modo Comparación**: Vista dividida actual vs histórica

## 🔄 Flujo de Trabajo Detallado

### 1. Creación de Snapshot
1. Usuario edita concepto/relación
2. Al guardar, sistema compara con estado anterior
3. Si hay cambios, crea nuevo snapshot con timestamp actual
4. Registra cambios específicos en `snapshot_changes`

### 2. Navegación Temporal
1. Usuario arrastra slider o hace clic en marcador
2. Sistema busca snapshots relevantes para la fecha
3. Formularios se actualizan con datos históricos
4. Grafo refleja estado temporal (conceptos/relaciones visibles)

### 3. Visualización Histórica
1. Al pausar animación, mostrar estado completo del formulario
2. Campos poblados con valores del snapshot correspondiente
3. Indicadores visuales muestran que es vista histórica

## 📊 Consultas de Ejemplo

### Obtener estado de concepto en fecha específica
```sql
SELECT snapshot_data
FROM snapshots
WHERE entity_type = 'concept'
  AND entity_id = $1
  AND snapshot_date <= $2
ORDER BY snapshot_date DESC
LIMIT 1;
```

### Historial de cambios de un campo
```sql
SELECT sc.field_name, sc.old_value, sc.new_value, s.snapshot_date
FROM snapshot_changes sc
JOIN snapshots s ON sc.snapshot_id = s.id
WHERE s.entity_id = $1
  AND sc.field_name = $2
ORDER BY s.snapshot_date;
```

### Snapshots entre fechas
```sql
SELECT * FROM snapshots
WHERE entity_id = $1
  AND snapshot_date BETWEEN $2 AND $3
ORDER BY snapshot_date;
```

## ⚡ Consideraciones de Performance

### Optimización de Consultas
- Índices compuestos en `(entity_type, entity_id, snapshot_date)`
- Particionamiento por `thesaurus_id` si volumen es alto
- Cache de snapshots frecuentes en memoria del navegador

### Estrategia de Almacenamiento
- **JSONB** para flexibilidad en campos que evolucionan
- Compresión automática para snapshots grandes
- Limpieza periódica de snapshots antiguos (configurable)

## 🧪 Estrategia de Testing

### Casos de Prueba
1. **Creación de snapshots**: Verificar que se crean correctamente al editar
2. **Recuperación histórica**: Comprobar que formularios muestran estado correcto
3. **Navegación temporal**: Slider debe actualizar formularios en tiempo real
4. **Integridad de datos**: Snapshots deben ser consistentes con estado actual

### Testing Manual
- Crear concepto, editar múltiples veces, verificar historial
- Navegar timeline, comprobar que formularios cambian correctamente
- Verificar que grafo refleja estado temporal correcto

## 🚀 Plan de Implementación

### Fase 1: Backend (Base de Datos)
- [ ] Crear tablas `snapshots` y `snapshot_changes`
- [ ] Añadir índices y constraints
- [ ] Crear funciones helper para queries comunes

### Fase 2: Lógica de Snapshots
- [ ] Implementar creación automática de snapshots
- [ ] Función de recuperación de estado histórico
- [ ] Sistema de comparación de cambios

### Fase 3: Interfaz de Usuario
- [ ] Modificar timeline para mostrar marcadores
- [ ] Actualizar formularios para modo histórico
- [ ] Añadir modal de historial de cambios

### Fase 4: Integración y Testing
- [ ] Integrar con sistema temporal existente
- [ ] Testing exhaustivo de funcionalidad
- [ ] Optimización de performance

## 🔮 Mejoras Futuras

1. **Compresión de snapshots**: Almacenar solo diferencias entre snapshots consecutivos
2. **Versionado semántico**: Snapshots marcados como versiones importantes
3. **Colaboración temporal**: Ver quién hizo qué cambio cuándo
4. **Exportación histórica**: PDF con estado del tesauro en fecha específica
5. **Análisis de evolución**: Gráficos mostrando cómo cambiaron campos con el tiempo

---

**¿Listo para proceder con la implementación?** Este diseño proporciona una base sólida para el sistema de snapshots temporales.
### 5. Interfaz de Usuario - Diseño Detallado

#### Timeline con Marcadores de Snapshots
```html
<div class="timeline-container">
    <div class="timeline-header">
        <div class="timeline-title">Línea Temporal Interactiva</div>
        <div class="timeline-controls">
            <button id="play-btn" class="timeline-btn">▶ Play</button>
            <button id="pause-btn" class="timeline-btn hidden">⏸ Pause</button>
            <button id="reset-btn" class="timeline-btn">↻ Reset</button>
            <button id="config-btn" class="timeline-btn">⚙️ Config</button>
        </div>
    </div>

    <div class="timeline-slider-container">
        <input type="range" id="timeline-slider" min="1950" max="2030" value="2030" step="1">
        <div class="timeline-markers" id="timeline-markers">
            <!-- Marcadores dinámicos de snapshots -->
        </div>
        <div class="timeline-labels" id="timeline-labels">
            <span>1950</span>
            <span>1980</span>
            <span>2010</span>
            <span>2030</span>
        </div>
    </div>

    <div class="timeline-info">
        <div class="current-year-display" id="current-year-display">2030</div>
        <div class="snapshot-indicator" id="snapshot-indicator">
            <!-- Muestra si hay snapshot en año actual -->
        </div>
    </div>
</div>
```

#### Modal de Historial de Cambios
```html
<div id="snapshot-history-modal" class="modal hidden">
    <div class="modal-content snapshot-history-content">
        <div class="modal-header">
            <h3 id="snapshot-history-title">Historial de Cambios</h3>
            <button class="modal-close-btn" id="snapshot-history-close-btn">×</button>
        </div>

        <div class="modal-body">
            <div class="history-filters">
                <select id="history-entity-filter">
                    <option value="all">Todos los campos</option>
                    <option value="labels">Etiquetas</option>
                    <option value="definition">Definición</option>
                    <option value="temporal">Campos temporales</option>
                    <option value="notes">Notas</option>
                </select>
                <input type="date" id="history-date-filter" placeholder="Filtrar por fecha">
            </div>

            <div class="history-timeline" id="history-timeline">
                <!-- Timeline vertical de cambios -->
            </div>
        </div>
    </div>
</div>
```

#### Indicadores Visuales en Formularios
```html
<div class="form-container">
    <div class="historical-view-banner hidden" id="historical-view-banner">
        <span class="banner-icon">🕰️</span>
        <span class="banner-text">Vista histórica: <strong id="historical-year">1990</strong></span>
        <button class="banner-close" id="exit-historical-view">×</button>
    </div>

    <form id="concept-form">
        <!-- Campos existentes con indicadores de cambios -->
        <div class="form-field">
            <label for="pref-label">Etiqueta Preferida</label>
            <input type="text" id="pref-label" class="form-input">
            <div class="field-history-indicator" data-field="prefLabel">
                <span class="history-dot" title="Este campo cambió en 1990, 2005, 2018"></span>
            </div>
        </div>

        <div class="form-field">
            <label for="temporal-relevance">Relevancia Temporal (0.0 - 1.0)</label>
            <input type="number" id="temporal-relevance" class="form-input" min="0" max="1" step="0.1">
            <div class="field-history-indicator" data-field="temporal_relevance">
                <span class="history-chart" title="Ver evolución histórica"></span>
            </div>
        </div>
    </form>
</div>
```

#### Tooltip de Cambios Rápidos
```html
<div class="field-tooltip hidden" id="field-tooltip">
    <div class="tooltip-header">
        <strong>Historial: Etiqueta Preferida</strong>
    </div>
    <div class="tooltip-content">
        <div class="change-entry">
            <span class="change-date">2018</span>
            <span class="change-arrow">→</span>
            <span class="change-value">"Inteligencia Artificial"</span>
        </div>
        <div class="change-entry">
            <span class="change-date">2005</span>
            <span class="change-arrow">→</span>
            <span class="change-value">"IA"</span>
        </div>
        <div class="change-entry">
            <span class="change-date">1990</span>
            <span class="change-arrow">→</span>
            <span class="change-value">"Computación Inteligente"</span>
        </div>
    </div>
</div>
```

### 6. Comportamiento de la Interfaz

#### Navegación Temporal Interactiva
1. **Arrastre del slider**: Actualización en tiempo real de formularios y grafo
2. **Clic en marcadores**: Salto directo a fechas de snapshots importantes
3. **Doble clic en marcador**: Abrir modal detallado del snapshot

#### Estados del Formulario
- **Modo Actual**: Campos editables, guardado normal
- **Modo Histórico**: Campos de solo lectura, banner informativo
- **Modo Comparación**: Vista dividida actual vs histórica

#### Feedback Visual
- **Dots en campos**: Indican cambios históricos (colores por frecuencia)
- **Charts en campos numéricos**: Mini-gráficos de evolución
- **Banners informativos**: Claros indicadores de modo histórico

### 7. Experiencia de Usuario

#### Flujo Principal
1. Usuario edita concepto normalmente
2. Sistema crea snapshot automáticamente
3. Al navegar timeline, formularios se actualizan automáticamente
4. Clic en indicadores muestra historial detallado
5. Doble clic en marcadores permite "viajar en el tiempo"

#### Accesos Rápidos
- **Ctrl+H**: Mostrar/ocultar historial del campo actual
- **Ctrl+T**: Toggle modo histórico/actual
- **Flechas**: Navegación entre snapshots del concepto actual

---

**Diseño de UI completado. ¿Procedemos con la implementación?**