import { createStore } from 'tinybase';
import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthDB } from '../types.js';
import { tinybaseAdapter } from './tinybase.js';

let db: AuthDB;

beforeEach(() => {
	const store = createStore();
	db = tinybaseAdapter(store);
	db.init();
});

describe('users', () => {
	it('createUser returns a user with id and email', () => {
		const user = db.createUser('alice@example.com');
		expect(user.id).toBeTruthy();
		expect(user.email).toBe('alice@example.com');
		expect(user.skipPasskeyPrompt).toBe(false);
	});

	it('getUserByEmail returns the created user', () => {
		const created = db.createUser('bob@example.com');
		const found = db.getUserByEmail('bob@example.com');
		expect(found).not.toBeNull();
		expect(found!.id).toBe(created.id);
		expect(found!.email).toBe('bob@example.com');
	});

	it('getUserByEmail returns null for unknown email', () => {
		expect(db.getUserByEmail('nobody@example.com')).toBeNull();
	});

	it('setSkipPasskeyPrompt updates the flag', () => {
		const user = db.createUser('carol@example.com');
		expect(db.getUserByEmail('carol@example.com')!.skipPasskeyPrompt).toBe(false);
		db.setSkipPasskeyPrompt(user.id, true);
		expect(db.getUserByEmail('carol@example.com')!.skipPasskeyPrompt).toBe(true);
		db.setSkipPasskeyPrompt(user.id, false);
		expect(db.getUserByEmail('carol@example.com')!.skipPasskeyPrompt).toBe(false);
	});
});

describe('sessions', () => {
	it('createSession and getSession round-trip', () => {
		const user = db.createUser('sess@example.com');
		const expiresAt = Date.now() + 60000;
		db.createSession('hash-abc', user.id, expiresAt);

		const session = db.getSession('hash-abc');
		expect(session).not.toBeNull();
		expect(session!.id).toBe('hash-abc');
		expect(session!.userId).toBe(user.id);
		expect(session!.expiresAt).toBe(expiresAt);
		expect(session!.email).toBe('sess@example.com');
	});

	it('getSession returns null for unknown hash', () => {
		expect(db.getSession('nonexistent')).toBeNull();
	});

	it('deleteSession removes the session', () => {
		const user = db.createUser('del@example.com');
		db.createSession('hash-del', user.id, Date.now() + 60000);
		expect(db.getSession('hash-del')).not.toBeNull();
		db.deleteSession('hash-del');
		expect(db.getSession('hash-del')).toBeNull();
	});
});

describe('OTP', () => {
	it('storeOTP and getLatestOTP round-trip', () => {
		const expiresAt = Date.now() + 60000;
		db.storeOTP('otp@example.com', 'otp-1', '12345', expiresAt);

		const otp = db.getLatestOTP('otp@example.com');
		expect(otp).not.toBeNull();
		expect(otp!.id).toBe('otp-1');
		expect(otp!.code).toBe('12345');
		expect(otp!.attempts).toBe(0);
		expect(otp!.expiresAt).toBe(expiresAt);
	});

	it('getLatestOTP returns null for unknown email', () => {
		expect(db.getLatestOTP('nobody@example.com')).toBeNull();
	});

	it('updateOTPAttempts changes the attempt count', () => {
		db.storeOTP('att@example.com', 'otp-att', '11111', Date.now() + 60000);
		db.updateOTPAttempts('otp-att', 3);
		const otp = db.getLatestOTP('att@example.com');
		expect(otp!.attempts).toBe(3);
	});

	it('deleteOTP removes a specific OTP', () => {
		db.storeOTP('d@example.com', 'otp-d', '22222', Date.now() + 60000);
		db.deleteOTP('otp-d');
		expect(db.getLatestOTP('d@example.com')).toBeNull();
	});

	it('deleteOTPsForEmail removes all OTPs for that email', () => {
		db.storeOTP('multi@example.com', 'otp-m1', '11111', Date.now() + 60000);
		db.storeOTP('multi@example.com', 'otp-m2', '22222', Date.now() + 60000);
		db.deleteOTPsForEmail('multi@example.com');
		expect(db.getLatestOTP('multi@example.com')).toBeNull();
	});

	it('getLatestOTP returns the most recently stored OTP', async () => {
		db.storeOTP('latest@example.com', 'otp-old', '11111', Date.now() + 60000);
		// Ensure different created_at by advancing time slightly
		await new Promise((r) => setTimeout(r, 10));
		db.storeOTP('latest@example.com', 'otp-new', '22222', Date.now() + 60000);

		const otp = db.getLatestOTP('latest@example.com');
		expect(otp!.id).toBe('otp-new');
		expect(otp!.code).toBe('22222');
	});
});

