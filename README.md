# Cronaurus - Editor de Tesauros

Inspirado en la figura lúdica y creativa del Cronopio de Cortázar, **Cronaurus** nace como una herramienta que desafía las estructuras rígidas del conocimiento. Así como los cronopios, que viven al margen de las convenciones, este editor de tesauros busca ofrecer una forma flexible y potente de organizar la información.

Construido sobre el estándar **SKOS (Simple Knowledge Organization System)**, un lenguaje del W3C para representar tesauros, sistemas de clasificación y otros vocabularios controlados, Cronaurus se presenta como una herramienta fundamental para investigadores y profesionales de cualquier disciplina. Permite estructurar la terminología de manera formal, facilitando la construcción de vocabularios consistentes y redes semánticas que son cruciales para la investigación, el análisis de datos y la gestión del conocimiento.

## Características

- **Autenticación de Usuarios:** Funcionalidad segura de registro e inicio de sesión de usuarios.
- **Gestión de Tesauros:** Crea, renombra y elimina múltiples tesauros.
- **Edición de Conceptos Basada en SKOS:**
  - **Etiquetas Preferidas, Alternativas y Ocultas:** Define múltiples etiquetas para cada concepto.
  - **Notas de Documentación:** Añade definiciones, notas de alcance y ejemplos.
  - **Relaciones Semánticas:** Establece conexiones entre conceptos (más amplios, más específicos, relacionados).
- **🕰️ Dimensión Temporal (4ª Dimensión):** ⭐ **NUEVO**
  - **Línea de Tiempo Interactiva:** Navega por la historia de tus conceptos con un slider temporal (1950-2030+).
  - **Animación Temporal:** Observa la evolución de tu tesauro año por año con controles play/pause.
  - **Filtrado Dinámico:** Los conceptos aparecen y desaparecen según su marco temporal.
  - **Historicidad de Relaciones:** Define cuándo fueron relevantes las conexiones entre conceptos.
  - **Visualización Evolutiva:** Grosor y opacidad variables basados en la relevancia temporal.
- **Visualización Interactiva:** Un grafo dinámico e interactivo de la estructura del tesauro impulsado por D3.js.
- **Búsqueda:** Encuentra y resalta conceptos rápidamente dentro de la visualización.
- **Importar/Exportar:**
  - Exporta tesauros a un formato JSON basado en SKOS.
  - Importa tesauros desde un archivo JSON.
- **Exportación a PDF:** Genera un resumen completo en PDF de tu tesauro, incluyendo todos los conceptos y sus detalles.

