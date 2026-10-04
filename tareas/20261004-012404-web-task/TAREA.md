# Crear una web pixel art de Oracle Task con guía precisa

- ESTADO: CERRADA
- PRIORIDAD: 60
- ETIQUETAS:

## Pedido y alcance

El usuario pidió crear una web con pixel art para explicar cómo usar Oracle Task. Se autoriza implementar documentación, recursos visuales nativos y pruebas de la web; conservar la CLI y su versión publicada. Instalación desde PyPI con uv, ejemplos reales y responsabilidades/límites explícitos. Commit/push y publicación web según autorización vigente. No inventar aprobaciones humanas ni presentar validaciones estructurales como revisión de calidad.

## Trabajo delegado

agy1: portada y documentación generada de Oracle Task. Root: verificar comandos, contratos, navegador y despliegue.

### Nota (2026-10-04 01:24:04 UTC)

Pedido aceptado por el usuario en conversación: crear web pixel art explicando el uso. Se trabaja en rama separada; no se cambia runtime ni se simula aceptación de un producto.

### Nota (2026-10-04 02:08:44 UTC)

agy1 entregó portada pixel art y guía; root corrigió: rótulos de IDs/salidas ilustrativos, relevo en editor, cierre sin ID ficticio, precondición del adjunto, comandos multiplataforma y acumulación de bucles RAF. Se quitaron tests estáticos que repetían HTML y se sustituyeron por arnés funcional Chromium. Suite: 500 tests OK. Guía fuente: 27 pasos con salidas concordantes; el mismo arnés se ejecutó con Python/CLI instalados de oracle-task 0.2.0 desde PyPI y sin PYTHONPATH del checkout. 11 comprobaciones Chromium OK (320/390/768/1440, teclado, controles, pausa, copia, enlaces, recursos, lectura sin JS y movimiento reducido). Capturas revisadas. tools/sitio.py sin páginas desactualizadas. oracle test del ejemplo: VERDE para su corpus, sin nueva medición del producto. Runtime y versión intactos. No se hizo piloto humano ni ejecución en Windows/macOS. El informe histórico de agy1 describe su entrega inicial; esta nota y las evidencias finales describen la integración corregida.

- Adjunto: [task-web-browser-final.json](task-web-browser-final.json)

- Adjunto: [task-web-guide-pypi-evidence.json](task-web-guide-pypi-evidence.json)

- Adjunto: [oracle-task-web-final-suite.log](oracle-task-web-final-suite.log)

- Adjunto: [portada-light.png](portada-light.png)

- Adjunto: [guia-mobile.png](guia-mobile.png)

### Nota (2026-10-04 02:17:20 UTC)

Publicado en main (075e29ce340807ffb935448ce3ee79ce302786c7) y Pages https://segtem.github.io/trackertast/. Despliegue exitoso: https://github.com/Segtem/trackertast/actions/runs/37170265904. Verificación HTTP de 10 archivos HTML/CSS/JS/SVG/JSON: todos 200 y SHA-256 idéntico a docs/. Evidencia pública adjunta. Se cierra el alcance documental pedido; versiones PyPI siguen iguales, sin corte nuevo. CI completo exitoso: https://github.com/Segtem/trackertast/actions/runs/37170266236.

- Adjunto: [trackertast-web-public.json](trackertast-web-public.json)

## Próximo paso

Web publicada y verificada; no queda trabajo de este alcance. Nuevas mejoras y el piloto humano se registran como tareas separadas, sin presentar esta verificación técnica como experiencia de una persona principiante.
