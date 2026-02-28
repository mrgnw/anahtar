// Initial translation — review for accuracy
import type { AuthMessages } from './types.js';

const pl: AuthMessages = {
	emailPlaceholder: 'ty@przyklad.pl',
	continue: 'Dalej',

	codeSentTo: 'Wysłaliśmy kod na',
	verifying: 'Weryfikacja...',
	resend: 'Nie dotarł? Wyślij ponownie',
	differentEmail: 'Użyj innego emaila',

	passkeyCreating: 'Tworzenie klucza dostępu',
	passkeySubtitle: 'aby łatwiej się logować',
	passkeySkip: 'Pomiń',
	passkeySetup: 'Skonfigurować klucz dostępu?',
	passkeyAdd: 'Dodaj klucz dostępu',
	passkeyMaybeLater: 'Może później',
	passkeySuccess: 'Masz klucz dostępu!',

	errorInvalidEmail: 'Podaj prawidłowy adres email.',
	errorGeneric: 'Coś poszło nie tak. Spróbuj ponownie.',
	errorResendFailed: 'Nie udało się wysłać kodu ponownie.',
	errorInvalidCode: 'Nieprawidłowy kod. Spróbuj ponownie.',
	errorCodeExpired: 'Kod wygasł. Poproś o nowy.',
	errorTooManyAttempts: 'Zbyt wiele prób. Poproś o nowy kod.',
	errorInvalidInput: 'Nieprawidłowe dane',
	errorNotAuthenticated: 'Nie uwierzytelniono',
	errorNotFound: 'Nie znaleziono',
	errorAuthFailed: 'Uwierzytelnianie nie powiodło się',
	errorPasskeyRegFailed: 'Rejestracja klucza dostępu nie powiodła się',
	errorPasskeyNotFound: 'Nie znaleziono klucza dostępu',
};

export default pl;
