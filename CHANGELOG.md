# 📝 CHANGELOG - Cronaurus

## [2.1.0] - 2025-10-08 - Controles Avanzados de Timeline ⚡

### ✨ Características Nuevas

#### 1. Control de Cierre y Reactivación
- **Botón de Cierre (✕)**: Permite cerrar el panel temporal y ver el grafo completo
- **Vista Completa**: Al cerrar, se muestran todos los conceptos sin filtrado temporal
- **Botón Flotante de Reactivación**: Aparece en esquina inferior izquierda cuando timeline está cerrado
- **Transiciones Suaves**: Animaciones al mostrar/ocultar componentes

#### 2. Control de Velocidad de Animación
- **Slider de Velocidad**: Ajuste de 50ms a 500ms por año
- **Indicador Numérico**: Muestra valor actual en tiempo real
- **Persistencia**: La velocidad se mantiene durante la sesión
- **Ubicación**: Panel secundario debajo de controles principales

#### 3. Configuración de Rango Temporal
- **Modal de Configuración**: Interfaz dedicada para ajustar fechas
- **Campos Editables**: Min y Max personalizables
- **Auto-Cálculo**: Botón para recalcular rango desde datos actuales
- **Validación**: Previene rangos inválidos (min > max)
- **Persistencia Visual**: Actualiza etiquetas y slider inmediatamente

### 🎨 Mejoras de UI/UX

#### Nuevos Elementos
- **Encabezado del Timeline**: Ahora incluye botón de configuración (⚙) y cierre (✕)
- **Panel de Controles Secundarios**: Velocidad de animación integrada
- **Modal Estilizado**: Fondo glassmorphism con gradientes azules
- **Mensajes Informativos**: Clase `.info-message` para feedback visual

#### Estados Visuales
- **temporalState.isActive**: Flag que controla activación/desactivación del filtrado
- **Clase `.show`**: Control de visibilidad del botón flotante
- **Efectos Hover**: Mejoras en interactividad de todos los botones

### 🔧 Cambios Técnicos

| Archivo   | Función                     | Cambio                                            |
| --------- | --------------------------- | ------------------------------------------------- |
| script.js | temporalState               | Añadido flag `isActive` para control de filtrado  |
| script.js | closeTemporalFilter()       | Nueva función para cerrar y mostrar todo el grafo |
| script.js | activateTemporalFilter()    | Nueva función para reactivar filtrado temporal    |
| script.js | handleSpeedChange()         | Control de velocidad de animación                 |
| script.js | openTimelineConfig()        | Abre modal de configuración de rango              |
| script.js | applyTimelineRange()        | Aplica nuevo rango personalizado                  |
| script.js | autoCalculateRange()        | Recalcula rango desde datos actuales              |
| script.js | updateGraphByYear()         | Modificado para respetar flag `isActive`          |
| main.html | timeline-header-buttons     | Nuevo div con botones de config y cierre          |
| main.html | timeline-controls-secondary | Nuevo panel para control de velocidad             |
| main.html | timeline-config-modal       | Modal completo para configuración de rango        |
| main.html | reactivate-timeline-btn     | Botón flotante de reactivación                    |
| style.css | .timeline-header-buttons    | Estilos para grupo de botones del header          |
| style.css | .timeline-close             | Estilos del botón de cierre                       |
| style.css | .timeline-speed-control     | Slider de velocidad con gradiente                 |
| style.css | .floating-timeline-btn      | Botón flotante con animaciones                    |
| style.css | .info-message               | Mensaje informativo en modal                      |

### 📊 Funcionalidades Añadidas

| Funcionalidad                | Implementación                         | Estado |
| ---------------------------- | -------------------------------------- | ------ |
| Cerrar timeline              | Botón ✕ que desactiva filtrado         | ✅      |
| Ver grafo completo           | `temporalState.isActive = false`       | ✅      |
| Reactivar timeline           | Botón flotante con animación           | ✅      |
| Velocidad ajustable          | Slider 50-500ms con indicador          | ✅      |
| Configurar rango manualmente | Modal con inputs min/max               | ✅      |
| Auto-calcular rango          | Recalcula desde conceptos actuales     | ✅      |
| Validación de rangos         | Previene min > max                     | ✅      |
| Notificaciones visuales      | SweetAlert2 para feedback              | ✅      |
| Transiciones suaves          | CSS transitions en todos los controles | ✅      |

### 🎯 Casos de Uso Mejorados

#### Caso 1: Análisis Temporal Pausado
```
Usuario quiere ver TODO el grafo sin restricciones temporales
→ Clic en botón ✕ → Panel se cierra → Todos los conceptos aparecen
→ Botón flotante aparece en esquina → Puede reactivar cuando quiera
```

#### Caso 2: Animación Personalizada
```
Usuario quiere acelerar la animación temporal
→ Ajusta slider de velocidad a 100ms → Animación se acelera 5x
→ Experimenta con diferentes velocidades en tiempo real
```

