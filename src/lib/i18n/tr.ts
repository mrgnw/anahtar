import type { AuthMessages } from './types.js';

const tr: AuthMessages = {
	emailPlaceholder: 'sen@ornek.com',
	continue: 'Devam',

	codeSentTo: 'Kod gonderildi:',
	verifying: 'Dogrulanıyor...',
	resend: 'Almadın mı? Tekrar gonder',
	differentEmail: 'Baska e-posta kullan',

	passkeyCreating: 'Anahtar olusturuluyor',
	passkeySubtitle: 'daha kolay giris icin',
	passkeySkip: 'Atla',
	passkeySetup: 'Anahtar olustur?',
	passkeyAdd: 'Anahtar ekle',
	passkeyMaybeLater: 'Belki sonra',
	passkeySuccess: 'Anahtarın hazır!',

	errorInvalidEmail: 'Gecerli bir e-posta adresi girin.',
	errorGeneric: 'Bir hata olustu. Lutfen tekrar deneyin.',
	errorResendFailed: 'Kod tekrar gonderilemedi.',
	errorInvalidCode: 'Gecersiz kod. Lutfen tekrar deneyin.',
	errorCodeExpired: 'Kodun suresi doldu. Yeni bir kod isteyin.',
	errorTooManyAttempts: 'Cok fazla deneme. Yeni bir kod isteyin.',
	errorInvalidInput: 'Gecersiz giris',
	errorNotAuthenticated: 'Kimlik dogrulanmadı',
	errorNotFound: 'Bulunamadı',
	errorAuthFailed: 'Kimlik dogrulama basarısız',
	errorPasskeyRegFailed: 'Anahtar kaydı basarısız',
	errorPasskeyNotFound: 'Anahtar bulunamadı',
};

export default tr;
