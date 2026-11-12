import {test,expect} from '@playwright/test';
test('TV home, Shorts player, filters, history and responsive layout',async({page})=>{
  const errors:string[]=[]; const external:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/youtube|ytimg/.test(r.url())) external.push(r.url());});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/tv');
  await page.getByRole('button',{name:'Stop intro and enter iDance homepage'}).click();
  await page.getByRole('button',{name:'Reject analytics'}).click();
  await expect(page.getByRole('heading',{name:'iDance TV',exact:true})).toHaveCount(0);
  await expect(page.getByText('SOUND. LIGHT. ACTION.',{exact:true})).toHaveCount(0);
  await expect(page.getByText('See it, Hear it, Feel it',{exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'YouTube channel',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Shorts',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Play Power Space shoot',exact:true})).toBeVisible();
  expect(external).toEqual([]);
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:1000});
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(i=>(i as HTMLImageElement).decode().catch(()=>{}))));
    await page.screenshot({path:`test-results-tv/tv-home-${width}.png`,fullPage:true});
  }
  const short=page.getByRole('button',{name:'Play Power Space shoot',exact:true});
  for(let i=0;i<2;i++){
    await short.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/ygumqbd69B8?autoplay=1');
    if(i===0) await page.getByRole('button',{name:'Close dialog'}).click(); else await page.keyboard.press('Escape');
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(short).toBeFocused();
  }
  const nav=page.getByRole('navigation',{name:'iDance TV sections'});
  await nav.getByRole('link',{name:'Videos',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Shorts',exact:true})).toHaveCount(0);
  const first=page.getByRole('button',{name:/Play iDance BEATBOX/});
  await expect(first).toBeVisible(); await first.click();
  await expect(page.locator('iframe')).toHaveAttribute('src',/owtNCxhhhKA/); await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'DEEJAY',exact:true}).click();
  await expect(page.getByRole('button',{name:'Play XD301',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Play XD301',exact:true}).click();
  await expect(page.locator('dialog video')).toHaveAttribute('src','/media/XD301_EN_10MB.mp4');
  await page.keyboard.press('Escape');
  await page.getByRole('searchbox',{name:'Search iDance TV'}).fill('not-a-video');
  await expect(page.getByText('No videos match your search.')).toBeVisible();
  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  await nav.getByRole('link',{name:'Shorts',exact:true}).click();
  await expect(short).toBeVisible(); await page.goBack();
  await expect(nav.getByRole('link',{name:'Videos',exact:true})).toHaveAttribute('aria-current','page');
  await page.goForward(); await expect(short).toBeVisible(); await page.reload();
  const intro=page.getByRole('button',{name:'Stop intro and enter iDance homepage'}); if(await intro.isVisible()) await intro.click();
  await expect(short).toBeVisible();
  expect(errors).toEqual([]);
});
