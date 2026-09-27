# La web de trackertast

- ESTADO: CERRADA
- PRIORIDAD: 80
- ETIQUETAS: 

### Nota (2026-09-27 18:20:33 UTC)

2026-09-27, pedido de Brian: trackertast es un proyecto entero y necesita su web (oracle-mcp no: es un derivado de Oracle y se documenta en la web de Oracle). PROPUESTA (Claude, a confirmar con Brian): GitHub Pages desde docs/ como Oracle, con identidad visual propia pero de la misma familia pixel-art. Páginas: (1) portada — qué es (un tracker en archivos Markdown dentro del repo, para que personas y agentes se pasen el trabajo), instalación en una línea, un recorrido de 60 segundos con salidas reales; (2) guía — de tasks init a tasks close, con las consultas, adjuntos, referencias y seguimiento; (3) referencia — cada verbo con sus opciones y alias, generada de la ayuda del CLI para que no se despegue; (4) para agentes — el relevo entre sesiones y por qué la tarea es la fuente de verdad; (5) con Oracle — tasks facts y cómo Oracle juzga el tracker (ejemplo/seguimiento-tareas). Rigor igual que en Oracle: las salidas de la guía se ejecutan en CI desde una carpeta vacía y el sitio falla si queda vencido.

### Nota (2026-09-27 19:30:18 UTC)

2026-09-27, Claude: hecha y publicada en https://segtem.github.io/trackertast/ (GitHub Pages desde docs/). agy armó portada, guía ejecutada (24 pasos), referencia generada de la ayuda del CLI, para agentes y con Oracle; Claude fijó el idioma de git en el runner de la guía (git traduce sus mensajes y la guía fallaba en una máquina en español) y la revisó en Chromium: escritorio, 400 px, claro y oscuro, sin scroll horizontal ni errores de JavaScript. Suite 501 OK.
