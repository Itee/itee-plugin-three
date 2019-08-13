console.log('Itee.Plugin.Three v1.0.0 - CommonJs')
'use strict';

var iteeDatabase = require('itee-database');
var iteeClient = require('itee-client');
var threeFull = require('three-full');
var iteeValidators = require('itee-validators');
var bson = require('bson');

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * From:
 * https://www.clicketyclick.dk/databases/xbase/format/db2_dbf.html#DBII_DBF_STRUCT
 * http://web.archive.org/web/20150323061445/http://ulisse.elettra.trieste.it/services/doc/dbase/DBFstruct.htm
 * http://www.dbase.com/Knowledgebase/INT/db7_file_fmt.htm
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/**
 *
 * @type {Object}
 */
const DBFVersion = Object.freeze( {
    FoxPro:               0x30,
    FoxPro_Autoincrement: 0x31,

    dBASE_II:   0x02,
    FoxPro_Var: 0x32,

    dBASE_III_plus:          0x03,
    dBASE_III_plus_memo:     0x83,
    dBASE_IV_SQL_table:      0x43,
    dBASE_IV_SQL_system:     0x63,
    dBASE_IV_memo:           0x8B,
    dBASE_IV_memo_SQL_table: 0xCB,
    FoxBase:                 0xFB,

    dBase_v_7: 4,

    FoxPro_2_x:    0xF5,
    HiPerSix_memo: 0xE5
} );

/**
 *
 * @type {Object}
 */
const DataType = Object.freeze( {
    Binary:        'B',
    Character:     'C',
    Date:          'D',
    Numeric:       'N',
    Logical:       'L',
    Memo:          'M',
    Timestamp:     '@',
    Long:          'I',
    Autoincrement: '+',
    Float:         'F',
    Double:        'O',
    OLE:           'G'
} );

/**
 *
 * @param manager
 * @param logger
 * @constructor
 */
function DBFLoader ( manager = threeFull.DefaultLoadingManager, logger = iteeClient.DefaultLogger ) {

    this.manager = manager;
    this.logger  = logger;
    this.reader  = new iteeClient.TBinaryReader();

}

Object.assign( DBFLoader, {

    /**
     *
     */
    Terminator: 0x0D,

    /**
     *
     */
    DeletedRecord: 0x1A,

    /**
     *
     */
    YearOffset: 1900

} );

