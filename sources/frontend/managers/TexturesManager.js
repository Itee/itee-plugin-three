/**
 * @module Managers/TexturesManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { TDataBaseManager } from '@itee/client'
import { isObject }         from '@itee/validators'

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class TexturesManager extends TDataBaseManager {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                basePath: '/textures'
            },
            ...parameters
        }

        super( _parameters )

    }

    convert( data ) {

        if ( !data ) {
            throw new Error( 'TexturesManager: Unable to convert null or undefined data !' )
        }

        const textureType = data.type
        //        let texture       = undefined

        switch ( textureType ) {

            default:
                throw new Error( `TTexturesManager: Unknown texture of type: ${ textureType }` )

        }

        // Common object properties

        //        if ( textureType === 'Line' ) { }
        //        return texture

    }

    _onJson( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData
        const results = {}

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ]

            try {
                results[ data._id ] = this.convert( data )
            } catch ( err ) {
                onError( err )
            }

            onProgress( dataIndex / numberOfDatas )

        }

        onSuccess( results )
    }

}

export { TexturesManager }
