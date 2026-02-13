// Service worker for push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'JobBoard', body: 'You have a new notification', url: '/' }
  if (event.data) {
    try {
      data = { ...data, ...JSON.parse(event.data.text()) }
    } catch (e) {}
  }
  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    data: { url: data.url || '/' },
    actions: [{ action: 'open', title: 'View' }],
  }
  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(self.location.origin + (url.startsWith('/') ? url : '/' + url))
    })
  )
})
