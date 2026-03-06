// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const be: AuthMessages = {
	emailPlaceholder: 'you@example.by',
	continue: 'Працягнуць',

	codeSentTo: 'Мы адправілі код на',
	verifying: 'Правяраем…',
	resend: 'Не атрымалі? Адправіць зноў',
	differentEmail: 'Выкарыстаць іншы email',

	passkeyCreating: 'Ствараем вам passkey',
	passkeySubtitle: 'для хутчэйшага, прасцейшага, бяспечнейшага ўваходу',
	passkeyAdd: 'Дадаць passkey зараз',
	passkeyMaybeLater: 'Можа, пазней',
	passkeySuccess: 'У вас ёсць passkey!',

	errorInvalidEmail: 'Калі ласка, увядзіце сапраўдны адрас электроннай пошты.',
	errorGeneric: 'Нешта пайшло не так. Калі ласка, паспрабуйце зноў.',
	errorResendFailed: 'Не ўдалося адправіць код паўторна.',
	errorInvalidCode: 'Няправільны код. Калі ласка, паспрабуйце зноў.',
	errorCodeExpired: 'Код скончыўся. Калі ласка, запытайце новы.',
	errorTooManyAttempts: 'Занадта шмат спроб. Калі ласка, запытайце новы код.',
	errorInvalidInput: 'Няправільныя даныя',
	errorNotAuthenticated: 'Не аўтэнтыфікавана',
	errorNotFound: 'Не знойдзена',
	errorAuthFailed: 'Аўтэнтыфікацыя не ўдалася',
	errorPasskeyRegFailed: 'Рэгістрацыя passkey не ўдалася',
	errorPasskeyNotFound: 'Passkey не знойдзены',
};

export default be;
