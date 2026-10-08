document.addEventListener('DOMContentLoaded', () => {
    // Текущий год в футере
    const yearEl = document.querySelector('[data-year]');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // Кнопка «Попробовать» — приветствие
    const button = document.querySelector('[data-action="greet"]');
    const result = document.querySelector('[data-result]');

    if (button && result) {
        button.addEventListener('click', () => {
            result.textContent = 'Сборка работает. Открой DevTools → Network 👀';
        });
    }
});

