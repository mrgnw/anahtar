// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const si: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'ඉදිරියට',

	codeSentTo: 'කේතය යැවුවා:',
	verifying: 'සත්‍යාපනය කරමින්...',
	resend: 'ලැබුණේ නැද්ද? නැවත යවන්න',
	differentEmail: 'වෙනත් ඊමේල් එකක් භාවිතා කරන්න',

	passkeyCreating: 'Passkey එකක් සාදමින්',
	passkeySubtitle: 'පහසු පිවිසුම සඳහා',
	passkeySkip: 'මඟහරින්න',
	passkeySetup: 'Passkey එකක් සකසන්නද?',
	passkeyAdd: 'Passkey එකක් එකතු කරන්න',
	passkeyMaybeLater: 'පසුව සමහරවිට',
	passkeySuccess: 'ඔබට passkey එකක් තිබේ!',

	errorInvalidEmail: 'කරුණාකර වලංගු ඊමේල් ලිපිනයක් ඇතුළත් කරන්න.',
	errorGeneric: 'යමක් වැරදුණා. කරුණාකර නැවත උත්සාහ කරන්න.',
	errorResendFailed: 'කේතය නැවත යැවීම අසාර්ථකයි.',
	errorInvalidCode: 'වැරදි කේතය. කරුණාකර නැවත උත්සාහ කරන්න.',
	errorCodeExpired: 'කේතය කල් ඉකුත් වී ඇත. නව කේතයක් ඉල්ලන්න.',
	errorTooManyAttempts: 'උත්සාහයන් ඉතා වැඩියි. නව කේතයක් ඉල්ලන්න.',
	errorInvalidInput: 'වලංගු නොවන ආදානය',
	errorNotAuthenticated: 'සත්‍යාපනය කර නැත',
	errorNotFound: 'සොයා ගත නොහැක',
	errorAuthFailed: 'සත්‍යාපනය අසාර්ථකයි',
	errorPasskeyRegFailed: 'Passkey ලියාපදිංචිය අසාර්ථකයි',
	errorPasskeyNotFound: 'Passkey සොයා ගත නොහැක',
};

export default si;