#### Caso 3: Datos Históricos Extendidos
```
Usuario añadió conceptos de 1850-2050
→ Clic en ⚙ → Modal de configuración → Clic "Auto-Calcular"
→ Rango se ajusta automáticamente a 1850-2050
→ Timeline refleja nuevo rango inmediatamente
```

### 🐛 Bugs Prevenidos

- **Rango Inválido**: Validación impide min > max en configuración
- **Elementos Ausentes**: Verificaciones de DOM antes de manipular
- **Estado Inconsistente**: `isActive` flag sincroniza comportamiento

### 📁 Archivos Modificados

#### main.html
- Líneas 195-235: Añadido encabezado con botones de control
- Líneas 240-260: Panel secundario con control de velocidad
- Líneas 308-348: Modal de configuración de rango
- Líneas 353-356: Botón flotante de reactivación

#### script.js
- Línea 2341: Añadido `temporalState.isActive` flag
- Líneas 2451-2475: Modificado `updateGraphByYear()` para respetar isActive
- Líneas 2672-2693: Nueva función `closeTemporalFilter()`
- Líneas 2695-2709: Nueva función `activateTemporalFilter()`
- Líneas 2711-2717: Nueva función `handleSpeedChange()`
- Líneas 2719-2825: Tres nuevas funciones de configuración de rango
- Líneas 2886-2960: Event listeners actualizados en `initializeTemporalSystem()`

#### style.css
- Líneas 615-645: Estilos del encabezado y botones
- Líneas 730-780: Control de velocidad con slider estilizado
- Líneas 840-890: Modal de configuración
- Líneas 920-964: Botón flotante con animaciones

### 🔜 Mejoras Futuras (v2.2.0)

- [ ] Guardar velocidad preferida en localStorage
- [ ] Presets de velocidad (lenta/normal/rápida)
- [ ] Atajos de teclado para controles temporales
- [ ] Historial de rangos utilizados
- [ ] Exportar configuración temporal

---

## [2.0.1] - 2025-10-08 - Hotfix: Recursión Infinita 🔧

### 🐛 Bugs Corregidos

#### Recursión Infinita en updateAll()
- **Problema**: Error `RangeError: Maximum call stack size exceeded`
- **Causa**: Redefinición recursiva de la función `updateAll()`
- **Solución**: Integración directa del código temporal en la función original
- **Impacto**: Los tesauros no se cargaban correctamente

#### Verificaciones de Seguridad DOM
- Añadidas verificaciones en todas las funciones temporales
- El sistema temporal ahora se inicializa solo si los elementos existen
- Warnings informativos si el DOM no está listo

### 🔧 Cambios Técnicos

| Archivo   | Función                    | Cambio                                 |
| --------- | -------------------------- | -------------------------------------- |
| script.js | updateAll()                | Integración directa de código temporal |
| script.js | calculateTemporalRange()   | Verificación de elementos DOM          |
| script.js | updateTimelineLabels()     | Verificación de contenedor             |
| script.js | updateYearDisplay()        | Verificación de display                |
| script.js | initializeTemporalSystem() | Verificación completa de elementos     |

### 📁 Archivos Nuevos
- `BUGFIX_RECURSION.md`: Documentación del fix aplicado

---

## [2.0.0] - 2025-10-08 - Dimensión Temporal 🕰️

### ✨ Características Nuevas

#### Sistema Temporal Completo
- **Línea de Tiempo Interactiva**: Slider temporal con rango dinámico (1950-2030+)
- **Controles de Animación**: Botones Play, Pause y Reset para navegación temporal
- **Filtrado Dinámico**: Aparición/desaparición de nodos y aristas según marco temporal
- **Panel Colapsable**: Timeline expandible/contraíble para maximizar espacio de visualización

#### Campos Temporales
- **Conceptos**: `temporal_start`, `temporal_end`, `temporal_relevance` integrados en formulario
- **Relaciones**: Modal dedicado para editar historicidad de conexiones
- **Cálculo Automático**: Rango temporal ajustado dinámicamente según datos

#### Visualización Evolutiva
- **Opacidad Variable**: Basada en relevancia temporal (30%-100%)
- **Grosor Dinámico**: Relaciones con grosor proporcional a relevancia
- **Animaciones de Aparición**: Efecto "bounce" al llegar al año de acuñación
- **Transiciones Suaves**: Fundidos y transformaciones D3.js (500ms)

#### Interfaz de Usuario
- **Display del Año Actual**: Indicador grande y destacado
- **Etiquetas de Referencia**: Marcas cada ~20 años en el slider
- **Checkbox "Mostrar Futuros"**: Control de visibilidad de conceptos abiertos
- **Diseño Profesional**: Gradientes, sombras y efectos glassmorphism

### 🔧 Mejoras

