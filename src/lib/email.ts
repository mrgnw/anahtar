// Email is the user's identity key. Normalize it to one canonical form so the
// same address always maps to a single account regardless of how it was typed
// (mobile keyboards auto-capitalize, users add stray whitespace, etc.).
export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export function parseEmail(raw: unknown): string | null {
	if (typeof raw !== 'string') return null;
	const email = normalizeEmail(raw);
	if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return null;
	return email;
}
