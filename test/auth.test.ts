import { describe, it, expect, jest } from '@jest/globals';
import {
	createJwtToken,
	exchangeJwtForIam,
	exchangeOAuthForIam,
	validateServiceAccountKey,
	createCacheKey,
	getIamToken,
	YandexServiceAccountKey,
} from '../utils/auth';

// Mock service account key for testing
const mockServiceAccountKey: YandexServiceAccountKey = {
	id: 'test-key-id',
	service_account_id: 'test-service-account-id',
	created_at: '2023-01-01T00:00:00Z',
	key_algorithm: 'RSA_2048',
	public_key: '-----BEGIN PUBLIC KEY-----\nMOCK_PUBLIC_KEY\n-----END PUBLIC KEY-----',
	private_key: '-----BEGIN PRIVATE KEY-----\nMOCK_PRIVATE_KEY\n-----END PRIVATE KEY-----',
};

const mockHttpRequest = jest.fn();

describe('Auth Utils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('validateServiceAccountKey', () => {
		it('should validate a correct service account key', () => {
			const result = validateServiceAccountKey(mockServiceAccountKey);
			expect(result).toEqual(mockServiceAccountKey);
		});

		it('should throw error for missing required fields', () => {
			const invalidKey = { id: 'test' };
			expect(() => validateServiceAccountKey(invalidKey)).toThrow(
				'Service account key missing required field: service_account_id'
			);
		});

		it('should throw error for invalid private key format', () => {
			const invalidKey = {
				...mockServiceAccountKey,
				private_key: 'invalid-key-format',
			};
			expect(() => validateServiceAccountKey(invalidKey)).toThrow(
				'Invalid private key format in service account key'
			);
		});

		it('should throw error for non-object input', () => {
			expect(() => validateServiceAccountKey(null)).toThrow(
				'Service account key must be a valid JSON object'
			);
		});
	});

	describe('createCacheKey', () => {
		it('should create cache key for service account', () => {
			const credentials = {
				authType: 'serviceAccountKey',
				serviceAccountKey: JSON.stringify(mockServiceAccountKey),
			};
			const result = createCacheKey(credentials);
			expect(result).toBe('sa_test-service-account-id');
		});

		it('should create cache key for OAuth token', () => {
			const credentials = {
				authType: 'oauthToken',
				oauthToken: 'oauth-token-12345',
			};
			const result = createCacheKey(credentials);
			expect(result).toBe('oauth_oauth-to');
		});

		it('should create unknown cache key for unsupported auth type', () => {
			const credentials = {
				authType: 'unknown',
			};
			const result = createCacheKey(credentials);
			expect(result).toMatch(/^unknown_\d+$/);
		});
	});

	describe('createJwtToken', () => {
		it('should create a JWT token', () => {
			// Mock jwt.sign to avoid actual signing
			const jwt = require('jsonwebtoken');
			jest.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token');

			const result = createJwtToken(mockServiceAccountKey);
			expect(result).toBe('mock-jwt-token');
			expect(jwt.sign).toHaveBeenCalledWith(
				expect.objectContaining({
					aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
					iss: 'test-service-account-id',
				}),
				mockServiceAccountKey.private_key,
				{
					algorithm: 'PS256',
					keyid: 'test-key-id',
				}
			);
		});

		it('should throw error on JWT creation failure', () => {
			const jwt = require('jsonwebtoken');
			jest.spyOn(jwt, 'sign').mockImplementation(() => {
				throw new Error('JWT creation failed');
			});

			expect(() => createJwtToken(mockServiceAccountKey)).toThrow(
				'Failed to create JWT token: JWT creation failed'
			);
		});
	});

	describe('exchangeJwtForIam', () => {
		it('should exchange JWT for IAM token successfully', async () => {
			mockHttpRequest.mockResolvedValue({
				iamToken: 'mock-iam-token',
				expiresAt: '2023-12-31T23:59:59Z',
			});

			const result = await exchangeJwtForIam('mock-jwt-token', mockHttpRequest);
			expect(result).toBe('mock-iam-token');
			expect(mockHttpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					jwt: 'mock-jwt-token',
				},
				json: true,
			});
		});

		it('should throw error when no IAM token in response', async () => {
			mockHttpRequest.mockResolvedValue({});

			await expect(exchangeJwtForIam('mock-jwt-token', mockHttpRequest)).rejects.toThrow(
				'Failed to exchange JWT for IAM token: No IAM token in response'
			);
		});

		it('should throw error on HTTP request failure', async () => {
			mockHttpRequest.mockRejectedValue(new Error('Network error'));

			await expect(exchangeJwtForIam('mock-jwt-token', mockHttpRequest)).rejects.toThrow(
				'Failed to exchange JWT for IAM token: Network error'
			);
		});
	});

	describe('exchangeOAuthForIam', () => {
		it('should exchange OAuth token for IAM token successfully', async () => {
			mockHttpRequest.mockResolvedValue({
				iamToken: 'mock-iam-token',
				expiresAt: '2023-12-31T23:59:59Z',
			});

			const result = await exchangeOAuthForIam('mock-oauth-token', mockHttpRequest);
			expect(result).toBe('mock-iam-token');
			expect(mockHttpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					yandexPassportOauthToken: 'mock-oauth-token',
				},
				json: true,
			});
		});

		it('should throw error when no IAM token in response', async () => {
			mockHttpRequest.mockResolvedValue({});

			await expect(exchangeOAuthForIam('mock-oauth-token', mockHttpRequest)).rejects.toThrow(
				'Failed to exchange OAuth for IAM token: No IAM token in response'
			);
		});
	});

	describe('getIamToken', () => {
		it('should return IAM token directly when authType is iamToken', async () => {
			const credentials = {
				authType: 'iamToken',
				iamToken: 'direct-iam-token',
			};

			const result = await getIamToken(credentials, mockHttpRequest);
			expect(result).toBe('direct-iam-token');
			expect(mockHttpRequest).not.toHaveBeenCalled();
		});

		it('should exchange OAuth token for IAM token', async () => {
			mockHttpRequest.mockResolvedValue({
				iamToken: 'exchanged-iam-token',
			});

			const credentials = {
				authType: 'oauthToken',
				oauthToken: 'test-oauth-token',
			};

			const result = await getIamToken(credentials, mockHttpRequest);
			expect(result).toBe('exchanged-iam-token');
		});

		it('should create JWT and exchange for IAM token with service account key', async () => {
			// Mock JWT creation
			const jwt = require('jsonwebtoken');
			jest.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token');

			// Mock IAM token exchange
			mockHttpRequest.mockResolvedValue({
				iamToken: 'jwt-exchanged-iam-token',
			});

			const credentials = {
				authType: 'serviceAccountKey',
				serviceAccountKey: JSON.stringify(mockServiceAccountKey),
			};

			const result = await getIamToken(credentials, mockHttpRequest);
			expect(result).toBe('jwt-exchanged-iam-token');
			expect(jwt.sign).toHaveBeenCalled();
			expect(mockHttpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					jwt: 'mock-jwt-token',
				},
				json: true,
			});
		});

		it('should throw error for unsupported auth type', async () => {
			const credentials = {
				authType: 'unsupported',
			};

			await expect(getIamToken(credentials, mockHttpRequest)).rejects.toThrow(
				'Unsupported authentication type: unsupported'
			);
		});

		it('should throw error for invalid service account key JSON', async () => {
			const credentials = {
				authType: 'serviceAccountKey',
				serviceAccountKey: 'invalid-json',
			};

			await expect(getIamToken(credentials, mockHttpRequest)).rejects.toThrow();
		});
	});
});

