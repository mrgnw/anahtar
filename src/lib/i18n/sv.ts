// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const sv: AuthMessages = {
	emailPlaceholder: 'du@exempel.se',
	continue: 'Fortsätt',

	codeSentTo: 'Vi skickade en kod till',
	verifying: 'Verifierar...',
	resend: 'Inte fått den? Skicka igen',
	differentEmail: 'Använd en annan e-post',

	passkeyCreating: 'Skapar en passkey',
	passkeySubtitle: 'för enklare inloggning',
	passkeySkip: 'Hoppa över',
	passkeySetup: 'Skapa en passkey?',
	passkeyAdd: 'Lägg till passkey',
	passkeyMaybeLater: 'Kanske senare',
	passkeySuccess: 'Din passkey är klar!',

	errorInvalidEmail: 'Ange en giltig e-postadress.',
	errorGeneric: 'Något gick fel. Försök igen.',
	errorResendFailed: 'Kunde inte skicka koden igen.',
	errorInvalidCode: 'Ogiltig kod. Försök igen.',
	errorCodeExpired: 'Koden har gått ut. Begär en ny.',
	errorTooManyAttempts: 'För många försök. Begär en ny kod.',
	errorInvalidInput: 'Ogiltig inmatning',
	errorNotAuthenticated: 'Inte inloggad',
	errorNotFound: 'Hittades inte',
	errorAuthFailed: 'Autentisering misslyckades',
	errorPasskeyRegFailed: 'Registrering av passkey misslyckades',
	errorPasskeyNotFound: 'Passkey hittades inte',
};

export default sv;
