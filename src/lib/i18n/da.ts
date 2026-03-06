// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const da: AuthMessages = {
	emailPlaceholder: 'dig@eksempel.dk',
	continue: 'Fortsæt',

	codeSentTo: 'Vi sendte en kode til',
	verifying: 'Bekræfter...',
	resend: 'Ikke modtaget? Send igen',
	differentEmail: 'Brug en anden e-mail',

	passkeyCreating: 'Opretter en passkey',
	passkeySubtitle: 'for hurtigere, nemmere og sikrere login',
	passkeyAdd: 'Tilføj passkey nu',
	passkeyMaybeLater: 'Måske senere',
	passkeySuccess: 'Du har en passkey!',

	errorInvalidEmail: 'Indtast en gyldig e-mailadresse.',
	errorGeneric: 'Noget gik galt. Prøv igen.',
	errorResendFailed: 'Kunne ikke sende koden igen.',
	errorInvalidCode: 'Ugyldig kode. Prøv igen.',
	errorCodeExpired: 'Koden er udløbet. Bed om en ny.',
	errorTooManyAttempts: 'For mange forsøg. Bed om en ny kode.',
	errorInvalidInput: 'Ugyldigt input',
	errorNotAuthenticated: 'Ikke godkendt',
	errorNotFound: 'Ikke fundet',
	errorAuthFailed: 'Godkendelse mislykkedes',
	errorPasskeyRegFailed: 'Registrering af passkey mislykkedes',
	errorPasskeyNotFound: 'Passkey ikke fundet',
};

export default da;
