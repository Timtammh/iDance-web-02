import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const contexts: AudioContext[] = [];
    const analysers: AnalyserNode[] = [];
    const Original = window.AudioContext;
    class ObservedAudioContext extends Original {
      constructor() { super(); contexts.push(this); }
      createDynamicsCompressor() {
        const node = super.createDynamicsCompressor(), analyser = this.createAnalyser();
        node.connect(analyser); analysers.push(analyser); return node;
      }
    }
    Object.assign(window, { AudioContext: ObservedAudioContext, mixerProbe: { contexts, analysers } });
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Stop intro and enter iDance homepage' }).click();
  await expect(page.locator('.intro-screen')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reject analytics' }).click();
  await page.locator('#products').scrollIntoViewIfNeeded();
});

const energy = (page: Page) => page.evaluate(() => {
  const probe = (window as unknown as { mixerProbe: { analysers: AnalyserNode[] } }).mixerProbe;
  const analyser = probe.analysers[0];
  if (!analyser) return 0;
  const values = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(values);
  return Math.max(...values.map(Math.abs));
});

test('silent until gesture; layered loops generate audio, stop and clean up on navigation', async ({ page }) => {
  expect(await page.evaluate(() => (window as unknown as { mixerProbe: { contexts: AudioContext[] } }).mixerProbe.contexts.length)).toBe(0);
  await page.getByRole('button', { name: 'Bass loop', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bass loop', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => energy(page)).toBeGreaterThan(.001);
  await page.getByRole('button', { name: 'Drums loop', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: '2 loops playing' })).toBeVisible();
  const tone = page.getByRole('slider', { name: 'Channel tone' });
  await tone.focus(); await page.keyboard.press('Home'); await expect(tone).toHaveAttribute('aria-valuenow', '0');
  await page.keyboard.press('End'); await expect(tone).toHaveAttribute('aria-valuenow', '100');
  for (const name of ['left mixer volume', 'right mixer volume']) {
    await page.getByRole('slider', { name, exact: true }).focus(); await page.keyboard.press('Home');
  }
  await expect.poll(() => energy(page)).toBeLessThan(.0001);
  await page.getByRole('slider', { name: 'right mixer volume', exact: true }).focus(); await page.keyboard.press('End');
  await expect.poll(() => energy(page)).toBeGreaterThan(.001);
  await page.getByRole('button', { name: 'Stop sound', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bass loop', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => energy(page)).toBeLessThan(.0001);
  await page.getByRole('button', { name: 'Chords loop', exact: true }).click();
  await expect.poll(() => energy(page)).toBeGreaterThan(.001);
  await page.locator('#products').getByRole('link', { name: 'View all products' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { mixerProbe: { contexts: AudioContext[] } }).mixerProbe.contexts[0].state)).toBe('closed');
});

test('all pad buttons work on mobile and scrolling away stops playback', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#products').scrollIntoViewIfNeeded();
  for (const name of ['Drums', 'Clap', 'Hi-hat', 'Perc', 'Bass', 'Chords', 'Lead', 'Spark']) {
    const pad = page.getByRole('button', { name: `${name} loop`, exact: true });
    await expect(pad).toBeVisible(); await pad.click(); await expect(pad).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(page.getByRole('status').filter({ hasText: '8 loops playing' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.getByRole('button', { name: 'Drums loop', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('audio failure is recoverable and rapid repeated taps leave no stuck loops', async ({ page }) => {
  await page.evaluate(() => {
    const original = window.AudioContext.prototype.resume;
    window.AudioContext.prototype.resume = function () {
      window.AudioContext.prototype.resume = original;
      return Promise.reject(new Error('Simulated autoplay denial'));
    };
  });
  const kick = page.getByRole('button', { name: 'Drums loop', exact: true });
  await kick.click();
  await expect(page.getByRole('status').filter({ hasText: 'Sound could not start' })).toBeVisible();
  await kick.click(); await expect(kick).toHaveAttribute('aria-pressed', 'true');
  await kick.click(); await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await kick.evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await expect(kick).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => energy(page)).toBeLessThan(.0001);
});
