"""Prueba uv aislada: Trackertast archivado en GitHub -> Oracle Task wheel, sin tocar herramientas del usuario."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--wheel',type=Path,required=True)
    args=parser.parse_args();wheel=args.wheel.resolve()
    with tempfile.TemporaryDirectory(prefix='oracle-task-migration-') as tmp:
        root=Path(tmp);repo=root/'proyecto';repo.mkdir()
        env={**os.environ,'UV_TOOL_DIR':str(root/'tools'),'UV_TOOL_BIN_DIR':str(root/'bin'),
             'UV_CACHE_DIR':str(root/'cache'),'UV_LINK_MODE':'copy','PYTHONDONTWRITEBYTECODE':'1'}
        def run(*cmd):
            p=subprocess.run(cmd,cwd=repo,env=env,text=True,capture_output=True)
            if p.returncode:raise AssertionError(p.stdout+p.stderr)
            return p.stdout.strip()
        run('uv','tool','install','--python','3.13','https://github.com/Segtem/trackertast/releases/download/v0.1.0/trackertast-0.1.0-py3-none-any.whl#sha256=0ce222bbd53a42a8d3917572a5e289261582c10f147cc410652e8387d175331d')
        old=root/'bin/tasks';run(str(old),'init')
        ident=json.loads(run(str(old),'new','Tarea previa a la migración','--sufijo','migracion','--json'))['id']
        before={str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in repo.rglob('*') if p.is_file()}
        run('uv','tool','uninstall','trackertast')
        run('uv','tool','install','--python','3.13',str(wheel))
        after={str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in repo.rglob('*') if p.is_file()}
        assert before==after,'La instalación cambió los datos del proyecto'
        new=root/'bin/oracle-task';alias=root/'bin/tasks'
        for cmd in [new,alias]:
            assert run(str(cmd),'--version')=='oracle-task 0.2.0'
            assert json.loads(run(str(cmd),'show',ident,'--json'))['id']==ident
        run(str(new),'note',ident,'Anotada desde el comando nuevo')
        run(str(alias),'note',ident,'Anotada desde el alias')
        content=(repo/'tareas'/ident/'TAREA.md').read_text()
        assert 'comando nuevo' in content and 'desde el alias' in content
        run(str(new),'close',ident)
        assert 'ESTADO: CERRADA' in (repo/'tareas'/ident/'TAREA.md').read_text()
        run(str(alias),'reopen',ident)
        assert 'ESTADO: ABIERTA' in (repo/'tareas'/ident/'TAREA.md').read_text()
        json.loads(run(str(new),'facts'))
    print('OK: migración uv desde trackertast 0.1.0, datos intactos, ambos comandos operativos y mismo id.')


if __name__=='__main__':main()
