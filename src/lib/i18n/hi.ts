// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const hi: AuthMessages = {
	emailPlaceholder: 'you@example.in',
	continue: 'आगे बढ़ें',

	codeSentTo: 'हमने एक कोड भेजा है',
	verifying: 'सत्यापित हो रहा है...',
	resend: 'नहीं मिला? फिर से भेजें',
	differentEmail: 'दूसरा ईमेल इस्तेमाल करें',

	passkeyCreating: 'आपके लिए passkey बना रहे हैं',
	passkeySubtitle: 'तेज़, आसान, सुरक्षित लॉगिन के लिए',
	passkeyAdd: 'अभी पासकी जोड़ें',
	passkeyMaybeLater: 'बाद में',
	passkeySuccess: 'आपकी passkey तैयार है!',

	errorInvalidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें।',
	errorGeneric: 'कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।',
	errorResendFailed: 'कोड दोबारा भेजने में विफल।',
	errorInvalidCode: 'गलत कोड। कृपया फिर से कोशिश करें।',
	errorCodeExpired: 'कोड की समय-सीमा समाप्त हो गई। कृपया नया कोड माँगें।',
	errorTooManyAttempts: 'बहुत ज़्यादा प्रयास। कृपया नया कोड माँगें।',
	errorInvalidInput: 'अमान्य इनपुट',
	errorNotAuthenticated: 'प्रमाणित नहीं',
	errorNotFound: 'नहीं मिला',
	errorAuthFailed: 'प्रमाणीकरण विफल',
	errorPasskeyRegFailed: 'Passkey पंजीकरण विफल',
	errorPasskeyNotFound: 'Passkey नहीं मिली',
};

export default hi;
