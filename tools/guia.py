#!/usr/bin/env python3
"""Reconstruye el recorrido de la guía de oracle_task y comprueba sus salidas.

    python tools/guia.py --escribir    # actualiza las salidas de la guía con las reales
    python tools/guia.py               # falla si alguna salida no coincide con la real

Ejecuta cada bloque ```bash paso desde un directorio temporal limpio con git init,
captura la salida de cada comando de tasks y comprueba que coincida con el bloque
```text salida siguiente.
"""

from __future__ import annotations

import argparse
import os
import re
import shlex
import subprocess
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
GUIAS = (RAIZ / "docs/guia.md",)
FENCE = re.compile(r"^```([^\n]*)$")


def bloques(lineas: list[str]):
    """Devuelve (inicio, fin, cabecera, cuerpo), con fin en el cierre del fence."""
    i = 0
    while i < len(lineas):
        m = FENCE.fullmatch(lineas[i].rstrip("\n"))
        if not m:
            i += 1
            continue
        j = i + 1
        while j < len(lineas) and lineas[j].strip() != "```":
            j += 1
        if j == len(lineas):
            raise ValueError(f"Bloque sin cierre en línea {i + 1}")
        yield i, j, m.group(1).split(), "".join(lineas[i + 1:j])
        i = j + 1


def dentro(base: Path, ruta: str) -> Path:
    destino = (base / ruta).resolve()
    if not destino.is_relative_to(base.resolve()) and destino != base.resolve():
        raise ValueError(f"Ruta fuera del proyecto: {ruta}")
    return destino


def actualizar_mapa_ids(temporal: Path, id_map: dict[str, str]) -> None:
    """Detecta las carpetas reales de tareas y las asocia al ID normalizado por su sufijo."""
    raiz_tareas = temporal / "tareas"
    if not raiz_tareas.is_dir():
        return
    for entrada in raiz_tareas.iterdir():
        if entrada.is_dir() and re.match(r"^\d{8}-\d{6}", entrada.name):
            partes = entrada.name.split("-", 2)
            sufijo = partes[2] if len(partes) > 2 else ""
            if sufijo:
                id_map[f"20260927-120000-{sufijo}"] = entrada.name
            else:
                id_map["20260927-120000"] = entrada.name


def normalizar(salida: str, temporal: Path, id_map: dict[str, str]) -> str:
    # 1. Reemplazar IDs reales por sus versiones normalizadas
    for norm, real in sorted(id_map.items(), key=lambda kv: -len(kv[1])):
        salida = salida.replace(real, norm)

    # 2. Reemplazar timestamps residuales en IDs o notas
    salida = re.sub(r"\b\d{8}-\d{6}\b", "20260927-120000", salida)
    salida = re.sub(r"\b\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC\b", "2026-09-27 12:00:00 UTC", salida)

    # 3. Normalizar rutas temporales
    salida = salida.replace(str(temporal), ".")

    # 4. Normalizar identificadores de commit de Git
    salida = re.sub(r"HEAD: [0-9a-f]{40}", "HEAD: <commit>", salida)
    salida = re.sub(r"\[main \(root-commit\) [0-9a-f]+\]", "[main (root-commit) <commit>]", salida)
    salida = re.sub(r"\[main [0-9a-f]+\]", "[main <commit>]", salida)

    # 5. Orden determinista en DOT (grafo)
    def ordenar_dot(m: re.Match) -> str:
        header = m.group(1)
        body = m.group(2)
        lines = [l.strip() for l in body.strip().splitlines() if l.strip()]
        nodos = sorted([l for l in lines if "[label=" in l])
        aristas = sorted([l for l in lines if "->" in l])
        return header + "\n" + "\n".join("  " + l for l in (nodos + aristas)) + "\n}"

    salida = re.sub(r"(digraph\s+\w+\s*\{)([\s\S]*?)\}", ordenar_dot, salida)

    # 6. Orden determinista en líneas de tareas de follow
    if "Repositorio:" in salida and ("sin_seguimiento:" in salida or "sin_cambios:" in salida):
        lineas = salida.strip().splitlines()
        encabezado = [l for l in lineas if not l.startswith("  sin_")]
        filas = sorted([l for l in lineas if l.startswith("  sin_")])
        salida = "\n".join(encabezado[:1] + filas + encabezado[1:]) + "\n"

    return salida.rstrip("\n") + ("\n" if salida else "")


