# Referencia del CLI (tasks)

El comando principal de **trackertast** es `tasks`. Los verbos canónicos son en inglés, con alias en español para mantener compatibilidad.

## Resumen de comandos

| Canónico | Alias | Descripción |
|---|---|---|
| [`init`](#tasks-init) | — | Inicializa el tracker de tareas en tareas/ |
| [`new`](#tasks-new) | `nueva` | Crea una nueva tarea con plantilla lista |
| [`list`](#tasks-list) | `listar`, `ls` | Lista tareas del proyecto (alias: listar, ls) |
| [`show`](#tasks-show) | `ver` | Muestra detalles de una tarea o su ruta |
| [`close`](#tasks-close) | `cerrar` | Marca una tarea como CERRADA de forma atómica |
| [`reopen`](#tasks-reopen) | `reabrir` | Marca una tarea como ABIERTA de forma atómica |
| [`review`](#tasks-review) | `revisar` | Audita la integridad del directorio tareas/ |
| [`note`](#tasks-note) | `anotar` | Agrega una nota, URL o marca temporal a una tarea existente |
| [`attach`](#tasks-attach) | `adjuntar` | Copia un adjunto al directorio de la tarea y lo vincula en TAREA.md |
| [`search`](#tasks-search) | `buscar` | Busca texto de forma literal e insensible a mayúsculas en tareas y notas |
| [`refs`](#tasks-refs) | `referencias` | Busca menciones textuales del ID canónico en tareas, notas y código del proyecto |
| [`summary`](#tasks-summary) | `resumen` | Muestra cantidades agregadas por estado y etiquetas a partir de registros válidos |
| [`follow`](#tasks-follow) | `seguimiento` | Compara archivos del tracker con el índice y HEAD de Git, sin escribir |
| [`facts`](#tasks-facts) | `hechos` | Emite hechos relacionales del tracker de tareas en formato JSON |
| [`tag`](#tasks-tag) | `etiquetar` | Agrega una o más etiquetas a tareas existentes |
| [`untag`](#tasks-untag) | `desetiquetar` | Quita una o más etiquetas de tareas |
| [`graph`](#tasks-graph) | `grafo` | Emite el grafo de referencias entre tareas en formato DOT o JSON |

## Opciones comunes

Todos los comandos aceptan las siguientes opciones generales:

- `--proyecto <ruta>`: apunta a la raíz de un proyecto explícito en lugar del directorio actual.
- `-h, --help`: muestra la ayuda del comando.
- `-V, --version`: muestra la versión instalada de `tasks`.

## tasks init

Inicializa el tracker de tareas en tareas/.

- **Alias:** ninguno

```text
tasks tasks init [-h] [--proyecto PROYECTO] [--sin-readme] [ruta]
```

### Argumentos

```text
  ruta                 Ruta del proyecto (por defecto: directorio actual)
```

### Opciones

```text
  -h, --help           show this help message and exit
  --proyecto PROYECTO  Ruta al proyecto
  --sin-readme         Inicializa el tracker sin crear README.md
```

## tasks new

Crea una nueva tarea con plantilla lista.

- **Alias:** `nueva`

```text
tasks tasks new [-h] [--etiqueta ETIQUETA] [--prioridad PRIORIDAD] [--sufijo SUFIJO] [--json] [--proyecto PROYECTO] titulo
```

### Argumentos

```text
  titulo                Título de la tarea
```

### Opciones

```text
  -h, --help            show this help message and exit
  --etiqueta, -e ETIQUETA
                        Etiqueta para la tarea (repetible o separada por
                        comas)
  --prioridad PRIORIDAD
                        Prioridad numérica entera (defecto: 50)
  --sufijo SUFIJO       Sufijo del ID; sin él se deriva del título, hasta 16
                        caracteres
  --json                Salida en formato JSON
  --proyecto PROYECTO   Ruta al proyecto
```

## tasks list

Lista tareas del proyecto (alias: listar, ls).

- **Alias:** `listar`, `ls`

```text
tasks tasks list [-h] [--cerradas] [--todas] [--etiqueta ETIQUETA] [--texto TEXTO] [--por-id] [--invertir] [--explicar] [--json] [--proyecto PROYECTO] [consulta ...]
```

### Argumentos

```text
  consulta              Consulta TQL opcional
```

### Opciones

```text
  -h, --help            show this help message and exit
  --cerradas            Muestra sólo tareas cerradas
  --todas               Muestra abiertas y cerradas
  --etiqueta, -e ETIQUETA
                        Filtra por etiqueta exacta
  --texto, -t TEXTO     Busca texto en título o descripción
  --por-id              Ordena por ID descendente (más nuevas primero)
  --invertir            Invierte el orden de la lista
  --explicar            Muestra tokens y forma compilada sin listar ni
                        requerir tracker
  --json                Salida en formato JSON
  --proyecto PROYECTO   Ruta al proyecto
```

## tasks show

Muestra detalles de una tarea o su ruta.

- **Alias:** `ver`

```text
tasks tasks show [-h] [--ruta] [--json] [--proyecto PROYECTO] id
```

### Argumentos

```text
  id                   Identificador, prefijo o sufijo inequívoco de la tarea
```

### Opciones

```text
  -h, --help           show this help message and exit
  --ruta               Imprime sólo la ruta a TAREA.md
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks close

Marca una tarea como CERRADA de forma atómica.

- **Alias:** `cerrar`

```text
tasks tasks close [-h] [--proyecto PROYECTO] id
```

### Argumentos

```text
  id                   Identificador, prefijo o sufijo inequívoco de la tarea
```

### Opciones

```text
  -h, --help           show this help message and exit
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks reopen

Marca una tarea como ABIERTA de forma atómica.

- **Alias:** `reabrir`

```text
tasks tasks reopen [-h] [--proyecto PROYECTO] id
```

### Argumentos

```text
  id                   Identificador, prefijo o sufijo inequívoco de la tarea
```

### Opciones

```text
  -h, --help           show this help message and exit
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks review

Audita la integridad del directorio tareas/.

- **Alias:** `revisar`

```text
tasks tasks review [-h] [--json] [--proyecto PROYECTO]
```

### Opciones

```text
  -h, --help           show this help message and exit
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks note

Agrega una nota, URL o marca temporal a una tarea existente.

- **Alias:** `anotar`

```text
tasks tasks note [-h] [--url URL] [--marca MARCA] [--json] [--proyecto PROYECTO] id [texto]
```

### Argumentos

```text
  id                   Identificador o prefijo inequívoco de la tarea
  texto                Texto explicativo de la nota
```

### Opciones

```text
  -h, --help           show this help message and exit
  --url URL            URL absoluta de referencia (http/https)
  --marca MARCA        Posición o marca temporal del recurso (ej. 01:32);
                       exige --url
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks attach

Copia un adjunto al directorio de la tarea y lo vincula en TAREA.md.

- **Alias:** `adjuntar`

```text
tasks tasks attach [-h] [--permitir-grande] [--json] [--proyecto PROYECTO] id archivo
```

### Argumentos

```text
  id                   Identificador o prefijo inequívoco de la tarea
  archivo              Ruta al archivo regular de origen
```

### Opciones

```text
  -h, --help           show this help message and exit
  --permitir-grande    Permite adjuntar archivos mayores a 20 MiB
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks search

Busca texto de forma literal e insensible a mayúsculas en tareas y notas.

- **Alias:** `buscar`

```text
tasks tasks search [-h] [--json] [--proyecto PROYECTO] texto
```

### Argumentos

```text
  texto                Texto literal a buscar
```

### Opciones

```text
  -h, --help           show this help message and exit
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks refs

Busca menciones textuales del ID canónico en tareas, notas y código del proyecto.

- **Alias:** `referencias`

```text
tasks tasks refs [-h] [--json] [--proyecto PROYECTO] [id]
```

### Argumentos

```text
  id                   Identificador o prefijo inequívoco de la tarea
```

### Opciones

```text
  -h, --help           show this help message and exit
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks summary

Muestra cantidades agregadas por estado y etiquetas a partir de registros válidos.

- **Alias:** `resumen`

```text
tasks tasks summary [-h] [--json] [--proyecto PROYECTO]
```

### Opciones

```text
  -h, --help           show this help message and exit
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

## tasks follow

Compara archivos del tracker con el índice y HEAD de Git, sin escribir.

- **Alias:** `seguimiento`

```text
tasks tasks follow [-h] [--proyecto PROYECTO] [--json]
```

### Opciones

```text
  -h, --help           show this help message and exit
  --proyecto PROYECTO  Raíz explícita del proyecto
  --json               Diagnóstico como JSON
```

## tasks facts

Emite hechos relacionales del tracker de tareas en formato JSON.

- **Alias:** `hechos`

```text
tasks tasks facts [-h] [--git] [--json] [--proyecto PROYECTO]
```

### Opciones

```text
  -h, --help           show this help message and exit
  --git                Comprueba estado frente al índice y HEAD de Git
  --json               Salida en formato JSON (siempre activo)
  --proyecto PROYECTO  Ruta explícita a la raíz del proyecto
```

## tasks tag

Agrega una o más etiquetas a tareas existentes.

- **Alias:** `etiquetar`

```text
tasks tasks tag [-h] [--etiqueta ETIQUETA] [--json] [--proyecto PROYECTO] [ids ...]
```

### Argumentos

```text
  ids                   Identificadores o prefijos inequívocos de tareas
```

### Opciones

```text
  -h, --help            show this help message and exit
  --etiqueta, -e ETIQUETA
                        Etiqueta a agregar (repetible o separada por comas)
  --json                Salida en formato JSON
  --proyecto PROYECTO   Ruta al proyecto
```

## tasks untag

Quita una o más etiquetas de tareas.

- **Alias:** `desetiquetar`

```text
tasks tasks untag [-h] [--etiqueta ETIQUETA] [--consulta CONSULTA] [--cerradas] [--todas] [--json] [--proyecto PROYECTO] [ids ...]
```

### Argumentos

```text
  ids                   Identificadores o prefijos inequívocos de tareas
```

### Opciones

```text
  -h, --help            show this help message and exit
  --etiqueta, -e ETIQUETA
                        Etiqueta a quitar (repetible o separada por comas)
  --consulta CONSULTA   Expresión de consulta TQL para filtrar tareas (modo
                        masivo)
  --cerradas            Aplica a tareas cerradas (modo masivo)
  --todas               Aplica a tareas abiertas y cerradas (modo masivo)
  --json                Salida en formato JSON
  --proyecto PROYECTO   Ruta al proyecto
```

## tasks graph

Emite el grafo de referencias entre tareas en formato DOT o JSON.

- **Alias:** `grafo`

```text
tasks tasks graph [-h] [--json] [--proyecto PROYECTO]
```

### Opciones

```text
  -h, --help           show this help message and exit
  --json               Salida en formato JSON
  --proyecto PROYECTO  Ruta al proyecto
```

