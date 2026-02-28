// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const no: AuthMessages = {
	emailPlaceholder: 'deg@eksempel.no',
	continue: 'Fortsett',

	codeSentTo: 'Vi sendte en kode til',
	verifying: 'Bekrefter...',
	resend: 'Ikke mottatt? Send på nytt',
	differentEmail: 'Bruk en annen e-post',

	passkeyCreating: 'Oppretter en passkey',
	passkeySubtitle: 'for enklere innlogging',
	passkeySkip: 'Hopp over',
	passkeySetup: 'Sett opp en passkey?',
	passkeyAdd: 'Legg til passkey',
	passkeyMaybeLater: 'Kanskje senere',
	passkeySuccess: 'Du har en passkey!',

	errorInvalidEmail: 'Vennligst skriv inn en gyldig e-postadresse.',
	errorGeneric: 'Noe gikk galt. Vennligst prøv igjen.',
	errorResendFailed: 'Kunne ikke sende koden på nytt.',
	errorInvalidCode: 'Ugyldig kode. Vennligst prøv igjen.',
	errorCodeExpired: 'Koden har utløpt. Be om en ny.',
	errorTooManyAttempts: 'For mange forsøk. Be om en ny kode.',
	errorInvalidInput: 'Ugyldig inndata',
	errorNotAuthenticated: 'Ikke autentisert',
	errorNotFound: 'Ikke funnet',
	errorAuthFailed: 'Autentisering mislyktes',
	errorPasskeyRegFailed: 'Registrering av passkey mislyktes',
	errorPasskeyNotFound: 'Passkey ikke funnet',
};

export default no;
