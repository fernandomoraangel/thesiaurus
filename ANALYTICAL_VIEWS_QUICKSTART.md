# 🚀 Guía Rápida: Implementación del Sistema de Vistas Analíticas

## Pasos para Implementar

### 1️⃣ Ejecutar Migración de Base de Datos

1. Accede a tu proyecto en [Supabase](https://app.supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega el contenido del archivo `add_analytical_views.sql`
4. Ejecuta el script (Run)
5. Verifica que se crearon las tablas:
   - `analytical_views`
   - `active_analytical_views`

### 2️⃣ Verificar Archivos Actualizados

Asegúrate de tener los siguientes archivos actualizados en tu proyecto:

- ✅ `main.html` - Incluye la nueva sección de vistas analíticas y modales
- ✅ `script.js` - Contiene toda la lógica del sistema de vistas
- ✅ `style.css` - Estilos para el panel y componentes visuales

### 3️⃣ Subir Cambios a GitHub Pages (si aplica)

```bash
git add .
git commit -m "Implementar Sistema de Vistas Analíticas"
git push origin main
```

### 4️⃣ Probar el Sistema

1. Abre la aplicación en el navegador
2. Inicia sesión con tu cuenta
3. Selecciona o crea un tesauro
4. Ve a la sección **"Vistas Analíticas 👓"** en el panel de control
5. Deberías ver las 5 vistas predefinidas en "Vistas Disponibles"

## 🎯 Pruebas Recomendadas

### Test 1: Activar Vista Predefinida
1. Haz clic en el botón **"+"** de "Vista Tecnológica"
2. Verifica que la vista aparezca en "Vistas Activas"
3. Observa que el grafo se filtra mostrando solo conceptos relacionados con tecnología
4. Verifica que aparezcan las estadísticas (X conceptos visibles de Y)

### Test 2: Crear Vista Personalizada
1. Haz clic en **"➕ Nueva Vista"**
2. Completa el formulario:
   - Nombre: "Mi Vista Personalizada"
   - Descripción: "Conceptos importantes"
   - Selecciona algunas categorías
   - Configura un rango temporal
3. Guarda la vista
4. Activa la nueva vista
5. Verifica que el filtrado funcione correctamente

### Test 3: Combinar Vistas
1. Activa 2 o más vistas simultáneamente
2. Verifica que se muestren conceptos que cumplan con CUALQUIERA de las vistas
3. Observa el contador de conceptos visibles

### Test 4: Gestionar Vistas
1. Haz clic en **"⚙️ Gestionar"**
2. Verifica que aparezcan todas las vistas (predefinidas y personalizadas)
3. Intenta editar una vista personalizada
4. Intenta eliminar una vista personalizada
5. Verifica que las vistas predefinidas no se pueden eliminar

### Test 5: Persistencia
1. Activa varias vistas
2. Recarga la página
3. Verifica que las vistas activas se mantengan
4. Cambia de tesauro y vuelve
5. Las vistas activas deberían persistir por tesauro

## ⚠️ Solución de Problemas Comunes

### Problema: "No aparece la sección de Vistas Analíticas"
**Solución**: 
- Verifica que `main.html` tenga la nueva sección después de "Buscar Concepto"
- Limpia la caché del navegador (Ctrl+F5)

### Problema: "Error al cargar vistas"
**Solución**:
- Abre la consola del navegador (F12)
- Busca errores en la consola
- Verifica que las tablas existan en Supabase
- Comprueba las políticas RLS en Supabase

### Problema: "Las vistas predefinidas no se crean automáticamente"
**Solución**:
- Verifica que la función `createDefaultViewsIfNeeded()` se ejecute
- Comprueba en Supabase → Table Editor → analytical_views
- Si no aparecen, verifica los permisos de la base de datos

### Problema: "El filtrado no funciona correctamente"
**Solución**:
- Verifica que los conceptos tengan datos (etiquetas, notas, categorías)
- Revisa la función `matchesViewFilters()` en la consola
- Asegúrate de que los filtros en JSON tengan el formato correcto

### Problema: "Error 403 o permisos denegados"
**Solución**:
- Verifica que las políticas RLS estén activas
- Comprueba que el usuario esté autenticado
- Revisa que `user_id` en las consultas coincida con el usuario actual

## 📋 Checklist de Implementación

- [ ] Script SQL ejecutado en Supabase
- [ ] Tablas `analytical_views` y `active_analytical_views` creadas
- [ ] Políticas RLS activas y funcionando
- [ ] Archivos HTML, JS y CSS actualizados
- [ ] Aplicación desplegada (GitHub Pages o similar)
- [ ] Login funcionando correctamente
- [ ] Sección de vistas visible en el panel
- [ ] Vistas predefinidas creadas automáticamente
- [ ] Activación/desactivación de vistas funciona
- [ ] Creación de vistas personalizadas funciona
- [ ] Edición de vistas personalizadas funciona
- [ ] Eliminación de vistas personalizadas funciona
- [ ] Filtrado visual del grafo funciona
- [ ] Estadísticas de conceptos visibles se muestran
- [ ] Persistencia de vistas activas funciona
- [ ] Animaciones visuales funcionan correctamente

## 🎨 Personalización Rápida

### Cambiar colores de vistas predefinidas

En `script.js`, busca `createDefaultViewsIfNeeded()` y modifica los colores:

```javascript
{
  name: "Vista Tecnológica",
  color: "#TU_COLOR_AQUI", // Cambia este valor
  // ...
}
```

### Agregar nuevas palabras clave a vistas predefinidas

```javascript
{
  name: "Vista Tecnológica",
  filters: {
    keywords: [
      "tecnología", 
      "digital", 
      "TU_PALABRA_AQUI" // Agregar aquí
    ],
  },
}
```

### Modificar criterios de Vista Relacional

```javascript
{
  name: "Vista Relacional",
  filters: {
    min_connections: 5, // Cambia de 3 a 5
  },
}
```

## 📞 Contacto y Soporte

Si encuentras problemas durante la implementación:

1. Revisa la documentación completa en `ANALYTICAL_VIEWS_GUIDE.md`
2. Verifica la consola del navegador para mensajes de error
3. Comprueba los logs de Supabase
4. Revisa que todos los archivos estén actualizados

## 🎉 ¡Listo!

Si completaste todos los pasos y las pruebas, el Sistema de Vistas Analíticas debería estar completamente funcional. Los usuarios ahora pueden:

- ✨ Usar 5 vistas analíticas predefinidas
- 🎨 Crear vistas personalizadas ilimitadas
- 🔄 Activar múltiples vistas simultáneamente
- 💾 Mantener sus configuraciones entre sesiones
- 📊 Ver estadísticas de filtrado en tiempo real
- 🎯 Analizar sus tesauros desde múltiples perspectivas

---

**¡Felicitaciones por implementar el Sistema de Vistas Analíticas!** 👓🎊
