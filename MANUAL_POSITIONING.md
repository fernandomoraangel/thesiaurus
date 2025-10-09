# 📍 Posicionamiento Manual de Nuevos Nodos

## 🎯 Funcionalidad

Cuando creas un nuevo concepto, el sistema te permite posicionarlo manualmente en el grafo haciendo clic en la ubicación deseada.

## 🔄 Flujo de Uso

### 1. Crear Nuevo Concepto
```
Usuario llena formulario → Clic en "Guardar Concepto"
```

### 2. Activación del Modo de Posicionamiento
El sistema automáticamente:
- ✅ Muestra notificación: "Haz clic en el grafo para posicionar el nuevo nodo"
- ✅ Cambia el cursor a **crosshair** (cruz de puntería)
- ✅ Añade overlay azul semi-transparente con borde punteado
- ✅ Muestra texto flotante: "📍 Haz clic para posicionar: [Nombre del Concepto]"
- ✅ Aparece botón rojo central: "✕ CANCELAR POSICIONAMIENTO"

### 3. Posicionar el Nodo
```
Usuario hace clic en cualquier parte del grafo
  ↓
Nodo se coloca en esa posición
  ↓
Posición se guarda automáticamente en BD (fixed_x, fixed_y)
  ↓
Modo de posicionamiento se desactiva
  ↓
Notificación: "¡Posición Guardada!"
```

### 4. Cancelar Posicionamiento (Opcional)
```
Usuario hace clic en "✕ CANCELAR POSICIONAMIENTO"
  ↓
Modo se desactiva
  ↓
Nodo se posiciona automáticamente (simulación D3.js)
  ↓
Notificación: "Posicionamiento Cancelado"
```

## 🎨 Indicadores Visuales

### Durante el Modo de Posicionamiento

| Elemento           | Estilo                                         |
| ------------------ | ---------------------------------------------- |
| **Cursor**         | Crosshair (cruz)                               |
| **Overlay**        | Azul semi-transparente (#3498db, 10% opacidad) |
| **Borde**          | Azul punteado (3px, patrón 10-5)               |
| **Texto**          | Grande, negrita, con borde blanco              |
| **Botón Cancelar** | Rojo, centro de pantalla, sombra prominente    |

### Después del Posicionamiento

| Estado           | Indicador                         |
| ---------------- | --------------------------------- |
| **Nodo fijo**    | Borde rojo (#ff6b6b) de 5px       |
| **Posición**     | Guardada en BD (fixed_x, fixed_y) |
| **Persistencia** | Mantiene posición al recargar     |

## 💻 Implementación Técnica

### Estado de la Aplicación
```javascript
state.positioningMode = {
  active: false,         // ¿Está activo el modo?
  conceptId: null,       // UUID del concepto nuevo
  conceptName: null      // Nombre del concepto (para mostrar)
}
```

### Funciones Principales

#### `activatePositioningMode()`
- Muestra botón de cancelar
- Cambia cursor a crosshair
- Añade overlay y texto de instrucción
- Registra handler de clic

#### `handlePositioningClick(event)`
- Obtiene coordenadas del clic
- Guarda posición en BD
- Desactiva modo
- Recarga datos
- Muestra confirmación

#### `deactivatePositioningMode()`
- Oculta botón de cancelar
- Restaura cursor
- Remueve overlay y texto
- Limpia estado

### Modificaciones en `saveConcept()`
```javascript
// Detecta si es concepto nuevo
const isNewConcept = !conceptId;

if (isNewConcept) {
  // Activar modo de posicionamiento
  state.positioningMode.active = true;
  state.positioningMode.conceptId = currentConceptId;
  state.positioningMode.conceptName = prefLabel.text;
  
  await fetchAllConceptData();
  clearForm();
  activatePositioningMode();
} else {
  // Concepto existente - solo actualizar
  await fetchAllConceptData();
  clearForm();
}
```

## 📋 Casos de Uso

### Caso 1: Posicionamiento Exitoso
```
1. Usuario crea concepto "Inteligencia Artificial"
2. Hace clic en "Guardar Concepto"
3. Sistema muestra overlay azul
4. Usuario hace clic en esquina superior derecha
5. Nodo aparece con borde rojo en esa posición
6. Al recargar, nodo sigue ahí
```

### Caso 2: Cancelación
```
1. Usuario crea concepto "Machine Learning"
2. Hace clic en "Guardar Concepto"
3. Sistema muestra overlay azul
4. Usuario se arrepiente y hace clic en "CANCELAR"
5. Nodo se posiciona automáticamente (D3.js)
6. Sin borde rojo (posición libre)
```

### Caso 3: Actualización de Concepto
```
1. Usuario edita concepto existente
2. Hace clic en "Guardar Concepto"
3. NO se activa modo de posicionamiento
4. Concepto mantiene su posición actual
5. Actualización silenciosa
```

## 🎯 Ventajas

✅ **Precisión**: Usuario decide exactamente dónde va el nodo
✅ **Flexibilidad**: Puede cancelar si cambia de opinión
✅ **Visual**: Indicadores claros de qué hacer
✅ **Persistente**: Posición se guarda en BD
✅ **Intuitivo**: Solo para conceptos nuevos

## 🔧 Archivos Modificados

| Archivo       | Cambios                                                                          |
| ------------- | -------------------------------------------------------------------------------- |
| **script.js** | Añadido estado `positioningMode`, 3 funciones nuevas, modificado `saveConcept()` |
| **main.html** | Añadido botón de cancelar                                                        |
| **style.css** | Estilos para `.cancel-positioning-btn`                                           |

## 🐛 Depuración

### Logs en Consola

```javascript
// Al activar
"🎯 Modo de posicionamiento activado"

// Al posicionar
"📍 Posicionando nodo en: (245.5, 189.3)"
"💾 Saving fixed position for node [uuid]: { x: 245.5, y: 189.3 }"
"✅ Position saved successfully"

// Al desactivar
"🎯 Modo de posicionamiento desactivado"
```

### Verificar Estado
```javascript
// En consola del navegador
console.log(state.positioningMode);
// { active: true/false, conceptId: "uuid", conceptName: "..." }
```

## 🚀 Mejoras Futuras (Opcional)

- [ ] Vista previa del nodo antes de hacer clic
- [ ] Rejilla de alineación (snap to grid)
- [ ] Deshacer posicionamiento (con Ctrl+Z)
- [ ] Arrastrar nodo durante modo de posicionamiento
- [ ] Guardar posiciones favoritas (presets)

---

**Versión:** 2.2.0  
**Fecha:** 8 de octubre de 2025  
**Autor:** Fernando Mora Ángel
