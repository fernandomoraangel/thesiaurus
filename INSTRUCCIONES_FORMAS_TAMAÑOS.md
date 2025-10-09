# Implementación de Formas y Tamaños para Nodos

## 📋 Resumen
Se ha implementado la funcionalidad para seleccionar formas y tamaños personalizados para cada nodo del tesauro. Esta funcionalidad incluye:

- **5 formas diferentes**: Círculo, Cuadrado, Triángulo, Rombo y Estrella
- **Tamaño ajustable**: De 0 a 1 (0% a 100%)
- **Persistencia en base de datos**: Todos los cambios se guardan automáticamente
- **Menú contextual organizado**: Separado en secciones (Categorías, Forma, Tamaño)

## 🚀 Pasos para Activar la Funcionalidad

### 1. Ejecutar la Migración de Base de Datos

Debes ejecutar el siguiente script SQL en el **SQL Editor de Supabase**:

1. Ve a tu proyecto en Supabase
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `add_shape_size_fields.sql`
4. Ejecuta el script

```sql
-- Agregar columna shape (forma) con valor por defecto 'circle'
ALTER TABLE concepts
ADD COLUMN IF NOT EXISTS shape TEXT DEFAULT 'circle';

-- Agregar columna size (tamaño) con valor por defecto 0.5
ALTER TABLE concepts
ADD COLUMN IF NOT EXISTS size REAL DEFAULT 0.5;

-- Actualizar nodos existentes que puedan tener valores NULL
UPDATE concepts
SET shape = 'circle'
WHERE shape IS NULL;

UPDATE concepts
SET size = 0.5
WHERE size IS NULL;

-- Comentarios para documentación
COMMENT ON COLUMN concepts.shape IS 'Forma del nodo: circle, square, triangle, diamond, star';
COMMENT ON COLUMN concepts.size IS 'Tamaño del nodo (0.0 a 1.0)';
```

### 2. Verificar la Implementación

Una vez ejecutada la migración:

1. Recarga la aplicación en tu navegador
2. Haz **clic derecho** sobre cualquier nodo
3. Verás el nuevo menú contextual con 3 secciones:
   - **Categorías**: Para asignar categorías al nodo
   - **Forma del Nodo**: Para seleccionar entre círculo, cuadrado, triángulo, rombo o estrella
   - **Tamaño del Nodo**: Un slider para ajustar el tamaño de 0% a 100%

## 🎨 Cómo Usar

### Cambiar la Forma de un Nodo
1. Haz clic derecho sobre el nodo
2. En la sección "Forma del Nodo", selecciona una de las opciones:
   - ● Círculo
   - ■ Cuadrado
   - ▲ Triángulo
   - ◆ Rombo
   - ★ Estrella
3. La forma seleccionada se marca en azul
4. Los cambios se guardan automáticamente

### Ajustar el Tamaño de un Nodo
1. Haz clic derecho sobre el nodo
2. En la sección "Tamaño del Nodo", mueve el slider
3. El porcentaje se muestra en tiempo real
4. Al soltar el slider, el cambio se guarda automáticamente

## 🔍 Detalles Técnicos

### Archivos Modificados
- `script.js`: 
  - Función `showContextMenu()` - Nuevo menú con secciones
  - Funciones `updateNodeShape()` y `updateNodeSize()` - Actualización en BD
  - Función `updateGraph()` - Renderizado de diferentes formas
  - Función `fetchAllConceptData()` - Consulta de shape y size
  
- `style.css`:
  - Estilos para `.menu-section`, `.menu-section-title`
  - Estilos para `.menu-item.selected`
  - Estilos para controles de tamaño y slider

- `add_shape_size_fields.sql`: Script de migración para la base de datos

### Estructura de Datos
```javascript
// En la tabla concepts de Supabase:
{
  id: "uuid",
  shape: "circle" | "square" | "triangle" | "diamond" | "star",
  size: 0.0 - 1.0,  // Donde 0.5 es el tamaño por defecto
  // ... otros campos
}
```

### Valores por Defecto
- **Forma**: `circle` (círculo)
- **Tamaño**: `0.5` (50%, tamaño medio)

## ✨ Características

- ✅ **Persistencia**: Todos los cambios se guardan en Supabase
- ✅ **Feedback visual**: Notificaciones toast al guardar
- ✅ **Selección actual**: La forma actual se resalta en azul
- ✅ **Responsive**: El slider muestra el valor en tiempo real
- ✅ **Compatibilidad**: Funciona con todas las características existentes (categorías, línea temporal, etc.)

## 🐛 Solución de Problemas

### Los campos no aparecen en la base de datos
- Asegúrate de haber ejecutado el script SQL completo en Supabase
- Verifica que tengas permisos de modificación en la tabla `concepts`

### Los nodos no cambian de forma
- Abre la consola del navegador (F12) y busca errores
- Verifica que la migración se haya ejecutado correctamente
- Recarga la página con Ctrl+F5 para limpiar la caché

### El menú contextual no se ve bien
- Limpia la caché del navegador
- Asegúrate de que el archivo `style.css` se haya actualizado correctamente

## 📝 Notas Adicionales

- Los nodos existentes mantendrán la forma de círculo hasta que las cambies manualmente
- El tamaño de los nodos se calcula como: `baseSize * (0.5 + size * 1.5)`, lo que da un rango de 0.5x a 2x el tamaño base
- Las formas son vectoriales (SVG), por lo que se ven nítidas en cualquier zoom

## 🎯 Próximas Mejoras Posibles

- [ ] Atajos de teclado para cambiar formas rápidamente
- [ ] Copiar forma y tamaño de un nodo a otro
- [ ] Plantillas de formas y tamaños por categoría
- [ ] Exportar/importar configuraciones de formas y tamaños
