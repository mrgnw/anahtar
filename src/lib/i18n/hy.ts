// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const hy: AuthMessages = {
	emailPlaceholder: 'you@example.am',
	continue: 'Շարունակել',

	codeSentTo: 'Մենք կոդ ուղարկեցինք',
	verifying: 'Ստուգում ենք…',
	resend: 'Չստացա՞ք։ Նորից ուղարկել',
	differentEmail: 'Օգտագործել այլ էլ. հասցե',

	passkeyCreating: 'Passkey ենք ստեղծում ձեզ համար',
	passkeySubtitle: 'ավելի հեշտ մուտքի համար',
	passkeySkip: 'Բաց թողնել',
	passkeySetup: 'Կարգավորե՞լ passkey՝',
	passkeyAdd: 'Ավելացնել passkey',
	passkeyMaybeLater: 'Գուցե ավելի ուշ',
	passkeySuccess: 'Դուք ունեք passkey։',

	errorInvalidEmail: 'Խնդրում ենք՝ մուտքագրեք վավեր էլ. հասցե։',
	errorGeneric: 'Ինչ-որ սխալ անցավ։ Խնդրում ենք՝ կրկին փորձեք։',
	errorResendFailed: 'Կոդի կրկին ուղարկումը ձախողվեց։',
	errorInvalidCode: 'Սխալ կոդ։ Խնդրում ենք՝ կրկին փորձեք։',
	errorCodeExpired: 'Կոդը ժամկետն անցել է։ Խնդրում ենք՝ նորը հայցեք։',
	errorTooManyAttempts: 'Չափազանց շատ փորձեր։ Խնդրում ենք՝ նոր կոդ հայցեք։',
	errorInvalidInput: 'Սխալ մուտքագրում',
	errorNotAuthenticated: 'Չվավերացված',
	errorNotFound: 'Չի գտնվել',
	errorAuthFailed: 'Նույնականացումը ձախողվեց',
	errorPasskeyRegFailed: 'Passkey-ի գրանցումը ձախողվեց',
	errorPasskeyNotFound: 'Passkey-ը չի գտնվել',
};

export default hy;
