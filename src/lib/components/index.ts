export { guessDeviceName } from "../device.js";
export { default as AuthFlow } from "./AuthFlow.svelte";
export { default as AuthPill } from "./AuthPill.svelte";
export { default as OtpInput } from "./OtpInput.svelte";
export { default as PasskeyPrompt } from "./PasskeyPrompt.svelte";
export { default as SessionRenew } from "./SessionRenew.svelte";
export type { AuthMessages } from "../i18n/types.js";
export {
  resolveMessages,
  loadMessages,
  detectLocaleClient,
  localeCodes,
} from "../i18n/index.js";
