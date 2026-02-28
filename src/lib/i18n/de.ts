import type { AuthMessages } from './types.js';

const de: AuthMessages = {
	emailPlaceholder: 'du@beispiel.de',
	continue: 'Weiter',

	codeSentTo: 'Wir haben einen Code gesendet an',
	verifying: 'Wird uberpruft...',
	resend: 'Nicht erhalten? Erneut senden',
	differentEmail: 'Andere E-Mail verwenden',

	passkeyCreating: 'Passkey wird erstellt',
	passkeySubtitle: 'fur einfacheres Anmelden',
	passkeySkip: 'Uberspringen',
	passkeySetup: 'Passkey einrichten?',
	passkeyAdd: 'Passkey hinzufugen',
	passkeyMaybeLater: 'Vielleicht spater',
	passkeySuccess: 'Dein Passkey ist bereit!',

	errorInvalidEmail: 'Bitte gib eine gultige E-Mail-Adresse ein.',
	errorGeneric: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
	errorResendFailed: 'Code konnte nicht erneut gesendet werden.',
	errorInvalidCode: 'Ungueltiger Code. Bitte versuche es erneut.',
	errorCodeExpired: 'Code abgelaufen. Bitte fordere einen neuen an.',
	errorTooManyAttempts: 'Zu viele Versuche. Bitte fordere einen neuen Code an.',
	errorInvalidInput: 'Ungueltige Eingabe',
	errorNotAuthenticated: 'Nicht authentifiziert',
	errorNotFound: 'Nicht gefunden',
	errorAuthFailed: 'Authentifizierung fehlgeschlagen',
	errorPasskeyRegFailed: 'Passkey-Registrierung fehlgeschlagen',
	errorPasskeyNotFound: 'Passkey nicht gefunden',
};

export default de;
