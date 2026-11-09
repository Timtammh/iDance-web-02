import {createRequire} from 'node:module';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const require=createRequire(process.cwd()+'/package.json');
const ts=require('typescript');
function setup(id,dev=false) {
 const source=fs.readFileSync('src/lib/analytics/index.ts','utf8').replaceAll('import.meta.env.VITE_GA4_MEASUREMENT_ID',JSON.stringify(id)).replaceAll('import.meta.env.DEV',String(dev));
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const scripts=[], storage=new Map();
 const c={exports:{},window:{},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},location:{pathname:'/',origin:'https://example.test'},document:{title:'Home',createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},Set,Date};
 vm.runInNewContext(js,c);
 return {a:c.exports,c,scripts,events:()=>Array.from(c.window.dataLayer||[]).map(v=>Array.from(v)).filter(v=>v[0]==='event')};
}
const payload={item_list_id:'home_products_popular',items:[{item_id:'mix',item_name:'Pocket Mix',item_category:'Demo product concepts',index:0}]};
const {a,c,scripts,events}=setup('G-LOCALTEST');
assert.equal(a.track('view_item_list',payload),false); assert.equal(scripts.length,0);
let updates=0;const unsubscribe=a.subscribeAnalyticsConsent(()=>updates++);
a.setConsent('accepted');assert.equal(scripts.length,1);
assert.equal(a.track('view_item_list',payload),true);
assert.equal(events().find(e=>e[1]==='view_item_list')[2],payload);
a.pageView('/','Home');a.pageView('/','Home');assert.equal(events().filter(e=>e[1]==='page_view').length,1);
a.pageView('/products','Products');a.pageView('/','Home');assert.equal(events().filter(e=>e[1]==='page_view').length,3);
a.setConsent('rejected');const size=c.window.dataLayer.length;
assert.equal(a.track('select_item',payload),false);a.pageView('/about','About');
assert.equal(c.window.dataLayer.length,size);assert.equal(c.window['ga-disable-G-LOCALTEST'],true);
a.setConsent('accepted');assert.equal(scripts.length,1);assert.equal(updates,3);
unsubscribe();a.setConsent('rejected');assert.equal(updates,3);
for (const [id,dev] of [['',false],['invalid',false],['G-LOCALTEST',true]]) {
 const no=setup(id,dev);no.a.setConsent('accepted');assert.equal(no.a.track('select_item',payload),false);assert.equal(no.scripts.length,0);assert.equal(no.events().length,0);
}
console.log('PASS: pre-consent/withdrawal gates, typed payload queue, page-view dedupe and route-return count, script singleton/reacceptance, listener cleanup, missing/invalid ID and development no-op. Isolated stubbed runtime; no network.');
