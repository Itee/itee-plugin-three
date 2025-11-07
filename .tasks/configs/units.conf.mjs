import { playwrightLauncher } from '@web/test-runner-playwright'

export default {
    files:       [
        'tests/units/**/*.unit.mjs',
        '!tests/units/builds/**',
        '!tests/units/file-system/**',
    ],
    debug:       false,
    nodeResolve: true,
    browsers:    [
        playwrightLauncher( { product: 'chromium' } ),
        playwrightLauncher( { product: 'webkit' } ),
        playwrightLauncher( { product: 'firefox' } ),
    ]
}