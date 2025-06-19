// common.js - Berisi fungsi-fungsi yang digunakan di berbagai halaman dan logika umum

// Navigasi sidebar
const navItems = document.querySelectorAll('.sidebar .nav-item');

if (navItems) {
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
  });
}

// Highlight nav-item sesuai halaman aktif
const currentPage = window.location.pathname.split('/').pop();
if (navItems) {
    navItems.forEach(item => {
      const href = item.getAttribute('href');
      // Check if href is defined and matches the current page, considering index.html at root
      if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
}

// Helper function to format number as Indonesian Rupiah
function formatRupiah(amount) {
    // Ensure amount is a number, default to 0 if parsing fails
    const numberAmount = parseFloat(amount) || 0; // Use parseFloat on the number/numeric string
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0, // Atur sesuai kebutuhan (misal 0 untuk tanpa koma)
        maximumFractionDigits: 2  // Atur sesuai kebutuhan
    }).format(numberAmount);
}

// Asumsi nilai konversi 1 USD ke IDR
formatRupiah.conversionRate = 15000; 

// Helper function to clean number string from input and return number
function cleanInputNumberString(numberString) {
    if (!numberString) return 0;
    // Ensure it's a string first
    let cleanString = String(numberString).replace(/[^\d,.-]/g, ''); // Allow digits, comma, period, dash
    cleanString = cleanString.replace(/\./g, ''); // Remove thousands separator dots
    cleanString = cleanString.replace(',', '.'); // Replace comma decimal with period
    // Handle potential negative sign if needed, but debts are usually positive
    return parseFloat(cleanString) || 0;
}

// Helper function to format number with thousand separators
function formatNumberWithThousands(number) {
    const numberValue = parseFloat(number) || 0;
    // Use toLocaleString with 'id-ID' locale for Indonesian number format
    // This will use '.' as thousand separator and ',' as decimal separator
    // We can control decimal places here if needed, currently set to 0-2
    return numberValue.toLocaleString('id-ID', {
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2  
    });
}

// Helper function to format number string with thousands separator (Untuk input form)
function formatInputWithThousands(numberString) {
    // Remove existing thousands separators (.,) and replace comma with period for decimal if exists
    let cleanString = String(numberString).replace(/[^\d,.]/g, ''); // Pastikan input adalah string
    // Hapus titik ribuan yang mungkin ada
    cleanString = cleanString.replace(/\./g, '');
    // Handle comma as decimal separator
    cleanString = cleanString.replace(',', '.');

    const parts = cleanString.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add thousands separator to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Combine integer and decimal parts
    let formattedNumber = formattedInteger;
    if (decimalPart !== undefined && decimalPart !== '') { // Tambahkan cek agar tidak menambah koma jika desimal kosong
        formattedNumber += ',' + decimalPart; // Use comma as decimal separator
    }

    return formattedNumber;
}

// Apply saved theme and palette on load
document.addEventListener('DOMContentLoaded', function() {
    applySavedThemeAndPalette();

    // Initialize color palettes on DOMContentLoaded (only attaches click handlers if elements exist)
    initializeColorPalettes();
});

