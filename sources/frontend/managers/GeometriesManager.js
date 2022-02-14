/**
 * @module Managers/GeometriesManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @requires {@link TDataBaseManager}
 * @requires '../../../node_modules/three/src/core/Geometry'
 * @requires { BufferGeometry } from 'three'
 * @requires '../../../node_modules/three/src/core/BufferAttribute'
 *
 */

/* eslint-env browser */

import { TDataBaseManager } from 'itee-client'
import { toEnum }           from 'itee-utils'
import {
    isDefined,
    isNotBoolean,
    isNull,
    isObject,
    isUndefined
}                           from 'itee-validators'
//import { BufferAttribute }         from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }          from 'three-full/sources/core/BufferGeometry'
//import { Face3 }                   from 'three-full/sources/core/Face3'
//import { Geometry }                from 'three-full/sources/core/Geometry'
//import { InstancedBufferGeometry } from 'three-full/sources/core/InstancedBufferGeometry'
//import { Shape }                   from 'three-full/sources/core/Shape'
//import {
//    BoxBufferGeometry,
//    BoxGeometry
//}                                  from 'three-full/sources/geometries/BoxGeometry'
//import {
//    CircleBufferGeometry,
//    CircleGeometry
//}                                  from 'three-full/sources/geometries/CircleGeometry'
//import {
//    ConeBufferGeometry,
//    ConeGeometry
//}                                  from 'three-full/sources/geometries/ConeGeometry'
//import {
//    CylinderBufferGeometry,
//    CylinderGeometry
//}                                  from 'three-full/sources/geometries/CylinderGeometry'
//import {
//    DodecahedronBufferGeometry,
//    DodecahedronGeometry
//}                                  from 'three-full/sources/geometries/DodecahedronGeometry'
//import { EdgesGeometry }           from 'three-full/sources/geometries/EdgesGeometry'
//import {
//    ExtrudeBufferGeometry,
//    ExtrudeGeometry
//}                                  from 'three-full/sources/geometries/ExtrudeGeometry'
//import {
//    IcosahedronBufferGeometry,
//    IcosahedronGeometry
//}                                  from 'three-full/sources/geometries/IcosahedronGeometry'
//import {
//    LatheBufferGeometry,
//    LatheGeometry
//}                                  from 'three-full/sources/geometries/LatheGeometry'
//import {
//    OctahedronBufferGeometry,
//    OctahedronGeometry
//}                                  from 'three-full/sources/geometries/OctahedronGeometry'
//import {
//    ParametricBufferGeometry,
//    ParametricGeometry
//}                                  from 'three-full/sources/geometries/ParametricGeometry'
//import {
//    PlaneBufferGeometry,
//    PlaneGeometry
//}                                  from 'three-full/sources/geometries/PlaneGeometry'
//import {
//    PolyhedronBufferGeometry,
//    PolyhedronGeometry
//}                                  from 'three-full/sources/geometries/PolyhedronGeometry'
//import {
//    RingBufferGeometry,
//    RingGeometry
//}                                  from 'three-full/sources/geometries/RingGeometry'
//import { ShapeGeometry }           from 'three-full/sources/geometries/ShapeGeometry'
//import {
//    SphereBufferGeometry,
//    SphereGeometry
//}                                  from 'three-full/sources/geometries/SphereGeometry'
//import {
//    TetrahedronBufferGeometry,
//    TetrahedronGeometry
//}                                  from 'three-full/sources/geometries/TetrahedronGeometry'
//import {
//    TextBufferGeometry,
//    TextGeometry
//}                                  from 'three-full/sources/geometries/TextGeometry'
//import {
//    TorusBufferGeometry,
//    TorusGeometry
//}                                  from 'three-full/sources/geometries/TorusGeometry'
//import {
//    TorusKnotBufferGeometry,
//    TorusKnotGeometry
//}                                  from 'three-full/sources/geometries/TorusKnotGeometry'
//import {
//    TubeBufferGeometry,
//    TubeGeometry
//}                                  from 'three-full/sources/geometries/TubeGeometry'
//import { WireframeGeometry }       from 'three-full/sources/geometries/WireframeGeometry'
//import { Vector3 }                 from 'three-full/sources/math/Vector3'
// Waiting three-shaking fix
import {
    BoxBufferGeometry,
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    CircleBufferGeometry,
    CircleGeometry,
    ConeBufferGeometry,
    ConeGeometry,
    CylinderBufferGeometry,
    CylinderGeometry,
    DodecahedronBufferGeometry,
    DodecahedronGeometry,
    EdgesGeometry,
    ExtrudeBufferGeometry,
    ExtrudeGeometry,
    Face3,
    Geometry,
    IcosahedronBufferGeometry,
    IcosahedronGeometry,
    InstancedBufferGeometry,
    LatheBufferGeometry,
    LatheGeometry,
    OctahedronBufferGeometry,
    OctahedronGeometry,
    ParametricBufferGeometry,
    ParametricGeometry,
    PlaneBufferGeometry,
    PlaneGeometry,
    PolyhedronBufferGeometry,
    PolyhedronGeometry,
    RingBufferGeometry,
    RingGeometry,
    Shape,
    ShapeGeometry,
    SphereBufferGeometry,
    SphereGeometry,
    TetrahedronBufferGeometry,
    TetrahedronGeometry,
    TextBufferGeometry,
    TextGeometry,
    TorusBufferGeometry,
    TorusGeometry,
    TorusKnotBufferGeometry,
    TorusKnotGeometry,
    TubeBufferGeometry,
    TubeGeometry,
    Vector3,
    WireframeGeometry
}                           from 'three-full'

