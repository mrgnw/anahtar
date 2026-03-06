export interface AuthMessages {
  // Email step
  emailPlaceholder: string;
  continue: string;

  // OTP step
  codeSentTo: string;
  verifying: string;
  resend: string;
  differentEmail: string;

  // Passkey prompt
  passkeyCreating: string;
  passkeySubtitle: string;
  passkeyAdd: string;
  passkeyMaybeLater: string;
  passkeySuccess: string;

  // Errors (shown in UI and/or returned from server)
  errorInvalidEmail: string;
  errorGeneric: string;
  errorResendFailed: string;
  errorInvalidCode: string;
  errorCodeExpired: string;
  errorTooManyAttempts: string;
  errorInvalidInput: string;
  errorNotAuthenticated: string;
  errorNotFound: string;
  errorAuthFailed: string;
  errorPasskeyRegFailed: string;
  errorPasskeyNotFound: string;
}
