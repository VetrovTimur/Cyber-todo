let currentStatus = 'all';
let currentCategory = 'all';

export function getCurrentFilters() {
    return { status: currentStatus, category: currentCategory };
}

export function initFilters() {
    const statusBtns = document.querySelectorAll('[data-filter-status]');
    const categoryBtns = document.querySelectorAll('[data-filter-category]');

    if (!statusBtns.length || !categoryBtns.length) return;

    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statusBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatus = btn.dataset.filterStatus;
            document.dispatchEvent(new window.CustomEvent('filtersChanged'));
        });
    });

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.filterCategory;
            document.dispatchEvent(new window.CustomEvent('filtersChanged'));
        });
    });
}
