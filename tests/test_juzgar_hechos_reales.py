"""Los hechos que emite el tracker, juzgados por Oracle de punta a punta.

Viene de Oracle (tests/test_juzgar.py y tests/test_juzgar_revision.py, «hechos reales del
tracker»): una tarea con un enlace local da VERDE con las políticas de seguimiento, y el mismo
enlace roto da ROJO con el archivo que falta como testigo. Se llama a cada herramienta por su
paquete instalado, como lo haría un proyecto que usa las dos.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
POLITICAS = RAIZ / "ejemplo/seguimiento-tareas"
MEDIDAS = ("--medida", "seguimiento.referencias_locales_presentes",
           "--medida", "seguimiento.lectura_sin_omisiones")


@unittest.skipUnless(shutil.which("git"), "requiere Git")
class HechosRealesJuzgadosPorOracle(unittest.TestCase):
    def setUp(self):
        temporal = tempfile.TemporaryDirectory()
        self.addCleanup(temporal.cleanup)
        self.temporal = Path(temporal.name)
        self.repo = self.temporal / "repo"
        self.repo.mkdir()
        self.env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}

    def correr(self, *args):
        return subprocess.run([sys.executable, "-B", "-m", *args], cwd=self.repo, env=self.env,
                              capture_output=True, text=True, timeout=120)

    def tasks(self, *args):
        return self.correr("oracle_task.cli", "--proyecto", str(self.repo), *args)

    def juzgar(self):
        hechos = self.tasks("facts")
        self.assertEqual(hechos.returncode, 0, hechos.stderr)
        con = self.temporal / "hechos.json"
        con.write_text(hechos.stdout, encoding="utf-8")
        return subprocess.run([str(Path(sys.executable).with_name("oracle")), "juzgar",
                              "--con", str(con), "--proyecto", str(POLITICAS), *MEDIDAS],
                             cwd=self.repo, env=self.env, capture_output=True, text=True, timeout=120)

    def test_un_enlace_local_da_verde_y_roto_da_rojo_con_su_testigo(self):
        self.assertEqual(self.tasks("init").returncode, 0)
        creada = self.tasks("new", "Con captura", "--json")
        self.assertEqual(creada.returncode, 0, creada.stderr)
        documento = self.repo / "tareas" / json.loads(creada.stdout)["id"] / "TAREA.md"
        (documento.parent / "captura.png").write_bytes(b"\x89PNG\r\n\x1a\n")
        documento.write_text(documento.read_text(encoding="utf-8") + "\n[captura](captura.png)\n",
                             encoding="utf-8")

        verde = self.juzgar()
        self.assertEqual(verde.returncode, 0, verde.stdout + verde.stderr)
        self.assertIn("SIN MIRAR", verde.stdout)

        documento.write_text(documento.read_text(encoding="utf-8") + "\n[rota](no-esta.png)\n",
                             encoding="utf-8")
        rojo = self.juzgar()
        self.assertEqual(rojo.returncode, 1, rojo.stdout + rojo.stderr)
        self.assertIn("no-esta.png", rojo.stdout)


if __name__ == "__main__":
    unittest.main()
