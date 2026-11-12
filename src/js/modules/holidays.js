import { db } from './firebase.js';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

let allHolidays = [];
let currentSelectedDate = null;

export function initHolidays(user) {
    const form = document.getElementById('add-holiday-form');
    const titleInput = document.getElementById('holiday-title');
    const dateInput = document.getElementById('holiday-date');
    const typeSelect = document.getElementById('holiday-type');
    const listContainer = document.getElementById('holiday-list');
    const listTitle = document.getElementById('selected-date-title');

    if (!form) return;

    const q = query(collection(db, 'holidays'), where('uid', '==', user.uid));

    onSnapshot(q, (snapshot) => {
        allHolidays = [];
        snapshot.forEach((docSnap) => {
            allHolidays.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderCalendarDots();
        if (currentSelectedDate) {
            renderEventsForDate(currentSelectedDate);
        }
    });

    document.addEventListener('dateSelected', (e) => {
        currentSelectedDate = e.detail.date;
        dateInput.value = currentSelectedDate;

        const [y, m, d] = currentSelectedDate.split('-');
        listTitle.textContent = `События на ${d}.${m}.${y}`;

        renderEventsForDate(currentSelectedDate);
    });

    document.addEventListener('calendarRendered', renderCalendarDots);

    dateInput.addEventListener('change', (e) => {
        if (e.target.value) {
            currentSelectedDate = e.target.value;
            document.dispatchEvent(new window.CustomEvent('dateSelected', {
                detail: { date: currentSelectedDate }
            }));
        }
    });

    function renderCalendarDots() {
        document.querySelectorAll('.calendar-day').forEach(el => {
            const dotsContainer = el.querySelector('.calendar-day__dots');
            if (dotsContainer) dotsContainer.innerHTML = '';

            el.classList.remove('has-events', 'multi-event');
            el.style.removeProperty('--event-bg');
            el.style.removeProperty('--text-color');
        });

        const groupedEvents = {};
        allHolidays.forEach(holiday => {
            if (!groupedEvents[holiday.date]) {
                groupedEvents[holiday.date] = [];
            }
            if (!groupedEvents[holiday.date].includes(holiday.type)) {
                groupedEvents[holiday.date].push(holiday.type);
            }
        });

        const colors = {
            birthday: '#ff00c8',
            death: '#ff4d4d',
            holiday: '#00ffd5'
        };

        Object.keys(groupedEvents).forEach(dateStr => {
            const dayEl = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
            if (!dayEl) return;

            const types = groupedEvents[dateStr];
            dayEl.classList.add('has-events');

            if (types.length === 1) {
                const color = colors[types[0]];
                dayEl.style.setProperty('--event-bg', color);
                dayEl.style.setProperty('--text-color', color);
            } else if (types.length === 2) {
                const color1 = colors[types[0]];
                const color2 = colors[types[1]];
                dayEl.style.setProperty('--event-bg', `conic-gradient(${color1} 0 50%, ${color2} 50% 100%)`);
                dayEl.classList.add('multi-event');
            } else if (types.length >= 3) {
                const color1 = colors[types[0]];
                const color2 = colors[types[1]];
                const color3 = colors[types[2]];
                dayEl.style.setProperty('--event-bg', `conic-gradient(${color1} 0 33.3%, ${color2} 33.3% 66.6%, ${color3} 66.6% 100%)`);
                dayEl.classList.add('multi-event');
            }

            const dotsContainer = dayEl.querySelector('.calendar-day__dots');
            if (dotsContainer) {
                types.forEach(type => {
                    const dot = document.createElement('div');
                    dot.className = `calendar-day__dot calendar-day__dot--${type}`;
                    dotsContainer.appendChild(dot);
                });
            }
        });
    }

    function renderEventsForDate(dateStr) {
        listContainer.innerHTML = '';
        const dayEvents = allHolidays.filter(h => h.date === dateStr);

        if (dayEvents.length === 0) {
            listContainer.innerHTML = '<li class="holiday-list__empty">На этот день событий нет.</li>';
            return;
        }

        dayEvents.forEach(event => {
            const li = document.createElement('li');
            li.className = `holiday-item type-${event.type}`;

            const text = document.createElement('span');
            text.className = 'holiday-item__text';
            const icon = event.type === 'birthday' ? '🎂' : event.type === 'death' ? '🕯️' : '🎉';
            text.textContent = `${icon} ${event.title}`;
            text.title = 'Двойной клик для редактирования';

            text.addEventListener('dblclick', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'holiday-item__edit-input';
                input.value = event.title;

                li.replaceChild(input, text);
                input.focus();

                const saveEdit = async () => {
                    const newText = input.value.trim();
                    if (newText && newText !== event.title) {
                        await updateDoc(doc(db, 'holidays', event.id), { title: newText });
                    } else {
                        li.replaceChild(text, input);
                    }
                };

                input.addEventListener('blur', saveEdit);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') input.blur();
                    if (e.key === 'Escape') li.replaceChild(text, input);
                });
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'holiday-item__delete';
            deleteBtn.innerHTML = '✕';

            deleteBtn.addEventListener('click', async () => {
                await deleteDoc(doc(db, 'holidays', event.id));
            });

            li.appendChild(text);
            li.appendChild(deleteBtn);
            listContainer.appendChild(li);
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        const date = dateInput.value;
        const type = typeSelect.value;

        if (!title || !date) return;

        try {
            await addDoc(collection(db, 'holidays'), {
                title: title,
                date: date,
                type: type,
                uid: user.uid,
                createdAt: serverTimestamp()
            });

            titleInput.value = '';

            document.dispatchEvent(new window.CustomEvent('dateSelected', {
                detail: { date: date }
            }));
        } catch (error) {
            console.error('Ошибка при добавлении события:', error);
        }
    });
}
