# 📝 CHANGELOG - Cronaurus

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
