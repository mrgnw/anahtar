// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ta: AuthMessages = {
	emailPlaceholder: 'you@example.in',
	continue: 'தொடரவும்',

	codeSentTo: 'குறியீட்டை அனுப்பினோம்',
	verifying: 'சரிபார்க்கிறது...',
	resend: 'கிடைக்கவில்லையா? மீண்டும் அனுப்பு',
	differentEmail: 'வேறு மின்னஞ்சலைப் பயன்படுத்து',

	passkeyCreating: 'உங்களுக்கு passkey உருவாக்கப்படுகிறது',
	passkeySubtitle: 'எளிதாக உள்நுழைய',
	passkeySkip: 'தவிர்',
	passkeySetup: 'Passkey அமைக்கவா?',
	passkeyAdd: 'Passkey சேர்',
	passkeyMaybeLater: 'பிறகு பார்க்கலாம்',
	passkeySuccess: 'உங்கள் passkey தயார்!',

	errorInvalidEmail: 'சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.',
	errorGeneric: 'ஏதோ தவறாகிவிட்டது. மீண்டும் முயற்சிக்கவும்.',
	errorResendFailed: 'குறியீட்டை மீண்டும் அனுப்ப இயலவில்லை.',
	errorInvalidCode: 'தவறான குறியீடு. மீண்டும் முயற்சிக்கவும்.',
	errorCodeExpired: 'குறியீடு காலாவதியானது. புதிய குறியீட்டைக் கோரவும்.',
	errorTooManyAttempts: 'அதிக முயற்சிகள். புதிய குறியீட்டைக் கோரவும்.',
	errorInvalidInput: 'தவறான உள்ளீடு',
	errorNotAuthenticated: 'அங்கீகரிக்கப்படவில்லை',
	errorNotFound: 'கிடைக்கவில்லை',
	errorAuthFailed: 'அங்கீகாரம் தோல்வியடைந்தது',
	errorPasskeyRegFailed: 'Passkey பதிவு தோல்வியடைந்தது',
	errorPasskeyNotFound: 'Passkey கிடைக்கவில்லை',
};

export default ta;
