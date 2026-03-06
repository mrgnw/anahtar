// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ru: AuthMessages = {
	emailPlaceholder: 'you@example.ru',
	continue: 'Продолжить',

	codeSentTo: 'Мы отправили код на',
	verifying: 'Проверяем...',
	resend: 'Не пришёл? Отправить ещё раз',
	differentEmail: 'Использовать другой email',

	passkeyCreating: 'Создаём passkey',
	passkeySubtitle: 'для более быстрого, простого и безопасного входа',
	passkeyAdd: 'Добавить passkey сейчас',
	passkeyMaybeLater: 'Позже',
	passkeySuccess: 'Passkey готов!',

	errorInvalidEmail: 'Введите корректный адрес электронной почты.',
	errorGeneric: 'Что-то пошло не так. Попробуйте ещё раз.',
	errorResendFailed: 'Не удалось отправить код повторно.',
	errorInvalidCode: 'Неверный код. Попробуйте ещё раз.',
	errorCodeExpired: 'Срок действия кода истёк. Запросите новый.',
	errorTooManyAttempts: 'Слишком много попыток. Запросите новый код.',
	errorInvalidInput: 'Некорректные данные',
	errorNotAuthenticated: 'Не авторизован',
	errorNotFound: 'Не найдено',
	errorAuthFailed: 'Ошибка аутентификации',
	errorPasskeyRegFailed: 'Не удалось зарегистрировать passkey',
	errorPasskeyNotFound: 'Passkey не найден',
};

export default ru;
