// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const ts: AuthMessages = {
	emailPlaceholder: 'wena@xikombiso.co.za',
	continue: 'Ya emahlweni',

	codeSentTo: 'Hi rhumele khodi eka',
	verifying: 'Ya kambisisa...',
	resend: 'A yi kumanga? Rhumela nakambe',
	differentEmail: 'Tirhisa imeyili yin\'wana',

	passkeyCreating: 'Ya endla passkey',
	passkeySubtitle: 'ku nghena hi ku hatlisa, ku olova, ni ku hlayiseka',
	passkeyAdd: 'Engetela passkey sweswi',
	passkeyMaybeLater: 'Kumbexana endzhaku',
	passkeySuccess: 'U na passkey!',

	errorInvalidEmail: 'Nghenisa adirese ya imeyili leyi faneleke.',
	errorGeneric: 'Xin\'wana xi tsandzekile. Ringeta nakambe.',
	errorResendFailed: 'Ku rhumela khodi nakambe ku tsandzekile.',
	errorInvalidCode: 'Khodi leyi nga riki yona. Ringeta nakambe.',
	errorCodeExpired: 'Khodi yi herile. Kombela khodi leyintshwa.',
	errorTooManyAttempts: 'Minringeto yo tala. Kombela khodi leyintshwa.',
	errorInvalidInput: 'Ngheniso leyi nga riki yona',
	errorNotAuthenticated: 'A wu tiyisekiwanga',
	errorNotFound: 'A yi kumekanga',
	errorAuthFailed: 'Ku tiyiseka ku tsandzekile',
	errorPasskeyRegFailed: 'Ku tsarisa passkey ku tsandzekile',
	errorPasskeyNotFound: 'Passkey a yi kumekanga',
};

export default ts;
