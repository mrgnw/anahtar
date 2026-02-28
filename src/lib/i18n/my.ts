// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const my: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'ဆက်လက်ရန်',

	codeSentTo: 'ကုဒ်တစ်ခု ပို့ပြီးပါပြီ',
	verifying: 'အတည်ပြုနေသည်...',
	resend: 'မရရှိဘူးလား? ပြန်ပို့ရန်',
	differentEmail: 'အခြားအီးမေးလ် သုံးရန်',

	passkeyCreating: 'သင့်အတွက် passkey ပြုလုပ်နေသည်',
	passkeySubtitle: 'လွယ်ကူစွာ ဝင်ရောက်ရန်',
	passkeySkip: 'ကျော်ရန်',
	passkeySetup: 'Passkey ထည့်သွင်းမလား?',
	passkeyAdd: 'Passkey ထည့်ရန်',
	passkeyMaybeLater: 'နောက်မှပါ',
	passkeySuccess: 'သင့်မှာ passkey ရှိပါပြီ!',

	errorInvalidEmail: 'မှန်ကန်သော အီးမေးလ်လိပ်စာ ထည့်ပါ။',
	errorGeneric: 'တစ်ခုခု မှားသွားပါသည်။ ထပ်ကြိုးစားပါ။',
	errorResendFailed: 'ကုဒ် ပြန်ပို့၍ မရပါ။',
	errorInvalidCode: 'ကုဒ် မှားနေပါသည်။ ထပ်ကြိုးစားပါ။',
	errorCodeExpired: 'ကုဒ် သက်တမ်းကုန်သွားပါပြီ။ ကုဒ်အသစ် တောင်းပါ။',
	errorTooManyAttempts: 'ကြိုးစားမှု များလွန်းပါပြီ။ ကုဒ်အသစ် တောင်းပါ။',
	errorInvalidInput: 'မမှန်ကန်သော ထည့်သွင်းမှု',
	errorNotAuthenticated: 'အတည်ပြုထားခြင်း မရှိပါ',
	errorNotFound: 'ရှာမတွေ့ပါ',
	errorAuthFailed: 'အတည်ပြုခြင်း မအောင်မြင်ပါ',
	errorPasskeyRegFailed: 'Passkey မှတ်ပုံတင်ခြင်း မအောင်မြင်ပါ',
	errorPasskeyNotFound: 'Passkey ရှာမတွေ့ပါ',
};

export default my;
