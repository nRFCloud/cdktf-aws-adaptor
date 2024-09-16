/**
 * @type {import('vitest/config').UserConfigExport}
 */
const config = {
    test: {
        globals: true,
        typecheck: true,
        coverage: {
            enabled: true,
            reporter: ["json", "html", "json-summary", "lcov"],
        },
        include: ["src/**/*.spec.ts"],
    }
}

export default config;
