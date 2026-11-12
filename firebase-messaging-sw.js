self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Используем надежный CDN вместо gstatic.com
importScripts('https://cdn.jsdelivr.net/npm/firebase@10.14.1/firebase-app-compat.js');
importScripts('https://cdn.jsdelivr.net/npm/firebase@10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBA3rk_8kbpn_XITLCB0gqUPNlLIoKoRLo",
    authDomain: "cyber-todo-db.firebaseapp.com",
    projectId: "cyber-todo-db",
    storageBucket: "cyber-todo-db.firebasestorage.app",
    messagingSenderId: "120242288059",
    appId: "1:120242288059:web:c7d00359645ce605dc809e"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Фоновое сообщение:', payload);
    self.registration.showNotification(payload.notification.title || 'Cyber Todo', {
        body: payload.notification.body,
        icon: '/Cyber-todo/icon.svg'
    });
});
