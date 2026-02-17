export interface AuthUser {
	id: string;
	email: string;
	skipPasskeyPrompt: boolean;
	createdAt: number;
}

export interface SessionRecord {
	id: string;
	userId: string;
	expiresAt: number;
}

export interface OTPRecord {
	id: string;
	email: string;
	code: string;
	attempts: number;
	expiresAt: number;
}

export interface PasskeyRecord {
	id: string;
	credentialId: string;
	publicKey: Uint8Array;
	counter: number;
	transports: string | null;
	createdAt: number;
}

export interface FullPasskeyRecord extends PasskeyRecord {
	userId: string;
	email: string;
}

export interface NewPasskey {
	id: string;
	userId: string;
	credentialId: string;
	publicKey: Uint8Array;
	counter: number;
	transports: string | null;
}

export type OtpResult =
	| { ok: true }
	| { ok: false; error: 'invalid' }
	| { ok: false; error: 'expired' }
	| { ok: false; error: 'rate_limited'; attemptsLeft: number };

export type MaybePromise<T> = T | Promise<T>;

export interface AuthDB {
	init(): MaybePromise<void>;

	getUserByEmail(email: string): MaybePromise<AuthUser | null>;
	createUser(email: string): MaybePromise<AuthUser>;
	setSkipPasskeyPrompt(userId: string, skip: boolean): MaybePromise<void>;

	createSession(tokenHash: string, userId: string, expiresAt: number): MaybePromise<void>;
	getSession(tokenHash: string): MaybePromise<(SessionRecord & { email: string }) | null>;
	deleteSession(tokenHash: string): MaybePromise<void>;

	storeOTP(email: string, id: string, code: string, expiresAt: number): MaybePromise<void>;
	getLatestOTP(email: string): MaybePromise<OTPRecord | null>;
	updateOTPAttempts(id: string, attempts: number): MaybePromise<void>;
	deleteOTP(id: string): MaybePromise<void>;
	deleteOTPsForEmail(email: string): MaybePromise<void>;

	storeChallenge(challenge: string, userId: string, expiresAt: number): MaybePromise<void>;
	consumeChallenge(challenge: string): MaybePromise<{ userId: string } | null>;
	getPasskeyByCredentialId(credentialId: string): MaybePromise<FullPasskeyRecord | null>;
	getUserPasskeys(userId: string): MaybePromise<PasskeyRecord[]>;
	storePasskey(passkey: NewPasskey): MaybePromise<void>;
	updatePasskeyCounter(id: string, counter: number): MaybePromise<void>;
	deletePasskey(id: string, userId: string): MaybePromise<boolean>;
}

export interface AuthConfig {
	db: AuthDB;
	tablePrefix?: string;
	cookie?: string;
	sessionDuration?: number;
	otpExpiry?: number;
	otpLength?: number;
	otpMaxAttempts?: number;
	rpName?: string;
	onSendOTP: (email: string, code: string) => Promise<void>;
}

export interface ResolvedConfig extends Required<Omit<AuthConfig, 'onSendOTP'>> {
	onSendOTP: (email: string, code: string) => Promise<void>;
}
