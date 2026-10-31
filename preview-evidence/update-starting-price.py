from pathlib import Path
import json
root = Path(__file__).resolve().parent.parent
for name in ['studio/why-teditstudio.html','studio/enquire.html']:
    path=root/name
    path.write_text(path.read_text(encoding='utf-8').replace('data-cms-price>£100','data-cms-price>£200'),encoding='utf-8')
path=root/'studio-teditstudio/service-pages.json'
docs=json.loads(path.read_text(encoding='utf-8'))
for doc in docs:
    if doc['_id']=='whyPage':
        doc['startingPrice']=200
path.write_text(json.dumps(docs,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
