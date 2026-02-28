// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const he: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'המשך',

	codeSentTo: 'שלחנו קוד אל',
	verifying: 'מאמת...',
	resend: 'לא קיבלת? שלח שוב',
	differentEmail: 'שימוש בכתובת אחרת',

	passkeyCreating: 'יוצר לך passkey',
	passkeySubtitle: 'להתחברות קלה יותר',
	passkeySkip: 'דלג',
	passkeySetup: 'להגדיר passkey?',
	passkeyAdd: 'הוסף passkey',
	passkeyMaybeLater: 'אולי אחר כך',
	passkeySuccess: 'יש לך passkey!',

	errorInvalidEmail: 'נא להזין כתובת אימייל תקינה.',
	errorGeneric: 'משהו השתבש. נא לנסות שוב.',
	errorResendFailed: 'שליחת הקוד מחדש נכשלה.',
	errorInvalidCode: 'קוד שגוי. נא לנסות שוב.',
	errorCodeExpired: 'הקוד פג תוקף. נא לבקש קוד חדש.',
	errorTooManyAttempts: 'יותר מדי ניסיונות. נא לבקש קוד חדש.',
	errorInvalidInput: 'קלט לא תקין',
	errorNotAuthenticated: 'לא מחובר',
	errorNotFound: 'לא נמצא',
	errorAuthFailed: 'האימות נכשל',
	errorPasskeyRegFailed: 'רישום ה-passkey נכשל',
	errorPasskeyNotFound: 'passkey לא נמצא',
};

export default he;
