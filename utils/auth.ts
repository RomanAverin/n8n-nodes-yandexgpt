import * as jwt from 'jsonwebtoken';
import { NodeOperationError } from 'n8n-workflow';

export interface YandexServiceAccountKey {
	id: string;
	service_account_id: string;
	created_at: string;
	key_algorithm: string;
	public_key: string;
	private_key: string;
}

export interface IamTokenResponse {
	iamToken: string;
	expiresAt: string;
}

export interface TokenCache {
	token: string;
	expiresAt: Date;
}

// Cache for IAM tokens to avoid unnecessary requests
const tokenCache = new Map<string, TokenCache>();

/**
 * Creates a JWT token from service account key for Yandex Cloud authentication
 */
export function createJwtToken(serviceAccountKey: YandexServiceAccountKey): string {
	try {
		const now = Math.floor(Date.now() / 1000);
		const payload = {
			aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
			iss: serviceAccountKey.service_account_id,
			iat: now,
			exp: now + 3600, // 1 hour
		};

		return jwt.sign(payload, serviceAccountKey.private_key, {
			algorithm: 'PS256',
			keyid: serviceAccountKey.id,
		});
	} catch (error) {
		throw new NodeOperationError(
			null as any,
			`Failed to create JWT token: ${error.message}`,
		);
	}
}

/**
 * Exchanges JWT token for IAM token
 */
export async function exchangeJwtForIam(
	jwtToken: string,
	httpRequest: Function,
): Promise<string> {
	try {
		const response = await httpRequest({
			method: 'POST',
			url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				jwt: jwtToken,
			},
			json: true,
		});

		if (!response.iamToken) {
			throw new Error('No IAM token in response');
		}

		return response.iamToken;
	} catch (error) {
		throw new NodeOperationError(
			null as any,
			`Failed to exchange JWT for IAM token: ${error.message}`,
		);
	}
}

/**
 * Exchanges OAuth token for IAM token
 */
export async function exchangeOAuthForIam(
	oauthToken: string,
	httpRequest: Function,
): Promise<string> {
	try {
		const response = await httpRequest({
			method: 'POST',
			url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				yandexPassportOauthToken: oauthToken,
			},
			json: true,
		});

		if (!response.iamToken) {
			throw new Error('No IAM token in response');
		}

		return response.iamToken;
	} catch (error) {
		throw new NodeOperationError(
			null as any,
			`Failed to exchange OAuth for IAM token: ${error.message}`,
		);
	}
}

/**
 * Gets IAM token with caching to avoid unnecessary API calls
 */
export async function getCachedIamToken(
	cacheKey: string,
	tokenGenerator: () => Promise<string>,
): Promise<string> {
	const cached = tokenCache.get(cacheKey);

	// Check if token exists and is not expired (with 5-minute buffer)
	if (cached && cached.expiresAt > new Date(Date.now() + 5 * 60 * 1000)) {
		return cached.token;
	}

	// Generate new token
	const token = await tokenGenerator();

	// Cache token for 11 hours (IAM tokens are valid for 12 hours)
	const expiresAt = new Date(Date.now() + 11 * 60 * 60 * 1000);
	tokenCache.set(cacheKey, { token, expiresAt });

	return token;
}

/**
 * Validates service account key format
 */
export function validateServiceAccountKey(key: any): YandexServiceAccountKey {
	if (!key || typeof key !== 'object') {
		throw new NodeOperationError(
			null as any,
			'Service account key must be a valid JSON object',
		);
	}

	const requiredFields = ['id', 'service_account_id', 'private_key'];
	for (const field of requiredFields) {
		if (!key[field]) {
			throw new NodeOperationError(
				null as any,
				`Service account key missing required field: ${field}`,
			);
		}
	}

	// Validate private key format
	if (!key.private_key.includes('BEGIN PRIVATE KEY') || !key.private_key.includes('END PRIVATE KEY')) {
		throw new NodeOperationError(
			null as any,
			'Invalid private key format in service account key',
		);
	}

	return key as YandexServiceAccountKey;
}

/**
 * Creates a cache key for token caching based on credentials
 */
export function createCacheKey(credentials: any): string {
	const authType = credentials.authType;

	switch (authType) {
		case 'serviceAccountKey':
			const key = JSON.parse(credentials.serviceAccountKey);
			return `sa_${key.service_account_id}`;
		case 'oauthToken':
			// Use first 8 characters of token for cache key
			return `oauth_${credentials.oauthToken.substring(0, 8)}`;
		default:
			return `unknown_${Date.now()}`;
	}
}

/**
 * Clears expired tokens from cache
 */
export function clearExpiredTokens(): void {
	const now = new Date();
	for (const [key, cache] of tokenCache.entries()) {
		if (cache.expiresAt <= now) {
			tokenCache.delete(key);
		}
	}
}

/**
 * Clears all cached tokens
 */
export function clearTokenCache(): void {
	tokenCache.clear();
}

/**
 * Gets the main IAM token using the appropriate method based on auth type
 */
export async function getIamToken(credentials: any, httpRequest: Function): Promise<string> {
	const authType = credentials.authType as string;

	switch (authType) {
		case 'iamToken':
			return credentials.iamToken as string;

		case 'oauthToken':
			const cacheKeyOAuth = createCacheKey(credentials);
			return getCachedIamToken(cacheKeyOAuth, () =>
				exchangeOAuthForIam(credentials.oauthToken as string, httpRequest),
			);

		case 'serviceAccountKey':
			const serviceAccountKey = validateServiceAccountKey(
				JSON.parse(credentials.serviceAccountKey as string),
			);
			const cacheKeySA = createCacheKey(credentials);

			return getCachedIamToken(cacheKeySA, async () => {
				const jwtToken = createJwtToken(serviceAccountKey);
				return exchangeJwtForIam(jwtToken, httpRequest);
			});

		default:
			throw new NodeOperationError(
				null as any,
				`Unsupported authentication type: ${authType}`,
			);
	}
}
