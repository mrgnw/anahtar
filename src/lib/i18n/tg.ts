// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const tg: AuthMessages = {
	emailPlaceholder: 'you@example.tj',
	continue: 'Идома додан',

	codeSentTo: 'Код фиристода шуд ба',
	verifying: 'Тасдиқ шуда истодааст...',
	resend: 'Нагирифтед? Аз нав фиристед',
	differentEmail: 'Почтаи дигар истифода баред',

	passkeyCreating: 'Passkey сохта истодааст',
	passkeySubtitle: 'барои вуруди осонтар',
	passkeySkip: 'Гузаштан',
	passkeySetup: 'Passkey танзим кунед?',
	passkeyAdd: 'Passkey илова кунед',
	passkeyMaybeLater: 'Шояд баъдтар',
	passkeySuccess: 'Шумо passkey доред!',

	errorInvalidEmail: 'Лутфан суроғаи дурусти почтаро ворид кунед.',
	errorGeneric: 'Хатогие рух дод. Лутфан аз нав кӯшиш кунед.',
	errorResendFailed: 'Аз нав фиристодани код нашуд.',
	errorInvalidCode: 'Коди нодуруст. Лутфан аз нав кӯшиш кунед.',
	errorCodeExpired: 'Мӯҳлати код гузашт. Коди нав дархост кунед.',
	errorTooManyAttempts: 'Кӯшишҳо аз ҳад зиёд. Коди нав дархост кунед.',
	errorInvalidInput: 'Маълумоти нодуруст',
	errorNotAuthenticated: 'Тасдиқ нашудааст',
	errorNotFound: 'Ёфт нашуд',
	errorAuthFailed: 'Тасдиқкунӣ нокому монд',
	errorPasskeyRegFailed: 'Сабти passkey нокому монд',
	errorPasskeyNotFound: 'Passkey ёфт нашуд',
};

export default tg;
