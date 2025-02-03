// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBdmdRqk9PblOBOyjHlPFP7lDq0RSrodM4",
    authDomain: "tcmc-ac38a.firebaseapp.com",
    projectId: "tcmc-ac38a",
    storageBucket: "tcmc-ac38a.firebasestorage.app",
    messagingSenderId: "486439318975",
    appId: "1:486439318975:web:ac3bce8ec1f6f24bbedd0a",
    measurementId: "G-7G8S98E2CV"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    // icon: payload.notification.icon,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
  // Customize how you handle the notification here
  // (e.g., display a notification, update data, etc.)
});
