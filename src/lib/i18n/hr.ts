// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const hr: AuthMessages = {
	emailPlaceholder: 'vi@primjer.hr',
	continue: 'Nastavi',

	codeSentTo: 'Poslali smo kod na',
	verifying: 'Provjerava se...',
	resend: 'Niste dobili? Posalji ponovo',
	differentEmail: 'Koristi drugi e-mail',

	passkeyCreating: 'Stvaramo vam passkey',
	passkeySubtitle: 'za laksu prijavu',
	passkeySkip: 'Preskoci',
	passkeySetup: 'Postaviti passkey?',
	passkeyAdd: 'Dodaj passkey',
	passkeyMaybeLater: 'Mozda kasnije',
	passkeySuccess: 'Vas passkey je spreman!',

	errorInvalidEmail: 'Unesite ispravnu e-mail adresu.',
	errorGeneric: 'Nesto je poslo po krivu. Pokusajte ponovo.',
	errorResendFailed: 'Kod se nije mogao ponovo poslati.',
	errorInvalidCode: 'Neispravan kod. Pokusajte ponovo.',
	errorCodeExpired: 'Kod je istekao. Zatrazite novi.',
	errorTooManyAttempts: 'Previse pokusaja. Zatrazite novi kod.',
	errorInvalidInput: 'Neispravan unos',
	errorNotAuthenticated: 'Niste prijavljeni',
	errorNotFound: 'Nije pronadjeno',
	errorAuthFailed: 'Provjera identiteta nije uspjela',
	errorPasskeyRegFailed: 'Registracija passkey nije uspjela',
	errorPasskeyNotFound: 'Passkey nije pronadjen',
};

export default hr;
