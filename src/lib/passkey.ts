import { randomUUID } from 'node:crypto';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import {
	generateAuthenticationOptions,
	generateRegistrationOptions,
	verifyAuthenticationResponse as verifyAuthResponse,
	verifyRegistrationResponse as verifyRegResponse
} from '@simplewebauthn/server';
import type { AuthDB, ResolvedConfig } from './types.js';

const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;

export function getWebAuthnConfig(requestUrl: URL) {
	const envOrigin = process.env.ORIGIN;
	if (envOrigin) {
		const url = new URL(envOrigin);
		return { rpID: url.hostname, origin: url.origin };
	}
	return { rpID: requestUrl.hostname, origin: requestUrl.origin };
}

export async function generateRegistrationChallenge(
	db: AuthDB,
	user: { id: string; email: string },
	requestUrl: URL,
	config: ResolvedConfig
) {
	const { rpID } = getWebAuthnConfig(requestUrl);
	const existingPasskeys = await db.getUserPasskeys(user.id);
	const excludeCredentials = existingPasskeys.map((pk) => ({
		id: pk.credentialId,
		transports: pk.transports ? (JSON.parse(pk.transports) as AuthenticatorTransport[]) : undefined
	}));

	const options = await generateRegistrationOptions({
		rpName: config.rpName,
		rpID,
		userName: user.email,
		userID: new TextEncoder().encode(user.id),
		authenticatorSelection: {
			residentKey: 'required',
			userVerification: 'preferred'
		},
		excludeCredentials
	});

	await db.storeChallenge(options.challenge, user.id, Date.now() + CHALLENGE_EXPIRY_MS);

	return options;
}

export async function verifyRegistrationResponse(
	db: AuthDB,
	userId: string,
	response: RegistrationResponseJSON,
	requestUrl: URL,
	name: string | null = null
): Promise<{ ok: true } | { ok: false; reason: string }> {
	const { rpID, origin } = getWebAuthnConfig(requestUrl);

	let challenge: string;
	try {
		const clientData = JSON.parse(Buffer.from(response.response.clientDataJSON, 'base64url').toString());
		challenge = clientData.challenge;
	} catch (e) {
		return { ok: false, reason: `clientDataJSON parse failed: ${e}` };
	}

	const stored = await db.consumeChallenge(challenge);
	if (!stored) return { ok: false, reason: 'challenge not found or expired' };
	if (stored.userId !== userId)
		return { ok: false, reason: `userId mismatch: challenge=${stored.userId} session=${userId}` };

	try {
		const verification = await verifyRegResponse({
			response,
			expectedChallenge: challenge,
			expectedOrigin: origin,
			expectedRPID: rpID,
			requireUserVerification: false
		});

		if (!verification.verified) return { ok: false, reason: 'verification not verified' };
		if (!verification.registrationInfo) return { ok: false, reason: 'no registrationInfo' };

		const { credential } = verification.registrationInfo;

		await db.storePasskey({
			id: randomUUID(),
			userId,
			credentialId: credential.id,
			publicKey: new Uint8Array(credential.publicKey),
			counter: credential.counter,
			transports: response.response.transports ? JSON.stringify(response.response.transports) : null,
			name
		});

		return { ok: true };
	} catch (e) {
		return { ok: false, reason: `verification threw: ${e}` };
	}
}

export async function generateAuthenticationChallenge(db: AuthDB, requestUrl: URL) {
	const { rpID } = getWebAuthnConfig(requestUrl);
	const options = await generateAuthenticationOptions({
		rpID,
		allowCredentials: [],
		userVerification: 'preferred'
	});

	await db.storeChallenge(options.challenge, 'anonymous', Date.now() + CHALLENGE_EXPIRY_MS);

	return options;
}

export async function verifyAuthenticationResponse(
	db: AuthDB,
	response: AuthenticationResponseJSON,
	requestUrl: URL
): Promise<{ user: { id: string; email: string } } | null> {
	const { rpID, origin } = getWebAuthnConfig(requestUrl);
	const passkey = await db.getPasskeyByCredentialId(response.id);

	if (!passkey) return null;

	const challenge = JSON.parse(Buffer.from(response.response.clientDataJSON, 'base64url').toString()).challenge;

	const stored = await db.consumeChallenge(challenge);
	if (!stored) return null;

	try {
		const verification = await verifyAuthResponse({
			response,
			expectedChallenge: challenge,
			expectedOrigin: origin,
			expectedRPID: rpID,
			requireUserVerification: false,
			credential: {
				id: passkey.credentialId,
				publicKey: new Uint8Array(passkey.publicKey),
				counter: passkey.counter,
				transports: passkey.transports ? (JSON.parse(passkey.transports) as AuthenticatorTransport[]) : undefined
			}
		});

		if (!verification.verified) return null;

		await db.updatePasskeyCounter(passkey.id, verification.authenticationInfo.newCounter);

		return {
			user: { id: passkey.userId, email: passkey.email }
		};
	} catch {
		return null;
	}
}

export async function getUserPasskeys(db: AuthDB, userId: string) {
	return db.getUserPasskeys(userId);
}

export async function removePasskey(db: AuthDB, passkeyId: string, userId: string) {
	return db.deletePasskey(passkeyId, userId);
}
