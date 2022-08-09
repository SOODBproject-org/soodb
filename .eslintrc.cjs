/* eslint-disable no-undef */
module.exports = {
    root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
    rules: {
        "array-callback-return": "error",
        "no-await-in-loop": "warn",
        "no-constant-binary-expression": "error",
        "no-constructor-return": "error",
        "no-control-regex": "warn",
        "no-promise-executor-return": "error",
        "no-self-compare": "error",
        "no-template-curly-in-string": "warn",
        "no-unmodified-loop-condition": "error",
        "no-unreachable-loop": "error",
        "no-unused-private-class-members": "warn",
        "camelcase": "warn",
        "consistent-return": "warn",
        "curly": ["error", "multi-line"],
        "eqeqeq": "error",
        "no-caller": "error",
        "no-floating-decimal": "error",
        "no-lonely-if": "warn",
        "no-shadow": "error",
        "no-var": "error",
        "no-void": "error",
        "prefer-const": "warn",
    },
}