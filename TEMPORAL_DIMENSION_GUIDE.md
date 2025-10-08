# Guía de la Dimensión Temporal (4ª Dimensión) - Cronaurus

## 📅 Visión General

La **Dimensión Temporal** es una característica avanzada de Cronaurus que permite visualizar la evolución histórica de conceptos y relaciones en tu tesauro. Esta funcionalidad transforma tu grafo estático en una línea de tiempo interactiva que muestra cómo los conceptos emergen, evolucionan y se relacionan a lo largo del tiempo.

## 🎯 Características Implementadas

### 1. Línea de Tiempo Interactiva

#### Control Deslizante Temporal
- **Rango**: 1950-2030+ (ajustable dinámicamente según tus datos)
- **Navegación**: Arrastra el control deslizante para viajar en el tiempo
- **Visualización en tiempo real**: El grafo se actualiza instantáneamente al cambiar el año

#### Controles de Animación
- **▶ Play**: Reproduce una animación temporal que avanza año por año
- **⏸ Pause**: Pausa la animación en el año actual
- **↻ Reset**: Regresa al año más reciente y resetea la visualización
- **Velocidad**: 200ms por año (configurable en el código)

### 2. Filtrado Temporal de Conceptos

Los conceptos aparecen y desaparecen según su marco temporal:

- **Conceptos con fecha de inicio**: Aparecen en el año especificado con una animación de "rebote"
- **Conceptos con fecha de fin**: Desaparecen gradualmente después del año final
- **Conceptos sin información temporal**: Siempre visibles (se consideran "atemporales")

### 3. Filtrado Temporal de Relaciones

Las relaciones entre conceptos también tienen temporalidad:

- Solo se muestran si ambos conceptos están activos en el año seleccionado
- El grosor y la opacidad reflejan la `temporal_relevance`
- Las relaciones con fechas específicas solo aparecen en su período válido

### 4. Opacidad Basada en Relevancia

La **relevancia temporal** (valor 0.0 - 1.0) afecta la visualización:

```
Opacidad = 0.3 + (temporal_relevance × 0.7)
```

- **Relevancia 0.0**: Opacidad mínima (30%)
- **Relevancia 0.5**: Opacidad media (65%)
- **Relevancia 1.0**: Opacidad máxima (100%)

### 5. Opción "Mostrar Conceptos Futuros"

- ✅ **Activada**: Muestra conceptos que comienzan antes del año actual aunque no tengan fecha de fin
- ❌ **Desactivada**: Solo muestra conceptos con rango temporal explícito dentro del período visible

## 🎨 Interfaz de Usuario

### Ubicación
El panel temporal está ubicado en la parte inferior central del panel de visualización, con un diseño elegante y minimalista.

### Estados del Panel
- **Expandido**: Muestra todos los controles y el slider
- **Colapsado**: Solo muestra el encabezado (clic en ▼/▲ para alternar)

### Elementos Visuales
- **Display del Año Actual**: Número grande y destacado en azul
- **Etiquetas de Referencia**: Marcas cada 20 años (aproximadamente)
- **Gradiente del Slider**: Color degradado del pasado al futuro

## 📝 Uso en el Editor de Conceptos

### Campos Temporales en el Formulario

Cada concepto puede tener tres campos temporales:

1. **Inicio (temporal_start)**
   - Tipo: Año (número entero)
   - Ejemplo: `1990`
   - Descripción: Año en que el concepto fue acuñado o comenzó a ser relevante

2. **Fin (temporal_end)**
   - Tipo: Año (número entero)
   - Ejemplo: `2020`
   - Descripción: Año en que el concepto dejó de ser relevante (opcional)

3. **Relevancia (temporal_relevance)**
   - Tipo: Decimal (0.0 - 1.0)
   - Ejemplo: `0.8`
   - Descripción: Importancia del concepto en su período temporal

### Ejemplo de Uso

**Concepto**: "Web 2.0"
- **Inicio**: 2004
- **Fin**: 2015
- **Relevancia**: 0.9

**Concepto**: "Inteligencia Artificial"
- **Inicio**: 1956
- **Fin**: (vacío - sigue vigente)
- **Relevancia**: 1.0

## 🔗 Historicidad de Relaciones

### Edición de Relaciones Temporales

Para añadir información temporal a una relación:

1. **Clic derecho** sobre una arista (relación) en el grafo
2. Se abre el modal "Historicidad de la Relación"
3. Completa los campos:
   - **Inicio**: Año en que comenzó la relación
   - **Fin**: Año en que terminó (opcional)
   - **Relevancia**: Importancia de la relación (0.0 - 1.0)
4. **Guardar**: Los cambios se aplican inmediatamente

### Efectos Visuales

Las relaciones con información temporal muestran:

- **Grosor variable**: Basado en la relevancia
- **Opacidad dinámica**: Según la relevancia temporal
- **Líneas sólidas**: Para relaciones con fechas definidas
- **Líneas punteadas**: Para relaciones sin historicidad

## 🎬 Flujo de Trabajo Recomendado

### Para Análisis Histórico

