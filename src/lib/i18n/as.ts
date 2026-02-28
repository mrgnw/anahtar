// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const assamese: AuthMessages = {
	emailPlaceholder: 'you@example.in',
	continue: 'আগবাঢ়ক',

	codeSentTo: 'কোড পঠোৱা হৈছে:',
	verifying: 'পৰীক্ষা কৰি আছে...',
	resend: 'পোৱা নাই? পুনৰ পঠাওক',
	differentEmail: 'বেলেগ ইমেইল ব্যৱহাৰ কৰক',

	passkeyCreating: 'Passkey তৈয়াৰ কৰি আছে',
	passkeySubtitle: 'সহজে লগ ইনৰ বাবে',
	passkeySkip: 'এৰক',
	passkeySetup: 'Passkey ছেট আপ কৰিবনে?',
	passkeyAdd: 'Passkey যোগ কৰক',
	passkeyMaybeLater: 'পিছত হ\'ব',
	passkeySuccess: 'আপোনাৰ passkey সাজু!',

	errorInvalidEmail: 'অনুগ্ৰহ কৰি এটা সঠিক ইমেইল ঠিকনা দিয়ক।',
	errorGeneric: 'কিবা ভুল হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
	errorResendFailed: 'কোড পুনৰ পঠাব পৰা নগ\'ল।',
	errorInvalidCode: 'ভুল কোড। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
	errorCodeExpired: 'কোডৰ সময়সীমা শেষ। নতুন কোড বিচাৰক।',
	errorTooManyAttempts: 'বহুত বেছি চেষ্টা হৈছে। নতুন কোড বিচাৰক।',
	errorInvalidInput: 'অবৈধ ইনপুট',
	errorNotAuthenticated: 'প্ৰমাণীকৃত নহয়',
	errorNotFound: 'পোৱা নগ\'ল',
	errorAuthFailed: 'প্ৰমাণীকৰণ বিফল',
	errorPasskeyRegFailed: 'Passkey পঞ্জীয়ন বিফল',
	errorPasskeyNotFound: 'Passkey পোৱা নগ\'ল',
};

export default assamese;
