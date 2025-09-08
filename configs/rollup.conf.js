/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Config-Rollup
 * @description The file manage the rollup configuration for build the library using differents arguments. It allow to build with two type of environment (dev and prod), and differents output format.
 * Use npm run help to display all available build options.
 *
 * @requires {@link module: [rollup-plugin-commonjs]{@link https://github.com/rollup/rollup-plugin-commonjs}}
 * @requires {@link module: [path]{@link https://nodejs.org/api/path.html}}
 * @requires {@link module: [rollup-plugin-re]{@link https://github.com/jetiny/rollup-plugin-re}}
 * @requires {@link module: [rollup-plugin-node-resolve]{@link https://github.com/rollup/rollup-plugin-node-resolve}}
 * @requires {@link module: [rollup-plugin-terser]{@link https://github.com/TrySound/rollup-plugin-terser}}
 */

const packageInfos    = require( '../package' )
const path            = require( 'path' )
//const alias           = require( '@rollup/plugin-alias' )
const commonjs        = require( '@rollup/plugin-commonjs' )
const { nodeResolve } = require( '@rollup/plugin-node-resolve' )
const terser          = require( 'rollup-plugin-terser' ).terser
const replace         = require( 'rollup-plugin-re' )

function _computeBanner ( name, format ) {

    const packageName = name || packageInfos.name
    let prettyFormat  = ''

    switch ( format ) {

        case 'cjs':
            prettyFormat = 'CommonJs'
            break

        case 'esm':
            prettyFormat = 'EsModule'
            break

        case 'iife':
            prettyFormat = 'Standalone'
            break

        case 'umd':
            prettyFormat = 'Universal'
            break

        default:
            throw new RangeError( `Invalid switch parameter: ${ format }` )

    }

    return `console.log('${ packageName } v${ packageInfos.version } - ${ prettyFormat }')`

}

function _computeIntro () {

    return '' +
        'if( iteeValidators === undefined ) { throw new Error(\'Itee.Plugin.Three need Itee.Validators to be defined first. Please check your scripts loading order.\') }' + '\n' +
        'if( iteeUtils === undefined ) { throw new Error(\'Itee.Plugin.Three need Itee.Utils to be defined first. Please check your scripts loading order.\') }' + '\n' +
        'if( iteeCore === undefined ) { throw new Error(\'Itee.Plugin.Three need Itee.Core to be defined first. Please check your scripts loading order.\') }' + '\n' +
        'if( iteeClient === undefined ) { throw new Error(\'Itee.Plugin.Three need Itee.Client to be defined first. Please check your scripts loading order.\') }' + '\n' +
        'if( threeFull === undefined ) { throw new Error(\'Itee.Plugin.Three need Three to be defined first. Please check your scripts loading order.\') }' + '\n'

}

/**
 * Will create an appropriate configuration object for rollup, related to the given arguments.
 *
 * @generator
 * @param options
 * @return {Array.<json>} An array of rollup configuration
 */
function CreateRollupConfigs ( options ) {
    'use strict'

    const {
              name,
              input,
              output,
              formats,
              envs,
              treeshake
          }        = options
    const fileName  = path.basename( input, '.js' )

    const configs = []

    for ( let formatIndex = 0, numberOfFormats = formats.length ; formatIndex < numberOfFormats ; ++formatIndex ) {

        for ( let envIndex = 0, numberOfEnvs = envs.length ; envIndex < numberOfEnvs ; envIndex++ ) {

            const env        = envs[ envIndex ]
            const isProd     = ( env.includes( 'prod' ) )
            const format     = formats[ formatIndex ]
            const outputPath = ( isProd ) ? path.join( output, `${ fileName }.${ format }.min.js` ) : path.join( output, `${ fileName }.${ format }.js` )

            configs.push( {
                input:    input,
                external: ( format === 'cjs' ) ? [
                    'itee-client',
                    'itee-database',
                    'itee-utils',
                    'itee-core',
                    'itee-validators',
                    'itee-mongodb',
                    'bson',
                    'perf_hooks',
                    'three-full'
                ] : [
                    'itee-client',
                    'itee-utils',
                    'itee-core',
                    'itee-validators',
                    'three-full'
                ],
                plugins: [
//                    ( format === 'cjs' ) && alias( {
//                        resolve: [ '.js' ],
//                        entries: [
//                            {
//                                find:        'three-full/sources/loaders/FileLoader',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/LoadingManager',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/core/Shape',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/math/Vector3',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/ColladaLoader',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/FBXLoader',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/ObjectLoader',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/MTLLoader',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/OBJLoader2',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/STLLoader',
//                                replacement: 'three-full'
//                            },
//                            {
//                                find:        'three-full/sources/loaders/TDSLoader',
//                                replacement: 'three-full'
//                            }
//                        ]
//                    } ),
                    replace( {
                        defines: {
                            IS_REMOVE_ON_BACKEND_BUILD:  ( format !== 'cjs' ),
                            IS_REMOVE_ON_FRONTEND_BUILD: ( format === 'cjs' )
                        }
                    } ),
                    commonjs( {
                        include: [ 'sources/backend/**', 'node_modules/**' ]
                    } ),
                    nodeResolve( {
                        preferBuiltins: true
                    } ),
                    isProd && terser()
                ],
                onwarn: ( {
                    loc,
                    frame,
                    message
                } ) => {

                    // Ignore some errors
                    if ( message.includes( 'Circular dependency' ) ) { return }

                    if ( loc ) {
                        process.stderr.write( `/!\\ ${ loc.file } (${ loc.line }:${ loc.column }) ${ frame } ${ message }\n` )
                    } else {
                        process.stderr.write( `/!\\ ${ message }\n` )
                    }

                },
                treeshake: treeshake,
                output:    {
                    // core options
                    file:    outputPath,
                    format:  format,
                    name:    name,
                    globals: {
                        'itee-client':     'Itee.Client',
                        'itee-utils':      'Itee.Utils',
                        'itee-core':       'Itee.Core',
                        'itee-validators': 'Itee.Validators',
                        'three-full':      'Three'
                    },

                    // advanced options
                    paths:     {},
                    banner:    ( isProd ) ? '' : _computeBanner( name, format ),
                    footer:    '',
                    intro:     ( !isProd && format === 'iife' ) ? _computeIntro() : '',
                    outro:     '',
                    sourcemap: !isProd,
                    interop:   true,

                    // danger zone
                    exports: 'auto',
                    amd:     {},
                    indent:  '\t',
                    strict:  true
                }
            } )

        }

    }

    return configs

}

module.exports = CreateRollupConfigs

