export function initCustomSelect() {
    const wrapper = document.getElementById('task-category-wrapper');
    if (!wrapper) return;

    const trigger = wrapper.querySelector('.custom-select__trigger');
    const options = wrapper.querySelectorAll('.custom-select__option');
    const valueDisplay = wrapper.querySelector('.custom-select__value');
    const hiddenInput = document.getElementById('task-category');

    // Открытие/закрытие по клику на триггер
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        wrapper.classList.toggle('open');
    });

    // Выбор опции
    options.forEach(option => {
        option.addEventListener('click', () => {
            // Убираем активный класс со всех
            options.forEach(opt => opt.classList.remove('active'));

            // Добавляем кликнутому
            option.classList.add('active');

            // Обновляем текст на кнопке
            valueDisplay.textContent = option.textContent;

            // Обновляем скрытый инпут (для отправки в Firebase)
            hiddenInput.value = option.dataset.value;

            // Закрываем список
            wrapper.classList.remove('open');
        });
    });

    // Закрытие при клике вне списка
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('open');
        }
    });
}
