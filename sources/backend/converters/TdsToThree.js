/**
 * @module Converters/TdsToThree
 * @desc Export JsonToThree converter class about .3ds files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { TAbstractFileConverter } from 'itee-database'
import { TDSLoader }              from 'three-full'

//import { TDSLoader }              from 'three-full/sources/loaders/TDSLoader'

/**
 * This class allow to convert .3ds files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class TdsToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.ArrayBuffer
        } )
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @private
     * @param {File} data - The file descriptor to load and convert
     * @param {Object} parameters
     * @param {callback} onSuccess A callback that will handle the parsed result
     * @param {callback} onProgress A callback that will handle the parsing progress
     * @param {callback} onError A callback that will handle the parsing errors
     * @return {Object}
     */
    _convert( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError )

        try {

            const loader    = new TDSLoader()
            const threeData = loader.parse( data )
            onSuccess( threeData )

        } catch ( error ) {

            onError( error )

        }

    }

}

export { TdsToThree }
