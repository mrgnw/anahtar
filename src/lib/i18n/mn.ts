// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const mn: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'Үргэлжлүүлэх',

	codeSentTo: 'Бид код илгээлээ',
	verifying: 'Шалгаж байна...',
	resend: 'Ирээгүй юу? Дахин илгээх',
	differentEmail: 'Өөр имэйл ашиглах',

	passkeyCreating: 'Passkey үүсгэж байна',
	passkeySubtitle: 'нэвтрэхэд хялбар болгоно',
	passkeySkip: 'Алгасах',
	passkeySetup: 'Passkey тохируулах уу?',
	passkeyAdd: 'Passkey нэмэх',
	passkeyMaybeLater: 'Дараа болох',
	passkeySuccess: 'Passkey бэлэн боллоо!',

	errorInvalidEmail: 'Зөв имэйл хаяг оруулна уу.',
	errorGeneric: 'Алдаа гарлаа. Дахин оролдоно уу.',
	errorResendFailed: 'Код дахин илгээж чадсангүй.',
	errorInvalidCode: 'Буруу код. Дахин оролдоно уу.',
	errorCodeExpired: 'Кодын хугацаа дууссан. Шинэ код авна уу.',
	errorTooManyAttempts: 'Оролдлого хэт олон. Шинэ код авна уу.',
	errorInvalidInput: 'Буруу оролт',
	errorNotAuthenticated: 'Нэвтрээгүй байна',
	errorNotFound: 'Олдсонгүй',
	errorAuthFailed: 'Нэвтрэлт амжилтгүй',
	errorPasskeyRegFailed: 'Passkey бүртгэл амжилтгүй',
	errorPasskeyNotFound: 'Passkey олдсонгүй',
};

export default mn;
