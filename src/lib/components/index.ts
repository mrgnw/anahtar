export { guessDeviceName } from '../device.js';
export { default as AuthFlow } from './AuthFlow.svelte';
export { default as OtpInput } from './OtpInput.svelte';
export { default as PasskeyPrompt } from './PasskeyPrompt.svelte';
export type { AuthMessages } from '../i18n/types.js';
export { resolveMessages, detectLocaleClient, locales } from '../i18n/index.js';
