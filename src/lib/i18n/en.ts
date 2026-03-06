import type { AuthMessages } from "./types.js";

const en: AuthMessages = {
  emailPlaceholder: "you@example.com",
  continue: "Continue",

  codeSentTo: "We sent a code to",
  verifying: "Verifying...",
  resend: "Didn't get it? Resend",
  differentEmail: "Use a different email",

  passkeyCreating: "Making you a passkey",
  passkeySubtitle: "for faster, easier, safer login",
  passkeyAdd: "Add passkey now",
  passkeyMaybeLater: "Maybe later",
  passkeySuccess: "You've got a passkey!",

  errorInvalidEmail: "Please enter a valid email address.",
  errorGeneric: "Something went wrong. Please try again.",
  errorResendFailed: "Failed to resend code.",
  errorInvalidCode: "Invalid code. Please try again.",
  errorCodeExpired: "Code expired. Please request a new one.",
  errorTooManyAttempts: "Too many attempts. Please request a new code.",
  errorInvalidInput: "Invalid input",
  errorNotAuthenticated: "Not authenticated",
  errorNotFound: "Not found",
  errorAuthFailed: "Authentication failed",
  errorPasskeyRegFailed: "Passkey registration failed",
  errorPasskeyNotFound: "Passkey not found",
};

export default en;
