/**
 * @module Loader/SHPLoader
 * @desc Export SHPLoader to load .shp files
 *
 * @requires {@link https://github.com/Itee/itee-client itee-client}
 * @requires {@link https://github.com/Itee/itee-utils itee-utils}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    Endianness,
    TBinaryReader
}                        from 'itee-client'
import { DefaultLogger } from 'itee-core'
import {
    ringClockwise,
    ringContainsSome,
    toEnum
}                        from 'itee-utils'
//import { Shape }                 from 'three-full/sources/core/Shape'
//import { FileLoader }            from 'three-full/sources/loaders/FileLoader'
//import { DefaultLoadingManager } from 'three-full/sources/loaders/LoadingManager'
//import { Vector3 }               from 'three-full/sources/math/Vector3'
// Waiting three-shaking fix
import {
    DefaultLoadingManager,
    FileLoader,
    Shape,
    Vector3
}                        from 'three-full'

/**
 *
 * @type {Object}
 */
const ShapeType = toEnum( {
    NullShape:   0,
    Point:       1,
    Polyline:    3,
    Polygon:     5,
    MultiPoint:  8,
    PointZ:      11,
    PolyLineZ:   13,
    PolygonZ:    15,
    MultiPointZ: 18,
    PointM:      21,
    PolylineM:   23,
    PolygonM:    25,
    MultiPointM: 28,
    MultiPatch:  31
} )

/**
 * @class
 * @classdesc This class allow to split any geometries type during runtime.
 * Keeping normals and Uvs. It is really usefull to see inside mesh like building.
 * @export
 */
class SHPLoader {

    //    static FileCode      = 9994
    //    static MinFileLength = 100
    //    static MinVersion    = 1000

    /**
     *
     * Because ctor is blablabla
     *
     * @param manager
     * @param logger
     * @constructor
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                manager:      DefaultLoadingManager,
                logger:       DefaultLogger,
                reader:       new TBinaryReader(),
                globalOffset: new Vector3( 0, 0, 0 ),
                worldAxis:    {
                    from: 'zUp',
                    to:   'zForward'
                }
            }, ...parameters
        }

        this.manager      = _parameters.manager
        this.logger       = _parameters.logger
        this.reader       = _parameters.reader
        this.globalOffset = _parameters.globalOffset
        this.worldAxis    = _parameters.worldAxis

    }

    get globalOffset () {
        return this._globalOffset
    }

    set globalOffset ( value ) {
        this._globalOffset = value
    }

    get worldAxis () {
        return this._worldAxis
    }

    set worldAxis ( value ) {
        this._worldAxis = value
    }

    get manager () {
        return this._manager
    }

    set manager ( value ) {
        this._manager = value
    }

    get logger () {
        return this._logger
    }

    set logger ( value ) {
        this._logger = value
    }

    get reader () {
        return this._reader
    }

    set reader ( value ) {
        this._reader = value
    }

    setGlobalOffset ( value ) {
        this.globalOffset = value
        return this
    }

    setWorldAxis ( value ) {
        this.worldAxis = value
        return this
    }

    setManager ( value ) {
        this.manager = value
        return this
    }

    setLogger ( value ) {
        this.logger = value
        return this
    }

    setReader ( value ) {
        this.reader = value
        return this
    }

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( url, onLoad, onProgress, onError ) {

        const scope = this

        const loader = new FileLoader( scope.manager )
        loader.setResponseType( 'arraybuffer' )
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) )

        }, onProgress, onError )

    }

    /**
     *
     * @param arrayBuffer
     * @return {*}
     */
    parse ( arrayBuffer ) {

        this._reader
            .setEndianess( Endianness.Big )
            .setBuffer( arrayBuffer )

        const header = this._parseHeader()

        if ( header.fileCode !== SHPLoader.FileCode ) {
            this.logger.error( 'SHPLoader: Invalide Shape file code !' )
            return null
        }

        if ( header.fileLength < SHPLoader.MinFileLength ) {
            this.logger.error( 'SHPLoader: Shape file have an incorrect length !' )
            return null
        }

        if ( !Object.values( ShapeType ).includes( header.shapeType ) ) {
            this.logger.error( 'SHPLoader: Shape file have an incorrect shape type !' )
            return null
        }

        if ( header.version < SHPLoader.MinVersion ) {
            this.logger.warn( 'SHPLoader: Version of shape file below than 1000 could be incorrectly parsed !' )
        }

        const datas  = this._parseDatas( header )
        const shapes = this._convertToObjects( datas )

        return shapes

    }

