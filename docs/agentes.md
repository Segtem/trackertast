# El relevo entre sesiones: personas y agentes

En proyectos donde colaboran personas y modelos de lenguaje (o agentes autónomos), el mayor riesgo no es escribir código incorrecto, sino **perder el contexto de trabajo entre sesiones**.

Las ventanas de contexto se llenan, las sesiones de terminal o chat se reinician y los subagentes se destruyen al finalizar su turno. Si las notas, decisiones intermedias y próximos pasos quedan atrapados en el chat o en servicios externos, la siguiente sesión arranca a ciegas.

En **trackertast**, la tarea es la **fuente de verdad** compartida: vive dentro del repositorio en archivos Markdown versionados con Git.

## 1. La tarea como fuente de verdad

Cada tarea reside en su propio directorio dentro de `tareas/` (por ejemplo, `tareas/20260927-120000-sensor/`), compuesta por:

- **`TAREA.md`**: contiene el título, los metadatos estructurados (`ESTADO`, `PRIORIDAD`, `ETIQUETAS`) y el cuerpo libre en Markdown con notas fechadas en UTC.
- **Adjuntos locales**: capturas, registros, volcados de pruebas, especificaciones o scripts auxiliares.

Tanto un desarrollador humano con su editor habitual como un agente conectado mediante CLI o MCP leen y escriben exactamente los mismos archivos, sin bases de datos intermedias ni APIs propietarias.

## 2. El ciclo de relevo

El flujo para tomar una tarea, avanzar y entregar el testigo consta de cuatro momentos:

### Retomar con `tasks show`

Al iniciar una sesión, el agente o la persona consulta la tarea:

```bash
tasks show sensor
```

Esto imprime el título, estado, prioridad, etiquetas, ruta al documento y todas las notas registradas en orden cronológico. Con `--json`, devuelve la estructura completa para procesamiento automatizado.

### Documentar descubrimientos con `tasks note`

A medida que se investiga un defecto o se implementa una función, las decisiones no obvias se registran de inmediato:

```bash
tasks note sensor "El sensor responde con timeout cuando la frecuencia supera los 500 Hz"
```

Si hay una referencia técnica externa, se adjunta con `--url` y `--marca`:

```bash
tasks note sensor "Documentación de registros de hardware" --url "https://hardware.ejemplo.com/doc" --marca "Sección 4.2"
```

### Dejar el próximo paso antes de cerrar la sesión

Antes de agotar la ventana de contexto o pausar el trabajo, la regla fundamental de relevo es **declarar el próximo paso exacto**:

```bash
tasks note sensor "PRÓXIMO PASO: ajustar el divisor de reloj en drivers/spi.c y verificar con tests/test_sensor.py"
```

Cuando otra sesión o agente tome la tarea, no necesitará releer todo el árbol de código para deducir qué faltaba hacer: el próximo paso está escrito en el último párrafo de `TAREA.md`.

### Adjuntar evidencia con `tasks attach`

Si se generó un archivo de log, una captura de pantalla o un informe de perfilado, se incorpora a la carpeta de la tarea:

```bash
tasks attach sensor volcado_memoria.bin
```

Esto copia el archivo a la carpeta de la tarea y agrega un enlace Markdown en `TAREA.md`.

### Cerrar la tarea con `tasks close`

Al finalizar el trabajo:

```bash
tasks close sensor
```

El estado pasa atómicamente a `CERRADA`, preservando intactos todos los metadatos y el cuerpo Markdown.

## 3. Ejemplo de `AGENTS.md` para tu repositorio

Para que cualquier agente de codificación (Claude Code, Gemini CLI, Cursor, Aider, Devin, etc.) adopte este protocolo en tu proyecto, podés incluir un archivo `AGENTS.md` en la raíz de tu repositorio con las siguientes instrucciones:

```markdown
# Protocolo de trabajo para agentes

Este repositorio utiliza **trackertast** (`tasks`) para el seguimiento de tareas locales en Markdown.

## Reglas de operación

1. **Revisar tareas abiertas**:
   Antes de comenzar cualquier trabajo, listá las tareas abiertas para ubicar tu objetivo:
   ```bash
   tasks list
   ```

2. **Cargar contexto con `tasks show`**:
   Leé la tarea asignada antes de modificar código:
   ```bash
   tasks show <id_o_sufijo>
   ```
   Revisá especialmente las últimas notas para identificar el estado actual y el próximo paso.

3. **Registrar avances y bloqueos**:
   No guardes hallazgos sólo en tu memoria conversacional. Usá:
   ```bash
   tasks note <id_o_sufijo> "Descripción del hallazgo o cambio de plan"
   ```

4. **Dejar siempre el próximo paso**:
   Si no podés completar la tarea en esta sesión o necesitás intervención externa, agregá una nota explícita con el prefijo `PRÓXIMO PASO:`.

5. **Convención de commits**:
   - Todo commit asociado a una tarea debe comenzar con su ID canónico: `<ID>: resumen del cambio`
   - Ejemplo: `20260927-120000-sensor: calibrar divisor de reloj en SPI`
   - El commit final que cierra la tarea debe ser exactamente: `<ID>: done`

6. **Cerrar la tarea al terminar**:
   Cuando los cambios estén implementados y verificados:
   ```bash
   tasks close <id_o_sufijo>
   git add tareas/
   git commit -m "<ID>: done"
   ```
```

## 4. Por qué los commits nombran la tarea

En Git, el historial de commits suele divorciarse del sistema de incidencias: si el tracker está en una plataforma web y el repositorio se migra, los números `#123` pierden significado.

En `trackertast`, el identificador de la tarea es unívoco y atemporal (`YYYYMMDD-HHMMSS[-sufijo]`). Al usar la convención:

```text
20260927-120000-sensor: calibrar divisor de reloj en SPI
```

se establece un vínculo bidireccional permanente:
- Desde el commit en `git log`, se llega de inmediato a la carpeta `tareas/20260927-120000-sensor/TAREA.md` y a toda su evidencia histórica.
- Desde la tarea, `tasks follow` y `tasks refs` pueden rastrear qué commits tocaron ese identificador.

Y al finalizar, el commit canónico de cierre:

```text
20260927-120000-sensor: done
```

registra de forma inmutable en el árbol de Git el commit exacto donde se dio por concluido el trabajo.
