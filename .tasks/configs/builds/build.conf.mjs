import { createRollupConfigs } from '@itee/tasks/sources/utils/builds.mjs'

export default createRollupConfigs( {
    externalMap: {
        'esm':  [
            '@itee/client',
            '@itee/database',
            '@itee/utils',
            '@itee/core',
            '@itee/validators',
            '@itee/mongodb',
            'bson',
            'perf_hooks',
            'three-full'
        ],
        'cjs':  [
            '@itee/client',
            '@itee/database',
            '@itee/utils',
            '@itee/core',
            '@itee/validators',
            '@itee/mongodb',
            'bson',
            'perf_hooks',
            'three-full'
        ],
        'iife': [
            '@itee/client',
            '@itee/utils',
            '@itee/core',
            '@itee/validators',
            'three-full'
        ],
    }
} )
