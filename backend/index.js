import admin from 'firebase-admin';

// 1. Получаем ключ из секретов GitHub (переменная окружения)
// Когда мы запустим это на GitHub, он подставит сюда твой JSON-ключ.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// 2. Инициализируем Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 3. Функция для отправки пуша
async function sendPush(token, title, body) {
    const message = {
        notification: { title, body },
        token: token
    };

    try {
        await admin.messaging().send(message);
        console.log('Уведомление успешно отправлено!');
    } catch (error) {
        console.error('Ошибка отправки:', error);
    }
}

// 4. Главная функция (Утренний дайджест)
async function morningDigest() {
    try {
        console.log('Начинаем сбор данных для утреннего дайджеста...');

        // Получаем всех пользователей (у нас пока один)
        const usersSnapshot = await db.collection('users').get();

        if (usersSnapshot.empty) {
            console.log('Пользователи не найдены.');
            return;
        }

        // Берем первого пользователя (тебя) и его токен
        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        const token = userData.fcmToken;
        const uid = userDoc.id;

        if (!token) {
            console.log('У пользователя нет токена для уведомлений.');
            return;
        }

        // Считаем задачи (берем все задачи пользователя)
        const tasksSnapshot = await db.collection('tasks').where('uid', '==', uid).get();
        let activeTasksCount = 0;
        const todayStr = new Date().toISOString().split('T')[0]; // Сегодняшняя дата в формате YYYY-MM-DD

        tasksSnapshot.forEach(doc => {
            const task = doc.data();
            // Считаем только невыполненные задачи
            if (!task.completed) {
                activeTasksCount++;
            }
        });

        // Считаем события (праздники) на сегодня
        const holidaysSnapshot = await db.collection('holidays').where('uid', '==', uid).where('date', '==', todayStr).get();
        const eventsCount = holidaysSnapshot.size;

        // Проверяем список покупок
        const shoppingSnapshot = await db.collection('shopping').where('uid', '==', uid).get();
        let hasShopping = false;
        shoppingSnapshot.forEach(doc => {
            if (!doc.data().bought) hasShopping = true; // Если есть некупленные вещи
        });

        // Формируем текст
        let text = `Доброе утро! 🌅\n`;
        if (activeTasksCount > 0) text += `У тебя ${activeTasksCount} задач на сегодня. `;
        if (eventsCount > 0) text += `Событий: ${eventsCount}. `;
        if (hasShopping) text += `\nНе забудь про покупки! 🛒`;

        if (activeTasksCount === 0 && eventsCount === 0 && !hasShopping) {
            text += `Сегодня дел нет. Отдыхай! ☕`;
        }

        // Отправляем пуш
        await sendPush(token, 'Cyber Todo', text);

    } catch (error) {
        console.error('Ошибка в работе дайджеста:', error);
    }
}

// Запускаем функцию
morningDigest();
