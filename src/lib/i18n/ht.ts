// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ht: AuthMessages = {
	emailPlaceholder: 'ou@egzanp.com',
	continue: 'Kontinye',

	codeSentTo: 'Nou voye yon kòd bay',
	verifying: 'Ap verifye…',
	resend: 'Ou pa resevwa li? Revoye',
	differentEmail: 'Itilize yon lòt imèl',

	passkeyCreating: 'N ap kreye yon passkey pou ou',
	passkeySubtitle: 'pou konekte pi fasil',
	passkeySkip: 'Pase',
	passkeySetup: 'Konfigire yon passkey?',
	passkeyAdd: 'Ajoute passkey',
	passkeyMaybeLater: 'Petèt pita',
	passkeySuccess: 'Ou gen yon passkey!',

	errorInvalidEmail: 'Tanpri antre yon adrès imèl ki valid.',
	errorGeneric: 'Gen yon bagay ki mal pase. Tanpri eseye ankò.',
	errorResendFailed: 'Nou pa t kapab revoye kòd la.',
	errorInvalidCode: 'Kòd la pa valid. Tanpri eseye ankò.',
	errorCodeExpired: 'Kòd la ekspire. Tanpri mande yon nouvo.',
	errorTooManyAttempts: 'Twòp tantativ. Tanpri mande yon nouvo kòd.',
	errorInvalidInput: 'Done ki pa valid',
	errorNotAuthenticated: 'Ou pa otantifye',
	errorNotFound: 'Pa jwenn',
	errorAuthFailed: 'Otantifikasyon echwe',
	errorPasskeyRegFailed: 'Enskripsyon passkey echwe',
	errorPasskeyNotFound: 'Passkey pa jwenn',
};

export default ht;
