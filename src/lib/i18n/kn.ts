// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const kn: AuthMessages = {
	emailPlaceholder: 'you@example.in',
	continue: 'ಮುಂದುವರಿಸಿ',

	codeSentTo: 'ನಾವು ಒಂದು ಕೋಡ್ ಕಳುಹಿಸಿದ್ದೇವೆ',
	verifying: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
	resend: 'ಸಿಗಲಿಲ್ಲವೇ? ಮತ್ತೆ ಕಳುಹಿಸಿ',
	differentEmail: 'ಬೇರೆ ಇಮೇಲ್ ಬಳಸಿ',

	passkeyCreating: 'ನಿಮಗಾಗಿ passkey ರಚಿಸಲಾಗುತ್ತಿದೆ',
	passkeySubtitle: 'ಸುಲಭ ಲಾಗಿನ್‌ಗಾಗಿ',
	passkeySkip: 'ಬಿಡಿ',
	passkeySetup: 'Passkey ಹೊಂದಿಸುವುದೇ?',
	passkeyAdd: 'Passkey ಸೇರಿಸಿ',
	passkeyMaybeLater: 'ಆಮೇಲೆ ನೋಡೋಣ',
	passkeySuccess: 'ನಿಮ್ಮ passkey ಸಿದ್ಧವಾಗಿದೆ!',

	errorInvalidEmail: 'ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.',
	errorGeneric: 'ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
	errorResendFailed: 'ಕೋಡ್ ಮರುಕಳುಹಿಸಲು ವಿಫಲವಾಗಿದೆ.',
	errorInvalidCode: 'ತಪ್ಪಾದ ಕೋಡ್. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
	errorCodeExpired: 'ಕೋಡ್ ಅವಧಿ ಮೀರಿದೆ. ದಯವಿಟ್ಟು ಹೊಸ ಕೋಡ್ ಕೋರಿ.',
	errorTooManyAttempts: 'ಹಲವು ಪ್ರಯತ್ನಗಳಾಗಿವೆ. ದಯವಿಟ್ಟು ಹೊಸ ಕೋಡ್ ಕೋರಿ.',
	errorInvalidInput: 'ಅಮಾನ್ಯ ಇನ್‌ಪುಟ್',
	errorNotAuthenticated: 'ದೃಢೀಕರಿಸಲಾಗಿಲ್ಲ',
	errorNotFound: 'ಕಂಡುಬಂದಿಲ್ಲ',
	errorAuthFailed: 'ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ',
	errorPasskeyRegFailed: 'Passkey ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ',
	errorPasskeyNotFound: 'Passkey ಕಂಡುಬಂದಿಲ್ಲ',
};

export default kn;
