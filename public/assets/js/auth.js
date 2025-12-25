/**
 * Sendly Authentication - Clean Version
 */
console.log('=== AUTH.JS LOADED ===');

// Wait for everything to load
window.onload = function() {
    console.log('Window loaded, initializing auth...');
    console.log('BASE_URL:', typeof BASE_URL !== 'undefined' ? BASE_URL : 'NOT DEFINED');
    
    initAuth();
};

function initAuth() {
    // ============ NAVIGATION ============
    
    // Button: Go to Register
    var goToRegisterBtn = document.getElementById('goToRegisterBtn');
    if (goToRegisterBtn) {
        console.log('Found goToRegisterBtn');
        goToRegisterBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Clicked: Go to Register');
            window.location.href = BASE_URL + '/register';
            return false;
        };
    }

    // Button: Go to Login
    var goToLoginBtn = document.getElementById('goToLoginBtn');
    if (goToLoginBtn) {
        console.log('Found goToLoginBtn');
        goToLoginBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Clicked: Go to Login');
            window.location.href = BASE_URL + '/login';
            return false;
        };
    }

    // ============ PASSWORD TOGGLE ============

    var togglePasswordBtn = document.getElementById('togglePasswordBtn');
    if (togglePasswordBtn) {
        togglePasswordBtn.onclick = function(e) {
            e.preventDefault();
            var pw = document.getElementById('password');
            var icon = document.getElementById('togglePasswordIcon');
            if (pw.type === 'password') {
                pw.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                pw.type = 'password';
                icon.className = 'fas fa-eye';
            }
        };
    }

    var toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPasswordBtn');
    if (toggleConfirmPasswordBtn) {
        toggleConfirmPasswordBtn.onclick = function(e) {
            e.preventDefault();
            var pw = document.getElementById('confirmPassword');
            var icon = document.getElementById('toggleConfirmPasswordIcon');
            if (pw.type === 'password') {
                pw.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                pw.type = 'password';
                icon.className = 'fas fa-eye';
            }
        };
    }

    // ============ MODALS ============

    // Forgot Password Modal
    var forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    var forgotPasswordModal = document.getElementById('forgotPasswordModal');
    var closeForgotModalBtn = document.getElementById('closeForgotModalBtn');

    if (forgotPasswordBtn) {
        forgotPasswordBtn.onclick = function(e) {
            e.preventDefault();
            forgotPasswordModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeForgotModalBtn) {
        closeForgotModalBtn.onclick = function() {
            forgotPasswordModal.classList.remove('show');
            document.body.style.overflow = '';
        };
    }

    if (forgotPasswordModal) {
        forgotPasswordModal.onclick = function(e) {
            if (e.target === forgotPasswordModal) {
                forgotPasswordModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        };
    }

    // Terms Modal
    var termsBtn = document.getElementById('termsBtn');
    var termsModal = document.getElementById('termsModal');
    var closeTermsModalBtn = document.getElementById('closeTermsModalBtn');
    var acceptTermsBtn = document.getElementById('acceptTermsBtn');

    if (termsBtn) {
        termsBtn.onclick = function(e) {
            e.preventDefault();
            termsModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        };
    }

    if (closeTermsModalBtn) {
        closeTermsModalBtn.onclick = function() {
            termsModal.classList.remove('show');
            document.body.style.overflow = '';
        };
    }

    if (acceptTermsBtn) {
        acceptTermsBtn.onclick = function() {
            var checkbox = document.getElementById('termsCheckbox');
            if (checkbox) checkbox.checked = true;
            termsModal.classList.remove('show');
            document.body.style.overflow = '';
        };
    }

    // Verify Email Modal
    var verifyEmailModal = document.getElementById('verifyEmailModal');
    var closeVerifyModalBtn = document.getElementById('closeVerifyModalBtn');
    var resendVerificationBtn = document.getElementById('resendVerificationBtn');
    var checkVerificationBtn = document.getElementById('checkVerificationBtn');

    if (closeVerifyModalBtn) {
        closeVerifyModalBtn.onclick = function() {
            verifyEmailModal.classList.remove('show');
            document.body.style.overflow = '';
        };
    }

    if (resendVerificationBtn) {
        resendVerificationBtn.onclick = function() {
            resendVerification();
        };
    }

    if (checkVerificationBtn) {
        checkVerificationBtn.onclick = function() {
            checkVerification();
        };
    }

    // ============ PASSWORD STRENGTH ============

    var passwordInput = document.getElementById('password');
    var strengthFill = document.getElementById('strengthFill');
    var strengthText = document.getElementById('strengthText');

    if (passwordInput && strengthFill && strengthText) {
        passwordInput.oninput = function() {
            var pw = this.value;
            var score = 0;

            if (pw.length === 0) {
                strengthFill.className = 'strength-fill';
                strengthText.className = 'strength-text';
                strengthText.textContent = '';
                return;
            }

            if (pw.length >= 8) score++;
            if (/[a-z]/.test(pw)) score++;
            if (/[A-Z]/.test(pw)) score++;
            if (/[0-9]/.test(pw)) score++;
            if (/[^a-zA-Z0-9]/.test(pw)) score++;

            strengthFill.className = 'strength-fill';
            strengthText.className = 'strength-text';

            if (score <= 2) {
                strengthFill.classList.add('weak');
                strengthText.classList.add('weak');
                strengthText.textContent = 'Lemah';
            } else if (score <= 3) {
                strengthFill.classList.add('medium');
                strengthText.classList.add('medium');
                strengthText.textContent = 'Sedang';
            } else {
                strengthFill.classList.add('strong');
                strengthText.classList.add('strong');
                strengthText.textContent = 'Kuat';
            }
        };
    }

    // ============ FORM SUBMISSIONS ============

    // Login Form
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Found loginForm, attaching submit handler');
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Login form submitted');
            doLogin();
            return false;
        };
    }

    // Register Form
    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('Found registerForm, attaching submit handler');
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Register form submitted');
            doRegister();
            return false;
        };
    }

    // Forgot Password Form
    var forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.onsubmit = function(e) {
            e.preventDefault();
            e.stopPropagation();
            doForgotPassword();
            return false;
        };
    }

    // ============ GOOGLE LOGIN ============

    var googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        console.log('Found googleLoginBtn');
        googleLoginBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Clicked: Google Login');
            doGoogleLogin();
        };
    }

    // ============ ESC KEY ============

    document.onkeydown = function(e) {
        if (e.key === 'Escape') {
            if (forgotPasswordModal) {
                forgotPasswordModal.classList.remove('show');
            }
            if (termsModal) {
                termsModal.classList.remove('show');
            }
            if (verifyEmailModal) {
                verifyEmailModal.classList.remove('show');
            }
            document.body.style.overflow = '';
        }
    };

    console.log('Auth initialization complete');
}

