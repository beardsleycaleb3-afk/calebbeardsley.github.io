const CACHE='oO0-v1';
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','index.html','icon.png']))));
self.addEventListener('fetch',e=>caches.match(e.request).then(r=>r||fetch(e.request)));
