import { initAuth, checkAuthState } from './modules/auth.js';
import { initTasks } from './modules/tasks.js';
import { initShopping } from './modules/shopping.js';
import { initFilters } from './modules/filters.js';
import { initNavigation } from './modules/navigation.js';
import { initCalendar } from './modules/calendar.js';
import { initHolidays } from './modules/holidays.js';
import { initCustomSelect } from './modules/custom-select.js';
import { initNotifications } from './modules/notifications.js';

initNavigation();
initAuth();

if (document.getElementById('task-list')) {
    initCustomSelect();
    initFilters();

    checkAuthState((user) => {
        initNotifications();
        const initialDate = initCalendar();
        initTasks(user);
        initShopping(user);
        initHolidays(user);

        if (initialDate) {
            document.dispatchEvent(new window.CustomEvent('dateSelected', {
                detail: { date: initialDate }
            }));
        }
    });
}

// === УМНАЯ РЕГИСТРАЦИЯ SERVICE WORKER ===
// if ('serviceWorker' in navigator) {
//     if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//         navigator.serviceWorker.getRegistrations().then(function(registrations) {
//             for(const registration of registrations) {
//                 registration.unregister();
//                 console.log('Service Worker отключен для локальной разработки');
//             }
//         });
//     } else {
//         window.addEventListener('load', () => {
//             navigator.serviceWorker.register('sw.js')
//                 .then(() => console.log('Service Worker зарегистрирован!'))
//                 .catch(err => console.error('Ошибка Service Worker:', err));
//         });
//     }
// }