// Fungsi untuk mengatur tema (dark/light)
function setTheme(themeName) {
    const body = document.body;
    if (themeName === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', themeName);
}

// Fungsi untuk menerapkan tema dan palet yang disimpan
function applySavedThemeAndPalette() {
    console.log('applySavedThemeAndPalette called');
    const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light theme
    const savedPalette = localStorage.getItem('colorPalette') || 'default'; // Default to default palette

    setTheme(savedTheme);
    applyColorPalette(savedPalette);

    // Update active state of palette options (if on settings page)
    const colorPalettes = document.querySelectorAll('.color-palette');
    if (colorPalettes.length > 0) {
        colorPalettes.forEach(palette => {
            if (palette.dataset.palette === savedPalette) {
                palette.classList.add('active');
            } else {
                palette.classList.remove('active');
            }
        });
    }
}

// Fungsi untuk menginisialisasi palet warna
function initializeColorPalettes() {
    const colorPalettes = document.querySelectorAll('.color-palette');

    // Color palette click handler (only for settings page where palettes are present)
    if (colorPalettes.length > 0) {
        colorPalettes.forEach(palette => {
            console.log('Attaching click listener to palette:', palette.dataset.palette);
            palette.addEventListener('click', () => {
                const paletteName = palette.dataset.palette;
                console.log('Palette clicked:', paletteName);
                
                // Determine the implied theme based on the selected palette
                let impliedTheme = 'light'; // Default to light
                if (paletteName === 'dark') { // Only 'dark' palette implies dark theme
                    impliedTheme = 'dark';
                }
                localStorage.setItem('theme', impliedTheme);

                // Save preference for color palette
                localStorage.setItem('colorPalette', paletteName);
                
                // Apply changes
                applySavedThemeAndPalette();

                // Update active state is handled by applySavedThemeAndPalette
            });
        });
    }
}

// Fungsi untuk memperbarui skema warna (diubah namanya menjadi applyColorPalette)
function applyColorPalette(paletteName) {
    const root = document.documentElement;

    // List all variables that are modified by individual palettes
    const paletteSpecificVars = [
        '--bg-color',
        '--text-color',
        '--card-bg',
        '--button-primary-bg',
        '--button-primary-color',
        '--chart-title-gradient-start',
        '--chart-title-gradient-end',
        '--brand-gradient-start',
        '--brand-gradient-end',
        '--sidebar-bg',
        '--header-bg',
        '--nav-item-color',
        '--nav-item-hover-color',
        '--header-text-color',
        '--nav-item-active-color'
    ];

    // Clear previously applied palette specific variables
    paletteSpecificVars.forEach(v => root.style.removeProperty(v));

    switch(paletteName) {
        case 'dark':
            root.style.setProperty('--sidebar-bg', '#23272a');
            root.style.setProperty('--header-bg', '#23272a');
            root.style.setProperty('--nav-item-color', '#99aab5');
            root.style.setProperty('--nav-item-hover-bg', '#40444b');
            root.style.setProperty('--nav-item-hover-color', '#ffffff');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--nav-item-active-color', '#ffffff');
            break;
        case 'pastel1':
            root.style.setProperty('--bg-color', '#FFF2E0');
            root.style.setProperty('--text-color', '#4A4A4A');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--button-primary-bg', '#898AC4');
            root.style.setProperty('--button-primary-color', 'white');
            root.style.setProperty('--chart-title-gradient-start', '#898AC4');
            root.style.setProperty('--chart-title-gradient-end', '#4A4A4A');
            root.style.setProperty('--brand-gradient-start', '#898AC4');
            root.style.setProperty('--brand-gradient-end', '#FFF2E0');
            root.style.setProperty('--sidebar-bg', '#898AC4');
            root.style.setProperty('--header-bg', '#898AC4');
            root.style.setProperty('--nav-item-color', '#ffffff');
            root.style.setProperty('--nav-item-hover-bg', '#A2AADB');
            root.style.setProperty('--nav-item-hover-color', 'var(--text-color)');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--nav-item-active-color', '#ffffff');
            break;
        case 'pastel2':
            root.style.setProperty('--bg-color', '#EEEFE0');
            root.style.setProperty('--text-color', '#4A4A4A');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--button-primary-bg', '#A7C1A8');
            root.style.setProperty('--button-primary-color', 'white');
            root.style.setProperty('--chart-title-gradient-start', '#819A91');
            root.style.setProperty('--chart-title-gradient-end', '#4A4A4A');
            root.style.setProperty('--brand-gradient-start', '#A7C1A8');
            root.style.setProperty('--brand-gradient-end', '#819A91');
            root.style.setProperty('--sidebar-bg', '#819A91');
            root.style.setProperty('--header-bg', '#819A91');
            root.style.setProperty('--nav-item-color', '#ffffff');
            root.style.setProperty('--nav-item-hover-bg', '#A7C1A8');
            root.style.setProperty('--nav-item-hover-color', 'var(--text-color)');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--nav-item-active-color', '#ffffff');
            break;
        case 'warm1':
            root.style.setProperty('--bg-color', '#FEF3E2');
            root.style.setProperty('--text-color', '#4A4A4A');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--button-primary-bg', '#FA812F');
            root.style.setProperty('--button-primary-color', 'white');
            root.style.setProperty('--chart-title-gradient-start', '#FA812F');
            root.style.setProperty('--chart-title-gradient-end', '#4A4A4A');
            root.style.setProperty('--brand-gradient-start', '#FA812F');
            root.style.setProperty('--brand-gradient-end', '#FEF3E2');
            root.style.setProperty('--sidebar-bg', '#FA812F');
            root.style.setProperty('--header-bg', '#FA812F');
            root.style.setProperty('--nav-item-color', '#ffffff');
            root.style.setProperty('--nav-item-hover-bg', '#FFB22C');
            root.style.setProperty('--nav-item-hover-color', 'var(--text-color)');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--nav-item-active-color', '#ffffff');
            break;
        case 'nature1':
            root.style.setProperty('--bg-color', '#FFF1CA');
            root.style.setProperty('--text-color', '#4A4A4A');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--button-primary-bg', '#708A58');
            root.style.setProperty('--button-primary-color', 'white');
            root.style.setProperty('--chart-title-gradient-start', '#2D4F2B');
            root.style.setProperty('--chart-title-gradient-end', '#708A58');
            root.style.setProperty('--brand-gradient-start', '#708A58');
            root.style.setProperty('--brand-gradient-end', '#FFF1CA');
            root.style.setProperty('--sidebar-bg', '#2D4F2B');
            root.style.setProperty('--header-bg', '#2D4F2B');
            root.style.setProperty('--nav-item-color', '#ffffff');
            root.style.setProperty('--nav-item-hover-bg', '#708A58');
            root.style.setProperty('--nav-item-hover-color', 'var(--text-color)');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--nav-item-active-color', '#ffffff');
            break;
        case 'nature2':
            root.style.setProperty('--bg-color', '#E1EEBC');
            root.style.setProperty('--text-color', '#4A4A4A');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--button-primary-bg', '#67AE6E');
            root.style.setProperty('--button-primary-color', 'white');
            root.style.setProperty('--chart-title-gradient-start', '#328E6E');
            root.style.setProperty('--chart-title-gradient-end', '#67AE6E');
            root.style.setProperty('--brand-gradient-start', '#67AE6E');
            root.style.setProperty('--brand-gradient-end', '#E1EEBC');
            root.style.setProperty('--sidebar-bg', '#328E6E');
            root.style.setProperty('--header-bg', '#328E6E');
            root.style.setProperty('--nav-item-color', '#ffffff');
            root.style.setProperty('--nav-item-hover-bg', '#67AE6E');
            root.style.setProperty('--nav-item-hover-color', 'var(--text-color)');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--nav-item-active-color', '#ffffff');
            break;
        case 'sunset1':
            root.style.setProperty('--bg-color', '#FFF085');
            root.style.setProperty('--text-color', '#4A4A4A');
            root.style.setProperty('--card-bg', '#FFFFFF');
            root.style.setProperty('--button-primary-bg', '#FF9B17');
            root.style.setProperty('--button-primary-color', 'white');
            root.style.setProperty('--chart-title-gradient-start', '#F16767');
            root.style.setProperty('--chart-title-gradient-end', '#4A4A4A');
            root.style.setProperty('--brand-gradient-start', '#FF9B17');
            root.style.setProperty('--brand-gradient-end', '#FFF085');
            root.style.setProperty('--sidebar-bg', '#F16767');
            root.style.setProperty('--header-bg', '#F16767');
            root.style.setProperty('--nav-item-color', '#ffffff');
            root.style.setProperty('--nav-item-hover-bg', '#FCB454');
            root.style.setProperty('--nav-item-hover-color', 'var(--text-color)');
            root.style.setProperty('--header-text-color', '#ffffff');
            root.style.setProperty('--nav-item-active-color', '#ffffff');
            break;
        default:
            root.style.setProperty('--nav-item-color', '#8a94a6');
            root.style.setProperty('--nav-item-hover-bg', '#f0f5ff');
            root.style.setProperty('--nav-item-hover-color', 'var(--button-primary-bg)');
            root.style.setProperty('--header-text-color', '#1a2542');
            root.style.setProperty('--nav-item-active-color', 'var(--button-primary-color)');
            break;
    }
}

// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    
    if (hamburgerMenu && sidebar) {
        hamburgerMenu.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });

        // Close sidebar when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnHamburger = hamburgerMenu.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickOnHamburger && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    }
}); 