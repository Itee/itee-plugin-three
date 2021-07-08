/**
 * @module Loader/LASLoader
 * @desc A loader for ASC cloud point files.
 *
 * @requires {@link https://github.com/Itee/itee-client itee-client}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example
 *
 * import { LASLoader } from 'itee-plugin-three'
 *
 * const loader = new LASLoader();
 *
 * // If the ASC file need to be offseted, it can be set before loading file.
 * loader.setOffset( {
 *      x: 1.0,
 *      y: 52.0,
 *      z: -5.0
 * } );
 *
 * // Then load the file and get the threejs Point Geometry
 * loader.load('/path/to/file.asc', function (geometry) {
 *
 *      scene.add( new Mesh( geometry ) );
 *
 * } );
 *
 */

/* eslint-env browser */

import {
    TBinaryReader,
    Byte
}                                from 'itee-client'
import { DefaultLogger }         from 'itee-core'
import {
    BufferAttribute,
    BufferGeometry,
    FileLoader,
    Box3,
    DefaultLoadingManager,
    PointsMaterial,
    Group,
    Points
}                                from 'three-full'
//import { BufferAttribute }       from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }        from 'three-full/sources/core/BufferGeometry'
//import { FileLoader }            from 'three-full/sources/loaders/FileLoader'
//import { Box3 }                  from 'three-full/sources/math/Box3'
//import { DefaultLoadingManager } from 'three-full/sources/loaders/LoadingManager'
//import { PointsMaterial }        from 'three-full/sources/materials/PointsMaterial'
//import { Group }                 from 'three-full/sources/objects/Group'
//import { Points }                from 'three-full/sources/objects/Points'

class BitManager {

    static getBit ( number, bitPosition ) {
        return ( number & ( 1 << bitPosition ) ) === 0 ? 0 : 1
    }

    static setBit ( number, bitPosition ) {
        return number | ( 1 << bitPosition )
    }

    static clearBit ( number, bitPosition ) {
        const mask = ~( 1 << bitPosition )
        return number & mask
    }

    static updateBit ( number, bitPosition, bitValue ) {
        const bitValueNormalized = bitValue ? 1 : 0
        const clearMask          = ~( 1 << bitPosition )
        return ( number & clearMask ) | ( bitValueNormalized << bitPosition )
    }
}

class GlobalEncodingBitField {
    constructor ( bytes ) {
        this._bytes = bytes
    }
}

class GlobalEncodingBitField_1_2 extends GlobalEncodingBitField {
    get GPSTimeType () {
        return ( BitManager.getBit( this._bytes, 0 ) ) ? 'AdjustedStandardGPSTime' : 'GPSWeekTime'
    }
}

class GlobalEncodingBitField_1_3 extends GlobalEncodingBitField_1_2 {

    get WaveformDataPacketsInternal () {
        return !!( BitManager.getBit( this._bytes, 1 ) )
    }

    get WaveformDataPacketsExternal () {
        return !!( BitManager.getBit( this._bytes, 2 ) )
    }

    get ReturnNumbersHaveBeenSyntheticallyGenerated () {
        return ( BitManager.getBit( this._bytes, 3 ) ) ? 'AdjustedStandardGPSTime' : 'GPSWeekTime'
    }

}

class GlobalEncodingBitField_1_4 extends GlobalEncodingBitField_1_3 {

    get SyntheticReturnNumber () {
        return this.ReturnNumbersHaveBeenSyntheticallyGenerated
    }

    get WKT () {
        return ( BitManager.getBit( this._bytes, 4 ) ) ? 'WKT' : 'GeoTIFF'
    }

}

/**
 * The LASLoader class definition.
 * It allow to load and parse an .asc file
 *
 * @class
 */
class LASLoader {

