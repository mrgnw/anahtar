// Email is the user's identity key. Normalize it to one canonical form so the
// same address always maps to a single account regardless of how it was typed
// (mobile keyboards auto-capitalize, users add stray whitespace, etc.).
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}
