import type { AuthMessages } from './types.js';

const fr: AuthMessages = {
	emailPlaceholder: 'vous@exemple.fr',
	continue: 'Continuer',

	codeSentTo: 'Nous avons envoye un code a',
	verifying: 'Verification...',
	resend: 'Pas recu ? Renvoyer',
	differentEmail: 'Utiliser un autre e-mail',

	passkeyCreating: 'Creation de votre passkey',
	passkeySubtitle: 'pour une connexion plus rapide, facile et securisee',
	passkeyAdd: 'Ajouter un passkey maintenant',
	passkeyMaybeLater: 'Plus tard',
	passkeySuccess: 'Votre passkey est pret !',

	errorInvalidEmail: 'Veuillez entrer une adresse e-mail valide.',
	errorGeneric: 'Une erreur est survenue. Veuillez reessayer.',
	errorResendFailed: "Echec de l'envoi du code.",
	errorInvalidCode: 'Code invalide. Veuillez reessayer.',
	errorCodeExpired: 'Code expire. Veuillez en demander un nouveau.',
	errorTooManyAttempts: 'Trop de tentatives. Veuillez demander un nouveau code.',
	errorInvalidInput: 'Entree invalide',
	errorNotAuthenticated: 'Non authentifie',
	errorNotFound: 'Non trouve',
	errorAuthFailed: "Echec de l'authentification",
	errorPasskeyRegFailed: "Echec de l'enregistrement du passkey",
	errorPasskeyNotFound: 'Passkey introuvable',
};

export default fr;
