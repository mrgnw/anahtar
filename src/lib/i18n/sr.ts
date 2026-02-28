// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const sr: AuthMessages = {
	emailPlaceholder: 'you@example.rs',
	continue: 'Настави',

	codeSentTo: 'Послали смо код на',
	verifying: 'Проверавамо...',
	resend: 'Нисте добили? Пошаљи поново',
	differentEmail: 'Користи другу е-пошту',

	passkeyCreating: 'Правимо вам passkey',
	passkeySubtitle: 'за лакшу пријаву',
	passkeySkip: 'Прескочи',
	passkeySetup: 'Подесити passkey?',
	passkeyAdd: 'Додај passkey',
	passkeyMaybeLater: 'Можда касније',
	passkeySuccess: 'Имате passkey!',

	errorInvalidEmail: 'Унесите исправну е-адресу.',
	errorGeneric: 'Нешто није у реду. Покушајте поново.',
	errorResendFailed: 'Слање кода није успело.',
	errorInvalidCode: 'Неисправан код. Покушајте поново.',
	errorCodeExpired: 'Код је истекао. Затражите нови.',
	errorTooManyAttempts: 'Превише покушаја. Затражите нови код.',
	errorInvalidInput: 'Неисправан унос',
	errorNotAuthenticated: 'Нисте пријављени',
	errorNotFound: 'Није пронађено',
	errorAuthFailed: 'Пријава није успела',
	errorPasskeyRegFailed: 'Регистрација passkey-а није успела',
	errorPasskeyNotFound: 'Passkey није пронађен',
};

export default sr;
