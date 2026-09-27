# Guía paso a paso de trackertast

Esta guía recorre el ciclo completo de uso de **trackertast** (`tasks`), desde la inicialización hasta el cierre de una tarea, pasando por consultas avanzadas con TQL, notas de avance, adjuntos, referencias cruzadas, el grafo de dependencias y el seguimiento en Git.

Cada paso muestra el comando ejecutado y la salida real obtenida.

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
tasks new "Diseñar sensor de velocidad" --etiqueta sensor --prioridad 70 --sufijo sensor
```
```text salida
Tarea creada: 20260927-120000-sensor
Ruta: ./tareas/20260927-120000-sensor/TAREA.md
```

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

## 8. Seguimiento con Git

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

## 9. Resumen y cierre de tareas

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

### Cerrar una tarea

Cuando el trabajo de una tarea termina, la marcamos como `CERRADA` mediante `tasks close` (alias `cerrar`):

```bash paso
tasks close fuga
```
```text salida
Tarea cerrada: 20260927-120000-fuga
```

Podemos consultar el listado completo incluyendo tareas abiertas y cerradas pasando `--todas`:

```bash paso
tasks list --todas
```
```text salida
20260927-120000-arnes  ABIERTA P80 [sensor, arnes] Escribir arnés de prueba
20260927-120000-sensor ABIERTA P70 [sensor]        Diseñar sensor de velocidad
20260927-120000-fuga   CERRADA P40 [bug]           Corregir fuga en actuador
```
