import { readFileSync }  from 'fs'
import {
    dirname,
    join
}                        from 'path'
import { fileURLToPath } from 'url'


const packageInfos = JSON.parse( readFileSync(
    new URL( '../package.json', import.meta.url )
) )
const __filename   = fileURLToPath( import.meta.url )
const __dirname    = dirname( __filename )

const config = {
    'clean':              [
        './builds',
        './tests/units',
        './tests/benchmarks',
        './tests/bundles',
        './docs'
    ],
    'lint':               [
        'configs/**/*.js',
        'sources/**/*.js',
        'tests/**/*.js',
        '!tests/**/builds/*.js',
        '!tests/others/*.js'
    ],
    'doc':                [
        'README.md',
        'gulpfile.mjs',
        './configs/*.js',
        './sources/**/*.js',
        './tests/**/*.js'
    ],
    'check-bundling':     [
        `${ packageInfos.name }.js`
    ],
    'compute-unit-tests': [
        `${ packageInfos.name }.js`
    ],
    'compute-benchmarks': [
        `${ packageInfos.name }.js`,
        'BufferAttribute.js',
        'Face3.js',
        'Box2.js',
        'Box3.js',
        'Line3.js',
        'Plane.js',
        'Ray.js',
        'Sphere.js',
        'Spherical.js',
        'Triangle.js',
        'Fog.js',
    ],
    'builds':             {
        input:     join( __dirname, '../sources', `${ packageInfos.name }.js` ),
        output:    join( __dirname, '../builds' ),
        formats:   [ 'esm', 'cjs', 'iife' ],
        envs:      [ 'dev', 'prod' ],
        sourcemap: true,
        treeshake: true
    }
}

function getGulpConfigForTask( taskName ) {

    return config[ taskName ]

}

export { getGulpConfigForTask }