// Additional integration-style tests
describe('Auth Integration Tests', () => {
	it('should handle complete service account authentication flow', async () => {
		// Mock JWT signing
		const jwt = require('jsonwebtoken');
		jest.spyOn(jwt, 'sign').mockReturnValue('integration-jwt-token');

		// Mock HTTP request for IAM token exchange
		mockHttpRequest.mockResolvedValue({
			iamToken: 'integration-iam-token',
			expiresAt: '2023-12-31T23:59:59Z',
		});

		const credentials = {
			authType: 'serviceAccountKey',
			serviceAccountKey: JSON.stringify(mockServiceAccountKey),
		};

		const result = await getIamToken(credentials, mockHttpRequest);

		expect(result).toBe('integration-iam-token');
		expect(jwt.sign).toHaveBeenCalledWith(
			expect.objectContaining({
				aud: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
				iss: mockServiceAccountKey.service_account_id,
			}),
			mockServiceAccountKey.private_key,
			{
				algorithm: 'PS256',
				keyid: mockServiceAccountKey.id,
			}
		);
		expect(mockHttpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				jwt: 'integration-jwt-token',
			},
			json: true,
		});
	});

	it('should handle OAuth authentication flow', async () => {
		mockHttpRequest.mockResolvedValue({
			iamToken: 'oauth-iam-token',
			expiresAt: '2023-12-31T23:59:59Z',
		});

		const credentials = {
			authType: 'oauthToken',
			oauthToken: 'test-oauth-token-12345',
		};

		const result = await getIamToken(credentials, mockHttpRequest);

		expect(result).toBe('oauth-iam-token');
		expect(mockHttpRequest).toHaveBeenCalledWith({
			method: 'POST',
			url: 'https://iam.api.cloud.yandex.net/iam/v1/tokens',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				yandexPassportOauthToken: 'test-oauth-token-12345',
			},
			json: true,
		});
	});
});
