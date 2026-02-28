// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ps: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'دوام ورکړئ',

	codeSentTo: 'موږ یو کوډ واستاوه',
	verifying: 'تایید کیږي...',
	resend: 'نه مو ترلاسه کړ؟ بیا واستوئ',
	differentEmail: 'بل بریښنالیک وکاروئ',

	passkeyCreating: 'ستاسو لپاره passkey جوړیږي',
	passkeySubtitle: 'د اسانه ننوتلو لپاره',
	passkeySkip: 'تېر کړئ',
	passkeySetup: 'Passkey جوړ کړئ؟',
	passkeyAdd: 'Passkey اضافه کړئ',
	passkeyMaybeLater: 'شاید وروسته',
	passkeySuccess: 'ستاسو passkey چمتو دی!',

	errorInvalidEmail: 'مهرباني وکړئ سم بریښنالیک ولیکئ.',
	errorGeneric: 'یوه ستونزه رامنځته شوه. مهرباني وکړئ بیا هڅه وکړئ.',
	errorResendFailed: 'کوډ بیا لېږل ونشو.',
	errorInvalidCode: 'ناسم کوډ. مهرباني وکړئ بیا هڅه وکړئ.',
	errorCodeExpired: 'د کوډ مهلت پای ته ورسېده. مهرباني وکړئ نوی کوډ وغواړئ.',
	errorTooManyAttempts: 'ډېرې هڅې شوې. مهرباني وکړئ نوی کوډ وغواړئ.',
	errorInvalidInput: 'ناسم ان‌پټ',
	errorNotAuthenticated: 'تایید شوی نه یاست',
	errorNotFound: 'ونه موندل شو',
	errorAuthFailed: 'تایید ناکام شو',
	errorPasskeyRegFailed: 'د passkey ثبتول ناکام شو',
	errorPasskeyNotFound: 'Passkey ونه موندل شو',
};

export default ps;
