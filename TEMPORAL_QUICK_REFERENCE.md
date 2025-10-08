# 🕰️ Dimensión Temporal - Tarjeta de Referencia Rápida

## Controles del Timeline

| Botón   | Función                   | Atajo       |
| ------- | ------------------------- | ----------- |
| **▶**   | Inicia animación temporal | -           |
| **⏸**   | Pausa animación           | -           |
| **↻**   | Resetear a año actual     | -           |
| **☐**   | Mostrar conceptos futuros | Toggle      |
| **▼/▲** | Expandir/Colapsar panel   | Clic header |

## Campos Temporales

### En Conceptos
```
temporal_start      → Año de inicio (ej: 1990)
temporal_end        → Año de fin (ej: 2020) 
temporal_relevance  → Relevancia 0.0-1.0 (ej: 0.8)
```

### En Relaciones
```
temporal_start      → Año de inicio de la relación
temporal_end        → Año de fin de la relación
temporal_relevance  → Importancia de la conexión
```

## Comportamiento Visual

### Opacidad
```
Opacidad = 0.3 + (relevancia × 0.7)

Relevancia 0.0 → 30% visible
Relevancia 0.5 → 65% visible  
Relevancia 1.0 → 100% visible
```

### Grosor de Relaciones
```
Grosor = 2px × (0.5 + relevancia)

Relevancia 0.0 → 1px
Relevancia 0.5 → 2px
Relevancia 1.0 → 3px
```

## Reglas de Visibilidad

### Conceptos
- **Sin fechas**: Siempre visible
- **Solo inicio**: Visible desde ese año
- **Solo fin**: Visible hasta ese año
- **Ambos**: Visible en el rango

### Relaciones
- **Ambos nodos visibles**: Puede mostrarse
- **Un nodo invisible**: Se oculta
- **Respeta su propio rango temporal**: Sí

## Atajos de Uso

### Para Investigadores
1. Añadir fechas a conceptos clave
2. Establecer relevancia según importancia
3. Usar Play para presentaciones
4. Pausar en hitos históricos

### Para Análisis
1. Navegar a período específico
2. Observar densidad de conceptos
3. Identificar relaciones emergentes
4. Comparar épocas diferentes

### Para Documentación
1. Llenar campos temporales completos
2. Usar relevancia 1.0 para fundamentales
3. Exportar PDF con timeline visible
4. Capturar pantallas de períodos clave

## Ejemplos Rápidos

### Concepto Vigente
```javascript
temporal_start: 1995
temporal_end: null
temporal_relevance: 1.0
// Visible desde 1995 hasta hoy
```

### Concepto Histórico
```javascript
temporal_start: 1960
temporal_end: 1980
temporal_relevance: 0.7
// Visible solo 1960-1980, relevancia media
```

### Relación Temporal
```javascript
temporal_start: 2000
temporal_end: 2010
temporal_relevance: 0.5
// Conexión activa solo 2000-2010
```

## Configuración Avanzada

### Cambiar Velocidad de Animación
```javascript
// En script.js, línea ~2020
animationSpeed: 200  // ms por año
// Más rápido: 100ms
// Más lento: 500ms
```

### Ajustar Rango Temporal
```html
<!-- En main.html -->
<input type="range" 
  id="timeline-slider" 
  min="1950"    <!-- Cambiar aquí -->
  max="2030"    <!-- Y aquí -->
  value="2030">
```

## Solución Rápida de Problemas

| Problema              | Solución                           |
| --------------------- | ---------------------------------- |
| Nodos no aparecen     | Verificar temporal_start           |
| Opacidad incorrecta   | Ajustar temporal_relevance 0.0-1.0 |
| Animación no inicia   | Presionar Reset primero            |
| Relaciones invisibles | Verificar ambos nodos visibles     |

## Fórmulas Útiles

### Calcular Relevancia por Edad
```javascript
// Más nuevo = más relevante
relevancia = 1 - ((añoActual - añoInicio) / 100)
```

### Rango Temporal Centrado
```javascript
// Para período de 20 años
inicio = añoCentral - 10
fin = añoCentral + 10
```

---

**💡 Tip**: Para mejores resultados, añade información temporal a al menos el 50% de tus conceptos clave.

**🎯 Práctica**: Crea 5 conceptos con fechas diferentes y usa Play para ver su evolución.

**📚 Más info**: Ver [TEMPORAL_DIMENSION_GUIDE.md](TEMPORAL_DIMENSION_GUIDE.md)
