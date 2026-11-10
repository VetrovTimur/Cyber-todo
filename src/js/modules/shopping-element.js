import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.js';

export function createShoppingElement(item, itemId) {
    const li = document.createElement('li');
    li.className = `shopping-item ${item.bought ? 'shopping-item--bought' : ''}`;

    // Левая часть: Название и количество
    const infoDiv = document.createElement('div');
    infoDiv.className = 'shopping-item__info';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'shopping-item__name';
    nameSpan.textContent = item.name;

    const qtySpan = document.createElement('span');
    qtySpan.className = 'shopping-item__qty';
    qtySpan.textContent = `${item.qty} шт.`;

    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(qtySpan);

    // Правая часть: Кнопки
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'shopping-item__actions';

    // Кнопка "Купил"
    const boughtBtn = document.createElement('button');
    boughtBtn.className = 'shopping-item__bought-btn';
    boughtBtn.textContent = item.bought ? 'Куплено' : 'Купил';

    boughtBtn.addEventListener('click', async () => {
        await updateDoc(doc(db, 'shopping', itemId), {
            bought: !item.bought
        });
    });

    // Кнопка удаления (с подтверждением)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'shopping-item__delete';
    deleteBtn.innerHTML = '✕';

    let isConfirming = false;
    let confirmTimeout;

    deleteBtn.addEventListener('click', async () => {
        if (!isConfirming) {
            isConfirming = true;
            deleteBtn.innerHTML = 'Точно?';
            deleteBtn.classList.add('shopping-item__delete--confirm');
            // Добавим класс для стилей подтверждения, если его нет в SCSS
            deleteBtn.style.color = '#ff4d4d';
            deleteBtn.style.fontSize = '0.8rem';

            confirmTimeout = setTimeout(() => {
                isConfirming = false;
                deleteBtn.innerHTML = '✕';
                deleteBtn.style.color = '';
                deleteBtn.style.fontSize = '';
            }, 3000);
        } else {
            clearTimeout(confirmTimeout);
            await deleteDoc(doc(db, 'shopping', itemId));
        }
    });

    actionsDiv.appendChild(boughtBtn);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(infoDiv);
    li.appendChild(actionsDiv);

    return li;
}
