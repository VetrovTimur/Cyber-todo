let currentDate = new Date();
let selectedDate = new Date();

const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function initCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('current-month');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    if (!grid) return;

    function renderCalendar() {
        grid.innerHTML = '';

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        title.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let startDayOfWeek = firstDay.getDay() - 1;
        if (startDayOfWeek === -1) startDayOfWeek = 6;

        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty';
            grid.appendChild(emptyCell);
        }

        const todayStr = formatDate(new Date());
        const selectedStr = formatDate(selectedDate);

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDate = new Date(year, month, day);
            const dayStr = formatDate(dayDate);

            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.dataset.date = dayStr;

            const numberSpan = document.createElement('span');
            numberSpan.className = 'calendar-day__number';
            numberSpan.textContent = day;
            dayEl.appendChild(numberSpan);

            if (dayStr === todayStr) dayEl.classList.add('today');
            if (dayStr === selectedStr) dayEl.classList.add('active');

            dayEl.addEventListener('click', () => {
                selectedDate = dayDate;
                renderCalendar();
                document.dispatchEvent(new window.CustomEvent('dateSelected', {
                    detail: { date: dayStr }
                }));
            });

            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'calendar-day__dots';
            dayEl.appendChild(dotsContainer);

            grid.appendChild(dayEl);
        }

        document.dispatchEvent(new window.CustomEvent('calendarRendered'));
    }

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    document.addEventListener('dateSelected', (e) => {
        const [year, month, day] = e.detail.date.split('-');
        selectedDate = new Date(year, month - 1, day);
        currentDate = new Date(selectedDate);
        renderCalendar();
    });

    renderCalendar();
    return formatDate(selectedDate);
}
