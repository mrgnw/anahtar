// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const bg: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'Напред',

	codeSentTo: 'Изпратихме код на',
	verifying: 'Проверява се...',
	resend: 'Не получихте? Изпрати отново',
	differentEmail: 'Използвай друг имейл',

	passkeyCreating: 'Създаваме ви passkey',
	passkeySubtitle: 'за по-лесно влизане',
	passkeySkip: 'Пропусни',
	passkeySetup: 'Да настроим passkey?',
	passkeyAdd: 'Добави passkey',
	passkeyMaybeLater: 'По-късно',
	passkeySuccess: 'Вашият passkey е готов!',

	errorInvalidEmail: 'Моля, въведете валиден имейл адрес.',
	errorGeneric: 'Нещо се обърка. Моля, опитайте отново.',
	errorResendFailed: 'Кодът не можа да бъде изпратен отново.',
	errorInvalidCode: 'Невалиден код. Моля, опитайте отново.',
	errorCodeExpired: 'Кодът е изтекъл. Моля, поискайте нов.',
	errorTooManyAttempts: 'Твърде много опити. Моля, поискайте нов код.',
	errorInvalidInput: 'Невалиден вход',
	errorNotAuthenticated: 'Не сте удостоверени',
	errorNotFound: 'Не е намерено',
	errorAuthFailed: 'Удостоверяването не успя',
	errorPasskeyRegFailed: 'Регистрацията на passkey не успя',
	errorPasskeyNotFound: 'Passkey не е намерен',
};

export default bg;