Object.assign( DBFLoader.prototype, {

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( url, onLoad, onProgress, onError ) {

        const scope = this;

        const loader = new threeFull.FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    },

    /**
     *
     * @param arrayBuffer
     * @return {*}
     */
    parse ( arrayBuffer ) {

        this.reader
            .setEndianess( iteeClient.Endianness.Big )
            .setBuffer( arrayBuffer );

        const version = this.reader.getInt8();
        if ( !this._isValidVersion( version ) ) {
            this.logger.error( `DBFLoader: Invalid version number: ${version}` );
            return null
        }

        const header = this._parseHeader( version );
        const datas  = this._parseDatas( version, header );

        return {
            header,
            datas
        }

    },

    /**
     *
     * @param version
     * @return {boolean}
     * @private
     */
    _isValidVersion ( version ) {

        const availablesVersionValues = Object.values( DBFVersion );
        return ( availablesVersionValues.includes( version ) )

    },

    /**
     *
     * @param version
     * @return {{}}
     * @private
     */
    _parseHeader ( version ) {

        let header = {};

        switch ( version ) {

            case DBFVersion.FoxPro:
            case DBFVersion.FoxPro_Autoincrement:
            case DBFVersion.FoxPro_Var:
            case DBFVersion.dBASE_II:
                header = this._parseHeaderV2();
                break

            case DBFVersion.dBASE_III_plus:
            case DBFVersion.dBASE_III_plus_memo:
                header = this._parseHeaderV2_5();
                break

            case DBFVersion.dBASE_IV_memo:
            case DBFVersion.dBASE_IV_memo_SQL_table:
            case DBFVersion.dBASE_IV_SQL_system:
            case DBFVersion.dBASE_IV_SQL_table:
                header = this._parseHeaderV3();
                break

            case DBFVersion.dBase_v_7:
            case DBFVersion.FoxPro_2_x:
            case DBFVersion.HiPerSix_memo:
                header = this._parseHeaderV4();
                break

            default:
                throw new RangeError( `Invalid version parameter: ${version}` )

        }

        // Check terminator
        if ( this.reader.getUint8() !== DBFLoader.Terminator ) {
            this.logger.error( 'DBFLoader: Invalid terminator after field descriptors !!!' );
        }

        return header

    },

    /**
     *
     * @return {{numberOfRecords, year: *, month: (*|number), day: (*|number), lengthOfEachRecords, fields: Array}}
     * @private
     */
    _parseHeaderV2 () {

        const numberOfRecords     = this.reader.getInt16();
        const year                = this.reader.getInt8() + DBFLoader.YearOffset;
        const month               = this.reader.getInt8();
        const day                 = this.reader.getInt8();
        const lengthOfEachRecords = this.reader.getInt16();

        // Field descriptor array
        let fields        = [];
        let name          = undefined;
        let type          = undefined;
        let length        = undefined;
        let memoryAddress = undefined;
        let decimalCount  = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name          = this.reader.getString( 11 );
            type          = this.reader.getChar();
            length        = this.reader.getUint8();
            memoryAddress = this.reader.getInt16();
            decimalCount  = this.reader.getInt8();

            fields.push( {
                name,
                type,
                length,
                memoryAddress,
                decimalCount
            } );

        }

        return {
            numberOfRecords,
            year,
            month,
            day,
            lengthOfEachRecords,
            fields
        }

    },

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, fields: Array}}
     * @private
     */
    _parseHeaderV2_5 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();

        this.reader.setEndianess( iteeClient.Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( iteeClient.Endianness.Big );
        this.reader.skipOffsetOf( 3 + 13 + 4 ); // Reserved

        // Field descriptor array
        let fields        = [];
        let name          = undefined;
        let type          = undefined;
        let length        = undefined;
        let memoryAddress = undefined;
        let decimalCount  = undefined;
        let workAreaId    = undefined;
        let MDXFlag       = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name          = this.reader.getString( 11 );
            type          = this.reader.getChar();
            memoryAddress = this.reader.getInt32();
            length        = this.reader.getUint8();
            decimalCount  = this.reader.getUint8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            workAreaId = this.reader.getInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            MDXFlag = this.reader.getInt8();
            this.reader.skipOffsetOf( 1 ); // Reserved

            fields.push( {
                name,
                type,
                length,
                memoryAddress,
                decimalCount,
                workAreaId,
                MDXFlag
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            fields
        }

    },

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, incompleteTransactionFlag: (*|number), encryptionFlag: (*|number), MDXFlag:
     *     (*|number), languageDriverId: (*|number), fields: Array}}
     * @private
     */
    _parseHeaderV3 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( iteeClient.Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( iteeClient.Endianness.Big );
        this.reader.skipOffsetOf( 2 ); // Reserved
        const incompleteTransactionFlag = this.reader.getInt8();
        const encryptionFlag            = this.reader.getInt8();
        this.reader.skipOffsetOf( 12 ); // Reserved multi-users
        const MDXFlag          = this.reader.getInt8();
        const languageDriverId = this.reader.getInt8();
        this.reader.skipOffsetOf( 2 ); // Reserved

        // Field descriptor array
        let fields       = [];
        let name         = undefined;
        let type         = undefined;
        let length       = undefined;
        let decimalCount = undefined;
        let workAreaId   = undefined;
        let MDXFieldFlag = undefined;
        while ( this.reader.getOffset() < numberOfByteInHeader - 1 ) {
            //                for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name = this.reader.getString( 11 );
            type = this.reader.getChar();
            this.reader.skipOffsetOf( 4 ); // Reserved
            length       = this.reader.getUint8();
            decimalCount = this.reader.getUint8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            workAreaId = this.reader.getInt8();
            this.reader.skipOffsetOf( 10 ); // Reserved
            MDXFieldFlag = this.reader.getInt8();

            fields.push( {
                name,
                type,
                length,
                decimalCount,
                workAreaId,
                MDXFieldFlag
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            incompleteTransactionFlag,
            encryptionFlag,
            MDXFlag,
            languageDriverId,
            fields
        }

    },

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, incompleteTransactionFlag: (*|number), encryptionFlag: (*|number), MDXFlag:
     *     (*|number), languageDriverId: (*|number), languageDriverName, fields: Array}}
     * @private
     */
    _parseHeaderV4 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( iteeClient.Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( iteeClient.Endianness.Big );
        this.reader.skipOffsetOf( 2 ); // Reserved
        const incompleteTransactionFlag = this.reader.getInt8();
        const encryptionFlag            = this.reader.getInt8();
        this.reader.skipOffsetOf( 12 ); // Reserved multi-users
        const MDXFlag          = this.reader.getInt8();
        const languageDriverId = this.reader.getInt8();
        this.reader.skipOffsetOf( 2 ); // Reserved
        const languageDriverName = this.reader.getString( 32 );
        this.reader.skipOffsetOf( 4 ); // Reserved

        // Field descriptor array
        let fields                 = [];
        let name                   = undefined;
        let type                   = undefined;
        let length                 = undefined;
        let decimalCount           = undefined;
        let MDXFieldFlag           = undefined;
        let nextAutoincrementValue = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name         = this.reader.getString( 32 );
            type         = this.reader.getChar();
            length       = this.reader.getUint8();
            decimalCount = this.reader.getUint8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            MDXFieldFlag = this.reader.getInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            nextAutoincrementValue = this.reader.getInt32();
            this.reader.skipOffsetOf( 4 ); // Reserved

            fields.push( {
                name,
                type,
                length,
                decimalCount,
                MDXFieldFlag,
                nextAutoincrementValue
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            incompleteTransactionFlag,
            encryptionFlag,
            MDXFlag,
            languageDriverId,
            languageDriverName,
            fields
        }

    },

    /**
     *
     * @param version
     * @param header
     * @return {Array}
     * @private
     */
    _parseDatas ( version, header ) {

        const numberOfRecords = header.numberOfRecords;
        const fields          = header.fields;

        // Todo: use it
        //        let properties = null
        //        if ( version === DBFVersion.dBase_v_7 ) {
        //            properties = this._parseFieldProperties()
        //        }

        let records = [];
        let record  = null;
        let field   = null;
        for ( let recordIndex = 0 ; recordIndex < numberOfRecords ; recordIndex++ ) {

            record              = {};
            record[ 'deleted' ] = ( this.reader.getUint8() === DBFLoader.DeletedRecord );

            for ( let fieldIndex = 0, numberOfFields = fields.length ; fieldIndex < numberOfFields ; fieldIndex++ ) {

                field = fields[ fieldIndex ];

                switch ( field.type ) {

                    case DataType.Binary: {
                        const binaryString   = this.reader.getString( field.length );
                        record[ field.name ] = parseInt( binaryString );
                    }
                        break

                    case DataType.Numeric: {
                        const numericString  = this.reader.getString( field.length );
                        record[ field.name ] = parseInt( numericString );
                    }
                        break

                    case DataType.Character: {
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    case DataType.Date: {
                        // YYYYMMDD
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    case DataType.Logical: {
                        const logical = this.reader.getChar().toLowerCase();
                        if ( logical === 't' || logical === 'y' ) {
                            record[ field.name ] = true;
                        } else if ( logical === 'f' || logical === 'n' ) {
                            record[ field.name ] = false;
                        } else {
                            record[ field.name ] = null;
                        }
                    }
                        break

                    case DataType.Memo: {
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    // 8 bytes - two longs, first for date, second for time.
                    // The date is the number of days since  01/01/4713 BC.
                    // Time is hours * 3600000L + minutes * 60000L + Seconds * 1000L
                    case DataType.Timestamp:
                        break

                    // 4 bytes. Leftmost bit used to indicate sign, 0 negative.
                    case DataType.Long: {
                        record[ field.name ] = this.reader.getInt32();
                    }
                        break

                    // Same as a Long
                    case DataType.Autoincrement: {
                        record[ field.name ] = this.reader.getInt32();
                    }
                        break

                    case DataType.Float: {
                        const floatString    = this.reader.getString( field.length );
                        record[ field.name ] = parseInt( floatString );
                    }
                        break

                    case DataType.Double: {
                        record[ field.name ] = this.reader.getFloat64();
                    }
                        break

                    case DataType.OLE: {
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    default:
                        throw new RangeError( `Invalid data type parameter: ${field.type}` )

                }

            }

            records.push( record );

        }

        return records

    },

    /**
     *
     * @return {{numberOfStandardProperties, startOfStandardPropertiesDescriptor, numberOfCustomProperties, startOfCustomPropertiesDescriptor, numberOfReferentialIntegrityProperties,
     *     startOfReferentialIntegrityDescriptor, startOfData, sizeOfPropertiesStructure, standardProperties: Array, customProperties: Array, referentialIntegrityProperties: Array}}
     * @private
     */
    _parseFieldProperties () {

        const numberOfStandardProperties             = this.reader.getInt16();
        const startOfStandardPropertiesDescriptor    = this.reader.getInt16();
        const numberOfCustomProperties               = this.reader.getInt16();
        const startOfCustomPropertiesDescriptor      = this.reader.getInt16();
        const numberOfReferentialIntegrityProperties = this.reader.getInt16();
        const startOfReferentialIntegrityDescriptor  = this.reader.getInt16();
        const startOfData                            = this.reader.getInt16();
        const sizeOfPropertiesStructure              = this.reader.getInt16();

        let standardProperties = [];
        for ( let standardIndex = 0 ; standardIndex < numberOfStandardProperties ; standardIndex++ ) {
            standardProperties.push( this._getStandardProperties() );
        }

        let customProperties = [];
        for ( let customIndex = 0 ; customIndex < numberOfCustomProperties ; customIndex++ ) {
            customProperties.push( this._getCustomProperties() );
        }

        let referentialIntegrityProperties = [];
        for ( let referentialIntegrityIndex = 0 ; referentialIntegrityIndex < numberOfReferentialIntegrityProperties ; referentialIntegrityIndex++ ) {
            referentialIntegrityProperties.push( this._getReferentialIntegrityProperties() );
        }

        return {
            numberOfStandardProperties,
            startOfStandardPropertiesDescriptor,
            numberOfCustomProperties,
            startOfCustomPropertiesDescriptor,
            numberOfReferentialIntegrityProperties,
            startOfReferentialIntegrityDescriptor,
            startOfData,
            sizeOfPropertiesStructure,
            standardProperties,
            customProperties,
            referentialIntegrityProperties
        }

    },

    /**
     *
     * @return {{generationalNumber, tableFieldOffset, propertyDescribed: (*|number), type: (*|number), isConstraint: (*|number), offsetFromStart, widthOfDatabaseField}}
     * @private
     */
    _getStandardProperties () {

        const generationalNumber = this.reader.getInt16();
        const tableFieldOffset   = this.reader.getInt16();
        const propertyDescribed  = this.reader.getInt8();
        const type               = this.reader.getInt8();
        const isConstraint       = this.reader.getInt8();
        this.reader.skipOffsetOf( 4 ); // Reserved
        const offsetFromStart      = this.reader.getInt16();
        const widthOfDatabaseField = this.reader.getInt16();

        return {
            generationalNumber,
            tableFieldOffset,
            propertyDescribed,
            type,
            isConstraint,
            offsetFromStart,
            widthOfDatabaseField
        }

    },

    /**
     *
     * @return {{generationalNumber, tableFieldOffset, type: (*|number), offsetFromStartOfName, lengthOfName, offsetFromStartOfData, lengthOfData}}
     * @private
     */
    _getCustomProperties () {

        const generationalNumber = this.reader.getInt16();
        const tableFieldOffset   = this.reader.getInt16();
        const type               = this.reader.getInt8();
        this.reader.skipOffsetOf( 1 ); // Reserved
        const offsetFromStartOfName = this.reader.getInt16();
        const lengthOfName          = this.reader.getInt16();
        const offsetFromStartOfData = this.reader.getInt16();
        const lengthOfData          = this.reader.getInt16();

        return {
            generationalNumber,
            tableFieldOffset,
            type,
            offsetFromStartOfName,
            lengthOfName,
            offsetFromStartOfData,
            lengthOfData
        }

    },

    /**
     *
     * @return {{databaseState: (*|number), sequentialNumberRule, offsetOfTheRIRuleName, sizeOfTheRIRuleName, offsetOfNameOfForeignTable, sizeOfNameOfForeignTable, stateBehaviour: (*|number),
     *     numberOfFieldsInLinkingKey, offsetOfLocalTableTagName, sizeOfTheLocalTableTagName, offsetOfForeignTableTagName, sizeOfTheForeignTableTagName}}
     * @private
     */
    _getReferentialIntegrityProperties () {

        const databaseState                = this.reader.getInt8();
        const sequentialNumberRule         = this.reader.getInt16();
        const offsetOfTheRIRuleName        = this.reader.getInt16();
        const sizeOfTheRIRuleName          = this.reader.getInt16();
        const offsetOfNameOfForeignTable   = this.reader.getInt16();
        const sizeOfNameOfForeignTable     = this.reader.getInt16();
        const stateBehaviour               = this.reader.getInt8();
        const numberOfFieldsInLinkingKey   = this.reader.getInt16();
        const offsetOfLocalTableTagName    = this.reader.getInt16();
        const sizeOfTheLocalTableTagName   = this.reader.getInt16();
        const offsetOfForeignTableTagName  = this.reader.getInt16();
        const sizeOfTheForeignTableTagName = this.reader.getInt16();

        return {
            databaseState,
            sequentialNumberRule,
            offsetOfTheRIRuleName,
            sizeOfTheRIRuleName,
            offsetOfNameOfForeignTable,
            sizeOfNameOfForeignTable,
            stateBehaviour,
            numberOfFieldsInLinkingKey,
            offsetOfLocalTableTagName,
            sizeOfTheLocalTableTagName,
            offsetOfForeignTableTagName,
            sizeOfTheForeignTableTagName
        }

    }

} );

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class DbfToThree extends iteeDatabase.TAbstractFileConverter {

    constructor () {
        super( iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer );
    }

    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new DBFLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class JsonToThree extends iteeDatabase.TAbstractFileConverter {

    constructor () {
        super( iteeDatabase.TAbstractFileConverter.DumpType.JSON );
    }

    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new threeFull.ObjectLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class MtlToThree extends iteeDatabase.TAbstractFileConverter {

    constructor () {
        super( iteeDatabase.TAbstractFileConverter.DumpType.String );
    }

    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new threeFull.MTLLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class Obj2ToThree extends iteeDatabase.TAbstractFileConverter {

    constructor () {
        super( iteeDatabase.TAbstractFileConverter.DumpType.String );
    }

    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new threeFull.OBJLoader2();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * This class allow to split any geometries type during runtime.
 * Keeping normals and Uvs. It is really usefull to see inside mesh like building.
 *
 * Constructor parameter:
 *
 * size - the size of the square view
 *
 * @class Todo...
 * @classdesc Todo...
 * @example Todo...
 *
 */

/**
 *
 * @type {Object}
 */
const ShapeType = Object.freeze( {
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
} );

// Helpers
/**
 *
 * @param ring
 * @return {boolean}
 */
function ringClockwise ( ring ) {

    if ( ( n = ring.length ) < 4 ) {
        return false
    }

    var i = 0, n, area = ring[ n - 1 ][ 1 ] * ring[ 0 ][ 0 ] - ring[ n - 1 ][ 0 ] * ring[ 0 ][ 1 ];
    while ( ++i < n ) {
        area += ring[ i - 1 ][ 1 ] * ring[ i ][ 0 ] - ring[ i - 1 ][ 0 ] * ring[ i ][ 1 ];
    }
    return area >= 0
}

/**
 *
 * @param ring
 * @param hole
 * @return {boolean}
 */
function ringContainsSome ( ring, hole ) {

    let i = 0;
    let n = hole.length;

    do {

        if ( ringContains( ring, hole[ i ] ) > 0 ) {
            return true
        }

    } while ( ++i < n )

    return false

}

/**
 *
 * @param ring
 * @param point
 * @return {number}
 */
function ringContains ( ring, point ) {

    let x        = point[ 0 ];
    let y        = point[ 1 ];
    let contains = -1;

    for ( let i = 0, n = ring.length, j = n - 1 ; i < n ; j = i++ ) {

        const pi = ring[ i ];
        const xi = pi[ 0 ];
        const yi = pi[ 1 ];
        const pj = ring[ j ];
        const xj = pj[ 0 ];
        const yj = pj[ 1 ];

        if ( segmentContains( pi, pj, point ) ) {
            contains = 0;
        } else if ( ( ( yi > y ) !== ( yj > y ) ) && ( ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi ) ) ) {
            contains = -contains;
        }

    }

    return contains

}

/**
 *
 * @param p0
 * @param p1
 * @param p2
 * @return {boolean}
 */
function segmentContains ( p0, p1, p2 ) {
    var x20 = p2[ 0 ] - p0[ 0 ], y20 = p2[ 1 ] - p0[ 1 ];
    if ( x20 === 0 && y20 === 0 ) {
        return true
    }
    var x10 = p1[ 0 ] - p0[ 0 ], y10 = p1[ 1 ] - p0[ 1 ];
    if ( x10 === 0 && y10 === 0 ) {
        return false
    }
    var t = ( x20 * x10 + y20 * y10 ) / ( x10 * x10 + y10 * y10 );
    return t < 0 || t > 1 ? false : t === 0 || t === 1 ? true : t * x10 === x20 && t * y10 === y20
}

/**
 *
 * @param manager
 * @param logger
 * @constructor
 */
function SHPLoader ( manager = threeFull.DefaultLoadingManager, logger = iteeClient.DefaultLogger ) {

    this.manager = manager;
    this.logger  = logger;

    this.globalOffset = new threeFull.Vector3();
    this.worldAxis    = {
        from: 'zUp',
        to:   'zForward'
    };

    this._reader = new iteeClient.TBinaryReader();

}

Object.assign( SHPLoader, {

    /**
     *
     */
    FileCode: 9994,

    /**
     *
     */
    MinFileLength: 100,

    /**
     *
     */
    MinVersion: 1000

} );

Object.assign( SHPLoader.prototype, {

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( url, onLoad, onProgress, onError ) {

        const scope = this;

        const loader = new threeFull.FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    },

    /**
     *
     * @param arrayBuffer
     * @return {*}
     */
    parse ( arrayBuffer ) {

        this._reader
            .setEndianess( iteeClient.Endianness.Big )
            .setBuffer( arrayBuffer );

        const header = this._parseHeader();

        if ( header.fileCode !== SHPLoader.FileCode ) {
            this.logger.error( 'SHPLoader: Invalide Shape file code !' );
            return null
        }

        if ( header.fileLength < SHPLoader.MinFileLength ) {
            this.logger.error( 'SHPLoader: Shape file have an incorrect length !' );
            return null
        }

        if ( !Object.values( ShapeType ).includes( header.shapeType ) ) {
            this.logger.error( 'SHPLoader: Shape file have an incorrect shape type !' );
            return null
        }

        if ( header.version < SHPLoader.MinVersion ) {
            this.logger.warn( 'SHPLoader: Version of shape file below than 1000 could be incorrectly parsed !' );
        }

        const datas  = this._parseDatas( header );
        const shapes = this._convertToObjects( datas );

        return shapes

    },

    /**
     *
     * @return {{fileCode, fileLength, version, shapeType, boundingBox: {xMin, xMax, yMin, yMax, zMin, zMax, mMin, mMax}}}
     * @private
     */
    _parseHeader () {

        const fileCode = this._reader.getInt32();
        this._reader.skipOffsetOf( 20 );
        const fileLength = this._reader.getInt32();

        this._reader.setEndianess( iteeClient.Endianness.Little );

        const version         = this._reader.getInt32();
        const shapeType       = this._reader.getInt32();
        const xMinBoundingBox = this._reader.getInt32();
        const yMinBoundingBox = this._reader.getInt32();
        const xMaxBoundingBox = this._reader.getInt32();
        const yMaxBoundingBox = this._reader.getInt32();
        const zMinBoundingBox = this._reader.getInt32();
        const zMaxBoundingBox = this._reader.getInt32();
        const mMinBoundingBox = this._reader.getInt32();
        const mMaxBoundingBox = this._reader.getInt32();

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

    },

    /**
     *
     * @param header
     * @return {Array}
     * @private
     */
    _parseDatas ( header ) {

        this._reader.skipOffsetTo( 100 );

        let datas         = [];
        let recordHeader  = undefined;
        let endOfRecord   = undefined;
        let recordContent = undefined;

        while ( !this._reader.isEndOfFile() ) {

            recordHeader = this._parseRecordHeader();
            endOfRecord  = this._reader.getOffset() + ( recordHeader.contentLength * 2 );

            // All parsing methods use little below
            this._reader.setEndianess( iteeClient.Endianness.Little );

            switch ( header.shapeType ) {

                case ShapeType.NullShape:

                    this._reader.skipOffsetTo( endOfRecord );

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

                        recordContent = this._parsePoint();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.Polyline:
                case ShapeType.PolyLineZ:
                case ShapeType.PolylineM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolyLine();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.Polygon:
                case ShapeType.PolygonZ:
                case ShapeType.PolygonM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolyLine();
                        //                        recordContent = this._parsePolygon();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.MultiPoint:
                case ShapeType.MultiPointZ:
                case ShapeType.MultiPointM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPoint();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.MultiPatch:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPatch();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                default:
                    this.logger.error( `SHPLoader: Invalid switch parameter: ${header.shapeType}` );
                    break

            }

        }

        return datas

    },

    /**
     *
     * @return {{recordNumber, contentLength}}
     * @private
     */
    _parseRecordHeader () {

        this._reader.setEndianess( iteeClient.Endianness.Big );

        const recordNumber  = this._reader.getInt32();
        const contentLength = this._reader.getInt32();

        return {
            recordNumber,
            contentLength
        }

    },

    //    _parseNull () {
    //
    //        this._reader.getInt32();
    //
    //        return null;
    //    },

    /**
     *
     * @return {*}
     * @private
     */
    _parsePoint () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const x = this._reader.getFloat64();
        const y = this._reader.getFloat64();

        return {
            shapeType,
            x,
            y
        }

    },

    /**
     *
     * @return {*}
     * @private
     */
    _parsePolyLine () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        };

        const numberOfParts  = this._reader.getInt32();
        const numberOfPoints = this._reader.getInt32();

        const parts = new Array( numberOfParts );
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32();
        }

        const points = new Array( numberOfPoints );
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getFloat64(),
                y: this._reader.getFloat64()
            };
        }

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            points
        }

    },

    /**
     *
     * @return {*}
     * @private
     */
    _parsePolygon () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        };

        const numberOfParts  = this._reader.getInt32();
        const numberOfPoints = this._reader.getInt32();

        let parts = new Array( numberOfParts );
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32();
        }

        let points = new Array( numberOfPoints );
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getFloat64(),
                y: this._reader.getFloat64()
            };
        }

        const polygons = [];
        const holes    = [];

        parts.forEach( ( value, index ) => {

            const ring = points.slice( value, parts[ index + 1 ] );

            if ( ringClockwise( ring ) ) {

                polygons.push( ring );
                //					polygons.push( [ ring ] );

            } else {

                holes.push( ring );

            }

        } );

        holes.forEach( hole => {

            polygons.some( polygon => {

                if ( ringContainsSome( polygon[ 0 ], hole ) ) {
                    polygon.push( hole );
                    return true
                }

            } ) || polygons.push( [ hole ] );

        } );

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            polygons
        }

    },

    /**
     *
     * @return {*}
     * @private
     */
    _parseMultiPoint () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        };

        const numberOfPoints = this._reader.getInt32();

        const points = new Array( numberOfPoints );

        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points.push( [ this._reader.getFloat64(), this._reader.getFloat64() ] );
        }

        return {
            shapeType,
            boundingBox,
            numberOfPoints,
            points
        }

    },

    /**
     *
     * @return {*}
     * @private
     */
    _parseMultiPatch () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        return {
            shapeType
        }

    },

    /**
     *
     * @param datas
     * @return {Array}
     * @private
     */
    _convertToObjects ( datas ) {

        let shapes = [];

        for ( let index = 0, numberOfShapes = datas.length ; index < numberOfShapes ; index++ ) {
            let data = datas[ index ];

            if ( data.shapeType === ShapeType.Polygon || data.shapeType === ShapeType.PolygonZ || data.shapeType === ShapeType.PolygonM ) {

                if ( data.points && Array.isArray( data.points[ 0 ] ) ) {

                    __createObjectsFromArrays( data.points );

                } else {

                    __createObjectFromPoints( data.points );

                }

            }

        }

        function __createObjectsFromArrays ( arrays ) {

            //Todo: need to fix parsePolygon to avoid too much array imbrication

            for ( let arrayIndex = 0, numberOfArray = arrays.length ; arrayIndex < numberOfArray ; arrayIndex++ ) {

                let array = arrays[ arrayIndex ];

                if ( !array ) {
                    this.logger.log( 'no array, oups !' );
                    continue
                }

                if ( Array.isArray( array[ 0 ] ) ) {

                    __createObjectsFromArrays( array );

                } else {

                    __createObjectFromPoints( array );

                }

            }

        }

        function __createObjectFromPoints ( points ) {

            shapes.push( new threeFull.Shape( points ) );

        }

        return shapes

    }

} );

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class ShpToThree extends iteeDatabase.TAbstractFileConverter {

    constructor () {
        super( iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer );
    }

    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new SHPLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class ThreeToMongoDB extends iteeDatabase.TAbstractDataInserter {

    constructor ( Mongoose ) {

        super( Mongoose );

    }

    _save ( data, parameters, onSuccess, onProgress, onError ) {

        const self                 = this;
        const parentId             = parameters.parentId;
        const disableRootNode      = ( parameters.disableRootNode === 'true' );
        const dataToParse          = ( disableRootNode ) ? data.children : ( iteeValidators.isArray( data ) ) ? data : [ data ];
        const errors               = [];
        const numberOfRootChildren = dataToParse.length;
        let processedRootChildren  = 0;

        if ( numberOfRootChildren === 0 ) {
            onError( 'No node to save in database !' );
        }

        let rootChildIndex = 0;
        checkNextRootChild();

        function checkNextRootChild () {

            const rootChild = dataToParse[ rootChildIndex ];

            self._parse(
                rootChild,
                ( childrenIds ) => {

                    processedRootChildren++;

                    onProgress( {
                        name: rootChild.name,
                        done: processedRootChildren,
                        todo: numberOfRootChildren
                    } );

                    // In case the root object haven't parent or children skip update
                    if ( iteeValidators.isNotDefined( parentId ) || iteeValidators.isNotDefined( childrenIds ) ) {

                        checkEndOfParsing();
                        return

                    } else if ( typeof childrenIds === 'string' ) {

                        // Convert single childrenId to array to avoid unecessary code duplication
                        childrenIds = [ childrenIds ];

                    }

                    const Objects3DModelBase = self._driver.model( 'Objects3D' );
                    Objects3DModelBase.findOneAndUpdate( { _id: parentId }, { $push: { children: childrenIds } }, ( error, rootObject ) => {

                        if ( error ) {

                            errors.push( error );
                            checkEndOfParsing();
                            return

                        }

                        if ( !rootObject ) {

                            errors.push( `Unable to retrieve parent object with the given id: ${parentId} !!!` );
                            checkEndOfParsing();
                            return

                        }

                        // Update Children with parent id
                        const rootId           = rootObject.id;
                        const numberOfChildren = childrenIds.length;
                        let endUpdates         = 0;

                        for ( let childIndex = 0 ; childIndex < numberOfChildren ; childIndex++ ) {

                            let childId = childrenIds[ childIndex ];

                            Objects3DModelBase.findByIdAndUpdate( childId, { $set: { parent: rootId } }, ( error ) => {

                                if ( error ) {
                                    errors.push( error );
                                }

                                endUpdates++;
                                if ( endUpdates < numberOfChildren ) {
                                    return
                                }

                                checkEndOfParsing();

                            } );

                        }

                    } );

                },
                onProgress,
                onError
            );

        }

        function checkEndOfParsing () {
            rootChildIndex++;
            if ( rootChildIndex < numberOfRootChildren ) {
                checkNextRootChild();
                return
            }

            if ( errors.length > 0 ) {
                onError( errors );
            } else {
                onSuccess( parentId );
            }
        }

    }

    _parse ( object, onSuccess, onProgress, onError ) {

        const self             = this;
        const numberOfChildren = object.children.length;
        let childrenIds        = [];
        let childIndex         = 0;

        if ( numberOfChildren > 0 ) {

            checkNextChild();

        } else {

            self._saveInDataBase( object, [], onError, onSuccess );

        }

        function checkNextChild () {

            const child = object.children[ childIndex ];

            self._parse(
                child,
                objectId => {

                    childrenIds.push( objectId );

                    onProgress( {
                        name: child.name,
                        done: childrenIds.length,
                        todo: numberOfChildren
                    } );

                    if ( childrenIds.length < numberOfChildren ) {
                        childIndex++;
                        checkNextChild();
                        return
                    }

                    self._saveInDataBase( object, childrenIds, onError, onSuccess );

                },
                onProgress,
                onError
            );

        }

    }

    ///////////

    _parseUserData ( jsonUserData ) {

        let userData = {};

        for ( let prop in jsonUserData ) {

            if ( !Object.prototype.hasOwnProperty.call( jsonUserData, prop ) ) { continue }

            userData[ prop.replace( /\./g, '' ) ] = jsonUserData[ prop ];

        }

        return userData

    }

    _saveInDataBase ( object, childrenArrayIds, onError, onSuccess ) {

        // Remove null ids that could come from invalid objects
        const self        = this;
        const childrenIds = childrenArrayIds.filter( ( item ) => {
            return item
        } );

        // Preprocess objects here to save geometry, materials and related before to save the object itself
        const objectType = object.type;
        const geometry   = object.geometry;
        const materials  = object.material;

        if (
            objectType === 'Curve' ||
            objectType === 'ArcCurve' ||
            objectType === 'CatmullRomCurve3' ||
            objectType === 'CubicBezierCurve' ||
            objectType === 'CubicBezierCurve3' ||
            objectType === 'EllipseCurve' ||
            objectType === 'LineCurve' ||
            objectType === 'LineCurve3' ||
            objectType === 'QuadraticBezierCurve' ||
            objectType === 'QuadraticBezierCurve3' ||
            objectType === 'SplineCurve' ||
            objectType === 'CurvePath' ||
            objectType === 'Path' ||
            objectType === 'Shape'
        ) {

            self._saveCurveInDatabase( object, childrenIds, onError, onSuccess );

        } else if ( geometry && materials ) {

            if ( geometry.isGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.vertices || geometry.vertices.length === 0 ) ) {

                    console.error( `Object ${object.name} geometry doesn't contain vertices ! Skip it.` );
                    onSuccess( null );
                    return

                }

                if ( objectType === 'Line' || objectType === 'LineLoop' || objectType === 'LineSegments' ) {

                    // if material != LineBasicMaterial or LineDashedMaterial... ERROR
                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false;
                        let material        = undefined;
                        let materialType    = undefined;
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ];
                            materialType = material.type;
                            if ( materialType !== 'LineBasicMaterial' && materialType !== 'LineDashedMaterial' ) {
                                materialOnError = true;
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` );
                            onSuccess( null );
                            return

                        }

                    } else if ( materials.type !== 'LineBasicMaterial' && materials.type !== 'LineDashedMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` );
                        onSuccess( null );
                        return

                    }

                } else if ( objectType === 'Points' ) {

                    // if material != PointsMaterial... ERROR

                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false;
                        let material        = undefined;
                        let materialType    = undefined;
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ];
                            materialType = material.type;
                            if ( materialType !== 'PointsMaterial' ) {
                                materialOnError = true;
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` );
                            onSuccess( null );
                            return

                        }

                    } else if ( materials.type !== 'PointsMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` );
                        onSuccess( null );
                        return

                    }

                }

                self._saveGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveMaterialInDatabase( materials, onError, ( materialIds ) => {

                        self._saveObject3DInDatabase( object, childrenIds, geometryId, materialIds, onError, onSuccess );

                    } );

                } );

            } else if ( geometry.isBufferGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.attributes[ 'position' ] || geometry.attributes[ 'position' ].count === 0 ) ) {

                    console.error( `Object ${object.name} geometry doesn't contain vertices ! Skip it.` );
                    onSuccess( null );
                    return

                }

                if ( objectType === 'Line' || objectType === 'LineLoop' || objectType === 'LineSegments' ) {

                    // if material != LineBasicMaterial or LineDashedMaterial... ERROR
                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false;
                        let material        = undefined;
                        let materialType    = undefined;
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ];
                            materialType = material.type;
                            if ( materialType !== 'LineBasicMaterial' && materialType !== 'LineDashedMaterial' ) {
                                materialOnError = true;
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` );
                            onSuccess( null );
                            return

                        }

                    } else if ( materials.type !== 'LineBasicMaterial' && materials.type !== 'LineDashedMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` );
                        onSuccess( null );
                        return

                    }

                } else if ( objectType === 'Points' ) {

                    // if material != PointsMaterial... ERROR

                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false;
                        let material        = undefined;
                        let materialType    = undefined;
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ];
                            materialType = material.type;
                            if ( materialType !== 'PointsMaterial' ) {
                                materialOnError = true;
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` );
                            onSuccess( null );
                            return

                        }

                    } else if ( materials.type !== 'PointsMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` );
                        onSuccess( null );
                        return

                    }

                }

                self._saveBufferGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveMaterialInDatabase( materials, onError, ( materialIds ) => {

                        self._saveObject3DInDatabase( object, childrenIds, geometryId, materialIds, onError, onSuccess );

                    } );

                } );

            } else {

                console.error( `Object ${object.name} contain an unknown/unmanaged geometry of type ${geometry.type} ! Skip it.` );
                onSuccess( null );

            }

        } else if ( geometry && !materials ) {

            // Is this right ??? Object can have geometry without material ???

            if ( geometry.isGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.vertices || geometry.vertices.length === 0 ) ) {

                    console.error( `Mesh ${object.name} geometry doesn't contain vertices ! Skip it.` );
                    onSuccess( null );
                    return

                }

                self._saveGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveObject3DInDatabase( object, childrenIds, geometryId, [], onError, onSuccess );

                } );

            } else if ( geometry.isBufferGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.attributes[ 'position' ] || geometry.attributes[ 'position' ].count === 0 ) ) {

                    console.error( `Mesh ${object.name} buffer geometry doesn't contain position attributes ! Skip it.` );
                    onSuccess( null );
                    return

                }

                self._saveBufferGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveObject3DInDatabase( object, childrenIds, geometryId, null, onError, onSuccess );

                } );

            } else {

                console.error( `Object ${object.name} contain an unknown/unmanaged geometry of type ${geometry.type} ! Skip it.` );
                onSuccess( null );

            }

        } else if ( !geometry && materials ) {

            if ( objectType === 'Sprite' ) {

                // if material != SpriteMaterial... ERROR
                if ( Array.isArray( materials ) ) {

                    let materialOnError = false;
                    let material        = undefined;
                    let materialType    = undefined;
                    for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                        material     = materials[ materialIndex ];
                        materialType = material.type;
                        if ( materialType !== 'SpriteMaterial' ) {
                            materialOnError = true;
                            break
                        }

                    }

                    if ( materialOnError ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` );
                        onSuccess( null );
                        return

                    }

                } else if ( materials.type !== 'SpriteMaterial' ) {

                    console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` );
                    onSuccess( null );
                    return

                }

            } else {

                console.error( `Missing geometry for object ${object.name} of type ${objectType}. Only Sprite can contains material without geometry ! Skip it.` );
                onSuccess( null );
                return

            }

            self._saveMaterialInDatabase( materials, onError, ( materialIds ) => {

                self._saveObject3DInDatabase( object, childrenIds, null, materialIds, onError, onSuccess );

            } );

        } else {

            self._saveObject3DInDatabase( object, childrenIds, null, null, onError, onSuccess );

        }

    }

    // Object3D

    _checkIfObject3DAlreadyExist ( /*object*/ ) {

        // Todo
        return null

    }

    _getObject3DModel ( object, childrenIds, geometryId, materialsIds ) {

        object.parent   = null;
        object.children = childrenIds;
        object.geometry = geometryId;
        object.material = materialsIds;

        return this._driver.model( object.type )( object )

    }

    _saveObject3DInDatabase ( object, childrenIds, geometryId, materialsIds, onError, onSuccess ) {

        const self     = this;
        const objectId = this._checkIfObject3DAlreadyExist( object );

        if ( objectId ) {

            onSuccess( objectId );

        } else {

            this._getObject3DModel( object, childrenIds, geometryId, materialsIds )
                .save()
                .then( savedObject => {

                    const objectId = savedObject.id;

                    // Update Children with parent id
                    if ( childrenIds && childrenIds.length > 0 ) {
                        updateChildren( onError, onSuccess );
                    } else {
                        onSuccess( objectId );
                    }

                    function updateChildren ( onError, onSuccess ) {

                        const savedChildrenIds = savedObject._doc.children;
                        const numberOfChildren = savedChildrenIds.length;

                        let endUpdates = 0;
                        let childId    = undefined;
                        const errors   = [];

                        for ( let childIndex = 0 ; childIndex < numberOfChildren ; childIndex++ ) {

                            childId = savedChildrenIds[ childIndex ];

                            const Objects3DModelBase = self._driver.model( 'Objects3D' );
                            Objects3DModelBase.findByIdAndUpdate( childId, { $set: { parent: objectId } }, ( error ) => {

                                if ( error ) {
                                    errors.push( error );
                                }

                                endUpdates++;
                                if ( endUpdates < numberOfChildren ) {
                                    return
                                }

                                returnResult( onError, onSuccess );

                            } );

                        }

                        function returnResult ( onError, onSuccess ) {

                            if ( errors.length > 0 ) {
                                onError( errors );
                            } else {
                                onSuccess( objectId );
                            }

                        }

                    }

                } )
                .catch( onError );

        }

    }

    // Curve

    _checkIfCurveAlreadyExist ( /*curve*/ ) {

        // Todo
        return null

    }

    _getCurveModel ( curve ) {

        return this._driver.model( curve.type )( curve )

    }

    _saveCurveInDatabase ( curve, onError, onSuccess ) {

        const curveId = this._checkIfCurveAlreadyExist( curve );

        if ( curveId ) {

            onSuccess( curveId );

        } else {

            this._getCurveModel( curve )
                .save()
                .then( savedCurve => { onSuccess( savedCurve.id ); } )
                .catch( onError );

        }

    }

    // Geometry

    _checkIfGeometryAlreadyExist ( /*geometry*/ ) {

        // Todo
        return null

    }

    _getGeometryModel ( geometry ) {

        return this._driver.model( geometry.type )( geometry )

    }

    _saveGeometryInDatabase ( geometry, onError, onSuccess ) {

        const geometryId = this._checkIfGeometryAlreadyExist( geometry );

        if ( geometryId ) {

            onSuccess( geometryId );

        } else {

            this._getGeometryModel( geometry )
                .save()
                .then( savedGeometry => { onSuccess( savedGeometry.id ); } )
                .catch( onError );

        }

    }

    // BufferGeometry

    _checkIfBufferGeometryAlreadyExist ( /*bufferGeometry*/ ) {

        // Todo
        return null

    }

    _getBufferGeometryModel ( bufferGeometry ) {

        return this._driver.model( bufferGeometry.type )( bufferGeometry )

    }

    _saveBufferGeometryInDatabase ( bufferGeometry, onError, onSuccess ) {

        const bufferGeometryId = this._checkIfBufferGeometryAlreadyExist( bufferGeometry );

        if ( bufferGeometryId ) {

            onSuccess( bufferGeometryId );

        } else {

            this._getBufferGeometryModel( bufferGeometry )
                .save()
                .then( savedBufferGeometry => { onSuccess( savedBufferGeometry.id ); } )
                .catch( onError );

        }

    }

    // Material

    _checkIfMaterialAlreadyExist ( /*materials*/ ) {

        // Todo
        return null

    }

    _getMaterialModel ( material, texturesIds ) {

        material.texturesIds = texturesIds;

        return this._driver.model( material.type )( material )

    }

    _saveMaterialInDatabase ( materials, onError, onSuccess ) {

        if ( iteeValidators.isArray( materials ) ) {

            const numberOfMaterials    = materials.length;
            let materialIds            = new Array( numberOfMaterials );
            let numberOfSavedMaterials = 0;
            let material               = undefined;
            for ( let materialIndex = 0 ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                material         = materials[ materialIndex ];
                const materialId = this._checkIfMaterialAlreadyExist( material );

                if ( materialId ) {

                    materialIds[ materialIndex ] = materialId;
                    numberOfSavedMaterials++;

                    // End condition
                    if ( numberOfSavedMaterials === numberOfMaterials ) {
                        onSuccess( materialIds );
                    }

                } else {

                    ( () => {

                        const materialLocalIndex = materialIndex;

                        this._getMaterialModel( material )
                            .save()
                            .then( savedMaterial => {

                                materialIds[ materialLocalIndex ] = savedMaterial.id;
                                numberOfSavedMaterials++;

                                // End condition
                                if ( numberOfSavedMaterials === numberOfMaterials ) {
                                    onSuccess( materialIds );
                                }

                            } )
                            .catch( onError );

                    } )();

                }

            }

        } else {

            const materialId = this._checkIfMaterialAlreadyExist( materials );

            if ( materialId ) {

                onSuccess( materialId );

            } else {

                this._getMaterialModel( materials )
                    .save()
                    .then( savedMaterial => {

                        // Return id
                        onSuccess( savedMaterial.id );

                    } )
                    .catch( onError );

            }

        }

    }

    // Texture

    _checkIfTextureAlreadyExist ( /*texture*/ ) {

        // Todo
        return null

    }

    _getTextureModel ( texture ) {

        return this._driver.model( texture.type )( texture )

    }

    _saveTextureInDatabase ( texture, onError, onSuccess ) {

        const textureId = this._checkIfTextureAlreadyExist( texture );

        if ( textureId ) {

            onSuccess( textureId );

        } else {

            this._getTextureModel( texture )
                .save()
                .then( savedTexture => { onSuccess( savedTexture.id ); } )
                .catch( onError );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

function ColorType ( Mongoose ) {

    class Color extends Mongoose.SchemaType {

        constructor ( key, options ) {

            super( key, options, 'Color' );

        }

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} is null or undefined` ) }
            if ( iteeValidators.isNotObject( value ) && !value.isColor ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} is not a object or Color instance` ) }

            if ( !( 'r' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} does not contain r property` ) }
            if ( iteeValidators.isNotNumber( value.r ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} expected to be a number` ) }

            if ( !( 'g' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} does not contain g property` ) }
            if ( iteeValidators.isNotNumber( value.g ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} expected to be a number` ) }

            if ( !( 'b' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} does not contain b property` ) }
            if ( iteeValidators.isNotNumber( value.b ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${value} expected to be a number` ) }

            return {
                r: value.r,
                g: value.g,
                b: value.b
            }

        }

    }

    Color.COLOR_BSON_TYPE = bson.BSON_DATA_OBJECT;

    // Register type
    Mongoose.Schema.Types.Color = Color;

    return Mongoose

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

