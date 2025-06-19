// settings.js - Menangani fungsionalitas halaman settings

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi komponen
    // initializeThemeSettings(); // Dihapus karena dikelola oleh common.js
    // initializeCategories(); // Dihapus karena fitur dipindahkan ke detailed.js
    initializeWidgets();

    // Debugging: Periksa warna judul di dark mode
    const themeCardTitle = document.querySelector('.settings-card h2');
    const themeSectionTitle = document.querySelector('.settings-section h3');

    if (themeCardTitle) {
        console.log('Warna judul Kartu Pengaturan:', getComputedStyle(themeCardTitle).color);
    }
    if (themeSectionTitle) {
        console.log('Warna judul Bagian Pengaturan:', getComputedStyle(themeSectionTitle).color);
    }
});

// Fungsi untuk menginisialisasi widget
function initializeWidgets() {
    const availableWidgets = document.getElementById('available-widgets');
    const activeWidgets = document.getElementById('active-widgets');
    const savedWidgets = JSON.parse(localStorage.getItem('activeWidgets')) || [];

    // Load saved widget order
    savedWidgets.forEach(widgetId => {
        const widget = availableWidgets.querySelector(`[data-widget="${widgetId}"]`);
        if (widget) {
            activeWidgets.appendChild(widget.cloneNode(true));
        }
    });

    // Make widgets draggable
    const widgets = document.querySelectorAll('.widget-item');
    widgets.forEach(widget => {
        widget.addEventListener('dragstart', handleDragStart);
        widget.addEventListener('dragend', handleDragEnd);
    });

    // Setup drop zones
    [availableWidgets, activeWidgets].forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('drop', handleDrop);
    });
}

// Drag and Drop Handlers
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.widget);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const widgetId = e.dataTransfer.getData('text/plain');
    const widget = document.querySelector(`[data-widget="${widgetId}"]`);
    const sourceContainer = widget.parentNode;
    const targetContainer = e.currentTarget;

    if (sourceContainer !== targetContainer) {
        targetContainer.appendChild(widget);
        saveWidgetOrder();
    }
}

// Fungsi untuk menyimpan urutan widget
function saveWidgetOrder() {
    const activeWidgets = Array.from(document.getElementById('active-widgets').children)
        .map(widget => widget.dataset.widget);
    localStorage.setItem('activeWidgets', JSON.stringify(activeWidgets));
} 