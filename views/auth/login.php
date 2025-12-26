<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sendly - Login</title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/css/auth.css?v=<?= time() ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <div class="bg-effects">
            <div class="bg-circle circle-1"></div>
            <div class="bg-circle circle-2"></div>
            <div class="bg-circle circle-3"></div>
        </div>

        <div class="auth-card">
            <div class="auth-header">
                <div class="logo">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <h1>Sendly</h1>
                <p>Masuk ke akun</p>
            </div>

            <form id="loginForm" class="auth-form" novalidate>
                <div class="form-group">
                    <label for="email">
                        <i class="fas fa-envelope"></i>
                        Email
                    </label>
                    <input type="email" id="email" name="email" required placeholder="Masukkan email Anda" autocomplete="email">
                    <span class="error-message" id="emailError"></span>
                </div>

                <div class="form-group">
                    <label for="password">
                        <i class="fas fa-lock"></i>
                        Password
                    </label>
                    <div class="password-input">
                        <input type="password" id="password" name="password" required placeholder="Masukkan password" autocomplete="current-password">
                        <button type="button" class="toggle-password" id="togglePasswordBtn">
                            <i class="fas fa-eye" id="togglePasswordIcon"></i>
                        </button>
                    </div>
                    <span class="error-message" id="passwordError"></span>
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" name="remember" id="rememberMe">
                        <span class="checkmark"></span>
                        Ingat saya
                    </label>
                    <button type="button" class="forgot-link" id="forgotPasswordBtn">Lupa password?</button>
                </div>

                <button type="submit" class="btn-primary" id="loginBtn">
                    <span class="btn-text">Masuk</span>
                    <div class="spinner btn-spinner"></div>
                </button>

                <div class="divider">
                    <span>atau</span>
                </div>

                <button type="button" class="btn-google" id="googleLoginBtn">
                    <i class="fab fa-google"></i>
                    <span>Masuk dengan Google</span>
                </button>
            </form>

            <div class="auth-footer">
                <p>Belum punya akun? <a href="#" class="link-btn" id="goToRegisterBtn">Daftar sekarang</a></p>
            </div>
        </div>

        <div id="toastContainer" class="toast-container"></div>
    </div>

    <div class="modal-overlay" id="forgotPasswordModal">
        <div class="modal-box">
            <div class="modal-header">
                <h3>Reset Password</h3>
                <button type="button" class="modal-close" id="closeForgotModalBtn">&times;</button>
            </div>
            <div class="modal-body">
                <p>Masukkan email Anda dan kami akan mengirimkan link untuk reset password.</p>
                <form id="forgotPasswordForm" novalidate>
                    <div class="form-group">
                        <input type="email" id="resetEmail" placeholder="Masukkan email Anda" required autocomplete="email">
                        <span class="error-message" id="resetEmailError"></span>
                    </div>
                    <button type="submit" class="btn-primary" id="resetPasswordBtn">
                        <span class="btn-text">Kirim Link Reset</span>
                        <div class="spinner btn-spinner"></div>
                    </button>
                </form>
            </div>
        </div>
    </div>

    <div class="modal-overlay" id="verifyEmailModal">
        <div class="modal-box">
            <div class="modal-header">
                <h3><i class="fas fa-envelope-open-text"></i> Verifikasi Email</h3>
                <button type="button" class="modal-close" id="closeVerifyModalBtn">&times;</button>
            </div>
            <div class="modal-body" style="text-align: center; padding: 30px 20px;">
                <div style="font-size: 60px; color: var(--primary-color); margin-bottom: 20px;">
                    <i class="fas fa-envelope-circle-check"></i>
                </div>
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">Email Belum Diverifikasi</h4>
                <p style="color: var(--text-secondary); margin-bottom: 10px;">Akun dengan email:</p>
                <p style="font-weight: 600; color: var(--primary-color); margin-bottom: 20px;" id="verifyEmailText">email@example.com</p>
                <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 25px;">
                    Silakan cek inbox email Anda dan klik link verifikasi untuk mengaktifkan akun.
                    Jangan lupa cek folder spam jika tidak menemukan emailnya.
                </p>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button type="button" class="btn-primary" id="checkVerificationBtn">
                        <span class="btn-text"><i class="fas fa-check-circle"></i> Saya Sudah Verifikasi</span>
                        <div class="spinner btn-spinner"></div>
                    </button>
                    <button type="button" class="btn-outline" id="resendVerificationBtn">
                        <span class="btn-text"><i class="fas fa-redo"></i> Kirim Ulang Email</span>
                        <div class="spinner btn-spinner"></div>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script>var BASE_URL = "<?= BASE_URL ?>";</script>
    <script src="<?= BASE_URL ?>/public/firebase-config.js"></script>
    <script src="<?= BASE_URL ?>/public/assets/js/auth.js"></script>
</body>
</html>
