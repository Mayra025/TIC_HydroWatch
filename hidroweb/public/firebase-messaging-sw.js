
//worker
// Importar los scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCdc0GXG2E1zr-FYtOKkKFjc-h98gok4ME",
  authDomain: "hidroweb-data.firebaseapp.com",
  projectId: "hidroweb-data",
  storageBucket: "hidroweb-data.appspot.com",
  messagingSenderId: "820071530453",
  appId: "1:820071530453:web:fb5fa25a0693361686c75c",
  measurementId: "G-QZTK3BRXYZ"
};


// Inicializar Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging(app);  //ojo

// Escuchar mensajes cuando la app está en background
messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje recibido en foreground:', payload);
  
  const notifTitle = payload.notification.title;
  const notifOptions = {
    body: payload.notification.body,
    icon: "/lo.png"
  };

  return self.registration.showNotification(notifTitle, notifOptions);
});