var MongoDBThreePlugin = new iteeDatabase.TMongoDBPlugin()
    .addType( ColorType )
    .addController( iteeDatabase.TMongooseController )
    .addDescriptor( {
        route:      '/objects',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Objects3D'
            },
            can: {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read: {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/curves',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Curves'
            },
            can: {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read: {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/geometries',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Geometries'
            },
            can: {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read: {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/materials',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Materials'
            },
            can: {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read: {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/textures',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Textures'
            },
            can: {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read: {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addController( iteeDatabase.TAbstractConverterManager )
    .addDescriptor( {
        route:      '/uploads',
        controller: {
            name:    'TAbstractConverterManager',
            options: {
                useNext:    true,
                converters: {
                    JsonToThree: new JsonToThree(),
                    ShpToThree:  new ShpToThree(),
                    DbfToThree:  new DbfToThree(),
                    MtlToThree:  new MtlToThree(),
                    ObjToThree:  new Obj2ToThree()
                },
                rules: [
                    {
                        on:  '.json',
                        use: 'JsonToThree'
                    },
                    {
                        on:  '.shp',
                        use: 'ShpToThree'
                    },
                    {
                        on:  '.dbf',
                        use: 'DbfToThree'
                    },
                    {
                        on:  [ '.shp', '.dbf' ],
                        use: [ 'ShpToThree', 'DbfToThree' ]
                    },
                    {
                        on:  '.mtl',
                        use: 'MtlToThree'
                    },
                    {
                        on:  '.obj',
                        use: 'ObjToThree'
                    },
                    {
                        on:  [ '.mtl', '.obj' ],
                        use: [ 'MtlToThree', 'ObjToThree' ]
                    }
                ],
                inserter: ThreeToMongoDB
            },
            can: {
                processFiles: {
                    on:   'post',
                    over: '/'
                }
            }
        }
    } );

module.exports = MongoDBThreePlugin;
//# sourceMappingURL=itee-plugin-three.cjs.js.map
