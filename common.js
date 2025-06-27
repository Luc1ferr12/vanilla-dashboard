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

// Sistem Translasi Sederhana
const translations = {
  en: {
    'settings_title': 'Settings',
    'settings_subtitle': 'Customize the look and settings of the app',
    'account_info': 'Account Information',
    'display_name': 'Display Name',
    'display_name_placeholder': 'Enter display name',
    'email': 'Email',
    'email_placeholder': 'Your Google email',
    'email_help': 'Email cannot be changed because it is linked to Google',
    'location': 'Location',
    'save_changes': 'Save Changes',
    'app_preferences': 'App Preferences',
    'currency': 'Currency',
    'language': 'Language',
    'save_preferences': 'Save Preferences',
    'theme_and_color': 'Theme and Color',
    'color_palette': 'Color Palette',
    'welcome': 'Welcome,',
    // Country names
    'country_id': 'Indonesia',
    'country_my': 'Malaysia',
    'country_sg': 'Singapore',
    'country_th': 'Thailand',
    'country_ph': 'Philippines',
    'country_vn': 'Vietnam',
    'country_au': 'Australia',
    'country_us': 'United States',
    'country_gb': 'United Kingdom',
    'country_ca': 'Canada',
    'country_jp': 'Japan',
    'country_kr': 'South Korea',
    'country_cn': 'China',
    'country_in': 'India',
    'country_de': 'Germany',
    'country_fr': 'France',
    'country_it': 'Italy',
    'country_es': 'Spain',
    'country_nl': 'Netherlands',
    'country_br': 'Brazil',
    'country_mx': 'Mexico',
    'country_ar': 'Argentina',
    'country_za': 'South Africa',
    'country_eg': 'Egypt',
    'country_ng': 'Nigeria',
    'country_ke': 'Kenya',
    'country_ru': 'Russia',
    'country_tr': 'Turkey',
    'country_sa': 'Saudi Arabia',
    'country_ae': 'United Arab Emirates',
    'country_il': 'Israel',
    'country_ir': 'Iran',
    'country_pk': 'Pakistan',
    'country_bd': 'Bangladesh',
    'country_lk': 'Sri Lanka',
    'country_np': 'Nepal',
    'country_mm': 'Myanmar',
    'country_kh': 'Cambodia',
    'country_la': 'Laos',
    'country_bn': 'Brunei',
    'country_tl': 'Timor-Leste',
    'country_pg': 'Papua New Guinea',
    'country_fj': 'Fiji',
    'country_nz': 'New Zealand',
    'country_other': 'Other',
    'trend_chart_title': 'Income and Expense Trend',
    'category_chart_title': 'Expense Distribution by Category',
    'income': 'Income',
    'expenses': 'Expenses',
    'savings': 'Savings',
    'no_expense_data': 'No expense data to display',
    'date': 'Date',
    'week': 'Week',
    'dashboard_title': 'Budget Analytics',
    'dashboard_subtitle': 'Track your budget performance and sales metrics',
    'sidebar_dashboard': 'Dashboard',
    'sidebar_detailed': 'Detailed',
    'sidebar_debts': 'Debts',
    'sidebar_budget_tools': 'Budget Tools',
    'sidebar_settings': 'Settings',
    'logout': 'Logout',
    'stat_total_savings': 'Total Savings',
    'stat_total_income': 'Total Income',
    'stat_total_expenses': 'Total Expenses',
    'stat_balance': 'Balance',
    'stat_badge_savings': '+30 New Additions',
    'stat_badge_balance': '+5.2% Growth Rate',
    // ... tambahkan key lain sesuai kebutuhan ...
  },
  id: {
    'settings_title': 'Pengaturan',
    'settings_subtitle': 'Kustomisasi tampilan dan pengaturan aplikasi',
    'account_info': 'Informasi Akun',
    'display_name': 'Nama Tampilan',
    'display_name_placeholder': 'Masukkan nama tampilan',
    'email': 'Email',
    'email_placeholder': 'Email Google Anda',
    'email_help': 'Email tidak dapat diubah karena terhubung dengan Google',
    'location': 'Lokasi',
    'save_changes': 'Simpan Perubahan',
    'app_preferences': 'Preferensi Aplikasi',
    'currency': 'Mata Uang',
    'language': 'Bahasa',
    'save_preferences': 'Simpan Preferensi',
    'theme_and_color': 'Tema dan Warna',
    'color_palette': 'Palet Warna',
    'welcome': 'Selamat datang,',
    // Country names
    'country_id': 'Indonesia',
    'country_my': 'Malaysia',
    'country_sg': 'Singapura',
    'country_th': 'Thailand',
    'country_ph': 'Filipina',
    'country_vn': 'Vietnam',
    'country_au': 'Australia',
    'country_us': 'Amerika Serikat',
    'country_gb': 'Inggris',
    'country_ca': 'Kanada',
    'country_jp': 'Jepang',
    'country_kr': 'Korea Selatan',
    'country_cn': 'Tiongkok',
    'country_in': 'India',
    'country_de': 'Jerman',
    'country_fr': 'Perancis',
    'country_it': 'Italia',
    'country_es': 'Spanyol',
    'country_nl': 'Belanda',
    'country_br': 'Brasil',
    'country_mx': 'Meksiko',
    'country_ar': 'Argentina',
    'country_za': 'Afrika Selatan',
    'country_eg': 'Mesir',
    'country_ng': 'Nigeria',
    'country_ke': 'Kenya',
    'country_ru': 'Rusia',
    'country_tr': 'Turki',
    'country_sa': 'Arab Saudi',
    'country_ae': 'Uni Emirat Arab',
    'country_il': 'Israel',
    'country_ir': 'Iran',
    'country_pk': 'Pakistan',
    'country_bd': 'Bangladesh',
    'country_lk': 'Sri Lanka',
    'country_np': 'Nepal',
    'country_mm': 'Myanmar',
    'country_kh': 'Kamboja',
    'country_la': 'Laos',
    'country_bn': 'Brunei',
    'country_tl': 'Timor Leste',
    'country_pg': 'Papua Nugini',
    'country_fj': 'Fiji',
    'country_nz': 'Selandia Baru',
    'country_other': 'Lainnya',
    'trend_chart_title': 'Tren Pemasukan dan Pengeluaran',
    'category_chart_title': 'Distribusi Pengeluaran per Kategori',
    'income': 'Pemasukan',
    'expenses': 'Pengeluaran',
    'savings': 'Tabungan',
    'no_expense_data': 'Tidak ada data pengeluaran untuk ditampilkan',
    'date': 'Tanggal',
    'week': 'Minggu',
    'dashboard_title': 'Analitik Anggaran',
    'dashboard_subtitle': 'Pantau performa anggaran dan metrik keuangan Anda',
    'sidebar_dashboard': 'Dasbor',
    'sidebar_detailed': 'Rincian',
    'sidebar_debts': 'Hutang',
    'sidebar_budget_tools': 'Alat Anggaran',
    'sidebar_settings': 'Pengaturan',
    'logout': 'Keluar',
    'stat_total_savings': 'Total Tabungan',
    'stat_total_income': 'Total Pemasukan',
    'stat_total_expenses': 'Total Pengeluaran',
    'stat_balance': 'Saldo',
    'stat_badge_savings': '+30 Penambahan Baru',
    'stat_badge_balance': '+5.2% Pertumbuhan',
    // ... tambahkan key lain sesuai kebutuhan ...
  }
};

