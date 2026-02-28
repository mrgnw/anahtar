// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const su: AuthMessages = {
	emailPlaceholder: 'anjeun@conto.com',
	continue: 'Teruskeun',

	codeSentTo: 'Urang geus ngirim kode ka',
	verifying: 'Nuju mariksa...',
	resend: 'Teu katampi? Kirim deui',
	differentEmail: 'Paké email séjén',

	passkeyCreating: 'Nuju nyieun passkey pikeun anjeun',
	passkeySubtitle: 'sangkan leuwih gampang asup',
	passkeySkip: 'Liwat',
	passkeySetup: 'Setel passkey?',
	passkeyAdd: 'Tambahkeun passkey',
	passkeyMaybeLater: 'Engké waé',
	passkeySuccess: 'Anjeun geus boga passkey!',

	errorInvalidEmail: 'Mangga lebetkeun alamat email anu leres.',
	errorGeneric: 'Aya anu lepat. Mangga cobi deui.',
	errorResendFailed: 'Gagal ngirim deui kode.',
	errorInvalidCode: 'Kode teu leres. Mangga cobi deui.',
	errorCodeExpired: 'Kode geus kadaluwarsa. Mangga ménta kode anyar.',
	errorTooManyAttempts: 'Geus seueur percobaan. Mangga ménta kode anyar.',
	errorInvalidInput: 'Input teu valid',
	errorNotAuthenticated: 'Teu terauthentikasi',
	errorNotFound: 'Teu kapendak',
	errorAuthFailed: 'Authentikasi gagal',
	errorPasskeyRegFailed: 'Pendaptaran passkey gagal',
	errorPasskeyNotFound: 'Passkey teu kapendak',
};

export default su;
