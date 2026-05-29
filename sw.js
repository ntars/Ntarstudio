/**
 * Service Worker - 离线缓存与加速
 * 解决 GitHub Pages 国内访问慢/无法访问的问题
 * 策略：缓存优先 (Cache First) + 网络回退 + 后台更新 (Stale-While-Revalidate)
 * 版本：v2
 */
var CACHE_NAME = 'ntarstudio-v3';

// 核心静态资源预缓存列表
var urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/base.css',
  './assets/js/security.js',
  './assets/js/app.min.js',
  './assets/js/anime.js',
  './assets/js/firework.js',
  './assets/js/trail.js',
  './assets/js/bg.js',
  './assets/img/favicon-color.svg',
  './assets/img/apple-touch-icon.png',
  './assets/img/icon-192.png',
  './assets/img/icon-512.png',
  'https://unpkg.com/typed.js@2.0.16/dist/typed.umd.js'
];

// ==================== 安装事件：预缓存核心资源 ====================
self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache).catch(function (err) {
        console.warn('[SW] Pre-cache partial failure, continuing...', err);
      });
    })
  );
});

// ==================== 激活事件：清理旧版本缓存，接管所有页面 ====================
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// ==================== 请求拦截：缓存优先 + 后台更新 ====================
self.addEventListener('fetch', function (event) {
  // 跳过非 GET 请求
  if (event.request.method !== 'GET') return;

  // 跳过非 http(s) 协议
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        // 缓存命中：立即返回，同时后台静默更新缓存
        fetch(event.request).then(function (networkResponse) {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(function () {
          // 后台更新失败，继续使用缓存
        });
        return cachedResponse;
      }

      // 缓存未命中，尝试网络请求
      return fetch(event.request).then(function (networkResponse) {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        // 成功的网络响应存入缓存
        var responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function () {
        // 网络失败且无缓存，对于 HTML 请求返回离线降级页
        if (event.request.headers.get('Accept') && event.request.headers.get('Accept').indexOf('text/html') !== -1) {
          return caches.match('./index.html');
        }
        // 其他资源返回简单错误响应
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
