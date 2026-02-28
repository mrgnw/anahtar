import type { AuthMessages } from './types.js';

const pt: AuthMessages = {
	emailPlaceholder: 'voce@exemplo.com',
	continue: 'Continuar',

	codeSentTo: 'Enviamos um codigo para',
	verifying: 'Verificando...',
	resend: 'Nao recebeu? Reenviar',
	differentEmail: 'Usar outro e-mail',

	passkeyCreating: 'Criando sua passkey',
	passkeySubtitle: 'para login mais facil',
	passkeySkip: 'Pular',
	passkeySetup: 'Configurar passkey?',
	passkeyAdd: 'Adicionar passkey',
	passkeyMaybeLater: 'Talvez depois',
	passkeySuccess: 'Sua passkey esta pronta!',

	errorInvalidEmail: 'Digite um endereco de e-mail valido.',
	errorGeneric: 'Algo deu errado. Tente novamente.',
	errorResendFailed: 'Falha ao reenviar o codigo.',
	errorInvalidCode: 'Codigo invalido. Tente novamente.',
	errorCodeExpired: 'Codigo expirado. Solicite um novo.',
	errorTooManyAttempts: 'Muitas tentativas. Solicite um novo codigo.',
	errorInvalidInput: 'Entrada invalida',
	errorNotAuthenticated: 'Nao autenticado',
	errorNotFound: 'Nao encontrado',
	errorAuthFailed: 'Falha na autenticacao',
	errorPasskeyRegFailed: 'Falha no registro da passkey',
	errorPasskeyNotFound: 'Passkey nao encontrada',
};

export default pt;
