import { db } from './firebase.js';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getCurrentFilters } from './filters.js';
import { createTaskElement } from './task-element.js';

let allTasks = [];

export function initTasks(user) {
    const taskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const emptyMessage = document.getElementById('empty-message');
    const loader = document.getElementById('task-loader');

    if (!taskForm) return;

    if (taskInput) {
        taskInput.addEventListener('input', function() {
            this.style.height = 'auto'; // Сбрасываем высоту
            this.style.height = (this.scrollHeight + 2) + 'px'; // +2px спасают от обрезки на мобилках
        });
    }

    const q = query(collection(db, 'tasks'), where('uid', '==', user.uid));

    function renderTasks() {
        taskList.innerHTML = '';
        if (emptyMessage) emptyMessage.classList.add('hidden');

        const { status, category } = getCurrentFilters();
        let visibleCount = 0;

        // === УМНАЯ СОРТИРОВКА ===
        allTasks.sort((a, b) => {
            // 1. Сначала невыполненные, потом выполненные
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            // 2. Сначала те, у которых есть дедлайн
            if (a.deadline && !b.deadline) return -1;
            if (!a.deadline && b.deadline) return 1;

            // 3. Если оба имеют дедлайн, сортируем по дате (просроченные и ближайшие — первыми)
            if (a.deadline && b.deadline) {
                return new Date(a.deadline) - new Date(b.deadline);
            }

            // 4. Если дедлайнов нет ни у кого, сортируем по дате создания (новые сверху)
            const dateA = a.createdAt ? a.createdAt.toMillis() : 0;
            const dateB = b.createdAt ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        });
        // =========================

        allTasks.forEach(task => {
            // Фильтр по статусу
            if (status === 'active' && task.completed) return;
            if (status === 'completed' && !task.completed) return;

            // Фильтр по категории
            if (category !== 'all' && (task.category || 'personal') !== category) return;

            // Создаем карточку
            const taskEl = createTaskElement(task, task.id);
            taskList.appendChild(taskEl);
            visibleCount++;
        });

        if (visibleCount === 0 && emptyMessage) {
            emptyMessage.classList.remove('hidden');
            taskList.appendChild(emptyMessage);
        }
    }

    onSnapshot(q, (snapshot) => {
        if (loader) loader.style.display = 'none';
        allTasks = [];
        snapshot.forEach((docSnap) => {
            allTasks.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderTasks();
    });

    document.addEventListener('filtersChanged', renderTasks);

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;

        const categoryInput = document.getElementById('task-category');
        const category = categoryInput ? categoryInput.value : 'personal';

        // Читаем дедлайн (если пусто, будет пустая строка)
        const deadlineInput = document.getElementById('task-deadline');
        const deadline = deadlineInput ? deadlineInput.value : '';

        try {
            await addDoc(collection(db, 'tasks'), {
                text: text,
                category: category,
                deadline: deadline || null, // Сохраняем дату или null
                uid: user.uid,
                completed: false,
                createdAt: serverTimestamp()
            });

            taskInput.value = '';
            taskInput.value = '';
            taskInput.style.height = 'auto'; // Сбрасываем высоту обратно
            if (deadlineInput) deadlineInput.value = ''; // Очищаем дату после добавления

        } catch (error) {
            console.error('Ошибка при добавлении:', error);
        }
    });
}
