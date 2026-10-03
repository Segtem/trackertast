# Migrar a Oracle Task 0.2.0

- ESTADO: CERRADA
- PRIORIDAD: 50
- ETIQUETAS: 


## Pedido

El usuario pidió el 2026-10-03 migrar todos los consumidores de trackertast a oracle-task y
luego retirar el paquete anterior de PyPI. Coordinación: tarea 20261003-183936-migrar-task del
repositorio Segtem/oracle. Se conservan IDs, documentos de tareas y el alias tasks.


## Verificación

Oracle Task 0.2.0 publicado y global instalado; tasks es el alias conservado. README aclara retiro pendiente y versiones antiguas afectadas. Ejemplo corregido a oracle_task.cli. Prueba uv migró el wheel histórico GitHub v0.1.0 con SHA256 fijado al wheel 0.2.0; mismos IDs y hashes de datos, lectura, notas, cierre/reapertura y hechos correctos.

## Próximo paso

La migración de este repositorio está terminada. El retiro de PyPI se sigue en Oracle 20261003-183936-migrar-task.
