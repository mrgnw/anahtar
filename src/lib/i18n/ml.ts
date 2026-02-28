// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ml: AuthMessages = {
	emailPlaceholder: 'you@example.in',
	continue: 'തുടരുക',

	codeSentTo: 'ഞങ്ങൾ ഒരു കോഡ് അയച്ചു',
	verifying: 'പരിശോധിക്കുന്നു...',
	resend: 'ലഭിച്ചില്ലേ? വീണ്ടും അയയ്ക്കുക',
	differentEmail: 'മറ്റൊരു ഇമെയിൽ ഉപയോഗിക്കുക',

	passkeyCreating: 'നിങ്ങൾക്കായി ഒരു passkey ഉണ്ടാക്കുന്നു',
	passkeySubtitle: 'എളുപ്പത്തിൽ ലോഗിൻ ചെയ്യാൻ',
	passkeySkip: 'ഒഴിവാക്കുക',
	passkeySetup: 'Passkey സജ്ജീകരിക്കണോ?',
	passkeyAdd: 'Passkey ചേർക്കുക',
	passkeyMaybeLater: 'പിന്നീടാകാം',
	passkeySuccess: 'നിങ്ങളുടെ passkey തയ്യാറാണ്!',

	errorInvalidEmail: 'ശരിയായ ഇമെയിൽ വിലാസം നൽകുക.',
	errorGeneric: 'എന്തോ കുഴപ്പം സംഭവിച്ചു. വീണ്ടും ശ്രമിക്കുക.',
	errorResendFailed: 'കോഡ് വീണ്ടും അയയ്ക്കാനായില്ല.',
	errorInvalidCode: 'തെറ്റായ കോഡ്. വീണ്ടും ശ്രമിക്കുക.',
	errorCodeExpired: 'കോഡിന്റെ കാലാവധി കഴിഞ്ഞു. പുതിയ കോഡ് അഭ്യർത്ഥിക്കുക.',
	errorTooManyAttempts: 'വളരെയധികം ശ്രമങ്ങൾ. പുതിയ കോഡ് അഭ്യർത്ഥിക്കുക.',
	errorInvalidInput: 'അസാധുവായ ഇൻപുട്ട്',
	errorNotAuthenticated: 'ആധികാരികമാക്കിയിട്ടില്ല',
	errorNotFound: 'കണ്ടെത്താനായില്ല',
	errorAuthFailed: 'ആധികാരികത പരിശോധന പരാജയപ്പെട്ടു',
	errorPasskeyRegFailed: 'Passkey രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു',
	errorPasskeyNotFound: 'Passkey കണ്ടെത്താനായില്ല',
};

export default ml;
