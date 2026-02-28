// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const az: AuthMessages = {
	emailPlaceholder: 'siz@misal.az',
	continue: 'Davam et',

	codeSentTo: 'Kod göndərdik:',
	verifying: 'Yoxlanılır...',
	resend: 'Almadınız? Yenidən göndər',
	differentEmail: 'Başqa email istifadə et',

	passkeyCreating: 'Sizin üçün passkey yaradılır',
	passkeySubtitle: 'asan giriş üçün',
	passkeySkip: 'Keç',
	passkeySetup: 'Passkey qurmaq istəyirsiniz?',
	passkeyAdd: 'Passkey əlavə et',
	passkeyMaybeLater: 'Bəlkə sonra',
	passkeySuccess: 'Passkey hazırdır!',

	errorInvalidEmail: 'Zəhmət olmasa, düzgün email ünvanı daxil edin.',
	errorGeneric: 'Xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.',
	errorResendFailed: 'Kod yenidən göndərilə bilmədi.',
	errorInvalidCode: 'Kod yanlışdır. Zəhmət olmasa, yenidən cəhd edin.',
	errorCodeExpired: 'Kodun vaxtı bitib. Zəhmət olmasa, yeni kod tələb edin.',
	errorTooManyAttempts: 'Həddindən çox cəhd. Zəhmət olmasa, yeni kod tələb edin.',
	errorInvalidInput: 'Yanlış daxiletmə',
	errorNotAuthenticated: 'Doğrulanmayıb',
	errorNotFound: 'Tapılmadı',
	errorAuthFailed: 'Doğrulama uğursuz oldu',
	errorPasskeyRegFailed: 'Passkey qeydiyyatı uğursuz oldu',
	errorPasskeyNotFound: 'Passkey tapılmadı',
};

export default az;
