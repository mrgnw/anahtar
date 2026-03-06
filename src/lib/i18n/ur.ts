// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ur: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'جاری رکھیں',

	codeSentTo: 'ہم نے ایک کوڈ بھیجا ہے',
	verifying: 'تصدیق ہو رہی ہے...',
	resend: 'نہیں ملا؟ دوبارہ بھیجیں',
	differentEmail: 'دوسرا ای میل استعمال کریں',

	passkeyCreating: 'آپ کے لیے passkey بنائی جا رہی ہے',
	passkeySubtitle: 'تیز، آسان، محفوظ لاگ ان کے لیے',
	passkeyAdd: 'ابھی پاس کی شامل کریں',
	passkeyMaybeLater: 'شاید بعد میں',
	passkeySuccess: 'آپ کی passkey تیار ہے!',

	errorInvalidEmail: 'براہ کرم درست ای میل ایڈریس درج کریں۔',
	errorGeneric: 'کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔',
	errorResendFailed: 'کوڈ دوبارہ بھیجنے میں ناکامی۔',
	errorInvalidCode: 'غلط کوڈ۔ براہ کرم دوبارہ کوشش کریں۔',
	errorCodeExpired: 'کوڈ کی میعاد ختم ہو گئی۔ براہ کرم نیا کوڈ حاصل کریں۔',
	errorTooManyAttempts: 'بہت زیادہ کوششیں۔ براہ کرم نیا کوڈ حاصل کریں۔',
	errorInvalidInput: 'غلط ان پٹ',
	errorNotAuthenticated: 'تصدیق نہیں ہوئی',
	errorNotFound: 'نہیں ملا',
	errorAuthFailed: 'تصدیق ناکام',
	errorPasskeyRegFailed: 'Passkey کی رجسٹریشن ناکام',
	errorPasskeyNotFound: 'Passkey نہیں ملی',
};

export default ur;
