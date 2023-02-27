/* eslint-disable */
// globalThis.addEventListener('fetch', event => {
//   console.log(event.request.url);
// });

console.log('rbb-sw.js LOADED');

// ***** PUSH ************************
// https://web-push-codelab.glitch.me/

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

globalThis.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Rbb Pwa';
  const options = {
    body: event.data.text(),
    icon: 'icon.png',
    badge: 'badge.png',
  };

  event.waitUntil(globalThis.registration.showNotification(title, options));
});

globalThis.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    // clients.openWindow('https://developers.google.com/web/')
    clients.openWindow('https://rickb.org')
  );
});

globalThis.addEventListener('pushsubscriptionchange', function (event) {
  console.log("[Service Worker]: 'pushsubscriptionchange' event fired.");
  const applicationServerKey = urlB64ToUint8Array(
    process.env.APPSERVER_PUBLICKEY
  );
  event.waitUntil(
    globalThis.registration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      })
      .then(function (newSubscription) {
        // TODO: Send to application server
        console.log('[Service Worker] New subscription: ', newSubscription);
      })
  );
});