    /**
     *
     * @return {{fileCode, fileLength, version, shapeType, boundingBox: {xMin, xMax, yMin, yMax, zMin, zMax, mMin, mMax}}}
     * @private
     */
    _parseHeader () {

        const fileCode = this._reader.getInt32()
        this._reader.skipOffsetOf( 20 )
        const fileLength = this._reader.getInt32()

        this._reader.setEndianess( Endianness.Little )

        const version         = this._reader.getInt32()
        const shapeType       = this._reader.getInt32()
        const xMinBoundingBox = this._reader.getInt32()
        const yMinBoundingBox = this._reader.getInt32()
        const xMaxBoundingBox = this._reader.getInt32()
        const yMaxBoundingBox = this._reader.getInt32()
        const zMinBoundingBox = this._reader.getInt32()
        const zMaxBoundingBox = this._reader.getInt32()
        const mMinBoundingBox = this._reader.getInt32()
        const mMaxBoundingBox = this._reader.getInt32()

        return {
            fileCode:    fileCode,
            fileLength:  fileLength,
            version:     version,
            shapeType:   shapeType,
            boundingBox: {
                xMin: xMinBoundingBox,
                xMax: xMaxBoundingBox,
                yMin: yMinBoundingBox,
                yMax: yMaxBoundingBox,
                zMin: zMinBoundingBox,
                zMax: zMaxBoundingBox,
                mMin: mMinBoundingBox,
                mMax: mMaxBoundingBox
            }
        }

    }

    /**
     *
     * @param header
     * @return {Array}
     * @private
     */
    _parseDatas ( header ) {

        this._reader.skipOffsetTo( 100 )

        let datas         = []
        let recordHeader  = undefined
        let endOfRecord   = undefined
        let recordContent = undefined

        while ( !this._reader.isEndOfFile() ) {

            recordHeader = this._parseRecordHeader()
            endOfRecord  = this._reader.getOffset() + ( recordHeader.contentLength * 2 )

            // All parsing methods use little below
            this._reader.setEndianess( Endianness.Little )

            switch ( header.shapeType ) {

                case ShapeType.NullShape:

                    this._reader.skipOffsetTo( endOfRecord )

                    //                    // Todo: just skip 1 byte - or - to endRecord
                    //                    while ( this._reader.getOffset() < endOfRecord ) {
                    //
                    //                        recordContent = this._parseNull();
                    //                        if ( recordContent ) {
                    //                            datas.push( recordContent );
                    //                        }
                    //
                    //                    }
                    break

                case ShapeType.Point:
                case ShapeType.PointZ:
                case ShapeType.PointM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePoint()
                        if ( recordContent ) {
                            datas.push( recordContent )
                        }

                    }
                    break

                case ShapeType.Polyline:
                case ShapeType.PolyLineZ:
                case ShapeType.PolylineM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolyLine()
                        if ( recordContent ) {
                            datas.push( recordContent )
                        }

                    }
                    break

                case ShapeType.Polygon:
                case ShapeType.PolygonZ:
                case ShapeType.PolygonM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolyLine()
                        //                        recordContent = this._parsePolygon();
                        if ( recordContent ) {
                            datas.push( recordContent )
                        }

                    }
                    break