// ============ TOAST ============

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
        setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
}

// ============ LOADING STATE ============

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

// ============ LOGIN ============

function doLogin() {
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var loginBtn = document.getElementById('loginBtn');

    console.log('doLogin called with email:', email);

    if (!email) {
        showToast('Email wajib diisi', 'error');
        return;
    }

    if (!password) {
        showToast('Password wajib diisi', 'error');
        return;
    }

    if (typeof firebase === 'undefined') {
        showToast('Firebase belum siap, coba lagi', 'error');
        return;
    }

    setLoading(loginBtn, true);

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(result) {
            var user = result.user;
            console.log('Login success:', user.email);

            if (!user.emailVerified) {
                setLoading(loginBtn, false);
                showToast('Email belum diverifikasi', 'error');
                showVerifyModal(email);
                return Promise.reject({ code: 'email-not-verified', handled: true });
            }

            // Update status in Firestore
            return firebase.firestore().collection('users').doc(user.uid).update({
                status: 'online',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(function() {
                return user.getIdToken().then(function(idToken) {
                    return createSession(idToken, user);
                });
            });
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

// ============ REGISTER ============

var pendingUser = null;

function doRegister() {
    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var termsCheckbox = document.getElementById('termsCheckbox');
    var registerBtn = document.getElementById('registerBtn');

    console.log('doRegister called with name:', name, 'email:', email);

    if (!name) {
        showToast('Nama wajib diisi', 'error');
        return;
    }

    if (!email) {
        showToast('Email wajib diisi', 'error');
        return;
    }

    if (!password) {
        showToast('Password wajib diisi', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Password tidak cocok', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password minimal 6 karakter', 'error');
        return;
    }

    if (termsCheckbox && !termsCheckbox.checked) {
        showToast('Setujui syarat & ketentuan', 'error');
        return;
    }

    if (typeof firebase === 'undefined') {
        showToast('Firebase belum siap, coba lagi', 'error');
        return;
    }

    setLoading(registerBtn, true);

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(result) {
            var user = result.user;
            pendingUser = user;
            console.log('User created:', user.uid);

            return user.updateProfile({ displayName: name })
                .then(function() {
                    // Save to Firestore
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

// ============ FORGOT PASSWORD ============

function doForgotPassword() {
    var email = document.getElementById('resetEmail').value.trim();
    var resetBtn = document.getElementById('resetPasswordBtn');

    if (!email) {
        showToast('Email wajib diisi', 'error');
        return;
    }

    if (typeof firebase === 'undefined') {
        showToast('Firebase belum siap, coba lagi', 'error');
        return;
    }

    setLoading(resetBtn, true);

    firebase.auth().sendPasswordResetEmail(email)
        .then(function() {
            showToast('Link reset password dikirim ke email', 'success');
            var modal = document.getElementById('forgotPasswordModal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
            document.getElementById('resetEmail').value = '';
            setLoading(resetBtn, false);
        })
        .catch(function(error) {
            setLoading(resetBtn, false);
            console.error('Forgot password error:', error);
            showToast(getErrorMessage(error.code), 'error');
        });
}

// ============ GOOGLE LOGIN ============

function doGoogleLogin() {
    console.log('doGoogleLogin called');

    if (typeof firebase === 'undefined') {
        showToast('Firebase belum siap, coba lagi', 'error');
        return;
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
                        return firebase.firestore().collection('users').doc(user.uid).update({
                            status: 'online',
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                })
                .then(function() {
                    return user.getIdToken();
                })
                .then(function(idToken) {
                    return createSession(idToken, user);
                });
        })
        .then(function() {
            showToast('Login berhasil!', 'success');
            setTimeout(function() {
                window.location.href = BASE_URL + '/chat';
            }, 1000);
        })
        .catch(function(error) {
            console.error('Google login error:', error);
            if (error.code === 'auth/popup-closed-by-user') return;
            if (error.code === 'auth/cancelled-popup-request') return;
            showToast(getErrorMessage(error.code), 'error');
        });
}

// ============ VERIFICATION ============

function showVerifyModal(email) {
    var modal = document.getElementById('verifyEmailModal');
    if (modal) {
        var emailText = document.getElementById('verifyEmailText');
        if (emailText) emailText.textContent = email;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function resendVerification() {
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

function checkVerification() {
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
                firebase.firestore().collection('users').doc(user.uid).update({
                    emailVerified: true,
                    status: 'online',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(function() {
                    return user.getIdToken();
                })
                .then(function(idToken) {
                    return createSession(idToken, user);
                })
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
        .catch(function() {
            setLoading(btn, false);
            showToast('Gagal memeriksa status', 'error');
        });
}

// ============ SESSION ============

function createSession(idToken, user) {
    console.log('Creating session for user:', user.uid);
    
    const payload = {
        idToken: idToken,
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        photoURL: user.photoURL || ''
    };
    
    console.log('Session payload:', payload);
    
    return fetch(BASE_URL + '/auth/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // Important for session cookies
        body: JSON.stringify(payload)
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log('Session response:', data);
        if (!data.success) {
            console.error('Session creation failed:', data.message);
        }
        return data;
    })
    .catch(function(error) {
        console.error('Session error:', error);
        return { success: false, error: error.message };
    });
}

// ============ ERROR MESSAGES ============

function getErrorMessage(code) {
    var messages = {
        'auth/user-not-found': 'Akun tidak terdaftar',
        'auth/wrong-password': 'Password salah',
        'auth/invalid-email': 'Format email tidak valid',
        'auth/email-already-in-use': 'Email sudah digunakan',
        'auth/weak-password': 'Password terlalu lemah',
        'auth/network-request-failed': 'Koneksi internet bermasalah',
        'auth/too-many-requests': 'Terlalu banyak percobaan',
        'auth/invalid-credential': 'Akun tidak terdaftar',
        'auth/invalid-login-credentials': 'Akun tidak terdaftar',
        'auth/user-disabled': 'Akun dinonaktifkan',
        'auth/popup-blocked': 'Popup diblokir browser',
        'auth/account-exists-with-different-credential': 'Akun sudah ada dengan metode login lain'
    };
    return messages[code] || 'Terjadi kesalahan: ' + code;
}
