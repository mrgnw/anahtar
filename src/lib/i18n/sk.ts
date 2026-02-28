// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const sk: AuthMessages = {
	emailPlaceholder: 'vy@priklad.sk',
	continue: 'Pokracovat',

	codeSentTo: 'Poslali sme kod na',
	verifying: 'Overuje sa...',
	resend: 'Nedosli? Poslat znova',
	differentEmail: 'Pouzit iny e-mail',

	passkeyCreating: 'Vytvarame vam passkey',
	passkeySubtitle: 'pre jednoduchsie prihlasenie',
	passkeySkip: 'Preskocit',
	passkeySetup: 'Nastavit passkey?',
	passkeyAdd: 'Pridat passkey',
	passkeyMaybeLater: 'Mozno neskor',
	passkeySuccess: 'Vas passkey je pripraveny!',

	errorInvalidEmail: 'Zadajte platnu e-mailovu adresu.',
	errorGeneric: 'Nieco sa pokazilo. Skuste to znova.',
	errorResendFailed: 'Kod sa nepodarilo znova odoslat.',
	errorInvalidCode: 'Neplatny kod. Skuste to znova.',
	errorCodeExpired: 'Kod vyprsal. Poziadajte o novy.',
	errorTooManyAttempts: 'Prilis vela pokusov. Poziadajte o novy kod.',
	errorInvalidInput: 'Neplatny vstup',
	errorNotAuthenticated: 'Neprihlaseny',
	errorNotFound: 'Nenajdene',
	errorAuthFailed: 'Overenie zlyhalo',
	errorPasskeyRegFailed: 'Registracia passkey zlyhala',
	errorPasskeyNotFound: 'Passkey sa nenasiel',
};

export default sk;