1. **Preparación de Datos**
   - Añade fechas de inicio/fin a tus conceptos clave
   - Establece la relevancia temporal según tu criterio
   - Define la historicidad de las relaciones importantes

2. **Exploración Temporal**
   - Usa el slider para navegar a períodos específicos
   - Observa qué conceptos estaban activos en cada época
   - Identifica relaciones emergentes o desaparecidas

3. **Análisis Evolutivo**
   - Usa el botón Play para ver la evolución completa
   - Pausa en momentos clave para analizar el estado del grafo
   - Toma notas sobre transformaciones importantes

### Para Presentaciones

1. **Configura el Rango Temporal**
   - Define el período que quieres mostrar
   - Ajusta la relevancia para destacar conceptos clave

2. **Usa la Animación**
   - Inicia la reproducción para mostrar la evolución
   - Pausa en hitos importantes
   - Reinicia para repetir la demostración

3. **Exporta Resultados**
   - Captura pantallas en momentos clave
   - Exporta el resumen en PDF (incluye el grafo actual)

## ⚙️ Configuración Avanzada

### Modificar la Velocidad de Animación

En `script.js`, línea ~2020:

```javascript
let temporalState = {
    // ...
    animationSpeed: 200 // Cambiar a 500 para más lento, 100 para más rápido
};
```

### Ajustar el Rango Temporal por Defecto

En `main.html`, línea ~200:

```html
<input type="range" id="timeline-slider" min="1950" max="2030" value="2030" step="1">
```

### Personalizar Cálculo de Opacidad

En `script.js`, función `getTemporalOpacity()`:

```javascript
function getTemporalOpacity(item) {
    if (item.temporal_relevance !== null && item.temporal_relevance !== undefined) {
        return 0.3 + (item.temporal_relevance * 0.7); // Ajustar fórmula
    }
    return 1.0;
}
```

## 🐛 Solución de Problemas

### El Slider No Responde
- **Causa**: Posible error de inicialización
- **Solución**: Recarga la página y asegúrate de que hay un tesauro activo

### Los Nodos No Aparecen/Desaparecen
- **Causa**: Fechas temporales no configuradas
- **Solución**: Verifica que los conceptos tengan `temporal_start` definido

### La Animación Se Detiene Abruptamente
- **Causa**: Llegó al final del rango temporal
- **Solución**: Presiona Reset para reiniciar desde el principio

### Opacidad Incorrecta
- **Causa**: `temporal_relevance` fuera del rango 0.0-1.0
- **Solución**: Edita el concepto y ajusta el valor a un número válido

## 📊 Base de Datos

### Campos Agregados

Ya están definidos en tu esquema actual:

**Tabla `concepts`**:
```sql
temporal_start integer,
temporal_end integer,
temporal_relevance numeric DEFAULT 1.0
```

**Tabla `relationships`**:
```sql
temporal_start integer,
temporal_end integer,
temporal_relevance numeric DEFAULT 1.0
```

### Consultas de Ejemplo

**Conceptos activos en 2010**:
```sql
SELECT * FROM concepts 
WHERE (temporal_start IS NULL OR temporal_start <= 2010)
AND (temporal_end IS NULL OR temporal_end >= 2010);
```

**Relaciones con alta relevancia**:
```sql
SELECT * FROM relationships 
WHERE temporal_relevance > 0.8;
```

## 🚀 Próximas Mejoras Sugeridas

1. **Marcadores Temporales**: Añadir eventos históricos importantes en la línea de tiempo
2. **Exportar Animación**: Generar GIF o video de la evolución temporal
3. **Rangos Múltiples**: Permitir seleccionar varios períodos simultáneamente
4. **Comparación Temporal**: Vista dividida para comparar dos períodos
5. **Heatmap Temporal**: Visualización de densidad de conceptos por década

## 📚 Recursos Adicionales

- **D3.js Transitions**: [https://github.com/d3/d3-transition](https://github.com/d3/d3-transition)
- **Timeline Visualization Best Practices**: [https://www.storytellingwithdata.com/](https://www.storytellingwithdata.com/)
- **SKOS Temporal Extensions**: [W3C SKOS Primer](https://www.w3.org/TR/skos-primer/)

## 💡 Ejemplos de Casos de Uso

### 1. Historia del Arte Digital
- **1960**: Primeras experiencias de arte generativo
- **1985**: Arte fractal (alta relevancia)
- **2000**: Net.art (relevancia media)
- **2015**: Arte con IA (relevancia creciente)

### 2. Evolución de Lenguajes de Programación
- **1970**: C (relevancia 1.0, sin fin)
- **1995**: JavaScript (relevancia 1.0, sin fin)
- **2000-2010**: Flash (relevancia 0.8, obsoleto)
- **2014**: Swift (relevancia 0.9, sin fin)

### 3. Movimientos Filosóficos
- **1920-1940**: Círculo de Viena (positivismo lógico)
- **1945-1960**: Existencialismo francés (alta relevancia)
- **1960-1980**: Estructuralismo (relevancia decreciente)
- **1970-actualidad**: Postestructuralismo

---

**¡Explora el tiempo con Cronaurus! 🕰️✨**
