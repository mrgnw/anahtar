// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const gu: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'આગળ વધો',

	codeSentTo: 'અમે એક કોડ મોકલ્યો છે',
	verifying: 'ચકાસણી થઈ રહી છે...',
	resend: 'મળ્યો નથી? ફરી મોકલો',
	differentEmail: 'બીજો ઈમેલ વાપરો',

	passkeyCreating: 'તમારા માટે passkey બનાવી રહ્યા છીએ',
	passkeySubtitle: 'સરળ લૉગિન માટે',
	passkeySkip: 'છોડો',
	passkeySetup: 'Passkey સેટ કરવી છે?',
	passkeyAdd: 'Passkey ઉમેરો',
	passkeyMaybeLater: 'કદાચ પછી',
	passkeySuccess: 'તમારી passkey તૈયાર છે!',

	errorInvalidEmail: 'કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો.',
	errorGeneric: 'કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.',
	errorResendFailed: 'કોડ ફરી મોકલવામાં નિષ્ફળ.',
	errorInvalidCode: 'ખોટો કોડ. કૃપા કરીને ફરી પ્રયાસ કરો.',
	errorCodeExpired: 'કોડની સમયસીમા પૂરી થઈ. કૃપા કરીને નવો કોડ માગો.',
	errorTooManyAttempts: 'ઘણા બધા પ્રયાસો. કૃપા કરીને નવો કોડ માગો.',
	errorInvalidInput: 'અમાન્ય ઇનપુટ',
	errorNotAuthenticated: 'પ્રમાણિત નથી',
	errorNotFound: 'મળ્યું નથી',
	errorAuthFailed: 'પ્રમાણીકરણ નિષ્ફળ',
	errorPasskeyRegFailed: 'Passkey નોંધણી નિષ્ફળ',
	errorPasskeyNotFound: 'Passkey મળી નથી',
};

export default gu;
