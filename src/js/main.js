import { initAuth, checkAuthState } from './modules/auth.js';
import { initTasks } from './modules/tasks.js';

// Запускаем логику входа/выхода
initAuth();

// Проверяем, если мы на главной странице (есть список задач)
if (document.getElementById('task-list')) {
    // Ждем подтверждения авторизации и запускаем таскер
    checkAuthState((user) => {
        initTasks(user);
    });
}

// Регистрация Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker зарегистрирован!'))
            .catch(err => console.error('Ошибка Service Worker:', err));
    });
}
