const CACHE_NAME = 'feedback-system-v2';

self.addEventListener('install', (event) => {
  // 새 서비스 워커가 대기하지 않고 즉시 활성화되도록 설정
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 이전 버전의 모든 오래된 캐시 삭제
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First 전략: 항상 서버(네트워크)에서 최신 버전을 먼저 가져오고, 오프라인 시에만 캐시 사용
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 정상 응답이면 캐시도 최신으로 갱신
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // 네트워크 연결이 끊겼을 때만 캐시에서 제공
        return caches.match(event.request);
      })
  );
});
