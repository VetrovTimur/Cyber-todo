import admin from 'firebase-admin';

// 1. Получаем ключ из секретов GitHub
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
        console.log(`Уведомление отправлено: ${title} - ${body}`);
    } catch (error) {
        console.error('Ошибка отправки:', error);
    }
}

// 4. УТРЕННИЙ ДАЙДЖЕСТ (09:00)
async function morningDigest(userDoc) {
    const userData = userDoc.data();
    const token = userData.fcmToken;
    const uid = userDoc.id;
    if (!token) return;

    // Считаем активные задачи
    const tasksSnapshot = await db.collection('tasks').where('uid', '==', uid).get();
    let activeTasksCount = 0;
    tasksSnapshot.forEach(doc => { if (!doc.data().completed) activeTasksCount++; });

    // Считаем события на сегодня
    const todayStr = new Date().toISOString().split('T')[0];
    const holidaysSnapshot = await db.collection('holidays').where('uid', '==', uid).where('date', '==', todayStr).get();
    const eventsCount = holidaysSnapshot.size;

    // Проверяем покупки
    const shoppingSnapshot = await db.collection('shopping').where('uid', '==', uid).get();
    let hasShopping = false;
    shoppingSnapshot.forEach(doc => { if (!doc.data().bought) hasShopping = true; });

    // Формируем текст
    let text = `Доброе утро! 🌅\n`;
    if (activeTasksCount > 0) text += `У тебя ${activeTasksCount} задач на сегодня. `;
    if (eventsCount > 0) text += `Событий: ${eventsCount}. `;
    if (hasShopping) text += `\nНе забудь про покупки! 🛒`;
    if (activeTasksCount === 0 && eventsCount === 0 && !hasShopping) text += `Сегодня дел нет. Отдыхай! ☕`;

    await sendPush(token, 'Cyber Todo', text);
}

// 5. НАПОМИНАНИЕ О ДЕДЛАЙНАХ (15:00)
async function checkDeadlines(userDoc) {
    const userData = userDoc.data();
    const token = userData.fcmToken;
    const uid = userDoc.id;
    if (!token) return;

    const todayStr = new Date().toISOString().split('T')[0]; // Сегодня в формате YYYY-MM-DD
    const tasksSnapshot = await db.collection('tasks').where('uid', '==', uid).get();

    for (const doc of tasksSnapshot.docs) {
        const task = doc.data();
        if (task.completed || !task.deadline) continue;

        // Если дедлайн стоит на сегодняшний день
        if (task.deadline === todayStr) {
            await sendPush(token, 'Напоминание о дедлайне ⏰', `Задача: "${task.text}" должна быть выполнена сегодня!`);
        }
    }
}

// 6. НАПОМИНАНИЕ О ПРАЗДНИКАХ (06:00 и 23:00)
async function checkHolidays(userDoc, isTomorrow) {
    const userData = userDoc.data();
    const token = userData.fcmToken;
    const uid = userDoc.id;
    if (!token) return;

    const targetDate = new Date();
    if (isTomorrow) {
        targetDate.setDate(targetDate.getDate() + 1); // Завтрашний день
    }
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const holidaysSnapshot = await db.collection('holidays')
        .where('uid', '==', uid)
        .where('date', '==', targetDateStr)
        .get();

    for (const doc of holidaysSnapshot.docs) {
        const event = doc.data();
        const timeText = isTomorrow ? 'завтра' : 'сегодня';
        let icon = event.type === 'birthday' ? '🎂' : event.type === 'death' ? '🕯️' : '🎉';

        await sendPush(token, 'Напоминание о событии', `${icon} ${timeText}: ${event.title}`);
    }
}

// 7. ГЛАВНАЯ ФУНКЦИЯ (Запускается по расписанию)
async function main() {
    try {
        const usersSnapshot = await db.collection('users').get();
        if (usersSnapshot.empty) {
            console.log('Пользователи не найдены.');
            return;
        }

        const userDoc = usersSnapshot.docs[0]; // Берем первого (твоего) пользователя

        // Получаем текущий час по Москве (UTC+3)
        const now = new Date();
        const moscowHour = (now.getUTCHours() + 3) % 24;
        console.log(`Запуск в ${moscowHour}:00 по Москве`);

        // В зависимости от времени запускаем нужную функцию
        if (moscowHour === 9) {
            await morningDigest(userDoc);
        } else if (moscowHour === 6) {
            await checkHolidays(userDoc, false); // О сегодняшних
        } else if (moscowHour === 23) {
            await checkHolidays(userDoc, true); // О завтрашних
        } else if (moscowHour === 15) {
            await checkDeadlines(userDoc); // Проверка дедлайнов только в 15:00
        }

    } catch (error) {
        console.error('Ошибка в работе скрипта:', error);
    }
}

// Запускаем
main();
