const fs=require('node:fs');
const replacements=[
 ['<h4>The brief</h4>','<h4>The idea</h4>'],
 ['<h4>The decisions</h4>','<h4>How it took shape</h4>'],
 ['Explore a welcoming website for a fictional catering business, with room for both celebrations and everyday meals.','Good food can make a big celebration feel special and an ordinary week feel easier. I imagined a catering business that cared about both, with a website that felt as welcoming as sitting down at its table.'],
 ['Editorial typography, food photography, and a calm green palette support selectable sample menus and a local enquiry preview.','Warm greens, generous food photography, and an unhurried layout set that feeling. Sample menus give visitors something to picture, while the enquiry flow starts with the occasion they have in mind.'],
 ['Make it easier to browse materials and describe a fabrication project, even when dimensions or specifications are still uncertain.','Some people know the exact steel section they need. Others have a rough sketch and an idea they want to make real. This concept gives both a comfortable starting point, without expecting everyone to speak the language of fabrication.'],
 ['A restrained navy-and-amber system, direct catalogue actions, and a custom enquiry mode. Visitors can select drawings locally and review an editable summary.','The material catalogue offers a straightforward route for familiar jobs. For everything else, there is room to describe an idea, add a drawing, and work through the details in an enquiry preview.'],
 ['Explore a distinctive online home for a fictional music producer, with the atmosphere of a late-night listening session.','The starting point was the feeling of making music after the rest of the world has gone quiet. I wanted a place where someone could settle in, put a track on, and get a sense of the person behind the sound.'],
 ['A fixed Studio / Split composition, warm ink-and-amber colours, a code-drawn interactive record, and a playable track list.','Warm amber, dark surfaces, and a spinning record bring that late-night mood into the page. The tracks stay close at hand, so listening feels like the natural next step.'],
 ['A palette<br />with purpose beyond visuals.','a palette<br />with a purpose<br />beyond visuals.']
];
for(const file of ['studio/index.html','studio/portfolio-preview.html']) {
 let text=fs.readFileSync(file,'utf8');for(const [from,to]of replacements)text=text.split(from).join(to);fs.writeFileSync(file,text);
}
const pages={
 'index.html':'section-navigation.js','video-preview.html':'section-navigation.js',
 'studio/index.html':'../section-navigation.js','studio/portfolio-preview.html':'../section-navigation.js',
 'studio/projects/catering/index.html':'../../../section-navigation.js',
 'studio/projects/rivet-beam/index.html':'../../../section-navigation.js',
 'studio/projects/afterhours/index.html':'../../../section-navigation.js'
};
for(const [file,script]of Object.entries(pages)) {
 let text=fs.readFileSync(file,'utf8');if(!text.includes(`src="${script}"`))text=text.replace('</body>',`<script src="${script}"></script>\n</body>`);fs.writeFileSync(file,text);
}
const catering='studio/projects/catering/script.js';
let code=fs.readFileSync(catering,'utf8');code=code.split('// Land section links on the content people came to see, rather than its padding.')[0];fs.writeFileSync(catering,code);
const generator='studio/prepare-afterhours.cjs';
code=fs.readFileSync(generator,'utf8');code=code.replace('<script src="afterhours-audio.js"></script>','<script src="afterhours-audio.js"></script><script src="../../../section-navigation.js"></script>');fs.writeFileSync(generator,code);
