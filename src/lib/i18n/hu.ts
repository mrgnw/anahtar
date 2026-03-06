// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const hu: AuthMessages = {
	emailPlaceholder: 'te@pelda.hu',
	continue: 'Tovább',

	codeSentTo: 'Kódot küldtünk ide:',
	verifying: 'Ellenőrzés...',
	resend: 'Nem kaptad meg? Újraküldés',
	differentEmail: 'Másik e-mail használata',

	passkeyCreating: 'Passkey létrehozása',
	passkeySubtitle: 'gyorsabb, konnyebb es biztonsagosabb belepes',
	passkeyAdd: 'Passkey hozzaadasa most',
	passkeyMaybeLater: 'Talán később',
	passkeySuccess: 'Passkey kész!',

	errorInvalidEmail: 'Kérjük, adj meg egy érvényes e-mail-címet.',
	errorGeneric: 'Hiba történt. Kérjük, próbáld újra.',
	errorResendFailed: 'A kód újraküldése sikertelen.',
	errorInvalidCode: 'Érvénytelen kód. Kérjük, próbáld újra.',
	errorCodeExpired: 'A kód lejárt. Kérj egy újat.',
	errorTooManyAttempts: 'Túl sok próbálkozás. Kérj egy új kódot.',
	errorInvalidInput: 'Érvénytelen bemenet',
	errorNotAuthenticated: 'Nincs hitelesítve',
	errorNotFound: 'Nem található',
	errorAuthFailed: 'Hitelesítés sikertelen',
	errorPasskeyRegFailed: 'Passkey regisztráció sikertelen',
	errorPasskeyNotFound: 'Passkey nem található',
};

export default hu;
