# Suite de pruebas de oracle_task

import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
if str(RAIZ) not in sys.path or sys.path[0] != str(RAIZ):
    sys.path.insert(0, str(RAIZ))
