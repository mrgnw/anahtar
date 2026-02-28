// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ne: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'जारी राख्नुहोस्',

	codeSentTo: 'कोड पठाइयो:',
	verifying: 'प्रमाणित गर्दै...',
	resend: 'आएन? फेरि पठाउनुहोस्',
	differentEmail: 'अर्को इमेल प्रयोग गर्नुहोस्',

	passkeyCreating: 'Passkey बनाइँदैछ',
	passkeySubtitle: 'सजिलो लगइनका लागि',
	passkeySkip: 'छोड्नुहोस्',
	passkeySetup: 'Passkey सेटअप गर्ने?',
	passkeyAdd: 'Passkey थप्नुहोस्',
	passkeyMaybeLater: 'पछि हुन्छ',
	passkeySuccess: 'तपाईंको passkey तयार छ!',

	errorInvalidEmail: 'कृपया सही इमेल ठेगाना लेख्नुहोस्।',
	errorGeneric: 'केही गलत भयो। कृपया फेरि प्रयास गर्नुहोस्।',
	errorResendFailed: 'कोड फेरि पठाउन सकिएन।',
	errorInvalidCode: 'गलत कोड। कृपया फेरि प्रयास गर्नुहोस्।',
	errorCodeExpired: 'कोडको म्याद सकियो। नयाँ कोड अनुरोध गर्नुहोस्।',
	errorTooManyAttempts: 'धेरै प्रयास भए। नयाँ कोड अनुरोध गर्नुहोस्।',
	errorInvalidInput: 'अमान्य इनपुट',
	errorNotAuthenticated: 'प्रमाणित छैन',
	errorNotFound: 'फेला परेन',
	errorAuthFailed: 'प्रमाणीकरण असफल',
	errorPasskeyRegFailed: 'Passkey दर्ता असफल',
	errorPasskeyNotFound: 'Passkey फेला परेन',
};

export default ne;
