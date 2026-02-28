// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const el: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'Συνέχεια',

	codeSentTo: 'Στείλαμε κωδικό στο',
	verifying: 'Επαλήθευση...',
	resend: 'Δεν το έλαβες; Επανάληψη αποστολής',
	differentEmail: 'Χρήση διαφορετικού email',

	passkeyCreating: 'Δημιουργία passkey',
	passkeySubtitle: 'για ευκολότερη σύνδεση',
	passkeySkip: 'Παράλειψη',
	passkeySetup: 'Ρύθμιση passkey;',
	passkeyAdd: 'Προσθήκη passkey',
	passkeyMaybeLater: 'Ίσως αργότερα',
	passkeySuccess: 'Το passkey σου είναι έτοιμο!',

	errorInvalidEmail: 'Εισάγετε μια έγκυρη διεύθυνση email.',
	errorGeneric: 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.',
	errorResendFailed: 'Η επανάληψη αποστολής απέτυχε.',
	errorInvalidCode: 'Μη έγκυρος κωδικός. Δοκιμάστε ξανά.',
	errorCodeExpired: 'Ο κωδικός έληξε. Ζητήστε νέο.',
	errorTooManyAttempts: 'Πολλές προσπάθειες. Ζητήστε νέο κωδικό.',
	errorInvalidInput: 'Μη έγκυρη εισαγωγή',
	errorNotAuthenticated: 'Χωρίς ταυτοποίηση',
	errorNotFound: 'Δεν βρέθηκε',
	errorAuthFailed: 'Η ταυτοποίηση απέτυχε',
	errorPasskeyRegFailed: 'Η εγγραφή passkey απέτυχε',
	errorPasskeyNotFound: 'Δεν βρέθηκε passkey',
};

export default el;
