import { nodeConfig } from '../shared/eslint-config';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default [
    ...nodeConfig,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: join(__dirname, '..'),
                project: [
                    './backend/tsconfig.json',
                    './backend/tsconfig.test.json',
                ],
            },
        },
    },
];