def correr(
    comando: str,
    cwd: Path,
    temporal: Path,
    id_map: dict[str, str],
    falla: bool = False,
) -> tuple[str, Path]:
    comando = comando.replace("\\\n", " ")

    # Sustituir IDs normalizados por los IDs reales creados en disco
    for norm, real in id_map.items():
        comando = comando.replace(norm, real)

    # Manejar redirección a archivo (ej. `echo "..." > archivo`)
    if ">" in comando:
        izquierda, _, derecha = comando.partition(">")
        salida_cmd, _ = correr(izquierda.strip(), cwd, temporal, id_map, falla)
        destino = dentro(cwd, derecha.strip())
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(salida_cmd, encoding="utf-8")
        return "", cwd

    argumentos = shlex.split(comando)
    if not argumentos:
        return "", cwd

    if argumentos[0] == "cd":
        if len(argumentos) != 2:
            raise ValueError(f"cd inválido: {comando}")
        destino = dentro(temporal, str((cwd / argumentos[1]).relative_to(temporal)))
        if not destino.is_dir():
            raise ValueError(f"No existe el directorio {argumentos[1]}")
        return "", destino

    if argumentos[0] == "echo":
        texto = " ".join(argumentos[1:])
        return texto + "\n", cwd

    if argumentos[0] == "tasks":
        argumentos = [sys.executable, "-m", "oracle_task.cli", *argumentos[1:]]
    elif argumentos[0] == "git":
        argumentos = ["git", *argumentos[1:]]
    elif argumentos[0] == "python3":
        argumentos = [sys.executable, *argumentos[1:]]
    else:
        raise ValueError(f"Comando no contemplado en la guía: {comando}")

    entorno = os.environ.copy()
    entorno["PYTHONPATH"] = str(RAIZ)
    entorno["GIT_AUTHOR_DATE"] = "2026-09-27T12:00:00Z"
    entorno["GIT_COMMITTER_DATE"] = "2026-09-27T12:00:00Z"
    # La guía no depende del idioma de la máquina: git traduce sus mensajes («root-commit»,
    # «commit-raíz») y la salida esperada es una sola.
    entorno["LC_ALL"] = "C.UTF-8"
    entorno["LANGUAGE"] = "C"
    entorno.pop("ORACLE_PROYECTO", None)

    p = subprocess.run(
        argumentos,
        cwd=cwd,
        env=entorno,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=120,
    )

    actualizar_mapa_ids(temporal, id_map)
    salida = normalizar(p.stdout, temporal, id_map)

    if falla:
        if p.returncode == 0:
            raise RuntimeError(f"Se esperaba que fallara `{comando}` y terminó exitoso:\n{salida}")
        return salida, cwd

    if p.returncode != 0:
        raise RuntimeError(f"Falló `{comando}` (código {p.returncode}):\n{salida}")

    return salida, cwd


def reemplazar_salidas(lineas: list[str], cambios: list[tuple[int, int, str]]) -> list[str]:
    """Devuelve una copia con los cuerpos de salida nuevos, conservando el resto del documento."""
    resultado = lineas.copy()
    for inicio, fin, salida in reversed(cambios):
        resultado[inicio:fin] = salida.splitlines(keepends=True)
    return resultado


def verificar(escribir: bool = False, guia: Path = GUIAS[0]) -> None:
    lineas = guia.read_text(encoding="utf-8").splitlines(keepends=True)
    encontrados = list(bloques(lineas))
    cambios: list[tuple[int, int, str]] = []

    with tempfile.TemporaryDirectory(prefix="oracle_task-guia-") as tmp:
        temporal = Path(tmp)
        cwd = temporal
        id_map: dict[str, str] = {}

        # Inicializar repositorio Git determinista
        subprocess.run(["git", "init", "-b", "main"], cwd=temporal, check=True, capture_output=True)
        subprocess.run(["git", "config", "user.name", "Guía"], cwd=temporal, check=True, capture_output=True)
        subprocess.run(["git", "config", "user.email", "guia@ejemplo.com"], cwd=temporal, check=True, capture_output=True)
        subprocess.run(["git", "config", "commit.gpgSign", "false"], cwd=temporal, check=True, capture_output=True)

        for n, (inicio, fin, cabecera, cuerpo) in enumerate(encontrados):
            if cabecera not in (["bash", "paso"], ["bash", "paso", "falla"]):
                continue

            falla = cabecera[2:] == ["falla"]
            salida = ""
            comandos: list[str] = []
            for linea in cuerpo.splitlines():
                if (linea.startswith(" ") or linea.endswith("\\")) and comandos:
                    comandos[-1] += "\n" + linea
                else:
                    comandos.append(linea)

            for comando in comandos:
                if comando.strip() and not comando.lstrip().startswith("#"):
                    fragmento, cwd = correr(comando, cwd, temporal, id_map, falla)
                    salida += fragmento

            if n + 1 >= len(encontrados) or encontrados[n + 1][2] != ["text", "salida"]:
                raise ValueError(f"Falta `text salida` después del paso en línea {inicio + 1}")

            si, sf, _, esperado = encontrados[n + 1]
            if salida != esperado:
                if not escribir:
                    raise AssertionError(
                        f"Salida vieja en línea {si + 1} de {guia.relative_to(RAIZ)}.\n"
                        f"Esperado:\n{esperado!r}\nObtenido:\n{salida!r}\n"
                        "Regenerala con `python tools/guia.py --escribir`"
                    )
                cambios.append((si + 1, sf, salida))

    if escribir:
        guia.write_text("".join(reemplazar_salidas(lineas, cambios)), encoding="utf-8")

    pasos_cuenta = sum(b[2][:2] == ["bash", "paso"] for b in encontrados)
    print(f"{guia.relative_to(RAIZ)}: {pasos_cuenta} pasos, {len(cambios)} salidas actualizadas")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--escribir", action="store_true", help="Actualiza los bloques de salida en las guías")
    parser.add_argument("guias", nargs="*", help="Rutas de guías; sin argumentos ejecuta todas")
    args = parser.parse_args()

    try:
        for g in args.guias or GUIAS:
            verificar(args.escribir, Path(g).resolve())
    except (AssertionError, RuntimeError, ValueError, OSError) as e:
        print(e, file=sys.stderr)
        return 1
    return 0


_entrada_directa = {"__main__": main}.get(__name__)
if _entrada_directa:
    raise SystemExit(_entrada_directa())
