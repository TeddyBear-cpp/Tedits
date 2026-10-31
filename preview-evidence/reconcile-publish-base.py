from pathlib import Path
import subprocess, shutil, json
root=Path(__file__).resolve().parent.parent
base='1265f18fdb5821cb01a9f2b126fd945d125399bb'
head='e88658458a8144200c087a86a922b0f2eac365f5'
backup=root/'backups/publish-200-20261027'
backup.mkdir(parents=True,exist_ok=True)
def git(*args): return subprocess.check_output(['git',*args],cwd=root)
changes=git('diff','--name-status',base,head).decode().splitlines()
conflicts=[]
for change in changes:
    status,name=change.split('\t',1)
    path=root/name
    if status=='D': continue # Retain local historical assets; they are not added to the release.
    incoming=git('show',f'{head}:{name}')
    original=git('show',f'{base}:{name}') if status!='A' else None
    current=path.read_bytes() if path.exists() else None
    if current==incoming: continue
    if current is not None:
        saved=backup/name
        saved.parent.mkdir(parents=True,exist_ok=True)
        saved.write_bytes(current)
    result=incoming
    if current is not None and current!=original and original is not None:
        files=[backup/'merge-local',backup/'merge-base',backup/'merge-incoming']
        for f,data in zip(files,[current,original,incoming]): f.write_bytes(data.replace(b'\r\n',b'\n'))
        merge=subprocess.run(['git','merge-file','-p',*[str(f) for f in files]],cwd=root,capture_output=True)
        if merge.returncode:
            conflicts.append(name)
            continue
        result=merge.stdout
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(result)
if conflicts: raise SystemExit('Manual merge required: '+', '.join(conflicts))
shutil.copy2(root/'studio/index.html',root/'studio/portfolio-preview.html')
print('Preserved latest remote Tedeats changes; no merge conflicts.')
