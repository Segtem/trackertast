# Guía paso a paso de oracle-task

Esta guía recorre el ciclo completo de uso de **oracle-task** (`tasks`), explicando cómo comenzar desde cero, cómo se organizan las tareas en Markdown y cómo personas y agentes colaboran sin perder contexto ni depender de servicios externos.

`oracle-task` es el comando principal y `tasks` su alias liviano y compatible.

## Empezar desde cero: qué instalar y verificar

Para usar Oracle Task necesitás un entorno estándar de desarrollo:

1. **Python 3.11 o posterior**: Oracle Task no tiene dependencias de ejecución externas y utiliza exclusivamente la biblioteca estándar de Python.
2. **Terminal**: una ventana para escribir comandos. Abrí PowerShell desde Inicio en Windows, Terminal en macOS o la aplicación Terminal en Linux. El recorrido avanzado de esta página usa sintaxis de bash/zsh; en Windows podés usar WSL para esos bloques. Los comandos básicos de tasks funcionan también en PowerShell.
3. **Editor de texto plano**: por ejemplo [Visual Studio Code](https://code.visualstudio.com/download), para leer y modificar Markdown. No uses Word. Elegí Archivo → Abrir carpeta para abrir el proyecto. En Windows activá las extensiones de nombre de archivo: evitá TAREA.md.txt. Guardá como texto UTF-8.
4. **Git**: instalalo desde [su página oficial](https://git-scm.com/install/) si querés conservar historia y compartir el proyecto. El tracker puede crear tareas sin Git; los pasos de seguimiento del historial necesitan un repositorio Git.
5. **Herramienta de instalación (`uv`)**: recomendamos [`uv`](https://docs.astral.sh/uv/) por su velocidad y aislamiento.

### Instalá uv primero

La [guía oficial de uv](https://docs.astral.sh/uv/getting-started/installation/) describe todas las opciones. En macOS/Linux, desde Terminal:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

En Windows, desde PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Cerrá y abrí otra terminal; `uv --version` debe imprimir una versión. Si tu Linux no tiene curl, consultá la alternativa wget de esa guía oficial. Pegá una línea, presioná Enter y esperá a que termine; resolvé cualquier error antes de seguir.

### Instalación de la herramienta

Instalá la versión `0.2.0` de `oracle-task` como herramienta global con `uv`:

```bash
uv python install 3.13
uv tool install --python 3.13 oracle-task==0.2.0
uv tool update-shell
```

`uv tool update-shell` configura el acceso a los comandos en la terminal. Cerrá y abrí otra sesión para aplicar el cambio. Si preferís un entorno virtual tradicional con pip:

```bash
pip install oracle-task==0.2.0
```

### Verificar el comando y el alias `tasks`

Comprobá que el sistema reconozca tanto el ejecutable canónico como su alias:

```bash
oracle-task --version
tasks --version
```

Ambos comandos invocan el mismo programa. En el resto de esta guía utilizaremos el alias `tasks`.

## Principios fundamentales y responsabilidades

Antes de crear la primera tarea, es fundamental comprender qué hace y qué no hace el tracker:

- **Tareas y adjuntos locales en Markdown**: Cada tarea es una subcarpeta dentro del directorio `tareas/`, compuesta por su archivo central `TAREA.md` y sus adjuntos locales (archivos `.csv`, capturas, esquemas, volcados de logs). Todo vive dentro del repositorio y es legible con cualquier editor.
- **Git guarda historia SOLO si la persona hace `git add` y `git commit`**: Oracle Task no crea commits automáticos en Git ni interactúa con servidores remotos en segundo plano. El registro de versiones en el historial de Git es responsabilidad de la persona o de los scripts de integración explícitos del proyecto.
- **`tasks close` no ejecuta trabajo ni exige revisiones**: El comando `tasks close` marca atómicamente el campo `- ESTADO: CERRADA` en `TAREA.md`. No ejecuta tests, no comprueba si el software funciona, no exige aprobaciones ni crea commits en Git. Es un cambio de estado del tracker.
- **`tasks review` comprueba la integridad del tracker, NO la calidad del software**: El comando `tasks review` audita la integridad estructural del directorio `tareas/` (que existan los archivos `TAREA.md`, que las etiquetas y prioridades respeten la especificación y que los enlaces a adjuntos locales apunten a archivos reales existentes). No ejecuta compiladores ni suites de pruebas de tu aplicación.
- **`tasks facts` emite observaciones; Oracle evalúa medidas**: `tasks facts` emite un volcado JSON estructurado con los hechos verificables del repositorio y de las tareas. La evaluación de políticas y límites formales se delega a **Oracle**, una herramienta de evaluación separada.
- **Priorización P**: Las tareas cuentan con un campo de prioridad entera `PRIORIDAD: <n>` (típicamente entre 0 y 100, por defecto 50). `tasks list` ordena por defecto las tareas de mayor a menor prioridad (P80 antes que P70, y P70 antes que P40). La imagen del tablero es explicativa; no hay un tablero kanban ni sincronización en la nube dentro de esta CLI.
- **Resolución suficiente y ambigüedad de IDs**:
  - Un ID canónico de tarea tiene el formato `YYYYMMDD-HHMMSS[-sufijo]` (por ejemplo `20260927-120000-sensor`).
  - Para operar con comandos como `tasks show`, `tasks note` o `tasks close`, podés especificar el ID completo o un prefijo/sufijo suficiente (por ejemplo `sensor`).
  - Si el término coincide con una única tarea, el comando la resuelve exitosamente.
  - Si el término coincide con más de una tarea, el CLI rechaza la operación informando ambigüedad (`IdAmbiguo`), evitando mutar la tarea equivocada.
  - En instrucciones para personas y guías, siempre es conveniente usar un sufijo explícito (`tasks new --sufijo primer-paso`) o el ID exacto obtenido con `tasks list`, evitando patrones glob o IDs arbitrarios.
- **Protocolo de relevo colaborativo**:
  - Al transferir el trabajo entre una persona y un agente (o entre sesiones de agentes), la regla central es mantener **un único encabezado `## Próximo paso` al final de `TAREA.md`**.
  - No deben acumularse múltiples secciones de próximo paso: cada sesión actualiza el contenido de esta única sección describiendo qué falta hacer, registrando los descubrimientos intermedios con `tasks note`.

## Prepará la carpeta para el recorrido

Creá una carpeta vacía y entrá en ella. Estos comandos se usan igual en Terminal o PowerShell:

```bash
mkdir mi-primer-tracker
cd mi-primer-tracker
git init
```

Los siguientes comandos se ejecutan desde esa carpeta. Antes del primer commit, configurá identidad local de Git sustituyendo nombre/correo; no requiere cuenta de GitHub, y esos datos serán visibles si compartís el historial:

```bash
git config user.name "Tu nombre"
git config user.email "tu-correo@example.invalid"
```

Las salidas de abajo se ejecutan en una carpeta temporal en las pruebas: normalizamos fechas, IDs y rutas para que puedan compararse. No copies sus IDs de ejemplo para tus comandos: usá el sufijo único creado en el paso anterior o recuperá el ID con `tasks list`. Comandos y salidas están rotulados por separado. La ejecución completa se verifica en Linux; macOS/Windows todavía requieren ejecución real y no hay piloto con una persona principiante.

## 1. Inicializar el tracker

El comando `tasks init` crea la carpeta `tareas/` y su archivo `README.md` en la raíz del proyecto actual:

```bash paso
tasks init
```
```text salida
Tracker de tareas inicializado en ./tareas
```

## 2. Crear tareas

Creamos tres tareas utilizando `--sufijo` explícito para asignarles nombres memorables y estables:

```bash paso
tasks new "Escribir arnés de prueba" --etiqueta sensor --etiqueta arnes --prioridad 80 --sufijo arnes
```
```text salida
Tarea creada: 20260927-120000-arnes
Ruta: ./tareas/20260927-120000-arnes/TAREA.md
```

```bash paso
tasks new "Corregir fuga en actuador" --etiqueta bug --prioridad 40 --sufijo fuga
```
```text salida
Tarea creada: 20260927-120000-fuga
Ruta: ./tareas/20260927-120000-fuga/TAREA.md
```

```bash paso
tasks new "Diseñar sensor de velocidad" --etiqueta sensor --prioridad 70 --sufijo sensor
```
```text salida
Tarea creada: 20260927-120000-sensor
Ruta: ./tareas/20260927-120000-sensor/TAREA.md
```

## 3. Consultas y filtrado con TQL

El comando `tasks list` (alias `listar` o `ls`) muestra por defecto las tareas abiertas, ordenadas por prioridad descendente:

```bash paso
tasks list
```
```text salida
20260927-120000-arnes  ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
20260927-120000-sensor ABIERTA P70 [sensor]        Diseñar sensor de velocidad
20260927-120000-fuga   ABIERTA P40 [bug]           Corregir fuga en actuador
```

### Filtrar por etiquetas

Podemos usar el prefijo `:etiqueta` para buscar tareas que tengan una etiqueta determinada:

```bash paso
tasks list ":sensor"
```
```text salida
20260927-120000-arnes  ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
20260927-120000-sensor ABIERTA P70 [sensor]        Diseñar sensor de velocidad
```

### Filtrar por prioridad numérica

TQL admite comparadores relacionales en español (`desde`, `hasta`, `mayor`, `menor`, `igual`, `distinto`):

```bash paso
tasks list "prioridad desde 70"
```
```text salida
20260927-120000-arnes  ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
20260927-120000-sensor ABIERTA P70 [sensor]        Diseñar sensor de velocidad
```

### Conectores lógicos: `y`, `o`, `no`

Las expresiones se pueden combinar mediante operadores lógicos:

```bash paso
tasks list ":sensor y prioridad desde 75"
```
```text salida
20260927-120000-arnes ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
```

Conector `o` (disyunción):

```bash paso
tasks list ":bug o :arnes"
```
```text salida
20260927-120000-arnes ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
20260927-120000-fuga  ABIERTA P40 [bug]           Corregir fuga en actuador
```

Operador `no` (negación):

```bash paso
tasks list "no :bug"
```
```text salida
20260927-120000-arnes  ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
20260927-120000-sensor ABIERTA P70 [sensor]        Diseñar sensor de velocidad
```

### Explicar la consulta compilada

La bandera `--explicar` permite ver los tokens analizados y la estructura del árbol de sintaxis abstracta sin consultar el disco:

```bash paso
tasks list ":sensor y prioridad desde 75" --explicar
```
```text salida
TOKENS:
  [0] :sensor
  [8] y
  [10] prioridad
  [20] desde
  [26] 75
COMPILADO:
  (:sensor y (prioridad desde 75))
```

## 4. Detalles y notas de trabajo

Podemos inspeccionar una tarea utilizando su identificador o sufijo con `tasks show` (alias `ver`):

```bash paso
tasks show sensor
```
```text salida
ID:        20260927-120000-sensor
Título:    Diseñar sensor de velocidad
Estado:    ABIERTA
Prioridad: 70
Etiquetas: sensor
Ruta:      ./tareas/20260927-120000-sensor/TAREA.md

(sin descripción adicional)
```

### Registrar notas de avance

A medida que trabajamos, usamos `tasks note` (alias `anotar`) para asentar notas fechadas en UTC en el cuerpo de `TAREA.md`:

```bash paso
tasks note sensor "Medición preliminar en banco de pruebas"
```
```text salida
Nota agregada a la tarea 20260927-120000-sensor
Documento: ./tareas/20260927-120000-sensor/TAREA.md
```

También podemos incorporar enlaces y marcas de posición con `--url` y `--marca`:

```bash paso
tasks note sensor "Hoja de datos del fabricante" --url "https://ejemplo.com/sensor.pdf" --marca "página 12"
```
```text salida
Nota agregada a la tarea 20260927-120000-sensor
Documento: ./tareas/20260927-120000-sensor/TAREA.md
```

## 5. Adjuntar evidencia local

El comando `tasks attach` (alias `adjuntar`) copia archivos locales dentro de la carpeta de la tarea y genera el enlace relativo en `TAREA.md`:

```bash paso
echo "v,rpm\n0,0\n10,100" > calibracion.csv
tasks attach sensor calibracion.csv
```
```text salida
Archivo adjuntado a la tarea 20260927-120000-sensor
Ruta:      ./tareas/20260927-120000-sensor/calibracion.csv
Documento: ./tareas/20260927-120000-sensor/TAREA.md
```

## 6. Búsqueda en notas y documentos

El comando `tasks search` (alias `buscar`) realiza búsquedas de texto literal e insensible a mayúsculas en todas las tareas y notas del tracker:

```bash paso
tasks search "calibracion"
```
```text salida
tareas/20260927-120000-sensor/TAREA.md:16: - Adjunto: [calibracion.csv](calibracion.csv)
```

## 7. Referencias cruzadas y grafo

Cuando una tarea depende de otra o la menciona, agregamos su identificador al cuerpo. Documentamos que el arnés depende del sensor:

```bash paso
tasks note arnes "Bloqueado por 20260927-120000-sensor"
```
```text salida
Nota agregada a la tarea 20260927-120000-arnes
Documento: ./tareas/20260927-120000-arnes/TAREA.md
```

### Buscar menciones con `tasks refs`

El comando `tasks refs` (alias `referencias`) localiza todas las menciones textuales del ID canónico en las tareas y en el código del proyecto:

```bash paso
tasks refs sensor
```
```text salida
Referencias encontradas para «20260927-120000-sensor»:
tareas/20260927-120000-arnes/TAREA.md:9: Bloqueado por 20260927-120000-sensor
```

### Visualizar dependencias con `tasks graph`

El comando `tasks graph` (alias `grafo`) construye el grafo dirigido de referencias existentes entre las tareas del tracker en formato DOT (Graphviz):

```bash paso
tasks graph
```
```text salida
digraph tareas {
  "20260927-120000-arnes" [label="Escribir arnés de prueba (ABIERTA)"];
  "20260927-120000-sensor" [label="Diseñar sensor de velocidad (ABIERTA)"];
  "20260927-120000-arnes" -> "20260927-120000-sensor";
}
```

## 8. Revisar la integridad del tracker con `tasks review`

Antes de confirmar en Git o compartir el repositorio, `tasks review` (alias `revisar`) comprueba la validez estructural de todas las tareas bajo `tareas/`:

```bash paso
tasks review
```
```text salida
REVISIÓN OK: 3 tarea(s) válida(s) en ./tareas
```

> **Recordatorio:** `tasks review` audita la integridad estructural del tracker (archivos `TAREA.md`, metadatos y adjuntos locales); **no evalúa la calidad del software**, ni si el código compila ni si las pruebas del proyecto pasan.

## 9. Seguimiento con Git

El comando `tasks follow` (alias `seguimiento`) audita el estado de todos los archivos del tracker frente al índice y a `HEAD` de Git.

Antes de confirmar en Git, los archivos figuran como `sin_seguimiento`:

```bash paso
tasks follow
```
```text salida
Repositorio: . · HEAD: sin commits
  sin_seguimiento: tareas/20260927-120000-arnes/TAREA.md (índice=False, HEAD=False, XY=??)
  sin_seguimiento: tareas/20260927-120000-fuga/TAREA.md (índice=False, HEAD=False, XY=??)
  sin_seguimiento: tareas/20260927-120000-sensor/TAREA.md (índice=False, HEAD=False, XY=??)
  sin_seguimiento: tareas/20260927-120000-sensor/calibracion.csv (índice=False, HEAD=False, XY=??)
  sin_seguimiento: tareas/README.md (índice=False, HEAD=False, XY=??)
```

Confirmamos las tareas en Git y volvemos a verificar:

```bash paso
git add tareas/
git commit -m "docs: registrar tareas iniciales"
tasks follow
```
```text salida
[main (root-commit) <commit>] docs: registrar tareas iniciales
 5 files changed, 36 insertions(+)
 create mode 100644 tareas/20260927-120000-arnes/TAREA.md
 create mode 100644 tareas/20260927-120000-fuga/TAREA.md
 create mode 100644 tareas/20260927-120000-sensor/TAREA.md
 create mode 100644 tareas/20260927-120000-sensor/calibracion.csv
 create mode 100644 tareas/README.md
Repositorio: . · HEAD: <commit>
  sin_cambios: tareas/20260927-120000-arnes/TAREA.md (índice=True, HEAD=True, XY=  )
  sin_cambios: tareas/20260927-120000-fuga/TAREA.md (índice=True, HEAD=True, XY=  )
  sin_cambios: tareas/20260927-120000-sensor/TAREA.md (índice=True, HEAD=True, XY=  )
  sin_cambios: tareas/20260927-120000-sensor/calibracion.csv (índice=True, HEAD=True, XY=  )
  sin_cambios: tareas/README.md (índice=True, HEAD=True, XY=  )
```

Ahora todos los documentos figuran como `sin_cambios` e integrados en `HEAD`.

## 10. Resumen, cierre y reapertura de tareas

Podemos obtener un censo rápido del estado del tracker con `tasks summary` (alias `resumen`):

```bash paso
tasks summary
```
```text salida
Resumen del tracker de tareas (./tareas):
  Total tareas: 3
  Abiertas:     3
  Cerradas:     0
  Sin etiquetas: 0
  Etiquetas:
    · arnes: 1
    · bug: 1
    · sensor: 2
```

### Cerrar una tarea con `tasks close`

Cuando el trabajo de una tarea termina, la marcamos como `CERRADA` mediante `tasks close` (alias `cerrar`):

```bash paso
tasks close fuga
```
```text salida
Tarea cerrada: 20260927-120000-fuga
```

El listado completo con `--todas` muestra tareas abiertas y cerradas:

```bash paso
tasks list --todas
```
```text salida
20260927-120000-arnes  ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
20260927-120000-sensor ABIERTA P70 [sensor]        Diseñar sensor de velocidad
20260927-120000-fuga   CERRADA P40 [bug]           Corregir fuga en actuador
```

### Reabrir una tarea con `tasks reopen`

Si un defecto reaparece o se descubre trabajo pendiente, `tasks reopen` (alias `reabrir`) restaura el estado a `ABIERTA` de forma atómica:

```bash paso
tasks reopen fuga
```
```text salida
Tarea reabierta: 20260927-120000-fuga
```

Volvemos a cerrarla para concluir el ejemplo:

```bash paso
tasks close fuga
```
```text salida
Tarea cerrada: 20260927-120000-fuga
```

## 11. Hechos observables y evaluación con Oracle

Para auditar el estado del tracker o integrarlo en flujos de verificación continua, `tasks facts` (alias `hechos`) emite una representación relacional en JSON:

```bash
tasks facts --git
```

El comando extrae hechos observables (tareas abiertas y cerradas, referencias a adjuntos, commits enlazados). **Oracle**, de manera separada, evalúa esos hechos contra un catálogo formal de políticas y límites (por ejemplo, comprobar que ningún commit apunte a una tarea inexistente o que toda tarea cerrada tenga su commit de cierre). El tracker emite los hechos; Oracle evalúa las reglas.
