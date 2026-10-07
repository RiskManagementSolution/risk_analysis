/* Monte Carlo Lab: modo sin conexión. Sube VERSION cada vez que cambies index.html para que los dispositivos se actualicen. */
const VERSION = 'mcl-v3';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin !== location.origin) return;
  if(req.mode === 'navigate'){
    /* la app: primero la red (siempre la última versión) y, sin conexión, la copia guardada */
    e.respondWith(fetch(req).then(r => {
      if(r && r.ok){ const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); }
      return r;
    }).catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  /* íconos y demás archivos: primero lo guardado */
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if(r && r.ok){ const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});
