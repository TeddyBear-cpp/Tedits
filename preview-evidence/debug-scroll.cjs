const {chromium}=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
 const p=await b.newPage({viewport:{width:390,height:900}});
 await p.addInitScript(()=>{window.scrollCalls=[];const original=window.scrollTo.bind(window);window.scrollTo=(...args)=>{const e=document.querySelector('#contact-form');const chain=[];for(let n=e;n;n=n.offsetParent)chain.push({tag:n.tagName,id:n.id,offset:n.offsetTop,transform:getComputedStyle(n).transform});window.scrollCalls.push({args,y:scrollY,rect:e?.getBoundingClientRect().toJSON(),chain});return original(...args);};});
 await p.goto('http://127.0.0.1:8084/index.html');
 for(const selector of ['.skip','.header>a','nav a[href="#work"]','nav a[href="#services"]','nav a[href="#contact"]']){const l=p.locator(selector);if(selector==='.skip'){await l.focus();await p.keyboard.press('Enter');}else await l.click();await p.waitForTimeout(1800);}
 console.log(JSON.stringify(await p.evaluate(()=>({calls:window.scrollCalls,y:scrollY,form:document.querySelector('#contact-form').getBoundingClientRect().toJSON()})),null,2));
 await p.screenshot({path:'preview-evidence/scroll-debug.png'});
}finally{await b.close();}})();
