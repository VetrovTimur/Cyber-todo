import { auth } from './firebase.js';
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';

export function initAuth() {
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me').checked;
            const errorEl = document.getElementById('login-error');

            try {
                const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
                await setPersistence(auth, persistenceType);
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = 'index.html';
            } catch (error) {
                errorEl.style.display = 'block';
                errorEl.textContent = 'Неверный email или пароль. Попробуйте снова.';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => signOut(auth));
    }
}

export function checkAuthState(callback) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            if (callback) callback(user);
        }
    });
}
