// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const fil: AuthMessages = {
	emailPlaceholder: 'ikaw@halimbawa.ph',
	continue: 'Magpatuloy',

	codeSentTo: 'Nagpadala kami ng code sa',
	verifying: 'Vine-verify...',
	resend: 'Hindi natanggap? Ipadala ulit',
	differentEmail: 'Gumamit ng ibang email',

	passkeyCreating: 'Gumagawa ng passkey para sa iyo',
	passkeySubtitle: 'para sa mas mabilis, madali, at ligtas na pag-login',
	passkeyAdd: 'Magdagdag ng passkey ngayon',
	passkeyMaybeLater: 'Mamaya na lang',
	passkeySuccess: 'Mayroon ka nang passkey!',

	errorInvalidEmail: 'Maglagay ng wastong email address.',
	errorGeneric: 'May nangyaring mali. Subukan ulit.',
	errorResendFailed: 'Hindi naipadala ulit ang code.',
	errorInvalidCode: 'Mali ang code. Subukan ulit.',
	errorCodeExpired: 'Nag-expire na ang code. Humiling ng bago.',
	errorTooManyAttempts: 'Masyadong maraming pagsubok. Humiling ng bagong code.',
	errorInvalidInput: 'Hindi wastong input',
	errorNotAuthenticated: 'Hindi naka-authenticate',
	errorNotFound: 'Hindi nahanap',
	errorAuthFailed: 'Nabigo ang authentication',
	errorPasskeyRegFailed: 'Nabigo ang passkey registration',
	errorPasskeyNotFound: 'Hindi nahanap ang passkey',
};

export default fil;
