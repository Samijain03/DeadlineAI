export function currentPath() {
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export function subscribeRoute(callback) {
  window.addEventListener('popstate', callback);
  window.addEventListener('deadlineai-route', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('deadlineai-route', callback);
  };
}

export function navigateTo(path, { replace = false } = {}) {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
  window.dispatchEvent(new Event('deadlineai-route'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}
