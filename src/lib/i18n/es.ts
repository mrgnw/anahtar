import type { AuthMessages } from './types.js';

const es: AuthMessages = {
	emailPlaceholder: 'tu@ejemplo.com',
	continue: 'Continuar',

	codeSentTo: 'Enviamos un codigo a',
	verifying: 'Verificando...',
	resend: 'No lo recibiste? Reenviar',
	differentEmail: 'Usar otro correo',

	passkeyCreating: 'Creando tu passkey',
	passkeySubtitle: 'para iniciar sesion mas facil',
	passkeySkip: 'Omitir',
	passkeySetup: 'Configurar passkey?',
	passkeyAdd: 'Agregar passkey',
	passkeyMaybeLater: 'Quiza despues',
	passkeySuccess: 'Ya tienes tu passkey!',

	errorInvalidEmail: 'Ingresa un correo electronico valido.',
	errorGeneric: 'Algo salio mal. Intenta de nuevo.',
	errorResendFailed: 'No se pudo reenviar el codigo.',
	errorInvalidCode: 'Codigo invalido. Intenta de nuevo.',
	errorCodeExpired: 'El codigo expiro. Solicita uno nuevo.',
	errorTooManyAttempts: 'Demasiados intentos. Solicita un nuevo codigo.',
	errorInvalidInput: 'Entrada invalida',
	errorNotAuthenticated: 'No autenticado',
	errorNotFound: 'No encontrado',
	errorAuthFailed: 'Fallo la autenticacion',
	errorPasskeyRegFailed: 'Fallo el registro del passkey',
	errorPasskeyNotFound: 'Passkey no encontrado',
};

export default es;
