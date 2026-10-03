# Migrar trackertast a oracle-task

- ESTADO: ABIERTA
- PRIORIDAD: 50
- ETIQUETAS:


## Alcance autorizado

El usuario aceptó migrar el paquete y solicitó los comandos para publicar oracle-task en PyPI. Se prepara el corte 0.2.0; la publicación en PyPI queda a su cargo.

- Nuevo nombre de distribución PyPI: oracle-task; comando principal oracle-task.
- Conservar tasks como alias de compatibilidad y mantener el formato tareas/, TAREA.md e ids existentes.
- Mantener trackertast 0.1.0 disponible para consumidores publicados que lo fijan, incluido Factory 0.1.0a1.
- Preparar una versión posterior de Factory con la dependencia y el despacho de comandos actualizados; ajustar web y guía.
- Probar instalación nueva y migración de instalaciones previas, incluida la colisión del ejecutable tasks en uv; evitar paquetes que sobrescriban los mismos módulos.
- PyPI devolvió 404 para oracle-task el 2026-10-03; ausencia pública no garantiza aceptación del nombre al subir.


### Nota (2026-10-03 18:22:29 UTC)

El usuario autorizó la migración y pidió artefactos/comandos para publicar oracle-task. Implementado corte 0.2.0: namespace oracle_task, comandos oracle-task/tasks, datos compatibles y documentación actualizada. 500 tests OK, guía de 24 pasos reproducida, sitio generado vigente y oracle test del ejemplo VERDE (alcance: medidas contra corpus). Prueba de migración uv desde trackertast 0.1.0: mismos archivos e ids, ambos comandos operativos. Trackertast 0.1.0 y Factory 0.1.0a1 se conservan.

## Próximo paso

Publicar tag y release v0.2.0 con artefactos probados. El usuario los sube a PyPI; tras su aviso verificar instalación del índice y preparar la actualización de la dependencia en Factory, con su propio release.
