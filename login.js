// Initialize Firebase Auth
const auth = firebase.auth();

// DOM elements
const googleLoginBtn = document.getElementById('googleLoginBtn');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const emailLoginBtn = document.getElementById('emailLoginBtn');
const signupLink = document.getElementById('signupLink');

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in, redirect to dashboard
        window.location.href = 'index.html';
    }
});

// Google Sign In
googleLoginBtn.addEventListener('click', async () => {
    try {
        setLoading(googleLoginBtn, true);
        
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        const result = await auth.signInWithPopup(provider);
        
        if (result.user) {
            // Create user profile in Firestore if it doesn't exist
            await createUserProfile(result.user);
            showMessage('Berhasil masuk dengan Google!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Google login error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setLoading(googleLoginBtn, false);
    }
});

// Email/Password Sign In
emailLoginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showMessage('Mohon isi email dan password', 'error');
        return;
    }
    
    try {
        setLoading(emailLoginBtn, true);
        
        const result = await auth.signInWithEmailAndPassword(email, password);
        
        if (result.user) {
            showMessage('Berhasil masuk!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Email login error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setLoading(emailLoginBtn, false);
    }
});

// Sign Up functionality
let isSignUpMode = false;
signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    
    if (isSignUpMode) {
        emailLoginBtn.textContent = 'Daftar dengan Email';
        signupLink.textContent = 'Sudah punya akun? Masuk di sini';
        document.querySelector('.welcome-text h2').textContent = 'Daftar Akun';
        document.querySelector('.welcome-text p').textContent = 'Buat akun baru untuk mengakses dashboard keuangan';
    } else {
        emailLoginBtn.textContent = 'Masuk dengan Email';
        signupLink.textContent = 'Belum punya akun? Daftar di sini';
        document.querySelector('.welcome-text h2').textContent = 'Selamat Datang';
        document.querySelector('.welcome-text p').textContent = 'Masuk untuk mengakses dashboard keuangan Anda';
    }
});

// Handle email login/signup based on mode
emailLoginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (!email || !password) {
        showMessage('Mohon isi email dan password', 'error');
        return;
    }
    
    try {
        setLoading(emailLoginBtn, true);
        
        let result;
        if (isSignUpMode) {
            // Sign up
            result = await auth.createUserWithEmailAndPassword(email, password);
            if (result.user) {
                await createUserProfile(result.user);
                showMessage('Akun berhasil dibuat!', 'success');
            }
        } else {
            // Sign in
            result = await auth.signInWithEmailAndPassword(email, password);
            if (result.user) {
                showMessage('Berhasil masuk!', 'success');
            }
        }
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Email auth error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        setLoading(emailLoginBtn, false);
    }
});

// Create user profile in Firestore
async function createUserProfile(user) {
    try {
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last login
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
}

// Utility functions
function setLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;
    
    // Insert before the form
    const form = document.querySelector('.login-form');
    form.insertBefore(messageDiv, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'Email tidak terdaftar';
        case 'auth/wrong-password':
            return 'Password salah';
        case 'auth/invalid-email':
            return 'Format email tidak valid';
        case 'auth/weak-password':
            return 'Password terlalu lemah (minimal 6 karakter)';
        case 'auth/email-already-in-use':
            return 'Email sudah terdaftar';
        case 'auth/popup-closed-by-user':
            return 'Login dibatalkan';
        case 'auth/popup-blocked':
            return 'Popup diblokir oleh browser. Mohon izinkan popup untuk domain ini';
        case 'auth/network-request-failed':
            return 'Koneksi internet bermasalah';
        default:
            return 'Terjadi kesalahan. Silakan coba lagi';
    }
}

// Enter key support
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        emailLoginBtn.click();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    console.log('Login page loaded');
}); 