// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ro: AuthMessages = {
	emailPlaceholder: 'tu@exemplu.com',
	continue: 'Continuă',

	codeSentTo: 'Am trimis un cod la',
	verifying: 'Se verifică...',
	resend: 'Nu l-ai primit? Retrimite',
	differentEmail: 'Folosește alt email',

	passkeyCreating: 'Se creează un passkey',
	passkeySubtitle: 'pentru autentificare mai ușoară',
	passkeySkip: 'Omite',
	passkeySetup: 'Configurezi un passkey?',
	passkeyAdd: 'Adaugă passkey',
	passkeyMaybeLater: 'Poate mai târziu',
	passkeySuccess: 'Ai un passkey!',

	errorInvalidEmail: 'Te rugăm să introduci o adresă de email validă.',
	errorGeneric: 'Ceva nu a mers bine. Te rugăm să încerci din nou.',
	errorResendFailed: 'Retrimiterea codului a eșuat.',
	errorInvalidCode: 'Cod invalid. Te rugăm să încerci din nou.',
	errorCodeExpired: 'Codul a expirat. Te rugăm să soliciți unul nou.',
	errorTooManyAttempts: 'Prea multe încercări. Te rugăm să soliciți un cod nou.',
	errorInvalidInput: 'Date de intrare invalide',
	errorNotAuthenticated: 'Neautentificat',
	errorNotFound: 'Negăsit',
	errorAuthFailed: 'Autentificarea a eșuat',
	errorPasskeyRegFailed: 'Înregistrarea passkey a eșuat',
	errorPasskeyNotFound: 'Passkey negăsit',
};

export default ro;
