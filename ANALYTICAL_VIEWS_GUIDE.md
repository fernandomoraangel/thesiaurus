# 👓 Sistema de Vistas Analíticas - Guía de Implementación

## 📋 Resumen

El Sistema de Vistas Analíticas permite a los usuarios analizar su tesauro desde múltiples perspectivas mediante filtros especializados. Los usuarios pueden activar varias vistas simultáneamente, crear vistas personalizadas y gestionar sus configuraciones.

## 🎯 Características Implementadas

### 1. Vistas Predefinidas

El sistema incluye 5 vistas analíticas predefinidas que se crean automáticamente para cada tesauro:

#### Vista Tecnológica 💻
- **Color**: Azul (#3498db)
- **Descripción**: Solo conceptos y relaciones ligados a hitos tecnológicos
- **Filtros**: Palabras clave: tecnología, digital, software, hardware, internet, web

#### Vista Teórico-Crítica 📚
- **Color**: Morado (#9b59b6)
- **Descripción**: Enfoque en teóricos, conceptos y debates
- **Filtros**: Palabras clave: teoría, crítica, filosofía, pensamiento, autor

#### Vista Estética 🎨
- **Color**: Rojo (#e74c3c)
- **Descripción**: Movimientos artísticos, obras y características formales
- **Filtros**: Palabras clave: arte, estética, diseño, visual, movimiento, obra

#### Vista Temporal ⏱️
- **Color**: Naranja (#f39c12)
- **Descripción**: Enfoque en evolución histórica de conceptos
- **Filtros**: Rango temporal desde 1950 hasta el año actual

#### Vista Relacional 🔗
- **Color**: Verde (#1abc9c)
- **Descripción**: Análisis de densidad de conexiones
- **Filtros**: Mínimo 3 conexiones por concepto

### 2. Vistas Personalizadas

Los usuarios pueden crear sus propias vistas con los siguientes filtros:

#### Información Básica
- Nombre de la vista
- Descripción
- Color identificador

#### Filtros Disponibles

**Por Categorías**
- Selección múltiple de categorías
- Opción de incluir todas las categorías

**Por Rango Temporal**
- Año de inicio
- Año de fin
- Mostrar solo conceptos dentro del rango

**Por Conexiones**
- Número mínimo de conexiones
- Número máximo de conexiones (opcional)

**Por Tipo de Relación**
- Relaciones jerárquicas (broader/narrower)
- Relaciones asociativas (related)

## 🗄️ Estructura de Base de Datos

### Tabla: `analytical_views`

```sql
CREATE TABLE public.analytical_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thesaurus_id uuid NOT NULL REFERENCES public.thesauruses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  filters jsonb DEFAULT '{}'::jsonb,
  color text DEFAULT '#2c5282',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Tabla: `active_analytical_views`

```sql
CREATE TABLE public.active_analytical_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thesaurus_id uuid NOT NULL REFERENCES public.thesauruses(id) ON DELETE CASCADE,
  view_id uuid NOT NULL REFERENCES public.analytical_views(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);
```

## 🎨 Interfaz de Usuario

### Panel de Vistas Analíticas

Ubicado en el panel de control izquierdo, contiene:

1. **Vistas Activas**: Muestra las vistas actualmente aplicadas
2. **Vistas Disponibles**: Lista de todas las vistas que se pueden activar
3. **Botones de Acción**:
   - ➕ Nueva Vista: Crear vista personalizada
   - ⚙️ Gestionar: Administrar vistas existentes
4. **Estadísticas**: Contador de conceptos visibles vs totales

### Modales

#### Modal de Crear/Editar Vista
- Formulario completo con todos los filtros disponibles
- Vista previa del color seleccionado
- Validación de campos requeridos

#### Modal de Gestión
- Lista de todas las vistas (predefinidas y personalizadas)
- Opciones de edición y eliminación (solo para vistas personalizadas)
- Indicadores visuales para vistas predefinidas

## 🔧 Funcionalidad JavaScript

### Funciones Principales

```javascript
// Inicialización
initializeAnalyticalViews()

// Gestión de vistas
fetchAnalyticalViews()
fetchActiveViews()
createDefaultViewsIfNeeded()

// Renderizado
renderAnalyticalViews()
renderActiveViews()
renderAvailableViews()

// Activación/Desactivación
activateView(viewId)
deactivateView(viewId)

// Filtrado
applyAnalyticalFilters()
matchesViewFilters(concept, filters)

// CRUD
saveAnalyticalView(e)
editView(viewId)
deleteView(viewId)

// Estadísticas
updateViewStats()
```

### Lógica de Filtrado

El sistema evalúa cada concepto contra los filtros de todas las vistas activas. Un concepto es visible si cumple con AL MENOS UNA de las vistas activas.

```javascript
function matchesViewFilters(concept, filters) {
  // Verifica:
  // 1. Palabras clave en etiquetas y notas
  // 2. Categoría del concepto
  // 3. Rango temporal
  // 4. Número de conexiones
  return boolean;
}
```

## 🎯 Efectos Visuales

### Nodos
- **Filtrados**: Opacidad reducida (0.3), sin interacción
- **Visibles**: Opacidad normal, efecto de resaltado
- **Animaciones**: Fade in/out al cambiar vistas

### Enlaces
- **Filtrados**: Opacidad muy baja (0.15), sin interacción
- **Visibles**: Solo si ambos nodos conectados están visibles

### Estilos CSS

```css
.node.view-filtered {
  opacity: 0.3;
  pointer-events: none;
}

.node.view-highlighted .node-shape {
  filter: drop-shadow(0 0 6px currentColor);
  stroke-width: 3px;
}
```

## 📊 Formato JSON de Filtros

Ejemplo de estructura de filtros en la base de datos:

```json
{
  "keywords": ["tecnología", "digital", "software"],
  "categories": ["uuid-cat-1", "uuid-cat-2"],
  "use_temporal": true,
  "temporal_range": [1990, 2020],
  "min_connections": 3,
  "max_connections": 10,
  "show_broader": true,
  "show_related": true
}
```

## 🚀 Uso

### Para Usuarios

1. **Activar una vista predefinida**:
   - Ir a "Vistas Analíticas" en el panel de control
   - Hacer clic en el botón "+" de la vista deseada
   - El grafo se actualizará automáticamente

2. **Crear vista personalizada**:
   - Clic en "➕ Nueva Vista"
   - Configurar nombre, descripción y color
   - Seleccionar filtros deseados
   - Guardar

3. **Combinar vistas**:
   - Activar múltiples vistas simultáneamente
   - El sistema mostrará conceptos que cumplan con CUALQUIERA de las vistas

4. **Gestionar vistas**:
   - Clic en "⚙️ Gestionar"
   - Editar o eliminar vistas personalizadas
   - Las vistas predefinidas no se pueden eliminar

### Para Administradores

1. **Ejecutar migración SQL**:
   ```bash
   # En Supabase SQL Editor
   # Ejecutar el contenido de add_analytical_views.sql
   ```

2. **Verificar permisos RLS**:
   - Las políticas están configuradas para que cada usuario solo vea sus propias vistas
   - Las vistas activas son específicas por usuario y tesauro

## 🔒 Seguridad

- **Row Level Security (RLS)** habilitado en ambas tablas
- Los usuarios solo pueden ver y modificar sus propias vistas
- Las vistas predefinidas no pueden ser eliminadas (protección en política DELETE)
- Validación de pertenencia al tesauro en todas las operaciones

## 🎨 Personalización

### Agregar nuevas vistas predefinidas

Modificar el array `defaultViews` en `script.js`:

```javascript
const defaultViews = [
  {
    name: "Mi Nueva Vista",
    description: "Descripción de la vista",
    color: "#hexcolor",
    filters: {
      keywords: ["palabra1", "palabra2"],
      // otros filtros...
    },
  },
  // ...
];
```

### Crear nuevos tipos de filtros

1. Agregar campos al formulario en `main.html`
2. Actualizar `saveAnalyticalView()` para capturar los nuevos valores
3. Modificar `matchesViewFilters()` para evaluar los nuevos criterios

## 📝 Notas de Implementación

- Las vistas se cargan automáticamente al seleccionar un tesauro
- La configuración de vistas activas se persiste en la base de datos
- El sistema es compatible con el filtro temporal existente
- Los cambios en vistas se reflejan inmediatamente en el grafo
- Las animaciones mejoran la experiencia visual al cambiar vistas

## 🐛 Troubleshooting

### Las vistas no se muestran
- Verificar que las tablas existan en Supabase
- Comprobar políticas RLS
- Revisar consola del navegador para errores

### Los filtros no funcionan
- Verificar que el formato JSON en la base de datos sea correcto
- Asegurar que los datos de los conceptos tengan la información necesaria
- Revisar la función `matchesViewFilters()` para debugging

### Errores de permisos
- Verificar que el usuario esté autenticado
- Comprobar que las políticas RLS estén correctamente configuradas
- Verificar que `user_id` coincida con el usuario actual

## 📚 Referencias

- [Documentación D3.js](https://d3js.org/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)

---

**Desarrollado para Cronaurus - Editor de Tesauros** 
Fecha: Octubre 2025
