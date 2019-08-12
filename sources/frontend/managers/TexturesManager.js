/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TDataBaseManager } from 'itee-client'
import { isObject }         from 'itee-validators'

/**
 *
 * @constructor
 */
function TexturesManager () {

    TDataBaseManager.call( this )
    this.basePath = '/textures'

}

TexturesManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

    /**
     *
     */
    constructor: TexturesManager,

    /**
     *
     * @param data
     * @return {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'TexturesManager: Unable to convert null or undefined data !' )
        }

        const textureType = data.type
        let texture       = undefined

        switch ( textureType ) {

            default:
                throw new Error( `TTexturesManager: Unknown texture of type: ${textureType}` )
                break

        }

        // Common object properties

        if ( textureType === 'Line' ) {

        }

        return texture

    }

} )

Object.defineProperties( TexturesManager.prototype, {

    /**
     *
     */
    _onJson: {
        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

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

} )

export { TexturesManager }
