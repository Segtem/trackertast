"""Entry point propio para trackertast.

    tasks <verbo> [opciones]
    tasks --help
    tasks --version

Los verbos canónicos son en inglés y los verbos históricos en español se conservan como alias.
"""

from __future__ import annotations

import sys
from typing import Sequence

from trackertast import __version__, tasks

VERBOS_CANONICOS: tuple[str, ...] = (
    "init",
    "new",
    "list",
    "show",
    "close",
    "reopen",
    "review",
    "note",
    "attach",
    "search",
    "refs",
    "summary",
    "follow",
    "facts",
    "tag",
    "untag",
    "graph",
)

ALIAS: dict[str, str] = {
    "nueva": "new",
    "listar": "list",
    "ls": "list",
    "ver": "show",
    "cerrar": "close",
    "reabrir": "reopen",
    "revisar": "review",
    "anotar": "note",
    "adjuntar": "attach",
    "buscar": "search",
    "referencias": "refs",
    "resumen": "summary",
    "seguimiento": "follow",
    "hechos": "facts",
    "etiquetar": "tag",
    "desetiquetar": "untag",
    "grafo": "graph",
}


def sin_bandera(argv: list[str]) -> list[str]:
    """El resto de los argumentos, sin `--proyecto <ruta>`."""
    salida: list[str] = []
    saltar = False
    for i, a in enumerate(argv):
        if saltar:
            saltar = False
            continue
        if a == "--proyecto":
            saltar = True
            continue
        salida.append(a)
    return salida


def ayuda() -> None:
    tasks.ayuda()


def version() -> None:
    print(f"tasks {__version__}")


def _verbo_desconocido(palabra: str) -> int:
    print(f"verbo desconocido para «tasks»: {palabra}", file=sys.stderr)
    print(f"Verbos disponibles: {', '.join(VERBOS_CANONICOS)}", file=sys.stderr)
    return 1


def resolver_verbo(palabra: str) -> str | None:
    """Resuelve una palabra (canónica o alias) a su verbo canónico."""
    limpio = palabra.lstrip("-")
    if limpio in VERBOS_CANONICOS:
        return limpio
    if limpio in ALIAS:
        return ALIAS[limpio]
    return None


def main(argv: Sequence[str] | None = None) -> int:
    argv_lista = list(sys.argv[1:] if argv is None else argv)
    posicionales = sin_bandera(argv_lista)
    if posicionales and posicionales[0] == "tarea":
        posicionales = posicionales[1:]

    if not posicionales or posicionales[0] in ("-h", "--help", "help"):
        if posicionales and posicionales[0] == "help" and len(posicionales) > 1:
            verbo_ayuda = resolver_verbo(posicionales[1])
            if verbo_ayuda is not None:
                return tasks.despachar(verbo_ayuda, ["--help"], argv_lista)
            return _verbo_desconocido(posicionales[1])
        ayuda()
        return 0

    if posicionales[0] in ("-V", "--version", "version"):
        version()
        return 0

    primer_posicional = posicionales[0]
    canonico = resolver_verbo(primer_posicional)

    if canonico is None:
        return _verbo_desconocido(primer_posicional)

    args = posicionales[1:]
    return tasks.despachar(canonico, args, argv_lista)


if __name__ == "__main__":
    sys.exit(main())
