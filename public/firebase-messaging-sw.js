/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");

// ✅ Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBRhCelIYkSXA_QGwq_xuNCAdPvdOtI_9Y",
  authDomain: "dunfermlinetaxi-654b6.firebaseapp.com",
  projectId: "dunfermlinetaxi-654b6",
  storageBucket: "dunfermlinetaxi-654b6.firebasestorage.app",
  messagingSenderId: "698177293245",
  appId: "1:698177293245:web:c7fc83c5385ce7002ce0d4",
  measurementId: "G-SZBD3R7T2F"
});

const messaging = firebase.messaging();

// ✅ Handle Background Notifications
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Received background message:", payload);

  const notificationTitle = payload.notification?.title || "Dunfermline Taxi";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new update.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      url: payload.data?.url || "/rides" // Redirect when clicked
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Handle Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
