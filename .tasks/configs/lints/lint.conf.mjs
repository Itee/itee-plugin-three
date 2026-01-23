import {
    Configurator,
    MochaRecommendedRulesSet,
    SourceBackendRulesSet,
    SourceFrontendRulesSet,
    SourceRulesSet,
    TestBenchmarksRulesSet,
    TestUnitsRulesSet
} from '@itee/tasks/sources/lints/lint.conf.mjs'

SourceRulesSet.ignores               = [
    'sources/common/loaders/ASCLoader.js',
    'sources/common/loaders/LASLoader.js',
]
SourceRulesSet.rules[ 'no-console' ] = 'warn'

SourceFrontendRulesSet.files = [
    'sources/frontend/**/*.js',
    'sources/common/loaders/ASCLoader.js',
    'sources/common/loaders/LASLoader.js',
]

Configurator.rulesSets = [
    SourceRulesSet,
    SourceFrontendRulesSet,
    SourceBackendRulesSet,
    TestBenchmarksRulesSet,
    TestUnitsRulesSet,
    MochaRecommendedRulesSet
]

export default Configurator.getConfig()
