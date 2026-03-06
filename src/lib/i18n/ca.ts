// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ca: AuthMessages = {
	emailPlaceholder: 'tu@exemple.cat',
	continue: 'Continua',

	codeSentTo: 'Hem enviat un codi a',
	verifying: 'Verificant...',
	resend: 'No l\'has rebut? Reenvia',
	differentEmail: 'Usa un altre correu',

	passkeyCreating: 'Creant el teu passkey',
	passkeySubtitle: 'per a un inici de sessio mes rapid, facil i segur',
	passkeyAdd: 'Afegeix passkey ara',
	passkeyMaybeLater: 'Potser més tard',
	passkeySuccess: 'Ja tens un passkey!',

	errorInvalidEmail: 'Introdueix una adreça de correu vàlida.',
	errorGeneric: 'Alguna cosa ha fallat. Torna-ho a provar.',
	errorResendFailed: 'No s\'ha pogut reenviar el codi.',
	errorInvalidCode: 'Codi no vàlid. Torna-ho a provar.',
	errorCodeExpired: 'El codi ha caducat. Sol·licita\'n un de nou.',
	errorTooManyAttempts: 'Massa intents. Sol·licita un codi nou.',
	errorInvalidInput: 'Entrada no vàlida',
	errorNotAuthenticated: 'No autenticat',
	errorNotFound: 'No trobat',
	errorAuthFailed: 'L\'autenticació ha fallat',
	errorPasskeyRegFailed: 'El registre del passkey ha fallat',
	errorPasskeyNotFound: 'Passkey no trobat',
};

export default ca;
