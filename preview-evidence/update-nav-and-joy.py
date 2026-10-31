from pathlib import Path
import re,shutil
root=Path(__file__).resolve().parent.parent
backup=root/'backups/nav-and-joy-20261027'
pages=['studio/index.html','studio/portfolio-preview.html','studio/why-teditstudio.html','studio/enquire.html','studio/projects/little-joy/index.html']
for name in pages:
    p=root/name
    html=p.read_text(encoding='utf-8')
    saved=backup/name
    saved.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(p,saved)
    def nav_only(match):
        header=match.group()
        header=re.sub(r'<a class="studio-logo"[\s\S]*?</a>','',header,count=1)
        header=re.sub(r'<button class="theme-toggle"[\s\S]*?</button>','',header,count=1)
        state='hero' if name in pages[:2] else 'page'
        return header.replace('class="wrap site-header"',f'class="wrap site-header" data-surface="{state}"')
    html=re.sub(r'<header class="wrap site-header">[\s\S]*?</header>',nav_only,html,count=1)
    html=re.sub(r'(<body class=")([^"]+)',lambda m:m[1]+m[2]+' buttons-nav',html,count=1) if name.endswith('little-joy/index.html') else html.replace('class="rounded-studio ', 'class="rounded-studio buttons-nav ',1)
    if name.endswith('little-joy/index.html'):
        html=html.replace('class="project-case buttons-nav"','class="project-case rounded-studio buttons-nav"')
        home=(root/'studio/index.html').read_text(encoding='utf-8')
        nav=re.search(r'<nav aria-label="Main navigation">[\s\S]*?</nav>',home).group()
        nav=nav.replace('href="#work"','href="../../index.html#work"').replace('href="why-teditstudio.html"','href="../../why-teditstudio.html"').replace('href="enquire.html"','href="../../enquire.html"')
        html=re.sub(r'<nav aria-label="Main navigation">[\s\S]*?</nav>',nav,html,count=1)
        html=html.replace('<link rel="stylesheet" href="case-study.css">','<link rel="stylesheet" href="../../studio-contact.css?v=2"><link rel="stylesheet" href="../../studio-rounded.css?v=3"><link rel="stylesheet" href="case-study.css?v=2">')
        # Give the project introduction its own spread, then show the website at full scale.
        html=html.replace('<section class="wrap case-intro"><div><h1>', '<section class="wrap case-intro"><div class="case-intro-heading"><a class="case-back" href="../../index.html#work">← Back to work</a><h1>')
        html=html.replace('Play Co.</h1><p class="case-lead">','Play Co.</h1></div><div class="case-intro-copy"><p class="case-lead">')
        html=html.replace('</body>','<script src="../../studio-contact.js?v=2"></script><script src="../../studio-navigation.js"></script></body>')
    else:
        html=html.replace('studio-rounded.css?v=2','studio-rounded.css?v=3').replace('studio-rounded.css?v=1','studio-rounded.css?v=3')
        html=html.replace('studio-contact.js?v=1','studio-contact.js?v=2')
        html=html.replace('</body>','<script src="studio-navigation.js"></script>\n</body>')
    p.write_text(html,encoding='utf-8')
print('Updated button-only navigation and Little Joy case-study structure.')
