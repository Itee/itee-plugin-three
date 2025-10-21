const lintConf = [
    'configs/**/*.js',
    'sources/**/*.js',
    'tests/**/*.js',
    '!tests/**/builds/*.js',
    '!tests/bundles/**/*.js',
    '!tests/others/*.js'
]

export { lintConf }