"""La guía paso a paso corre de verdad y sus salidas coinciden con las reales."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]

# Asegurar la carga de tools.guia desde este repositorio
spec = importlib.util.spec_from_file_location("tools.guia", RAIZ / "tools/guia.py")
guia = importlib.util.module_from_spec(spec)
sys.modules["tools.guia"] = guia
spec.loader.exec_module(guia)


class LaGuiaPasoAPasoTests(unittest.TestCase):
    def test_la_guia_corre_y_sus_salidas_coinciden(self) -> None:
        """Comprueba que docs/guia.md ejecute limpio y sus salidas coincidan exactamente."""
        try:
            guia.verificar(escribir=False)
        except AssertionError as e:
            self.fail(f"La guía no coincide con la salida real: {e}")
        except Exception as e:
            self.fail(f"Error inesperado al ejecutar la guía: {e}")
