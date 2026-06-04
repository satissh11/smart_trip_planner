self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (event) => {
  // Ye offline support ke liye hota hai, abhi ise khali chhod sakte hain
  event.respondWith(fetch(event.request));
});