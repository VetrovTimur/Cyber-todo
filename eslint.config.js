module.exports = [
    {
        files: ['src/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                fetch: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                navigator: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-dupe-keys': 'error',
            'no-dupe-args': 'error',
            'no-duplicate-case': 'error',
            'no-cond-assign': 'error',

            'no-var': 'warn',
            'prefer-const': 'warn',
            'eqeqeq': ['warn', 'always'],
            'quotes': ['warn', 'single', { avoidEscape: true }],
            'semi': ['warn', 'always'],
            'indent': ['warn', 4],
            'no-multiple-empty-lines': ['warn', { max: 1 }],
            'no-trailing-spaces': 'warn',
            'eol-last': ['warn', 'always'],

            'no-console': 'off',
            'no-alert': 'warn',                    
            'no-debugger': 'warn'
        }
    }
];
