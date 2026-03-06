// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ny: AuthMessages = {
	emailPlaceholder: 'inu@chitsanzo.com',
	continue: 'Pitirizani',

	codeSentTo: 'Tatumiza nambala ku',
	verifying: 'Ikutsimikizika...',
	resend: 'Simunalandire? Tumizaninso',
	differentEmail: 'Gwiritsani ntchito imelo ina',

	passkeyCreating: 'Tikukupangirani passkey',
	passkeySubtitle: 'kuti mulowe mwachangu, mosavuta, motetezeka',
	passkeyAdd: 'Onjezani passkey tsopano',
	passkeyMaybeLater: 'Mwina pambuyo pake',
	passkeySuccess: 'Muli ndi passkey!',

	errorInvalidEmail: 'Chonde lembani adiresi ya imelo yovomerezeka.',
	errorGeneric: 'Chinachake sichinathe bwino. Chonde yesaninso.',
	errorResendFailed: 'Kutumizanso nambala kwalephera.',
	errorInvalidCode: 'Nambala yosavomerezeka. Chonde yesaninso.',
	errorCodeExpired: 'Nambala yatha nthawi yake. Chonde pemphani yatsopano.',
	errorTooManyAttempts: 'Mayesero ambiri kwambiri. Chonde pemphani nambala yatsopano.',
	errorInvalidInput: 'Zolowetsedwa zosavomerezeka',
	errorNotAuthenticated: 'Simunavomelezedwe',
	errorNotFound: 'Sichinapezeke',
	errorAuthFailed: 'Kuvomeleza kwalephera',
	errorPasskeyRegFailed: 'Kulembetsa passkey kwalephera',
	errorPasskeyNotFound: 'Passkey sinapezeke',
};

export default ny;
