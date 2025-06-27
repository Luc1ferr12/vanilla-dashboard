// settings.js - Menangani fungsionalitas halaman settings

document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi komponen
    // initializeThemeSettings(); // Dihapus karena dikelola oleh common.js
    // initializeCategories(); // Dihapus karena fitur dipindahkan ke detailed.js
    initializeAccountForm();
    initializePreferencesForm();
    updateWelcomeUser();

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

// Fungsi untuk menginisialisasi form account information
function initializeAccountForm() {
    const accountForm = document.getElementById('accountForm');
    const displayNameInput = document.getElementById('displayName');
    const emailInput = document.getElementById('email');
    const locationSelect = document.getElementById('location');

    // Check authentication status dan isi form
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // Isi email (readonly)
            emailInput.value = user.email;
            
            // Isi display name dari user atau dari localStorage
            const savedDisplayName = localStorage.getItem('userDisplayName');
            displayNameInput.value = user.displayName || savedDisplayName || '';
            
            // Isi location dari localStorage atau default ke Indonesia
            const savedLocation = localStorage.getItem('userLocation');
            locationSelect.value = savedLocation || 'ID';
        }
    });

    // Handle form submission
    if (accountForm) {
        accountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const displayName = displayNameInput.value.trim();
            const location = locationSelect.value;
            
            // Validasi
            if (!displayName) {
                showNotification('Nama tampilan tidak boleh kosong', 'error');
                return;
            }
            
            // Simpan ke localStorage
            localStorage.setItem('userDisplayName', displayName);
            localStorage.setItem('userLocation', location);
            
            // Update display name di Firebase (jika user terautentikasi)
            const user = firebase.auth().currentUser;
            if (user) {
                user.updateProfile({
                    displayName: displayName
                }).then(() => {
                    showNotification('Informasi akun berhasil disimpan!', 'success');
                    
                    // Update tampilan header
                    const userName = document.getElementById('userName');
                    if (userName) {
                        userName.textContent = displayName;
                    }
                    
                    // Update avatar jika menggunakan inisial
                    const userAvatar = document.getElementById('userAvatar');
                    if (userAvatar && !user.photoURL) {
                        userAvatar.textContent = displayName.split(' ').map(n => n[0]).join('').toUpperCase();
                    }
                }).catch((error) => {
                    console.error('Error updating profile:', error);
                    showNotification('Gagal menyimpan ke server, tetapi data tersimpan lokal', 'warning');
                });
            } else {
                showNotification('Informasi akun berhasil disimpan!', 'success');
            }
        });
    }
}

function initializePreferencesForm() {
    const preferencesForm = document.getElementById('preferencesForm');
    const currencySelect = document.getElementById('currency');
    const languageSelect = document.getElementById('language');

    // Load saved preferences from localStorage
    const savedCurrency = localStorage.getItem('appCurrency') || 'IDR';
    const savedLanguage = localStorage.getItem('appLanguage') || 'en';
    if (currencySelect) currencySelect.value = savedCurrency;
    if (languageSelect) languageSelect.value = savedLanguage;

    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currency = currencySelect.value;
            const language = languageSelect.value;
            localStorage.setItem('appCurrency', currency);
            localStorage.setItem('appLanguage', language);
            setLanguage(language);
            showNotification('Preferences saved!', 'success');
        });
        if (languageSelect) {
            languageSelect.addEventListener('change', function() {
                setLanguage(this.value);
            });
        }
    }
}

function updateWelcomeUser() {
    const welcomeUser = document.getElementById('welcomeUser');
    if (!welcomeUser) return;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const savedDisplayName = localStorage.getItem('userDisplayName');
            const displayName = user.displayName || savedDisplayName || user.email.split('@')[0];
            welcomeUser.textContent = `Welcome, ${displayName}`;
        } else {
            welcomeUser.textContent = 'Welcome, Guest';
        }
    });
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bx ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(notification);
    
    // Tampilkan dengan animasi
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Fungsi untuk mendapatkan icon notifikasi
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'bx-check-circle';
        case 'error': return 'bx-x-circle';
        case 'warning': return 'bx-error';
        default: return 'bx-info-circle';
    }
} 