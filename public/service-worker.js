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

//install service worker in browser
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
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
  
        
        //delete old cache
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
  });

  self.addEventListener("fetch", (evt) => {
    // cache successful GET requests to the API
    if (evt.request.url.includes("/api/") && evt.request.method === "GET") {
      evt.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(evt.request)
              .then((response) => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request, response.clone());
                }
  
                return response;
              })
              .catch(() => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      // stop execution of the fetch event callback
      return;
    }
  
    // if the request is not for the API, serve static assets using
    // "offline-first" approach.
    evt.respondWith(
      caches.match(evt.request).then((response) => {
        return response || fetch(evt.request);
      })
    );
  });