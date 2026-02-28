// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ln: AuthMessages = {
	emailPlaceholder: 'yo@ndakisa.com',
	continue: 'Kokisa',

	codeSentTo: 'Totindeli kode na',
	verifying: 'Tozali kolimba...',
	resend: 'Ozwi yango te? Tinda lisusu',
	differentEmail: 'Salelá e-mail mosusu',

	passkeyCreating: 'Tozali kosalela yo passkey',
	passkeySubtitle: 'mpo na kokɔta pete',
	passkeySkip: 'Longwa',
	passkeySetup: 'Obɔngi kobongisa passkey?',
	passkeyAdd: 'Bakisa passkey',
	passkeyMaybeLater: 'Mbala mosusu',
	passkeySuccess: 'Ozwi passkey!',

	errorInvalidEmail: 'Svp kotia adrɛsi ya e-mail ya malamu.',
	errorGeneric: 'Likambo moko esalemi. Svp meka lisusu.',
	errorResendFailed: 'Kotinda kode lisusu elongi te.',
	errorInvalidCode: 'Kode ezali malamu te. Svp meka lisusu.',
	errorCodeExpired: 'Kode esilá. Svp sɛngá kode ya sika.',
	errorTooManyAttempts: 'Omeki mbala mingi. Svp sɛngá kode ya sika.',
	errorInvalidInput: 'Makambo ya kokɔtisa ezali malamu te',
	errorNotAuthenticated: 'Ondimami te',
	errorNotFound: 'Emonani te',
	errorAuthFailed: 'Kondimama elongi te',
	errorPasskeyRegFailed: 'Kokoma passkey elongi te',
	errorPasskeyNotFound: 'Passkey emonani te',
};

export default ln;
