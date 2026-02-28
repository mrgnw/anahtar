// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const cs: AuthMessages = {
	emailPlaceholder: 'vy@priklad.cz',
	continue: 'Pokračovat',

	codeSentTo: 'Poslali jsme kód na',
	verifying: 'Ověřování...',
	resend: 'Nedorazil? Poslat znovu',
	differentEmail: 'Použít jiný e-mail',

	passkeyCreating: 'Vytváříme vám passkey',
	passkeySubtitle: 'pro snazší přihlášení',
	passkeySkip: 'Přeskočit',
	passkeySetup: 'Nastavit passkey?',
	passkeyAdd: 'Přidat passkey',
	passkeyMaybeLater: 'Možná později',
	passkeySuccess: 'Máte passkey!',

	errorInvalidEmail: 'Zadejte prosím platnou e-mailovou adresu.',
	errorGeneric: 'Něco se pokazilo. Zkuste to prosím znovu.',
	errorResendFailed: 'Opětovné odeslání kódu selhalo.',
	errorInvalidCode: 'Neplatný kód. Zkuste to prosím znovu.',
	errorCodeExpired: 'Kód vypršel. Vyžádejte si prosím nový.',
	errorTooManyAttempts: 'Příliš mnoho pokusů. Vyžádejte si prosím nový kód.',
	errorInvalidInput: 'Neplatný vstup',
	errorNotAuthenticated: 'Nepřihlášen',
	errorNotFound: 'Nenalezeno',
	errorAuthFailed: 'Ověření selhalo',
	errorPasskeyRegFailed: 'Registrace passkey selhala',
	errorPasskeyNotFound: 'Passkey nenalezen',
};

export default cs;
