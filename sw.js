/* Neon Finance — Service Worker
   Estratégia:
   - App shell (index.html, manifest, ícones) e bibliotecas CDN (Chart.js): cache-first.
   - APIs do Google (Sheets, GIS): somente rede (dados sempre frescos; o app já tem cache próprio).
*/
var CACHE = 'neon-finance-v1';
var PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function(ev){
  ev.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(PRECACHE);
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(ev){
  ev.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

function isGoogleApi(url){
  return /(?:^|\.)(?:googleapis\.com|googleusercontent\.com|gstatic\.com|google\.com|gvt1\.com|googlesyndication\.com|g.doubleclick\.net)$/.test(url.hostname)
    || url.hostname === 'googleapis.com';
}

self.addEventListener('fetch', function(ev){
  var url = new URL(ev.request.url);
  if(ev.request.method !== 'GET') return;
  if(url.origin !== self.location.origin && !isGoogleApi(url)) return;

  if(isGoogleApi(url)){
    ev.respondWith(fetch(ev.request));
    return;
  }

  ev.respondWith(
    caches.match(ev.request, {ignoreSearch: true}).then(function(hit){
      if(hit) return hit;
      return fetch(ev.request).then(function(resp){
        if(resp && resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')){
          var copy = resp.clone();
          caches.open(CACHE).then(function(cache){ cache.put(ev.request, copy); });
        }
        return resp;
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
