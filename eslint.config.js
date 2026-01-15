const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const angularPlugin = require("@angular-eslint/eslint-plugin");
const angularTemplatePlugin = require("@angular-eslint/eslint-plugin-template");
const angularTemplateParser = require("@angular-eslint/template-parser");

module.exports = [
    {
        files: ["src/app/modules/gestion-matricula-academica/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaVersion: 2020,
                sourceType: "module",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "@angular-eslint": angularPlugin,
        },
        rules: {
            // Reglas básicas de Angular
            "@angular-eslint/directive-selector": [
                "error",
                {
                    type: "attribute",
                    prefix: "app",
                    style: "camelCase",
                },
            ],
            "@angular-eslint/component-selector": [
                "error",
                {
                    type: "element",
                    prefix: "app",
                    style: "kebab-case",
                },
            ],
            
            // Reglas básicas de TypeScript (solo warnings para no bloquear)
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            
            // Prevenir errores comunes
            "no-debugger": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },
    {
        files: ["src/app/modules/gestion-matricula-academica/**/*.html"],
        languageOptions: {
            parser: angularTemplateParser,
        },
        plugins: {
            "@angular-eslint/template": angularTemplatePlugin,
        },
        rules: {
            // Reglas básicas de template
            "@angular-eslint/template/banana-in-box": "error", // Detectar [()] mal escritos
            "@angular-eslint/template/no-negated-async": "warn", // Evitar !async en templates
        },
    },
];
