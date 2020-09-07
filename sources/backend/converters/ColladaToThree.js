/**
 * @module Converters/ColladaToThree
 * @desc Export JsonToThree converter class about .dae files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { TAbstractFileConverter } from 'itee-database'
import { ColladaLoader }          from 'three-full/sources/loaders/ColladaLoader'

/**
 * This class allow to convert .dae files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class ColladaToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: TAbstractFileConverter.DumpType.ArrayBuffer
        } )
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {ArrayBuffer} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError )

        try {

            const loader    = new ColladaLoader()
            const threeData = loader.parse( data )
            onSuccess( threeData )

        } catch ( error ) {

            onError( error )

        }

    }

}

export { ColladaToThree }
