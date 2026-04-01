self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const spacer = '\u00A0'.repeat(14);
  
  const options = {
    body: data.body || 'Pix gerado!\nSua comissão: R$ 0,00',
    icon: 'https://i.ibb.co/dhzgGMY/154879-1.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || `\u00A0${spacer}\n\u00A0\n\u00A0\nCakto`, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
