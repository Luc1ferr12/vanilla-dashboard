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

// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
      if (themeToggle) themeToggle.textContent = '🌙';
    } else {
      body.classList.remove('dark-mode');
      if (themeToggle) themeToggle.textContent = '💡';
    }

    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
          if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            themeToggle.textContent = '💡';
            localStorage.setItem('theme', 'light');
          } else {
            body.classList.add('dark-mode');
            themeToggle.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
          }
        });
    }
});

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