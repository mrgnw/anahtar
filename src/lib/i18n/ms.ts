// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ms: AuthMessages = {
	emailPlaceholder: 'anda@contoh.com.my',
	continue: 'Teruskan',

	codeSentTo: 'Kami telah menghantar kod ke',
	verifying: 'Mengesahkan...',
	resend: 'Tidak terima? Hantar semula',
	differentEmail: 'Guna e-mel lain',

	passkeyCreating: 'Mencipta passkey anda',
	passkeySubtitle: 'untuk log masuk lebih mudah',
	passkeySkip: 'Langkau',
	passkeySetup: 'Sediakan passkey?',
	passkeyAdd: 'Tambah passkey',
	passkeyMaybeLater: 'Mungkin nanti',
	passkeySuccess: 'Passkey anda sudah sedia!',

	errorInvalidEmail: 'Sila masukkan alamat e-mel yang sah.',
	errorGeneric: 'Sesuatu tidak kena. Sila cuba lagi.',
	errorResendFailed: 'Gagal menghantar semula kod.',
	errorInvalidCode: 'Kod tidak sah. Sila cuba lagi.',
	errorCodeExpired: 'Kod telah tamat tempoh. Sila minta kod baharu.',
	errorTooManyAttempts: 'Terlalu banyak percubaan. Sila minta kod baharu.',
	errorInvalidInput: 'Input tidak sah',
	errorNotAuthenticated: 'Tidak disahkan',
	errorNotFound: 'Tidak ditemui',
	errorAuthFailed: 'Pengesahan gagal',
	errorPasskeyRegFailed: 'Pendaftaran passkey gagal',
	errorPasskeyNotFound: 'Passkey tidak ditemui',
};

export default ms;
