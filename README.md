# Oracle Task

Tracker local de tareas en archivos Markdown dentro del repositorio, pensado para que personas y agentes se pasen el trabajo sin bases de datos, servicios externos ni dependencias de runtime.

Web y documentación: https://segtem.github.io/trackertast/

Cada tarea vive en su propia carpeta bajo `tareas/`, con un archivo central `TAREA.md` y cualquier adjunto local (capturas, notas, esquemas, volcados de evidencia). Git guarda la historia.

## Cambio de nombre

Oracle Task continúa Trackertast. El paquete nuevo es `oracle-task`, su módulo Python es `oracle_task` y conserva `tasks` como alias. Los archivos `tareas/`, `TAREA.md`, ids, consultas y hechos no cambian. El repositorio y la URL de la web siguen siendo `Segtem/trackertast` para conservar los enlaces existentes.

`oracle-task==0.2.0` ya está publicado en PyPI. El retiro de `trackertast==0.1.0` está pendiente de publicar los consumidores migrados. Las versiones antiguas de Factory y MCP fijan la dependencia anterior y su instalación desde PyPI dejará de funcionar si se elimina. El [release histórico v0.1.0](https://github.com/Segtem/trackertast/releases/tag/v0.1.0) conserva sus artefactos para reproducir migraciones. Las importaciones Python nuevas usan `oracle_task`; el paquete nuevo no instala módulos `trackertast`, evitando sobrescribir el código del anterior.

## Instalación

Requiere Python 3.11 o posterior y no tiene dependencias de runtime. Este corte está preparado en el release de GitHub; el mantenedor hará la publicación PyPI. Después de publicarlo:

```bash
uv tool install oracle-task==0.2.0
```

O desde el repositorio:

```bash
uv tool install .
# o con pip en un entorno virtual:
pip install .
```

## Migración de una instalación con uv

Si tenés Trackertast instalado como herramienta, reemplazá su instalación para evitar que ambos reclamen el ejecutable `tasks`:

```bash
uv tool uninstall trackertast
uv tool install oracle-task==0.2.0
oracle-task --version
tasks --version
```

Esto cambia la herramienta instalada, no borra los directorios de tareas de tus proyectos. Evitá instalar ambos paquetes en el mismo entorno pip: aunque los módulos son distintos, comparten el ejecutable `tasks`. Los consumidores que fijan Trackertast deben actualizar su dependencia en su propia próxima versión.

También podés instalar el wheel del [release v0.2.0](https://github.com/Segtem/trackertast/releases/tag/v0.2.0).

## Comandos y ejemplos

El comando principal es `oracle-task`; `tasks` se conserva como alias con los mismos verbos y formatos. Los verbos canónicos son en inglés, con alias en español para mantener compatibilidad:

| Canónico | Alias | Descripción y ejemplo |
|---|---|---|
| `init` | — | Inicializa el tracker en `tareas/`<br>`tasks init` |
| `new` | `nueva` | Crea una nueva tarea con plantilla<br>`tasks new "Investigar defecto en sensor" --etiqueta bug --prioridad 70` |
| `list` | `listar`, `ls` | Lista tareas abiertas con consultas TQL o filtros<br>`tasks list ":bug y prioridad desde 50"` |
| `show` | `ver` | Muestra detalles de una tarea o su ruta<br>`tasks show 20260911-180000 --ruta` |
| `close` | `cerrar` | Marca la tarea como CERRADA de forma atómica<br>`tasks close 20260911-180000` |
| `reopen` | `reabrir` | Marca la tarea como ABIERTA de forma atómica<br>`tasks reopen 20260911-180000` |
| `review` | `revisar` | Audita la integridad del directorio `tareas/`<br>`tasks review` |
| `note` | `anotar` | Agrega una nota, URL o marca temporal a una tarea<br>`tasks note <id> "Monotonic clock" --url "https://ejemplo.com" --marca "02:30"` |
| `attach` | `adjuntar` | Copia un adjunto al directorio de la tarea y lo vincula<br>`tasks attach <id> captura.png` |
| `search` | `buscar` | Busca texto literal en tareas y notas del tracker<br>`tasks search "monotonic clock"` |
| `refs` | `referencias` | Busca menciones del ID canónico en tareas y código<br>`tasks refs <id>` |
| `summary` | `resumen` | Muestra cantidades agregadas por estado y etiquetas<br>`tasks summary` |
| `follow` | `seguimiento` | Diagnóstico de seguimiento y cobertura en Git<br>`tasks follow` |
| `facts` | `hechos` | Emite evidencia relacional del tracker en formato JSON<br>`tasks facts --git` |
| `tag` | `etiquetar` | Agrega una o más etiquetas a tareas existentes<br>`tasks tag <id> --etiqueta urgente` |
| `untag` | `desetiquetar` | Quita etiquetas de tareas existentes<br>`tasks untag <id> --etiqueta urgente` |
| `graph` | `grafo` | Emite el grafo de referencias en formato DOT o JSON<br>`tasks graph` |

Para más detalles sobre el formato de `TAREA.md`, consultas TQL y contratos, consultá [docs/tareas.md](docs/tareas.md).

## Relación con Oracle

`oracle-task` es un programa independiente de Oracle: no requiere catálogos de medidas ni motor de evaluación para funcionar.

Sin embargo, sabe emitir evidencia relacional observable mediante el comando `tasks facts` (alias `tasks hechos`). Oracle puede consumir esta evidencia relacional y juzgarla contra políticas formales del catálogo:

```bash
# 1. Exportar los hechos del tracker
tasks facts --git > hechos.json

# 2. Juzgar la evidencia contra políticas de seguimiento en Oracle
oracle juzgar --proyecto ejemplo/seguimiento-tareas --con hechos.json
```

El proyecto de ejemplo en [`ejemplo/seguimiento-tareas`](ejemplo/seguimiento-tareas/) define políticas de auditoría para verificar:
- Que las referencias locales a adjuntos existan físicamente (`seguimiento.referencias_locales_presentes`).
- Que los archivos del tracker estén confirmados en Git sin cambios pendientes (`seguimiento.archivos_confirmados_sin_cambios`).
- Que la lectura del tracker haya sido completa y sin omisiones (`seguimiento.lectura_sin_omisiones`).
- Que todo commit que nombra una tarea apunte a una tarea existente (`seguimiento.ningun_commit_nombra_una_tarea_inexistente`).
- Que toda tarea cerrada cuente con su commit de cierre (`seguimiento.toda_tarea_cerrada_tiene_su_commit_de_cierre`).
- Que ningún commit de cierre deje la tarea abierta (`seguimiento.ningun_cierre_deja_la_tarea_abierta`).
