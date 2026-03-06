// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const rw: AuthMessages = {
	emailPlaceholder: 'wewe@urugero.rw',
	continue: 'Komeza',

	codeSentTo: 'Twakwohereje kode kuri',
	verifying: 'Biragenzurwa...',
	resend: 'Ntiwayibonye? Ongera wohereze',
	differentEmail: 'Koresha imeyili itandukanye',

	passkeyCreating: 'Tugukoresha passkey',
	passkeySubtitle: 'kugira kwinjira byihuse, byoroshye, byizewe',
	passkeyAdd: 'Ongeramo passkey ubu',
	passkeyMaybeLater: 'Birashoboka nyuma',
	passkeySuccess: 'Ufite passkey!',

	errorInvalidEmail: "Nyamuneka andika aderesi y'imeyili yemewe.",
	errorGeneric: 'Hari ikintu kitagenze neza. Nyamuneka ongera ugerageze.',
	errorResendFailed: 'Kohereza kode byanze.',
	errorInvalidCode: 'Kode itemewe. Nyamuneka ongera ugerageze.',
	errorCodeExpired: 'Kode yarangiye. Nyamuneka saba indi nshya.',
	errorTooManyAttempts: 'Ugerageje kenshi cyane. Nyamuneka saba kode nshya.',
	errorInvalidInput: 'Ibyinjijwe ntibemewe',
	errorNotAuthenticated: 'Ntimwemejwe',
	errorNotFound: 'Ntibibonetse',
	errorAuthFailed: 'Kwemeza byanze',
	errorPasskeyRegFailed: 'Kwandikisha passkey byanze',
	errorPasskeyNotFound: 'Passkey ntiyabonetse',
};

export default rw;
