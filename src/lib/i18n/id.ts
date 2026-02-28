// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const id: AuthMessages = {
	emailPlaceholder: 'anda@contoh.com',
	continue: 'Lanjutkan',

	codeSentTo: 'Kami mengirim kode ke',
	verifying: 'Memverifikasi...',
	resend: 'Belum dapat? Kirim ulang',
	differentEmail: 'Gunakan email lain',

	passkeyCreating: 'Membuat passkey untuk Anda',
	passkeySubtitle: 'agar login lebih mudah',
	passkeySkip: 'Lewati',
	passkeySetup: 'Buat passkey?',
	passkeyAdd: 'Tambah passkey',
	passkeyMaybeLater: 'Nanti saja',
	passkeySuccess: 'Passkey Anda siap!',

	errorInvalidEmail: 'Masukkan alamat email yang valid.',
	errorGeneric: 'Terjadi kesalahan. Silakan coba lagi.',
	errorResendFailed: 'Gagal mengirim ulang kode.',
	errorInvalidCode: 'Kode salah. Silakan coba lagi.',
	errorCodeExpired: 'Kode kedaluwarsa. Silakan minta kode baru.',
	errorTooManyAttempts: 'Terlalu banyak percobaan. Silakan minta kode baru.',
	errorInvalidInput: 'Input tidak valid',
	errorNotAuthenticated: 'Belum terautentikasi',
	errorNotFound: 'Tidak ditemukan',
	errorAuthFailed: 'Autentikasi gagal',
	errorPasskeyRegFailed: 'Pendaftaran passkey gagal',
	errorPasskeyNotFound: 'Passkey tidak ditemukan',
};

export default id;
