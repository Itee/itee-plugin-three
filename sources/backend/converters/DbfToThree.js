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
import { DBFLoader }              from '../../common/loaders/DBFLoader'

class DbfToThree extends TAbstractFileConverter {

    constructor () {
        super( {dumpType:TAbstractFileConverter.DumpType.ArrayBuffer} )
    }

    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError )

        try {

            const loader    = new DBFLoader()
            const threeData = loader.parse( data )
            onSuccess( threeData )

        } catch ( error ) {

            onError( error )

        }

    }

}

export { DbfToThree }
