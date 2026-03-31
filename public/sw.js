self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Sua comissão: R$ 5,22',
    icon: 'https://i.ibb.co/mrn3Ln9Z/channels4-profile-1.jpg',
    tag: 'pix'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Pix gerado!', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
