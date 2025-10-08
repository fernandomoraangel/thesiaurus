# 🐛 Guía de Depuración - Posiciones Fijas

## ✅ Checklist de Verificación

### 1. Verificar que ejecutaste la migración SQL

Abre Supabase SQL Editor y ejecuta:

```sql
-- Verificar que los campos existen
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'concepts' 
AND column_name IN ('fixed_x', 'fixed_y');
```

**Resultado esperado:**
```
| column_name | data_type | is_nullable |
| ----------- | --------- | ----------- |
| fixed_x     | numeric   | YES         |
| fixed_y     | numeric   | YES         |
```

Si no ves estos campos, ejecuta el script `add_position_fields.sql`.

---

### 2. Verificar la consola del navegador

Abre la consola del navegador (F12 → Console) y busca estos mensajes:

**Al cargar la página:**
```
✅ Loaded X fixed node positions from database
```

**Al arrastrar un nodo:**
```
💾 Saving fixed position for node [uuid]: { x: 245.5, y: 189.3 }
✅ Position saved successfully
```

**Si ves errores:**
```
❌ Error saving fixed position: [descripción del error]
```

---

### 3. Verificar que los datos se están guardando

En Supabase SQL Editor:

```sql
-- Ver todos los conceptos con posiciones fijas
SELECT id, fixed_x, fixed_y 
FROM concepts 
WHERE fixed_x IS NOT NULL 
AND fixed_y IS NOT NULL;
```

**Después de arrastrar un nodo**, deberías ver una fila con valores en `fixed_x` y `fixed_y`.

---

### 4. Verificar permisos RLS (Row Level Security)

```sql
-- Ver las políticas de la tabla concepts
SELECT * FROM pg_policies WHERE tablename = 'concepts';
```

Asegúrate de que existe una política que permita UPDATE para los usuarios autenticados.

Si no existe, crea una:

```sql
-- Política para permitir UPDATE a conceptos propios
CREATE POLICY "Users can update their own thesaurus concepts"
ON concepts FOR UPDATE
USING (
  thesaurus_id IN (
    SELECT id FROM thesauruses WHERE user_id = auth.uid()
  )
);
```

---

### 5. Verificar que se están consultando los campos

Abre la consola del navegador y ejecuta:

```javascript
// Ver un concepto de ejemplo
console.log(state.concepts[0]);
```

Deberías ver algo como:
```javascript
{
  id: "uuid-aqui",
  category_id: "uuid",
  temporal_start: 1950,
  temporal_end: null,
  temporal_relevance: 1.0,
  fixed_x: 245.532,  // ← Debe aparecer
  fixed_y: 189.321,  // ← Debe aparecer
  labels: [...],
  notes: [...]
}
```

Si `fixed_x` y `fixed_y` NO aparecen, verifica que el script.js tenga:
```javascript
.select("id, created_at, category_id, temporal_start, temporal_end, temporal_relevance, fixed_x, fixed_y")
```

---

### 6. Verificar el indicador visual

**Nodos fijos deben tener:**
- Borde rojo (#ff6b6b)
- Grosor de 5px

**Nodos libres deben tener:**
- Borde blanco (#fff)
- Grosor de 2px

Si no ves el borde rojo después de arrastrar:

1. Abre la consola
2. Inspecciona un nodo (click derecho → Inspeccionar)
3. Busca el elemento `<circle>`
4. Verifica los atributos `stroke` y `stroke-width`

---

## 🔧 Soluciones Rápidas

### Problema: "No se ve el borde rojo"

**Solución 1:** Verifica en la consola si hay errores de JavaScript

**Solución 2:** Recarga la página con Ctrl+F5 (recarga completa)

**Solución 3:** Inspecciona el círculo y verifica manualmente:
```javascript
// En la consola del navegador
d3.selectAll(".node circle")
  .attr("stroke", function(d) {
    return d.fx !== null ? "#ff6b6b" : "#fff";
  })
  .attr("stroke-width", function(d) {
    return d.fx !== null ? 5 : 2;
  });
```

---

### Problema: "Las posiciones no se guardan"

**Solución 1:** Verifica permisos RLS (ver punto 4)

**Solución 2:** Revisa la consola para ver el error específico

**Solución 3:** Ejecuta manualmente en Supabase:
```sql
UPDATE concepts 
SET fixed_x = 300, fixed_y = 200 
WHERE id = '[pega-aqui-el-uuid-de-un-concepto]';
```

Luego recarga la página y verifica si el nodo aparece en esa posición.

---

### Problema: "Las posiciones no se cargan al recargar"

**Solución 1:** Verifica que los campos están en el SELECT (ver punto 5)

**Solución 2:** Limpia la caché del navegador (Ctrl+Shift+Delete)

**Solución 3:** Verifica en Supabase que los datos están guardados:
```sql
SELECT id, fixed_x, fixed_y FROM concepts;
```

---

## 📊 Estado Esperado del Sistema

### Al arrastrar un nodo:

1. ✅ `d.fx` y `d.fy` se establecen
2. ✅ Aparece log: "💾 Saving fixed position..."
3. ✅ Aparece log: "✅ Position saved successfully"
4. ✅ El círculo cambia a borde rojo de 5px
5. ✅ En Supabase aparece la fila actualizada

### Al recargar la página:

1. ✅ Se consultan conceptos con `fixed_x` y `fixed_y`
2. ✅ Aparece log: "✅ Loaded X fixed node positions..."
3. ✅ Los nodos fijos aparecen en sus posiciones guardadas
4. ✅ Los nodos fijos tienen borde rojo de 5px

---

## 🆘 Si nada funciona

1. **Verifica que ejecutaste** `add_position_fields.sql` en Supabase
2. **Recarga completamente** con Ctrl+F5
3. **Limpia localStorage**: 
   ```javascript
   localStorage.clear();
   ```
4. **Revisa los logs** en la consola del navegador
5. **Revisa los logs** en Supabase (Logs → Database)

---

**Última actualización:** 8 de octubre de 2025
