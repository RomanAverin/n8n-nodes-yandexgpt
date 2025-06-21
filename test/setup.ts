// Test setup file for Jest
import { jest } from '@jest/globals';

// Mock n8n-workflow module
jest.mock('n8n-workflow', () => ({
	NodeOperationError: class NodeOperationError extends Error {
		constructor(node: any, message: string) {
			super(message);
			this.name = 'NodeOperationError';
		}
	},
}));

// Mock jsonwebtoken module for testing
jest.mock('jsonwebtoken', () => ({
	sign: jest.fn(),
	verify: jest.fn(),
	decode: jest.fn(),
}));

// Global test utilities
declare global {
	namespace jest {
		interface Matchers<R> {
			toBeValidIamToken(): R;
			toBeValidJwtToken(): R;
		}
	}
}

// Custom matchers
expect.extend({
	toBeValidIamToken(received: string) {
		const pass = typeof received === 'string' && received.length > 0;
		if (pass) {
			return {
				message: () => `expected ${received} not to be a valid IAM token`,
				pass: true,
			};
		} else {
			return {
				message: () => `expected ${received} to be a valid IAM token`,
				pass: false,
			};
		}
	},
	toBeValidJwtToken(received: string) {
		const pass = typeof received === 'string' && received.split('.').length === 3;
		if (pass) {
			return {
				message: () => `expected ${received} not to be a valid JWT token`,
				pass: true,
			};
		} else {
			return {
				message: () => `expected ${received} to be a valid JWT token`,
				pass: false,
			};
		}
	},
});

// Test timeout
jest.setTimeout(30000);

// Clean up after each test
afterEach(() => {
	jest.clearAllMocks();
});
