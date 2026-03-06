// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const am: AuthMessages = {
	emailPlaceholder: 'you@example.com.et',
	continue: 'ቀጥል',

	codeSentTo: 'ኮድ ልከናል ወደ',
	verifying: 'በማረጋገጥ ላይ...',
	resend: 'አልደረሰህም? እንደገና ላክ',
	differentEmail: 'ሌላ ኢሜይል ተጠቀም',

	passkeyCreating: 'Passkey እየሠራንልህ ነው',
	passkeySubtitle: 'ፈጣን፣ ቀላል፣ ደህንነቱ የተጠበቀ ግባ',
	passkeyAdd: 'አሁን passkey ጨምር',
	passkeyMaybeLater: 'ሌላ ጊዜ',
	passkeySuccess: 'Passkey አለህ!',

	errorInvalidEmail: 'እባክህ ትክክለኛ ኢሜይል አድራሻ አስገባ።',
	errorGeneric: 'ችግር ተፈጥሯል። እባክህ እንደገና ሞክር።',
	errorResendFailed: 'ኮዱን እንደገና መላክ አልተሳካም።',
	errorInvalidCode: 'ኮዱ ትክክል አይደለም። እባክህ እንደገና ሞክር።',
	errorCodeExpired: 'ኮዱ ጊዜው አልፏል። እባክህ አዲስ ጠይቅ።',
	errorTooManyAttempts: 'ብዙ ጊዜ ሞክረሃል። እባክህ አዲስ ኮድ ጠይቅ።',
	errorInvalidInput: 'ግቤቱ ትክክል አይደለም',
	errorNotAuthenticated: 'አልተረጋገጠም',
	errorNotFound: 'አልተገኘም',
	errorAuthFailed: 'ማረጋገጡ አልተሳካም',
	errorPasskeyRegFailed: 'Passkey ምዝገባ አልተሳካም',
	errorPasskeyNotFound: 'Passkey አልተገኘም',
};

export default am;
