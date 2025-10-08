# 📋 Instrucciones de Migración - Posiciones Fijas en Base de Datos

## 🎯 Objetivo
Migrar el sistema de posiciones fijas de nodos desde localStorage a la base de datos PostgreSQL de Supabase.

## 📝 Pasos para Ejecutar la Migración

### 1. Acceder a Supabase
1. Inicia sesión en [Supabase](https://supabase.com)
2. Selecciona tu proyecto de Cronaurus/Thesiaurus
3. Ve a la sección **SQL Editor** en el menú lateral

### 2. Ejecutar el Script de Migración
1. Abre el archivo `add_position_fields.sql` en este repositorio
2. Copia todo el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (Ejecutar)

### 3. Verificar la Migración
Ejecuta la siguiente consulta para verificar que los campos se añadieron correctamente:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'concepts' 
AND column_name IN ('fixed_x', 'fixed_y');
```

Deberías ver:

| column_name | data_type | is_nullable |
| ----------- | --------- | ----------- |
| fixed_x     | numeric   | YES         |
| fixed_y     | numeric   | YES         |

### 4. Verificar Permisos RLS (Row Level Security)

Los nuevos campos heredan automáticamente las políticas RLS de la tabla `concepts`, pero puedes verificarlo con:

```sql
-- Ver políticas actuales de la tabla concepts
SELECT * FROM pg_policies WHERE tablename = 'concepts';
```

## ✅ ¿Qué cambia?

### Antes (localStorage)
- Las posiciones se guardaban en el navegador
- Diferentes navegadores = diferentes posiciones
- Al limpiar caché se perdían las posiciones
- No sincronizado entre dispositivos

### Después (Base de Datos)
- ✅ Las posiciones se guardan en PostgreSQL
- ✅ Mismo tesauro en cualquier navegador/dispositivo
- ✅ Persistencia permanente y confiable
- ✅ Sincronización automática
- ✅ Backup incluido en respaldos de BD

## 🔄 Migración de Datos Existentes (Opcional)

Si ya tienes posiciones guardadas en localStorage y quieres migrarlas a la base de datos:

1. Abre la consola del navegador (F12)
2. Ejecuta este script:

```javascript
// Obtener todas las posiciones guardadas en localStorage
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('fixed_positions_')) {
    const thesaurusId = key.replace('fixed_positions_', '');
    const positions = JSON.parse(localStorage.getItem(key));
    console.log(`Tesauro ${thesaurusId}:`, positions);
    
    // Aquí puedes copiar los datos para actualizarlos manualmente
    // o crear un script de migración automática
  }
});
```

3. Para cada nodo con posición fija, ejecuta en Supabase:

```sql
UPDATE concepts 
SET fixed_x = [valor_x], fixed_y = [valor_y] 
WHERE id = '[concept_id]';
```

**Nota:** Esta migración de datos es opcional. Las nuevas posiciones se guardarán automáticamente en la BD.

## 🧹 Limpieza (Opcional)

Después de verificar que todo funciona, puedes limpiar el localStorage:

```javascript
// En la consola del navegador
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('fixed_positions_')) {
    localStorage.removeItem(key);
  }
});
```

## 🐛 Resolución de Problemas

### Error: "permission denied for table concepts"
**Solución:** Verifica que tienes permisos de admin o que las políticas RLS permiten UPDATE.

### Error: "column 'fixed_x' does not exist"
**Solución:** Ejecuta nuevamente el script `add_position_fields.sql`.

### Las posiciones no se guardan
**Solución:** 
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña Console
3. Verifica que las políticas RLS permiten UPDATE en la tabla concepts

## 📊 Estructura de Datos

### Campos Añadidos

```sql
fixed_x    numeric  -- Posición X del nodo (null = libre)
fixed_y    numeric  -- Posición Y del nodo (null = libre)
```

### Valores
- **NULL**: El nodo es libre y la simulación lo mueve
- **Número**: El nodo está fijo en esa coordenada

## 🎨 Indicadores Visuales

- **Nodos libres**: Borde blanco de 2px
- **Nodos fijos**: Borde rojo (#ff6b6b) de 5px

## 📅 Fecha de Migración
**Versión:** 2.1.1  
**Fecha:** 8 de octubre de 2025  
**Autor:** Fernando Mora Ángel

---

**¿Necesitas ayuda?** Revisa los logs en la consola del navegador o en Supabase Logs.
