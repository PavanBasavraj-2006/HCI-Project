const firebaseConfig = {
  apiKey: "AIzaSyANiTLIgAoD39dS9NCfUlLIpdzV5S-50Is",
  authDomain: "linguaflow-ae380.firebaseapp.com",
  projectId: "linguaflow-ae380",
  storageBucket: "linguaflow-ae380.firebasestorage.app",
  messagingSenderId: "647197530748",
  appId: "1:647197530748:web:0987b5c0570c4b16e887f9",
  measurementId: "G-VGP99B3YGN"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

window.firebaseAuth = firebase.auth();
window.firebaseFirestore = firebase.firestore();
