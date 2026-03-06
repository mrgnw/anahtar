// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const mr: AuthMessages = {
	emailPlaceholder: 'you@example.in',
	continue: 'पुढे जा',

	codeSentTo: 'आम्ही एक कोड पाठवला आहे',
	verifying: 'पडताळणी होत आहे...',
	resend: 'मिळाला नाही? पुन्हा पाठवा',
	differentEmail: 'वेगळा ईमेल वापरा',

	passkeyCreating: 'तुमच्यासाठी passkey तयार करत आहोत',
	passkeySubtitle: 'जलद, सोपे, सुरक्षित लॉगिनसाठी',
	passkeyAdd: 'आत्ता पासकी जोडा',
	passkeyMaybeLater: 'नंतर कदाचित',
	passkeySuccess: 'तुमची passkey तयार आहे!',

	errorInvalidEmail: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.',
	errorGeneric: 'काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.',
	errorResendFailed: 'कोड पुन्हा पाठवता आला नाही.',
	errorInvalidCode: 'चुकीचा कोड. कृपया पुन्हा प्रयत्न करा.',
	errorCodeExpired: 'कोडची मुदत संपली. कृपया नवीन कोड मागा.',
	errorTooManyAttempts: 'खूप जास्त प्रयत्न. कृपया नवीन कोड मागा.',
	errorInvalidInput: 'अवैध इनपुट',
	errorNotAuthenticated: 'प्रमाणीकृत नाही',
	errorNotFound: 'सापडले नाही',
	errorAuthFailed: 'प्रमाणीकरण अयशस्वी',
	errorPasskeyRegFailed: 'Passkey नोंदणी अयशस्वी',
	errorPasskeyNotFound: 'Passkey सापडली नाही',
};

export default mr;
