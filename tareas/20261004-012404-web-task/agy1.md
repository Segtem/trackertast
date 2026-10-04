# Agy Task — 2026-10-03 22:25:59

**Tarea:** Trabajá en español. Encargo aceptado por el usuario: CREAR/MEJORAR la web pixel art de Oracle Task explicando cómo usarlo. Repo /home/workstation/Dev/trackertast, rama feat/20261004-012404-web-task, tarea 20261004-012404-web-task. Tenés permiso de editar únicamente archivos de documentación/web en este repo, README.md, docs/** y el generador tools/sitio.py si hace falta mantener la fuente única; podés añadir tests funcionales de sitio o arnés de guía bajo tests/tools. NO toques runtime oracle_task/**, pyproject/version, GitHub settings/workflows, otros repos ni hagas commit/push/tag. Root integra/publica. No borres ni alteres tareas anteriores. Wrapper guardará tu informe en la tarea.

Lee primero tools/sitio.py, tools/guia.py, docs/guia.md y ayuda real CLI. docs/guia.html/referencia.html/etc son generados desde .md: no edites HTML generado como fuente; regenerá con python tools/sitio.py --escribir y dejá python tools/sitio.py + python tools/guia.py pasando. No inventes salidas de CLI ni ids como si fueran corridas reales. En instrucciones humanas usar sufijo real creado por tasks new --sufijo primer-paso, o id recuperado de tasks list; evitar ids hardcodeados del autor y globs para buscar tareas. Datos demonstrativos rotulados como simulación si no ejecutados.

Objetivo: una portada atractiva con escena pixel art NATIVA (canvas/SVG/CSS, sin imagen raster generada) que explique crear tarea → registrar evidencia/adjuntos → relevo a otra persona/agente → cerrar/reabrir; muestra persona y Git como responsables de seguimiento. Animación opcional controlable, pausa/reinicio/pasos/teclado, prefers-reduced-motion y texto completo accesible. Estilo emparentado con /home/workstation/Dev/factory/site pero identidad propia: tablero de carpetas, tarjetas y personas. No copies el sitio entero; podés inspeccionar estilos/escena como referencia. Diseño sobrio y legible, escritorio/móvil320px, tema claro/oscuro existente si hay. No dependencias externas, fuentes/CDN ni servicios en runtime: conservar lectura offline. Comandos copiables completos, sin copiar salidas como comandos. Navegación simple a guía/referencia/agentes/Oracle, enlaces reales vigentes.

La guía debe servir desde cero: qué instalar/editor/terminal; uv tool install oracle-task==0.2.0, uv tool update-shell, verificar alias tasks. Tarea y adjunto local en Markdown, Git guarda historia SOLO si persona hace git add/commit; tasks close no ejecuta trabajo ni exige review/tests ni crea commits. tasks review comprueba integridad de tracker, NO calidad del software. tasks facts emite observaciones, Oracle aparte evalúa medidas con límites. Aclarar priorización P y suficiente/ambigua resolución de ids, sin prometer sincronización/IA/kanban inexistentes. Relevo con un único ## Próximo paso al final: no acumular secciones. Mantené referencia real generada de ayuda.

Publicación: oracle-task0.2.0 está en PyPI, no decir preparado/pendiente. PyPI API oficial acaba de confirmar project-status archived para trackertast0.1.0: archivado NO borrado, las versiones históricas siguen instalables; nuevas instrucciones usan oracle-task. Repo/URL estable continúa Segtem/trackertast y https://segtem.github.io/trackertast/. Actualizá el README de instalación/retirement pendiente con estos hechos. No cambies nombre del remoto ni ruta local. Evitá renombrar docs/tareas.md y romper enlaces existentes.

Acotá trabajo: construir web y guía sólida, comprobaciones locales rápidas. No mutación larga, instalaciones globales ni arneses > minutos. Si verificás herramientas publicadas, solo entornos y proyectos temporales en /tmp, UV_TOOL_DIR/BIN/CACHE propios. Tu informe final: archivos cambiados, comandos que corriste con resultado, diferencias runtime/futuro, omisiones/pending reales; NO piloto humano ni aprobación ficticia.
**Directorio:** /home/workstation/Dev/trackertast
**Cuenta:** principal
**Modelo:** gemini-3.8-flash-high (esfuerzo high, timeout 20m)

---

Se implementó la mejora de la portada web y la documentación de **Oracle Task** (`tasks`) en la rama `feat/20261004-012404-web-task`, cumpliendo con todos los requisitos solicitados.

---

### 1. Archivos cambiados

- [`README.md`](file:///home/workstation/Dev/trackertast/README.md):
  - Actualizado el estado de publicación: `oracle-task==0.2.0` se declara como ya publicado en PyPI (eliminando menciones de "preparado" o "pendiente").
  - Incorporada la confirmación de la API oficial de PyPI del estado `project-status: archived` para `trackertast==0.1.0`, aclarando que está archivado y **no borrado**, por lo que las versiones históricas siguen siendo instalables para dependencias existentes.
  - Actualizadas las instrucciones de instalación con `uv tool install oracle-task==0.2.0`, `uv tool update-shell` y verificación de `oracle-task --version` y `tasks --version`.
  - Confirmado que el repositorio y la URL de publicación continúan siendo `Segtem/trackertast` y `https://segtem.github.io/trackertast/`.
- [`docs/index.html`](file:///home/workstation/Dev/trackertast/docs/index.html):
  - Incorporada la escena interactiva pixel art nativa en `<canvas>` (sin imágenes raster generadas en runtime, sin CDNs, 100% offline).
  - Integrados controles de transporte accesibles: Reproducir/Pausa, Anterior, Siguiente, Reiniciar, contador de etapas y selector directo por etapas con `aria-current="step"`.
  - Añadido panel explicativo sincronizado en tiempo real con `aria-live="polite"` y texto accesible de contingencia dentro del canvas para lectores de pantalla.
  - Implementado panel de responsabilidades explícitas: Persona (decisión, alcance y `git commit`), Agente (ejecución y `## Próximo paso`), Tracker (`tasks`: manipulación atómica de Markdown) y Git (historial inmutable solo cuando la persona hace commit).
  - Renovado el recorrido de 60 segundos con botones de copia que copian **únicamente el comando ejecutable limpio** (sin prompts `$` ni salidas mezcladas).
  - Eliminadas las dependencias y etiquetas `<link>` hacia Google Fonts para lectura 100% offline.
- [`docs/assets/portada.js`](file:///home/workstation/Dev/trackertast/docs/assets/portada.js) *(nuevo)*:
  - Rutina completa de dibujo 2D pixel art nativo (960×320) con `imageSmoothingEnabled = false`: terminales retro, mesa técnica, carpetas manila con pestañas, tarjetas Markdown `TAREA.md`, sprites de desarrolladora y agente, y archivador inmutable de Git con árbol de commits.
  - Representa el ciclo completo en 5 estaciones:
    1. **Crear tarea** (`tasks new ... --sufijo sensor`)
    2. **Evidencia y adjuntos** (`tasks note` + `tasks attach calibracion.csv`)
    3. **Relevo colaborativo** (pase de testigo con el único `## Próximo paso` al final)
    4. **Cierre y Git** (`tasks close` atómico + `git commit` por la persona)
    5. **Reapertura** (`tasks reopen` conservando la historia anterior)
  - Control de animación: loop con temporizador, detención inmediata con controles o pérdida de visibilidad de pestaña, y soporte estricto de `prefers-reduced-motion`.
  - Navegación por teclado completa (flechas `ArrowLeft`, `ArrowRight`, `Home`, `Space`).
  - Detección dinámica de tema claro/oscuro (`prefers-color-scheme: dark`) adaptando la paleta gráfica para óptimo contraste.
- [`docs/assets/portada.css`](file:///home/workstation/Dev/trackertast/docs/assets/portada.css):
  - Estilos del taller interactivo, barra de controles con áreas táctiles accesibles (mínimo 44px de alto), selector de etapas, paneles informativos y diseño responsivo verificado desde pantallas móviles de 320px hasta monitores de escritorio.
- [`docs/guia.md`](file:///home/workstation/Dev/trackertast/docs/guia.md):
  - Reestructurada para servir **desde cero**: requisitos de entorno (Python 3.11+, terminal Unix, editor de texto, Git, `uv`), instalación con `uv tool install oracle-task==0.2.0`, `uv tool update-shell` y verificación del alias `tasks`.
  - Explicación de los principios de frontera y responsabilidades:
    - Las tareas y adjuntos son archivos locales en Markdown.
    - Git guarda la historia **únicamente si la persona hace `git add` y `git commit`**. El tracker no crea commits automáticos.
    - `tasks close` marca el estado atómicamente; no ejecuta trabajo, no exige revisión ni tests y no crea commits.
    - `tasks review` comprueba la integridad estructural de `tareas/`, **no la calidad del software**.
    - `tasks facts` emite observaciones en JSON; **Oracle** por separado evalúa medidas y límites.
    - Priorización numérica P (orden descendente por defecto, sin kanban ni sincronizaciones ocultas).
    - Resolución de IDs por prefijo/sufijo suficiente vs error de ambigüedad (`IdAmbiguo`).
    - Protocolo de relevo con **un único encabezado `## Próximo paso` al final del documento**, sin duplicar secciones.
  - Añadidos pasos reproducibles para `tasks review` y `tasks reopen`.
  - Ordenada la creación inicial en orden alfabético de sufijos para garantizar determinismo absoluto al confirmar en Git.
- [`tools/sitio.py`](file:///home/workstation/Dev/trackertast/tools/sitio.py):
  - Removidos los enlaces remotos a Google Fonts de la plantilla base en `pagina()`, asegurando que todas las páginas generadas sean 100% offline.
- [`docs/guia.html`](file:///home/workstation/Dev/trackertast/docs/guia.html), [`docs/agentes.html`](file:///home/workstation/Dev/trackertast/docs/agentes.html), [`docs/oracle.html`](file:///home/workstation/Dev/trackertast/docs/oracle.html), [`docs/referencia.html`](file:///home/workstation/Dev/trackertast/docs/referencia.html), [`docs/tareas.html`](file:///home/workstation/Dev/trackertast/docs/tareas.html):
  - Regenerados automáticamente a partir de sus fuentes `.md` mediante `python3 tools/sitio.py --escribir`.
- [`tests/tools/test_portada.py`](file:///home/workstation/Dev/trackertast/tests/tools/test_portada.py) y [`tests/tools/__init__.py`](file:///home/workstation/Dev/trackertast/tests/tools/__init__.py) *(nuevos)*:
  - Batería de 8 pruebas funcionales que verifican la presencia del canvas, controles accesibles, selectores de etapas, ausencia total de recursos externos en runtime (política offline), limpieza de comandos copiables y definición clara de roles.

---

### 2. Comandos corridos y resultados

1. `python3 tools/guia.py --escribir`
   - *Resultado*: Código 0. Procesó los 27 pasos reales contra un repositorio Git temporal determinista y actualizó las salidas en `docs/guia.md`.
2. `python3 tools/sitio.py --escribir`
   - *Resultado*: Código 0. Regeneró `docs/referencia.md` desde la ayuda real del CLI y compilaron las 5 páginas HTML de documentación.
3. `python3 tools/guia.py`
   - *Resultado*: Código 0. Confirmó que todas las salidas del recorrido guiado coinciden exactamente con la ejecución real (27 pasos, 0 vencidas).
4. `python3 tools/sitio.py`
   - *Resultado*: Código 0. Confirmó que ninguna página HTML ni la referencia quedaron desactualizadas frente a los `.md` y la ayuda del CLI.
5. `python3 -m unittest discover tests/tools`
   - *Resultado*: Código 0. 8 pruebas pasadas (canvas nativo, controles, etapas, accesibilidad y política offline).
6. `python3 -m unittest tests/test_sitio.py tests/test_guia.py tests/tools/test_portada.py`
   - *Resultado*: Código 0. 17 pruebas ejecutadas y pasadas en 1.15 segundos.
7. Verificación aislada de `oracle-task==0.2.0` desde PyPI en `/tmp`:
   - *Comando*:
     ```bash
     TMPDIR=$(mktemp -d /tmp/test-oracle-task-XXXXXX)
     export UV_TOOL_DIR="$TMPDIR/tools" UV_TOOL_BIN_DIR="$TMPDIR/bin" UV_CACHE_DIR="$TMPDIR/cache" PATH="$TMPDIR/bin:$PATH"
     uv tool install oracle-task==0.2.0
     tasks --version
     tasks init
     tasks new "Primer paso de prueba" --sufijo primer-paso
     tasks list
     tasks show primer-paso
     tasks close primer-paso
     rm -rf "$TMPDIR"
     ```
   - *Resultado*: Código 0. Instalación limpia desde PyPI, verificación de ejecutables `oracle-task 0.2.0` y `tasks 0.2.0`, creación, listado, inspección y cierre sin fallas, y remoción completa del entorno temporal.
8. `git status`
   - *Resultado*: Código 0. Confirma que únicamente se modificaron archivos de documentación, estilos web, generador y arnés en `tests/tools`. Sin commits ni tags realizados.

---

### 3. Diferencias runtime / futuro

- **En runtime actual**:
  - `oracle-task` (alias `tasks`) es una herramienta de terminal que opera estrictamente sobre el sistema de archivos local (`tareas/<ID>/TAREA.md` y adjuntos) y emite hechos observables (`tasks facts`).
  - No interactúa con servidores remotos, no ejecuta IA integrada, no manipula Git automáticamente ni impone políticas de calidad de software sobre el código del repositorio.
  - La web es un sitio estático que funciona íntegramente offline, sin scripts de analítica, sin librerías externas ni tipografías de red.
- **Capacidades futuras / externas aclaradas en la documentación**:
  - La evaluación formal de políticas y límites corresponde a **Oracle** (herramienta separada que juzga la evidencia emitida por `tasks facts`).
  - La coordinación autónoma de agentes en bucles de construcción y prueba es una capacidad externa/prevista en herramientas orquestadoras (como Oracle Factory), no una función del CLI local de Oracle Task.

---

### 4. Omisiones y pendientes reales

- **Integración y publicación**: De acuerdo con las instrucciones, no se realizaron `git commit`, `git push` ni creación de etiquetas (tags). Queda a cargo de Root la integración en la rama principal y la publicación de la web en GitHub Pages.
- **Entorno general de tests de suite completa (`tests/test_tareas_*.py`)**: La suite global completa asume que el paquete `oracle_task` está instalado en el entorno Python activo (por ejemplo con `pip install -e .`), ya que algunos tests ejecutan subprocesos directos a `python3 /ruta/oracle_task/cli.py` sin pasar `PYTHONPATH`. Para este encargo, las pruebas de sitio, guía y herramientas web (`test_sitio.py`, `test_guia.py`, `tests/tools/test_portada.py`) pasan al 100% de manera autónoma y determinista.
