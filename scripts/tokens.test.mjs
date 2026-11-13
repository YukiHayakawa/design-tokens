import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getThemeTokens, themes } from '../dist/themes.js';

function luminance(hex) {
  const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(first, second) {
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('explicit theme selectors do not match every root', async () => {
  const css = await readFile(new URL('../dist/tokens.css', import.meta.url), 'utf8');
  assert.equal(css.includes(':where(:root,'), false);
  assert.ok(css.includes(':root:not([data-theme-base]):not([data-theme-color])'));
});

for (const theme of themes) {
  for (const mode of ['light', 'dark']) {
    test(`${theme.id}/${mode}: filled actions have readable text in every state`, () => {
      const tokens = getThemeTokens(theme.id, mode);
      for (const role of ['primary', 'secondary', 'status-danger']) {
        for (const state of ['', '-hover', '-pressed']) {
          const background = tokens[`${role}${state}`];
          const foreground = tokens[`on-${role}`];
          assert.match(background ?? '', /^#[0-9a-f]{6}$/i);
          assert.match(foreground ?? '', /^#[0-9a-f]{6}$/i);
          assert.ok(contrast(background, foreground) >= 4.5, `${role}${state}/on-${role} must reach 4.5:1`);
        }
      }
    });
    test(`${theme.id}/${mode}: CSS exports all API tokens without value changes`, async () => {
      const css = await readFile(new URL('../dist/tokens.css', import.meta.url), 'utf8');
      const selector = `:where([data-theme-base="${mode}"][data-theme-color="${theme.id}"]) {`;
      const body = css.split(selector)[1]?.split('}')[0];
      assert.ok(body, `Missing selector for ${theme.id}/${mode}`);
      const generated = Object.fromEntries([...body.matchAll(/--color-([\w-]+):\s*(#[\da-f]+);/gi)].map((match) => [match[1], match[2]]));
      assert.deepEqual(generated, getThemeTokens(theme.id, mode));
    });
  }
}
