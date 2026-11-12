import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, VAPID_KEY } from './firebase.js';

async function registerAndGetToken(btn) {
    try {
        console.log('1. Начинаем получение токена...');

        if (btn) {
            btn.textContent = 'Подключение...';
            btn.disabled = true;
        }

        console.log('2. Регистрируем Service Worker...');
        const registration = await navigator.serviceWorker.register('firebase-messaging-sw.js');
        console.log('3. Service Worker зарегистрирован:', registration);

        await navigator.serviceWorker.ready;
        console.log('4. Service Worker готов.');

        console.log('5. Запрашиваем токен у Firebase...');
        const messaging = getMessaging();
        const currentToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        console.log('6. Ответ от Firebase:', currentToken);

        if (currentToken) {
            const user = auth.currentUser;
            console.log('7. Пользователь для сохранения:', user ? user.uid : 'НЕ НАЙДЕН');

            if (user) {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, {
                    fcmToken: currentToken,
                    lastTokenUpdate: serverTimestamp()
                }, { merge: true });
                console.log('8. Токен сохранен в базу!');

                if (btn) btn.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('❌ ОШИБКА НА ШАГЕ:', error);
    }
}

export async function initNotifications() {
    const btn = document.getElementById('enable-notifications');
    if (!btn) {
        console.log('Кнопка уведомлений не найдена на странице.');
        return;
    }

    if (!('Notification' in window)) {
        console.log('Браузер не поддерживает уведомления.');
        btn.style.display = 'none';
        return;
    }

    console.log('Текущий статус разрешения:', window.Notification.permission);

    if (window.Notification.permission === 'granted') {
        console.log('Разрешение уже есть, скрываем кнопку и запускаем в фоне.');
        btn.style.display = 'none';
        registerAndGetToken(null);
        return;
    }

    btn.addEventListener('click', async () => {
        const permission = await window.Notification.requestPermission();
        if (permission === 'granted') {
            registerAndGetToken(btn);
        } else {
            window.alert('Вы отклонили уведомления.');
        }
    });

    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
        console.log('Получено уведомление на переднем плане: ', payload);
        window.alert(`🔔 ${payload.notification.title}: ${payload.notification.body}`);
    });
}
