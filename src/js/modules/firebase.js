import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBA3rk_8kbpn_XITLCB0gqUPNlLIoKoRLo',
    authDomain: 'cyber-todo-db.firebaseapp.com',
    projectId: 'cyber-todo-db',
    storageBucket: 'cyber-todo-db.firebasestorage.app',
    messagingSenderId: '120242288059',
    appId: '1:120242288059:web:c7d00359645ce605dc809e'
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем сервисы, чтобы использовать их в других файлах (например, в main.js)
export const auth = getAuth(app);
export const db = getFirestore(app);
