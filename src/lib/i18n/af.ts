// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const af: AuthMessages = {
	emailPlaceholder: 'jy@voorbeeld.com',
	continue: 'Gaan voort',

	codeSentTo: 'Ons het \'n kode gestuur na',
	verifying: 'Verifieer...',
	resend: 'Nie ontvang nie? Stuur weer',
	differentEmail: 'Gebruik \'n ander e-pos',

	passkeyCreating: 'Ons skep jou passkey',
	passkeySubtitle: 'vir makliker aanmelding',
	passkeySkip: 'Slaan oor',
	passkeySetup: 'Stel \'n passkey op?',
	passkeyAdd: 'Voeg passkey by',
	passkeyMaybeLater: 'Miskien later',
	passkeySuccess: 'Jy het \'n passkey!',

	errorInvalidEmail: 'Voer asseblief \'n geldige e-posadres in.',
	errorGeneric: 'Iets het fout gegaan. Probeer asseblief weer.',
	errorResendFailed: 'Kon nie die kode weer stuur nie.',
	errorInvalidCode: 'Ongeldige kode. Probeer asseblief weer.',
	errorCodeExpired: 'Kode het verval. Versoek asseblief \'n nuwe een.',
	errorTooManyAttempts: 'Te veel pogings. Versoek asseblief \'n nuwe kode.',
	errorInvalidInput: 'Ongeldige invoer',
	errorNotAuthenticated: 'Nie geverifieer nie',
	errorNotFound: 'Nie gevind nie',
	errorAuthFailed: 'Verifikasie het misluk',
	errorPasskeyRegFailed: 'Passkey-registrasie het misluk',
	errorPasskeyNotFound: 'Passkey nie gevind nie',
};

export default af;
