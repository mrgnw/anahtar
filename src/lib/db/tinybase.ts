import type { Store } from 'tinybase';
import { createIndexes } from 'tinybase/indexes';
import type {
	AuthDB,
	AuthUser,
	FullPasskeyRecord,
	NewPasskey,
	OTPRecord,
	PasskeyRecord,
	SessionRecord
} from '../types.js';

interface TinybaseAdapterOptions {
	tablePrefix?: string;
}

function encodeBytes(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes));
}

function decodeBytes(str: string): Uint8Array {
	return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

export function tinybaseAdapter(store: Store, options: TinybaseAdapterOptions = {}): AuthDB {
	const p = options.tablePrefix ?? 'auth_';
	const t = {
		users: `${p}users`,
		sessions: `${p}sessions`,
		otpCodes: `${p}otp_codes`,
		passkeys: `${p}passkeys`,
		challenges: `${p}challenges`
	};

	const indexes = createIndexes(store);

	return {
		init() {
			indexes.setIndexDefinition('email_to_user', t.users, 'email');
			indexes.setIndexDefinition('email_to_otp', t.otpCodes, 'email');
			indexes.setIndexDefinition('credential_to_passkey', t.passkeys, 'credential_id');
			indexes.setIndexDefinition('user_to_passkey', t.passkeys, 'user_id');
		},

		getUserByEmail(email: string): AuthUser | null {
			const ids = indexes.getSliceRowIds('email_to_user', email);
			if (!ids.length) return null;
			const row = store.getRow(t.users, ids[0]);
			return {
				id: ids[0],
				email: row.email as string,
				skipPasskeyPrompt: row.skip_passkey_prompt === 1,
				createdAt: row.created_at as number
			};
		},

		createUser(email: string): AuthUser {
			const id = crypto.randomUUID();
			const createdAt = Math.floor(Date.now() / 1000);
			store.setRow(t.users, id, {
				email,
				skip_passkey_prompt: 0,
				created_at: createdAt
			});
			return { id, email, skipPasskeyPrompt: false, createdAt };
		},

		setSkipPasskeyPrompt(userId: string, skip: boolean) {
			store.setCell(t.users, userId, 'skip_passkey_prompt', skip ? 1 : 0);
		},

		createSession(tokenHash: string, userId: string, expiresAt: number) {
			store.setRow(t.sessions, tokenHash, {
				user_id: userId,
				expires_at: expiresAt,
				created_at: Math.floor(Date.now() / 1000)
			});
		},

		getSession(tokenHash: string): (SessionRecord & { email: string }) | null {
			const session = store.getRow(t.sessions, tokenHash);
			if (!session.user_id) return null;
			const userId = session.user_id as string;
			const user = store.getRow(t.users, userId);
			if (!user.email) return null;
			return {
				id: tokenHash,
				userId,
				expiresAt: session.expires_at as number,
				email: user.email as string
			};
		},

		deleteSession(tokenHash: string) {
			store.delRow(t.sessions, tokenHash);
		},

		storeOTP(email: string, id: string, code: string, expiresAt: number) {
			store.setRow(t.otpCodes, id, {
				email,
				code,
				attempts: 0,
				expires_at: expiresAt,
				created_at: Date.now()
			});
		},

		getLatestOTP(email: string): OTPRecord | null {
			const ids = indexes.getSliceRowIds('email_to_otp', email);
			if (!ids.length) return null;
			let latestId = ids[0];
			let latestCreatedAt = store.getCell(t.otpCodes, latestId, 'created_at') as number;
			for (let i = 1; i < ids.length; i++) {
				const createdAt = store.getCell(t.otpCodes, ids[i], 'created_at') as number;
				if (createdAt > latestCreatedAt) {
					latestCreatedAt = createdAt;
					latestId = ids[i];
				}
			}
			const row = store.getRow(t.otpCodes, latestId);
			return {
				id: latestId,
				email: row.email as string,
				code: row.code as string,
				attempts: row.attempts as number,
				expiresAt: row.expires_at as number
			};
		},

		updateOTPAttempts(id: string, attempts: number) {
			store.setCell(t.otpCodes, id, 'attempts', attempts);
		},

		deleteOTP(id: string) {
			store.delRow(t.otpCodes, id);
		},

		deleteOTPsForEmail(email: string) {
			const ids = indexes.getSliceRowIds('email_to_otp', email);
			for (const id of ids) {
				store.delRow(t.otpCodes, id);
			}
		},

		storeChallenge(challenge: string, userId: string, expiresAt: number) {
			// Clean up expired challenges
			const now = Date.now();
			store.forEachRow(t.challenges, (rowId) => {
				const exp = store.getCell(t.challenges, rowId, 'expires_at') as number;
				if (exp < now) store.delRow(t.challenges, rowId);
			});
			store.setRow(t.challenges, challenge, {
				user_id: userId,
				expires_at: expiresAt,
				created_at: Math.floor(Date.now() / 1000)
			});
		},

		consumeChallenge(challenge: string): { userId: string } | null {
			const row = store.getRow(t.challenges, challenge);
			if (!row.user_id) return null;
			store.delRow(t.challenges, challenge);
			if ((row.expires_at as number) < Date.now()) return null;
			return { userId: row.user_id as string };
		},

		getPasskeyByCredentialId(credentialId: string): FullPasskeyRecord | null {
			const ids = indexes.getSliceRowIds('credential_to_passkey', credentialId);
			if (!ids.length) return null;
			const id = ids[0];
			const row = store.getRow(t.passkeys, id);
			const userId = row.user_id as string;
			const user = store.getRow(t.users, userId);
			if (!user.email) return null;
			return {
				id,
				userId,
				credentialId: row.credential_id as string,
				publicKey: decodeBytes(row.public_key as string),
				counter: row.counter as number,
				transports: (row.transports as string | null) ?? null,
				name: (row.name as string | null) ?? null,
				createdAt: row.created_at as number,
				email: user.email as string
			};
		},

		getUserPasskeys(userId: string): PasskeyRecord[] {
			const ids = indexes.getSliceRowIds('user_to_passkey', userId);
			return ids.map((id) => {
				const row = store.getRow(t.passkeys, id);
				return {
					id,
					credentialId: row.credential_id as string,
					publicKey: decodeBytes(row.public_key as string),
					counter: row.counter as number,
					transports: (row.transports as string | null) ?? null,
					name: (row.name as string | null) ?? null,
					createdAt: row.created_at as number
				};
			});
		},

		storePasskey(passkey: NewPasskey) {
			store.setRow(t.passkeys, passkey.id, {
				user_id: passkey.userId,
				credential_id: passkey.credentialId,
				public_key: encodeBytes(passkey.publicKey),
				counter: passkey.counter,
				...(passkey.transports !== null && { transports: passkey.transports }),
				...(passkey.name !== null && { name: passkey.name }),
				created_at: Math.floor(Date.now() / 1000)
			});
		},

		updatePasskeyCounter(id: string, counter: number) {
			store.setCell(t.passkeys, id, 'counter', counter);
		},

		deletePasskey(id: string, userId: string): boolean {
			const row = store.getRow(t.passkeys, id);
			if (!row.user_id || row.user_id !== userId) return false;
			store.delRow(t.passkeys, id);
			return true;
		}
	};
}
