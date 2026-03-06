// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const fi: AuthMessages = {
	emailPlaceholder: 'sinä@esimerkki.fi',
	continue: 'Jatka',

	codeSentTo: 'Lähetimme koodin osoitteeseen',
	verifying: 'Vahvistetaan...',
	resend: 'Etkö saanut? Lähetä uudelleen',
	differentEmail: 'Käytä toista sähköpostia',

	passkeyCreating: 'Luodaan sinulle passkey',
	passkeySubtitle: 'nopeampaan, helpompaan ja turvallisempaan kirjautumiseen',
	passkeyAdd: 'Lisaa passkey nyt',
	passkeyMaybeLater: 'Ehkä myöhemmin',
	passkeySuccess: 'Passkey on valmis!',

	errorInvalidEmail: 'Syötä kelvollinen sähköpostiosoite.',
	errorGeneric: 'Jokin meni pieleen. Yritä uudelleen.',
	errorResendFailed: 'Koodin uudelleenlähetys epäonnistui.',
	errorInvalidCode: 'Virheellinen koodi. Yritä uudelleen.',
	errorCodeExpired: 'Koodi on vanhentunut. Pyydä uusi koodi.',
	errorTooManyAttempts: 'Liian monta yritystä. Pyydä uusi koodi.',
	errorInvalidInput: 'Virheellinen syöte',
	errorNotAuthenticated: 'Ei tunnistettu',
	errorNotFound: 'Ei löytynyt',
	errorAuthFailed: 'Tunnistautuminen epäonnistui',
	errorPasskeyRegFailed: 'Passkeyn rekisteröinti epäonnistui',
	errorPasskeyNotFound: 'Passkeytä ei löytynyt',
};

export default fi;
