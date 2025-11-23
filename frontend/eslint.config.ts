import { reactConfig } from "../shared/eslint-config";
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default [
    ...reactConfig,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: join(__dirname, '..'),
                project: [
                    './frontend/tsconfig.app.json',
                    './frontend/tsconfig.node.json',
                ],
            },
        },
    },
];

