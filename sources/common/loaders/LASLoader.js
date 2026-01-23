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
    Byte,
    TBinaryReader
}                        from 'itee-client'
import { DefaultLogger } from 'itee-core'
import { toEnum }        from 'itee-utils'
import { isDefined }     from 'itee-validators'
import {
    Box3,
    BufferAttribute,
    BufferGeometry,
    DefaultLoadingManager,
    FileLoader,
    Group,
    Points,
    PointsMaterial
}                        from 'three-full'
//import { BufferAttribute }       from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }        from 'three-full/sources/core/BufferGeometry'
//import { FileLoader }            from 'three-full/sources/loaders/FileLoader'
//import { Box3 }                  from 'three-full/sources/math/Box3'
//import { DefaultLoadingManager } from 'three-full/sources/loaders/LoadingManager'
//import { PointsMaterial }        from 'three-full/sources/materials/PointsMaterial'
//import { Group }                 from 'three-full/sources/objects/Group'
//import { Points }                from 'three-full/sources/objects/Points'

/////////////

const NullCharRegex = /*#__PURE__*/new RegExp( '\0', 'g' ) // eslint-disable-line no-control-regex

const PointClasses = /*#__PURE__*/toEnum( {
    Created:          0,
    Unclassified:     1,
    Ground:           2,
    LowVegetation:    3,
    MediumVegetation: 4,
    HighVegetation:   5,
    Building:         6,
    LowPoint:         7,
    ModelKeyPoint:    8,
    Water:            9,
    OverlapPoints:    12
} )

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
    constructor( manager = DefaultLoadingManager, logger = DefaultLogger ) {

        this.manager = manager
        this.logger  = logger

        this._reader         = new TBinaryReader()
        this._fullVersion    = ''
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

        // Converter
        this.colorForPointClass = {
            Created: {
                r: 255,
                g: 255,
                b: 255
            },
            Unclassified: {
                r: 60,
                g: 60,
                b: 60
            },
            Ground: {
                r: 125,
                g: 95,
                b: 5
            },
            LowVegetation: {
                r: 153,
                g: 212,
                b: 36
            },
            MediumVegetation: {
                r: 52,
                g: 148,
                b: 25
            },
            HighVegetation: {
                r: 27,
                g: 77,
                b: 13
            },
            Building: {
                r: 153,
                g: 138,
                b: 95
            },
            LowPoint: {
                r: 200,
                g: 200,
                b: 200
            },
            ModelKeyPoint: {
                r: 237,
                g: 31,
                b: 31
            },
            Water: {
                r: 31,
                g: 186,
                b: 237
            },
            OverlapPoints: {
                r: 0,
                g: 0,
                b: 0
            }
        }
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
    load( url, onLoad, onProgress, onError, sampling ) {

        //this.logger.time("LASLoader")

        const loader = new FileLoader( this.manager )
        loader.setResponseType( 'arraybuffer' )
        loader.load( url, ( arraybuffer ) => {

            this.parse( arraybuffer, onLoad, onProgress, onError, sampling )

        }, onProgress, onError )

    }

    /**
     * An alternative setter to offset property
     *
     * @param {Three.Vector3|Object} offset - An global position offset to apply on the point cloud.
     */
    setOffset( offset ) {

        //TODO: check is correct

        this._offset     = offset
        this._autoOffset = false

        //TODO: that allow chaining.

    }

    /**
     *
     * @param arraybuffer
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    parse( arraybuffer, onLoad, onProgress, onError ) {

        try {

            this._reader.buffer = arraybuffer

            const fileSignature = this._reader.getString( 4, false )
            if ( fileSignature !== 'LASF' ) { throw new Error( 'Invalid las file signature. Abort parsing !' ) }

            // Extract version then reset reader cursor position to start
            this._reader.skipOffsetOf( 24 )
            const majorVersion = this._reader.getUint8()
            const minorVersion = this._reader.getUint8()
            this._reader.skipOffsetTo( 0 )

            const lasVersion = `${ majorVersion }.${ minorVersion }`

            const header                = this._parseHeader( lasVersion )
            const variableLengthRecords = this._parseVariableLengthRecords( header )
            const pointDataRecords      = this._parsePointDataRecords( header, onProgress )

            this.convert( {
                Header:                header,
                VariableLengthRecords: variableLengthRecords,
                PointDataRecords:      pointDataRecords
            }, onLoad, onProgress, onError )

        } catch ( error ) {

            onError( error )

        }

    }

    // Header

    _parseHeader( lasVersion ) {

        switch ( lasVersion ) {
            case '1.0':
                return this._parseHeader_1_0()
            case '1.1':
                return this._parseHeader_1_1()
            case '1.2':
                return this._parseHeader_1_2()
            case '1.3':
                return this._parseHeader_1_3()
            case '1.4':
                return this._parseHeader_1_4()

            default:
                throw new Error( `Insupported LAS file version: ${ lasVersion }. Abort parsing !` )
        }

    }

    _parseHeader_1_0() {

        return {
            FileSignature:                 this._reader.getString( 4 ),
            Reserved:                      this._reader.skipOffsetOf( Byte.Four ),
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:            this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            FlightDateJulian:              this._reader.getUint16(),
            Year:                          this._reader.getUint16(),
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

    _parseHeader_1_1() {

        return {
            FileSignature:                 this._reader.getString( 4 ),
            FileSourceId:                  this._reader.getUint16(),
            Reserved:                      this._reader.skipOffsetOf( Byte.Two ) && null,
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:            this._reader.getString( 32 ).replace( NullCharRegex, '' ),
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

    _parseHeader_1_2() {

        return {
            FileSignature:  this._reader.getString( 4 ),
            FileSourceId:   this._reader.getUint16(),
            GlobalEncoding: {
                GPSTimeType: this._reader.getBit16() ? 'AdjustedStandardGPSTime' : 'GPSWeekTime',
                Reserved:    this._reader.skipBitOffsetOf( 15 )
            },
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:            this._reader.getString( 32 ).replace( NullCharRegex, '' ),
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

    _parseHeader_1_3() {

        return {
            FileSignature:  this._reader.getString( 4 ),
            FileSourceId:   this._reader.getUint16(),
            GlobalEncoding: {
                GPSTimeType:                                 this._reader.getBit16() ? 'AdjustedStandardGPSTime' : 'GPSWeekTime',
                WaveformDataPacketsInternal:                 this._reader.getBit16(),
                WaveformDataPacketsExternal:                 this._reader.getBit16(),
                ReturnNumbersHaveBeenSyntheticallyGenerated: this._reader.getBit16(),
                Reserved:                                    this._reader.skipBitOffsetOf( 12 )
            },
            GUID_1:                          this._reader.getUint32(),
            GUID_2:                          this._reader.getUint16(),
            GUID_3:                          this._reader.getUint16(),
            GUID_4:                          this._reader.getUint8Array( 8 ),
            VersionMajor:                    this._reader.getUint8(),
            VersionMinor:                    this._reader.getUint8(),
            SystemIdentifier:                this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
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

    _parseHeader_1_4() {

        return {
            FileSignature:  this._reader.getString( 4 ),
            FileSourceId:   this._reader.getUint16(),
            GlobalEncoding: {
                GPSTimeType:                                 this._reader.getBit16() ? 'AdjustedStandardGPSTime' : 'GPSWeekTime',
                WaveformDataPacketsInternal:                 this._reader.getBit16(),
                WaveformDataPacketsExternal:                 this._reader.getBit16(),
                ReturnNumbersHaveBeenSyntheticallyGenerated: this._reader.getBit16(),
                WKT:                                         this._reader.getBit16() ? 'WKT' : 'GeoTIFF',
                Reserved:                                    this._reader.skipBitOffsetOf( 11 )
            },
            GUID_1:                                   this._reader.getUint32(),
            GUID_2:                                   this._reader.getUint16(),
            GUID_3:                                   this._reader.getUint16(),
            GUID_4:                                   this._reader.getUint8Array( 8 ),
            VersionMajor:                             this._reader.getUint8(),
            VersionMinor:                             this._reader.getUint8(),
            SystemIdentifier:                         this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:                       this._reader.getString( 32 ).replace( NullCharRegex, '' ),
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

    // VariableLengthRecord

    _parseVariableLengthRecords( header ) {

        const fullVersion            = `${ header.VersionMajor }.${ header.VersionMinor }`
        const variablesLengthRecords = []

        for ( let i = 0 ; i < header.NumberOfVariableLengthRecords ; i++ ) {

            const header = this._parseVariableLengthRecordHeader()

            //!\ Legacy => RecordSignature = Reserved since las v1.1
            if ( fullVersion === '1.0' && header.Reserved !== 0xAABB ) {
                throw new Error( 'Invalid variable length record header signature... Abort parsing !' )
            }

            const userId       = header.UserID
            const recordId     = header.RecordID
            const recordLength = header.RecordLengthAfterHeader
            const content      = this._parseVariableLengthRecordContent( userId, recordId, recordLength )

            variablesLengthRecords.push( {
                Header:  header,
                Content: content
            } )

        }

        return variablesLengthRecords

    }

    _parseVariableLengthRecordHeader() {

        return {
            Reserved:                this._reader.getUint16(),
            UserID:                  this._reader.getString( 16 ).replace( NullCharRegex, '' ),
            RecordID:                this._reader.getUint16(),
            RecordLengthAfterHeader: this._reader.getUint16(),
            Description:             this._reader.getString( 32 ).replace( NullCharRegex, '' )
        }

    }
    _parseVariableLengthRecordContent( userId, recordId, recordLength ) {

        switch ( userId ) {
            case 'LASF_Projection':
                return this._parseProjectionRecord( recordId, recordLength )
            case 'LASF_Spec':
                return this._parseSpecRecord()

            default:
                return this._parseCustomRecord( recordLength )
        }

    }

    _parseProjectionRecord( recordId, recordLength ) {

        switch ( recordId ) {
            case 2111:
                return this._parseOGCMathTransformWKT()
            case 2112:
                return this._parseOGCCoordinateTransformWKT()
            case 34735:
                return this._parseGeoKeyDirectoryTag()
            case 34736:
                return this._parseGeoDoubleParamsTag( recordLength )
            case 34737:
                return this._parseGeoASCIIParamsTag( recordLength )

            default:
                console.error( 'Unable to determine LASF_Projection underlying type ! Skip current record.' )
                this._reader.skipOffsetOf( recordLength )
        }

    }

    // Todo
    _parseOGCMathTransformWKT() {

        return undefined

    }

    // Todo
    _parseOGCCoordinateTransformWKT() {

        return undefined

    }

    _parseGeoKeyDirectoryTag() {

        const geoKey = {
            wKeyDirectoryVersion: this._reader.getUint16(),
            wKeyRevision:         this._reader.getUint16(),
            wMinorRevision:       this._reader.getUint16(),
            wNumberOfKeys:        this._reader.getUint16(),
            sKeyEntry:            []
        }

        for ( let j = 0 ; j < geoKey.wNumberOfKeys ; j++ ) {
            geoKey.sKeyEntry.push( {
                wKeyID:           this._reader.getUint16(),
                wTIFFTagLocation: this._reader.getUint16(),
                wCount:           this._reader.getUint16(),
                wValue_Offset:    this._reader.getUint16()
            } )
        }

        return geoKey

    }

    _parseGeoDoubleParamsTag( recordLength ) {

        const numberOfEntries = recordLength / Byte.Height
        const params          = []

        for ( let i = 0 ; i < numberOfEntries ; i++ ) {
            params[ i ] = this._reader.getFloat64()
        }

        return params

    }

    _parseGeoASCIIParamsTag( recordLength ) {

        return this._reader.getString( recordLength ).replace( NullCharRegex, '' )

    }

    _parseSpecRecord( recordId ) {

        if ( recordId < 100 ) {

            switch ( recordId ) {
                case 0:
                    return this._parseClassificationLookupRecord()
                case 1:
                    return this._parseHeaderLookupForFlightLinesRecord()
                case 2:
                    return this._parseHistogramRecord()
                case 3:
                    return this._parseTextAreaDescriptionRecord()
                case 4:
                    return this._parseExtraBytesRecord()
                case 7:
                    return this._parseSupersededRecord()

                default:
                    throw new RangeError( `Invalid spec record id: ${ recordId }` )
            }

        } else if ( recordId >= 100 && recordId < 355 ) {

            return this._parseWaveformPacketDesciptor()

        } else if ( recordId === 65535 ) {

            return this._parseWaveformDataPacket()

        } else {

            throw new RangeError( `Invalid spec record id: ${ recordId }` )

        }

    }

    _parseClassificationLookupRecord() {

        const records = []

        for ( let i = 0 ; i < 256 ; i++ ) {
            records.push( {
                ClassNumber: this._reader.getUint8(),
                Description: this._reader.getString( 15 ).replace( NullCharRegex, '' )
            } )
        }

        return records

    }

    _parseHeaderLookupForFlightLinesRecord() {

        return {
            FileMarkerNumber: this._reader.getUint8(),
            Filename:         this._reader.getString( 256 ).replace( NullCharRegex, '' )
        }

    }

    _parseHistogramRecord() {

        return undefined

    }

    _parseTextAreaDescriptionRecord() {

        return undefined

    }

    // Todo
    _parseExtraBytesRecord() {

        return undefined

    }

    // Todo
    _parseSupersededRecord() {

        return undefined

    }

    // Todo
    _parseWaveformPacketDesciptor() {

        return undefined

    }

    // Todo
    _parseWaveformDataPacket() {

        return undefined

    }

    _parseCustomRecord( recordLength ) {

        const record = new Uint8Array( recordLength )

        for ( let i = 0 ; i < recordLength ; i++ ) {
            record[ i ] = this._reader.getUint8()
        }

        return record

    }

    // PointDataRecords

    _parsePointDataRecords( header, onProgress ) {

        const offsetToPointData = header.OffsetToPointData
        if ( this._reader.offset !== offsetToPointData ) {
            console.error( 'The current reader offset does not match the header offset to point data ! Defaulting to header value.' )
            this._reader.skipOffsetTo( offsetToPointData )
        }

        const pointDataRecordFormat              = ( header.VersionMinor < 4 ) ? header.PointDataFormatID : header.PointDataRecordFormat
        const parsePointDataRecordFormatFunction = this._getPointDataRecordFormat( pointDataRecordFormat )

        const numberOfPointRecords = ( header.VersionMinor < 4 ) ? header.NumberOfPointRecords : header.LegacyNumberOfPointRecords
        const points               = new Array( numberOfPointRecords )

        for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
            points[ i ] = parsePointDataRecordFormatFunction()

            if ( i % 100000 === 0 ) {
                onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                    lengthComputable: true,
                    loaded:           i,
                    total:            numberOfPointRecords
                } ) )
            }
        }

        return points

    }

    _getPointDataRecordFormat( format ) {

        switch ( format ) {
            case 0:
                return this._parsePointDataRecordFormat_0.bind( this )
            case 1:
                return this._parsePointDataRecordFormat_1.bind( this )
            case 2:
                return this._parsePointDataRecordFormat_2.bind( this )
            case 3:
                return this._parsePointDataRecordFormat_3.bind( this )
            case 4:
                return this._parsePointDataRecordFormat_4.bind( this )
            case 5:
                return this._parsePointDataRecordFormat_5.bind( this )
            case 6:
                return this._parsePointDataRecordFormat_6.bind( this )
            case 7:
                return this._parsePointDataRecordFormat_7.bind( this )
            case 8:
                return this._parsePointDataRecordFormat_8.bind( this )
            case 9:
                return this._parsePointDataRecordFormat_9.bind( this )
            case 10:
                return this._parsePointDataRecordFormat_10.bind( this )

            default:
                throw new RangeError( `Invalid PointDataRecordFormat parameter: ${ format }` )
        }

    }

    _parsePointDataRecordFormat_0() {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_1() {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64()
        }

    }

    _parsePointDataRecordFormat_2() {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_3() {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_4() {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
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

    _parsePointDataRecordFormat_5() {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
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

    _parsePointDataRecordFormat_6() {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:      this._reader.getUint8(),
            ScanAngle:     this._reader.getInt16(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64()
        }

    }

    _parsePointDataRecordFormat_7() {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:      this._reader.getUint8(),
            ScanAngle:     this._reader.getInt16(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_8() {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:      this._reader.getUint8(),
            ScanAngle:     this._reader.getInt16(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16(),
            NIR:           this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_9() {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
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

    _parsePointDataRecordFormat_10() {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
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

    convert( lasDatas, onLoad, onProgress, onError ) {

        try {

            const pointsGroup            = new Group()
            pointsGroup.name             = 'Cloud'
            pointsGroup.matrixAutoUpdate = false
            pointsGroup.position.x       = lasDatas.Header.XOffset
            pointsGroup.position.y       = lasDatas.Header.YOffset
            pointsGroup.position.z       = lasDatas.Header.ZOffset
            //            pointsGroup.scale.x          = lasDatas.Header.XScaleFactor
            //            pointsGroup.scale.y          = lasDatas.Header.YScaleFactor
            //            pointsGroup.scale.z          = lasDatas.Header.ZScaleFactor
            //        pointsGroup.rotation.x -= PiOnTwo
            pointsGroup.userData = {
                header:  lasDatas.Header,
                records: lasDatas.VariableLengthRecords
            }

            this._createCloudPoints( pointsGroup, lasDatas, onProgress )

            onLoad( pointsGroup )

        } catch ( error ) {

            onError( error )

        }

    }

    /**
     *
     * @private
     */
    _offsetPoints() {

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
    _createCloudPoints( groupToFeed, lasDatas, onProgress ) {

        const classPointReverseMap = {
            0:  'Created',
            1:  'Unclassified',
            2:  'Ground',
            3:  'LowVegetation',
            4:  'MediumVegetation',
            5:  'HighVegetation',
            6:  'Building',
            7:  'LowPoint',
            8:  'ModelKeyPoint',
            9:  'Water',
            12: 'OverlapPoints'
        }

        // Precompute max intensity for all splits
        let maxIntensity = -Infinity
        for ( let pointDataRecord of lasDatas.PointDataRecords ) {
            const i = pointDataRecord.Intensity
            if ( i > maxIntensity ) {
                maxIntensity = i
            }
        }


        const scaleX                = lasDatas.Header.XScaleFactor
        const scaleY                = lasDatas.Header.YScaleFactor
        const scaleZ                = lasDatas.Header.ZScaleFactor
        const SPLIT_LIMIT           = 1000000
        const numberOfPoints        = lasDatas.PointDataRecords.length
        const numberOfSplit         = Math.ceil( numberOfPoints / SPLIT_LIMIT )
        const pointDataRecordFormat = ( lasDatas.Header.VersionMinor < 4 ) ? lasDatas.Header.PointDataFormatID : lasDatas.Header.PointDataRecordFormat
        const pointHaveColor        = ![ 0, 1, 4, 6, 9 ].includes( pointDataRecordFormat )
        const material              = new PointsMaterial( {
            size:         0.01,
            vertexColors: true
        } )
        let numberOfPointInSplit    = 0
        let splice                  = null
        let cloudPoint              = null

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = lasDatas.PointDataRecords.splice( 0, SPLIT_LIMIT )
            numberOfPointInSplit = splice.length
            const geometry       = new BufferGeometry()
            const positions      = new Float32Array( numberOfPointInSplit * 3 )
            const colors         = new Float32Array( numberOfPointInSplit * 3 )
            let bufferIndex      = 0
            let point            = null

            for ( let i = 0 ; i < numberOfPointInSplit ; ++i ) {

                const currentPointIndex = i + ( splitIndex * SPLIT_LIMIT )
                if ( currentPointIndex % 100000 === 0 ) {
                    onProgress( new ProgressEvent( 'ConvertPointDataRecords', {
                        lengthComputable: true,
                        loaded:           currentPointIndex,
                        total:            numberOfPoints
                    } ) )
                }

                // current point
                point = splice[ i ]

                // positions
                //                positions[ bufferIndex ]     = point.X
                //                positions[ bufferIndex + 1 ] = point.Y
                //                positions[ bufferIndex + 2 ] = point.Z
                positions[ bufferIndex ]     = point.X * scaleX
                positions[ bufferIndex + 1 ] = point.Y * scaleY
                positions[ bufferIndex + 2 ] = point.Z * scaleZ
                //                                    const x      = ( record.X * scaleX ) + offsetX
                //                                    const y      = ( record.Y * scaleY ) + offsetY
                //                                    const z      = ( record.Z * scaleZ ) + offsetZ


                // colors
                if ( pointHaveColor ) {

                    colors[ bufferIndex ]     = point.R / 65535
                    colors[ bufferIndex + 1 ] = point.G / 65535
                    colors[ bufferIndex + 2 ] = point.B / 65535

                } else {

                    const colorPointClass = this.colorForPointClass[ classPointReverseMap[ point.Classification.Class ] ]
                    if ( isDefined( colorPointClass ) ) {

                        colors[ bufferIndex ]     = colorPointClass.r / 255
                        colors[ bufferIndex + 1 ] = colorPointClass.g / 255
                        colors[ bufferIndex + 2 ] = colorPointClass.b / 255

                    } else {

                        const intensity           = point.Intensity
                        colors[ bufferIndex ]     = intensity / maxIntensity //255
                        colors[ bufferIndex + 1 ] = intensity / maxIntensity //255
                        colors[ bufferIndex + 2 ] = intensity / maxIntensity //255

                    }

                }

                bufferIndex += 3

            }

            geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) )
            geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) )

            cloudPoint = new Points( geometry, material )
            groupToFeed.add( cloudPoint )

        }

    }

    /**
     *
     * @param group
     * @private
     */
    _createSubCloudPoint( group ) {

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

export {
    LASLoader,
    PointClasses
}
