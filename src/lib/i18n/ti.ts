// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ti: AuthMessages = {
	emailPlaceholder: 'you@example.com.er',
	continue: 'ቀጽል',

	codeSentTo: 'ኮድ ልኢኽናልካ ናብ',
	verifying: 'ንረጋግጽ ኣለና…',
	resend: 'ኣይበጽሓካን? ደጊምካ ስደድ',
	differentEmail: 'ካልእ ኢመይል ተጠቐም',

	passkeyCreating: 'Passkey ንሰርሓልካ ኣለና',
	passkeySubtitle: 'ንቕልጡፍ፣ ቀሊል፣ ውሑስ ምእታው',
	passkeyAdd: 'ሕጂ passkey ወስኹ',
	passkeyMaybeLater: 'ድሒሩ ይኸውን',
	passkeySuccess: 'Passkey ኣለካ!',

	errorInvalidEmail: 'በጃኻ ቅኑዕ ኣድራሻ ኢመይል ኣእቱ።',
	errorGeneric: 'ገለ ጸገም ተፈጢሩ። በጃኻ ደጊምካ ፈትን።',
	errorResendFailed: 'ኮድ ደጊምካ ምስዳድ ኣይተኻእለን።',
	errorInvalidCode: 'ዘይቅኑዕ ኮድ። በጃኻ ደጊምካ ፈትን።',
	errorCodeExpired: 'ኮድ ገዲፉ። በጃኻ ሓድሽ ሕተት።',
	errorTooManyAttempts: 'ብዙሕ ፈተነ። በጃኻ ሓድሽ ኮድ ሕተት።',
	errorInvalidInput: 'ዘይቅኑዕ ኣታዊ',
	errorNotAuthenticated: 'ኣይተረጋገጸን',
	errorNotFound: 'ኣይተረኽበን',
	errorAuthFailed: 'ምርግጋጽ ኣይሰለጠን',
	errorPasskeyRegFailed: 'ምዝገባ passkey ኣይሰለጠን',
	errorPasskeyNotFound: 'Passkey ኣይተረኽበን',
};

export default ti;
