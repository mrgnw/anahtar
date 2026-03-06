// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const fa: AuthMessages = {
	emailPlaceholder: 'you@example.ir',
	continue: 'ادامه',

	codeSentTo: 'کد تأیید ارسال شد به',
	verifying: 'در حال بررسی...',
	resend: 'دریافت نکردید؟ ارسال دوباره',
	differentEmail: 'استفاده از ایمیل دیگر',

	passkeyCreating: 'در حال ساخت passkey',
	passkeySubtitle: 'برای ورود سریع‌تر، آسان‌تر و امن‌تر',
	passkeyAdd: 'اکنون کلید عبور اضافه کنید',
	passkeyMaybeLater: 'شاید بعداً',
	passkeySuccess: 'passkey شما آماده است!',

	errorInvalidEmail: 'لطفاً یک آدرس ایمیل معتبر وارد کنید.',
	errorGeneric: 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.',
	errorResendFailed: 'ارسال دوباره کد انجام نشد.',
	errorInvalidCode: 'کد نامعتبر است. لطفاً دوباره تلاش کنید.',
	errorCodeExpired: 'کد منقضی شده. لطفاً کد جدید درخواست کنید.',
	errorTooManyAttempts: 'تلاش‌های زیادی انجام شده. لطفاً کد جدید درخواست کنید.',
	errorInvalidInput: 'ورودی نامعتبر',
	errorNotAuthenticated: 'احراز هویت نشده',
	errorNotFound: 'یافت نشد',
	errorAuthFailed: 'احراز هویت ناموفق',
	errorPasskeyRegFailed: 'ثبت passkey ناموفق بود',
	errorPasskeyNotFound: 'passkey یافت نشد',
};

export default fa;
