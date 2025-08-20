# Editor de Tesauros

Esta es una aplicación web para crear y gestionar tesauros de forma interactiva.

## Características

- **Autenticación de Usuarios:** Sistema de inicio de sesión y registro para que cada usuario pueda gestionar sus propios tesauros.
- **Gestión de Múltiples Tesauros:** Cada usuario puede crear, renombrar y eliminar múltiples tesauros.
- **Editor Visual de Grafos:** Interfaz visual para añadir, editar y eliminar términos y sus relaciones.
- **Tipos de Relaciones:** Soporta relaciones jerárquicas (BT/NT), de sinonimia (UF) y asociativas (RT).
- **Búsqueda en Tiempo Real:** Resalta términos en el grafo a medida que escribes.
- **Importación y Exportación:** Guarda y carga tesauros en formato JSON.

## Cómo Empezar

1.  **Registro:** Crea una nueva cuenta en la página de registro.
2.  **Inicio de Sesión:** Inicia sesión con tu correo y contraseña.
3.  **Crea tu Primer Tesauro:** Una vez dentro, crea un nuevo tesauro dándole un nombre.
4.  **Añade Términos:** Empieza a añadir términos a tu tesauro.
5.  **Crea Relaciones:** Conecta los términos usando los diferentes tipos de relaciones.
6.  **Explora:** Navega por tu tesauro visualmente.

## Despliegue

Para desplegar esta aplicación, necesitas:

1.  Un proyecto de Supabase.
2.  Las tablas y políticas de seguridad definidas en los archivos `supabase_migration_v2.sql` y `supabase_migration_v3.sql`.
3.  Reemplazar la URL y la `anon key` de Supabase en los archivos `script.js` y `auth.js`.
4.  Servir los archivos `index.html`, `login.html`, `register.html`, `style.css`, `script.js` y `auth.js` desde un servidor web.
