// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const sd: AuthMessages = {
	emailPlaceholder: 'you@example.pk',
	continue: 'اڳتي وڌو',

	codeSentTo: 'اسان ڪوڊ موڪليو آهي',
	verifying: 'تصديق ٿي رهي آهي...',
	resend: 'نه مليو؟ ٻيهر موڪليو',
	differentEmail: 'ٻيو اي ميل استعمال ڪريو',

	passkeyCreating: 'توهان لاءِ passkey ٺاهي رهيا آهيون',
	passkeySubtitle: 'آسان لاگ اِن لاءِ',
	passkeySkip: 'ڇڏيو',
	passkeySetup: 'Passkey سيٽ ڪريو؟',
	passkeyAdd: 'Passkey شامل ڪريو',
	passkeyMaybeLater: 'ٿي سگهي ٿو بعد ۾',
	passkeySuccess: 'توهان وٽ passkey آهي!',

	errorInvalidEmail: 'مهرباني ڪري صحيح اي ميل ايڊريس داخل ڪريو.',
	errorGeneric: 'ڪجهه غلط ٿي ويو. مهرباني ڪري ٻيهر ڪوشش ڪريو.',
	errorResendFailed: 'ڪوڊ ٻيهر موڪلي نه سگهيو.',
	errorInvalidCode: 'غلط ڪوڊ. مهرباني ڪري ٻيهر ڪوشش ڪريو.',
	errorCodeExpired: 'ڪوڊ ختم ٿي ويو. مهرباني ڪري نئون ڪوڊ حاصل ڪريو.',
	errorTooManyAttempts: 'تمام گهڻيون ڪوششون. مهرباني ڪري نئون ڪوڊ حاصل ڪريو.',
	errorInvalidInput: 'غلط اِن پُٽ',
	errorNotAuthenticated: 'تصديق نه ٿيل',
	errorNotFound: 'نه مليو',
	errorAuthFailed: 'تصديق ناڪام',
	errorPasskeyRegFailed: 'Passkey رجسٽريشن ناڪام',
	errorPasskeyNotFound: 'Passkey نه مليو',
};

export default sd;
