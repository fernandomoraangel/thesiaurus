# 🐛 Depuración - Posicionamiento de Nodos

## 🎯 Problema: Nodo no se posiciona donde se hace clic

### Causa Raíz
El SVG tiene zoom/pan aplicado mediante `d3.zoom()`, lo que crea una transformación que debe invertirse para obtener las coordenadas correctas en el espacio del grafo.

## 🔧 Solución Implementada

### 1. Ajuste de Coordenadas con Transform Inverso

```javascript
// Obtener coordenadas del clic relativas al SVG
const pointer = d3.pointer(event, svg.node());

// Obtener transformación aplicada a nodeGroup
const currentTransform = d3.zoomTransform(nodeGroup.node());

// Invertir transformación
const [x, y] = currentTransform.invert(pointer);
```

### 2. Establecer Posición Inicial y Fija

```javascript
// En loadFixedPositions()
node.fx = node.fullConcept.fixed_x;  // Posición fija X
node.fy = node.fullConcept.fixed_y;  // Posición fija Y
node.x = node.fullConcept.fixed_x;   // Posición inicial X
node.y = node.fullConcept.fixed_y;   // Posición inicial Y
```

Esto evita que la simulación mueva el nodo antes de que se estabilice.

## 🧪 Verificación

### En la Consola del Navegador

Cuando hagas clic para posicionar, deberías ver:

```
📍 Clic en SVG: (450.00, 300.00)
📍 Posición en grafo: (425.32, 285.67)
📍 Transform: scale=1.00, tx=0.00, ty=0.00
💾 Saving fixed position for node [uuid]: { x: 425.32, y: 285.67 }
✅ Position saved successfully
✅ Loaded 1 fixed node positions from database
```

### Interpretación de Logs

| Log                   | Significado                                                         |
| --------------------- | ------------------------------------------------------------------- |
| **Clic en SVG**       | Coordenadas del clic en la pantalla (píxeles del SVG)               |
| **Posición en grafo** | Coordenadas reales en el espacio del grafo (ajustadas por zoom/pan) |
| **Transform**         | Transformación actual (scale = zoom, tx/ty = desplazamiento)        |

### Casos de Transform

#### Sin Zoom ni Pan
```
scale=1.00, tx=0.00, ty=0.00
→ Las coordenadas de clic y grafo son iguales
```

#### Con Zoom
```
scale=2.00, tx=0.00, ty=0.00
→ Las coordenadas de grafo son la mitad de las de clic
```

#### Con Pan
```
scale=1.00, tx=100.00, ty=50.00
→ Las coordenadas de grafo se ajustan por desplazamiento
```

#### Con Zoom y Pan
```
scale=1.50, tx=-50.00, ty=-30.00
→ Se aplican ambas transformaciones
```

## 🧮 Matemáticas del Transform

La transformación se aplica así:
```
pantalla_x = (grafo_x * scale) + translate_x
pantalla_y = (grafo_y * scale) + translate_y
```

La inversa (lo que hacemos):
```
grafo_x = (pantalla_x - translate_x) / scale
grafo_y = (pantalla_y - translate_y) / scale
```

## 🔍 Depurar Problema de Posicionamiento

### Paso 1: Verificar Transformación
```javascript
// En consola del navegador ANTES de hacer clic
const transform = d3.zoomTransform(d3.select('svg g.nodes').node());
console.log('Scale:', transform.k);
console.log('Translate X:', transform.x);
console.log('Translate Y:', transform.y);
```

### Paso 2: Verificar Coordenadas del Clic
```javascript
// Agregar console.log temporal en handlePositioningClick
console.log('Pointer:', pointer);
console.log('Transform:', currentTransform);
console.log('Inverted:', [x, y]);
```

### Paso 3: Verificar Guardado en BD
```sql
-- En Supabase SQL Editor
SELECT id, fixed_x, fixed_y 
FROM concepts 
WHERE fixed_x IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 1;
```

### Paso 4: Verificar Carga
```javascript
// En consola después de recargar
state.concepts.forEach(c => {
  if (c.fixed_x !== null) {
    console.log('Concepto fijo:', c.id, c.fixed_x, c.fixed_y);
  }
});
```

## ✅ Checklist de Verificación

- [ ] Los logs muestran "Clic en SVG" y "Posición en grafo"
- [ ] Las coordenadas son diferentes si hay zoom/pan
- [ ] La posición se guarda correctamente en BD
- [ ] El log muestra "✅ Loaded N fixed node positions"
- [ ] El nodo aparece con borde rojo de 5px
- [ ] El nodo está exactamente donde hiciste clic
- [ ] Al recargar, el nodo sigue en el mismo lugar

## 🎯 Test Manual

### Sin Zoom/Pan
1. Resetea zoom (Ctrl+0 o recargar página)
2. Crea nuevo concepto
3. Haz clic en el centro del grafo
4. El nodo debe aparecer exactamente ahí

### Con Zoom
1. Haz zoom in (Ctrl++)
2. Crea nuevo concepto
3. Haz clic donde quieras
4. El nodo debe aparecer donde hiciste clic (no desplazado)

### Con Pan
1. Arrastra el grafo (pan)
2. Crea nuevo concepto
3. Haz clic donde quieras
4. El nodo debe aparecer donde hiciste clic

## 🐛 Problemas Comunes

### Problema: Nodo aparece desplazado

**Posible causa:** El transform no se está invirtiendo correctamente

**Solución:**
```javascript
// Verificar que se usa nodeGroup.node() no svg.node()
const currentTransform = d3.zoomTransform(nodeGroup.node());
```

### Problema: Nodo se mueve después de aparecer

**Posible causa:** La simulación lo está moviendo

**Solución:** Verificar que tanto `x`, `y`, `fx`, `fy` están establecidos:
```javascript
node.x = node.fullConcept.fixed_x;   // ← Importante
node.y = node.fullConcept.fixed_y;   // ← Importante
node.fx = node.fullConcept.fixed_x;
node.fy = node.fullConcept.fixed_y;
```

### Problema: Coordenadas negativas o muy grandes

**Posible causa:** Pan extremo del grafo

**Solución:** Es normal, las coordenadas del grafo pueden ser cualquier valor. Lo importante es que sean consistentes.

## 📊 Datos de Ejemplo

### Clic sin transformación
```
Clic en SVG: (400, 300)
Posición en grafo: (400, 300)
→ Guardado en BD: fixed_x=400, fixed_y=300
```

### Clic con zoom 2x
```
Clic en SVG: (400, 300)
Transform: scale=2.00, tx=0, ty=0
Posición en grafo: (200, 150)
→ Guardado en BD: fixed_x=200, fixed_y=150
```

### Clic con pan
```
Clic en SVG: (400, 300)
Transform: scale=1.00, tx=100, ty=50
Posición en grafo: (300, 250)
→ Guardado en BD: fixed_x=300, fixed_y=250
```

---

**Última actualización:** 8 de octubre de 2025
