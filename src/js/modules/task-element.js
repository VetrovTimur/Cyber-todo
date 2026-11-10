import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.js';

export function createTaskElement(task, taskId) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'task-item--completed' : ''}`;
    li.dataset.category = task.category || 'personal';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-item__checkbox';
    checkbox.checked = task.completed;

    checkbox.addEventListener('change', async () => {
        await updateDoc(doc(db, 'tasks', taskId), { completed: checkbox.checked });
    });

    const badge = document.createElement('span');
    badge.className = `task-item__badge task-item__badge--${task.category || 'personal'}`;
    const categoryNames = { work: 'Работа', home: 'Дом', personal: 'Личное' };
    badge.textContent = categoryNames[task.category] || 'Личное';

    const span = document.createElement('span');
    span.className = 'task-item__text';
    span.textContent = task.text;
    span.title = 'Двойной клик для редактирования';

    span.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-item__edit-input';
        input.value = task.text;

        li.replaceChild(input, span);
        input.focus();

        const saveEdit = async () => {
            const newText = input.value.trim();
            if (newText && newText !== task.text) {
                await updateDoc(doc(db, 'tasks', taskId), { text: newText });
            } else {
                li.replaceChild(span, input);
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') li.replaceChild(span, input);
        });
    });

    let deadlineEl = null;
    if (task.deadline) {
        deadlineEl = document.createElement('span');
        deadlineEl.className = 'task-item__deadline';

        const [, m, d] = task.deadline.split('-'); // Убрали y
        deadlineEl.textContent = `📅 ${d}.${m}`;

        if (!task.completed) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const deadlineDate = new Date(task.deadline);

            if (deadlineDate < today) {
                deadlineEl.classList.add('task-item__deadline--overdue');
            } else if (deadlineDate.getTime() === today.getTime()) {
                deadlineEl.classList.add('task-item__deadline--today');
            }
        }
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-item__delete';
    deleteBtn.innerHTML = '✕';

    let isConfirming = false;
    let confirmTimeout;

    deleteBtn.addEventListener('click', async () => {
        if (!isConfirming) {
            isConfirming = true;
            deleteBtn.innerHTML = 'Точно?';
            deleteBtn.classList.add('task-item__delete--confirm');
            confirmTimeout = setTimeout(() => {
                isConfirming = false;
                deleteBtn.innerHTML = '✕';
                deleteBtn.classList.remove('task-item__delete--confirm');
            }, 3000);
        } else {
            clearTimeout(confirmTimeout);
            await deleteDoc(doc(db, 'tasks', taskId));
        }
    });

    li.appendChild(checkbox);
    li.appendChild(badge);
    li.appendChild(span);
    if (deadlineEl) li.appendChild(deadlineEl);
    li.appendChild(deleteBtn);

    return li;
}
