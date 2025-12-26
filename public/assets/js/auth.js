/**
 * Sendly Authentication
 * Semua event pakai addEventListener, tidak ada onclick di HTML
 */

(function() {
    'use strict';
    
    console.log('AUTH.JS LOADED');
    
    var pendingUser = null;
    
    // Tunggu DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('Initializing auth...');
        console.log('BASE_URL:', typeof BASE_URL !== 'undefined' ? BASE_URL : 'NOT DEFINED');
        
        // Tunggu Firebase siap
        waitForFirebase(function() {
            console.log('Firebase ready, setting up handlers');
            setupEventHandlers();
        });
    }
    
    function waitForFirebase(callback) {
        var attempts = 0;
        var maxAttempts = 50;
        
        function check() {
            attempts++;
            if (typeof firebase !== 'undefined' && firebase.auth) {
                console.log('Firebase detected after ' + attempts + ' attempts');
                callback();
            } else if (attempts < maxAttempts) {
                setTimeout(check, 100);
            } else {
                console.error('Firebase failed to load');
                showToast('Firebase gagal dimuat, refresh halaman', 'error');
            }
        }
        check();
    }
    
    function setupEventHandlers() {
        // ========== TOGGLE PASSWORD ==========
        var togglePasswordBtn = document.getElementById('togglePasswordBtn');
        if (togglePasswordBtn) {
            togglePasswordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                togglePassword('password', 'togglePasswordIcon');
            });
        }
        
        var toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');
        if (toggleConfirmPasswordBtn) {
            toggleConfirmPasswordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                togglePassword('confirmPassword', 'toggleConfirmPasswordIcon');
            });
        }
        
        // ========== PASSWORD STRENGTH ==========
        var passwordInput = document.getElementById('password');
        var strengthFill = document.getElementById('strengthFill');
        var strengthText = document.getElementById('strengthText');
        
        if (passwordInput && strengthFill && strengthText) {
            passwordInput.addEventListener('input', function() {
                updatePasswordStrength(this.value, strengthFill, strengthText);
            });
        }
        
        // ========== LOGIN FORM ==========
        var loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('Login form found');
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleLogin();
            });
        }
        
        // ========== REGISTER FORM ==========
        var registerForm = document.getElementById('registerForm');
        if (registerForm) {
            console.log('Register form found');
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleRegister();
            });
        }
        
        // ========== NAVIGATION LINKS ==========
        var goToRegisterBtn = document.getElementById('goToRegisterBtn');
        if (goToRegisterBtn) {
            goToRegisterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Go to register clicked');
                // Direct redirect with intent parameter
                window.location.href = BASE_URL + '/?intent=register';
            });
        }
        
        var goToLoginBtn = document.getElementById('goToLoginBtn');
        if (goToLoginBtn) {
            goToLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Go to login clicked');
                // Direct redirect with intent parameter
                window.location.href = BASE_URL + '/?intent=login';
            });
        }
        if (googleLoginBtn) {
            console.log('Google button found');
            googleLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Google button clicked');
                handleGoogleLogin();
            });
        }
        
        // ========== FORGOT PASSWORD MODAL ==========
        var forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        var forgotPasswordModal = document.getElementById('forgotPasswordModal');
        var closeForgotModalBtn = document.getElementById('closeForgotModalBtn');
        
        if (forgotPasswordBtn && forgotPasswordModal) {
            forgotPasswordBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(forgotPasswordModal);
            });
        }
        
        if (closeForgotModalBtn && forgotPasswordModal) {
            closeForgotModalBtn.addEventListener('click', function() {
                closeModal(forgotPasswordModal);
            });
        }
        
        if (forgotPasswordModal) {
            forgotPasswordModal.addEventListener('click', function(e) {
                if (e.target === forgotPasswordModal) {
                    closeModal(forgotPasswordModal);
                }
            });
        }
        
        // ========== FORGOT PASSWORD FORM ==========
        var forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                handleForgotPassword();
            });
        }
        
        // ========== TERMS MODAL ==========
        var termsBtn = document.getElementById('termsBtn');
        var termsModal = document.getElementById('termsModal');
        var closeTermsModalBtn = document.getElementById('closeTermsModalBtn');
        var acceptTermsBtn = document.getElementById('acceptTermsBtn');
        
        if (termsBtn && termsModal) {
            termsBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openModal(termsModal);
            });
        }
        
        if (closeTermsModalBtn && termsModal) {
            closeTermsModalBtn.addEventListener('click', function() {
                closeModal(termsModal);
            });
        }
        
        if (acceptTermsBtn) {
            acceptTermsBtn.addEventListener('click', function() {
                var checkbox = document.getElementById('termsCheckbox');
                if (checkbox) checkbox.checked = true;
                closeModal(termsModal);
            });
        }
        
        if (termsModal) {
            termsModal.addEventListener('click', function(e) {
                if (e.target === termsModal) {
                    closeModal(termsModal);
                }
            });
        }
        
        // ========== VERIFY EMAIL MODAL ==========
        var verifyEmailModal = document.getElementById('verifyEmailModal');
        var closeVerifyModalBtn = document.getElementById('closeVerifyModalBtn');
        var resendVerificationBtn = document.getElementById('resendVerificationBtn');
        var checkVerificationBtn = document.getElementById('checkVerificationBtn');
        
        if (closeVerifyModalBtn && verifyEmailModal) {
            closeVerifyModalBtn.addEventListener('click', function() {
                closeModal(verifyEmailModal);
            });
        }
        
        if (verifyEmailModal) {
            verifyEmailModal.addEventListener('click', function(e) {
                if (e.target === verifyEmailModal) {
                    closeModal(verifyEmailModal);
                }
            });
        }
        
        if (resendVerificationBtn) {
            resendVerificationBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleResendVerification();
            });
        }
        
        if (checkVerificationBtn) {
            checkVerificationBtn.addEventListener('click', function(e) {
                e.preventDefault();
                handleCheckVerification();
            });
        }
        
        // ========== ESC KEY ==========
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var modals = document.querySelectorAll('.modal-overlay.show');
                modals.forEach(function(modal) {
                    closeModal(modal);
                });
            }
        });
        
        console.log('Event handlers setup complete');
    }
    
    // ========== HELPER FUNCTIONS ==========
    
    function togglePassword(inputId, iconId) {
        var input = document.getElementById(inputId);
        var icon = document.getElementById(iconId);
        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }
    }
    
    function updatePasswordStrength(password, fillEl, textEl) {
        if (!password) {
            fillEl.className = 'strength-fill';
            textEl.className = 'strength-text';
            textEl.textContent = '';
            return;
        }
        
        var score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        
        fillEl.className = 'strength-fill';
        textEl.className = 'strength-text';
        
        if (score <= 2) {
            fillEl.classList.add('weak');
            textEl.classList.add('weak');
            textEl.textContent = 'Lemah';
        } else if (score <= 3) {
            fillEl.classList.add('medium');
            textEl.classList.add('medium');
            textEl.textContent = 'Sedang';
        } else {
            fillEl.classList.add('strong');
            textEl.classList.add('strong');
            textEl.textContent = 'Kuat';
        }
    }
    
    function openModal(modal) {
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    function showToast(message, type) {
        type = type || 'info';
        var container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        var icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        toast.innerHTML = '<i class="fas ' + icon + '"></i><span>' + message + '</span>';
        container.appendChild(toast);
        
        setTimeout(function() {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(function() { 
                if (toast.parentNode) toast.remove(); 
            }, 300);
        }, 4000);
    }
    
    function setLoading(btn, loading) {
        if (!btn) return;
        if (loading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }
    
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function showFieldError(fieldId, message) {
        var errorEl = document.getElementById(fieldId + 'Error');
        var inputEl = document.getElementById(fieldId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        if (inputEl) {
            inputEl.classList.add('error');
        }
    }
    
    function clearFieldError(fieldId) {
        var errorEl = document.getElementById(fieldId + 'Error');
        var inputEl = document.getElementById(fieldId);
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
        if (inputEl) {
            inputEl.classList.remove('error');
        }
    }
    
    function clearAllErrors() {
        document.querySelectorAll('.error-message').forEach(function(el) {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.querySelectorAll('input.error').forEach(function(el) {
            el.classList.remove('error');
        });
    }
    
    function getErrorMessage(code) {
        var messages = {
            'auth/user-not-found': 'Akun tidak ditemukan',
            'auth/wrong-password': 'Password salah',
            'auth/invalid-email': 'Format email tidak valid',
            'auth/email-already-in-use': 'Email sudah digunakan',
            'auth/weak-password': 'Password minimal 6 karakter',
            'auth/network-request-failed': 'Koneksi internet bermasalah',
            'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
            'auth/invalid-credential': 'Email atau password salah',
            'auth/invalid-login-credentials': 'Email atau password salah',
            'auth/user-disabled': 'Akun dinonaktifkan',
            'auth/popup-blocked': 'Popup diblokir browser, izinkan popup',
            'auth/popup-closed-by-user': 'Login dibatalkan',
            'auth/cancelled-popup-request': 'Login dibatalkan',
            'auth/account-exists-with-different-credential': 'Akun sudah ada dengan metode login lain'
        };
        return messages[code] || 'Terjadi kesalahan: ' + code;
    }
    
    // ========== AUTH HANDLERS ==========
    
    function handleLogin() {
        console.log('handleLogin called');
        
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;
        var loginBtn = document.getElementById('loginBtn');
        
        clearAllErrors();
        
        var hasError = false;
        
        if (!email) {
            showFieldError('email', 'Email wajib diisi');
            hasError = true;
        } else if (!validateEmail(email)) {
            showFieldError('email', 'Format email tidak valid');
            hasError = true;
        }
        
        if (!password) {
            showFieldError('password', 'Password wajib diisi');
            hasError = true;
        }
        
        if (hasError) return;
        
        setLoading(loginBtn, true);
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function(result) {
                var user = result.user;
                console.log('Login success:', user.email);
                
                if (!user.emailVerified) {
                    setLoading(loginBtn, false);
                    pendingUser = user;
                    showVerifyModal(email);
                    return Promise.reject({ code: 'email-not-verified', handled: true });
                }
                
                return updateUserStatus(user, 'online')
                    .then(function() { return user.getIdToken(); })
                    .then(function(token) { return createSession(token, user); });
            })
            .then(function() {
                showToast('Login berhasil!', 'success');
                setTimeout(function() {
                    window.location.href = BASE_URL + '/chat';
                }, 1000);
            })
            .catch(function(error) {
                setLoading(loginBtn, false);
                if (!error.handled) {
                    console.error('Login error:', error);
                    showToast(getErrorMessage(error.code), 'error');
                }
            });
    }
    
    function handleRegister() {
        console.log('handleRegister called');
        
        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('confirmPassword').value;
        var termsCheckbox = document.getElementById('termsCheckbox');
        var registerBtn = document.getElementById('registerBtn');
        
        clearAllErrors();
        
        var hasError = false;
        
        if (!name) {
            showFieldError('name', 'Nama wajib diisi');
            hasError = true;
        } else if (name.length < 2) {
            showFieldError('name', 'Nama minimal 2 karakter');
            hasError = true;
        }
        
        if (!email) {
            showFieldError('email', 'Email wajib diisi');
            hasError = true;
        } else if (!validateEmail(email)) {
            showFieldError('email', 'Format email tidak valid');
            hasError = true;
        }
        
        if (!password) {
            showFieldError('password', 'Password wajib diisi');
            hasError = true;
        } else if (password.length < 6) {
            showFieldError('password', 'Password minimal 6 karakter');
            hasError = true;
        }
        
        if (!confirmPassword) {
            showFieldError('confirmPassword', 'Konfirmasi password wajib diisi');
            hasError = true;
        } else if (password !== confirmPassword) {
            showFieldError('confirmPassword', 'Password tidak cocok');
            hasError = true;
        }
        
        if (termsCheckbox && !termsCheckbox.checked) {
            showFieldError('terms', 'Anda harus menyetujui syarat & ketentuan');
            hasError = true;
        }
        
        if (hasError) return;
        
        setLoading(registerBtn, true);
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(result) {
                var user = result.user;
                pendingUser = user;
                console.log('User created:', user.uid);
                
                return user.updateProfile({ displayName: name })
                    .then(function() {
                        return firebase.firestore().collection('users').doc(user.uid).set({
                            uid: user.uid,
                            name: name,
                            email: email,
                            photoURL: null,
                            status: 'offline',
                            emailVerified: false,
                            about: 'Hey there! I am using Sendly',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    })
                    .then(function() {
                        return user.sendEmailVerification();
                    });
            })
            .then(function() {
                setLoading(registerBtn, false);
                showToast('Registrasi berhasil! Cek email untuk verifikasi.', 'success');
                showVerifyModal(email);
            })
            .catch(function(error) {
                setLoading(registerBtn, false);
                console.error('Register error:', error);
                showToast(getErrorMessage(error.code), 'error');
            });
    }
    
    function handleGoogleLogin() {
        console.log('handleGoogleLogin called');
        
        if (typeof firebase === 'undefined' || !firebase.auth) {
            showToast('Firebase belum siap, refresh halaman', 'error');
            return;
        }
        
        var googleBtn = document.getElementById('googleLoginBtn');
        var originalHTML = googleBtn ? googleBtn.innerHTML : '';
        
        // Function to reset button state
        function resetButton() {
            if (googleBtn) {
                googleBtn.disabled = false;
                googleBtn.innerHTML = originalHTML;
                console.log('Button reset to normal state');
            }
        }
        
        if (googleBtn) {
            googleBtn.disabled = true;
            googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Memproses...</span>';
        }
        
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        firebase.auth().signInWithPopup(provider)
            .then(function(result) {
                var user = result.user;
                var isNewUser = result.additionalUserInfo && result.additionalUserInfo.isNewUser;
                console.log('Google login success:', user.email, 'isNew:', isNewUser);
                
                return firebase.firestore().collection('users').doc(user.uid).get()
                    .then(function(doc) {
                        if (!doc.exists || isNewUser) {
                            return firebase.firestore().collection('users').doc(user.uid).set({
                                uid: user.uid,
                                name: user.displayName || 'User',
                                email: user.email,
                                photoURL: user.photoURL,
                                status: 'online',
                                emailVerified: true,
                                about: 'Hey there! I am using Sendly',
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        } else {
                            return updateUserStatus(user, 'online');
                        }
                    })
                    .then(function() { return user.getIdToken(); })
                    .then(function(token) { return createSession(token, user); });
            })
            .then(function() {
                showToast('Login berhasil!', 'success');
                setTimeout(function() {
                    window.location.href = BASE_URL + '/chat';
                }, 1000);
            })
            .catch(function(error) {
                console.error('Google login error:', error);
                console.log('Error code:', error.code);
                console.log('Error message:', error.message);
                
                if (error.code === 'auth/popup-closed-by-user') {
                    console.log('User closed Google popup');
                    return;
                }
                if (error.code === 'auth/cancelled-popup-request') {
                    console.log('Google popup cancelled');
                    return;
                }
                
                showToast(getErrorMessage(error.code), 'error');
            })
            .finally(function() {
                // Always reset button state regardless of success or failure
                console.log('Finally block: resetting button state');
                resetButton();
            });
    }
    
    function handleForgotPassword() {
        console.log('handleForgotPassword called');
        
        var email = document.getElementById('resetEmail').value.trim();
        var resetBtn = document.getElementById('resetPasswordBtn');
        
        clearFieldError('resetEmail');
        
        if (!email) {
            showFieldError('resetEmail', 'Email wajib diisi');
            return;
        }
        
        if (!validateEmail(email)) {
            showFieldError('resetEmail', 'Format email tidak valid');
            return;
        }
        
        setLoading(resetBtn, true);
        
        firebase.auth().sendPasswordResetEmail(email)
            .then(function() {
                showToast('Link reset password dikirim ke email', 'success');
                closeModal(document.getElementById('forgotPasswordModal'));
                document.getElementById('resetEmail').value = '';
                setLoading(resetBtn, false);
            })
            .catch(function(error) {
                setLoading(resetBtn, false);
                console.error('Forgot password error:', error);
                showToast(getErrorMessage(error.code), 'error');
            });
    }
    
    function handleResendVerification() {
        console.log('handleResendVerification called');
        
        var user = firebase.auth().currentUser || pendingUser;
        var btn = document.getElementById('resendVerificationBtn');
        
        if (!user) {
            showToast('Silakan login ulang', 'error');
            return;
        }
        
        setLoading(btn, true);
        
        user.sendEmailVerification()
            .then(function() {
                setLoading(btn, false);
                showToast('Email verifikasi dikirim ulang!', 'success');
            })
            .catch(function(error) {
                setLoading(btn, false);
                if (error.code === 'auth/too-many-requests') {
                    showToast('Terlalu banyak permintaan, coba lagi nanti', 'error');
                } else {
                    showToast('Gagal mengirim email', 'error');
                }
            });
    }
    
    function handleCheckVerification() {
        console.log('handleCheckVerification called');
        
        var user = firebase.auth().currentUser || pendingUser;
        var btn = document.getElementById('checkVerificationBtn');
        
        if (!user) {
            showToast('Silakan login ulang', 'error');
            return;
        }
        
        setLoading(btn, true);
        
        user.reload()
            .then(function() {
                user = firebase.auth().currentUser;
                setLoading(btn, false);
                
                if (user && user.emailVerified) {
                    return firebase.firestore().collection('users').doc(user.uid).update({
                        emailVerified: true,
                        status: 'online',
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .then(function() { return user.getIdToken(); })
                    .then(function(token) { return createSession(token, user); })
                    .then(function() {
                        showToast('Email terverifikasi!', 'success');
                        setTimeout(function() {
                            window.location.href = BASE_URL + '/chat';
                        }, 1000);
                    });
                } else {
                    showToast('Email belum diverifikasi, cek inbox/spam', 'error');
                }
            })
            .catch(function(error) {
                setLoading(btn, false);
                showToast('Gagal memeriksa status', 'error');
            });
    }
    
    function showVerifyModal(email) {
        var modal = document.getElementById('verifyEmailModal');
        var emailText = document.getElementById('verifyEmailText');
        if (emailText) emailText.textContent = email;
        openModal(modal);
    }
    
    function updateUserStatus(user, status) {
        return firebase.firestore().collection('users').doc(user.uid).update({
            status: status,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    function createSession(idToken, user) {
        console.log('Creating session for:', user.uid);
        
        return fetch(BASE_URL + '/auth/verifyToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
                idToken: idToken,
                uid: user.uid,
                name: user.displayName || 'User',
                email: user.email || '',
                photoURL: user.photoURL || ''
            })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
            console.log('Session response:', data);
            return data;
        })
        .catch(function(error) {
            console.error('Session error:', error);
            return { success: false };
        });
    }
    
})();