    /**
     * @constructor
     * @param {LoadingManager} [manager=Itee.Client.DefaultLoadingManager] - A loading manager
     * @param {TLogger} [logger=Itee.Client.DefaultLogger] - A logger for any log/errors output
     */
    constructor ( manager = DefaultLoadingManager, logger = DefaultLogger ) {

        this.manager = manager
        this.logger  = logger

        this._reader         = new TBinaryReader()
        this._boundingBox    = new Box3()
        this._points         = []
        this._numberOfPoints = 0
        this._coloredPoints  = false
        this._autoOffset     = false // Only for tiny files !!!!!!!
        this._offset         = {
            x: 0,
            y: 0,
            z: 0
        }

        this._positions   = null
        this._bufferIndex = 0

        this._positionsC   = null
        this._bufferIndexC = 0

        this.wrongPoints = 0

    }

    /**
     * Will load the file at the given URL then parse it. It will return a Three.Group as onLoad argument.
     *
     * @param {DOMString|URL} url - Path to the file to load
     * @param {callback} onLoad - A success callback
     * @param {callback} onProgress - A progress callback
     * @param {callback} onError - A error callback
     * @param {Number} [sampling=100] - A sampling in percent to apply over file
     */
    load ( url, onLoad, onProgress, onError, sampling ) {

        //        //this.logger.time("LASLoader")

        const loader = new FileLoader( this.manager )
        loader.setResponseType( 'arraybuffer' )
        loader.load( url, function ( arraybuffer ) {

            const groupToFeed = new Group()
            this._parse( arraybuffer, groupToFeed, ( lasFile ) => { onLoad( lasFile ) }, onProgress, onError, sampling )

            // Early container return
            //            onLoad( groupToFeed )

        }.bind( this ), onProgress, onError )

    }

    /**
     * An alternative setter to offset property
     *
     * @param {Three.Vector3|Object} offset - An global position offset to apply on the point cloud.
     */
    setOffset ( offset ) {

        //TODO: check is correct

        this._offset     = offset
        this._autoOffset = false

        //TODO: that allow chaining.

    }

    /**
     *
     * @param blob
     * @param groupToFeed
     * @param onLoad
     * @param onProgress
     * @param onError
     * @param sampling
     * @private
     */
    _parse ( arraybuffer, groupToFeed, onLoad, onProgress, onError ) {

        try {
            this._reader.buffer = arraybuffer

            const header                = this._parseHeader()
            const variableLengthRecords = this._parseVariableLengthRecords( header )
            const pointDataRecords      = this._parsePointDataRecords( header, onProgress )

            onLoad( {
                Header:                header,
                VariableLengthRecords: variableLengthRecords,
                PointDataRecords:      pointDataRecords
            } )

        } catch(error) {
            onError(error)
        }

    }

    _parseHeader () {

        const fileSignature = this._reader.getString( 4, false )
        if ( fileSignature !== 'LASF' ) { throw new Error( 'Invalid las file signature. Abort parsing !' ) }

        this._reader.skipOffsetOf( 20 )

        const majorVersion = this._reader.getUint8()
        if ( majorVersion !== 1 ) { throw new Error( `Insupported major LAS file version: ${ majorVersion }. Abort parsing !` ) }

        const minorVersion = this._reader.getUint8()
        switch ( minorVersion ) {
            case 0:
                this._reader.skipOffsetTo( 0 )
                return this._parseHeader_1_0()

            case 1:
                this._reader.skipOffsetTo( 0 )
                return this._parseHeader_1_1()

            case 2:
                this._reader.skipOffsetTo( 0 )
                return this._parseHeader_1_2()

            case 3:
                this._reader.skipOffsetTo( 0 )
                return this._parseHeader_1_3()

            case 4:
                this._reader.skipOffsetTo( 0 )
                return this._parseHeader_1_4()

            default:
                throw new Error( `Insupported minor LAS file version: ${ minorVersion }. Abort parsing !` )
        }

    }

