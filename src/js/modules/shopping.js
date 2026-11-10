import { db } from './firebase.js';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { createShoppingElement } from './shopping-element.js';

export function initShopping(user) {
    const shoppingForm = document.getElementById('add-shopping-form');
    const nameInput = document.getElementById('shopping-input-name');
    const qtyInput = document.getElementById('shopping-input-qty');
    const shoppingList = document.getElementById('shopping-list');
    const emptyMessage = document.getElementById('shopping-empty-message');

    if (!shoppingForm) return;

    // Запрос к базе: берем список покупок текущего пользователя
    const q = query(collection(db, 'shopping'), where('uid', '==', user.uid));

    // Слушаем изменения в реальном времени
    onSnapshot(q, (snapshot) => {
        shoppingList.innerHTML = '';

        if (snapshot.empty) {
            emptyMessage.style.display = 'block';
            shoppingList.appendChild(emptyMessage);
        } else {
            emptyMessage.style.display = 'none';

            snapshot.forEach((docSnap) => {
                const item = docSnap.data();

                // Создаем карточку через отдельный модуль и добавляем в список
                const itemEl = createShoppingElement(item, docSnap.id);
                shoppingList.appendChild(itemEl);
            });
        }
    });

    // Логика добавления нового товара
    shoppingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        let qty = parseInt(qtyInput.value, 10);

        if (!name) return;
        if (isNaN(qty) || qty < 1) qty = 1; // Защита: если пусто или меньше 1, ставим 1

        try {
            await addDoc(collection(db, 'shopping'), {
                name: name,
                qty: qty,
                bought: false,
                uid: user.uid,
                createdAt: serverTimestamp()
            });

            // Очищаем форму и сбрасываем количество на 1
            nameInput.value = '';
            qtyInput.value = '1';

            // Возвращаем фокус в поле ввода (удобно для быстрого добавления)
            nameInput.focus();
        } catch (error) {
            console.error('Ошибка при добавлении покупки:', error);
        }
    });
}
