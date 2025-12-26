<!-- Settings Modal -->
<div class="modal hidden" id="settingsModal">
    <div class="modal-content modal-settings">
        <div class="modal-header">
            <h3><i class="fas fa-cog"></i> Pengaturan</h3>
            <button class="icon-btn close-modal" data-modal="settingsModal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="modal-body">
            <div class="settings-section">
                <h4>Akun</h4>
                
                <!-- Change Email -->
                <div class="settings-item" id="changeEmailSection">
                    <div class="settings-item-header">
                        <div class="settings-item-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="settings-item-info">
                            <span class="settings-item-title">Ganti Email</span>
                            <span class="settings-item-desc" id="currentEmailDisplay"><?= htmlspecialchars($user['email'] ?? 'Tidak ada email') ?></span>
                        </div>
                        <button class="btn btn-outline-small" id="changeEmailBtn">
                            <i class="fas fa-edit"></i> Ubah
                        </button>
                    </div>
                    <div class="settings-form hidden" id="changeEmailForm">
                        <div class="form-group">
                            <label for="newEmail">Email Baru</label>
                            <input type="email" id="newEmail" placeholder="Masukkan email baru" required>
                        </div>
                        <div class="form-group">
                            <label for="emailPassword">Password Saat Ini</label>
                            <input type="password" id="emailPassword" placeholder="Konfirmasi password" required>
                        </div>
                        <div class="form-actions-inline">
                            <button type="button" class="btn btn-secondary btn-sm" id="cancelEmailChange">Batal</button>
                            <button type="button" class="btn btn-primary btn-sm" id="saveEmailChange">Simpan</button>
                        </div>
                    </div>
                </div>

                <!-- Change Password -->
                <div class="settings-item" id="changePasswordSection">
                    <div class="settings-item-header">
                        <div class="settings-item-icon">
                            <i class="fas fa-lock"></i>
                        </div>
                        <div class="settings-item-info">
                            <span class="settings-item-title">Ganti Password</span>
                            <span class="settings-item-desc">Ubah password akun Anda</span>
                        </div>
                        <button class="btn btn-outline-small" id="changePasswordBtn">
                            <i class="fas fa-edit"></i> Ubah
                        </button>
                    </div>
                    <div class="settings-form hidden" id="changePasswordForm">
                        <div class="form-group">
                            <label for="currentPassword">Password Saat Ini</label>
                            <input type="password" id="currentPassword" placeholder="Password saat ini" required>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">Password Baru</label>
                            <input type="password" id="newPassword" placeholder="Password baru (min 6 karakter)" required minlength="6">
                        </div>
                        <div class="form-group">
                            <label for="confirmNewPassword">Konfirmasi Password Baru</label>
                            <input type="password" id="confirmNewPassword" placeholder="Ulangi password baru" required>
                        </div>
                        <div class="form-actions-inline">
                            <button type="button" class="btn btn-secondary btn-sm" id="cancelPasswordChange">Batal</button>
                            <button type="button" class="btn btn-primary btn-sm" id="savePasswordChange">Simpan</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
