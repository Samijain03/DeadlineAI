import assert from 'node:assert/strict';
import { currentPath, navigateTo, subscribeRoute } from '../src/lib/navigation.js';

const previousWindow = globalThis.window;
const browser = new EventTarget();
const entries = ['/'];
let index = 0;
browser.location = { pathname: '/', search: '' };
const select = value => { const url = new URL(value, 'https://deadlineai.test'); browser.location = { pathname: url.pathname, search: url.search }; };
browser.history = {
  pushState: (_state, _title, path) => { entries.splice(index + 1); entries.push(path); index++; select(path); },
  replaceState: (_state, _title, path) => { entries[index] = path; select(path); },
  back: () => { if (index > 0) { select(entries[--index]); browser.dispatchEvent(new Event('popstate')); } },
  forward: () => { if (index < entries.length - 1) { select(entries[++index]); browser.dispatchEvent(new Event('popstate')); } },
};
browser.scrollTo = () => {};
globalThis.window = browser;
try {
  let updates = 0;
  const unsubscribe = subscribeRoute(() => updates++);
  navigateTo('/signup');
  assert.equal(currentPath(), '/signup');
  navigateTo('/login');
  browser.history.back();
  assert.equal(currentPath(), '/signup');
  browser.history.forward();
  assert.equal(currentPath(), '/login');
  navigateTo('/app', { replace: true });
  browser.history.back();
  assert.equal(currentPath(), '/signup', 'Replacing the login entry must not trap Back on login.');
  navigateTo('/?reset-password=1&uid=test&token=test');
  navigateTo('/login', { replace: true });
  assert.equal(browser.location.search, '', 'Leaving recovery must clear the reset credentials from the URL.');
  assert.equal(updates, 8);
  unsubscribe();
  navigateTo('/');
  assert.equal(updates, 8, 'Unmounted route subscribers must stop receiving updates.');
  console.log('Navigation history and recovery URL checks passed');
} finally { globalThis.window = previousWindow; }
