import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierPlugin from 'eslint-plugin-prettier'

export const baseConfig = tseslint.config(
    {
        ignores: ['node_modules', 'dist', 'build', 'coverage', '*.config.*'],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}'],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
        ],
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            'prettier/prettier': 'error',
            'semi': ['error', 'always'],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },
)

