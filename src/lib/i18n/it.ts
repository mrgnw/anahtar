// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const it: AuthMessages = {
	emailPlaceholder: 'tu@esempio.it',
	continue: 'Continua',

	codeSentTo: 'Abbiamo inviato un codice a',
	verifying: 'Verifica in corso...',
	resend: 'Non ricevuto? Invia di nuovo',
	differentEmail: "Usa un'altra email",

	passkeyCreating: 'Creazione della passkey',
	passkeySubtitle: 'per accedere più facilmente',
	passkeySkip: 'Salta',
	passkeySetup: 'Configurare una passkey?',
	passkeyAdd: 'Aggiungi passkey',
	passkeyMaybeLater: 'Forse più tardi',
	passkeySuccess: 'Passkey configurata!',

	errorInvalidEmail: 'Inserisci un indirizzo email valido.',
	errorGeneric: 'Qualcosa è andato storto. Riprova.',
	errorResendFailed: 'Invio del codice non riuscito.',
	errorInvalidCode: 'Codice non valido. Riprova.',
	errorCodeExpired: 'Codice scaduto. Richiedine uno nuovo.',
	errorTooManyAttempts: 'Troppi tentativi. Richiedi un nuovo codice.',
	errorInvalidInput: 'Input non valido',
	errorNotAuthenticated: 'Non autenticato',
	errorNotFound: 'Non trovato',
	errorAuthFailed: 'Autenticazione fallita',
	errorPasskeyRegFailed: 'Registrazione passkey fallita',
	errorPasskeyNotFound: 'Passkey non trovata',
};

export default it;
