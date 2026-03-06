import type { AuthMessages } from './types.js';

const ar: AuthMessages = {
	emailPlaceholder: 'you@example.sa',
	continue: 'متابعة',

	codeSentTo: 'أرسلنا رمزًا إلى',
	verifying: 'جارٍ التحقق...',
	resend: 'لم يصلك؟ إعادة الإرسال',
	differentEmail: 'استخدام بريد إلكتروني آخر',

	passkeyCreating: 'جارٍ إنشاء مفتاح المرور',
	passkeySubtitle: 'لتسجيل دخول اسرع واسهل واكثر امانا',
	passkeyAdd: 'اضف مفتاح مرور الان',
	passkeyMaybeLater: 'ربما لاحقًا',
	passkeySuccess: 'مفتاح المرور جاهز!',

	errorInvalidEmail: 'يرجى إدخال بريد إلكتروني صالح.',
	errorGeneric: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
	errorResendFailed: 'فشل إعادة إرسال الرمز.',
	errorInvalidCode: 'رمز غير صالح. يرجى المحاولة مرة أخرى.',
	errorCodeExpired: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد.',
	errorTooManyAttempts: 'محاولات كثيرة جدًا. يرجى طلب رمز جديد.',
	errorInvalidInput: 'إدخال غير صالح',
	errorNotAuthenticated: 'غير مسجل الدخول',
	errorNotFound: 'غير موجود',
	errorAuthFailed: 'فشل التحقق من الهوية',
	errorPasskeyRegFailed: 'فشل تسجيل مفتاح المرور',
	errorPasskeyNotFound: 'مفتاح المرور غير موجود',
};

export default ar;