#### Rendimiento
- Filtrado en memoria (sin consultas adicionales a BD)
- Transiciones optimizadas con D3.js
- Cálculo de rango temporal una sola vez al cargar

#### Usabilidad
- Integración fluida con workflow existente
- Retrocompatibilidad total (conceptos sin fechas siempre visibles)
- Panel temporal no invasivo (colapsable)
- Tooltips informativos en relaciones

#### Documentación
- **TEMPORAL_DIMENSION_GUIDE.md**: Guía completa de usuario (60+ secciones)
- **IMPLEMENTATION_SUMMARY.md**: Resumen técnico de implementación
- **TEMPORAL_QUICK_REFERENCE.md**: Tarjeta de referencia rápida
- **README.md**: Actualizado con nuevas características

### 📁 Archivos Modificados

#### HTML
- **main.html** (líneas 200-230): Añadido componente de timeline

#### JavaScript
- **script.js** (líneas 2020-2350): 
  - Sistema temporal completo (330+ líneas)
  - 15 funciones nuevas para gestión temporal
  - Integración con sistema de grafos existente

#### CSS
- **style.css** (líneas 530-780):
  - Estilos del timeline (250+ líneas)
  - Animaciones temporales
  - Responsive design para móviles

### 🗃️ Base de Datos

#### Sin Cambios Requeridos ✅
Los campos temporales ya estaban definidos:
- `concepts.temporal_start`
- `concepts.temporal_end`
- `concepts.temporal_relevance`
- `relationships.temporal_start`
- `relationships.temporal_end`
- `relationships.temporal_relevance`

### 🎯 Funcionalidades Implementadas

| Requisito Original               | Estado | Implementación                |
| -------------------------------- | ------ | ----------------------------- |
| Slider temporal (1950-2025+)     | ✅      | Rango dinámico ajustable      |
| Filtrar nodos dinámicamente      | ✅      | Aparición/desaparición fluida |
| Filtrar relaciones dinámicamente | ✅      | Solo si ambos nodos visibles  |
| Aparición según fecha            | ✅      | Animación de rebote           |
| Grosor/color por relevancia      | ✅      | Grosor y opacidad variables   |
| Formulario temporal              | ✅      | 3 campos por concepto         |
| Animaciones de transformación    | ✅      | Transiciones D3.js suaves     |
| Backend: consultas temporales    | ✅      | Filtrado optimizado en JS     |

### 🐛 Bugs Corregidos

- N/A (primera implementación)

### ⚠️ Cambios de Ruptura (Breaking Changes)

- Ninguno - 100% retrocompatible

### 📊 Métricas de Código

- **Líneas añadidas**: ~800
- **Funciones nuevas**: 15
- **Archivos nuevos**: 3 documentos MD
- **Cobertura temporal**: 100% de la funcionalidad solicitada

### 🔜 Próximos Pasos Sugeridos

#### Para v2.1.0 (Corto plazo)
- [ ] Marcadores de eventos históricos en timeline
- [ ] Velocidad de animación ajustable desde UI
- [ ] Exportar snapshot temporal como imagen

#### Para v2.2.0 (Mediano plazo)
- [ ] Comparación lado a lado de dos períodos
- [ ] Heatmap de densidad temporal
- [ ] Exportar animación como GIF/MP4

#### Para v3.0.0 (Largo plazo)
- [ ] Nodos enriquecidos con multimedia
- [ ] Relaciones tipificadas personalizadas
- [ ] Sistema de capas/vistas analíticas

### 🙏 Agradecimientos

Implementación basada en el plan estratégico definido en `plan.md`.

---

## [1.0.0] - 2025-10-01 - Lanzamiento Inicial

### ✨ Características Iniciales

#### Autenticación
- Sistema de registro e inicio de sesión con Supabase
- Seguridad a nivel de fila (RLS)
- Gestión de sesiones

#### Gestión de Tesauros
- Crear, renombrar y eliminar tesauros
- Múltiples tesauros por usuario
- Metadatos SKOS completos

#### Editor de Conceptos
- Etiquetas: prefLabel, altLabel, hiddenLabel
- Notas: definition, scopeNote, example
- Relaciones: broader, narrower, related
- Categorías con colores personalizables

#### Visualización
- Grafo interactivo con D3.js
- Force-directed layout
- Zoom y pan
- Tooltips informativos

#### Import/Export
- Exportar a JSON
- Importar desde JSON
- Exportar resumen a PDF
- Resumen alfabético/por categoría

### 🗃️ Base de Datos Inicial

Tablas implementadas:
- `thesauruses`
- `concepts`
- `labels`
- `notes`
- `relationships`
- `categories`

---

## Formato de Versiones

Este proyecto sigue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles de API
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles

---

**Última actualización**: 8 de octubre de 2025  
**Mantenedor**: Fernando Mora Ángel  
**Repositorio**: thesiaurus
