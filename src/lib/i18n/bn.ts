// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const bn: AuthMessages = {
	emailPlaceholder: 'you@example.com.bd',
	continue: 'এগিয়ে যান',

	codeSentTo: 'আমরা একটি কোড পাঠিয়েছি',
	verifying: 'যাচাই হচ্ছে...',
	resend: 'পাননি? আবার পাঠান',
	differentEmail: 'অন্য ইমেইল ব্যবহার করুন',

	passkeyCreating: 'আপনার জন্য passkey তৈরি হচ্ছে',
	passkeySubtitle: 'সহজে লগইনের জন্য',
	passkeySkip: 'এড়িয়ে যান',
	passkeySetup: 'Passkey তৈরি করবেন?',
	passkeyAdd: 'Passkey যোগ করুন',
	passkeyMaybeLater: 'পরে হবে',
	passkeySuccess: 'আপনার passkey তৈরি হয়ে গেছে!',

	errorInvalidEmail: 'অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।',
	errorGeneric: 'কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
	errorResendFailed: 'কোড পুনরায় পাঠানো যায়নি।',
	errorInvalidCode: 'ভুল কোড। অনুগ্রহ করে আবার চেষ্টা করুন।',
	errorCodeExpired: 'কোডের মেয়াদ শেষ। অনুগ্রহ করে নতুন কোড নিন।',
	errorTooManyAttempts: 'অনেকবার চেষ্টা হয়ে গেছে। অনুগ্রহ করে নতুন কোড নিন।',
	errorInvalidInput: 'অবৈধ ইনপুট',
	errorNotAuthenticated: 'প্রমাণীকৃত নয়',
	errorNotFound: 'পাওয়া যায়নি',
	errorAuthFailed: 'প্রমাণীকরণ ব্যর্থ',
	errorPasskeyRegFailed: 'Passkey নিবন্ধন ব্যর্থ',
	errorPasskeyNotFound: 'Passkey পাওয়া যায়নি',
};

export default bn;
