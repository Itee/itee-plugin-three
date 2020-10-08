/**
 * @module Converters/ObjToThree
 * @desc Export JsonToThree converter class about .obj files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { TAbstractFileConverter } from 'itee-database'
import { OBJLoader }              from 'three-full/sources/loaders/OBJLoader'

/**
 * This class allow to convert .obj files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class ObjToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: TAbstractFileConverter.DumpType.JSON
        } )
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {JSON} data - The dumped data to convert
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

            const loader = new OBJLoader()
            if ( parameters && parameters.materials ) {
                loader.setMaterials( parameters.materials )
            }
            const threeData = loader.parse( data )
            onSuccess( threeData )

        } catch ( error ) {

            onError( error )

        }

    }

}

export { ObjToThree }
