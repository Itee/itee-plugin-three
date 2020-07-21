/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TAbstractFileConverter } from 'itee-database'
import { STLLoader }              from 'three-full/sources/loaders/STLLoader'

class StlToThree extends TAbstractFileConverter {

    constructor () {
        super( {
            dumpType: TAbstractFileConverter.DumpType.JSON
        } )
    }

    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError )

        try {

            const loader    = new STLLoader()
            const threeData = loader.parse( data )
            onSuccess( threeData )

        } catch ( error ) {

            onError( error )

        }

    }

}

export { StlToThree }
