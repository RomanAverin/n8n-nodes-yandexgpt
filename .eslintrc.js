module.exports = {
	root: true,
	env: {
		browser: false,
		es6: true,
		node: true,
	},
	extends: ['eslint:recommended'],
	rules: {
		'no-console': 'off',
		'no-debugger': 'error',
		'dot-notation': 'error',
		eqeqeq: 'error',
		'no-eval': 'error',
		'no-extend-native': 'error',
		'no-new-wrappers': 'error',
		'no-throw-literal': 'error',
		'no-undef-init': 'error',
		'no-use-before-define': 'off',
	},
	overrides: [
		{
			files: ['**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: './tsconfig.json',
				sourceType: 'module',
			},
			plugins: ['@typescript-eslint'],
			extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
			rules: {
				'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/explicit-function-return-type': 'off',
				'@typescript-eslint/explicit-module-boundary-types': 'off',
				'@typescript-eslint/no-use-before-define': 'error',
				'@typescript-eslint/ban-types': 'error',
				'no-case-declarations': 'error',
			},
		},
		{
			files: ['**/*.json'],
			parser: 'jsonc-eslint-parser',
			extends: ['plugin:jsonc/recommended-with-json'],
			rules: {
				// Отключаем сортировку ключей пока
			},
		},
	],
	ignorePatterns: ['dist/**', 'node_modules/**', '*.js'],
};
