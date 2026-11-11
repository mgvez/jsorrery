import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
	{ ignores: ['dist', 'public', 'node_modules', 'tests/fixtures'] },
	{
		files: ['**/*.{ts,tsx}'],
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
		},
		plugins: {
			'react-hooks': reactHooks,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
	},
	{
		// ports of Fortran / numerical reference code, kept close to the original listings
		files: ['src/scenario/scenarios/bodies/moon/*.ts', 'src/algorithm/VSOP.ts'],
		rules: {
			'prefer-const': 'off',
		},
	},
);
