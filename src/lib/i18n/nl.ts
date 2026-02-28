// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const nl: AuthMessages = {
	emailPlaceholder: 'jij@voorbeeld.nl',
	continue: 'Doorgaan',

	codeSentTo: 'We hebben een code gestuurd naar',
	verifying: 'Verifiëren...',
	resend: 'Niet ontvangen? Opnieuw versturen',
	differentEmail: 'Ander e-mailadres gebruiken',

	passkeyCreating: 'Passkey wordt aangemaakt',
	passkeySubtitle: 'voor makkelijker inloggen',
	passkeySkip: 'Overslaan',
	passkeySetup: 'Passkey instellen?',
	passkeyAdd: 'Passkey toevoegen',
	passkeyMaybeLater: 'Misschien later',
	passkeySuccess: 'Je passkey is klaar!',

	errorInvalidEmail: 'Voer een geldig e-mailadres in.',
	errorGeneric: 'Er ging iets mis. Probeer het opnieuw.',
	errorResendFailed: 'Code opnieuw versturen mislukt.',
	errorInvalidCode: 'Ongeldige code. Probeer het opnieuw.',
	errorCodeExpired: 'Code verlopen. Vraag een nieuwe aan.',
	errorTooManyAttempts: 'Te veel pogingen. Vraag een nieuwe code aan.',
	errorInvalidInput: 'Ongeldige invoer',
	errorNotAuthenticated: 'Niet ingelogd',
	errorNotFound: 'Niet gevonden',
	errorAuthFailed: 'Authenticatie mislukt',
	errorPasskeyRegFailed: 'Passkey registratie mislukt',
	errorPasskeyNotFound: 'Passkey niet gevonden',
};

export default nl;
