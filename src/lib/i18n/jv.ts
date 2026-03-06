// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const jv: AuthMessages = {
	emailPlaceholder: 'kowe@conto.co.id',
	continue: 'Lanjutna',

	codeSentTo: 'Kode wis dikirim menyang',
	verifying: 'Lagi diverifikasi...',
	resend: 'Durung nampa? Kirim maneh',
	differentEmail: 'Nganggo email liya',

	passkeyCreating: 'Nggawekna passkey kanggo sampeyan',
	passkeySubtitle: 'kanggo login luwih cepet, gampang, lan aman',
	passkeyAdd: 'Tambah passkey saiki',
	passkeyMaybeLater: 'Mengko wae',
	passkeySuccess: 'Passkey sampeyan wis siyap!',

	errorInvalidEmail: 'Lebokna alamat email sing bener.',
	errorGeneric: 'Ana sing salah. Coba maneh.',
	errorResendFailed: 'Gagal ngirim ulang kode.',
	errorInvalidCode: 'Kode salah. Coba maneh.',
	errorCodeExpired: 'Kode wis kadaluwarsa. Njaluk kode anyar.',
	errorTooManyAttempts: 'Kakehan nyoba. Njaluk kode anyar.',
	errorInvalidInput: 'Input ora valid',
	errorNotAuthenticated: 'Durung diotentikasi',
	errorNotFound: 'Ora ditemokake',
	errorAuthFailed: 'Otentikasi gagal',
	errorPasskeyRegFailed: 'Registrasi passkey gagal',
	errorPasskeyNotFound: 'Passkey ora ditemokake',
};

export default jv;
