"""Read-only source/asset inventory; dependency and generated trees are excluded."""
from pathlib import Path
from collections import defaultdict
import os, re, json, hashlib
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[2]
SKIP = {'.git', 'node_modules', 'node_modules.failed', '_site-video', 'dist', '.sanity', '__pycache__', '.cache', 'out', 'build'}
files = []
for folder, dirs, names in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP]
    for name in names:
        p = Path(folder) / name
        if name.startswith('.env'): continue
        files.append(p)
sizes = {p.relative_to(ROOT).as_posix(): p.stat().st_size for p in files}
groups = defaultdict(lambda: {'files': 0, 'bytes': 0})
texts = {}
for name, size in sizes.items():
    group = name.split('/')[0] if '/' in name else '(root)'
    groups[group]['files'] += 1
    groups[group]['bytes'] += size
    p = ROOT / name
    if p.suffix in {'.html', '.css', '.js', '.cjs', '.mjs', '.json', '.tsx', '.ts'} and size < 2_000_000:
        texts[name] = p.read_text(encoding='utf-8-sig', errors='replace')

refs = defaultdict(list)
for source, text in texts.items():
    if not source.endswith(('.html', '.css', '.js')): continue
    for match in re.finditer(r'''(?:src|href|poster)=["']([^"']+)["']|url\(["']?([^)'"\s]+)''', text):
        value = match[1] or match[2]
        if re.match(r'^(?:[a-z]+:|//|#)', value, re.I): continue
        value = unquote(re.split(r'[?#]', value)[0])
        p = (ROOT / source).parent / value if not value.startswith('/') else ROOT / value.lstrip('/')
        target = Path(os.path.abspath(p)).relative_to(ROOT).as_posix() if Path(os.path.abspath(p)).is_relative_to(ROOT) else ''
        if target in sizes: refs[target].append(source)

public = [n for n in sizes if n.startswith(('studio/assets/', 'studio/projects/', 'Assets/', 'videos/')) and not '/afterhours-source/' in n]
hashes = defaultdict(list)
for name in public:
    if Path(name).suffix.lower() not in {'.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mp3', '.ttf', '.woff2', '.svg'}: continue
    hashes[hashlib.sha256((ROOT / name).read_bytes()).hexdigest()].append(name)
duplicates = [{'files': names, 'bytesEach': sizes[names[0]], 'redundantBytes': sizes[names[0]]*(len(names)-1)} for names in hashes.values() if len(names)>1]
duplicates.sort(key=lambda x:x['redundantBytes'], reverse=True)
result = {
    'scope': 'All source trees excluding dependencies, generated build/output trees and .env files. References are static candidates, not proof of dead code.',
    'groups': dict(sorted(groups.items())),
    'largestPublicAssets': [{'file':n,'bytes':sizes[n],'references':refs[n]} for n in sorted(public, key=lambda n:sizes[n], reverse=True)[:45]],
    'duplicateAssets': duplicates,
    'studioScripts': [{'file':n,'bytes':sizes[n],'references':refs[n]} for n in sizes if re.match(r'^studio/[^/]+\.js$',n)],
    'publicAssetsWithoutStaticReference': [{'file':n,'bytes':sizes[n]} for n in public if not refs[n] and Path(n).suffix.lower() in {'.png','.jpg','.webp','.mp4','.mp3'}],
    'packages': {n:json.loads(t) for n,t in texts.items() if n.endswith('package.json')},
}
(Path(__file__).parent/'inventory.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps({k:result[k] for k in ('groups','largestPublicAssets','duplicateAssets','studioScripts','packages')}, indent=2))
