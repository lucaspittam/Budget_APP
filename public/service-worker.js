const APP_PREFIX = 'budget-pwa-';
const VERSION = 'v1'
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
    '/',
    './index.html',
    './js/index.js',
    './js/idb.js',
    './css/styles.css',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',
    '/api/transaction'
]

//install the service worker in browser
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

//activate service worker
self.addEventListener('activate', function(e) {
    e.waitUntil(
    
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME); 

        
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });

  
  self.addEventListener('fetch', function (e) {
      e.respondWith(
          caches.match(e.request).then(function (request) {
              if (request) {
                  return request;
              } else {
                  return fetch(e.request);
              }
          })
      );
  });