function setLanguage(lang) {
  localStorage.setItem('appLanguage', lang);
  translatePage();
}

function translatePage() {
  const lang = localStorage.getItem('appLanguage') || 'en';
  const dict = translations[lang] || translations['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });
  // Untuk placeholder khusus
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });
  // Khusus untuk welcome user
  const welcomeUser = document.getElementById('welcomeUser');
  if (welcomeUser) {
    const displayName = welcomeUser.textContent.split(',')[1]?.trim() || '';
    welcomeUser.textContent = `${dict['welcome']} ${displayName}`;
  }
}

// Apply saved theme and palette on load
document.addEventListener('DOMContentLoaded', function() {
    applySavedThemeAndPalette();

    // Initialize color palettes on DOMContentLoaded (only attaches click handlers if elements exist)
    initializeColorPalettes();
    translatePage();
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

// Fungsi global untuk format currency sesuai preferensi user
function formatCurrency(amount) {
    const currency = localStorage.getItem('appCurrency') || 'IDR';
    let locale = 'id-ID';
    switch (currency) {
        case 'USD': locale = 'en-US'; break;
        case 'EUR': locale = 'de-DE'; break;
        case 'SGD': locale = 'en-SG'; break;
        case 'AUD': locale = 'en-AU'; break;
        case 'MYR': locale = 'ms-MY'; break;
        case 'JPY': locale = 'ja-JP'; break;
        case 'KRW': locale = 'ko-KR'; break;
        case 'GBP': locale = 'en-GB'; break;
        case 'CNY': locale = 'zh-CN'; break;
        default: locale = 'id-ID'; break;
    }
    const numberAmount = parseFloat(amount) || 0;
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(numberAmount);
} 