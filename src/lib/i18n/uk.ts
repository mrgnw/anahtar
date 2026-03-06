// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const uk: AuthMessages = {
	emailPlaceholder: 'you@example.ua',
	continue: 'Продовжити',

	codeSentTo: 'Ми надіслали код на',
	verifying: 'Перевірка...',
	resend: 'Не отримали? Надіслати знову',
	differentEmail: 'Використати іншу пошту',

	passkeyCreating: 'Створюємо passkey',
	passkeySubtitle: 'для швидшого, легшого та безпечнішого входу',
	passkeyAdd: 'Додати passkey зараз',
	passkeyMaybeLater: 'Можливо, пізніше',
	passkeySuccess: 'Passkey готовий!',

	errorInvalidEmail: 'Введіть дійсну адресу електронної пошти.',
	errorGeneric: 'Щось пішло не так. Спробуйте ще раз.',
	errorResendFailed: 'Не вдалося повторно надіслати код.',
	errorInvalidCode: 'Недійсний код. Спробуйте ще раз.',
	errorCodeExpired: 'Термін дії коду закінчився. Запросіть новий.',
	errorTooManyAttempts: 'Забагато спроб. Запросіть новий код.',
	errorInvalidInput: 'Некоректні дані',
	errorNotAuthenticated: 'Не автентифіковано',
	errorNotFound: 'Не знайдено',
	errorAuthFailed: 'Автентифікація не вдалася',
	errorPasskeyRegFailed: 'Реєстрація passkey не вдалася',
	errorPasskeyNotFound: 'Passkey не знайдено',
};

export default uk;
