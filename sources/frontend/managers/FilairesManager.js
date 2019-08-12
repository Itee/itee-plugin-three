/**
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class ClassName
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    DefaultLogger as TLogger,
    ResponseType,
    TDataBaseManager
} from 'itee-client'
import {
    isNotDefined,
    isObject
} from 'itee-validators'
import {
    BufferGeometry,
    Float32BufferAttribute,
    Line,
    LineBasicMaterial,
    Mesh,
    MeshPhongMaterial,
    SphereBufferGeometry
} from 'three-full'

class FilairesManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:               '/',
                responseType:           ResponseType.Json,
                bunchSize:              500,
                requestAggregationTime: 200,
                requestsConcurrency:    6,
                logger:                 TLogger
            }, ...parameters
        }

        super( _parameters )

    }

    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData
        const results = {}

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ]

            try {
                results[ data.id ] = this.convert( data )
            } catch ( err ) {
                onError( err )
            }

            onProgress( new ProgressEvent( 'FilairesManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) )

        }

        onSuccess( results )

    }

    /**
     *
     * @param data
     * @return {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'FilairesManager: Unable to convert null or undefined data !' )
        }

        const objectType = data.type
        let object       = null

        if ( isNotDefined( objectType ) ) {
            throw new Error( `TFilaireManager.convert() : data type must be defined !!!` )
        }

        switch ( objectType ) {

            case 'NaissanceVoute':
                object = this._parseFilaire( data, 0x875100 )
                break

            case 'Radier':
                object = this._parseFilaire( data, 0x0089af )
                break

            case 'Intrados':
                object = this._parseFilaire( data, 0xc100b4 )
                break

            case 'Br':
            case 'Bp':
            case 'Src':
                object = this._parsePoint( data, 0x00ff00 )
                break

            default:
                throw new Error( `TFilaireManager: Unknown object of type: ${objectType}` )

        }

        return object

    }

    _parseFilaire ( data, color ) {

        const geoJson   = JSON.parse( data.geojson )
        const positions = geoJson.coordinates.reduce( ( acc, val ) => acc.concat( val ), [] )

        if ( isNotDefined( positions ) ) {
            throw new Error( `TFilaireManager._parseFilaire() : ${data.type} geometry doesn't contains coordinates !!!` )
        }

        const material = new LineBasicMaterial( {
            color: color
        } )

        const bufferGeometry = new BufferGeometry()
        bufferGeometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) )

        let object = new Line( bufferGeometry, material )
        if ( !isNotDefined( data.type ) ) {
            object.name = ''.concat( data.type, '_' ).concat( data.numero_bloc, '_' ).concat( data.id )
        } else {
            object.name = ''.concat( data.id )
        }

        return object

    }

    _parsePoint ( data, color ) {

        const geoJson   = JSON.parse( data.geojson )
        const positions = geoJson.coordinates.reduce( ( acc, val ) => acc.concat( val ), [] )

        if ( isNotDefined( positions ) ) {
            throw new Error( 'FilairesManager._parsePoint() : '.concat( data.type, ' geometry doesn\'t contains coordinates !!!' ) )
        }

        let geometry = new SphereBufferGeometry( parseFloat( data.attribut ), 50, 50, 0, Math.PI * 2, 0, Math.PI * 2 )
        geometry.computeVertexNormals()

        let material = new MeshPhongMaterial( { color: color } )
        let object   = new Mesh( geometry, material )

        object.position.set( positions[ '0' ], positions[ '1' ], positions[ '2' ] )

        if ( !isNotDefined( data.type ) ) {
            object.name = ''.concat( data.type, '_' ).concat( data.numero_bloc, '_' ).concat( data.id )
        } else {
            object.name = ''.concat( data.id )
        }

        return object

    }

}

export { FilairesManager }
