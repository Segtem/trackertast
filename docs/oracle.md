# Auditoría formal con Oracle

**oracle-task** es un proyecto independiente de Oracle: no requiere motores de evaluación, catálogos de medidas ni dependencias complejas para operar en el día a día.

Sin embargo, cuenta con un puente nativo de exportación de evidencia relacional: el comando `tasks facts` (alias `tasks hechos`). Esto permite que Oracle audite formalmente la integridad del tracker y de la historia de Git utilizando políticas declarativas.

## 1. Evidencia relacional: `tasks facts`

El comando:

```bash
tasks facts --git > hechos.json
```

inspecciona el directorio `tareas/`, los documentos Markdown, los adjuntos locales y el historial de commits en Git, emitiendo un objeto JSON estructurado directamente a la salida estándar con siete relaciones clave:

1. **`lectura_seguimiento`**: indica si la lectura del árbol fue completa (`completa: true`) y el estado del repositorio (`comprobado`, `sin_repositorio` o `no_solicitado`).
2. **`tarea_seguimiento`**: inventario ordenado de tareas válidas registradas, con su identificador canónico, título, estado (`ABIERTA` o `CERRADA`), prioridad, ruta relativa y hash SHA-256 de su `TAREA.md`.
3. **`archivo_seguimiento`**: catálogo recursivo de todos los archivos bajo `tareas/`, clasificando su clase (`documento`, `adjunto`, `auxiliar`), tipo físico (`regular`, `enlace`, `especial`, `ausente`), tamaño en bytes y estado en Git (`en_indice`, `en_head`, `ignorado`, `indice`, `trabajo`).
4. **`referencia_seguimiento`**: inventario de todos los enlaces y menciones detectados en los documentos Markdown, clasificando su clase (`local`, `remota`, `ancla`, `no_admitida`) y su estado de resolución en disco (`presente`, `ausente`, `fuera_del_proyecto`, `no_comprobado`).
5. **`omision_seguimiento`**: registro de cualquier archivo o sintaxis que no haya podido procesarse (por ejemplo, adjuntos mayores a 2 MiB, enlaces simbólicos externos o bytes no UTF-8).
6. **`commit_seguimiento`**: lista de los commits alcanzables desde `HEAD` de Git (con `--git`), identificando si el asunto nombra una tarea (`<ID>: …`), si la tarea existe hoy en disco, su estado actual y si el commit constituye un cierre formal (`<ID>: done`).
7. **`tarea_cierre_medida`**: pares de tarea y medidas requeridas declaradas en la cabecera `- CIERRA CON:` de cada documento.

## 2. El catálogo de auditoría: `ejemplo/seguimiento-tareas`

El repositorio incluye en [`ejemplo/seguimiento-tareas`](../ejemplo/seguimiento-tareas/) un proyecto completo de Oracle que define seis políticas de calidad sobre el tracker:

```bash
# 1. Exportar la evidencia del repositorio
tasks facts --git > hechos.json

# 2. Juzgar contra el catálogo de seguimiento
oracle juzgar --proyecto ejemplo/seguimiento-tareas --con hechos.json
```

### Las seis políticas de seguimiento

1. **`seguimiento.referencias_locales_presentes`**:
   Verifica que ningún enlace relativo local (`[registro](calibracion.csv)`) dentro de un `TAREA.md` apunte a un archivo inexistente en disco. No se permiten enlaces rotos dentro del tracker.
2. **`seguimiento.archivos_confirmados_sin_cambios`**:
   Comprueba que todos los archivos bajo `tareas/` estén debidamente confirmados en el commit de `HEAD` de Git y no tengan modificaciones pendientes en el índice ni en el árbol de trabajo.
3. **`seguimiento.lectura_sin_omisiones`**:
   Exige que la extracción de evidencia haya sido 100% íntegra (`completa == true`), garantizando que ninguna regla se juzgue sobre un inventario incompleto.
4. **`seguimiento.ningun_commit_nombra_una_tarea_inexistente`**:
   Si un mensaje de commit empieza con un identificador de tarea (`<ID>: …`), exige que esa tarea exista en `tareas/`. Evita atribuir cambios a tareas inventadas o mal escritas.
5. **`seguimiento.toda_tarea_cerrada_tiene_su_commit_de_cierre`**:
   Toda tarea con estado `CERRADA` debe contar en el historial de Git con al menos un commit cuyo mensaje sea exactamente `<ID>: done`. Cerrar una tarea sin asentar el commit de cierre se diagnostica como un defecto de proceso.
6. **`seguimiento.ningun_cierre_deja_la_tarea_abierta`**:
   Ningún commit con el texto `<ID>: done` puede apuntar a una tarea que hoy figure con estado `ABIERTA`. Evita que una tarea finalizada se reabra silenciosamente sin nuevo registro.

## 3. Comprobación en integración continua (CI)

En `.github/workflows/tracker.yml`, el proyecto de ejemplo se ejecuta para verificar la coherencia de las políticas del catálogo:

```yaml
- name: Juzgar ejemplo de seguimiento
  run: oracle test --proyecto ejemplo/seguimiento-tareas
```

De esta manera, si en tu equipo o empresa adoptás Oracle, el tracker de tareas se integra automáticamente con el sistema de verificación continua de especificaciones. Si no usás Oracle, `oracle-task` sigue funcionando sin ninguna merma de funcionalidad.
