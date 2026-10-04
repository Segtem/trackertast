/**
 * oracle-task — portada.js
 * Escena interactiva pixel art nativa en Canvas (2D directo, sin imágenes externas).
 * Explica el ciclo de vida: crear tarea -> evidencia/adjuntos -> relevo -> cerrar/reabrir.
 * Muestra a la persona y a Git como responsables de seguimiento.
 * Cero dependencias externas. 100% offline.
 */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const darkMode = matchMedia('(prefers-color-scheme: dark)');

  const ETAPAS = [
    {
      numero: '01',
      etiqueta: 'Crear tarea',
      responsable: 'PERSONA O AGENTE + CLI',
      titulo: '1. Nace una tarea en su propia carpeta',
      comando: 'tasks new "Investigar defecto en sensor" --etiqueta sensor --prioridad 70 --sufijo sensor',
      explicacion: 'Una persona o un agente inicia el hilo de trabajo. Oracle Task crea la subcarpeta tareas/20261004-012404-sensor/ con su plantilla TAREA.md, metadatos estructurados (ESTADO: ABIERTA, PRIORIDAD: 70, ETIQUETAS: sensor) y formato Markdown estándar.',
      entra: 'Una necesidad, defecto observado o acuerdo de trabajo.',
      sale: 'Carpeta tareas/<ID>/ con plantilla TAREA.md y estado ABIERTA.',
      quien: 'La persona o el agente ejecuta el comando. El CLI crea los archivos locales en tu disco.',
      limite: 'El tracker no requiere servidores remotos ni bases de datos. Todo vive dentro de tareas/ en tu repositorio.',
      simulacion: 'Simulación visual: el ID es ilustrativo. Creá la tarea en tu proyecto y recuperá su ID real con tasks list.'
    },
    {
      numero: '02',
      etiqueta: 'Evidencia',
      responsable: 'PERSONA O AGENTE + ARCHIVOS LOCALES',
      titulo: '2. Registrar descubrimientos y evidencia local',
      comando: 'tasks note sensor "Medición preliminar en banco de pruebas"\ntasks attach sensor calibracion.csv',
      explicacion: 'Durante la investigación, las observaciones se asientan como notas cronológicas fechadas en UTC con tasks note. Para copiar este ejemplo, primero guardá un archivo calibracion.csv con tus mediciones en la carpeta del proyecto. Los archivos de prueba, tablas de calibración (.csv) o volcados de logs se incorporan dentro de la carpeta de la tarea con tasks attach.',
      entra: 'Observaciones de avance, enlaces de referencia y archivos locales de evidencia.',
      sale: 'TAREA.md actualizado con notas fechadas y enlaces relativos a los adjuntos locales.',
      quien: 'El colaborador documenta sus hallazgos. tasks attach copia el archivo dentro de la carpeta de la tarea.',
      limite: 'Los adjuntos viajan dentro del repositorio. La copia local viaja con la tarea cuando confirmás los archivos en Git. Debés comprobar que el adjunto sea pertinente y compartirlo por tu cuenta.',
      simulacion: 'Simulación visual: adjunto calibracion.csv incorporado en tareas/20261004-012404-sensor/.'
    },
    {
      numero: '03',
      etiqueta: 'Relevo',
      responsable: 'PERSONA ⇄ AGENTE (O ENTRE AGENTES)',
      titulo: '3. El relevo colaborativo sin perder contexto',
      comando: 'tasks show sensor --ruta',
      explicacion: 'Antes de cerrar una sesión de trabajo o agotar la ventana de contexto, se redacta el único encabezado ## Próximo paso al final de TAREA.md. Quien retoma el trabajo ejecuta tasks show sensor y continúa de inmediato sin perder tiempo deduciendo qué faltaba.',
      entra: 'Estado actual de la sesión y conclusiones de la investigación.',
      sale: 'Un único ## Próximo paso al final del documento con la acción concreta a ejecutar.',
      quien: 'Abrí la ruta que imprime este comando en el editor y reemplazá la única sección ## Próximo paso al final. El entrante lee todo con tasks show. tasks note agrega una nota; no reemplaza esa sección.',
      limite: 'Regla del relevo: no acumular múltiples secciones de próximo paso. Las notas previas conservan la historia.',
      simulacion: 'Simulación visual: pase de testigo entre persona desarrolladora y agente de programación.'
    },
    {
      numero: '04',
      etiqueta: 'Cierre y Git',
      responsable: 'PERSONA + GIT',
      titulo: '4. Cierre atómico y registro en Git',
      comando: 'tasks close sensor',
      explicacion: 'Cuando el trabajo termina, tasks close marca atómicamente el estado como CERRADA en TAREA.md. La persona confirma los cambios en Git nombrando el ID de la tarea. Con tasks follow se audita que todos los archivos del tracker estén integrados en HEAD.',
      entra: 'Trabajo terminado y comprobaciones locales finalizadas.',
      sale: 'Tarea en estado CERRADA y commit registrado en el historial de Git.',
      quien: 'tasks close solo cambia el estado. Después usá git add tareas/ y un commit con el ID completo real que devuelva tasks show sensor, seguido de : done.',
      limite: 'Git guarda historia SOLO si la persona hace git commit. tasks close no ejecuta trabajo ni crea commits.',
      simulacion: 'Simulación visual: historial de versiones Git con árbol de commits enlazados al ID de la tarea.'
    },
    {
      numero: '05',
      etiqueta: 'Reabrir',
      responsable: 'PERSONA + CLI',
      titulo: '5. Reapertura transparente ante nuevos hallazgos',
      comando: 'tasks reopen sensor\ntasks note sensor "Reabierta para verificar comportamiento a 800 Hz"',
      explicacion: 'Si un defecto reaparece o se detecta trabajo pendiente sobre una tarea cerrada, tasks reopen restaura atómicamente el estado a ABIERTA sin borrar ni alterar las notas históricas previas.',
      entra: 'Nueva necesidad o fallo detectado sobre una tarea previamente cerrada.',
      sale: 'Tarea reabierta en Markdown con su historial previo intacto y nueva nota de reapertura.',
      quien: 'La persona ejecuta tasks reopen y registra el motivo con tasks note.',
      limite: 'La reapertura preserva toda la historia anterior. No divide ni fragmenta el hilo de trabajo.',
      simulacion: 'Simulación visual: la carpeta retorna al tablero activo y el sello pasa a ABIERTA.'
    }
  ];

  let actual = 0;
  let reproduciendo = false;
  let timerAuto = null;
  let animFrame = null;
  let ticks = 0;

  const canvas = $('escena-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function esTemaOscuro() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && darkMode.matches);
  }

  function obtenerPaleta() {
    const oscuro = esTemaOscuro();
    return {
      oscuro,
      fondo: oscuro ? '#0F1412' : '#F4F6F4',
      piso: oscuro ? '#16201D' : '#E3E9E4',
      pisoLinea: oscuro ? '#25332B' : '#CBD5CE',
      lineaGuia: oscuro ? '#1C2923' : '#DDE4DF',
      acento: oscuro ? '#2DD4BF' : '#0F766E',
      acentoSuave: oscuro ? '#133933' : '#CCFBF1',
      verde: oscuro ? '#4ADE80' : '#166534',
      verdeSuave: oscuro ? '#143621' : '#DCFCE7',
      ambar: oscuro ? '#FBBF24' : '#B45309',
      ambarSuave: oscuro ? '#3A2F11' : '#FEF3C7',
      rojo: oscuro ? '#FF6F61' : '#C2362B',
      papel: oscuro ? '#202C27' : '#FFFFFF',
      papelBorde: oscuro ? '#35483F' : '#B8C7BD',
      textoClaro: oscuro ? '#E6ECE8' : '#141A18',
      textoApagado: oscuro ? '#87998F' : '#5A6963',
      terminalFondo: '#111714',
      terminalBorde: oscuro ? '#2A3C33' : '#33483E',
      terminalVerde: '#4ADE80',
      terminalCian: '#5EEAD4',
      gitCaja: oscuro ? '#1E293B' : '#334155',
      gitCommit: '#38BDF8'
    };
  }

  // --- Funciones primitivas pixel art ---
  function rect(x, y, w, h, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  function lineaH(x, y, w, col, grosor = 1) {
    rect(x, y, w, grosor, col);
  }

  function lineaV(x, y, h, col, grosor = 1) {
    rect(x, y, grosor, h, col);
  }

  function texto(str, x, y, col, size = 11, align = 'left', bold = false) {
    ctx.fillStyle = col;
    ctx.font = `${bold ? 'bold ' : ''}${size}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.fillText(str, Math.round(x), Math.round(y));
  }

  function sprite(mapa, x, y, paletaColores, scale = 2) {
    mapa.forEach((fila, dy) => {
      for (let dx = 0; dx < fila.length; dx++) {
        const c = fila[dx];
        if (paletaColores[c]) {
          rect(x + dx * scale, y + dy * scale, scale, scale, paletaColores[c]);
        }
      }
    });
  }

  // Personaje persona desarrolladora
  function dibujarPersona(x, y, activo, tick) {
    const pal = {
      p: '#5C3826', // pelo
      c: '#F5C89C', // piel
      o: '#2A1810', // ojos
      r: activo ? '#0F766E' : '#354E46', // ropa / suéter
      v: '#2DD4BF', // detalle
      b: '#1E2923', // pantalón
      z: '#111814'  // zapatos
    };
    const balanceo = activo ? (Math.floor(tick / 18) % 2) : 0;
    const mapa = [
      '..pppp..',
      '.pppppp.',
      '.ppccpp.',
      '.pcoopp.',
      '..cccc..',
      '..rrrr..',
      '.rvvvr..',
      '.rvvvr..',
      '..bbbb..',
      '..b..b..',
      balanceo ? '.zz..z..' : '..z..zz.'
    ];
    sprite(mapa, x, y + balanceo, pal, 2);
  }

  // Personaje agente bot
  function dibujarAgente(x, y, activo, tick) {
    const ojoColor = activo ? ((Math.floor(tick / 14) % 4 === 0) ? '#2DD4BF' : '#5EEAD4') : '#4D7266';
    const pal = {
      m: activo ? '#0F766E' : '#2A3C34', // metal cuerpo
      b: '#476759', // bordes
      c: '#10211A', // pantalla visor
      o: ojoColor,  // ojos visor
      a: '#FBBF24', // antena luz
      p: '#1E2B25'  // base/ruedas
    };
    const flotacion = activo ? (Math.floor(tick / 20) % 2) : 0;
    const mapa = [
      '...aa...',
      '..baab..',
      '.bccccb.',
      '.bcoocb.',
      '.bccccb.',
      '..mmmm..',
      '.bmmmmb.',
      '.bmmmmb.',
      '..pppp..'
    ];
    sprite(mapa, x, y + flotacion, pal, 2);
  }

  // Carpeta de tareas física
  function dibujarCarpeta(x, y, estado, activa, tick) {
    const pal = obtenerPaleta();
    const colorCarpeta = activa ? '#F59E0B' : '#B45309';
    const colorSolapa = activa ? '#FDE68A' : '#D97706';

    // Sombra
    rect(x + 2, y + 2, 60, 44, pal.oscuro ? '#090D0B' : '#D1D9D3');
    // Cuerpo carpeta
    rect(x, y, 60, 44, colorCarpeta);
    // Solapa
    rect(x, y - 6, 26, 7, colorSolapa);
    lineaH(x, y - 6, 26, pal.oscuro ? '#78350F' : '#92400E');
    lineaH(x, y, 60, pal.oscuro ? '#78350F' : '#92400E');

    // Tarjeta que asoma
    const elev = activa ? 8 : 2;
    rect(x + 6, y - elev, 48, 40, pal.papel);
    rect(x + 6, y - elev, 48, 1, pal.papelBorde);
    lineaV(x + 6, y - elev, 40, pal.papelBorde);
    lineaV(x + 53, y - elev, 40, pal.papelBorde);

    // Líneas de texto simuladas
    lineaH(x + 10, y - elev + 5, 24, pal.acento, 2);
    lineaH(x + 10, y - elev + 10, 38, pal.textoApagado, 1);
    lineaH(x + 10, y - elev + 14, 32, pal.textoApagado, 1);

    // Estado tag
    if (estado === 'CERRADA') {
      rect(x + 10, y - elev + 20, 38, 9, pal.acentoSuave);
      texto('CERRADA', x + 12, y - elev + 25, pal.acento, 8, 'left', true);
    } else {
      rect(x + 10, y - elev + 20, 36, 9, pal.verdeSuave);
      texto('ABIERTA', x + 12, y - elev + 25, pal.verde, 8, 'left', true);
    }
  }

  // Terminal pixel art
  function dibujarTerminal(x, y, w, h, cmd, activa, tick) {
    const pal = obtenerPaleta();
    // Borde ventana
    rect(x, y, w, h, pal.terminalBorde);
    rect(x + 1, y + 1, w - 2, h - 2, pal.terminalFondo);

    // Barra superior
    rect(x + 1, y + 1, w - 2, 12, pal.oscuro ? '#1C2822' : '#22332B');
    rect(x + 4, y + 4, 4, 4, '#EF4444');
    rect(x + 11, y + 4, 4, 4, '#F59E0B');
    rect(x + 18, y + 4, 4, 4, '#10B981');
    texto('bash · tasks', x + w / 2, y + 6, pal.textoApagado, 8, 'center');

    // Prompt y texto
    texto('$', x + 6, y + 22, pal.terminalCian, 9, 'left', true);
    const visibleCmd = activa ? cmd.slice(0, Math.min(cmd.length, Math.floor(tick / 2))) : cmd;
    texto(visibleCmd, x + 15, y + 22, pal.terminalVerde, 9, 'left');

    if (activa && (Math.floor(tick / 16) % 2 === 0)) {
      const cursorX = x + 15 + ctx.measureText(visibleCmd).width;
      rect(cursorX + 2, y + 17, 5, 10, pal.terminalCian);
    }
  }

  // Archivador del historial de Git
  function dibujarArchivadorGit(x, y, activo, tick) {
    const pal = obtenerPaleta();
    // Mueble archivador
    rect(x, y, 76, 84, pal.gitCaja);
    rect(x + 2, y + 2, 72, 80, pal.oscuro ? '#0F172A' : '#1E293B');

    // Título Git
    rect(x + 4, y + 5, 68, 12, pal.oscuro ? '#1E293B' : '#334155');
    texto('GIT · HEAD', x + 38, y + 11, pal.gitCommit, 8, 'center', true);

    // Cajón 1: commits
    rect(x + 6, y + 22, 64, 26, pal.oscuro ? '#1E293B' : '#334155');
    lineaH(x + 6, y + 22, 64, pal.oscuro ? '#334155' : '#475569');
    rect(x + 30, y + 33, 16, 4, pal.gitCommit);

    // Nodos de commit ilustrados
    const pulso = activo ? (Math.floor(tick / 14) % 2) : 0;
    rect(x + 14, y + 32, 6, 6, '#38BDF8');
    rect(x + 20, y + 34, 10, 2, '#475569');
    rect(x + 50, y + 32, 6 + pulso, 6 + pulso, activo ? '#4ADE80' : '#38BDF8');

    // Cajón 2: ramas
    rect(x + 6, y + 52, 64, 26, pal.oscuro ? '#1E293B' : '#334155');
    lineaH(x + 6, y + 52, 64, pal.oscuro ? '#334155' : '#475569');
    rect(x + 30, y + 63, 16, 4, pal.gitCommit);
    texto('main', x + 16, y + 65, pal.textoApagado, 8, 'left');
  }

  // Adjunto local (ej. calibracion.csv)
  function dibujarAdjunto(x, y, activo, tick) {
    const pal = obtenerPaleta();
    rect(x, y, 38, 48, pal.papel);
    rect(x, y, 38, 1, pal.papelBorde);
    lineaV(x, y, 48, pal.papelBorde);
    lineaV(x + 37, y, 48, pal.papelBorde);
    lineaH(x, y + 47, 38, pal.papelBorde);

    // Pestaña doblada
    rect(x + 26, y, 12, 12, pal.oscuro ? '#1A241F' : '#E2E8F0');
    lineaH(x + 26, y + 12, 12, pal.papelBorde);
    lineaV(x + 26, y, 12, pal.papelBorde);

    // Etiqueta CSV
    rect(x + 4, y + 6, 20, 8, pal.ambarSuave);
    texto('.csv', x + 6, y + 10, pal.ambar, 7, 'left', true);

    // Tabla simulada
    lineaH(x + 4, y + 18, 30, pal.acento, 1);
    lineaH(x + 4, y + 24, 30, pal.textoApagado, 1);
    lineaH(x + 4, y + 30, 30, pal.textoApagado, 1);
    lineaH(x + 4, y + 36, 30, pal.textoApagado, 1);

    if (activo) {
      // Indicador de copia exitosa
      texto('✓', x + 28, y + 40, pal.verde, 10, 'center', true);
    }
  }

  // Dibujar toda la escena
  function dibujar() {
    const pal = obtenerPaleta();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo general
    rect(0, 0, canvas.width, canvas.height, pal.fondo);

    // Piso del taller / tablero
    rect(0, 240, canvas.width, 80, pal.piso);
    lineaH(0, 240, canvas.width, pal.pisoLinea, 2);

    // Zócalo y cuadrícula suave del fondo
    for (let gx = 0; gx < canvas.width; gx += 40) {
      lineaV(gx, 0, 240, pal.lineaGuia, 1);
    }
    for (let gy = 0; gy < 240; gy += 40) {
      lineaH(0, gy, canvas.width, pal.lineaGuia, 1);
    }

    // Identificador de la escena
    texto('TABLERO DE TRABAJO LOCAL · ORACLE TASK', 20, 16, pal.textoApagado, 9, 'left', true);
    texto(`ETAPA ${ETAPAS[actual].numero} / 05 · ${ETAPAS[actual].etiqueta.toUpperCase()}`, canvas.width - 20, 16, pal.acento, 9, 'right', true);

    // 5 Estaciones marcadas en el piso
    const estacionesX = [100, 280, 480, 680, 860];
    estacionesX.forEach((ex, idx) => {
      const estaActiva = (idx === actual);
      // Marcador de estación
      rect(ex - 60, 246, 120, 4, estaActiva ? pal.acento : pal.pisoLinea);
      texto(`ESTACIÓN ${String(idx + 1).padStart(2, '0')}`, ex, 260, estaActiva ? pal.acento : pal.textoApagado, 8, 'center', estaActiva);

      if (estaActiva) {
        // Spotlight suave
        ctx.save();
        ctx.fillStyle = pal.acentoSuave;
        ctx.globalAlpha = pal.oscuro ? 0.25 : 0.45;
        ctx.beginPath();
        ctx.moveTo(ex - 40, 240);
        ctx.lineTo(ex + 40, 240);
        ctx.lineTo(ex + 60, 40);
        ctx.lineTo(ex - 60, 40);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });

    // Flechas de flujo entre estaciones
    for (let i = 0; i < 4; i++) {
      const x1 = estacionesX[i] + 55;
      const x2 = estacionesX[i + 1] - 55;
      const recorrida = (actual > i);
      lineaH(x1, 275, x2 - x1, recorrida ? pal.acento : pal.pisoLinea, 1);
      texto('›', (x1 + x2) / 2, 275, recorrida ? pal.acento : pal.textoApagado, 10, 'center');
    }

    // --- Estación 1: Crear tarea (x=100) ---
    dibujarTerminal(30, 60, 140, 70, 'tasks new ...', actual === 0, ticks);
    dibujarCarpeta(70, 160, actual >= 3 && actual !== 4 ? 'CERRADA' : 'ABIERTA', actual === 0, ticks);
    dibujarPersona(150, 185, actual === 0, ticks);

    // --- Estación 2: Evidencia y adjuntos (x=280) ---
    dibujarTerminal(210, 60, 140, 70, 'tasks note + attach', actual === 1, ticks);
    dibujarCarpeta(250, 160, 'ABIERTA', actual === 1, ticks);
    dibujarAdjunto(320, 155, actual === 1, ticks);

    // --- Estación 3: Relevo (x=480) ---
    dibujarTerminal(410, 60, 140, 70, '## Próximo paso', actual === 2, ticks);
    dibujarPersona(440, 185, actual === 2, ticks);
    dibujarCarpeta(470, 170, 'ABIERTA', actual === 2, ticks);
    dibujarAgente(520, 187, actual === 2, ticks);

    // Conector del relevo
    if (actual === 2) {
      texto('RELEVO ⇄', 495, 145, pal.acento, 9, 'center', true);
    }

    // --- Estación 4: Cierre y Git (x=680) ---
    dibujarTerminal(610, 60, 140, 70, 'tasks close + commit', actual === 3, ticks);
    dibujarCarpeta(630, 160, 'CERRADA', actual === 3, ticks);
    dibujarPersona(675, 185, actual === 3, ticks);
    dibujarArchivadorGit(715, 145, actual === 3, ticks);

    // --- Estación 5: Reabrir (x=860) ---
    dibujarTerminal(800, 60, 130, 70, 'tasks reopen', actual === 4, ticks);
    dibujarCarpeta(830, 160, 'ABIERTA', actual === 4, ticks);
    dibujarPersona(890, 185, actual === 4, ticks);
    if (actual === 4) {
      texto('REABIERTA ↺', 860, 145, pal.verde, 9, 'center', true);
    }
  }

  // --- Actualización de la UI y accesibilidad ---
  function actualizarUI(debeEnfocar = false) {
    const s = ETAPAS[actual];

    // Texto accesible sincronizado
    if ($('etapa-responsable')) $('etapa-responsable').textContent = s.responsable;
    if ($('etapa-titulo')) $('etapa-titulo').textContent = s.titulo;
    if ($('etapa-explicacion')) $('etapa-explicacion').textContent = s.explicacion;
    if ($('etapa-comando')) $('etapa-comando').textContent = s.comando;
    if ($('etapa-entra')) $('etapa-entra').textContent = s.entra;
    if ($('etapa-sale')) $('etapa-sale').textContent = s.sale;
    if ($('etapa-quien')) $('etapa-quien').textContent = s.quien;
    if ($('etapa-limite')) $('etapa-limite').textContent = s.limite;
    if ($('etapa-simulacion')) $('etapa-simulacion').textContent = s.simulacion;

    // Actualizar botones de selector de etapa
    document.querySelectorAll('[data-etapa]').forEach((btn) => {
      const num = parseInt(btn.getAttribute('data-etapa'), 10);
      if (num === actual) {
        btn.setAttribute('aria-current', 'step');
        btn.classList.add('activa');
      } else {
        btn.removeAttribute('aria-current');
        btn.classList.remove('activa');
      }
    });

    // Controles de transporte
    if ($('btn-anterior')) $('btn-anterior').disabled = (actual === 0);
    if ($('btn-siguiente')) $('btn-siguiente').disabled = (actual === ETAPAS.length - 1);
    if ($('contador-etapas')) $('contador-etapas').textContent = `${s.numero} / 05`;
    if ($('estado-movimiento')) {
      $('estado-movimiento').textContent = reducedMotion.matches
        ? 'Movimiento reducido activo: avanzá manualmente con los controles.'
        : reproduciendo
          ? 'Reproduciendo recorrido animado paso a paso...'
          : 'Pausado. Avanzá con los controles o atajos de teclado.';
    }

    // Botón Play
    if ($('btn-play')) {
      $('btn-play').setAttribute('aria-pressed', String(reproduciendo));
      $('btn-play').disabled = reducedMotion.matches;
      if ($('icono-play')) $('icono-play').textContent = reproduciendo ? '⏸' : '▶';
      if ($('texto-play')) $('texto-play').textContent = reproduciendo ? 'Pausar' : 'Reproducir';
    }

    // Fallback de texto del canvas
    if (canvas) {
      canvas.setAttribute('aria-label', `Escena pixel art interactiva: Etapa ${s.numero} de 05: ${s.titulo}. Responsable: ${s.responsable}.`);
    }

    dibujar();

    if (debeEnfocar && $('etapa-titulo')) {
      $('etapa-titulo').tabIndex = -1;
      $('etapa-titulo').focus({ preventScroll: true });
    }
  }

  function irAEtapa(n, desdeUsuario = false) {
    actual = Math.max(0, Math.min(ETAPAS.length - 1, n));
    ticks = 0;
    actualizarUI(desdeUsuario);
  }

  function detener() {
    reproduciendo = false;
    clearTimeout(timerAuto);
    cancelAnimationFrame(animFrame);
    timerAuto = null;
    animFrame = null;
    actualizarUI();
  }

  function loopAnimacion() {
    if (!reproduciendo || reducedMotion.matches) return;
    ticks++;
    dibujar();
    animFrame = requestAnimationFrame(loopAnimacion);
  }

  function iniciar() {
    if (reducedMotion.matches) return;
    clearTimeout(timerAuto);
    cancelAnimationFrame(animFrame);
    reproduciendo = true;
    actualizarUI();
    animFrame = requestAnimationFrame(loopAnimacion);

    clearTimeout(timerAuto);
    timerAuto = setTimeout(() => {
      if (!reproduciendo) return;
      if (actual < ETAPAS.length - 1) {
        irAEtapa(actual + 1);
        iniciar();
      } else {
        detener();
      }
    }, 5500);
  }

  function reiniciar() {
    detener();
    irAEtapa(0, true);
  }

  // --- Listeners de botones ---
  if ($('btn-play')) {
    $('btn-play').addEventListener('click', () => {
      if (reproduciendo) detener();
      else iniciar();
    });
  }

  if ($('btn-anterior')) {
    $('btn-anterior').addEventListener('click', () => {
      detener();
      irAEtapa(actual - 1, true);
    });
  }

  if ($('btn-siguiente')) {
    $('btn-siguiente').addEventListener('click', () => {
      detener();
      irAEtapa(actual + 1, true);
    });
  }

  if ($('btn-reiniciar')) {
    $('btn-reiniciar').addEventListener('click', reiniciar);
  }

  document.querySelectorAll('[data-etapa]').forEach((btn) => {
    btn.addEventListener('click', () => {
      detener();
      const n = parseInt(btn.getAttribute('data-etapa'), 10);
      irAEtapa(n, true);
    });
  });

  // Botón Copiar comando de la etapa
  if ($('btn-copiar-etapa')) {
    $('btn-copiar-etapa').addEventListener('click', () => {
      const cmd = ETAPAS[actual].comando;
      navigator.clipboard.writeText(cmd)
        .then(() => {
          const btn = $('btn-copiar-etapa');
          const original = btn.textContent;
          btn.textContent = '¡Copiado!';
          setTimeout(() => { btn.textContent = original; }, 1600);
        })
        .catch(() => {});
    });
  }

  // Botones de copia en terminales de 60s
  document.querySelectorAll('.btn-copiar-cmd').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd') || '';
      if (!cmd) return;
      navigator.clipboard.writeText(cmd)
        .then(() => {
          const original = btn.textContent;
          btn.textContent = '¡Copiado!';
          setTimeout(() => { btn.textContent = original; }, 1600);
        })
        .catch(() => {});
    });
  });

  // Atajos de teclado en el contenedor interactivo
  const contenedorEscena = $('taller-escena');
  if (contenedorEscena) {
    contenedorEscena.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        detener();
        irAEtapa(actual + 1, true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        detener();
        irAEtapa(actual - 1, true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        reiniciar();
      } else if (e.key === ' ' && e.target === contenedorEscena) {
        e.preventDefault();
        if (reproduciendo) detener();
        else iniciar();
      }
    });
  }

  // Escuchar cambios de preferencia de movimiento o visibilidad de pestaña
  reducedMotion.addEventListener('change', () => {
    detener();
    actualizarUI();
  });

  darkMode.addEventListener('change', () => {
    dibujar();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) detener();
  });

  // Inicializar vista
  actualizarUI();
})();
