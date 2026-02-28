// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const st: AuthMessages = {
	emailPlaceholder: 'uena@mohlala.co.za',
	continue: 'Tswela pele',

	codeSentTo: 'Re romeletse khoutu ho',
	verifying: 'Re a netefatsa...',
	resend: 'Ha u e fumana? Romela hape',
	differentEmail: 'Sebelisa imeile e fapaneng',

	passkeyCreating: 'Re o etsetsa passkey',
	passkeySubtitle: 'bakeng sa ho kena ha bonolo',
	passkeySkip: 'Tlola',
	passkeySetup: 'Beha passkey?',
	passkeyAdd: 'Kenya passkey',
	passkeyMaybeLater: 'Mohlomong hamorao',
	passkeySuccess: 'O na le passkey!',

	errorInvalidEmail: 'Ka kopo kenya aterese ea imeile e nepahetseng.',
	errorGeneric: 'Ho na le bothata. Ka kopo leka hape.',
	errorResendFailed: 'Ho romela khoutu hape ho hlolehile.',
	errorInvalidCode: 'Khoutu e fosahetseng. Ka kopo leka hape.',
	errorCodeExpired: 'Khoutu e feletsoe ke nako. Ka kopo kopa e ncha.',
	errorTooManyAttempts: 'Meleko e mengata haholo. Ka kopo kopa khoutu e ncha.',
	errorInvalidInput: 'Tlhahiso e fosahetseng',
	errorNotAuthenticated: 'Ha u netefatsoa',
	errorNotFound: 'Ha e fumanehe',
	errorAuthFailed: 'Netefatso e hlolehile',
	errorPasskeyRegFailed: 'Ngoliso ea passkey e hlolehile',
	errorPasskeyNotFound: 'Passkey ha e fumanehe',
};

export default st;
