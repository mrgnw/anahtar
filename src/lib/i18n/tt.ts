// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const tt: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'Дәвам итү',

	codeSentTo: 'Без код җибәрдек',
	verifying: 'Тикшерәбез...',
	resend: 'Килмәдеме? Яңадан җибәрү',
	differentEmail: 'Башка эл. почта кулланыгыз',

	passkeyCreating: 'Сезгә passkey ясыйбыз',
	passkeySubtitle: 'җиңелрәк керү өчен',
	passkeySkip: 'Калдыру',
	passkeySetup: 'Passkey урнаштыруны телисезме?',
	passkeyAdd: 'Passkey өстәү',
	passkeyMaybeLater: 'Соңрак булыр',
	passkeySuccess: 'Сездә passkey бар!',

	errorInvalidEmail: 'Зинһар, дөрес эл. почта адресын языгыз.',
	errorGeneric: 'Нидер хата булды. Зинһар, яңадан тырышыгыз.',
	errorResendFailed: 'Кодны яңадан җибәреп булмады.',
	errorInvalidCode: 'Ялгыш код. Зинһар, яңадан тырышыгыз.',
	errorCodeExpired: 'Код вакыты үтте. Зинһар, яңа код сорагыз.',
	errorTooManyAttempts: 'Бик күп тырышу. Зинһар, яңа код сорагыз.',
	errorInvalidInput: 'Ялгыш кертү',
	errorNotAuthenticated: 'Танылмаган',
	errorNotFound: 'Табылмады',
	errorAuthFailed: 'Танылу уңышсыз',
	errorPasskeyRegFailed: 'Passkey теркәлүе уңышсыз',
	errorPasskeyNotFound: 'Passkey табылмады',
};

export default tt;
