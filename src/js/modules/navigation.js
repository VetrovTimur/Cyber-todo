export function initNavigation() {
    const navButtons = document.querySelectorAll('.main-nav__btn');
    const tabs = document.querySelectorAll('.tab-content');

    if (!navButtons.length) return;

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. Убираем активный класс со всех кнопок и вкладок
            navButtons.forEach(b => b.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            // 2. Добавляем активный класс на нажатую кнопку
            btn.classList.add('active');

            // 3. Находим нужную вкладку по id (например, tab-tasks) и показываем её
            const tabId = `tab-${btn.dataset.tab}`;
            const activeTab = document.getElementById(tabId);

            if (activeTab) {
                activeTab.classList.add('active');
            }
        });
    });
}
