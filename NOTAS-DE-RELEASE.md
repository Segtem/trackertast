# Oracle Task 0.2.0

Trackertast continúa como paquete `oracle-task`. Primer corte bajo el nuevo nombre, preparado para publicación manual en PyPI.

- Comando principal `oracle-task` y alias compatible `tasks`.
- Módulos bajo `oracle_task`, sin instalar archivos sobre el namespace `trackertast`.
- Conserva verbos, consultas, formatos de hechos, directorio tareas/, TAREA.md e identificadores existentes.
- Trackertast 0.1.0 sigue publicado; Factory 0.1.0a1 puede seguir usándolo hasta su próxima versión.
- Documentación y sitio actualizados; el repositorio continúa en Segtem/trackertast.

## Validación

Suite completa, guía ejecutable, generación de documentación y pruebas de wheel/sdist. La migración con uv se prueba sobre tareas creadas con Trackertast 0.1.0: ambos comandos nuevos leen y modifican los mismos archivos y conservan sus ids.

## Publicar en PyPI

El release incluye wheel, sdist y SHA256SUMS. Los mismos artefactos probados están en dist/:

```bash
uv publish dist/oracle_task-0.2.0-py3-none-any.whl dist/oracle_task-0.2.0.tar.gz
```

Después de publicar:

```bash
uvx --from oracle-task==0.2.0 oracle-task --version
```

Para reemplazar una instalación uv existente: `uv tool uninstall trackertast` y luego `uv tool install oracle-task==0.2.0`. Las tareas del proyecto permanecen intactas. No instalar ambos en el mismo entorno: comparten el ejecutable tasks.
