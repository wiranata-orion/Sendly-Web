<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sendly - Daftar</title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/public/assets/css/auth.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="auth-container">
        <!-- Background Effects -->
        <div class="bg-effects">
            <div class="bg-circle circle-1"></div>
            <div class="bg-circle circle-2"></div>
            <div class="bg-circle circle-3"></div>
        </div>

        <!-- Auth Card -->
        <div class="auth-card">
            <!-- Logo & Brand -->
            <div class="auth-header">
                <div class="logo">
                    <i class="fas fa-paper-plane"></i>
                </div>
                <h1>Sendly</h1>
                <p>Buat akun baru</p>
            </div>

            <!-- Register Form -->
            <form id="registerForm" class="auth-form" novalidate>
                <div class="form-group">
                    <label for="name">
                        <i class="fas fa-user"></i>
                        Nama Lengkap
                    </label>
                    <input type="text" id="name" name="name" required placeholder="Masukkan nama lengkap" autocomplete="name" minlength="2" maxlength="50">
                    <span class="error-message" id="nameError"></span>
                </div>

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
                        <input type="password" id="password" name="password" required placeholder="Minimal 6 karakter" minlength="6" autocomplete="new-password">
                        <button type="button" class="toggle-password" id="togglePasswordBtn">
                            <i class="fas fa-eye" id="togglePasswordIcon"></i>
                        </button>
                    </div>
                    <span class="error-message" id="passwordError"></span>
                    <div class="password-strength" id="passwordStrength">
                        <div class="strength-bar"><div class="strength-fill" id="strengthFill"></div></div>
                        <span class="strength-text" id="strengthText"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">
                        <i class="fas fa-lock"></i>
                        Konfirmasi Password
                    </label>
                    <div class="password-input">
                        <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Ulangi password" autocomplete="new-password">
                        <button type="button" class="toggle-password" id="toggleConfirmPasswordBtn">
                            <i class="fas fa-eye" id="toggleConfirmPasswordIcon"></i>
                        </button>
                    </div>
                    <span class="error-message" id="confirmPasswordError"></span>
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" name="terms" id="termsCheckbox" required>
                        <span class="checkmark"></span>
                        Saya setuju dengan <button type="button" class="terms-link" id="termsBtn">Syarat & Ketentuan</button>
                    </label>
                    <span class="error-message" id="termsError"></span>
                </div>

                <button type="submit" class="btn-primary" id="registerBtn">
                    <span class="btn-text">Daftar</span>
                    <div class="spinner btn-spinner"></div>
                </button>

                <div class="divider">
                    <span>atau</span>
                </div>

                <button type="button" class="btn-google" id="googleLoginBtn">
                    <i class="fab fa-google"></i>
                    <span>Daftar dengan Google</span>
                </button>
            </form>

            <!-- Footer -->
            <div class="auth-footer">
                <p>Sudah punya akun? <button type="button" class="link-btn" id="goToLoginBtn">Masuk</button></p>
            </div>
        </div>

        <!-- Toast Container -->
        <div id="toastContainer" class="toast-container"></div>
    </div>

    <!-- Terms Modal -->
    <div class="modal-overlay" id="termsModal">
        <div class="modal-box modal-large">
            <div class="modal-header">
                <h3>Syarat & Ketentuan</h3>
                <button type="button" class="modal-close" id="closeTermsModalBtn">&times;</button>
            </div>
            <div class="modal-body modal-scroll">
                <h4>1. Ketentuan Umum</h4>
                <p>Dengan menggunakan Sendly, Anda menyetujui untuk mematuhi syarat dan ketentuan berikut.</p>
                
                <h4>2. Akun Pengguna</h4>
                <p>Anda bertanggung jawab untuk menjaga kerahasiaan akun Anda dan semua aktivitas yang terjadi di akun Anda.</p>
                
                <h4>3. Privasi</h4>
                <p>Kami menghargai privasi Anda. Informasi yang Anda berikan akan dilindungi sesuai dengan kebijakan privasi kami.</p>
                
                <h4>4. Penggunaan yang Dilarang</h4>
                <p>Anda tidak boleh menggunakan layanan ini untuk tujuan ilegal atau menyebarkan konten yang melanggar hukum.</p>
                
                <h4>5. Perubahan Ketentuan</h4>
                <p>Kami berhak mengubah ketentuan ini kapan saja. Perubahan akan berlaku setelah dipublikasikan.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-primary" id="acceptTermsBtn">Saya Mengerti</button>
            </div>
        </div>
    </div>

    <!-- Email Verification Modal -->
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
                <h4 style="margin-bottom: 15px; color: var(--text-primary);">Email Verifikasi Terkirim!</h4>
                <p style="color: var(--text-secondary); margin-bottom: 10px;">Kami telah mengirimkan link verifikasi ke:</p>
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

    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
    <script src="<?= BASE_URL ?>/public/firebase-config.js"></script>
    <script>BASE_URL = "<?= BASE_URL ?>";</script>
    <script src="<?= BASE_URL ?>/public/assets/js/auth.js"></script>
</body>
</html>
