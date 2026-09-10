// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const hr: Partial<AuthMessages> = {
	emailPlaceholder: 'vi@primjer.hr',
	continue: 'Nastavi',

	codeSentTo: 'Poslali smo kod na',
	verifying: 'Provjerava se...',
	resend: 'Niste dobili? Posalji ponovo',
	differentEmail: 'Koristi drugi e-mail',

	passkeyTitle: 'Dodati passkey?',
	passkeySubtitle: 'za brze, lakse i sigurnije prijavljivanje',
	passkeyAdd: 'Dodaj passkey sada',
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