describe('challenges', () => {
	it('storeChallenge and consumeChallenge round-trip', () => {
		const expiresAt = Date.now() + 60000;
		db.storeChallenge('challenge-abc', 'user-1', expiresAt);

		const result = db.consumeChallenge('challenge-abc');
		expect(result).not.toBeNull();
		expect(result!.userId).toBe('user-1');
	});

	it('consumeChallenge returns null after consumption', () => {
		db.storeChallenge('challenge-once', 'user-1', Date.now() + 60000);
		db.consumeChallenge('challenge-once');
		expect(db.consumeChallenge('challenge-once')).toBeNull();
	});

	it('consumeChallenge returns null for expired challenge', () => {
		db.storeChallenge('challenge-expired', 'user-1', Date.now() - 1000);
		expect(db.consumeChallenge('challenge-expired')).toBeNull();
	});

	it('consumeChallenge returns null for unknown challenge', () => {
		expect(db.consumeChallenge('nonexistent')).toBeNull();
	});

	it('storeChallenge cleans up expired challenges', () => {
		const store = createStore();
		const localDb = tinybaseAdapter(store);
		localDb.init();

		localDb.storeChallenge('old-challenge', 'user-1', Date.now() - 1000);
		localDb.storeChallenge('new-challenge', 'user-2', Date.now() + 60000);

		const count = store.getTable('auth_challenges');
		expect(Object.keys(count)).toHaveLength(1);
		expect(count['new-challenge']).toBeDefined();
	});
});

describe('passkeys', () => {
	it('storePasskey and getUserPasskeys round-trip', () => {
		const user = db.createUser('pk@example.com');
		db.storePasskey({
			id: 'pk-1',
			userId: user.id,
			credentialId: 'cred-abc',
			publicKey: new Uint8Array([1, 2, 3, 4]),
			counter: 0,
			transports: '["internal"]',
			name: null
		});

		const passkeys = db.getUserPasskeys(user.id);
		expect(passkeys).toHaveLength(1);
		expect(passkeys[0].id).toBe('pk-1');
		expect(passkeys[0].credentialId).toBe('cred-abc');
		expect(passkeys[0].publicKey).toEqual(new Uint8Array([1, 2, 3, 4]));
		expect(passkeys[0].counter).toBe(0);
		expect(passkeys[0].transports).toBe('["internal"]');
		expect(passkeys[0].name).toBeNull();
	});

	it('getPasskeyByCredentialId returns full record with email', () => {
		const user = db.createUser('pkfull@example.com');
		db.storePasskey({
			id: 'pk-2',
			userId: user.id,
			credentialId: 'cred-full',
			publicKey: new Uint8Array([5, 6]),
			counter: 10,
			transports: null,
			name: null
		});

		const pk = db.getPasskeyByCredentialId('cred-full');
		expect(pk).not.toBeNull();
		expect(pk!.userId).toBe(user.id);
		expect(pk!.email).toBe('pkfull@example.com');
		expect(pk!.counter).toBe(10);
		expect(pk!.transports).toBeNull();
	});

	it('getPasskeyByCredentialId returns null for unknown', () => {
		expect(db.getPasskeyByCredentialId('nonexistent')).toBeNull();
	});

	it('updatePasskeyCounter updates the counter', () => {
		const user = db.createUser('cnt@example.com');
		db.storePasskey({
			id: 'pk-cnt',
			userId: user.id,
			credentialId: 'cred-cnt',
			publicKey: new Uint8Array([7]),
			counter: 0,
			transports: null,
			name: null
		});

		db.updatePasskeyCounter('pk-cnt', 42);
		const pk = db.getPasskeyByCredentialId('cred-cnt');
		expect(pk!.counter).toBe(42);
	});

	it('deletePasskey removes passkey and returns true', () => {
		const user = db.createUser('delpk@example.com');
		db.storePasskey({
			id: 'pk-del',
			userId: user.id,
			credentialId: 'cred-del',
			publicKey: new Uint8Array([8]),
			counter: 0,
			transports: null,
			name: null
		});

		const result = db.deletePasskey('pk-del', user.id);
		expect(result).toBe(true);
		expect(db.getUserPasskeys(user.id)).toHaveLength(0);
	});

	it('deletePasskey returns false for wrong userId', () => {
		const user = db.createUser('wronguser@example.com');
		db.storePasskey({
			id: 'pk-wrong',
			userId: user.id,
			credentialId: 'cred-wrong',
			publicKey: new Uint8Array([9]),
			counter: 0,
			transports: null,
			name: null
		});

		expect(db.deletePasskey('pk-wrong', 'different-user')).toBe(false);
		expect(db.getUserPasskeys(user.id)).toHaveLength(1);
	});

	it('deletePasskey returns false for unknown id', () => {
		expect(db.deletePasskey('nonexistent', 'any-user')).toBe(false);
	});

	it('publicKey round-trips correctly as Uint8Array', () => {
		const user = db.createUser('bytes@example.com');
		const originalKey = new Uint8Array([0, 1, 127, 128, 255]);
		db.storePasskey({
			id: 'pk-bytes',
			userId: user.id,
			credentialId: 'cred-bytes',
			publicKey: originalKey,
			counter: 0,
			transports: null,
			name: null
		});

		const pk = db.getPasskeyByCredentialId('cred-bytes');
		expect(pk!.publicKey).toEqual(originalKey);
	});
});
