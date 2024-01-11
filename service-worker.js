self.addEventListener('push', event => {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const data = event.data.json();
    console.log(data);
    const title = data.title
    const options = {
      body: data.content,
      image: data.image,
      icon: data.icon,
      data: data,
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
    self.onnotificationclick = function(event) {
        event.notification.close();
        event.waitUntil(
          clients.openWindow(data.url)
        );
      }
  });