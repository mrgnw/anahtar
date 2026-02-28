// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const uz: AuthMessages = {
	emailPlaceholder: 'siz@misol.uz',
	continue: 'Davom etish',

	codeSentTo: 'Biz kod yubordik:',
	verifying: 'Tekshirilmoqda...',
	resend: 'Kelmadimi? Qayta yuborish',
	differentEmail: 'Boshqa email ishlatish',

	passkeyCreating: 'Sizga passkey yaratilmoqda',
	passkeySubtitle: 'oson kirish uchun',
	passkeySkip: 'Oʻtkazib yuborish',
	passkeySetup: 'Passkey sozlash?',
	passkeyAdd: 'Passkey qoʻshish',
	passkeyMaybeLater: 'Keyinroq',
	passkeySuccess: 'Passkey tayyor!',

	errorInvalidEmail: 'Iltimos, toʻgʻri email manzilini kiriting.',
	errorGeneric: 'Xatolik yuz berdi. Iltimos, qayta urinib koʻring.',
	errorResendFailed: 'Kodni qayta yuborib boʻlmadi.',
	errorInvalidCode: 'Kod notoʻgʻri. Iltimos, qayta urinib koʻring.',
	errorCodeExpired: 'Kod muddati tugadi. Iltimos, yangi kod soʻrang.',
	errorTooManyAttempts: 'Juda koʻp urinish. Iltimos, yangi kod soʻrang.',
	errorInvalidInput: 'Notoʻgʻri kiritish',
	errorNotAuthenticated: 'Autentifikatsiya qilinmagan',
	errorNotFound: 'Topilmadi',
	errorAuthFailed: 'Autentifikatsiya amalga oshmadi',
	errorPasskeyRegFailed: 'Passkey roʻyxatdan oʻtkazish amalga oshmadi',
	errorPasskeyNotFound: 'Passkey topilmadi',
};

export default uz;
