// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const sw: AuthMessages = {
	emailPlaceholder: 'wewe@mfano.com',
	continue: 'Endelea',

	codeSentTo: 'Tumetuma nambari kwa',
	verifying: 'Inathibitisha...',
	resend: 'Hujapata? Tuma tena',
	differentEmail: 'Tumia barua pepe nyingine',

	passkeyCreating: 'Tunakutengenezea passkey',
	passkeySubtitle: 'kwa kuingia kwa urahisi',
	passkeySkip: 'Ruka',
	passkeySetup: 'Weka passkey?',
	passkeyAdd: 'Ongeza passkey',
	passkeyMaybeLater: 'Labda baadaye',
	passkeySuccess: 'Una passkey!',

	errorInvalidEmail: 'Tafadhali weka anwani sahihi ya barua pepe.',
	errorGeneric: 'Kuna kitu kimekwenda vibaya. Tafadhali jaribu tena.',
	errorResendFailed: 'Imeshindwa kutuma tena nambari.',
	errorInvalidCode: 'Nambari si sahihi. Tafadhali jaribu tena.',
	errorCodeExpired: 'Nambari imeisha muda. Tafadhali omba mpya.',
	errorTooManyAttempts: 'Majaribio mengi mno. Tafadhali omba nambari mpya.',
	errorInvalidInput: 'Ingizo batili',
	errorNotAuthenticated: 'Hujathibitishwa',
	errorNotFound: 'Haijapatikana',
	errorAuthFailed: 'Uthibitishaji umeshindwa',
	errorPasskeyRegFailed: 'Usajili wa passkey umeshindwa',
	errorPasskeyNotFound: 'Passkey haijapatikana',
};

export default sw;