    _parseHeader_1_0 () {
        return {
            FileSignature:                 this._reader.getString( 4, false ),
            Reserved:                      this._reader.skipOffsetOf( Byte.Four ),
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32, false ),
            GeneratingSoftware:            this._reader.getString( 32, false ),
            FlightDateJulian:              this._reader.getUint16(),
            Year:                          this._reader.getUint16(),
            HeaderSize:                    this._reader.getUint16(),
            OffsetToData:                  this._reader.getUint32(),
            NumberOfVariableLengthRecords: this._reader.getUint32(),
            PointDataFormatID:             this._reader.getUint8(),
            PointDataRecordLength:         this._reader.getUint16(),
            NumberOfPointRecords:          this._reader.getUint32(),
            NumberOfPointsByReturn:        this._reader.getUint32Array( 5 ),
            XScaleFactor:                  this._reader.getFloat64(),
            YScaleFactor:                  this._reader.getFloat64(),
            ZScaleFactor:                  this._reader.getFloat64(),
            XOffset:                       this._reader.getFloat64(),
            YOffset:                       this._reader.getFloat64(),
            ZOffset:                       this._reader.getFloat64(),
            MaxX:                          this._reader.getFloat64(),
            MinX:                          this._reader.getFloat64(),
            MaxY:                          this._reader.getFloat64(),
            MinY:                          this._reader.getFloat64(),
            MaxZ:                          this._reader.getFloat64(),
            MinZ:                          this._reader.getFloat64()
        }
    }

    _parseHeader_1_1 () {
        return {
            FileSignature:                 this._reader.getString( 4, false ),
            FileSourceId:                  this._reader.getUint16(),
            Reserved:                      this._reader.skipOffsetOf( Byte.Two ),
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32, false ),
            GeneratingSoftware:            this._reader.getString( 32, false ),
            FileCreationDayOfYear:         this._reader.getUint16(),
            FileCreationYear:              this._reader.getUint16(),
            HeaderSize:                    this._reader.getUint16(),
            OffsetToPointData:             this._reader.getUint32(),
            NumberOfVariableLengthRecords: this._reader.getUint32(),
            PointDataFormatID:             this._reader.getUint8(),
            PointDataRecordLength:         this._reader.getUint16(),
            NumberOfPointRecords:          this._reader.getUint32(),
            NumberOfPointsByReturn:        this._reader.getUint32Array( 5 ),
            XScaleFactor:                  this._reader.getFloat64(),
            YScaleFactor:                  this._reader.getFloat64(),
            ZScaleFactor:                  this._reader.getFloat64(),
            XOffset:                       this._reader.getFloat64(),
            YOffset:                       this._reader.getFloat64(),
            ZOffset:                       this._reader.getFloat64(),
            MaxX:                          this._reader.getFloat64(),
            MinX:                          this._reader.getFloat64(),
            MaxY:                          this._reader.getFloat64(),
            MinY:                          this._reader.getFloat64(),
            MaxZ:                          this._reader.getFloat64(),
            MinZ:                          this._reader.getFloat64()
        }
    }

    _parseHeader_1_2 () {
        return {
            FileSignature:                 this._reader.getString( 4, false ),
            FileSourceId:                  this._reader.getUint16(),
            GlobalEncoding:                new GlobalEncodingBitField_1_2( this._reader.getUint16() ),
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32, false ),
            GeneratingSoftware:            this._reader.getString( 32, false ),
            FileCreationDayOfYear:         this._reader.getUint16(),
            FileCreationYear:              this._reader.getUint16(),
            HeaderSize:                    this._reader.getUint16(),
            OffsetToPointData:             this._reader.getUint32(),
            NumberOfVariableLengthRecords: this._reader.getUint32(),
            PointDataFormatID:             this._reader.getUint8(),
            PointDataRecordLength:         this._reader.getUint16(),
            NumberOfPointRecords:          this._reader.getUint32(),
            NumberOfPointsByReturn:        this._reader.getUint32Array( 5 ),
            XScaleFactor:                  this._reader.getFloat64(),
            YScaleFactor:                  this._reader.getFloat64(),
            ZScaleFactor:                  this._reader.getFloat64(),
            XOffset:                       this._reader.getFloat64(),
            YOffset:                       this._reader.getFloat64(),
            ZOffset:                       this._reader.getFloat64(),
            MaxX:                          this._reader.getFloat64(),
            MinX:                          this._reader.getFloat64(),
            MaxY:                          this._reader.getFloat64(),
            MinY:                          this._reader.getFloat64(),
            MaxZ:                          this._reader.getFloat64(),
            MinZ:                          this._reader.getFloat64()
        }
    }

    _parseHeader_1_3 () {
        return {
            FileSignature:                   this._reader.getString( 4, false ),
            FileSourceId:                    this._reader.getUint16(),
            GlobalEncoding:                  new GlobalEncodingBitField_1_3( this._reader.getUint16() ),
            GUID_1:                          this._reader.getUint32(),
            GUID_2:                          this._reader.getUint16(),
            GUID_3:                          this._reader.getUint16(),
            GUID_4:                          this._reader.getUint8Array( 8 ),
            VersionMajor:                    this._reader.getUint8(),
            VersionMinor:                    this._reader.getUint8(),
            SystemIdentifier:                this._reader.getString( 32, false ),
            GeneratingSoftware:              this._reader.getString( 32, false ),
            FileCreationDayOfYear:           this._reader.getUint16(),
            FileCreationYear:                this._reader.getUint16(),
            HeaderSize:                      this._reader.getUint16(),
            OffsetToPointData:               this._reader.getUint32(),
            NumberOfVariableLengthRecords:   this._reader.getUint32(),
            PointDataFormatID:               this._reader.getUint8(),
            PointDataRecordLength:           this._reader.getUint16(),
            NumberOfPointRecords:            this._reader.getUint32(),
            NumberOfPointsByReturn:          this._reader.getUint32Array( 5 ),
            XScaleFactor:                    this._reader.getFloat64(),
            YScaleFactor:                    this._reader.getFloat64(),
            ZScaleFactor:                    this._reader.getFloat64(),
            XOffset:                         this._reader.getFloat64(),
            YOffset:                         this._reader.getFloat64(),
            ZOffset:                         this._reader.getFloat64(),
            MaxX:                            this._reader.getFloat64(),
            MinX:                            this._reader.getFloat64(),
            MaxY:                            this._reader.getFloat64(),
            MinY:                            this._reader.getFloat64(),
            MaxZ:                            this._reader.getFloat64(),
            MinZ:                            this._reader.getFloat64(),
            StartOfWaveformDataPacketRecord: this._reader.getUint64()
        }
    }

    _parseHeader_1_4 () {
        return {
            FileSignature:                            this._reader.getString( 4, false ),
            FileSourceId:                             this._reader.getUint16(),
            GlobalEncoding:                           new GlobalEncodingBitField_1_4( this._reader.getUint16() ),
            GUID_1:                                   this._reader.getUint32(),
            GUID_2:                                   this._reader.getUint16(),
            GUID_3:                                   this._reader.getUint16(),
            GUID_4:                                   this._reader.getUint8Array( 8 ),
            VersionMajor:                             this._reader.getUint8(),
            VersionMinor:                             this._reader.getUint8(),
            SystemIdentifier:                         this._reader.getString( 32, false ),
            GeneratingSoftware:                       this._reader.getString( 32, false ),
            FileCreationDayOfYear:                    this._reader.getUint16(),
            FileCreationYear:                         this._reader.getUint16(),
            HeaderSize:                               this._reader.getUint16(),
            OffsetToPointData:                        this._reader.getUint32(),
            NumberOfVariableLengthRecords:            this._reader.getUint32(),
            PointDataRecordFormat:                    this._reader.getUint8(),
            PointDataRecordLength:                    this._reader.getUint16(),
            LegacyNumberOfPointRecords:               this._reader.getUint32(),
            LegacyNumberOfPointsByReturn:             this._reader.getUint32Array( 5 ),
            XScaleFactor:                             this._reader.getFloat64(),
            YScaleFactor:                             this._reader.getFloat64(),
            ZScaleFactor:                             this._reader.getFloat64(),
            XOffset:                                  this._reader.getFloat64(),
            YOffset:                                  this._reader.getFloat64(),
            ZOffset:                                  this._reader.getFloat64(),
            MaxX:                                     this._reader.getFloat64(),
            MinX:                                     this._reader.getFloat64(),
            MaxY:                                     this._reader.getFloat64(),
            MinY:                                     this._reader.getFloat64(),
            MaxZ:                                     this._reader.getFloat64(),
            MinZ:                                     this._reader.getFloat64(),
            StartOfWaveformDataPacketRecord:          this._reader.getUint64(),
            StartOfFirstExtendedVariableLengthRecord: this._reader.getUint64(),
            NumberOfExtendedVariableLengthRecords:    this._reader.getUint32(),
            NumberOfPointRecords:                     this._reader.getUint64(),
            NumberOfPointsByReturn:                   this._reader.getUint64Array( 15 )
        }
    }

    _parseVariableLengthRecords ( header ) {

        //        this._reader.skipOffsetTo( header.HeaderSize )

        const minorVersion = header.VersionMinor
        const variablesLengthRecords = []
        switch ( minorVersion ) {
            case 0:
                variablesLengthRecords.push( this._parseVariableLengthRecord_1_0() )
                break

            //...

            default:
                throw new Error( `Insupported minor LAS file version: ${ minorVersion }. Abort parsing !` )
        }


        return variablesLengthRecords
    }

    _parseVariableLengthRecord_1_0 () {
        const variableLengthRecordHeader = {
            RecordSignature:         this._reader.getUint16(),
            UserID:                  this._reader.getString( 16 ),
            RecordId:                this._reader.getUint16(),
            RecordLengthAfterHeader: this._reader.getUint16(),
            Description:             this._reader.getString( 32 )
        }

        if ( variableLengthRecordHeader.RecordSignature !== 0xAABB ) {
            throw new Error( 'Invalid variable length record header signature... Abort parsing !' )
        }

        return variableLengthRecordHeader
    }

    _parseVariableLengthRecordHeader () {
        return {
            Reserved:                this._reader.getUint16(),
            UserID:                  this._reader.getString( 16 ),
            RecordId:                this._reader.getUint16(),
            RecordLengthAfterHeader: this._reader.getUint16(),
            Description:             this._reader.getString( 32 )
        }
    }

    _parsePointDataRecords ( header, onProgress ) {

        const offsetToPointData     = header.OffsetToPointData
        const pointDataRecordFormat = header.PointDataRecordFormat
        const numberOfPointRecords  = ( header.VersionMinor < 4 ) ? header.LegacyNumberOfPointRecords : header.NumberOfPointRecords

        this._reader.skipOffsetTo( offsetToPointData )
        //        this._reader.setOffset( offsetToPointData )

        const points = new Array( numberOfPointRecords )

        switch ( pointDataRecordFormat ) {

            case 0:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat0()
                    //                    points.push( this._parsePointDataRecordFormat0() )

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 1:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat1()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 2:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat2()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 3:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat3()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 4:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat4()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 5:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat5()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 6:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat6()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 7:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat7()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 8:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat8()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 9:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat9()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            case 10:
                for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
                    points[ i ] = this._parsePointDataRecordFormat10()

                    if ( i % 100000 === 0 ) {
                        onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                            lengthComputable: true,
                            loaded:           i,
                            total:            numberOfPointRecords
                        } ) )
                    }
                }
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${ pointDataRecordFormat }` )

        }

        return points
    }

    _parsePointDataRecordFormat0 () {

        return {
            X:              this._reader.getUint32(),
            Y:              this._reader.getUint32(),
            Z:              this._reader.getUint32(),
            Intensity:      this._reader.getUint16(),
            _bitFields:     this._reader.getUint8(),
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2 ),
            //            NumberOfReturns:   this._reader.getBit( 3, 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification: this._reader.getUint8(),
            ScanAngleRank:  this._reader.getInt8(),
            UserData:       this._reader.getUint8(),
            PointSourceId:  this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat1 () {

        return {
            X:              this._reader.getUint32(),
            Y:              this._reader.getUint32(),
            Z:              this._reader.getUint32(),
            Intensity:      this._reader.getUint16(),
            _bitFields:     this._reader.getUint8(),
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2 ),
            //            NumberOfReturns:   this._reader.getBit( 3, 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification: this._reader.getUint8(),
            ScanAngleRank:  this._reader.getInt8(),
            UserData:       this._reader.getUint8(),
            PointSourceId:  this._reader.getUint16(),
            GPSTime:        this._reader.getFloat64()
        }

    }

    _parsePointDataRecordFormat2 () {

        return {
            X:              this._reader.getUint32(),
            Y:              this._reader.getUint32(),
            Z:              this._reader.getUint32(),
            Intensity:      this._reader.getUint16(),
            _bitFields:     this._reader.getUint8(),
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2 ),
            //            NumberOfReturns:   this._reader.getBit( 3, 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification: this._reader.getUint8(),
            ScanAngleRank:  this._reader.getInt8(),
            UserData:       this._reader.getUint8(),
            PointSourceId:  this._reader.getUint16(),
            R:              this._reader.getUint16(),
            G:              this._reader.getUint16(),
            B:              this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat3 () {

        return {
            X:              this._reader.getUint32(),
            Y:              this._reader.getUint32(),
            Z:              this._reader.getUint32(),
            Intensity:      this._reader.getUint16(),
            _bitFields:     this._reader.getUint8(),
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2 ),
            //            NumberOfReturns:   this._reader.getBit( 3, 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification: this._reader.getUint8(),
            ScanAngleRank:  this._reader.getInt8(),
            UserData:       this._reader.getUint8(),
            PointSourceId:  this._reader.getUint16(),
            GPSTime:        this._reader.getFloat64(),
            R:              this._reader.getUint16(),
            G:              this._reader.getUint16(),
            B:              this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat4 () {

        return {
            X:                           this._reader.getUint32(),
            Y:                           this._reader.getUint32(),
            Z:                           this._reader.getUint32(),
            Intensity:                   this._reader.getUint16(),
            _bitFields:                  this._reader.getUint8(),
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2 ),
            //            NumberOfReturns:   this._reader.getBit( 3, 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification:              this._reader.getUint8(),
            ScanAngleRank:               this._reader.getInt8(),
            UserData:                    this._reader.getUint8(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    _parsePointDataRecordFormat5 () {

        return {
            X:                           this._reader.getUint32(),
            Y:                           this._reader.getUint32(),
            Z:                           this._reader.getUint32(),
            Intensity:                   this._reader.getUint16(),
            _bitFields:                  this._reader.getUint8(),
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2 ),
            //            NumberOfReturns:   this._reader.getBit( 3, 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification:              this._reader.getUint8(),
            ScanAngleRank:               this._reader.getInt8(),
            UserData:                    this._reader.getUint8(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            R:                           this._reader.getUint16(),
            G:                           this._reader.getUint16(),
            B:                           this._reader.getUint16(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    _parsePointDataRecordFormat6 () {

        return {
            X:              this._reader.getUint32(),
            Y:              this._reader.getUint32(),
            Z:              this._reader.getUint32(),
            Intensity:      this._reader.getUint16(),
            _bitFields:     this._reader.getUint16(), //!\
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2, 3 ),
            //            NumberOfReturns:   this._reader.getBit( 4, 5, 6, 7 ),
            //            ClassificationFlags: this._reader.getBit( 0, 1, 2, 3 ),
            //            ScannerChannel: this._reader.getBit( 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification: this._reader.getUint8(),
            UserData:       this._reader.getUint8(),
            ScanAngle:      this._reader.getInt16(),
            PointSourceId:  this._reader.getUint16(),
            GPSTime:        this._reader.getFloat64()
        }

    }

    _parsePointDataRecordFormat7 () {

        return {
            X:              this._reader.getUint32(),
            Y:              this._reader.getUint32(),
            Z:              this._reader.getUint32(),
            Intensity:      this._reader.getUint16(),
            _bitFields:     this._reader.getUint16(), //!\
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2, 3 ),
            //            NumberOfReturns:   this._reader.getBit( 4, 5, 6, 7 ),
            //            ClassificationFlags: this._reader.getBit( 0, 1, 2, 3 ),
            //            ScannerChannel: this._reader.getBit( 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification: this._reader.getUint8(),
            UserData:       this._reader.getUint8(),
            ScanAngle:      this._reader.getInt16(),
            PointSourceId:  this._reader.getUint16(),
            GPSTime:        this._reader.getFloat64(),
            R:              this._reader.getUint16(),
            G:              this._reader.getUint16(),
            B:              this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat8 () {

        return {
            X:              this._reader.getUint32(),
            Y:              this._reader.getUint32(),
            Z:              this._reader.getUint32(),
            Intensity:      this._reader.getUint16(),
            _bitFields:     this._reader.getUint16(), //!\
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2, 3 ),
            //            NumberOfReturns:   this._reader.getBit( 4, 5, 6, 7 ),
            //            ClassificationFlags: this._reader.getBit( 0, 1, 2, 3 ),
            //            ScannerChannel: this._reader.getBit( 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification: this._reader.getUint8(),
            UserData:       this._reader.getUint8(),
            ScanAngle:      this._reader.getInt16(),
            PointSourceId:  this._reader.getUint16(),
            GPSTime:        this._reader.getFloat64(),
            R:              this._reader.getUint16(),
            G:              this._reader.getUint16(),
            B:              this._reader.getUint16(),
            NIR:            this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat9 () {

        return {
            X:                           this._reader.getUint32(),
            Y:                           this._reader.getUint32(),
            Z:                           this._reader.getUint32(),
            Intensity:                   this._reader.getUint16(),
            _bitFields:                  this._reader.getUint16(), //!\
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2, 3 ),
            //            NumberOfReturns:   this._reader.getBit( 4, 5, 6, 7 ),
            //            ClassificationFlags: this._reader.getBit( 0, 1, 2, 3 ),
            //            ScannerChannel: this._reader.getBit( 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification:              this._reader.getUint8(),
            UserData:                    this._reader.getUint8(),
            ScanAngle:                   this._reader.getInt16(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    _parsePointDataRecordFormat10 () {

        return {
            X:                           this._reader.getUint32(),
            Y:                           this._reader.getUint32(),
            Z:                           this._reader.getUint32(),
            Intensity:                   this._reader.getUint16(),
            _bitFields:                  this._reader.getUint16(), //!\
            //            ReturnNumber:      this._reader.getBit( 0, 1, 2, 3 ),
            //            NumberOfReturns:   this._reader.getBit( 4, 5, 6, 7 ),
            //            ClassificationFlags: this._reader.getBit( 0, 1, 2, 3 ),
            //            ScannerChannel: this._reader.getBit( 4, 5 ),
            //            ScanDirectionFlag: this._reader.getBit( 6 ),
            //            EdgeOfFlightLine:  this._reader.getBit( 7 ),
            Classification:              this._reader.getUint8(),
            UserData:                    this._reader.getUint8(),
            ScanAngle:                   this._reader.getInt16(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            R:                           this._reader.getUint16(),
            G:                           this._reader.getUint16(),
            B:                           this._reader.getUint16(),
            NIR:                         this._reader.getUint16(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    /**
     *
     * @private
     */
    _offsetPoints () {

        // Compute bounding box in view to get his center for auto offseting the cloud point.
        if ( this._autoOffset ) {
            //this.logger.time("Compute Points");
            this._boundingBox.setFromPoints( this._points )
            this.setOffset( this._boundingBox.getCenter() )
            //this.logger.timeEnd("Compute Points");
        }

        const offsetX = this._offset.x
        const offsetY = this._offset.y
        const offsetZ = this._offset.z
        let point     = null
        for ( let i = 0, numberOfPoints = this._points.length ; i < numberOfPoints ; ++i ) {

            point = this._points[ i ]
            point.x -= offsetX
            point.y -= offsetY
            point.z -= offsetZ

        }

    }

    /**
     *
     * @param groupToFeed
     * @private
     */
    _createCloudPoint ( groupToFeed ) {

        const SPLIT_LIMIT        = 1000000
        // var group = new Group();
        const numberOfPoints     = this._points.length
        const numberOfSplit      = Math.ceil( numberOfPoints / SPLIT_LIMIT )
        let splice               = null
        let numberOfPointInSplit = 0
        let cloud                = null

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = this._points.splice( 0, SPLIT_LIMIT )
            numberOfPointInSplit = splice.length

            const geometry  = new BufferGeometry()
            const positions = new Float32Array( numberOfPointInSplit * 3 )
            const colors    = new Float32Array( numberOfPointInSplit * 3 )
            let bufferIndex = 0
            let point       = null

            for ( let i = 0 ; i < numberOfPointInSplit ; ++i ) {

                // current point
                point = splice[ i ]

                // positions
                positions[ bufferIndex ]     = point.x
                positions[ bufferIndex + 1 ] = point.y
                positions[ bufferIndex + 2 ] = point.z

                // colors
                if ( this._pointsHaveColor ) {
                    colors[ bufferIndex ]     = point.r / 255
                    colors[ bufferIndex + 1 ] = point.g / 255
                    colors[ bufferIndex + 2 ] = point.b / 255
                } else {
                    colors[ bufferIndex ]     = 0.1
                    colors[ bufferIndex + 1 ] = 0.2
                    colors[ bufferIndex + 2 ] = 0.5
                }

                bufferIndex += 3

            }

            geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) )
            geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) )

            const material = new PointsMaterial( {
                size:         0.01,
                vertexColors: true
            } )

            cloud = new Points( geometry, material )
            groupToFeed.children.push( cloud )
            // group.children.push(cloud);
        }

        // return group;

    }

    /**
     *
     * @param group
     * @private
     */
    _createSubCloudPoint ( group ) {

        const numberOfPoints = this._points.length
        const geometry       = new BufferGeometry()
        const positions      = new Float32Array( numberOfPoints * 3 )
        const colors         = new Float32Array( numberOfPoints * 3 )
        let bufferIndex      = 0
        let point            = null

        for ( let i = 0 ; i < numberOfPoints ; ++i ) {

            // current point
            point = this._points[ i ]

            // positions
            positions[ bufferIndex ]     = point.x
            positions[ bufferIndex + 1 ] = point.y
            positions[ bufferIndex + 2 ] = point.z

            // colors
            if ( this._pointsHaveColor ) {
                colors[ bufferIndex ]     = point.r / 255
                colors[ bufferIndex + 1 ] = point.g / 255
                colors[ bufferIndex + 2 ] = point.b / 255
            } else {
                colors[ bufferIndex ]     = 0.1
                colors[ bufferIndex + 1 ] = 0.2
                colors[ bufferIndex + 2 ] = 0.5
            }

            bufferIndex += 3

        }

        geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) )
        geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) )

        const material = new PointsMaterial( {
            size:         0.005,
            vertexColors: true
        } )

        const cloud = new Points( geometry, material )

        //Todo: Apply import coordinates syteme here !
        cloud.rotation.x -= Math.PI / 2

        group.children.push( cloud )

        // Clear current processed points
        this._points = []

    }

}

export { LASLoader }
