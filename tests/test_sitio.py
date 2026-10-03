"""Las páginas de documentación del sitio se generan desde los `.md` y no pueden quedar atrás."""

from __future__ import annotations

import importlib.util
import re
import sys
import unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]

# Asegurar la carga de tools.sitio desde este repositorio
spec = importlib.util.spec_from_file_location("tools.sitio", RAIZ / "tools/sitio.py")
sitio = importlib.util.module_from_spec(spec)
sys.modules["tools.sitio"] = sitio
spec.loader.exec_module(sitio)


class LasPaginasDelSitioEstanAlDiaTests(unittest.TestCase):
    def test_cada_pagina_publicada_es_exactamente_la_generada(self) -> None:
        for p in sitio.PAGINAS:
            with self.subTest(pagina=p.salida):
                publicada = (sitio.DOCS / p.salida).read_text(encoding="utf-8")
                self.assertEqual(
                    publicada,
                    sitio.pagina(p),
                    f"docs/{p.salida} quedó atrás: regenerala con `python tools/sitio.py --escribir`",
                )

    def test_referencia_md_esta_al_dia(self) -> None:
        ref_path = sitio.DOCS / "referencia.md"
        self.assertTrue(ref_path.is_file(), "docs/referencia.md debe existir")
        actual = ref_path.read_text(encoding="utf-8")
        generado = sitio.generar_referencia_md()
        self.assertEqual(
            actual,
            generado,
            "docs/referencia.md quedó atrás respecto a la ayuda del CLI: regenerala con `python tools/sitio.py --escribir`",
        )


class LosEnlacesInternosExistenTests(unittest.TestCase):
    def test_todos_los_enlaces_internos_existen(self) -> None:
        html_files = sorted(sitio.DOCS.glob("**/*.html"))
        self.assertGreaterEqual(len(html_files), 5, "Deben existir al menos 5 páginas HTML en docs/")

        for hf in html_files:
            contenido = hf.read_text(encoding="utf-8")
            hrefs = re.findall(r'<a\s+[^>]*href="([^"]+)"', contenido)
            for href in hrefs:
                if href.startswith(("http://", "https://", "mailto:")):
                    continue
                with self.subTest(archivo=hf.name, enlace=href):
                    ruta, _, ancla = href.partition("#")
                    if not ruta:
                        self.assertTrue(
                            f'id="{ancla}"' in contenido or f'name="{ancla}"' in contenido,
                            f"En {hf.name}: ancla #{ancla} no existe en el documento",
                        )
                    else:
                        if ruta in ("./", ""):
                            destino = hf.parent / "index.html"
                        elif ruta.endswith("/"):
                            destino = (hf.parent / ruta / "index.html").resolve()
                        else:
                            destino = (hf.parent / ruta).resolve()
                        self.assertTrue(
                            destino.exists(),
                            f"En {hf.name}: el archivo destino {destino} no existe",
                        )
                        if ancla:
                            contenido_destino = destino.read_text(encoding="utf-8")
                            self.assertTrue(
                                f'id="{ancla}"' in contenido_destino or f'name="{ancla}"' in contenido_destino,
                                f"En {hf.name}: ancla #{ancla} no existe en {destino.name}",
                            )


class ElConvertidorTests(unittest.TestCase):
    def convertir(self, md: str) -> str:
        c = sitio.Convertidor(sitio.DOCS / "x.md", sitio.DOCS / "x.html")
        return c.bloques(md.splitlines())

    def test_un_enlace_a_otro_md_del_sitio_va_a_su_pagina(self) -> None:
        salida = self.convertir("[Guía](guia.md#2-crear-tareas)")
        self.assertIn('href="guia.html#2-crear-tareas"', salida)

    def test_un_enlace_a_un_archivo_del_repo_va_a_github(self) -> None:
        salida = self.convertir("[cli](../oracle_task/cli.py)")
        self.assertIn(f'href="{sitio.REPO}/blob/main/oracle_task/cli.py"', salida)

    def test_una_lista_anidada_queda_anidada(self) -> None:
        self.assertIn("<li>dos\n<ul><li>dos.a</li></ul></li>", self.convertir("- uno\n- dos\n  - dos.a"))

    def test_el_codigo_se_escapa_y_no_se_interpreta(self) -> None:
        salida = self.convertir("```\n<b>**no**</b>\n```")
        self.assertIn("&lt;b&gt;**no**&lt;/b&gt;", salida)

    def test_una_tabla_se_convierte_en_tabla(self) -> None:
        salida = self.convertir("| a | b |\n|---|---|\n| 1 | 2 |")
        self.assertIn("<th>a</th>", salida)
        self.assertIn("<td>2</td>", salida)
