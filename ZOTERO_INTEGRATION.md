# 📚 Integración con Zotero API

## Descripción

Esta funcionalidad permite importar citas bibliográficas directamente desde tu biblioteca de Zotero al editor de conceptos de Cronaurus. Las citas se formatean automáticamente según el estilo seleccionado (APA, MLA, Chicago, Harvard).

## 🔧 Configuración Inicial

### 1. Obtener tu API Key de Zotero

1. Ve a [https://www.zotero.org/settings/keys](https://www.zotero.org/settings/keys)
2. Inicia sesión con tu cuenta de Zotero
3. Haz clic en "Create new private key"
4. Dale un nombre descriptivo (ej. "Cronaurus App")
5. Asegúrate de marcar **"Allow library access"** en modo **"Read Only"**
6. No necesitas marcar ningún otro permiso
7. Copia el API Key generado (lo necesitarás en el siguiente paso)

### 2. Obtener tu User ID o Group ID

#### Para bibliotecas de usuario:
1. Ve a [https://www.zotero.org/settings/keys](https://www.zotero.org/settings/keys)
2. Tu User ID aparece en la parte superior bajo "Your userID for use in API calls is XXXXXXX"

#### Para bibliotecas de grupo:
1. Ve a [https://www.zotero.org/groups/](https://www.zotero.org/groups/)
2. Haz clic en el grupo que deseas usar
3. La URL será algo como: `https://www.zotero.org/groups/XXXXXX/nombre-del-grupo`
4. El número después de `/groups/` es tu Group ID

### 3. Configurar en Cronaurus

1. En el panel de control, despliega la sección **"Integración con Zotero"**
2. Ingresa tu **API Key** en el campo correspondiente
3. Selecciona el **Tipo de Biblioteca**: Usuario o Grupo
4. Ingresa tu **User ID** o **Group ID**
5. Selecciona el **Estilo de Cita** preferido (APA, MLA, Chicago, Harvard)
6. Haz clic en **"Guardar Configuración"**
7. Opcionalmente, haz clic en **"Probar Conexión"** para verificar que todo funciona

## 📖 Uso

### Importar citas a un concepto

1. Abre el **Editor de Conceptos (SKOS)**
2. En la sección **"Referencias y Medios"**, encontrarás el campo **"Citas"**
3. Haz clic en el botón **"📚 Zotero"** junto al campo de citas
4. Se abrirá un modal de búsqueda

### Buscar en tu biblioteca

1. En el campo de búsqueda, escribe palabras clave (título, autor, etc.)
2. Presiona **Enter** o haz clic en **"🔍 Buscar"**
3. Aparecerán los resultados de tu biblioteca
4. Haz clic en los items que deseas agregar (se marcarán en azul)
5. Puedes seleccionar múltiples items
6. Haz clic en **"Agregar Seleccionadas (N)"**
7. Las citas se agregarán automáticamente al campo, cada una en una línea

### Búsqueda vacía

- Si dejas el campo de búsqueda vacío y presionas buscar, se mostrarán los últimos 50 items de tu biblioteca

## 🎨 Estilos de Cita Soportados

- **APA** (American Psychological Association)
- **MLA** (Modern Language Association)
- **Chicago** (Chicago Manual of Style)
- **Harvard** (Harvard Referencing System)

## 💾 Almacenamiento

- Tu configuración (API Key, Library ID, estilo) se guarda localmente en tu navegador
- No necesitas volver a ingresarla cada vez que uses la aplicación
- La configuración es específica de cada navegador/dispositivo

## 🔒 Seguridad

- El API Key se almacena localmente en tu navegador (localStorage)
- Nunca se envía a ningún servidor excepto a la API oficial de Zotero
- Recomendamos usar un API Key de **solo lectura** (Read Only)
- Puedes revocar el acceso en cualquier momento desde [tu cuenta de Zotero](https://www.zotero.org/settings/keys)

## ⚠️ Solución de Problemas

### "API Key inválida o sin permisos suficientes"
- Verifica que copiaste el API Key correctamente (sin espacios)
- Asegúrate de haber marcado "Allow library access" al crear la key
- Intenta regenerar el API Key en Zotero

### "Library ID no encontrado"
- Verifica que el ID sea correcto (solo números)
- Si usas biblioteca de grupo, asegúrate de tener acceso al grupo
- Comprueba que seleccionaste el tipo correcto (Usuario vs Grupo)

### "No se encontraron resultados"
- Verifica que tu biblioteca de Zotero tenga items
- Intenta una búsqueda más amplia o déjala vacía
- Asegúrate de estar buscando en la biblioteca correcta

### Las citas no se formatean correctamente
- La API de Zotero puede tener problemas temporales con el formateo
- El sistema usa un formato alternativo automático si falla la API
- Puedes editar manualmente las citas después de importarlas

## 📚 Recursos Adicionales

- [Documentación de Zotero API](https://www.zotero.org/support/dev/web_api/v3/start)
- [Gestión de API Keys en Zotero](https://www.zotero.org/settings/keys)
- [Estilos de Cita en Zotero](https://www.zotero.org/styles)

## 🆕 Características Futuras

- [ ] Importación masiva de múltiples bibliotecas
- [ ] Sincronización automática con Zotero
- [ ] Soporte para notas y etiquetas de Zotero
- [ ] Exportación de conceptos a Zotero
- [ ] Búsqueda avanzada con filtros

---

**Nota**: Esta integración utiliza la API pública v3 de Zotero. Requiere una conexión a internet activa para funcionar.