## Tecnologías Utilizadas

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - [D3.js](https://d3js.org/) para visualización de datos.
  - [SweetAlert2](https://sweetalert2.github.io/) para notificaciones amigables.
  - [jsPDF](https://github.com/parallax/jsPDF) y [html2canvas](https://html2canvas.hertzen.com/) para la generación de PDF.
- **Backend:**
  - [Supabase](https://supabase.io/) para la base de datos y autenticación.

## Estructura del Proyecto

```
.
├── .gitignore
├── auth.js
├── final_migration.sql
├── index.html
├── main.html
├── README.md
├── register.html
├── script.js
├── style.css
├── TEMPORAL_DIMENSION_GUIDE.md    # 📘 Guía completa de la dimensión temporal
└── IMPLEMENTATION_SUMMARY.md      # 📋 Resumen técnico de implementación
```

- **`index.html`**: La página de inicio de sesión.
- **`register.html`**: La página de registro de usuarios.
- **`main.html`**: La interfaz principal de la aplicación para la edición y visualización de tesauros.
- **`style.css`**: Contiene todos los estilos para la aplicación.
- **`auth.js`**: Maneja la autenticación de usuarios (inicio de sesión y registro) con Supabase.
- **`script.js`**: La lógica principal de la aplicación para la gestión de tesauros, edición de conceptos y visualización con D3.js.
- **`final_migration.sql`**: El script SQL para configurar el esquema de la base de datos en Supabase.
- **`TEMPORAL_DIMENSION_GUIDE.md`**: 📘 Guía detallada para usar la dimensión temporal.
- **`IMPLEMENTATION_SUMMARY.md`**: 📋 Documentación técnica de la implementación temporal.

## Esquema de la Base de Datos

La base de datos está estructurada para seguir el modelo SKOS con extensiones temporales:

- **`thesauruses`**: Almacena los metadatos de cada tesauro.
- **`concepts`**: Representa los conceptos individuales dentro de un tesauro.
  - 🕰️ Incluye campos temporales: `temporal_start`, `temporal_end`, `temporal_relevance`
- **`labels`**: Almacena las etiquetas `prefLabel`, `altLabel` y `hiddenLabel` para cada concepto.
- **`notes`**: Contiene las notas `definition`, `scopeNote` y `example` para cada concepto.
- **`relationships`**: Define las relaciones `broader` (más amplio), `narrower` (más específico) y `related` (relacionado) entre conceptos.
  - 🕰️ Incluye campos temporales: `temporal_start`, `temporal_end`, `temporal_relevance`
- **`categories`**: Organiza conceptos en categorías con colores personalizables.

La Seguridad a Nivel de Fila (RLS) está habilitada en Supabase para asegurar que los usuarios solo puedan acceder y gestionar sus propios tesauros.

## Cómo Empezar

Para ejecutar este proyecto localmente, necesitarás una cuenta de Supabase.

1.  **Clona el repositorio:**
    ```bash
    git clone <repository-url>
    ```
2.  **Configura Supabase:**
    - Crea un nuevo proyecto en Supabase.
    - En el Editor SQL, ejecuta el contenido de `final_migration.sql` para crear las tablas y políticas necesarias.
3.  **Configura la aplicación:**
    - En `auth.js` y `script.js`, reemplaza la URL y la clave anónima (anon key) de Supabase con las credenciales de tu propio proyecto:
      ```javascript
      const SUPABASE_URL = "YOUR_SUPABASE_URL";
      const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
      ```
4.  **Abre la aplicación:**
    - Abre el archivo `index.html` en tu navegador web para iniciar la aplicación.

## Cómo Usar

1.  **Regístrate e Inicia Sesión:** Crea una cuenta e inicia sesión para acceder a la aplicación principal.
2.  **Crea un Tesauro:** Desde el panel principal, crea un nuevo tesauro.
3.  **Añade Conceptos:** Usa el formulario "Editor de Conceptos (SKOS)" para añadir nuevos conceptos con sus etiquetas y notas.
4.  **Define Temporalidad:** 🕰️ Establece el año de inicio, fin y relevancia temporal para cada concepto.
5.  **Crea Relaciones:** Selecciona conceptos en los menús desplegables para definir sus relaciones.
6.  **Añade Historicidad a Relaciones:** 🕰️ Haz clic derecho en las aristas del grafo para editar su marco temporal.
7.  **Visualiza:** Observa cómo crece tu tesauro en el grafo interactivo.
8.  **Explora en el Tiempo:** 🕰️ Usa el slider temporal en la parte inferior para navegar por la historia de tu tesauro.
9.  **Anima la Evolución:** 🕰️ Presiona el botón Play para ver cómo evoluciona tu red de conceptos año por año.
10. **Exporta:** Guarda tu trabajo exportándolo a JSON o generando un resumen en PDF.

### 🕰️ Guía de la Dimensión Temporal

Para aprender a usar todas las características de la dimensión temporal, consulta la [Guía de la Dimensión Temporal](TEMPORAL_DIMENSION_GUIDE.md) que incluye:
- Tutorial paso a paso
- Ejemplos de casos de uso
- Configuración avanzada
- Solución de problemas
- Mejores prácticas

## Licencia

Este trabajo está licenciado bajo una [Licencia Creative Commons Atribución-NoComercial 4.0 Internacional](http://creativecommons.org/licenses/by-nc/4.0/).

**Usted es libre de:**

*   **Compartir** — copiar y redistribuir el material en cualquier medio o formato.
*   **Adaptar** — remezclar, transformar y construir sobre el material.

**Bajo los siguientes términos:**

*   **Atribución** — Debe dar crédito de manera adecuada, brindar un enlace a la licencia, e indicar si se han realizado cambios. Puede hacerlo en cualquier forma razonable, pero no de forma tal que sugiera que usted o su uso tienen el apoyo de la persona licenciante.
*   **NoComercial** — No puede utilizar el material para una finalidad comercial.

Para consultas sobre una licencia comercial, por favor contacte a Fernando Mora Ángel en: fernando.mora@udea.edu.co.
