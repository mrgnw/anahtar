// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const te: AuthMessages = {
	emailPlaceholder: 'you@example.com',
	continue: 'కొనసాగించు',

	codeSentTo: 'మేము ఒక కోడ్ పంపాము',
	verifying: 'ధృవీకరిస్తోంది...',
	resend: 'రాలేదా? మళ్ళీ పంపు',
	differentEmail: 'వేరే ఇమెయిల్ వాడు',

	passkeyCreating: 'మీ కోసం passkey తయారు చేస్తోంది',
	passkeySubtitle: 'సులభంగా లాగిన్ అవడానికి',
	passkeySkip: 'దాటవేయి',
	passkeySetup: 'Passkey ఏర్పాటు చేయాలా?',
	passkeyAdd: 'Passkey జోడించు',
	passkeyMaybeLater: 'తర్వాత',
	passkeySuccess: 'మీ passkey సిద్ధంగా ఉంది!',

	errorInvalidEmail: 'దయచేసి చెల్లుబాటు అయ్యే ఇమెయిల్ చిరునామా నమోదు చేయండి.',
	errorGeneric: 'ఏదో తేడా జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.',
	errorResendFailed: 'కోడ్ మళ్ళీ పంపడం విఫలమైంది.',
	errorInvalidCode: 'తప్పు కోడ్. దయచేసి మళ్ళీ ప్రయత్నించండి.',
	errorCodeExpired: 'కోడ్ గడువు తీరింది. దయచేసి కొత్తది అభ్యర్థించండి.',
	errorTooManyAttempts: 'చాలా ఎక్కువ ప్రయత్నాలు. దయచేసి కొత్త కోడ్ అభ్యర్థించండి.',
	errorInvalidInput: 'చెల్లని ఇన్‌పుట్',
	errorNotAuthenticated: 'ప్రమాణీకరించబడలేదు',
	errorNotFound: 'కనుగొనబడలేదు',
	errorAuthFailed: 'ప్రమాణీకరణ విఫలమైంది',
	errorPasskeyRegFailed: 'Passkey నమోదు విఫలమైంది',
	errorPasskeyNotFound: 'Passkey కనుగొనబడలేదు',
};

export default te;
