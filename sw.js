const CACHE_NAME='sf-cache-v3';
const ASSETS=[
  './',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon-180.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE_NAME && caches.delete(k))))
  );
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  // Network-first for JSON (live updates), cache-first for app shell
  if(url.pathname.endsWith('.json')){
    e.respondWith(
      fetch(e.request).then(res=>{
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(c=> c.put(e.request, resClone));
        return res;
      }).catch(()=> caches.match(e.request))
    );
  }else{
    e.respondWith(
      caches.match(e.request).then(cached=> cached || fetch(e.request).then(res=>{
        // Optionally cache css/js added later
        return res;
      }))
    );
  }
});