                case ShapeType.MultiPoint:
                case ShapeType.MultiPointZ:
                case ShapeType.MultiPointM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPoint()
                        if ( recordContent ) {
                            datas.push( recordContent )
                        }

                    }
                    break

                case ShapeType.MultiPatch:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPatch()
                        if ( recordContent ) {
                            datas.push( recordContent )
                        }

                    }
                    break

                default:
                    this.logger.error( `SHPLoader: Invalid switch parameter: ${ header.shapeType }` )
                    break

            }

        }

        return datas

    }

    /**
     *
     * @return {{recordNumber, contentLength}}
     * @private
     */
    _parseRecordHeader () {

        this._reader.setEndianess( Endianness.Big )

        const recordNumber  = this._reader.getInt32()
        const contentLength = this._reader.getInt32()

        return {
            recordNumber,
            contentLength
        }

    }

    _parseNull () {

        this._reader.getInt32()
        return null

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parsePoint () {

        const shapeType = this._reader.getInt32()
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const x = this._reader.getFloat64()
        const y = this._reader.getFloat64()

        return {
            shapeType,
            x,
            y
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parsePolyLine () {

        const shapeType = this._reader.getInt32()
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        }

        const numberOfParts  = this._reader.getInt32()
        const numberOfPoints = this._reader.getInt32()

        const parts = new Array( numberOfParts )
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32()
        }

        const points = new Array( numberOfPoints )
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getFloat64(),
                y: this._reader.getFloat64()
            }
        }

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            points
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parsePolygon () {

        const shapeType = this._reader.getInt32()
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        }

        const numberOfParts  = this._reader.getInt32()
        const numberOfPoints = this._reader.getInt32()

        let parts = new Array( numberOfParts )
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32()
        }

        let points = new Array( numberOfPoints )
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getFloat64(),
                y: this._reader.getFloat64()
            }
        }

        const polygons = []
        const holes    = []

        parts.forEach( ( value, index ) => {

            const ring = points.slice( value, parts[ index + 1 ] )

            if ( ringClockwise( ring ) ) {

                polygons.push( ring )
                //					polygons.push( [ ring ] );

            } else {

                holes.push( ring )

            }

        } )

        holes.forEach( hole => {

            polygons.some( polygon => {

                if ( ringContainsSome( polygon[ 0 ], hole ) ) {
                    polygon.push( hole )
                    return true
                }

            } ) || polygons.push( [ hole ] )

        } )

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            polygons
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parseMultiPoint () {

        const shapeType = this._reader.getInt32()
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        }

        const numberOfPoints = this._reader.getInt32()

        const points = new Array( numberOfPoints )

        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points.push( [ this._reader.getFloat64(), this._reader.getFloat64() ] )
        }

        return {
            shapeType,
            boundingBox,
            numberOfPoints,
            points
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parseMultiPatch () {

        const shapeType = this._reader.getInt32()
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        return {
            shapeType
        }

    }

    /**
     *
     * @param datas
     * @return {Array}
     * @private
     */
    _convertToObjects ( datas ) {

        let shapes = []

        for ( let index = 0, numberOfShapes = datas.length ; index < numberOfShapes ; index++ ) {
            let data = datas[ index ]

            if ( data.shapeType === ShapeType.Polygon || data.shapeType === ShapeType.PolygonZ || data.shapeType === ShapeType.PolygonM ) {

                if ( data.points && Array.isArray( data.points[ 0 ] ) ) {

                    __createObjectsFromArrays( data.points )

                } else {

                    __createObjectFromPoints( data.points )

                }

            }

        }

        function __createObjectsFromArrays ( arrays ) {

            //Todo: need to fix parsePolygon to avoid too much array imbrication

            for ( let arrayIndex = 0, numberOfArray = arrays.length ; arrayIndex < numberOfArray ; arrayIndex++ ) {

                let array = arrays[ arrayIndex ]

                if ( !array ) {
                    this.logger.log( 'no array, oups !' )
                    continue
                }

                if ( Array.isArray( array[ 0 ] ) ) {

                    __createObjectsFromArrays( array )

                } else {

                    __createObjectFromPoints( array )

                }

            }

        }

        function __createObjectFromPoints ( points ) {

            shapes.push( new Shape( points ) )

        }

        return shapes

    }

}

SHPLoader.FileCode      = 9994
SHPLoader.MinFileLength = 100
SHPLoader.MinVersion    = 1000

export {
    SHPLoader,
    ShapeType
}
