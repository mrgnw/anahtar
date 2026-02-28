// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const sq: AuthMessages = {
	emailPlaceholder: 'ti@shembull.com',
	continue: 'Vazhdo',

	codeSentTo: 'Dërguam një kod te',
	verifying: 'Duke verifikuar…',
	resend: 'Nuk e more? Ridërgo',
	differentEmail: 'Përdor një email tjetër',

	passkeyCreating: 'Po krijojmë një passkey për ty',
	passkeySubtitle: 'për hyrje më të lehtë',
	passkeySkip: 'Kapërce',
	passkeySetup: 'Konfiguro një passkey?',
	passkeyAdd: 'Shto passkey',
	passkeyMaybeLater: 'Ndoshta më vonë',
	passkeySuccess: 'Ke një passkey!',

	errorInvalidEmail: 'Të lutem shkruaj një adresë emaili të vlefshme.',
	errorGeneric: 'Diçka shkoi keq. Të lutem provo përsëri.',
	errorResendFailed: 'Ridërgimi i kodit dështoi.',
	errorInvalidCode: 'Kodi është i pavlefshëm. Të lutem provo përsëri.',
	errorCodeExpired: 'Kodi ka skaduar. Të lutem kërko një kod të ri.',
	errorTooManyAttempts: 'Shumë përpjekje. Të lutem kërko një kod të ri.',
	errorInvalidInput: 'Hyrje e pavlefshme',
	errorNotAuthenticated: 'Nuk je i autentikuar',
	errorNotFound: 'Nuk u gjet',
	errorAuthFailed: 'Autentikimi dështoi',
	errorPasskeyRegFailed: 'Regjistrimi i passkey dështoi',
	errorPasskeyNotFound: 'Passkey nuk u gjet',
};

export default sq;
