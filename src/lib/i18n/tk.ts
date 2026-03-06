// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const tk: AuthMessages = {
	emailPlaceholder: 'siz@mysal.tm',
	continue: 'Dowam et',

	codeSentTo: 'Kod iberildi:',
	verifying: 'Barlanýar...',
	resend: 'Gelmedi? Täzeden iber',
	differentEmail: 'Başga e-poçta ulan',

	passkeyCreating: 'Passkey döredilýär',
	passkeySubtitle: 'has calt, ansat we howpsuz giris ucin',
	passkeyAdd: 'Hadzir passkey gos',
	passkeyMaybeLater: 'Belki soň',
	passkeySuccess: 'Passkey taýýar!',

	errorInvalidEmail: 'Dogry e-poçta salgysyny giriziň.',
	errorGeneric: 'Näsazlyk ýüze çykdy. Gaýtadan synanyşyň.',
	errorResendFailed: 'Kody täzeden iberip bolmady.',
	errorInvalidCode: 'Nädogry kod. Gaýtadan synanyşyň.',
	errorCodeExpired: 'Koduň möhleti gutardy. Täze kod soraň.',
	errorTooManyAttempts: 'Synanyşyk köp boldy. Täze kod soraň.',
	errorInvalidInput: 'Nädogry maglumat',
	errorNotAuthenticated: 'Tassyklanmadyk',
	errorNotFound: 'Tapylmady',
	errorAuthFailed: 'Tassyklama şowsuz boldy',
	errorPasskeyRegFailed: 'Passkey hasaba alyş şowsuz boldy',
	errorPasskeyNotFound: 'Passkey tapylmady',
};

export default tk;
