// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const kk: AuthMessages = {
	emailPlaceholder: 'you@example.kz',
	continue: 'Жалғастыру',

	codeSentTo: 'Код жіберілді:',
	verifying: 'Тексерілуде...',
	resend: 'Алмадыңыз ба? Қайта жіберу',
	differentEmail: 'Басқа электрондық пошта',

	passkeyCreating: 'Passkey жасалуда',
	passkeySubtitle: 'тезірек, оңайырақ, қауіпсіздеу кіру үшін',
	passkeyAdd: 'Қазір passkey қосу',
	passkeyMaybeLater: 'Кейінірек',
	passkeySuccess: 'Passkey дайын!',

	errorInvalidEmail: 'Жарамды электрондық пошта мекенжайын енгізіңіз.',
	errorGeneric: 'Бір нәрсе дұрыс болмады. Қайтадан көріңіз.',
	errorResendFailed: 'Кодты қайта жіберу сәтсіз аяқталды.',
	errorInvalidCode: 'Код жарамсыз. Қайтадан көріңіз.',
	errorCodeExpired: 'Кодтың мерзімі аяқталды. Жаңасын сұраңыз.',
	errorTooManyAttempts: 'Тым көп әрекет. Жаңа код сұраңыз.',
	errorInvalidInput: 'Жарамсыз енгізу',
	errorNotAuthenticated: 'Аутентификация жасалмаған',
	errorNotFound: 'Табылмады',
	errorAuthFailed: 'Аутентификация сәтсіз',
	errorPasskeyRegFailed: 'Passkey тіркеу сәтсіз аяқталды',
	errorPasskeyNotFound: 'Passkey табылмады',
};

export default kk;
