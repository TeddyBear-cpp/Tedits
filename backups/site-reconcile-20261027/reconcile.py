"""Import the newer site commit without discarding this checkout's local edits."""
import json
import subprocess
from pathlib import Path

ROOT = Path(r'C:\Tedits portfolio')
SOURCE = Path(r'C:\Users\user\Documents\Codex\2026-10-22\g\work\tedits-feature')
BACKUP = ROOT / 'backups' / 'site-reconcile-20261027'
BASE = '7300a922c0cc9ae5d15eb22ba57ca62000c1b8d1'
INCOMING = '1265f18fdb5821cb01a9f2b126fd945d125399bb'

def git(*args, check=True):
    return subprocess.run(['git', *args], cwd=SOURCE, capture_output=True, check=check)

def blob(ref, path):
    result = git('show', f'{ref}:{path}', check=False)
    return result.stdout if result.returncode == 0 else None

def main():
    BACKUP.mkdir(parents=True, exist_ok=True)
    records = []
    changes = git('diff', '--name-status', BASE, INCOMING).stdout.decode().splitlines()
    for line in changes:
        status, relative = line.split('\t', 1)
        target = ROOT / relative
        if status not in ('A', 'M') or '.git' in Path(relative).parts:
            raise RuntimeError(f'Needs manual review: {line}')
        base, incoming = blob(BASE, relative), blob(INCOMING, relative)
        local = target.read_bytes() if target.exists() else None
        if incoming is None:
            raise RuntimeError(f'Missing incoming blob: {relative}')
        if local == incoming:
            records.append({'path': relative, 'action': 'already-current'})
            continue
        if local is not None:
            saved = BACKUP / 'before' / relative
            saved.parent.mkdir(parents=True, exist_ok=True)
            saved.write_bytes(local)
        output = incoming
        action = 'added' if local is None else 'updated'
        if local is not None and local != base:
            if base is None or any(b'\x00' in b for b in (local, base, incoming)):
                records.append({'path': relative, 'action': 'manual-review'})
                continue
            merge_dir = BACKUP / 'merges' / relative
            merge_dir.mkdir(parents=True, exist_ok=True)
            inputs = [merge_dir / name for name in ('local', 'base', 'incoming')]
            for path, data in zip(inputs, (local, base, incoming)):
                path.write_bytes(data)
            result = subprocess.run(['git', 'merge-file', '-p', *map(str, inputs)], capture_output=True)
            if result.returncode:
                (merge_dir / 'conflict.txt').write_bytes(result.stdout)
                records.append({'path': relative, 'action': 'manual-review'})
                continue
            output, action = result.stdout, 'merged-local-edits'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(output)
        records.append({'path': relative, 'action': action})
    report = {'base': BASE, 'incoming': INCOMING, 'files': records}
    (BACKUP / 'manifest.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    counts = {action: sum(r['action'] == action for r in records) for action in sorted({r['action'] for r in records})}
    print(json.dumps({'counts': counts, 'manual_review': [r['path'] for r in records if r['action'] == 'manual-review']}, indent=2))

if __name__ == '__main__':
    main()
