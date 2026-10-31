from pathlib import Path
import shutil,json
root=Path(__file__).resolve().parent.parent
release=root/'backups/publish-200-20261027/checkout'
files=['build-sanity.cjs','build-studio.cjs','studio/index.html','studio/portfolio-preview.html','studio/why-teditstudio.html','studio/enquire.html','studio/studio.js','studio/studio-rounded.css','studio/studio-clouds.js','studio/assets/clouds/sky.webp','studio/assets/clouds/hands.webp','studio/assets/clouds/cloud-bank.webp','studio-teditstudio/generate-seed.cjs','studio-teditstudio/schemaTypes/index.ts','studio-teditstudio/seed.ndjson','studio-teditstudio/service-pages.json','studio-teditstudio/service-pages.ndjson']
for name in files:
    target=release/name
    target.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(root/name,target)
(root/'preview-evidence/rounded-release-manifest.json').write_text(json.dumps({'base':'e88658458a8144200c087a86a922b0f2eac365f5','files':files},indent=2))
print(f'Prepared {len(files)} release files on the latest remote base.')
