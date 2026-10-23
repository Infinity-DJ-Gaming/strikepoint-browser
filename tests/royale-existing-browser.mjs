import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.stack));
try{
 await page.goto('http://127.0.0.1:4181/?test=1');
 await page.waitForFunction(()=>window.__test?.state().ready,null,{timeout:180000});
 assert.ok(await page.locator('a.royale-link').count());
 checks.push('CS2 game loads with the new separate BR entry');
 await page.evaluate(()=>window.CSMenu.select('news'));
 assert.ok((await page.locator('#newsPane').textContent()).includes('THE ISLAND EXPERIMENT'));
 checks.push('Update 10 notes are present in the expandable news list');
 await page.evaluate(()=>window.__test.start(false));
 await page.waitForTimeout(500);
 assert.ok(await page.evaluate(()=>window.__test.state().ready&&window.__test.getGuns().rifle.root.visible));
 checks.push('Existing Dust II native viewmodel still renders');
 assert.equal(errors.length,0);
 console.log('PASS',checks.length,'existing-game checks');
}finally{
 writeFileSync('outputs/update10-qa/existing-game.json',JSON.stringify({checks,errors},null,2));
 await browser.close();
}
