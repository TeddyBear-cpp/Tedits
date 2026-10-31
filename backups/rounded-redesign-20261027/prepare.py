from pathlib import Path
from PIL import Image
import shutil, re
root = Path(r'C:\Tedits portfolio')
site = root / 'studio'
backup = root / 'backups/rounded-redesign-20261027/before'
for name in ['index.html','why-teditstudio.html','enquire.html','studio.js','portfolio-preview.html']:
    source=site/name
    if source.exists():
        backup.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,backup/name)
assets=site/'assets/clouds'
assets.mkdir(parents=True,exist_ok=True)
for source,name in [('hero-animation/assets/cloud-plate.png','sky.webp'),('hero-animation/assets/hands-cutout.png','hands.webp'),('hero-parallax/assets/cloud-bank.png','cloud-bank.webp')]:
    Image.open(root/source).save(assets/name,'WEBP',quality=88,method=6)
hero='''<section class="wrap cloud-scene" id="cloud-scene" data-motion="off" aria-labelledby="hero-title">
      <div class="cloud-pin"><div class="cloud-hero" id="cloud-hero">
        <div class="cloud-art" role="img" aria-label="Two hands reaching towards one another through a soft, cloud-filled sky.">
          <div class="cloud-sky" data-cloud-layer="sky"><img src="assets/clouds/sky.webp" alt="" fetchpriority="high" width="1672" height="940"></div>
          <div class="cloud-plane cloud-far" data-cloud-layer="far"><img src="assets/clouds/cloud-bank.webp" alt="" decoding="async"></div>
          <div class="cloud-plane cloud-middle" data-cloud-layer="middle"><img src="assets/clouds/cloud-bank.webp" alt="" decoding="async"></div>
          <div class="cloud-hands"><img src="assets/clouds/hands.webp" alt="" fetchpriority="high" width="1672" height="940"></div>
          <div class="cloud-plane cloud-front" data-cloud-layer="front"><img src="assets/clouds/cloud-bank.webp" alt="" decoding="async"></div>
          <div class="cloud-veil"></div>
        </div>
        <p class="cloud-kicker">Independent web design · Zambia &amp; worldwide</p>
        <div class="cloud-copy"><h1 id="hero-title">Design that<br><span>connects.</span></h1><p>Thoughtful websites, shaped around you.</p><a class="round-action" href="#work">Explore the work <span aria-hidden="true">↗</span></a></div>
        <div class="cloud-footer"><span>Good things start with a connection.</span><button id="cloud-motion-toggle" type="button" aria-pressed="false" hidden>Scroll motion off</button></div>
      </div></div>
    </section>'''
for filename,kind in [('index.html','home'),('why-teditstudio.html','why'),('enquire.html','enquire')]:
    p=site/filename
    html=p.read_text(encoding='utf-8')
    html=html.replace('</head>','  <link rel="stylesheet" href="studio-rounded.css?v=1">\n</head>')
    html=html.replace('<body id="top">',f'<body id="top" class="rounded-studio rounded-{kind}">')
    if kind=='home':
        html=re.sub(r'<section class="wrap hero"[\s\S]*?</section>',hero,html,count=1)
        html=html.replace('<script src="studio-hero.js"></script>','<script src="studio-clouds.js"></script>')
        html=html.replace('Different businesses.<br>Distinct perspectives.','A few different<br>points of view.')
        html=html.replace('From first idea<br>to a considered website.','From idea<br>to online.')
        html=html.replace('One creative.<br>A few ways to<br><span>bring ideas to life.</span>','One creative.<br><span>Many possibilities.</span>')
    if kind=='why':
        html=html.replace('<link rel="stylesheet" href="studio-theme.css">','<link rel="stylesheet" href="studio-hero.css">\n  <link rel="stylesheet" href="studio-theme.css">')
        html=html.replace('<div class="service-hero-glow" aria-hidden="true"></div>\n      <canvas class="service-wave-canvas" aria-hidden="true"></canvas>','<div class="hero-art" aria-hidden="true"><canvas></canvas><div class="hero-art-fallback"><i></i><i></i><i></i></div><div class="hero-art-veil"></div></div>')
        html=html.replace('<h1 id="service-title">Someone is looking for<br>','<p class="opportunity-intro">Someone is looking for</p>\n      <h1 id="service-title">')
        html=html.replace('<button class="wave-toggle" type="button" aria-pressed="false" hidden>Pause waves</button>','<button class="hero-motion-toggle" id="hero-motion-toggle" type="button" aria-label="Pause background motion" aria-pressed="false" hidden>Pause motion</button>')
        html=html.replace('<script src="studio-waves.js?v=2"></script>','<script src="studio-hero.js"></script>')
    p.write_text(html,encoding='utf-8')
p=site/'studio.js'
p.write_text(p.read_text(encoding='utf-8').replace('studioMotionPreference.matches||!element.animate','studioMotionPreference.matches||!element||!element.animate'),encoding='utf-8')
