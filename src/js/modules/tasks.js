import { db } from './firebase.js';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    doc,       // <-- Добавили
    updateDoc, // <-- Добавили
    deleteDoc  // <-- Добавили
} from 'firebase/firestore';

export function initTasks(user) {
    const taskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const emptyMessage = document.getElementById('empty-message');

    if (!taskForm) return;

    const q = query(collection(db, 'tasks'), where('uid', '==', user.uid));

    onSnapshot(q, (snapshot) => {
        taskList.innerHTML = '';

        if (snapshot.empty) {
            emptyMessage.style.display = 'block';
            taskList.appendChild(emptyMessage);
        } else {
            emptyMessage.style.display = 'none';

            snapshot.forEach((docSnap) => {
                const task = docSnap.data();
                const taskId = docSnap.id;

                // Создаем li
                const li = document.createElement('li');
                // Если задача выполнена, добавляем модификатор для зачеркивания
                li.className = `task-item ${task.completed ? 'task-item--completed' : ''}`;

                // 1. Чекбокс
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-item__checkbox';
                checkbox.checked = task.completed;

                // Слушатель на чекбокс (обновляет статус в Firebase)
                checkbox.addEventListener('change', async () => {
                    await updateDoc(doc(db, 'tasks', taskId), {
                        completed: checkbox.checked
                    });
                });

                // 2. Текст задачи
                const span = document.createElement('span');
                span.className = 'task-item__text';
                span.textContent = task.text;

                // 3. Кнопка удаления
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'task-item__delete';
                deleteBtn.innerHTML = '✕'; // Крестик

                // Слушатель на удаление
                deleteBtn.addEventListener('click', async () => {
                    await deleteDoc(doc(db, 'tasks', taskId));
                });

                // Собираем задачу воедино
                li.appendChild(checkbox);
                li.appendChild(span);
                li.appendChild(deleteBtn);

                taskList.appendChild(li);
            });
        }
    });

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;

        try {
            await addDoc(collection(db, 'tasks'), {
                text: text,
                uid: user.uid,
                completed: false,
                createdAt: serverTimestamp()
            });
            taskInput.value = '';
        } catch (error) {
            console.error('Ошибка при добавлении:', error);
        }
    });
}