const ArrayType = toEnum( {
    Int8Array:         0,
    Uint8Array:        1,
    Uint8ClampedArray: 2,
    Int16Array:        3,
    Uint16Array:       4,
    Int32Array:        5,
    Uint32Array:       6,
    Float32Array:      7,
    Float64Array:      8
} )

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class GeometriesManager extends TDataBaseManager {

    /**
     *
     * @param parameters
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:              '/geometries',
                projectionSystem:      'zBack',
                globalScale:           1,
                computeNormals:        true,
                computeBoundingBox:    true,
                computeBoundingSphere: true
            }, ...parameters
        }

        super( _parameters )

        this.projectionSystem      = _parameters.projectionSystem
        this.globalScale           = _parameters.globalScale
        this.computeNormals        = _parameters.computeNormals
        this.computeBoundingBox    = _parameters.computeBoundingBox
        this.computeBoundingSphere = _parameters.computeBoundingSphere
    }

    //// Getter/Setter

    get computeBoundingBox () {
        return this._computeBoundingBox
    }

    set computeBoundingBox ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute bounding box cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute bounding box cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute bounding box cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeBoundingBox = value
    }

    get computeBoundingSphere () {
        return this._computeBoundingSphere
    }

    set computeBoundingSphere ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute bounding sphere cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeBoundingSphere = value
    }

    get computeNormals () {
        return this._computeNormals
    }

    set computeNormals ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute normals cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute normals cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute normals cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeNormals = value
    }

    get projectionSystem () {
        return this._projectionSystem
    }

    set projectionSystem ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

        this._projectionSystem = value

    }

    get globalScale () {
        return this._globalScale
    }

    set globalScale ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

        this._globalScale = value

    }

    setComputeBoundingBox ( value ) {

        this.computeBoundingBox = value
        return this

    }

    setComputeBoundingShpere ( value ) {

        this.computeBoundingSphere = value
        return this

    }

    setComputeNormals ( value ) {
        this.computeNormals = value
        return this
    }

    setProjectionSystem ( value ) {

        this.projectionSystem = value
        return this

    }

    setGlobalScale ( value ) {

        this.globalScale = value
        return this

    }

    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

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

            onProgress( new ProgressEvent( 'GeometriesManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) )

        }

        onSuccess( results )

    }

    /**
     * @public
     * @memberOf GeometriesManager.prototype
     *
     * @param data
     * @returns {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'GeometriesManager: Unable to convert null or undefined data !' )
        }

        const geometryType = data.type
        if ( !geometryType ) {
            throw new Error( 'GeometriesManager: Unable to convert untyped data !' )
        }

        let geometry = null

        // Keep backward compat to next Major release
        if ( data.isBufferGeometry || geometryType.includes( 'BufferGeometry' ) ) {

            geometry = this._convertJsonToBufferGeometry( data )
            if ( this._computeNormals ) {
                geometry.computeVertexNormals()
            }

        } else if ( data.isGeometry || geometryType.includes( 'Geometry' ) ) {

            geometry = this._convertJsonToGeometry( data )
            if ( this._computeNormals ) {
                geometry.computeFaceNormals()
            }

        } else {

            throw new Error( `TGeometriesManager: Unable to retrieve geometry of type ${ geometryType } !` )

        }

        // Todo: Allow to force if exist
        if ( this.computeBoundingBox ) {
            geometry.boundingBox = null
            geometry.computeBoundingBox()
        }

        if ( this.computeBoundingSphere ) {
            geometry.boundingSphere = null
            geometry.computeBoundingSphere()
        }

        return geometry

    }

    _convertJsonToGeometry ( data ) {

        const geometryType = data.types
        let geometry       = null

        switch ( geometryType ) {

            case 'BoxGeometry':
                geometry = new BoxGeometry()
                break

            case 'CircleGeometry':
                geometry = new CircleGeometry()
                break

            case 'CylinderGeometry':
                geometry = new CylinderGeometry()
                break

            case 'ConeGeometry':
                geometry = new ConeGeometry()
                break

            case 'EdgesGeometry':
                geometry = new EdgesGeometry()
                break

            case 'DodecahedronGeometry':
                geometry = new DodecahedronGeometry()
                break

            case 'ExtrudeGeometry':
                geometry = new ExtrudeGeometry()
                break

            case 'Geometry':
                geometry = new Geometry()
                break

            case 'IcosahedronGeometry':
                geometry = new IcosahedronGeometry()
                break

            case 'LatheGeometry':
                geometry = new LatheGeometry()
                break

            case 'OctahedronGeometry':
                geometry = new OctahedronGeometry()
                break

            case 'ParametricGeometry':
                geometry = new ParametricGeometry()
                break

            case 'PlaneGeometry':
                geometry = new PlaneGeometry()
                break

            case 'PolyhedronGeometry':
                geometry = new PolyhedronGeometry()
                break

            case 'RingGeometry':
                geometry = new RingGeometry()
                break

            case 'ShapeGeometry':
                geometry = new ShapeGeometry()
                break

            case 'TetrahedronGeometry':
                geometry = new TetrahedronGeometry()
                break

            case 'TextGeometry':
                geometry = new TextGeometry()
                break

            case 'TorusGeometry':
                geometry = new TorusGeometry()
                break

            case 'TorusKnotGeometry':
                geometry = new TorusKnotGeometry()
                break

            case 'TubeGeometry':
                geometry = new TubeGeometry()
                break

            case 'SphereGeometry':
                geometry = new SphereGeometry()
                break

            case 'WireframeGeometry':
                geometry = new WireframeGeometry()
                break

            default:
                throw new Error( `TGeometriesManager: Unknown geometry of type: ${ geometryType }` )

        }

        geometry.uuid = data.uuid
        geometry.name = data.name
        geometry.type = data.type

        var vertices = []
        var vertex   = undefined
        for ( var index = 0, numberOfVertices = data.vertices.length ; index < numberOfVertices ; ++index ) {

            vertex = data.vertices[ index ]
            vertices.push( new Vector3( vertex.x, vertex.y, vertex.z ) )

        }
        geometry.vertices = vertices
        //                geometry.colors                  = data.colors

        var faces = []
        var face  = undefined
        for ( var faceIndex = 0, numberOfFaces = data.faces.length ; faceIndex < numberOfFaces ; faceIndex++ ) {
            face = data.faces[ faceIndex ]
            faces.push( new Face3( face.a, face.b, face.c, face.normal, face.color, face.materialIndex ) )
        }
        geometry.faces         = faces
        //                geometry.faceVertexUvs           = [ [ Number ] ]
        geometry.morphTargets  = []
        geometry.morphNormals  = []
        geometry.skinWeights   = []
        geometry.skinIndices   = []
        geometry.lineDistances = []

        geometry.elementsNeedUpdate      = true //data.elementsNeedUpdate
        geometry.verticesNeedUpdate      = true //data.verticesNeedUpdate
        geometry.uvsNeedUpdate           = true //data.uvsNeedUpdate
        geometry.normalsNeedUpdate       = true //data.normalsNeedUpdate
        geometry.colorsNeedUpdate        = true //data.colorsNeedUpdate
        geometry.lineDistancesNeedUpdate = true //data.lineDistancesNeedUpdate
        geometry.groupsNeedUpdate        = true //data.groupsNeedUpdate

    }

    _convertJsonToBufferGeometry ( data ) {

        const bufferGeometryType = data.type
        let bufferGeometry       = null

        switch ( bufferGeometryType ) {

            case 'BoxBufferGeometry':
                bufferGeometry = new BoxBufferGeometry()
                break

            case 'BufferGeometry':
                bufferGeometry = new BufferGeometry()
                break

            case 'CircleBufferGeometry':
                bufferGeometry = new CircleBufferGeometry()
                break

            case 'CylinderBufferGeometry':
                bufferGeometry = new CylinderBufferGeometry()
                break

            case 'ConeBufferGeometry':
                bufferGeometry = new ConeBufferGeometry()
                break

            case 'DodecahedronBufferGeometry':
                bufferGeometry = new DodecahedronBufferGeometry()
                break

            case 'ExtrudeBufferGeometry':
                bufferGeometry = new ExtrudeBufferGeometry()
                break

            case 'IcosahedronBufferGeometry':
                bufferGeometry = new IcosahedronBufferGeometry()
                break

            case 'LatheBufferGeometry':
                bufferGeometry = new LatheBufferGeometry()
                break

            case 'OctahedronBufferGeometry':
                bufferGeometry = new OctahedronBufferGeometry()
                break

            case 'ParametricBufferGeometry':
                bufferGeometry = new ParametricBufferGeometry()
                break

            case 'PlaneBufferGeometry':
                bufferGeometry = new PlaneBufferGeometry()
                break

            case 'PolyhedronBufferGeometry':
                bufferGeometry = new PolyhedronBufferGeometry()
                break

            case 'RingBufferGeometry':
                bufferGeometry = new RingBufferGeometry()
                break

            case 'ShapeBufferGeometry':
                bufferGeometry = new BufferGeometry()
                //                bufferGeometry = new ShapeBufferGeometry(  )
                break

            case 'TetrahedronBufferGeometry':
                bufferGeometry = new TetrahedronBufferGeometry()
                break

            case 'TextBufferGeometry':
                bufferGeometry = new TextBufferGeometry()
                break

            case 'TorusBufferGeometry':
                bufferGeometry = new TorusBufferGeometry()
                break

            case 'TorusKnotBufferGeometry':
                bufferGeometry = new TorusKnotBufferGeometry()
                break

            case 'TubeBufferGeometry':
                bufferGeometry = new TubeBufferGeometry()
                break

            case 'SphereBufferGeometry':
                bufferGeometry = new SphereBufferGeometry()
                break

            case 'InstancedBufferGeometry':
                bufferGeometry = new InstancedBufferGeometry()
                break

            default:
                throw new Error( `TGeometriesManager: Unknown buffer geometry of type: ${ bufferGeometryType }` )

        }

        // COMMON PARTS
        bufferGeometry._id  = data._id
        bufferGeometry.uuid = data.uuid
        bufferGeometry.name = data.name

        // Extract index
        const dataIndexes = data.index
        if ( dataIndexes && dataIndexes.array && dataIndexes.array.length > 0 ) {

            const arrayBuffer    = this.__convertBase64ToArrayBuffer( dataIndexes.array )
            const typedArray     = this.__convertArrayBufferToTypedArray( arrayBuffer )
            bufferGeometry.index = new BufferAttribute( typedArray, dataIndexes.itemSize, dataIndexes.normalized )

        }

        // Extract attributes
        const dataAttributes = data.attributes
        if ( dataAttributes ) {

            let attributes = {}

            // TODO: using loop instead !!
            const positionAttributes = dataAttributes.position
            if ( positionAttributes ) {

                const arrayBuffer = this.__convertBase64ToArrayBuffer( positionAttributes.array )
                const typedArray  = this.__convertArrayBufferToTypedArray( arrayBuffer )
                const globalScale = this.globalScale

                const positionArray = new Float32Array( typedArray )

                if ( this._projectionSystem === 'zBack' ) {

                    let x = null
                    let y = null
                    let z = null
                    for ( let pi = 0, numPos = positionArray.length ; pi < numPos ; pi += 3 ) {
                        x                       = positionArray[ pi ] / globalScale
                        y                       = positionArray[ pi + 2 ] / globalScale
                        z                       = -positionArray[ pi + 1 ] / globalScale
                        positionArray[ pi ]     = x
                        positionArray[ pi + 1 ] = y
                        positionArray[ pi + 2 ] = z
                    }

                } else {

                    for ( let posIndex = 0, numPos = positionArray.length ; posIndex < numPos ; posIndex++ ) {
                        positionArray[ posIndex ] /= globalScale
                    }

                }

                attributes[ 'position' ] = new BufferAttribute( positionArray, positionAttributes.itemSize, positionAttributes.normalized )

            }

            const normalAttributes = dataAttributes.normal
            if ( normalAttributes ) {

                const arrayBuffer      = this.__convertBase64ToArrayBuffer( normalAttributes.array )
                const typedArray       = this.__convertArrayBufferToTypedArray( arrayBuffer )
                attributes[ 'normal' ] = new BufferAttribute( typedArray, normalAttributes.itemSize, normalAttributes.normalized )

            }

            const uvAttributes = dataAttributes.uv
            if ( uvAttributes ) {

                const arrayBuffer  = this.__convertBase64ToArrayBuffer( uvAttributes.array )
                const typedArray   = this.__convertArrayBufferToTypedArray( arrayBuffer )
                attributes[ 'uv' ] = new BufferAttribute( typedArray, uvAttributes.itemSize, uvAttributes.normalized )

            }

            bufferGeometry.attributes = attributes

        }

        if ( isDefined( data.groups ) ) {
            bufferGeometry.groups = data.groups
        }

        // Need to set null because only checked vs undefined data.boundingBox
        if ( isDefined( data.boundingBox ) ) {
            bufferGeometry.boundingBox = data.boundingBox
        }

        // idem... data.boundingSphere
        if ( isDefined( data.boundingSphere ) ) {
            bufferGeometry.boundingSphere = data.boundingSphere
        }

        //        if ( isDefined( data.drawRange ) ) {
        //            bufferGeometry.drawRange = data.drawRange
        //        }

        if ( bufferGeometryType === 'ShapeBufferGeometry' ) {

            bufferGeometry.shapes        = data.shapes.map( jsonShape => {return new Shape().fromJSON( jsonShape )} )
            bufferGeometry.curveSegments = data.curveSegments

        }

        return bufferGeometry

    }

    __convertArrayBufferToTypedArray ( arrayBuffer ) {

        const ONE_BYTE       = 1
        const TWO_BYTE       = 2
        const FOUR_BYTE      = 4
        const HEIGHT_BYTE    = 8
        const dataView       = new DataView( arrayBuffer )
        const dataByteLength = arrayBuffer.byteLength - 1
        const type           = dataView.getUint8( 0 )

        let typedArray = null

        switch ( type ) {

            case ArrayType.Int8Array:
                typedArray = new Int8Array( dataByteLength / ONE_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getInt8( offset )
                }
                break

            case ArrayType.Uint8Array:
                typedArray = new Uint8Array( dataByteLength / ONE_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getUint8( offset )
                }
                break

            case ArrayType.Uint8ClampedArray:
                typedArray = new Uint8ClampedArray( dataByteLength / ONE_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getUint8( offset )
                }
                break

            case ArrayType.Int16Array:
                typedArray = new Int16Array( dataByteLength / TWO_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += TWO_BYTE ) {
                    typedArray[ index ] = dataView.getInt16( offset )
                }
                break

            case ArrayType.Uint16Array:
                typedArray = new Uint16Array( dataByteLength / TWO_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += TWO_BYTE ) {
                    typedArray[ index ] = dataView.getUint16( offset )
                }
                break

            case ArrayType.Int32Array:
                typedArray = new Int32Array( dataByteLength / FOUR_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getInt32( offset )
                }
                break

            case ArrayType.Uint32Array:
                typedArray = new Uint32Array( dataByteLength / FOUR_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getUint32( offset )
                }
                break

            case ArrayType.Float32Array:
                typedArray = new Float32Array( dataByteLength / FOUR_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getFloat32( offset )
                }
                break

            case ArrayType.Float64Array:
                typedArray = new Float64Array( dataByteLength / HEIGHT_BYTE )
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += HEIGHT_BYTE ) {
                    typedArray[ index ] = dataView.getFloat64( offset )
                }
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${ type }` )

        }

        return typedArray

    }

    __convertBase64ToArrayBuffer ( base64 ) {

        const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
        const lookup = new Uint8Array( 256 )
        for ( let i = 0 ; i < chars.length ; i++ ) {
            lookup[ chars.charCodeAt( i ) ] = i
        }

        ////////

        const base64Length = base64.length

        let bufferLength = base64Length * 0.75
        if ( base64[ base64Length - 1 ] === '=' ) {
            bufferLength--
            if ( base64[ base64Length - 2 ] === '=' ) {
                bufferLength--
            }
        }

        let arraybuffer = new ArrayBuffer( bufferLength )
        let bytes       = new Uint8Array( arraybuffer )
        let encoded1    = undefined
        let encoded2    = undefined
        let encoded3    = undefined
        let encoded4    = undefined

        for ( let i = 0, pointer = 0 ; i < base64Length ; i += 4 ) {
            encoded1 = lookup[ base64.charCodeAt( i ) ]
            encoded2 = lookup[ base64.charCodeAt( i + 1 ) ]
            encoded3 = lookup[ base64.charCodeAt( i + 2 ) ]
            encoded4 = lookup[ base64.charCodeAt( i + 3 ) ]

            bytes[ pointer++ ] = ( encoded1 << 2 ) | ( encoded2 >> 4 )
            bytes[ pointer++ ] = ( ( encoded2 & 15 ) << 4 ) | ( encoded3 >> 2 )
            bytes[ pointer++ ] = ( ( encoded3 & 3 ) << 6 ) | ( encoded4 & 63 )
        }

        return arraybuffer

    }

}

export { GeometriesManager }
