console.log('Itee.Plugin.Three v1.1.0 - CommonJs')
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var iteeDatabase = require('itee-database');
var iteeClient = require('itee-client');
var threeFull = require('three-full');
var iteeValidators = require('itee-validators');
var iteeValidators__default = _interopDefault(iteeValidators);
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
        super( { dumpType: iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer } );
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
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.JSON
        } );
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
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.String
        } );
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
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.JSON
        } );
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
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer
        } );
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

    constructor ( parameters = {} ) {

        super( parameters );

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
 * @module Schemas/Object3D
 *
 * @description Todo...
 */

function Object3D () {}

Object3D.getSchemaFrom   = Mongoose => {

    if ( !Object3D._schema ) {
        Object3D._createSchema( Mongoose );
    }

    return Object3D._schema

};
Object3D._createSchema   = Mongoose => {

    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;
    const ObjectId   = Types.ObjectId;
    const Mixed      = Types.Mixed;
    const Vector3    = Types.Vector3;
    const Quaternion = Types.Quaternion;
    const Matrix4    = Types.Matrix4;
    const Euler      = Types.Euler;

    Object3D._schema = new Schema( {
        uuid:       String,
        name:       String,
        type:       String,
        parent:     ObjectId,
        children:   [ ObjectId ],
        up:         Vector3,
        position:   Vector3,
        rotation:   Euler,
        quaternion: Quaternion,
        scale:      {
            type:    Vector3,
            default: {
                x: 1,
                y: 1,
                z: 1
            }
        },
        modelViewMatrix:        Matrix4,
        normalMatrix:           Matrix4,
        matrix:                 Matrix4,
        matrixWorld:            Matrix4,
        matrixAutoUpdate:       Boolean,
        matrixWorldNeedsUpdate: Boolean,
        layers:                 {
            type: Number,
            set:  value => ( value.mask )
        },
        visible:       Boolean,
        castShadow:    Boolean,
        receiveShadow: Boolean,
        frustumCulled: Boolean,
        renderOrder:   Boolean,
        userData:      {
            type: Mixed,
            set:  value => {

                function RemoveRecursivelyDotInKeyOf ( properties ) {
                    let result = {};

                    for ( let property in properties ) {

                        if ( !Object.prototype.hasOwnProperty.call( properties, property ) ) { continue }

                        let value = properties[ property ];
                        if ( value.constructor === Object ) {
                            value = RemoveRecursivelyDotInKeyOf( value );
                        }

                        result[ property.replace( /\./g, '' ) ] = value;

                    }

                    return result
                }

                return RemoveRecursivelyDotInKeyOf( value )

            }
        }
    }, {
        collection:       'objects',
        discriminatorKey: 'type'
    } );

};
Object3D.getModelFrom    = Mongoose => {

    if ( !Object3D._model ) {
        Object3D._createModel( Mongoose );
    }

    return Object3D._model

};
Object3D._createModel    = Mongoose => {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    Object3D._model = Mongoose.model( 'Objects3D', Object3D.getSchemaFrom( Mongoose ) );
    Object3D._model.discriminator( 'Object3D', new Mongoose.Schema( {} ) );

};
Object3D.registerModelTo = Mongoose => {

    if ( !Object3D._model ) {
        Object3D._createModel( Mongoose );
    }

    return Mongoose

};
Object3D._schema         = null;
Object3D._model          = null;

var Object3D$1 = /*#__PURE__*/Object.freeze({
	Object3D: Object3D
});

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$2 } = Object3D$1;

let _schema = undefined;
let _model  = undefined;

function getSchemaFrom ( Mongoose ) {

    if ( !_schema ) {
        _createSchema( Mongoose );
    }

    return _schema

}

function _createSchema ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema = new Schema( {} );

}

function getModelFrom ( Mongoose ) {

    if ( !_model ) {
        _createModel( Mongoose );
    }

    return _model

}

function _createModel ( Mongoose ) {

    const Object3DBaseModel = Object3D$2.getModelFrom( Mongoose );
    _model                  = Object3DBaseModel.discriminator( 'Audio', getSchemaFrom( Mongoose ) );

}

function registerModelTo ( Mongoose ) {

    if ( !_model ) {
        _createModel( Mongoose );
    }

    return Mongoose

}

var Audio_1 = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$3 } = Object3D$1;

let _schema$1 = undefined;
let _model$1  = undefined;

function getSchemaFrom$1 ( Mongoose ) {

    if ( !_schema$1 ) {
        _createSchema$1( Mongoose );
    }

    return _schema$1

}

function _createSchema$1 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1 = new Schema( {} );

}

function getModelFrom$1 ( Mongoose ) {

    if ( !_model$1 ) {
        _createModel$1( Mongoose );
    }

    return _model$1

}

function _createModel$1 ( Mongoose ) {

    const Object3DBaseModel = Object3D$3.getModelFrom( Mongoose );
    _model$1                  = Object3DBaseModel.discriminator( 'AudioListener', getSchemaFrom$1( Mongoose ) );

}

function registerModelTo$1 ( Mongoose ) {

    if ( !_model$1 ) {
        _createModel$1( Mongoose );
    }

    return Mongoose

}

var AudioListener_1 = {
    getSchemaFrom:   getSchemaFrom$1,
    getModelFrom:    getModelFrom$1,
    registerModelTo: registerModelTo$1
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$4 } = Object3D$1;

let _schema$2 = undefined;
let _model$2  = undefined;

function getSchemaFrom$2 ( Mongoose ) {

    if ( !_schema$2 ) {
        _createSchema$2( Mongoose );
    }

    return _schema$2

}

function _createSchema$2 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$2 = new Schema( {} );

}

function getModelFrom$2 ( Mongoose ) {

    if ( !_model$2 ) {
        _createModel$2( Mongoose );
    }

    return _model$2

}

function _createModel$2 ( Mongoose ) {

    const Object3DBaseModel = Object3D$4.getModelFrom( Mongoose );
    _model$2                  = Object3DBaseModel.discriminator( 'PositionalAudio', getSchemaFrom$2( Mongoose ) );

}

function registerModelTo$2 ( Mongoose ) {

    if ( !_model$2 ) {
        _createModel$2( Mongoose );
    }

    return Mongoose

}

var PositionalAudio_1 = {
    getSchemaFrom:   getSchemaFrom$2,
    getModelFrom:    getModelFrom$2,
    registerModelTo: registerModelTo$2
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$5 } = Object3D$1;

let _schema$3 = undefined;
let _model$3  = undefined;

function getSchemaFrom$3 ( Mongoose ) {

    if ( !_schema$3 ) {
        _createSchema$3( Mongoose );
    }

    return _schema$3

}

function _createSchema$3 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$3 = new Schema( {} );

}

function getModelFrom$3 ( Mongoose ) {

    if ( !_model$3 ) {
        _createModel$3( Mongoose );
    }

    return _model$3

}

function _createModel$3 ( Mongoose ) {

    const Object3DBaseModel = Object3D$5.getModelFrom( Mongoose );
    _model$3                  = Object3DBaseModel.discriminator( 'ArrayCamera', getSchemaFrom$3( Mongoose ) );

}

function registerModelTo$3 ( Mongoose ) {

    if ( !_model$3 ) {
        _createModel$3( Mongoose );
    }

    return Mongoose

}

var ArrayCamera_1 = {
    getSchemaFrom:   getSchemaFrom$3,
    getModelFrom:    getModelFrom$3,
    registerModelTo: registerModelTo$3
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$6 } = Object3D$1;

let _schema$4 = undefined;
let _model$4  = undefined;

function getSchemaFrom$4 ( Mongoose ) {

    if ( !_schema$4 ) {
        _createSchema$4( Mongoose );
    }

    return _schema$4

}

function _createSchema$4 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$4 = new Schema( {} );

}

function getModelFrom$4 ( Mongoose ) {

    if ( !_model$4 ) {
        _createModel$4( Mongoose );
    }

    return _model$4

}

function _createModel$4 ( Mongoose ) {

    const Object3DBaseModel = Object3D$6.getModelFrom( Mongoose );
    _model$4                  = Object3DBaseModel.discriminator( 'Camera', getSchemaFrom$4( Mongoose ) );

}

function registerModelTo$4 ( Mongoose ) {

    if ( !_model$4 ) {
        _createModel$4( Mongoose );
    }

    return Mongoose

}

var Camera_1 = {
    getSchemaFrom:   getSchemaFrom$4,
    getModelFrom:    getModelFrom$4,
    registerModelTo: registerModelTo$4
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$7 } = Object3D$1;

let _schema$5 = undefined;
let _model$5  = undefined;

function getSchemaFrom$5 ( Mongoose ) {

    if ( !_schema$5 ) {
        _createSchema$5( Mongoose );
    }

    return _schema$5

}

function _createSchema$5 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$5 = new Schema( {} );

}

function getModelFrom$5 ( Mongoose ) {

    if ( !_model$5 ) {
        _createModel$5( Mongoose );
    }

    return _model$5

}

function _createModel$5 ( Mongoose ) {

    const Object3DBaseModel = Object3D$7.getModelFrom( Mongoose );
    _model$5                  = Object3DBaseModel.discriminator( 'CubeCamera', getSchemaFrom$5( Mongoose ) );

}

function registerModelTo$5 ( Mongoose ) {

    if ( !_model$5 ) {
        _createModel$5( Mongoose );
    }

    return Mongoose

}

var CubeCamera_1 = {
    getSchemaFrom:   getSchemaFrom$5,
    getModelFrom:    getModelFrom$5,
    registerModelTo: registerModelTo$5
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$8 } = Object3D$1;

let _schema$6 = undefined;
let _model$6  = undefined;

function getSchemaFrom$6 ( Mongoose ) {

    if ( !_schema$6 ) {
        _createSchema$6( Mongoose );
    }

    return _schema$6

}

function _createSchema$6 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$6 = new Schema( {} );

}

function getModelFrom$6 ( Mongoose ) {

    if ( !_model$6 ) {
        _createModel$6( Mongoose );
    }

    return _model$6

}

function _createModel$6 ( Mongoose ) {

    const Object3DBaseModel = Object3D$8.getModelFrom( Mongoose );
    _model$6                  = Object3DBaseModel.discriminator( 'OrthographicCamera', getSchemaFrom$6( Mongoose ) );

}

function registerModelTo$6 ( Mongoose ) {

    if ( !_model$6 ) {
        _createModel$6( Mongoose );
    }

    return Mongoose

}

var OrthographicCamera_1 = {
    getSchemaFrom:   getSchemaFrom$6,
    getModelFrom:    getModelFrom$6,
    registerModelTo: registerModelTo$6
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$9 } = Object3D$1;

let _schema$7 = undefined;
let _model$7  = undefined;

function getSchemaFrom$7 ( Mongoose ) {

    if ( !_schema$7 ) {
        _createSchema$7( Mongoose );
    }

    return _schema$7

}

function _createSchema$7 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$7 = new Schema( {} );

}

function getModelFrom$7 ( Mongoose ) {

    if ( !_model$7 ) {
        _createModel$7( Mongoose );
    }

    return _model$7

}

function _createModel$7 ( Mongoose ) {

    const Object3DBaseModel = Object3D$9.getModelFrom( Mongoose );
    _model$7                  = Object3DBaseModel.discriminator( 'PerspectiveCamera', getSchemaFrom$7( Mongoose ) );

}

function registerModelTo$7 ( Mongoose ) {

    if ( !_model$7 ) {
        _createModel$7( Mongoose );
    }

    return Mongoose

}

var PerspectiveCamera_1 = {
    getSchemaFrom:   getSchemaFrom$7,
    getModelFrom:    getModelFrom$7,
    registerModelTo: registerModelTo$7
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Geometry
 *
 * @description Todo...
 */

const { isInt8Array, isInt16Array, isInt32Array, isFloat32Array, isFloat64Array, isUint8Array, isUint8ClampedArray, isUint16Array, isUint32Array, isBigInt64Array, isBigUint64Array } = iteeValidators__default;

let _schema$8 = undefined;

function getSchemaFrom$8 ( Mongoose ) {

    if ( !_schema$8 ) {
        _createSchema$8( Mongoose );
    }

    return _schema$8

}

function _createSchema$8 ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    const ONE_BYTE    = 1;
    const TWO_BYTE    = 2;
    const FOUR_BYTE   = 4;
    const HEIGHT_BYTE = 8;

    const ArrayType = {
        Int8Array:         0,
        Uint8Array:        1,
        Uint8ClampedArray: 2,
        Int16Array:        3,
        Uint16Array:       4,
        Int32Array:        5,
        Uint32Array:       6,
        Float32Array:      7,
        Float64Array:      8,
        BigInt64Array:     9,
        BigUint64Array:    10
    };

    _schema$8 = new Schema( {
        array: {
            type: Buffer,
            set:  ( array ) => {

                //                if ( !isTypedArray( array ) ) { throw new TypeError( 'Invalid array, expect a typed array.' )}

                const arrayLength = array.length;
                let buffer        = null;
                let offset        = 0;

                if ( isInt8Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * ONE_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Int8Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeInt8( array[ index ], offset );
                    }

                } else if ( isUint8Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * ONE_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Uint8Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt8( array[ index ], offset );
                    }

                } else if ( isUint8ClampedArray( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * ONE_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Uint8ClampedArray, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt8( array[ index ], offset );
                    }

                } else if ( isInt16Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * TWO_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Int16Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeInt16BE( array[ index ], offset );
                    }

                } else if ( isUint16Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * TWO_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Uint16Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt16BE( array[ index ], offset );
                    }

                } else if ( isInt32Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * FOUR_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Int32Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeInt32BE( array[ index ], offset );
                    }

                } else if ( isUint32Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * FOUR_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Uint32Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt32BE( array[ index ], offset );
                    }

                } else if ( isFloat32Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * FOUR_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Float32Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeFloatBE( array[ index ], offset );
                    }

                } else if ( isFloat64Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * HEIGHT_BYTE );
                    offset = buffer.writeUInt8( ArrayType.Float64Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeDoubleBE( array[ index ], offset );
                    }

                } else if ( isBigInt64Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * HEIGHT_BYTE );
                    offset = buffer.writeUInt8( ArrayType.BigInt64Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeDoubleBE( array[ index ], offset );
                    }

                } else if ( isBigUint64Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * HEIGHT_BYTE );
                    offset = buffer.writeUInt8( ArrayType.BigUint64Array, offset );

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeDoubleBE( array[ index ], offset );
                    }

                } else {

                    throw new Error( 'Unable to determine the array type to bufferize.' )

                }

                return buffer

            }
        },
        count:       Number,
        dynamic:     Boolean,
        itemSize:    Number,
        name:        String,
        needsUpdate: Boolean,
        normalized:  Boolean,
        updateRange: Mixed,
        uuid:        String,
        version:     Number
    }, {
        _id: false,
        id:  false
    } );

}

var BufferAttribute_1 = {
    getSchemaFrom:   getSchemaFrom$8,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

var BufferAttribute = {
	BufferAttribute: BufferAttribute_1
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/BufferGeometry
 *
 * @description Todo...
 */

const { BufferAttribute: BufferAttribute$1 } = BufferAttribute;

let _schema$9 = undefined;
let _model$8  = undefined;

function getSchemaFrom$9 ( Mongoose ) {

    if ( !_schema$9 ) {
        _createSchema$9( Mongoose );
    }

    return _schema$9

}

function _createSchema$9 ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Vector3 = Types.Vector3;

    const BufferAttributeSchema = BufferAttribute$1.getSchemaFrom( Mongoose );

    _schema$9 = new Schema( {
        uuid:       String,
        name:       String,
        type:       String,
        index:      BufferAttributeSchema,
        attributes: {
            position: BufferAttributeSchema,
            normal:   BufferAttributeSchema,
            color:    BufferAttributeSchema,
            uv:       BufferAttributeSchema
        },
        groups:      Mixed,
        boundingBox: {
            min: Vector3,
            max: Vector3
        },
        boundingSphere: {
            center: Vector3,
            radius: Number
        },
        drawRange: Mixed
    }, {
        collection:       'geometries',
        discriminatorKey: 'type'
    } );

}

function getModelFrom$8 ( Mongoose ) {

    if ( !_model$8 ) {
        _createModel$8( Mongoose );
    }

    return _model$8

}

function _createModel$8 ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$8 = Mongoose.model( 'BufferGeometries', getSchemaFrom$9( Mongoose ) );
    _model$8.discriminator( 'BufferGeometry', new Mongoose.Schema( {} ) );

}

function registerModelTo$8 ( Mongoose ) {

    if ( !_model$8 ) {
        _createModel$8( Mongoose );
    }

    return Mongoose

}

var BufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$9,
    getModelFrom:    getModelFrom$8,
    registerModelTo: registerModelTo$8
};

var BufferGeometry = {
	BufferGeometry: BufferGeometry_1
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Geometry
 *
 * @description Todo...
 */

let _schema$a = undefined;
let _model$9  = undefined;

function getSchemaFrom$a ( Mongoose ) {

    if ( !_schema$a ) {
        _createSchema$a( Mongoose );
    }

    return _schema$a

}

function _createSchema$a ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$a = new Schema( {
            type: {
                type:    String,
                default: 'Curve'
            },
            arcLengthDivisions: Number
        },
        {
            collection:       'curves',
            discriminatorKey: 'type'
        } );

}

function getModelFrom$9 ( Mongoose ) {

    if ( !_model$9 ) {
        _createModel$9( Mongoose );
    }

    return _model$9

}

function _createModel$9 ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$9 = Mongoose.model( 'Curves', getSchemaFrom$a( Mongoose ) );
    _model$9.discriminator( 'Curve', new Mongoose.Schema( {} ) );

}

function registerModelTo$9 ( Mongoose ) {

    if ( !_model$9 ) {
        _createModel$9( Mongoose );
    }

    return Mongoose

}

var Curve_1 = {
    getSchemaFrom: getSchemaFrom$a,
    getModelFrom: getModelFrom$9,
    registerModelTo: registerModelTo$9
};

var Curve = {
	Curve: Curve_1
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$1 } = Curve;

let _schema$b = undefined;
let _model$a  = undefined;

function getSchemaFrom$b ( Mongoose ) {

    if ( !_schema$b ) {
        _createSchema$b( Mongoose );
    }

    return _schema$b

}

function _createSchema$b ( Mongoose ) {

    const Schema = Mongoose.Schema;

    const NestedCurveSchema = new Schema(
        {
            type: {
                type:    String,
                default: 'Curve'
            },
            arcLengthDivisions: Number
        },
        {
            id:  false,
            _id: false
        }
    );

    _schema$b = new Schema( {
        curves:    [ NestedCurveSchema ],
        // Curve
        autoClose: {
            type:    Boolean,
            default: false
        }
    } );

}

function getModelFrom$a ( Mongoose ) {

    if ( !_model$a ) {
        _createModel$a( Mongoose );
    }

    return _model$a

}

function _createModel$a ( Mongoose ) {

    const CurveBaseModel = Curve$1.getModelFrom( Mongoose );
    _model$a               = CurveBaseModel.discriminator( 'CurvePath', getSchemaFrom$b( Mongoose ) );

}

function registerModelTo$a ( Mongoose ) {

    if ( !_model$a ) {
        _createModel$a( Mongoose );
    }

    return Mongoose

}

var CurvePath_1 = {
    getSchemaFrom:   getSchemaFrom$b,
    getModelFrom:    getModelFrom$a,
    registerModelTo: registerModelTo$a
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Face3
 *
 * @description Todo...
 */

let _schema$c = undefined;

function getSchemaFrom$c ( Mongoose ) {

    if ( !_schema$c ) {
        _createSchema$c( Mongoose );
    }

    return _schema$c

}

function _createSchema$c ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Color   = Types.Color;
    const Vector3 = Types.Vector3;

    _schema$c = new Schema( {
        a:             Number,
        b:             Number,
        c:             Number,
        normal:        Vector3,
        vertexNormals: [ Number ],
        color:         Color,
        vertexColors:  [ Number ],
        materialIndex: Number
    }, {
        _id: false,
        id:  false
    } );

}

var Face3_1 = {
    getSchemaFrom:   getSchemaFrom$c,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Geometry
 *
 * @description Todo...
 */

let _schema$d = undefined;
let _model$b  = undefined;

function getSchemaFrom$d ( Mongoose ) {

    if ( !_schema$d ) {
        _createSchema$d( Mongoose );
    }

    return _schema$d

}

function _createSchema$d ( Mongoose ) {

    const Face3Schema = Face3_1.getSchemaFrom( Mongoose );
    const Schema      = Mongoose.Schema;
    const Types       = Schema.Types;
    const Vector3     = Types.Vector3;

    _schema$d = new Schema( {
        uuid:          String,
        name:          String,
        type:          String,
        vertices:      [ Vector3 ],
        colors:        [ Number ],
        faces:         [ Face3Schema ],
        faceVertexUvs: [ [ Number ] ],
        morphTargets:  [ Number ],
        morphNormals:  [ Number ],
        skinWeights:   [ Number ],
        skinIndices:   [ Number ],
        lineDistances: [ Number ],
        boundingBox:   {
            min: Vector3,
            max: Vector3
        },
        boundingSphere: {
            center: Vector3,
            radius: Number
        },
        elementsNeedUpdate:      Boolean,
        verticesNeedUpdate:      Boolean,
        uvsNeedUpdate:           Boolean,
        normalsNeedUpdate:       Boolean,
        colorsNeedUpdate:        Boolean,
        lineDistancesNeedUpdate: Boolean,
        groupsNeedUpdate:        Boolean
    }, {
        collection:       'geometries',
        discriminatorKey: 'type'
    } );

}

function getModelFrom$b ( Mongoose ) {

    if ( !_model$b ) {
        _createModel$b( Mongoose );
    }

    return _model$b

}

function _createModel$b ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$b = Mongoose.model( 'Geometries', getSchemaFrom$d( Mongoose ) );
    _model$b.discriminator( 'Geometry', new Mongoose.Schema( {} ) );

}

function registerModelTo$b ( Mongoose ) {

    if ( !_model$b ) {
        _createModel$b( Mongoose );
    }

    return Mongoose

}

const Geometry = {
    getSchemaFrom: getSchemaFrom$d,
    getModelFrom: getModelFrom$b,
    registerModelTo: registerModelTo$b
};

var Geometry$1 = /*#__PURE__*/Object.freeze({
	Geometry: Geometry
});

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$2 } = Curve;

let _schema$e = undefined;
let _model$c  = undefined;

function getSchemaFrom$e ( Mongoose ) {

    if ( !_schema$e ) {
        _createSchema$e( Mongoose );
    }

    return _schema$e

}

function _createSchema$e ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    const NestedCurveSchema = new Schema(
        {
            type: {
                type:    String,
                default: 'Curve'
            },
            arcLengthDivisions: Number
        },
        {
            id:  false,
            _id: false
        }
    );

    _schema$e = new Schema( {

        // CurvePath inheritance
        curves: [ NestedCurveSchema ],

        // Curve
        autoClose: {
            type:    Boolean,
            default: false
        },

        // Path inheritance
        currentPoint: Vector2

    } );

}

function getModelFrom$c ( Mongoose ) {

    if ( !_model$c ) {
        _createModel$c( Mongoose );
    }

    return _model$c

}

function _createModel$c ( Mongoose ) {

    const CurveBaseModel = Curve$2.getModelFrom( Mongoose );
    _model$c               = CurveBaseModel.discriminator( 'Path', getSchemaFrom$e( Mongoose ) );

}

function registerModelTo$c ( Mongoose ) {

    if ( !_model$c ) {
        _createModel$c( Mongoose );
    }

    return Mongoose

}

var Path_1 = {
    getSchemaFrom:   getSchemaFrom$e,
    getModelFrom:    getModelFrom$c,
    registerModelTo: registerModelTo$c
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$3 } = Curve;

let _schema$f = undefined;
let _model$d  = undefined;

function getSchemaFrom$f ( Mongoose ) {

    if ( !_schema$f ) {
        _createSchema$f( Mongoose );
    }

    return _schema$f

}

function _createSchema$f ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    const NestedCurveSchema = new Schema(
        {
            type: {
                type:    String,
                default: 'Curve'
            },
            arcLengthDivisions: Number
        },
        {
            id:  false,
            _id: false
        }
    );

    const NestedPathSchema = new Schema(
        {

            // CurvePath inheritance
            curves:    [ NestedCurveSchema ], // Curve
            autoClose: {
                type:    Boolean,
                default: false
            },

            // Path inheritance
            currentPoint: Vector2

        },
        {
            id:  false,
            _id: false
        }
    );

    _schema$f = new Schema( {

        // CurvePath inheritance
        curves:    [ NestedCurveSchema ], // Curve
        autoClose: {
            type:    Boolean,
            default: false
        },

        // Path inheritance
        currentPoint: Vector2,

        // Shape inheritance
        uuid:  String,
        holes: [ NestedPathSchema ] // Path

    } );

}

function getModelFrom$d ( Mongoose ) {

    if ( !_model$d ) {
        _createModel$d( Mongoose );
    }

    return _model$d

}

function _createModel$d ( Mongoose ) {

    const CurveBaseModel = Curve$3.getModelFrom( Mongoose );
    _model$d               = CurveBaseModel.discriminator( 'Shape', getSchemaFrom$f( Mongoose ) );

}

function registerModelTo$d ( Mongoose ) {

    if ( !_model$d ) {
        _createModel$d( Mongoose );
    }

    return Mongoose

}

var Shape_1 = {
    getSchemaFrom:   getSchemaFrom$f,
    getModelFrom:    getModelFrom$d,
    registerModelTo: registerModelTo$d
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$4 } = Curve;

let _schema$g = undefined;
let _model$e  = undefined;

function getSchemaFrom$g ( Mongoose ) {

    if ( !_schema$g ) {
        _createSchema$g( Mongoose );
    }

    return _schema$g

}

function _createSchema$g ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$g = new Schema( {
        // EllipseCurve inheritance
        aX:          Number,
        aY:          Number,
        xRadius:     Number,
        yRadius:     Number,
        aStartAngle: Number,
        aEndAngle:   Number,
        aClockwise:  Boolean,
        aRotation:   Number
    } );

}

function getModelFrom$e ( Mongoose ) {

    if ( !_model$e ) {
        _createModel$e( Mongoose );
    }

    return _model$e

}

function _createModel$e ( Mongoose ) {

    const CurveBaseModel = Curve$4.getModelFrom( Mongoose );
    _model$e               = CurveBaseModel.discriminator( 'ArcCurve', getSchemaFrom$g( Mongoose ) );

}

function registerModelTo$e ( Mongoose ) {

    if ( !_model$e ) {
        _createModel$e( Mongoose );
    }

    return Mongoose

}

var ArcCurve_1 = {
    getSchemaFrom:   getSchemaFrom$g,
    getModelFrom:    getModelFrom$e,
    registerModelTo: registerModelTo$e
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$5 } = Curve;

let _schema$h = undefined;
let _model$f  = undefined;

function getSchemaFrom$h ( Mongoose ) {

    if ( !_schema$h ) {
        _createSchema$h( Mongoose );
    }

    return _schema$h

}

function _createSchema$h ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$h = new Schema( {
        points:    [ Vector3 ],
        closed:    Boolean,
        curveType: String,
        tension:   Number
    } );

}

function getModelFrom$f ( Mongoose ) {

    if ( !_model$f ) {
        _createModel$f( Mongoose );
    }

    return _model$f

}

function _createModel$f ( Mongoose ) {

    const CurveBaseModel = Curve$5.getModelFrom( Mongoose );
    _model$f               = CurveBaseModel.discriminator( 'CatmullRomCurve3', getSchemaFrom$h( Mongoose ) );

}

function registerModelTo$f ( Mongoose ) {

    if ( !_model$f ) {
        _createModel$f( Mongoose );
    }

    return Mongoose

}

var CatmullRomCurve3_1 = {
    getSchemaFrom:   getSchemaFrom$h,
    getModelFrom:    getModelFrom$f,
    registerModelTo: registerModelTo$f
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$6 } = Curve;

let _schema$i = undefined;
let _model$g  = undefined;

function getSchemaFrom$i ( Mongoose ) {

    if ( !_schema$i ) {
        _createSchema$i( Mongoose );
    }

    return _schema$i

}

function _createSchema$i ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$i = new Schema( {
        v0: Vector2,
        v1: Vector2,
        v2: Vector2,
        v3: Vector2
    } );

}

function getModelFrom$g ( Mongoose ) {

    if ( !_model$g ) {
        _createModel$g( Mongoose );
    }

    return _model$g

}

function _createModel$g ( Mongoose ) {

    const CurveBaseModel = Curve$6.getModelFrom( Mongoose );
    _model$g               = CurveBaseModel.discriminator( 'CubicBezierCurve', getSchemaFrom$i( Mongoose ) );

}

function registerModelTo$g ( Mongoose ) {

    if ( !_model$g ) {
        _createModel$g( Mongoose );
    }

    return Mongoose

}

var CubicBezierCurve_1 = {
    getSchemaFrom:   getSchemaFrom$i,
    getModelFrom:    getModelFrom$g,
    registerModelTo: registerModelTo$g
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$7 } = Curve;

let _schema$j = undefined;
let _model$h  = undefined;

function getSchemaFrom$j ( Mongoose ) {

    if ( !_schema$j ) {
        _createSchema$j( Mongoose );
    }

    return _schema$j

}

function _createSchema$j ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$j = new Schema( {
        v0: Vector3,
        v1: Vector3,
        v2: Vector3,
        v3: Vector3
    } );

}

function getModelFrom$h ( Mongoose ) {

    if ( !_model$h ) {
        _createModel$h( Mongoose );
    }

    return _model$h

}

function _createModel$h ( Mongoose ) {

    const CurveBaseModel = Curve$7.getModelFrom( Mongoose );
    _model$h               = CurveBaseModel.discriminator( 'CubicBezierCurve3', getSchemaFrom$j( Mongoose ) );

}

function registerModelTo$h ( Mongoose ) {

    if ( !_model$h ) {
        _createModel$h( Mongoose );
    }

    return Mongoose

}

var CubicBezierCurve3_1 = {
    getSchemaFrom:   getSchemaFrom$j,
    getModelFrom:    getModelFrom$h,
    registerModelTo: registerModelTo$h
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$8 } = Curve;

let _schema$k = undefined;
let _model$i  = undefined;

function getSchemaFrom$k ( Mongoose ) {

    if ( !_schema$k ) {
        _createSchema$k( Mongoose );
    }

    return _schema$k

}

function _createSchema$k ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$k = new Schema( {} );

}

function getModelFrom$i ( Mongoose ) {

    if ( !_model$i ) {
        _createModel$i( Mongoose );
    }

    return _model$i

}

function _createModel$i ( Mongoose ) {

    const CurveBaseModel = Curve$8.getModelFrom( Mongoose );
    _model$i               = CurveBaseModel.discriminator( 'CurveExtras', getSchemaFrom$k( Mongoose ) );

}

function registerModelTo$i ( Mongoose ) {

    if ( !_model$i ) {
        _createModel$i( Mongoose );
    }

    return Mongoose

}

var CurveExtras_1 = {
    getSchemaFrom:   getSchemaFrom$k,
    getModelFrom:    getModelFrom$i,
    registerModelTo: registerModelTo$i
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$9 } = Curve;

let _schema$l = undefined;
let _model$j  = undefined;

function getSchemaFrom$l ( Mongoose ) {

    if ( !_schema$l ) {
        _createSchema$l( Mongoose );
    }

    return _schema$l

}

function _createSchema$l ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$l = new Schema( {
        aX:          Number,
        aY:          Number,
        xRadius:     Number,
        yRadius:     Number,
        aStartAngle: Number,
        aEndAngle:   Number,
        aClockwise:  Boolean,
        aRotation:   Number
    } );

}

function getModelFrom$j ( Mongoose ) {

    if ( !_model$j ) {
        _createModel$j( Mongoose );
    }

    return _model$j

}

function _createModel$j ( Mongoose ) {

    const CurveBaseModel = Curve$9.getModelFrom( Mongoose );
    _model$j               = CurveBaseModel.discriminator( 'EllipseCurve', getSchemaFrom$l( Mongoose ) );

}

function registerModelTo$j ( Mongoose ) {

    if ( !_model$j ) {
        _createModel$j( Mongoose );
    }

    return Mongoose

}

var EllipseCurve_1 = {
    getSchemaFrom:   getSchemaFrom$l,
    getModelFrom:    getModelFrom$j,
    registerModelTo: registerModelTo$j
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$a } = Curve;

let _schema$m = undefined;
let _model$k  = undefined;

function getSchemaFrom$m ( Mongoose ) {

    if ( !_schema$m ) {
        _createSchema$m( Mongoose );
    }

    return _schema$m

}

function _createSchema$m ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$m = new Schema( {
        v0: Vector2,
        v1: Vector2
    } );

}

function getModelFrom$k ( Mongoose ) {

    if ( !_model$k ) {
        _createModel$k( Mongoose );
    }

    return _model$k

}

function _createModel$k ( Mongoose ) {

    const CurveBaseModel = Curve$a.getModelFrom( Mongoose );
    _model$k               = CurveBaseModel.discriminator( 'LineCurve', getSchemaFrom$m( Mongoose ) );

}

function registerModelTo$k ( Mongoose ) {

    if ( !_model$k ) {
        _createModel$k( Mongoose );
    }

    return Mongoose

}

var LineCurve_1 = {
    getSchemaFrom:   getSchemaFrom$m,
    getModelFrom:    getModelFrom$k,
    registerModelTo: registerModelTo$k
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$b } = Curve;

let _schema$n = undefined;
let _model$l  = undefined;

function getSchemaFrom$n ( Mongoose ) {

    if ( !_schema$n ) {
        _createSchema$n( Mongoose );
    }

    return _schema$n

}

function _createSchema$n ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$n = new Schema( {
        v0: Vector3,
        v1: Vector3
    } );

}

function getModelFrom$l ( Mongoose ) {

    if ( !_model$l ) {
        _createModel$l( Mongoose );
    }

    return _model$l

}

function _createModel$l ( Mongoose ) {

    const CurveBaseModel = Curve$b.getModelFrom( Mongoose );
    _model$l               = CurveBaseModel.discriminator( 'LineCurve3', getSchemaFrom$n( Mongoose ) );

}

function registerModelTo$l ( Mongoose ) {

    if ( !_model$l ) {
        _createModel$l( Mongoose );
    }

    return Mongoose

}

var LineCurve3_1 = {
    getSchemaFrom:   getSchemaFrom$n,
    getModelFrom:    getModelFrom$l,
    registerModelTo: registerModelTo$l
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$c } = Curve;

let _schema$o = undefined;
let _model$m  = undefined;

function getSchemaFrom$o ( Mongoose ) {

    if ( !_schema$o ) {
        _createSchema$o( Mongoose );
    }

    return _schema$o

}

function _createSchema$o ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$o = new Schema( {} );

}

function getModelFrom$m ( Mongoose ) {

    if ( !_model$m ) {
        _createModel$m( Mongoose );
    }

    return _model$m

}

function _createModel$m ( Mongoose ) {

    const CurveBaseModel = Curve$c.getModelFrom( Mongoose );
    _model$m               = CurveBaseModel.discriminator( 'NURBSCurve', getSchemaFrom$o( Mongoose ) );

}

function registerModelTo$m ( Mongoose ) {

    if ( !_model$m ) {
        _createModel$m( Mongoose );
    }

    return Mongoose

}

var NURBSCurve_1 = {
    getSchemaFrom:   getSchemaFrom$o,
    getModelFrom:    getModelFrom$m,
    registerModelTo: registerModelTo$m
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$d } = Curve;

let _schema$p = undefined;
let _model$n  = undefined;

function getSchemaFrom$p ( Mongoose ) {

    if ( !_schema$p ) {
        _createSchema$p( Mongoose );
    }

    return _schema$p

}

function _createSchema$p ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$p = new Schema( {} );

}

function getModelFrom$n ( Mongoose ) {

    if ( !_model$n ) {
        _createModel$n( Mongoose );
    }

    return _model$n

}

function _createModel$n ( Mongoose ) {

    const CurveBaseModel = Curve$d.getModelFrom( Mongoose );
    _model$n               = CurveBaseModel.discriminator( 'NURBSSurface', getSchemaFrom$p( Mongoose ) );

}

function registerModelTo$n ( Mongoose ) {

    if ( !_model$n ) {
        _createModel$n( Mongoose );
    }

    return Mongoose

}

var NURBSSurface_1 = {
    getSchemaFrom:   getSchemaFrom$p,
    getModelFrom:    getModelFrom$n,
    registerModelTo: registerModelTo$n
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$e } = Curve;

let _schema$q = undefined;
let _model$o  = undefined;

function getSchemaFrom$q ( Mongoose ) {

    if ( !_schema$q ) {
        _createSchema$q( Mongoose );
    }

    return _schema$q

}

function _createSchema$q ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$q = new Schema( {
        v0: Vector2,
        v1: Vector2,
        v2: Vector2
    } );

}

function getModelFrom$o ( Mongoose ) {

    if ( !_model$o ) {
        _createModel$o( Mongoose );
    }

    return _model$o

}

function _createModel$o ( Mongoose ) {

    const CurveBaseModel = Curve$e.getModelFrom( Mongoose );
    _model$o               = CurveBaseModel.discriminator( 'QuadraticBezierCurve', getSchemaFrom$q( Mongoose ) );

}

function registerModelTo$o ( Mongoose ) {

    if ( !_model$o ) {
        _createModel$o( Mongoose );
    }

    return Mongoose

}

var QuadraticBezierCurve_1 = {
    getSchemaFrom:   getSchemaFrom$q,
    getModelFrom:    getModelFrom$o,
    registerModelTo: registerModelTo$o
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$f } = Curve;

let _schema$r = undefined;
let _model$p  = undefined;

function getSchemaFrom$r ( Mongoose ) {

    if ( !_schema$r ) {
        _createSchema$r( Mongoose );
    }

    return _schema$r

}

function _createSchema$r ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$r = new Schema( {
        v0: Vector3,
        v1: Vector3,
        v2: Vector3
    } );

}

function getModelFrom$p ( Mongoose ) {

    if ( !_model$p ) {
        _createModel$p( Mongoose );
    }

    return _model$p

}

function _createModel$p ( Mongoose ) {

    const CurveBaseModel = Curve$f.getModelFrom( Mongoose );
    _model$p               = CurveBaseModel.discriminator( 'QuadraticBezierCurve3', getSchemaFrom$r( Mongoose ) );

}

function registerModelTo$p ( Mongoose ) {

    if ( !_model$p ) {
        _createModel$p( Mongoose );
    }

    return Mongoose

}

var QuadraticBezierCurve3_1 = {
    getSchemaFrom:   getSchemaFrom$r,
    getModelFrom:    getModelFrom$p,
    registerModelTo: registerModelTo$p
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve: Curve$g } = Curve;

let _schema$s = undefined;
let _model$q  = undefined;

function getSchemaFrom$s ( Mongoose ) {

    if ( !_schema$s ) {
        _createSchema$s( Mongoose );
    }

    return _schema$s

}

function _createSchema$s ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$s = new Schema( {
        points: [ Vector3 ]
    } );

}

function getModelFrom$q ( Mongoose ) {

    if ( !_model$q ) {
        _createModel$q( Mongoose );
    }

    return _model$q

}

function _createModel$q ( Mongoose ) {

    const CurveBaseModel = Curve$g.getModelFrom( Mongoose );
    _model$q               = CurveBaseModel.discriminator( 'SplineCurve', getSchemaFrom$s( Mongoose ) );

}

function registerModelTo$q ( Mongoose ) {

    if ( !_model$q ) {
        _createModel$q( Mongoose );
    }

    return Mongoose

}

var SplineCurve_1 = {
    getSchemaFrom:   getSchemaFrom$s,
    getModelFrom:    getModelFrom$q,
    registerModelTo: registerModelTo$q
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$1 } = BufferGeometry;

let _schema$t = undefined;
let _model$r  = undefined;

function getSchemaFrom$t ( Mongoose ) {

    if ( !_schema$t ) {
        _createSchema$t( Mongoose );
    }

    return _schema$t

}

function _createSchema$t ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$t = new Schema( {} );

}

function getModelFrom$r ( Mongoose ) {

    if ( !_model$r ) {
        _createModel$r( Mongoose );
    }

    return _model$r

}

function _createModel$r ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$1.getModelFrom( Mongoose );
    _model$r                        = BufferGeometryBaseModel.discriminator( 'BoxBufferGeometry', getSchemaFrom$t( Mongoose ) );

}

function registerModelTo$r ( Mongoose ) {

    if ( !_model$r ) {
        _createModel$r( Mongoose );
    }

    return Mongoose

}

var BoxBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$t,
    getModelFrom:    getModelFrom$r,
    registerModelTo: registerModelTo$r
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$2 } = Geometry$1;

let _schema$u = undefined;
let _model$s  = undefined;

function getSchemaFrom$u ( Mongoose ) {

    if ( !_schema$u ) {
        _createSchema$u( Mongoose );
    }

    return _schema$u

}

function _createSchema$u ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$u = new Schema( {} );

}

function getModelFrom$s ( Mongoose ) {

    if ( !_model$s ) {
        _createModel$s( Mongoose );
    }

    return _model$s

}

function _createModel$s ( Mongoose ) {

    const GeometryBaseModel = Geometry$2.getModelFrom( Mongoose );
    _model$s                  = GeometryBaseModel.discriminator( 'BoxGeometry', getSchemaFrom$u( Mongoose ) );

}

function registerModelTo$s ( Mongoose ) {

    if ( !_model$s ) {
        _createModel$s( Mongoose );
    }

    return Mongoose

}

var BoxGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$u,
    getModelFrom:    getModelFrom$s,
    registerModelTo: registerModelTo$s
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$2 } = BufferGeometry;

let _schema$v = undefined;
let _model$t  = undefined;

function getSchemaFrom$v ( Mongoose ) {

    if ( !_schema$v ) {
        _createSchema$v( Mongoose );
    }

    return _schema$v

}

function _createSchema$v ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$v = new Schema( {} );

}

function getModelFrom$t ( Mongoose ) {

    if ( !_model$t ) {
        _createModel$t( Mongoose );
    }

    return _model$t

}

function _createModel$t ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$2.getModelFrom( Mongoose );
    _model$t                        = BufferGeometryBaseModel.discriminator( 'CircleBufferGeometry', getSchemaFrom$v( Mongoose ) );

}

function registerModelTo$t ( Mongoose ) {

    if ( !_model$t ) {
        _createModel$t( Mongoose );
    }

    return Mongoose

}

var CircleBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$v,
    getModelFrom:    getModelFrom$t,
    registerModelTo: registerModelTo$t
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$3 } = Geometry$1;

let _schema$w = undefined;
let _model$u  = undefined;

function getSchemaFrom$w ( Mongoose ) {

    if ( !_schema$w ) {
        _createSchema$w( Mongoose );
    }

    return _schema$w

}

function _createSchema$w ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$w = new Schema( {} );

}

function getModelFrom$u ( Mongoose ) {

    if ( !_model$u ) {
        _createModel$u( Mongoose );
    }

    return _model$u

}

function _createModel$u ( Mongoose ) {

    const GeometryBaseModel = Geometry$3.getModelFrom( Mongoose );
    _model$u                  = GeometryBaseModel.discriminator( 'CircleGeometry', getSchemaFrom$w( Mongoose ) );

}

function registerModelTo$u ( Mongoose ) {

    if ( !_model$u ) {
        _createModel$u( Mongoose );
    }

    return Mongoose

}

var CircleGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$w,
    getModelFrom:    getModelFrom$u,
    registerModelTo: registerModelTo$u
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$3 } = BufferGeometry;

let _schema$x = undefined;
let _model$v  = undefined;

function getSchemaFrom$x ( Mongoose ) {

    if ( !_schema$x ) {
        _createSchema$x( Mongoose );
    }

    return _schema$x

}

function _createSchema$x ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$x = new Schema( {} );

}

function getModelFrom$v ( Mongoose ) {

    if ( !_model$v ) {
        _createModel$v( Mongoose );
    }

    return _model$v

}

function _createModel$v ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$3.getModelFrom( Mongoose );
    _model$v                        = BufferGeometryBaseModel.discriminator( 'ConeBufferGeometry', getSchemaFrom$x( Mongoose ) );

}

function registerModelTo$v ( Mongoose ) {

    if ( !_model$v ) {
        _createModel$v( Mongoose );
    }

    return Mongoose

}

var ConeBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$x,
    getModelFrom:    getModelFrom$v,
    registerModelTo: registerModelTo$v
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$4 } = Geometry$1;

let _schema$y = undefined;
let _model$w  = undefined;

function getSchemaFrom$y ( Mongoose ) {

    if ( !_schema$y ) {
        _createSchema$y( Mongoose );
    }

    return _schema$y

}

function _createSchema$y ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$y = new Schema( {} );

}

function getModelFrom$w ( Mongoose ) {

    if ( !_model$w ) {
        _createModel$w( Mongoose );
    }

    return _model$w

}

function _createModel$w ( Mongoose ) {

    const GeometryBaseModel = Geometry$4.getModelFrom( Mongoose );
    _model$w                  = GeometryBaseModel.discriminator( 'ConeGeometry', getSchemaFrom$y( Mongoose ) );

}

function registerModelTo$w ( Mongoose ) {

    if ( !_model$w ) {
        _createModel$w( Mongoose );
    }

    return Mongoose

}

var ConeGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$y,
    getModelFrom:    getModelFrom$w,
    registerModelTo: registerModelTo$w
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$5 } = Geometry$1;

let _schema$z = undefined;
let _model$x  = undefined;

function getSchemaFrom$z ( Mongoose ) {

    if ( !_schema$z ) {
        _createSchema$z( Mongoose );
    }

    return _schema$z

}

function _createSchema$z ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$z = new Schema( {} );

}

function getModelFrom$x ( Mongoose ) {

    if ( !_model$x ) {
        _createModel$x( Mongoose );
    }

    return _model$x

}

function _createModel$x ( Mongoose ) {

    const GeometryBaseModel = Geometry$5.getModelFrom( Mongoose );
    _model$x                  = GeometryBaseModel.discriminator( 'ConvexGeometry', getSchemaFrom$z( Mongoose ) );

}

function registerModelTo$x ( Mongoose ) {

    if ( !_model$x ) {
        _createModel$x( Mongoose );
    }

    return Mongoose

}

var ConvexGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$z,
    getModelFrom:    getModelFrom$x,
    registerModelTo: registerModelTo$x
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$4 } = BufferGeometry;

let _schema$A = undefined;
let _model$y  = undefined;

function getSchemaFrom$A ( Mongoose ) {

    if ( !_schema$A ) {
        _createSchema$A( Mongoose );
    }

    return _schema$A

}

function _createSchema$A ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$A = new Schema( {} );

}

function getModelFrom$y ( Mongoose ) {

    if ( !_model$y ) {
        _createModel$y( Mongoose );
    }

    return _model$y

}

function _createModel$y ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$4.getModelFrom( Mongoose );
    _model$y                        = BufferGeometryBaseModel.discriminator( 'CylinderBufferGeometry', getSchemaFrom$A( Mongoose ) );

}

function registerModelTo$y ( Mongoose ) {

    if ( !_model$y ) {
        _createModel$y( Mongoose );
    }

    return Mongoose

}

var CylinderBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$A,
    getModelFrom:    getModelFrom$y,
    registerModelTo: registerModelTo$y
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$6 } = Geometry$1;

let _schema$B = undefined;
let _model$z  = undefined;

function getSchemaFrom$B ( Mongoose ) {

    if ( !_schema$B ) {
        _createSchema$B( Mongoose );
    }

    return _schema$B

}

function _createSchema$B ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$B = new Schema( {} );

}

function getModelFrom$z ( Mongoose ) {

    if ( !_model$z ) {
        _createModel$z( Mongoose );
    }

    return _model$z

}

function _createModel$z ( Mongoose ) {

    const GeometryBaseModel = Geometry$6.getModelFrom( Mongoose );
    _model$z                  = GeometryBaseModel.discriminator( 'CylinderGeometry', getSchemaFrom$B( Mongoose ) );

}

function registerModelTo$z ( Mongoose ) {

    if ( !_model$z ) {
        _createModel$z( Mongoose );
    }

    return Mongoose

}

var CylinderGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$B,
    getModelFrom:    getModelFrom$z,
    registerModelTo: registerModelTo$z
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$7 } = Geometry$1;

let _schema$C = undefined;
let _model$A  = undefined;

function getSchemaFrom$C ( Mongoose ) {

    if ( !_schema$C ) {
        _createSchema$C( Mongoose );
    }

    return _schema$C

}

function _createSchema$C ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$C = new Schema( {} );

}

function getModelFrom$A ( Mongoose ) {

    if ( !_model$A ) {
        _createModel$A( Mongoose );
    }

    return _model$A

}

function _createModel$A ( Mongoose ) {

    const GeometryBaseModel = Geometry$7.getModelFrom( Mongoose );
    _model$A                  = GeometryBaseModel.discriminator( 'DecalGeometry', getSchemaFrom$C( Mongoose ) );

}

function registerModelTo$A ( Mongoose ) {

    if ( !_model$A ) {
        _createModel$A( Mongoose );
    }

    return Mongoose

}

var DecalGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$C,
    getModelFrom:    getModelFrom$A,
    registerModelTo: registerModelTo$A
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$8 } = Geometry$1;

let _schema$D = undefined;
let _model$B  = undefined;

function getSchemaFrom$D ( Mongoose ) {

    if ( !_schema$D ) {
        _createSchema$D( Mongoose );
    }

    return _schema$D

}

function _createSchema$D ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$D = new Schema( {} );

}

function getModelFrom$B ( Mongoose ) {

    if ( !_model$B ) {
        _createModel$B( Mongoose );
    }

    return _model$B

}

function _createModel$B ( Mongoose ) {

    const GeometryBaseModel = Geometry$8.getModelFrom( Mongoose );
    _model$B                  = GeometryBaseModel.discriminator( 'DodecahedronGeometry', getSchemaFrom$D( Mongoose ) );

}

function registerModelTo$B ( Mongoose ) {

    if ( !_model$B ) {
        _createModel$B( Mongoose );
    }

    return Mongoose

}

var DodecahedronGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$D,
    getModelFrom:    getModelFrom$B,
    registerModelTo: registerModelTo$B
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$9 } = Geometry$1;

let _schema$E = undefined;
let _model$C  = undefined;

function getSchemaFrom$E ( Mongoose ) {

    if ( !_schema$E ) {
        _createSchema$E( Mongoose );
    }

    return _schema$E

}

function _createSchema$E ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$E = new Schema( {} );

}

function getModelFrom$C ( Mongoose ) {

    if ( !_model$C ) {
        _createModel$C( Mongoose );
    }

    return _model$C

}

function _createModel$C ( Mongoose ) {

    const GeometryBaseModel = Geometry$9.getModelFrom( Mongoose );
    _model$C                  = GeometryBaseModel.discriminator( 'EdgesGeometry', getSchemaFrom$E( Mongoose ) );

}

function registerModelTo$C ( Mongoose ) {

    if ( !_model$C ) {
        _createModel$C( Mongoose );
    }

    return Mongoose

}

var EdgesGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$E,
    getModelFrom:    getModelFrom$C,
    registerModelTo: registerModelTo$C
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$5 } = BufferGeometry;

let _schema$F = undefined;
let _model$D  = undefined;

function getSchemaFrom$F ( Mongoose ) {

    if ( !_schema$F ) {
        _createSchema$F( Mongoose );
    }

    return _schema$F

}

function _createSchema$F ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$F = new Schema( {} );

}

function getModelFrom$D ( Mongoose ) {

    if ( !_model$D ) {
        _createModel$D( Mongoose );
    }

    return _model$D

}

function _createModel$D ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$5.getModelFrom( Mongoose );
    _model$D                        = BufferGeometryBaseModel.discriminator( 'ExtrudeBufferGeometry', getSchemaFrom$F( Mongoose ) );

}

function registerModelTo$D ( Mongoose ) {

    if ( !_model$D ) {
        _createModel$D( Mongoose );
    }

    return Mongoose

}

var ExtrudeBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$F,
    getModelFrom:    getModelFrom$D,
    registerModelTo: registerModelTo$D
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$a } = Geometry$1;

let _schema$G = undefined;
let _model$E  = undefined;

function getSchemaFrom$G ( Mongoose ) {

    if ( !_schema$G ) {
        _createSchema$G( Mongoose );
    }

    return _schema$G

}

function _createSchema$G ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$G = new Schema( {} );

}

function getModelFrom$E ( Mongoose ) {

    if ( !_model$E ) {
        _createModel$E( Mongoose );
    }

    return _model$E

}

function _createModel$E ( Mongoose ) {

    const GeometryBaseModel = Geometry$a.getModelFrom( Mongoose );
    _model$E                  = GeometryBaseModel.discriminator( 'ExtrudeGeometry', getSchemaFrom$G( Mongoose ) );

}

function registerModelTo$E ( Mongoose ) {

    if ( !_model$E ) {
        _createModel$E( Mongoose );
    }

    return Mongoose

}

var ExtrudeGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$G,
    getModelFrom:    getModelFrom$E,
    registerModelTo: registerModelTo$E
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$6 } = BufferGeometry;

let _schema$H = undefined;
let _model$F  = undefined;

function getSchemaFrom$H ( Mongoose ) {

    if ( !_schema$H ) {
        _createSchema$H( Mongoose );
    }

    return _schema$H

}

function _createSchema$H ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$H = new Schema( {} );

}

function getModelFrom$F ( Mongoose ) {

    if ( !_model$F ) {
        _createModel$F( Mongoose );
    }

    return _model$F

}

function _createModel$F ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$6.getModelFrom( Mongoose );
    _model$F                        = BufferGeometryBaseModel.discriminator( 'IcosahedronBufferGeometry', getSchemaFrom$H( Mongoose ) );

}

function registerModelTo$F ( Mongoose ) {

    if ( !_model$F ) {
        _createModel$F( Mongoose );
    }

    return Mongoose

}

var IcosahedronBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$H,
    getModelFrom:    getModelFrom$F,
    registerModelTo: registerModelTo$F
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$b } = Geometry$1;

let _schema$I = undefined;
let _model$G  = undefined;

function getSchemaFrom$I ( Mongoose ) {

    if ( !_schema$I ) {
        _createSchema$I( Mongoose );
    }

    return _schema$I

}

function _createSchema$I ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$I = new Schema( {} );

}

function getModelFrom$G ( Mongoose ) {

    if ( !_model$G ) {
        _createModel$G( Mongoose );
    }

    return _model$G

}

function _createModel$G ( Mongoose ) {

    const GeometryBaseModel = Geometry$b.getModelFrom( Mongoose );
    _model$G                  = GeometryBaseModel.discriminator( 'IcosahedronGeometry', getSchemaFrom$I( Mongoose ) );

}

function registerModelTo$G ( Mongoose ) {

    if ( !_model$G ) {
        _createModel$G( Mongoose );
    }

    return Mongoose

}

var IcosahedronGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$I,
    getModelFrom:    getModelFrom$G,
    registerModelTo: registerModelTo$G
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$7 } = BufferGeometry;

let _schema$J = undefined;
let _model$H  = undefined;

function getSchemaFrom$J ( Mongoose ) {

    if ( !_schema$J ) {
        _createSchema$J( Mongoose );
    }

    return _schema$J

}

function _createSchema$J ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$J = new Schema( {} );

}

function getModelFrom$H ( Mongoose ) {

    if ( !_model$H ) {
        _createModel$H( Mongoose );
    }

    return _model$H

}

function _createModel$H ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$7.getModelFrom( Mongoose );
    _model$H                        = BufferGeometryBaseModel.discriminator( 'InstancedBufferGeometry', getSchemaFrom$J( Mongoose ) );

}

function registerModelTo$H ( Mongoose ) {

    if ( !_model$H ) {
        _createModel$H( Mongoose );
    }

    return Mongoose

}

var InstancedBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$J,
    getModelFrom:    getModelFrom$H,
    registerModelTo: registerModelTo$H
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$8 } = BufferGeometry;

let _schema$K = undefined;
let _model$I  = undefined;

function getSchemaFrom$K ( Mongoose ) {

    if ( !_schema$K ) {
        _createSchema$K( Mongoose );
    }

    return _schema$K

}

function _createSchema$K ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$K = new Schema( {} );

}

function getModelFrom$I ( Mongoose ) {

    if ( !_model$I ) {
        _createModel$I( Mongoose );
    }

    return _model$I

}

function _createModel$I ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$8.getModelFrom( Mongoose );
    _model$I                        = BufferGeometryBaseModel.discriminator( 'LatheBufferGeometry', getSchemaFrom$K( Mongoose ) );

}

function registerModelTo$I ( Mongoose ) {

    if ( !_model$I ) {
        _createModel$I( Mongoose );
    }

    return Mongoose

}

var LatheBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$K,
    getModelFrom:    getModelFrom$I,
    registerModelTo: registerModelTo$I
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$c } = Geometry$1;

let _schema$L = undefined;
let _model$J  = undefined;

function getSchemaFrom$L ( Mongoose ) {

    if ( !_schema$L ) {
        _createSchema$L( Mongoose );
    }

    return _schema$L

}

function _createSchema$L ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$L = new Schema( {} );

}

function getModelFrom$J ( Mongoose ) {

    if ( !_model$J ) {
        _createModel$J( Mongoose );
    }

    return _model$J

}

function _createModel$J ( Mongoose ) {

    const GeometryBaseModel = Geometry$c.getModelFrom( Mongoose );
    _model$J                  = GeometryBaseModel.discriminator( 'LatheGeometry', getSchemaFrom$L( Mongoose ) );

}

function registerModelTo$J ( Mongoose ) {

    if ( !_model$J ) {
        _createModel$J( Mongoose );
    }

    return Mongoose

}

var LatheGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$L,
    getModelFrom:    getModelFrom$J,
    registerModelTo: registerModelTo$J
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$9 } = BufferGeometry;

let _schema$M = undefined;
let _model$K  = undefined;

function getSchemaFrom$M ( Mongoose ) {

    if ( !_schema$M ) {
        _createSchema$M( Mongoose );
    }

    return _schema$M

}

function _createSchema$M ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$M = new Schema( {} );

}

function getModelFrom$K ( Mongoose ) {

    if ( !_model$K ) {
        _createModel$K( Mongoose );
    }

    return _model$K

}

function _createModel$K ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$9.getModelFrom( Mongoose );
    _model$K                        = BufferGeometryBaseModel.discriminator( 'OctahedronBufferGeometry', getSchemaFrom$M( Mongoose ) );

}

function registerModelTo$K ( Mongoose ) {

    if ( !_model$K ) {
        _createModel$K( Mongoose );
    }

    return Mongoose

}

var OctahedronBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$M,
    getModelFrom:    getModelFrom$K,
    registerModelTo: registerModelTo$K
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$d } = Geometry$1;

let _schema$N = undefined;
let _model$L  = undefined;

function getSchemaFrom$N ( Mongoose ) {

    if ( !_schema$N ) {
        _createSchema$N( Mongoose );
    }

    return _schema$N

}

function _createSchema$N ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$N = new Schema( {} );

}

function getModelFrom$L ( Mongoose ) {

    if ( !_model$L ) {
        _createModel$L( Mongoose );
    }

    return _model$L

}

function _createModel$L ( Mongoose ) {

    const GeometryBaseModel = Geometry$d.getModelFrom( Mongoose );
    _model$L                  = GeometryBaseModel.discriminator( 'OctahedronGeometry', getSchemaFrom$N( Mongoose ) );

}

function registerModelTo$L ( Mongoose ) {

    if ( !_model$L ) {
        _createModel$L( Mongoose );
    }

    return Mongoose

}

var OctahedronGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$N,
    getModelFrom:    getModelFrom$L,
    registerModelTo: registerModelTo$L
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$a } = BufferGeometry;

let _schema$O = undefined;
let _model$M  = undefined;

function getSchemaFrom$O ( Mongoose ) {

    if ( !_schema$O ) {
        _createSchema$O( Mongoose );
    }

    return _schema$O

}

function _createSchema$O ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$O = new Schema( {} );

}

function getModelFrom$M ( Mongoose ) {

    if ( !_model$M ) {
        _createModel$M( Mongoose );
    }

    return _model$M

}

function _createModel$M ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$a.getModelFrom( Mongoose );
    _model$M                        = BufferGeometryBaseModel.discriminator( 'ParametricBufferGeometry', getSchemaFrom$O( Mongoose ) );

}

function registerModelTo$M ( Mongoose ) {

    if ( !_model$M ) {
        _createModel$M( Mongoose );
    }

    return Mongoose

}

var ParametricBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$O,
    getModelFrom:    getModelFrom$M,
    registerModelTo: registerModelTo$M
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$e } = Geometry$1;

let _schema$P = undefined;
let _model$N  = undefined;

function getSchemaFrom$P ( Mongoose ) {

    if ( !_schema$P ) {
        _createSchema$P( Mongoose );
    }

    return _schema$P

}

function _createSchema$P ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$P = new Schema( {} );

}

function getModelFrom$N ( Mongoose ) {

    if ( !_model$N ) {
        _createModel$N( Mongoose );
    }

    return _model$N

}

function _createModel$N ( Mongoose ) {

    const GeometryBaseModel = Geometry$e.getModelFrom( Mongoose );
    _model$N                  = GeometryBaseModel.discriminator( 'ParametricGeometry', getSchemaFrom$P( Mongoose ) );

}

function registerModelTo$N ( Mongoose ) {

    if ( !_model$N ) {
        _createModel$N( Mongoose );
    }

    return Mongoose

}

var ParametricGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$P,
    getModelFrom:    getModelFrom$N,
    registerModelTo: registerModelTo$N
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$b } = BufferGeometry;

let _schema$Q = undefined;
let _model$O  = undefined;

function getSchemaFrom$Q ( Mongoose ) {

    if ( !_schema$Q ) {
        _createSchema$Q( Mongoose );
    }

    return _schema$Q

}

function _createSchema$Q ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$Q = new Schema( {} );

}

function getModelFrom$O ( Mongoose ) {

    if ( !_model$O ) {
        _createModel$O( Mongoose );
    }

    return _model$O

}

function _createModel$O ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$b.getModelFrom( Mongoose );
    _model$O                        = BufferGeometryBaseModel.discriminator( 'PlaneBufferGeometry', getSchemaFrom$Q( Mongoose ) );

}

function registerModelTo$O ( Mongoose ) {

    if ( !_model$O ) {
        _createModel$O( Mongoose );
    }

    return Mongoose

}

var PlaneBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$Q,
    getModelFrom:    getModelFrom$O,
    registerModelTo: registerModelTo$O
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$f } = Geometry$1;

let _schema$R = undefined;
let _model$P  = undefined;

function getSchemaFrom$R ( Mongoose ) {

    if ( !_schema$R ) {
        _createSchema$R( Mongoose );
    }

    return _schema$R

}

function _createSchema$R ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$R = new Schema( {} );

}

function getModelFrom$P ( Mongoose ) {

    if ( !_model$P ) {
        _createModel$P( Mongoose );
    }

    return _model$P

}

function _createModel$P ( Mongoose ) {

    const GeometryBaseModel = Geometry$f.getModelFrom( Mongoose );
    _model$P                  = GeometryBaseModel.discriminator( 'PlaneGeometry', getSchemaFrom$R( Mongoose ) );

}

function registerModelTo$P ( Mongoose ) {

    if ( !_model$P ) {
        _createModel$P( Mongoose );
    }

    return Mongoose

}

var PlaneGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$R,
    getModelFrom:    getModelFrom$P,
    registerModelTo: registerModelTo$P
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$c } = BufferGeometry;

let _schema$S = undefined;
let _model$Q  = undefined;

function getSchemaFrom$S ( Mongoose ) {

    if ( !_schema$S ) {
        _createSchema$S( Mongoose );
    }

    return _schema$S

}

function _createSchema$S ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$S = new Schema( {} );

}

function getModelFrom$Q ( Mongoose ) {

    if ( !_model$Q ) {
        _createModel$Q( Mongoose );
    }

    return _model$Q

}

function _createModel$Q ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$c.getModelFrom( Mongoose );
    _model$Q                        = BufferGeometryBaseModel.discriminator( 'PolyhedronBufferGeometry', getSchemaFrom$S( Mongoose ) );

}

function registerModelTo$Q ( Mongoose ) {

    if ( !_model$Q ) {
        _createModel$Q( Mongoose );
    }

    return Mongoose

}

var PolyhedronBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$S,
    getModelFrom:    getModelFrom$Q,
    registerModelTo: registerModelTo$Q
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$g } = Geometry$1;

let _schema$T = undefined;
let _model$R  = undefined;

function getSchemaFrom$T ( Mongoose ) {

    if ( !_schema$T ) {
        _createSchema$T( Mongoose );
    }

    return _schema$T

}

function _createSchema$T ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$T = new Schema( {} );

}

function getModelFrom$R ( Mongoose ) {

    if ( !_model$R ) {
        _createModel$R( Mongoose );
    }

    return _model$R

}

function _createModel$R ( Mongoose ) {

    const GeometryBaseModel = Geometry$g.getModelFrom( Mongoose );
    _model$R                  = GeometryBaseModel.discriminator( 'PolyhedronGeometry', getSchemaFrom$T( Mongoose ) );

}

function registerModelTo$R ( Mongoose ) {

    if ( !_model$R ) {
        _createModel$R( Mongoose );
    }

    return Mongoose

}

var PolyhedronGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$T,
    getModelFrom:    getModelFrom$R,
    registerModelTo: registerModelTo$R
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$d } = BufferGeometry;

let _schema$U = undefined;
let _model$S  = undefined;

function getSchemaFrom$U ( Mongoose ) {

    if ( !_schema$U ) {
        _createSchema$U( Mongoose );
    }

    return _schema$U

}

function _createSchema$U ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$U = new Schema( {} );

}

function getModelFrom$S ( Mongoose ) {

    if ( !_model$S ) {
        _createModel$S( Mongoose );
    }

    return _model$S

}

function _createModel$S ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$d.getModelFrom( Mongoose );
    _model$S                        = BufferGeometryBaseModel.discriminator( 'RingBufferGeometry', getSchemaFrom$U( Mongoose ) );

}

function registerModelTo$S ( Mongoose ) {

    if ( !_model$S ) {
        _createModel$S( Mongoose );
    }

    return Mongoose

}

var RingBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$U,
    getModelFrom:    getModelFrom$S,
    registerModelTo: registerModelTo$S
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$h } = Geometry$1;

let _schema$V = undefined;
let _model$T  = undefined;

function getSchemaFrom$V ( Mongoose ) {

    if ( !_schema$V ) {
        _createSchema$V( Mongoose );
    }

    return _schema$V

}

function _createSchema$V ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$V = new Schema( {} );

}

function getModelFrom$T ( Mongoose ) {

    if ( !_model$T ) {
        _createModel$T( Mongoose );
    }

    return _model$T

}

function _createModel$T ( Mongoose ) {

    const GeometryBaseModel = Geometry$h.getModelFrom( Mongoose );
    _model$T                  = GeometryBaseModel.discriminator( 'RingGeometry', getSchemaFrom$V( Mongoose ) );

}

function registerModelTo$T ( Mongoose ) {

    if ( !_model$T ) {
        _createModel$T( Mongoose );
    }

    return Mongoose

}

var RingGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$V,
    getModelFrom:    getModelFrom$T,
    registerModelTo: registerModelTo$T
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$e } = BufferGeometry;

let _schema$W = undefined;
let _model$U  = undefined;

function getSchemaFrom$W ( Mongoose ) {

    if ( !_schema$W ) {
        _createSchema$W( Mongoose );
    }

    return _schema$W

}

function _createSchema$W ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    const NestedCurveSchema = new Schema(
        {
            type: {
                type:    String,
                default: 'Curve'
            },
            arcLengthDivisions: Number
        },
        {
            id:  false,
            _id: false
        }
    );

    const NestedPathSchema = new Schema(
        {

            // CurvePath inheritance
            curves:    [ NestedCurveSchema ], // Curve
            autoClose: {
                type:    Boolean,
                default: false
            },

            // Path inheritance
            currentPoint: Vector2

        },
        {
            id:  false,
            _id: false
        }
    );

    const NestedShapeSchema = new Schema(
        {

            // CurvePath inheritance
            curves:    [ NestedCurveSchema ], // Curve
            autoClose: {
                type:    Boolean,
                default: false
            },

            // Path inheritance
            currentPoint: Vector2,

            // Shape inheritance
            uuid:  String,
            holes: [ NestedPathSchema ] // Path

        },
        {
            id:  false,
            _id: false
        }
    );

    _schema$W = new Schema( {
        shapes:        [ NestedShapeSchema ],
        curveSegments: Number
    } );

}

function getModelFrom$U ( Mongoose ) {

    if ( !_model$U ) {
        _createModel$U( Mongoose );
    }

    return _model$U

}

function _createModel$U ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$e.getModelFrom( Mongoose );
    _model$U                        = BufferGeometryBaseModel.discriminator( 'ShapeBufferGeometry', getSchemaFrom$W( Mongoose ) );

}

function registerModelTo$U ( Mongoose ) {

    if ( !_model$U ) {
        _createModel$U( Mongoose );
    }

    return Mongoose

}

var ShapeBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$W,
    getModelFrom:    getModelFrom$U,
    registerModelTo: registerModelTo$U
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$i } = Geometry$1;

let _schema$X = undefined;
let _model$V  = undefined;

function getSchemaFrom$X ( Mongoose ) {

    if ( !_schema$X ) {
        _createSchema$X( Mongoose );
    }

    return _schema$X

}

function _createSchema$X ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$X = new Schema( {} );

}

function getModelFrom$V ( Mongoose ) {

    if ( !_model$V ) {
        _createModel$V( Mongoose );
    }

    return _model$V

}

function _createModel$V ( Mongoose ) {

    const GeometryBaseModel = Geometry$i.getModelFrom( Mongoose );
    _model$V                  = GeometryBaseModel.discriminator( 'ShapeGeometry', getSchemaFrom$X( Mongoose ) );

}

function registerModelTo$V ( Mongoose ) {

    if ( !_model$V ) {
        _createModel$V( Mongoose );
    }

    return Mongoose

}

var ShapeGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$X,
    getModelFrom:    getModelFrom$V,
    registerModelTo: registerModelTo$V
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$f } = BufferGeometry;

let _schema$Y = undefined;
let _model$W  = undefined;

function getSchemaFrom$Y ( Mongoose ) {

    if ( !_schema$Y ) {
        _createSchema$Y( Mongoose );
    }

    return _schema$Y

}

function _createSchema$Y ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$Y = new Schema( {} );

}

function getModelFrom$W ( Mongoose ) {

    if ( !_model$W ) {
        _createModel$W( Mongoose );
    }

    return _model$W

}

function _createModel$W ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$f.getModelFrom( Mongoose );
    _model$W                        = BufferGeometryBaseModel.discriminator( 'SphereBufferGeometry', getSchemaFrom$Y( Mongoose ) );

}

function registerModelTo$W ( Mongoose ) {

    if ( !_model$W ) {
        _createModel$W( Mongoose );
    }

    return Mongoose

}

var SphereBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$Y,
    getModelFrom:    getModelFrom$W,
    registerModelTo: registerModelTo$W
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$j } = Geometry$1;

let _schema$Z = undefined;
let _model$X  = undefined;

function getSchemaFrom$Z ( Mongoose ) {

    if ( !_schema$Z ) {
        _createSchema$Z( Mongoose );
    }

    return _schema$Z

}

function _createSchema$Z ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$Z = new Schema( {} );

}

function getModelFrom$X ( Mongoose ) {

    if ( !_model$X ) {
        _createModel$X( Mongoose );
    }

    return _model$X

}

function _createModel$X ( Mongoose ) {

    const GeometryBaseModel = Geometry$j.getModelFrom( Mongoose );
    _model$X                  = GeometryBaseModel.discriminator( 'SphereGeometry', getSchemaFrom$Z( Mongoose ) );

}

function registerModelTo$X ( Mongoose ) {

    if ( !_model$X ) {
        _createModel$X( Mongoose );
    }

    return Mongoose

}

var SphereGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$Z,
    getModelFrom:    getModelFrom$X,
    registerModelTo: registerModelTo$X
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$g } = BufferGeometry;

let _schema$_ = undefined;
let _model$Y  = undefined;

function getSchemaFrom$_ ( Mongoose ) {

    if ( !_schema$_ ) {
        _createSchema$_( Mongoose );
    }

    return _schema$_

}

function _createSchema$_ ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$_ = new Schema( {} );

}

function getModelFrom$Y ( Mongoose ) {

    if ( !_model$Y ) {
        _createModel$Y( Mongoose );
    }

    return _model$Y

}

function _createModel$Y ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$g.getModelFrom( Mongoose );
    _model$Y                        = BufferGeometryBaseModel.discriminator( 'TeapotBufferGeometry', getSchemaFrom$_( Mongoose ) );

}

function registerModelTo$Y ( Mongoose ) {

    if ( !_model$Y ) {
        _createModel$Y( Mongoose );
    }

    return Mongoose

}

var TeapotBufferGeometry = {
    getSchemaFrom:   getSchemaFrom$_,
    getModelFrom:    getModelFrom$Y,
    registerModelTo: registerModelTo$Y
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$h } = BufferGeometry;

let _schema$$ = undefined;
let _model$Z  = undefined;

function getSchemaFrom$$ ( Mongoose ) {

    if ( !_schema$$ ) {
        _createSchema$$( Mongoose );
    }

    return _schema$$

}

function _createSchema$$ ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$$ = new Schema( {} );

}

function getModelFrom$Z ( Mongoose ) {

    if ( !_model$Z ) {
        _createModel$Z( Mongoose );
    }

    return _model$Z

}

function _createModel$Z ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$h.getModelFrom( Mongoose );
    _model$Z                        = BufferGeometryBaseModel.discriminator( 'TetrahedronBufferGeometry', getSchemaFrom$$( Mongoose ) );

}

function registerModelTo$Z ( Mongoose ) {

    if ( !_model$Z ) {
        _createModel$Z( Mongoose );
    }

    return Mongoose

}

var TetrahedronBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$$,
    getModelFrom:    getModelFrom$Z,
    registerModelTo: registerModelTo$Z
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$k } = Geometry$1;

let _schema$10 = undefined;
let _model$_  = undefined;

function getSchemaFrom$10 ( Mongoose ) {

    if ( !_schema$10 ) {
        _createSchema$10( Mongoose );
    }

    return _schema$10

}

function _createSchema$10 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$10 = new Schema( {} );

}

function getModelFrom$_ ( Mongoose ) {

    if ( !_model$_ ) {
        _createModel$_( Mongoose );
    }

    return _model$_

}

function _createModel$_ ( Mongoose ) {

    const GeometryBaseModel = Geometry$k.getModelFrom( Mongoose );
    _model$_                  = GeometryBaseModel.discriminator( 'TetrahedronGeometry', getSchemaFrom$10( Mongoose ) );

}

function registerModelTo$_ ( Mongoose ) {

    if ( !_model$_ ) {
        _createModel$_( Mongoose );
    }

    return Mongoose

}

var TetrahedronGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$10,
    getModelFrom:    getModelFrom$_,
    registerModelTo: registerModelTo$_
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$i } = BufferGeometry;

let _schema$11 = undefined;
let _model$$  = undefined;

function getSchemaFrom$11 ( Mongoose ) {

    if ( !_schema$11 ) {
        _createSchema$11( Mongoose );
    }

    return _schema$11

}

function _createSchema$11 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$11 = new Schema( {} );

}

function getModelFrom$$ ( Mongoose ) {

    if ( !_model$$ ) {
        _createModel$$( Mongoose );
    }

    return _model$$

}

function _createModel$$ ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$i.getModelFrom( Mongoose );
    _model$$                        = BufferGeometryBaseModel.discriminator( 'TextBufferGeometry', getSchemaFrom$11( Mongoose ) );

}

function registerModelTo$$ ( Mongoose ) {

    if ( !_model$$ ) {
        _createModel$$( Mongoose );
    }

    return Mongoose

}

var TextBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$11,
    getModelFrom:    getModelFrom$$,
    registerModelTo: registerModelTo$$
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$l } = Geometry$1;

let _schema$12 = undefined;
let _model$10  = undefined;

function getSchemaFrom$12 ( Mongoose ) {

    if ( !_schema$12 ) {
        _createSchema$12( Mongoose );
    }

    return _schema$12

}

function _createSchema$12 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$12 = new Schema( {} );

}

function getModelFrom$10 ( Mongoose ) {

    if ( !_model$10 ) {
        _createModel$10( Mongoose );
    }

    return _model$10

}

function _createModel$10 ( Mongoose ) {

    const GeometryBaseModel = Geometry$l.getModelFrom( Mongoose );
    _model$10                  = GeometryBaseModel.discriminator( 'TextGeometry', getSchemaFrom$12( Mongoose ) );

}

function registerModelTo$10 ( Mongoose ) {

    if ( !_model$10 ) {
        _createModel$10( Mongoose );
    }

    return Mongoose

}

var TextGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$12,
    getModelFrom:    getModelFrom$10,
    registerModelTo: registerModelTo$10
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$j } = BufferGeometry;

let _schema$13 = undefined;
let _model$11  = undefined;

function getSchemaFrom$13 ( Mongoose ) {

    if ( !_schema$13 ) {
        _createSchema$13( Mongoose );
    }

    return _schema$13

}

function _createSchema$13 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$13 = new Schema( {} );

}

function getModelFrom$11 ( Mongoose ) {

    if ( !_model$11 ) {
        _createModel$11( Mongoose );
    }

    return _model$11

}

function _createModel$11 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$j.getModelFrom( Mongoose );
    _model$11                        = BufferGeometryBaseModel.discriminator( 'TorusBufferGeometry', getSchemaFrom$13( Mongoose ) );

}

function registerModelTo$11 ( Mongoose ) {

    if ( !_model$11 ) {
        _createModel$11( Mongoose );
    }

    return Mongoose

}

var TorusBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$13,
    getModelFrom:    getModelFrom$11,
    registerModelTo: registerModelTo$11
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$m } = Geometry$1;

let _schema$14 = undefined;
let _model$12  = undefined;

function getSchemaFrom$14 ( Mongoose ) {

    if ( !_schema$14 ) {
        _createSchema$14( Mongoose );
    }

    return _schema$14

}

function _createSchema$14 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$14 = new Schema( {} );

}

function getModelFrom$12 ( Mongoose ) {

    if ( !_model$12 ) {
        _createModel$12( Mongoose );
    }

    return _model$12

}

function _createModel$12 ( Mongoose ) {

    const GeometryBaseModel = Geometry$m.getModelFrom( Mongoose );
    _model$12                  = GeometryBaseModel.discriminator( 'TorusGeometry', getSchemaFrom$14( Mongoose ) );

}

function registerModelTo$12 ( Mongoose ) {

    if ( !_model$12 ) {
        _createModel$12( Mongoose );
    }

    return Mongoose

}

var TorusGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$14,
    getModelFrom:    getModelFrom$12,
    registerModelTo: registerModelTo$12
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$k } = BufferGeometry;

let _schema$15 = undefined;
let _model$13  = undefined;

function getSchemaFrom$15 ( Mongoose ) {

    if ( !_schema$15 ) {
        _createSchema$15( Mongoose );
    }

    return _schema$15

}

function _createSchema$15 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$15 = new Schema( {} );

}

function getModelFrom$13 ( Mongoose ) {

    if ( !_model$13 ) {
        _createModel$13( Mongoose );
    }

    return _model$13

}

function _createModel$13 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$k.getModelFrom( Mongoose );
    _model$13                        = BufferGeometryBaseModel.discriminator( 'TorusKnotBufferGeometry', getSchemaFrom$15( Mongoose ) );

}

function registerModelTo$13 ( Mongoose ) {

    if ( !_model$13 ) {
        _createModel$13( Mongoose );
    }

    return Mongoose

}

var TorusKnotBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$15,
    getModelFrom:    getModelFrom$13,
    registerModelTo: registerModelTo$13
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$n } = Geometry$1;

let _schema$16 = undefined;
let _model$14  = undefined;

function getSchemaFrom$16 ( Mongoose ) {

    if ( !_schema$16 ) {
        _createSchema$16( Mongoose );
    }

    return _schema$16

}

function _createSchema$16 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$16 = new Schema( {} );

}

function getModelFrom$14 ( Mongoose ) {

    if ( !_model$14 ) {
        _createModel$14( Mongoose );
    }

    return _model$14

}

function _createModel$14 ( Mongoose ) {

    const GeometryBaseModel = Geometry$n.getModelFrom( Mongoose );
    _model$14                  = GeometryBaseModel.discriminator( 'TorusKnotGeometry', getSchemaFrom$16( Mongoose ) );

}

function registerModelTo$14 ( Mongoose ) {

    if ( !_model$14 ) {
        _createModel$14( Mongoose );
    }

    return Mongoose

}

var TorusKnotGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$16,
    getModelFrom:    getModelFrom$14,
    registerModelTo: registerModelTo$14
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { BufferGeometry: BufferGeometry$l } = BufferGeometry;

let _schema$17 = undefined;
let _model$15  = undefined;

function getSchemaFrom$17 ( Mongoose ) {

    if ( !_schema$17 ) {
        _createSchema$17( Mongoose );
    }

    return _schema$17

}

function _createSchema$17 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$17 = new Schema( {} );

}

function getModelFrom$15 ( Mongoose ) {

    if ( !_model$15 ) {
        _createModel$15( Mongoose );
    }

    return _model$15

}

function _createModel$15 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$l.getModelFrom( Mongoose );
    _model$15                        = BufferGeometryBaseModel.discriminator( 'TubeBufferGeometry', getSchemaFrom$17( Mongoose ) );

}

function registerModelTo$15 ( Mongoose ) {

    if ( !_model$15 ) {
        _createModel$15( Mongoose );
    }

    return Mongoose

}

var TubeBufferGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$17,
    getModelFrom:    getModelFrom$15,
    registerModelTo: registerModelTo$15
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$o } = Geometry$1;

let _schema$18 = undefined;
let _model$16  = undefined;

function getSchemaFrom$18 ( Mongoose ) {

    if ( !_schema$18 ) {
        _createSchema$18( Mongoose );
    }

    return _schema$18

}

function _createSchema$18 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$18 = new Schema( {} );

}

function getModelFrom$16 ( Mongoose ) {

    if ( !_model$16 ) {
        _createModel$16( Mongoose );
    }

    return _model$16

}

function _createModel$16 ( Mongoose ) {

    const GeometryBaseModel = Geometry$o.getModelFrom( Mongoose );
    _model$16                  = GeometryBaseModel.discriminator( 'TubeGeometry', getSchemaFrom$18( Mongoose ) );

}

function registerModelTo$16 ( Mongoose ) {

    if ( !_model$16 ) {
        _createModel$16( Mongoose );
    }

    return Mongoose

}

var TubeGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$18,
    getModelFrom:    getModelFrom$16,
    registerModelTo: registerModelTo$16
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Geometry: Geometry$p } = Geometry$1;

let _schema$19 = undefined;
let _model$17  = undefined;

function getSchemaFrom$19 ( Mongoose ) {

    if ( !_schema$19 ) {
        _createSchema$19( Mongoose );
    }

    return _schema$19

}

function _createSchema$19 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$19 = new Schema( {} );

}

function getModelFrom$17 ( Mongoose ) {

    if ( !_model$17 ) {
        _createModel$17( Mongoose );
    }

    return _model$17

}

function _createModel$17 ( Mongoose ) {

    const GeometryBaseModel = Geometry$p.getModelFrom( Mongoose );
    _model$17                  = GeometryBaseModel.discriminator( 'WireframeGeometry', getSchemaFrom$19( Mongoose ) );

}

function registerModelTo$17 ( Mongoose ) {

    if ( !_model$17 ) {
        _createModel$17( Mongoose );
    }

    return Mongoose

}

var WireframeGeometry_1 = {
    getSchemaFrom:   getSchemaFrom$19,
    getModelFrom:    getModelFrom$17,
    registerModelTo: registerModelTo$17
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$a } = Object3D$1;

let _schema$1a = undefined;
let _model$18  = undefined;

function getSchemaFrom$1a ( Mongoose ) {

    if ( !_schema$1a ) {
        _createSchema$1a( Mongoose );
    }

    return _schema$1a

}

function _createSchema$1a ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1a = new Schema( {} );

}

function getModelFrom$18 ( Mongoose ) {

    if ( !_model$18 ) {
        _createModel$18( Mongoose );
    }

    return _model$18

}

function _createModel$18 ( Mongoose ) {

    const Object3DBaseModel = Object3D$a.getModelFrom( Mongoose );
    _model$18                  = Object3DBaseModel.discriminator( 'ArrowHelper', getSchemaFrom$1a( Mongoose ) );

}

function registerModelTo$18 ( Mongoose ) {

    if ( !_model$18 ) {
        _createModel$18( Mongoose );
    }

    return Mongoose

}

var ArrowHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1a,
    getModelFrom:    getModelFrom$18,
    registerModelTo: registerModelTo$18
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$b } = Object3D$1;

let _schema$1b = undefined;
let _model$19  = undefined;

function getSchemaFrom$1b ( Mongoose ) {

    if ( !_schema$1b ) {
        _createSchema$1b( Mongoose );
    }

    return _schema$1b

}

function _createSchema$1b ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1b = new Schema( {} );

}

function getModelFrom$19 ( Mongoose ) {

    if ( !_model$19 ) {
        _createModel$19( Mongoose );
    }

    return _model$19

}

function _createModel$19 ( Mongoose ) {

    const Object3DBaseModel = Object3D$b.getModelFrom( Mongoose );
    _model$19                  = Object3DBaseModel.discriminator( 'AxesHelper', getSchemaFrom$1b( Mongoose ) );

}

function registerModelTo$19 ( Mongoose ) {

    if ( !_model$19 ) {
        _createModel$19( Mongoose );
    }

    return Mongoose

}

var AxesHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1b,
    getModelFrom:    getModelFrom$19,
    registerModelTo: registerModelTo$19
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$c } = Object3D$1;

let _schema$1c = undefined;
let _model$1a  = undefined;

function getSchemaFrom$1c ( Mongoose ) {

    if ( !_schema$1c ) {
        _createSchema$1c( Mongoose );
    }

    return _schema$1c

}

function _createSchema$1c ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1c = new Schema( {} );

}

function getModelFrom$1a ( Mongoose ) {

    if ( !_model$1a ) {
        _createModel$1a( Mongoose );
    }

    return _model$1a

}

function _createModel$1a ( Mongoose ) {

    const Object3DBaseModel = Object3D$c.getModelFrom( Mongoose );
    _model$1a                  = Object3DBaseModel.discriminator( 'Box3Helper', getSchemaFrom$1c( Mongoose ) );

}

function registerModelTo$1a ( Mongoose ) {

    if ( !_model$1a ) {
        _createModel$1a( Mongoose );
    }

    return Mongoose

}

var Box3Helper_1 = {
    getSchemaFrom:   getSchemaFrom$1c,
    getModelFrom:    getModelFrom$1a,
    registerModelTo: registerModelTo$1a
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$d } = Object3D$1;

let _schema$1d = undefined;
let _model$1b  = undefined;

function getSchemaFrom$1d ( Mongoose ) {

    if ( !_schema$1d ) {
        _createSchema$1d( Mongoose );
    }

    return _schema$1d

}

function _createSchema$1d ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1d = new Schema( {} );

}

function getModelFrom$1b ( Mongoose ) {

    if ( !_model$1b ) {
        _createModel$1b( Mongoose );
    }

    return _model$1b

}

function _createModel$1b ( Mongoose ) {

    const Object3DBaseModel = Object3D$d.getModelFrom( Mongoose );
    _model$1b                  = Object3DBaseModel.discriminator( 'BoxHelper', getSchemaFrom$1d( Mongoose ) );

}

function registerModelTo$1b ( Mongoose ) {

    if ( !_model$1b ) {
        _createModel$1b( Mongoose );
    }

    return Mongoose

}

var BoxHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1d,
    getModelFrom:    getModelFrom$1b,
    registerModelTo: registerModelTo$1b
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$e } = Object3D$1;

let _schema$1e = undefined;
let _model$1c  = undefined;

function getSchemaFrom$1e ( Mongoose ) {

    if ( !_schema$1e ) {
        _createSchema$1e( Mongoose );
    }

    return _schema$1e

}

function _createSchema$1e ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1e = new Schema( {} );

}

function getModelFrom$1c ( Mongoose ) {

    if ( !_model$1c ) {
        _createModel$1c( Mongoose );
    }

    return _model$1c

}

function _createModel$1c ( Mongoose ) {

    const Object3DBaseModel = Object3D$e.getModelFrom( Mongoose );
    _model$1c                  = Object3DBaseModel.discriminator( 'CameraHelper', getSchemaFrom$1e( Mongoose ) );

}

function registerModelTo$1c ( Mongoose ) {

    if ( !_model$1c ) {
        _createModel$1c( Mongoose );
    }

    return Mongoose

}

var CameraHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1e,
    getModelFrom:    getModelFrom$1c,
    registerModelTo: registerModelTo$1c
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$f } = Object3D$1;

let _schema$1f = undefined;
let _model$1d  = undefined;

function getSchemaFrom$1f ( Mongoose ) {

    if ( !_schema$1f ) {
        _createSchema$1f( Mongoose );
    }

    return _schema$1f

}

function _createSchema$1f ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1f = new Schema( {} );

}

function getModelFrom$1d ( Mongoose ) {

    if ( !_model$1d ) {
        _createModel$1d( Mongoose );
    }

    return _model$1d

}

function _createModel$1d ( Mongoose ) {

    const Object3DBaseModel = Object3D$f.getModelFrom( Mongoose );
    _model$1d                  = Object3DBaseModel.discriminator( 'DirectionalLightHelper', getSchemaFrom$1f( Mongoose ) );

}

function registerModelTo$1d ( Mongoose ) {

    if ( !_model$1d ) {
        _createModel$1d( Mongoose );
    }

    return Mongoose

}

var DirectionalLightHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1f,
    getModelFrom:    getModelFrom$1d,
    registerModelTo: registerModelTo$1d
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$g } = Object3D$1;

let _schema$1g = undefined;
let _model$1e  = undefined;

function getSchemaFrom$1g ( Mongoose ) {

    if ( !_schema$1g ) {
        _createSchema$1g( Mongoose );
    }

    return _schema$1g

}

function _createSchema$1g ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1g = new Schema( {} );

}

function getModelFrom$1e ( Mongoose ) {

    if ( !_model$1e ) {
        _createModel$1e( Mongoose );
    }

    return _model$1e

}

function _createModel$1e ( Mongoose ) {

    const Object3DBaseModel = Object3D$g.getModelFrom( Mongoose );
    _model$1e                  = Object3DBaseModel.discriminator( 'FaceNormalsHelper', getSchemaFrom$1g( Mongoose ) );

}

function registerModelTo$1e ( Mongoose ) {

    if ( !_model$1e ) {
        _createModel$1e( Mongoose );
    }

    return Mongoose

}

var FaceNormalsHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1g,
    getModelFrom:    getModelFrom$1e,
    registerModelTo: registerModelTo$1e
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$h } = Object3D$1;

let _schema$1h = undefined;
let _model$1f  = undefined;

function getSchemaFrom$1h ( Mongoose ) {

    if ( !_schema$1h ) {
        _createSchema$1h( Mongoose );
    }

    return _schema$1h

}

function _createSchema$1h ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1h = new Schema( {} );

}

function getModelFrom$1f ( Mongoose ) {

    if ( !_model$1f ) {
        _createModel$1f( Mongoose );
    }

    return _model$1f

}

function _createModel$1f ( Mongoose ) {

    const Object3DBaseModel = Object3D$h.getModelFrom( Mongoose );
    _model$1f                  = Object3DBaseModel.discriminator( 'GridHelper', getSchemaFrom$1h( Mongoose ) );

}

function registerModelTo$1f ( Mongoose ) {

    if ( !_model$1f ) {
        _createModel$1f( Mongoose );
    }

    return Mongoose

}

var GridHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1h,
    getModelFrom:    getModelFrom$1f,
    registerModelTo: registerModelTo$1f
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$i } = Object3D$1;

let _schema$1i = undefined;
let _model$1g  = undefined;

function getSchemaFrom$1i ( Mongoose ) {

    if ( !_schema$1i ) {
        _createSchema$1i( Mongoose );
    }

    return _schema$1i

}

function _createSchema$1i ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1i = new Schema( {} );

}

function getModelFrom$1g ( Mongoose ) {

    if ( !_model$1g ) {
        _createModel$1g( Mongoose );
    }

    return _model$1g

}

function _createModel$1g ( Mongoose ) {

    const Object3DBaseModel = Object3D$i.getModelFrom( Mongoose );
    _model$1g                  = Object3DBaseModel.discriminator( 'HemisphereLightHelper', getSchemaFrom$1i( Mongoose ) );

}

function registerModelTo$1g ( Mongoose ) {

    if ( !_model$1g ) {
        _createModel$1g( Mongoose );
    }

    return Mongoose

}

var HemisphereLightHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1i,
    getModelFrom:    getModelFrom$1g,
    registerModelTo: registerModelTo$1g
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$j } = Object3D$1;

let _schema$1j = undefined;
let _model$1h  = undefined;

function getSchemaFrom$1j ( Mongoose ) {

    if ( !_schema$1j ) {
        _createSchema$1j( Mongoose );
    }

    return _schema$1j

}

function _createSchema$1j ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1j = new Schema( {} );

}

function getModelFrom$1h ( Mongoose ) {

    if ( !_model$1h ) {
        _createModel$1h( Mongoose );
    }

    return _model$1h

}

function _createModel$1h ( Mongoose ) {

    const Object3DBaseModel = Object3D$j.getModelFrom( Mongoose );
    _model$1h                  = Object3DBaseModel.discriminator( 'PlaneHelper', getSchemaFrom$1j( Mongoose ) );

}

function registerModelTo$1h ( Mongoose ) {

    if ( !_model$1h ) {
        _createModel$1h( Mongoose );
    }

    return Mongoose

}

var PlaneHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1j,
    getModelFrom:    getModelFrom$1h,
    registerModelTo: registerModelTo$1h
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$k } = Object3D$1;

let _schema$1k = undefined;
let _model$1i  = undefined;

function getSchemaFrom$1k ( Mongoose ) {

    if ( !_schema$1k ) {
        _createSchema$1k( Mongoose );
    }

    return _schema$1k

}

function _createSchema$1k ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1k = new Schema( {} );

}

function getModelFrom$1i ( Mongoose ) {

    if ( !_model$1i ) {
        _createModel$1i( Mongoose );
    }

    return _model$1i

}

function _createModel$1i ( Mongoose ) {

    const Object3DBaseModel = Object3D$k.getModelFrom( Mongoose );
    _model$1i                  = Object3DBaseModel.discriminator( 'PointLightHelper', getSchemaFrom$1k( Mongoose ) );

}

function registerModelTo$1i ( Mongoose ) {

    if ( !_model$1i ) {
        _createModel$1i( Mongoose );
    }

    return Mongoose

}

var PointLightHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1k,
    getModelFrom:    getModelFrom$1i,
    registerModelTo: registerModelTo$1i
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$l } = Object3D$1;

let _schema$1l = undefined;
let _model$1j  = undefined;

function getSchemaFrom$1l ( Mongoose ) {

    if ( !_schema$1l ) {
        _createSchema$1l( Mongoose );
    }

    return _schema$1l

}

function _createSchema$1l ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1l = new Schema( {} );

}

function getModelFrom$1j ( Mongoose ) {

    if ( !_model$1j ) {
        _createModel$1j( Mongoose );
    }

    return _model$1j

}

function _createModel$1j ( Mongoose ) {

    const Object3DBaseModel = Object3D$l.getModelFrom( Mongoose );
    _model$1j                  = Object3DBaseModel.discriminator( 'PolarGridHelper', getSchemaFrom$1l( Mongoose ) );

}

function registerModelTo$1j ( Mongoose ) {

    if ( !_model$1j ) {
        _createModel$1j( Mongoose );
    }

    return Mongoose

}

var PolarGridHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1l,
    getModelFrom:    getModelFrom$1j,
    registerModelTo: registerModelTo$1j
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$m } = Object3D$1;

let _schema$1m = undefined;
let _model$1k  = undefined;

function getSchemaFrom$1m ( Mongoose ) {

    if ( !_schema$1m ) {
        _createSchema$1m( Mongoose );
    }

    return _schema$1m

}

function _createSchema$1m ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1m = new Schema( {} );

}

function getModelFrom$1k ( Mongoose ) {

    if ( !_model$1k ) {
        _createModel$1k( Mongoose );
    }

    return _model$1k

}

function _createModel$1k ( Mongoose ) {

    const Object3DBaseModel = Object3D$m.getModelFrom( Mongoose );
    _model$1k                  = Object3DBaseModel.discriminator( 'RectAreaLightHelper', getSchemaFrom$1m( Mongoose ) );

}

function registerModelTo$1k ( Mongoose ) {

    if ( !_model$1k ) {
        _createModel$1k( Mongoose );
    }

    return Mongoose

}

var RectAreaLightHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1m,
    getModelFrom:    getModelFrom$1k,
    registerModelTo: registerModelTo$1k
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$n } = Object3D$1;

let _schema$1n = undefined;
let _model$1l  = undefined;

function getSchemaFrom$1n ( Mongoose ) {

    if ( !_schema$1n ) {
        _createSchema$1n( Mongoose );
    }

    return _schema$1n

}

function _createSchema$1n ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1n = new Schema( {} );

}

function getModelFrom$1l ( Mongoose ) {

    if ( !_model$1l ) {
        _createModel$1l( Mongoose );
    }

    return _model$1l

}

function _createModel$1l ( Mongoose ) {

    const Object3DBaseModel = Object3D$n.getModelFrom( Mongoose );
    _model$1l                  = Object3DBaseModel.discriminator( 'SkeletonHelper', getSchemaFrom$1n( Mongoose ) );

}

function registerModelTo$1l ( Mongoose ) {

    if ( !_model$1l ) {
        _createModel$1l( Mongoose );
    }

    return Mongoose

}

var SkeletonHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1n,
    getModelFrom:    getModelFrom$1l,
    registerModelTo: registerModelTo$1l
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$o } = Object3D$1;

let _schema$1o = undefined;
let _model$1m  = undefined;

function getSchemaFrom$1o ( Mongoose ) {

    if ( !_schema$1o ) {
        _createSchema$1o( Mongoose );
    }

    return _schema$1o

}

function _createSchema$1o ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1o = new Schema( {} );

}

function getModelFrom$1m ( Mongoose ) {

    if ( !_model$1m ) {
        _createModel$1m( Mongoose );
    }

    return _model$1m

}

function _createModel$1m ( Mongoose ) {

    const Object3DBaseModel = Object3D$o.getModelFrom( Mongoose );
    _model$1m                  = Object3DBaseModel.discriminator( 'SpotLightHelper', getSchemaFrom$1o( Mongoose ) );

}

function registerModelTo$1m ( Mongoose ) {

    if ( !_model$1m ) {
        _createModel$1m( Mongoose );
    }

    return Mongoose

}

var SpotLightHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1o,
    getModelFrom:    getModelFrom$1m,
    registerModelTo: registerModelTo$1m
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$p } = Object3D$1;

let _schema$1p = undefined;
let _model$1n  = undefined;

function getSchemaFrom$1p ( Mongoose ) {

    if ( !_schema$1p ) {
        _createSchema$1p( Mongoose );
    }

    return _schema$1p

}

function _createSchema$1p ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1p = new Schema( {} );

}

function getModelFrom$1n ( Mongoose ) {

    if ( !_model$1n ) {
        _createModel$1n( Mongoose );
    }

    return _model$1n

}

function _createModel$1n ( Mongoose ) {

    const Object3DBaseModel = Object3D$p.getModelFrom( Mongoose );
    _model$1n                  = Object3DBaseModel.discriminator( 'VertexNormalsHelper', getSchemaFrom$1p( Mongoose ) );

}

function registerModelTo$1n ( Mongoose ) {

    if ( !_model$1n ) {
        _createModel$1n( Mongoose );
    }

    return Mongoose

}

var VertexNormalsHelper_1 = {
    getSchemaFrom:   getSchemaFrom$1p,
    getModelFrom:    getModelFrom$1n,
    registerModelTo: registerModelTo$1n
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$q } = Object3D$1;

let _schema$1q = undefined;
let _model$1o  = undefined;

function getSchemaFrom$1q ( Mongoose ) {

    if ( !_schema$1q ) {
        _createSchema$1q( Mongoose );
    }

    return _schema$1q

}

function _createSchema$1q ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1q = new Schema( {} );

}

function getModelFrom$1o ( Mongoose ) {

    if ( !_model$1o ) {
        _createModel$1o( Mongoose );
    }

    return _model$1o

}

function _createModel$1o ( Mongoose ) {

    const Object3DBaseModel = Object3D$q.getModelFrom( Mongoose );
    _model$1o                  = Object3DBaseModel.discriminator( 'AmbientLight', getSchemaFrom$1q( Mongoose ) );

}

function registerModelTo$1o ( Mongoose ) {

    if ( !_model$1o ) {
        _createModel$1o( Mongoose );
    }

    return Mongoose

}

var AmbientLight_1 = {
    getSchemaFrom:   getSchemaFrom$1q,
    getModelFrom:    getModelFrom$1o,
    registerModelTo: registerModelTo$1o
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$r } = Object3D$1;

let _schema$1r = undefined;
let _model$1p  = undefined;

function getSchemaFrom$1r ( Mongoose ) {

    if ( !_schema$1r ) {
        _createSchema$1r( Mongoose );
    }

    return _schema$1r

}

function _createSchema$1r ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1r = new Schema( {} );

}

function getModelFrom$1p ( Mongoose ) {

    if ( !_model$1p ) {
        _createModel$1p( Mongoose );
    }

    return _model$1p

}

function _createModel$1p ( Mongoose ) {

    const Object3DBaseModel = Object3D$r.getModelFrom( Mongoose );
    _model$1p                  = Object3DBaseModel.discriminator( 'DirectionalLight', getSchemaFrom$1r( Mongoose ) );

}

function registerModelTo$1p ( Mongoose ) {

    if ( !_model$1p ) {
        _createModel$1p( Mongoose );
    }

    return Mongoose

}

var DirectionalLight_1 = {
    getSchemaFrom:   getSchemaFrom$1r,
    getModelFrom:    getModelFrom$1p,
    registerModelTo: registerModelTo$1p
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$s } = Object3D$1;

let _schema$1s = undefined;
let _model$1q  = undefined;

function getSchemaFrom$1s ( Mongoose ) {

    if ( !_schema$1s ) {
        _createSchema$1s( Mongoose );
    }

    return _schema$1s

}

function _createSchema$1s ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1s = new Schema( {} );

}

function getModelFrom$1q ( Mongoose ) {

    if ( !_model$1q ) {
        _createModel$1q( Mongoose );
    }

    return _model$1q

}

function _createModel$1q ( Mongoose ) {

    const Object3DBaseModel = Object3D$s.getModelFrom( Mongoose );
    _model$1q                  = Object3DBaseModel.discriminator( 'HemisphereLight', getSchemaFrom$1s( Mongoose ) );

}

function registerModelTo$1q ( Mongoose ) {

    if ( !_model$1q ) {
        _createModel$1q( Mongoose );
    }

    return Mongoose

}

var HemisphereLight_1 = {
    getSchemaFrom:   getSchemaFrom$1s,
    getModelFrom:    getModelFrom$1q,
    registerModelTo: registerModelTo$1q
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$t } = Object3D$1;

let _schema$1t = undefined;
let _model$1r  = undefined;

function getSchemaFrom$1t ( Mongoose ) {

    if ( !_schema$1t ) {
        _createSchema$1t( Mongoose );
    }

    return _schema$1t

}

function _createSchema$1t ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1t = new Schema( {} );

}

function getModelFrom$1r ( Mongoose ) {

    if ( !_model$1r ) {
        _createModel$1r( Mongoose );
    }

    return _model$1r

}

function _createModel$1r ( Mongoose ) {

    const Object3DBaseModel = Object3D$t.getModelFrom( Mongoose );
    _model$1r                  = Object3DBaseModel.discriminator( 'Light', getSchemaFrom$1t( Mongoose ) );

}

function registerModelTo$1r ( Mongoose ) {

    if ( !_model$1r ) {
        _createModel$1r( Mongoose );
    }

    return Mongoose

}

var Light_1 = {
    getSchemaFrom:   getSchemaFrom$1t,
    getModelFrom:    getModelFrom$1r,
    registerModelTo: registerModelTo$1r
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$u } = Object3D$1;

let _schema$1u = undefined;
let _model$1s  = undefined;

function getSchemaFrom$1u ( Mongoose ) {

    if ( !_schema$1u ) {
        _createSchema$1u( Mongoose );
    }

    return _schema$1u

}

function _createSchema$1u ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1u = new Schema( {} );

}

function getModelFrom$1s ( Mongoose ) {

    if ( !_model$1s ) {
        _createModel$1s( Mongoose );
    }

    return _model$1s

}

function _createModel$1s ( Mongoose ) {

    const Object3DBaseModel = Object3D$u.getModelFrom( Mongoose );
    _model$1s                  = Object3DBaseModel.discriminator( 'PointLight', getSchemaFrom$1u( Mongoose ) );

}

function registerModelTo$1s ( Mongoose ) {

    if ( !_model$1s ) {
        _createModel$1s( Mongoose );
    }

    return Mongoose

}

var PointLight_1 = {
    getSchemaFrom:   getSchemaFrom$1u,
    getModelFrom:    getModelFrom$1s,
    registerModelTo: registerModelTo$1s
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$v } = Object3D$1;

let _schema$1v = undefined;
let _model$1t  = undefined;

function getSchemaFrom$1v ( Mongoose ) {

    if ( !_schema$1v ) {
        _createSchema$1v( Mongoose );
    }

    return _schema$1v

}

function _createSchema$1v ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1v = new Schema( {} );

}

function getModelFrom$1t ( Mongoose ) {

    if ( !_model$1t ) {
        _createModel$1t( Mongoose );
    }

    return _model$1t

}

function _createModel$1t ( Mongoose ) {

    const Object3DBaseModel = Object3D$v.getModelFrom( Mongoose );
    _model$1t                  = Object3DBaseModel.discriminator( 'RectAreaLight', getSchemaFrom$1v( Mongoose ) );

}

function registerModelTo$1t ( Mongoose ) {

    if ( !_model$1t ) {
        _createModel$1t( Mongoose );
    }

    return Mongoose

}

var RectAreaLight_1 = {
    getSchemaFrom:   getSchemaFrom$1v,
    getModelFrom:    getModelFrom$1t,
    registerModelTo: registerModelTo$1t
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$w } = Object3D$1;

let _schema$1w = undefined;
let _model$1u  = undefined;

function getSchemaFrom$1w ( Mongoose ) {

    if ( !_schema$1w ) {
        _createSchema$1w( Mongoose );
    }

    return _schema$1w

}

function _createSchema$1w ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1w = new Schema( {} );

}

function getModelFrom$1u ( Mongoose ) {

    if ( !_model$1u ) {
        _createModel$1u( Mongoose );
    }

    return _model$1u

}

function _createModel$1u ( Mongoose ) {

    const Object3DBaseModel = Object3D$w.getModelFrom( Mongoose );
    _model$1u                  = Object3DBaseModel.discriminator( 'SpotLight', getSchemaFrom$1w( Mongoose ) );

}

function registerModelTo$1u ( Mongoose ) {

    if ( !_model$1u ) {
        _createModel$1u( Mongoose );
    }

    return Mongoose

}

var SpotLight_1 = {
    getSchemaFrom:   getSchemaFrom$1w,
    getModelFrom:    getModelFrom$1u,
    registerModelTo: registerModelTo$1u
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Material
 *
 * @description Todo...
 */

let _schema$1x = undefined;
let _model$1v  = undefined;

function getSchemaFrom$1x ( Mongoose ) {

    if ( !_schema$1x ) {
        _createSchema$1x( Mongoose );
    }

    return _schema$1x

}

function _createSchema$1x ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$1x = new Schema( {
        uuid:                String,
        name:                String,
        type:                String,
        fog:                 Boolean,
        lights:              Boolean,
        blending:            Number,
        side:                Number,
        flatShading:         Boolean,
        vertexColors:        Number,
        opacity:             Number,
        transparent:         Boolean,
        blendSrc:            Number,
        blendDst:            Number,
        blendEquation:       Number,
        blendSrcAlpha:       String,
        blendDstAlpha:       String,
        blendEquationAlpha:  String,
        depthFunc:           Number,
        depthTest:           Boolean,
        depthWrite:          Boolean,
        clippingPlanes:      Mixed,
        clipIntersection:    Boolean,
        clipShadows:         Boolean,
        colorWrite:          Boolean,
        precision:           Number,
        polygonOffset:       Boolean,
        polygonOffsetFactor: Number,
        polygonOffsetUnits:  Number,
        dithering:           Boolean,
        alphaTest:           Number,
        premultipliedAlpha:  Boolean,
        overdraw:            Number,
        visible:             Boolean,
        userData:            Mixed,
        needsUpdate:         Boolean
    }, {
        collection:       'materials',
        discriminatorKey: 'type'
    } );

}

function getModelFrom$1v ( Mongoose ) {

    if ( !_model$1v ) {
        _createModel$1v( Mongoose );
    }

    return _model$1v

}

function _createModel$1v ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$1v = Mongoose.model( 'Materials', getSchemaFrom$1x( Mongoose ) );
    _model$1v.discriminator( 'Material', new Mongoose.Schema( {} ) );

}

function registerModelTo$1v ( Mongoose ) {

    if ( !_model$1v ) {
        _createModel$1v( Mongoose );
    }

    return Mongoose

}

var Material_1 = {
    getSchemaFrom:   getSchemaFrom$1x,
    getModelFrom:    getModelFrom$1v,
    registerModelTo: registerModelTo$1v
};

var Material = {
	Material: Material_1
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$1 } = Material;

let _schema$1y = undefined;
let _model$1w  = undefined;

function getSchemaFrom$1y ( Mongoose ) {

    if ( !_schema$1y ) {
        _createSchema$1y( Mongoose );
    }

    return _schema$1y

}

function _createSchema$1y ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;

    _schema$1y = new Schema( {
        color:     Color,
        light:     Boolean,
        lineWidth: Number,
        linecap:   String,
        linejoin:  String
    } );

}

function getModelFrom$1w ( Mongoose ) {

    if ( !_model$1w ) {
        _createModel$1w( Mongoose );
    }

    return _model$1w

}

function _createModel$1w ( Mongoose ) {

    const MaterialBaseModel = Material$1.getModelFrom( Mongoose );
    _model$1w                  = MaterialBaseModel.discriminator( 'LineBasicMaterial', getSchemaFrom$1y( Mongoose ) );

}

function registerModelTo$1w ( Mongoose ) {

    if ( !_model$1w ) {
        _createModel$1w( Mongoose );
    }

    return Mongoose

}

var LineBasicMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1y,
    getModelFrom:    getModelFrom$1w,
    registerModelTo: registerModelTo$1w
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$2 } = Material;

let _schema$1z = undefined;
let _model$1x  = undefined;

function getSchemaFrom$1z ( Mongoose ) {

    if ( !_schema$1z ) {
        _createSchema$1z( Mongoose );
    }

    return _schema$1z

}

function _createSchema$1z ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;

    _schema$1z = new Schema( {
        // LineBasicMaterial
        color:     Color,
        light:     Boolean,
        lineWidth: Number,
        linecap:   String,
        linejoin:  String,

        // LineDashedMaterial
        dashSize: Number,
        gapSize:  Number,
        scale:    Number
    } );

}

function getModelFrom$1x ( Mongoose ) {

    if ( !_model$1x ) {
        _createModel$1x( Mongoose );
    }

    return _model$1x

}

function _createModel$1x ( Mongoose ) {

    const MaterialBaseModel = Material$2.getModelFrom( Mongoose );
    _model$1x                  = MaterialBaseModel.discriminator( 'LineDashedMaterial', getSchemaFrom$1z( Mongoose ) );

}

function registerModelTo$1x ( Mongoose ) {

    if ( !_model$1x ) {
        _createModel$1x( Mongoose );
    }

    return Mongoose

}

var LineDashedMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1z,
    getModelFrom:    getModelFrom$1x,
    registerModelTo: registerModelTo$1x
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$3 } = Material;

let _schema$1A = undefined;
let _model$1y  = undefined;

function getSchemaFrom$1A ( Mongoose ) {

    if ( !_schema$1A ) {
        _createSchema$1A( Mongoose );
    }

    return _schema$1A

}

function _createSchema$1A ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;
    const Color  = Types.Color;

    _schema$1A = new Schema( {
        color:              Color,
        map:                Mixed, // Unknown yet
        lightMap:           Mixed, // Unknown yet
        lightMapIntensity:  Number,
        aoMap:              Mixed, // Unknown yet
        aoMapIntensity:     Number,
        specularMap:        Mixed, // Unknown yet
        alphaMap:           Mixed, // Unknown yet
        envMap:             Mixed, // Unknown yet
        combine:            Number,
        reflectivity:       Number,
        refractionRatio:    Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        wireframeLinecap:   String,
        wireframeLinejoin:  String,
        skinning:           Boolean,
        morphTargets:       Boolean,
        light:              Boolean
    } );

}

function getModelFrom$1y ( Mongoose ) {

    if ( !_model$1y ) {
        _createModel$1y( Mongoose );
    }

    return _model$1y

}

function _createModel$1y ( Mongoose ) {

    const MaterialBaseModel = Material$3.getModelFrom( Mongoose );
    _model$1y                  = MaterialBaseModel.discriminator( 'MeshBasicMaterial', getSchemaFrom$1A( Mongoose ) );

}

function registerModelTo$1y ( Mongoose ) {

    if ( !_model$1y ) {
        _createModel$1y( Mongoose );
    }

    return Mongoose

}

var MeshBasicMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1A,
    getModelFrom:    getModelFrom$1y,
    registerModelTo: registerModelTo$1y
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$4 } = Material;

let _schema$1B = undefined;
let _model$1z  = undefined;

function getSchemaFrom$1B ( Mongoose ) {

    if ( !_schema$1B ) {
        _createSchema$1B( Mongoose );
    }

    return _schema$1B

}

function _createSchema$1B ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$1B = new Schema( {
        depthPacking:       Number,
        skinning:           Boolean,
        morphTargets:       Boolean,
        map:                Mixed, // Unknown yet
        alphaMap:           Mixed, // Unknown yet
        displacementMap:    Mixed, // Unknown yet
        displacementScale:  Number,
        displacementBias:   Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        fog:                Boolean,
        light:              Boolean
    } );

}

function getModelFrom$1z ( Mongoose ) {

    if ( !_model$1z ) {
        _createModel$1z( Mongoose );
    }

    return _model$1z

}

function _createModel$1z ( Mongoose ) {

    const MaterialBaseModel = Material$4.getModelFrom( Mongoose );
    _model$1z                  = MaterialBaseModel.discriminator( 'MeshDepthMaterial', getSchemaFrom$1B( Mongoose ) );

}

function registerModelTo$1z ( Mongoose ) {

    if ( !_model$1z ) {
        _createModel$1z( Mongoose );
    }

    return Mongoose

}

var MeshDepthMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1B,
    getModelFrom:    getModelFrom$1z,
    registerModelTo: registerModelTo$1z
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$5 } = Material;

let _schema$1C = undefined;
let _model$1A  = undefined;

function getSchemaFrom$1C ( Mongoose ) {

    if ( !_schema$1C ) {
        _createSchema$1C( Mongoose );
    }

    return _schema$1C

}

function _createSchema$1C ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;
    const Mixed  = Types.Mixed;

    _schema$1C = new Schema( {
        color:              Color,
        map:                Mixed, // Unknown yet
        lightMap:           Mixed, // Unknown yet
        lightMapIntensity:  Number,
        aoMap:              Mixed, // Unknown yet
        aoMapIntensity:     Number,
        emissive:           Color,
        emissiveIntensity:  Number,
        emissiveMap:        Mixed, // Unknown yet
        specularMap:        Mixed, // Unknown yet
        alphaMap:           Mixed, // Unknown yet
        envMap:             Mixed, // Unknown yet
        combine:            Number,
        reflectivity:       Number,
        refractionRatio:    Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        wireframeLinecap:   String,
        wireframeLinejoin:  String,
        skinning:           Boolean,
        morphTargets:       Boolean,
        morphNormals:       Boolean
    } );

}

function getModelFrom$1A ( Mongoose ) {

    if ( !_model$1A ) {
        _createModel$1A( Mongoose );
    }

    return _model$1A

}

function _createModel$1A ( Mongoose ) {

    const MaterialBaseModel = Material$5.getModelFrom( Mongoose );
    _model$1A                  = MaterialBaseModel.discriminator( 'MeshLambertMaterial', getSchemaFrom$1C( Mongoose ) );

}

function registerModelTo$1A ( Mongoose ) {

    if ( !_model$1A ) {
        _createModel$1A( Mongoose );
    }

    return Mongoose

}

var MeshLambertMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1C,
    getModelFrom:    getModelFrom$1A,
    registerModelTo: registerModelTo$1A
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$6 } = Material;

let _schema$1D = undefined;
let _model$1B  = undefined;

function getSchemaFrom$1D ( Mongoose ) {

    if ( !_schema$1D ) {
        _createSchema$1D( Mongoose );
    }

    return _schema$1D

}

function _createSchema$1D ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Vector2 = Types.Vector2;

    _schema$1D = new Schema( {
        bumpMap:            Mixed, // Unknown yet
        bumpScale:          Number,
        normalMap:          Mixed, // Unknown yet
        normalScale:        Vector2,
        displacementMap:    Mixed, // Unknown yet
        displacementScale:  Number,
        displacementBias:   Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        fog:                Boolean,
        light:              Boolean,
        skinning:           Boolean,
        morphTargets:       Boolean,
        morphNormals:       Boolean
    } );

}

function getModelFrom$1B ( Mongoose ) {

    if ( !_model$1B ) {
        _createModel$1B( Mongoose );
    }

    return _model$1B

}

function _createModel$1B ( Mongoose ) {

    const MaterialBaseModel = Material$6.getModelFrom( Mongoose );
    _model$1B                  = MaterialBaseModel.discriminator( 'MeshNormalMaterial', getSchemaFrom$1D( Mongoose ) );

}

function registerModelTo$1B ( Mongoose ) {

    if ( !_model$1B ) {
        _createModel$1B( Mongoose );
    }

    return Mongoose

}

var MeshNormalMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1D,
    getModelFrom:    getModelFrom$1B,
    registerModelTo: registerModelTo$1B
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$7 } = Material;

let _schema$1E = undefined;
let _model$1C  = undefined;

function getSchemaFrom$1E ( Mongoose ) {

    if ( !_schema$1E ) {
        _createSchema$1E( Mongoose );
    }

    return _schema$1E

}

function _createSchema$1E ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Color   = Types.Color;
    const Vector2 = Types.Vector2;

    _schema$1E = new Schema( {
        color:              Color,
        specular:           Color,
        shininess:          Number,
        map:                Mixed, // Unknown yet
        lightMap:           Mixed, // Unknown yet
        lightMapIntensity:  Number,
        aoMap:              Mixed, // Unknown yet
        aoMapIntensity:     Number,
        emissive:           Color,
        emissiveIntensity:  Number,
        emissiveMap:        Mixed, // Unknown yet
        bumpMap:            Mixed, // Unknown yet
        bumpScale:          Number,
        normalMap:          Mixed, // Unknown yet
        normalScale:        Vector2,
        displacementMap:    Mixed, // Unknown yet
        displacementScale:  Number,
        displacementBias:   Number,
        specularMap:        Mixed, // Unknown yet
        alphaMap:           Mixed, // Unknown yet
        envMap:             Mixed, // Unknown yet
        combine:            Number,
        reflectivity:       Number,
        refractionRatio:    Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        wireframeLinecap:   String,
        wireframeLinejoin:  String,
        skinning:           Boolean,
        morphTargets:       Boolean,
        morphNormals:       Boolean
    } );

}

function getModelFrom$1C ( Mongoose ) {

    if ( !_model$1C ) {
        _createModel$1C( Mongoose );
    }

    return _model$1C

}

function _createModel$1C ( Mongoose ) {

    const MaterialBaseModel = Material$7.getModelFrom( Mongoose );
    _model$1C                  = MaterialBaseModel.discriminator( 'MeshPhongMaterial', getSchemaFrom$1E( Mongoose ) );

}

function registerModelTo$1C ( Mongoose ) {

    if ( !_model$1C ) {
        _createModel$1C( Mongoose );
    }

    return Mongoose

}

var MeshPhongMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1E,
    getModelFrom:    getModelFrom$1C,
    registerModelTo: registerModelTo$1C
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$8 } = Material;

let _schema$1F = undefined;
let _model$1D  = undefined;

function getSchemaFrom$1F ( Mongoose ) {

    if ( !_schema$1F ) {
        _createSchema$1F( Mongoose );
    }

    return _schema$1F

}

function _createSchema$1F ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1F = new Schema( {
        reflectivity:       Number,
        clearCoat:          Number,
        clearCoatRoughness: Number
    } );

}

function getModelFrom$1D ( Mongoose ) {

    if ( !_model$1D ) {
        _createModel$1D( Mongoose );
    }

    return _model$1D

}

function _createModel$1D ( Mongoose ) {

    const MaterialBaseModel = Material$8.getModelFrom( Mongoose );
    _model$1D                  = MaterialBaseModel.discriminator( 'MeshPhysicalMaterial', getSchemaFrom$1F( Mongoose ) );

}

function registerModelTo$1D ( Mongoose ) {

    if ( !_model$1D ) {
        _createModel$1D( Mongoose );
    }

    return Mongoose

}

var MeshPhysicalMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1F,
    getModelFrom:    getModelFrom$1D,
    registerModelTo: registerModelTo$1D
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$9 } = Material;

let _schema$1G = undefined;
let _model$1E  = undefined;

function getSchemaFrom$1G ( Mongoose ) {

    if ( !_schema$1G ) {
        _createSchema$1G( Mongoose );
    }

    return _schema$1G

}

function _createSchema$1G ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Color   = Types.Color;
    const Vector2 = Types.Vector2;

    _schema$1G = new Schema( {
        color:              Color,
        roughness:          Number,
        metalness:          Number,
        map:                Mixed, // Unknown yet
        lightMap:           Mixed, // Unknown yet
        lightMapIntensity:  Number,
        aoMap:              Mixed, // Unknown yet
        aoMapIntensity:     Number,
        emissive:           Color,
        emissiveIntensity:  Number,
        emissiveMap:        Mixed, // Unknown yet
        bumpMap:            Mixed, // Unknown yet
        bumpScale:          Number,
        normalMap:          Mixed, // Unknown yet
        normalScale:        Vector2,
        displacementMap:    Mixed, // Unknown yet
        displacementScale:  Number,
        displacementBias:   Number,
        roughnessMap:       Mixed, // Unknown yet
        metalnessMap:       Mixed, // Unknown yet
        alphaMap:           Mixed, // Unknown yet
        envMap:             Mixed, // Unknown yet
        envMapIntensity:    Number,
        refractionRatio:    Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        wireframeLinecap:   String,
        wireframeLinejoin:  String,
        skinning:           Boolean,
        morphTargets:       Boolean,
        morphNormals:       Boolean
    } );

}

function getModelFrom$1E ( Mongoose ) {

    if ( !_model$1E ) {
        _createModel$1E( Mongoose );
    }

    return _model$1E

}

function _createModel$1E ( Mongoose ) {

    const MaterialBaseModel = Material$9.getModelFrom( Mongoose );
    _model$1E                  = MaterialBaseModel.discriminator( 'MeshStandardMaterial', getSchemaFrom$1G( Mongoose ) );

}

function registerModelTo$1E ( Mongoose ) {

    if ( !_model$1E ) {
        _createModel$1E( Mongoose );
    }

    return Mongoose

}

var MeshStandardMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1G,
    getModelFrom:    getModelFrom$1E,
    registerModelTo: registerModelTo$1E
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$a } = Material;

let _schema$1H = undefined;
let _model$1F  = undefined;

function getSchemaFrom$1H ( Mongoose ) {

    if ( !_schema$1H ) {
        _createSchema$1H( Mongoose );
    }

    return _schema$1H

}

function _createSchema$1H ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Color   = Types.Color;
    const Vector2 = Types.Vector2;

    _schema$1H = new Schema( {
        // MeshPhongMaterial
        color:              Color,
        specular:           Color,
        shininess:          Number,
        map:                Mixed, // Unknown yet
        lightMap:           Mixed, // Unknown yet
        lightMapIntensity:  Number,
        aoMap:              Mixed, // Unknown yet
        aoMapIntensity:     Number,
        emissive:           Color,
        emissiveIntensity:  Number,
        emissiveMap:        Mixed, // Unknown yet
        bumpMap:            Mixed, // Unknown yet
        bumpScale:          Number,
        normalMap:          Mixed, // Unknown yet
        normalScale:        Vector2,
        displacementMap:    Mixed, // Unknown yet
        displacementScale:  Number,
        displacementBias:   Number,
        specularMap:        Mixed, // Unknown yet
        alphaMap:           Mixed, // Unknown yet
        envMap:             Mixed, // Unknown yet
        combine:            Number,
        reflectivity:       Number,
        refractionRatio:    Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        wireframeLinecap:   String,
        wireframeLinejoin:  String,
        skinning:           Boolean,
        morphTargets:       Boolean,
        morphNormals:       Boolean,

        // MeshToonMaterial
        gradientMap: Mixed
    } );

}

function getModelFrom$1F ( Mongoose ) {

    if ( !_model$1F ) {
        _createModel$1F( Mongoose );
    }

    return _model$1F

}

function _createModel$1F ( Mongoose ) {

    const MaterialBaseModel = Material$a.getModelFrom( Mongoose );
    _model$1F                  = MaterialBaseModel.discriminator( 'MeshToonMaterial', getSchemaFrom$1H( Mongoose ) );

}

function registerModelTo$1F ( Mongoose ) {

    if ( !_model$1F ) {
        _createModel$1F( Mongoose );
    }

    return Mongoose

}

var MeshToonMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1H,
    getModelFrom:    getModelFrom$1F,
    registerModelTo: registerModelTo$1F
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$b } = Material;

let _schema$1I = undefined;
let _model$1G  = undefined;

function getSchemaFrom$1I ( Mongoose ) {

    if ( !_schema$1I ) {
        _createSchema$1I( Mongoose );
    }

    return _schema$1I

}

function _createSchema$1I ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;
    const Mixed  = Types.Mixed;

    _schema$1I = new Schema( {
        color:           Color,
        map:             Mixed, // Unknown yet
        size:            Number,
        sizeAttenuation: Boolean,
        lights:          Boolean
    } );

}

function getModelFrom$1G ( Mongoose ) {

    if ( !_model$1G ) {
        _createModel$1G( Mongoose );
    }

    return _model$1G

}

function _createModel$1G ( Mongoose ) {

    const MaterialBaseModel = Material$b.getModelFrom( Mongoose );
    _model$1G                  = MaterialBaseModel.discriminator( 'PointsMaterial', getSchemaFrom$1I( Mongoose ) );

}

function registerModelTo$1G ( Mongoose ) {

    if ( !_model$1G ) {
        _createModel$1G( Mongoose );
    }

    return Mongoose

}

var PointsMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1I,
    getModelFrom:    getModelFrom$1G,
    registerModelTo: registerModelTo$1G
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$c } = Material;

let _schema$1J = undefined;
let _model$1H  = undefined;

function getSchemaFrom$1J ( Mongoose ) {

    if ( !_schema$1J ) {
        _createSchema$1J( Mongoose );
    }

    return _schema$1J

}

function _createSchema$1J ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$1J = new Schema( {
        // ShaderMaterial
        defines:            Mixed, // Unknown yet
        uniforms:           Mixed, // Unknown yet
        vertexShader:       String,
        fragmentShader:     String,
        linewidth:          Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        fog:                Boolean,
        light:              Boolean,
        clipping:           Boolean,
        skinning:           Boolean,
        morphTargets:       Boolean,
        morphNormals:       Boolean,
        derivatives:        Boolean,
        fragDepth:          Boolean,
        drawBuffers:        Boolean,
        shaderTextureLOD:   Boolean

        // What else...
    } );

}

function getModelFrom$1H ( Mongoose ) {

    if ( !_model$1H ) {
        _createModel$1H( Mongoose );
    }

    return _model$1H

}

function _createModel$1H ( Mongoose ) {

    const MaterialBaseModel = Material$c.getModelFrom( Mongoose );
    _model$1H                  = MaterialBaseModel.discriminator( 'RawShaderMaterial', getSchemaFrom$1J( Mongoose ) );

}

function registerModelTo$1H ( Mongoose ) {

    if ( !_model$1H ) {
        _createModel$1H( Mongoose );
    }

    return Mongoose

}

var RawShaderMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1J,
    getModelFrom:    getModelFrom$1H,
    registerModelTo: registerModelTo$1H
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$d } = Material;

let _schema$1K = undefined;
let _model$1I  = undefined;

function getSchemaFrom$1K ( Mongoose ) {

    if ( !_schema$1K ) {
        _createSchema$1K( Mongoose );
    }

    return _schema$1K

}

function _createSchema$1K ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$1K = new Schema( {
        defines:            Mixed, // Unknown yet
        uniforms:           Mixed, // Unknown yet
        vertexShader:       String,
        fragmentShader:     String,
        linewidth:          Number,
        wireframe:          Boolean,
        wireframeLinewidth: Number,
        fog:                Boolean,
        light:              Boolean,
        clipping:           Boolean,
        skinning:           Boolean,
        morphTargets:       Boolean,
        morphNormals:       Boolean,
        derivatives:        Boolean,
        fragDepth:          Boolean,
        drawBuffers:        Boolean,
        shaderTextureLOD:   Boolean
    } );

}

function getModelFrom$1I ( Mongoose ) {

    if ( !_model$1I ) {
        _createModel$1I( Mongoose );
    }

    return _model$1I

}

function _createModel$1I ( Mongoose ) {

    const MaterialBaseModel = Material$d.getModelFrom( Mongoose );
    _model$1I                  = MaterialBaseModel.discriminator( 'ShaderMaterial', getSchemaFrom$1K( Mongoose ) );

}

function registerModelTo$1I ( Mongoose ) {

    if ( !_model$1I ) {
        _createModel$1I( Mongoose );
    }

    return Mongoose

}

var ShaderMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1K,
    getModelFrom:    getModelFrom$1I,
    registerModelTo: registerModelTo$1I
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$e } = Material;

let _schema$1L = undefined;
let _model$1J  = undefined;

function getSchemaFrom$1L ( Mongoose ) {

    if ( !_schema$1L ) {
        _createSchema$1L( Mongoose );
    }

    return _schema$1L

}

function _createSchema$1L ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;

    _schema$1L = new Schema( {
        color:       Color,
        opacity:     Number,
        lights:      Boolean,
        transparent: Boolean
    } );

}

function getModelFrom$1J ( Mongoose ) {

    if ( !_model$1J ) {
        _createModel$1J( Mongoose );
    }

    return _model$1J

}

function _createModel$1J ( Mongoose ) {

    const MaterialBaseModel = Material$e.getModelFrom( Mongoose );
    _model$1J                  = MaterialBaseModel.discriminator( 'ShadowMaterial', getSchemaFrom$1L( Mongoose ) );

}

function registerModelTo$1J ( Mongoose ) {

    if ( !_model$1J ) {
        _createModel$1J( Mongoose );
    }

    return Mongoose

}

var ShadowMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1L,
    getModelFrom:    getModelFrom$1J,
    registerModelTo: registerModelTo$1J
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Material: Material$f } = Material;

let _schema$1M = undefined;
let _model$1K  = undefined;

function getSchemaFrom$1M ( Mongoose ) {

    if ( !_schema$1M ) {
        _createSchema$1M( Mongoose );
    }

    return _schema$1M

}

function _createSchema$1M ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;
    const Mixed  = Types.Mixed;

    _schema$1M = new Schema( {
        color:    Color,
        map:      Mixed, // Unknown yet
        rotation: Number,
        fog:      Boolean,
        lights:   Boolean
    } );

}

function getModelFrom$1K ( Mongoose ) {

    if ( !_model$1K ) {
        _createModel$1K( Mongoose );
    }

    return _model$1K

}

function _createModel$1K ( Mongoose ) {

    const MaterialBaseModel = Material$f.getModelFrom( Mongoose );
    _model$1K                  = MaterialBaseModel.discriminator( 'SpriteMaterial', getSchemaFrom$1M( Mongoose ) );

}

function registerModelTo$1K ( Mongoose ) {

    if ( !_model$1K ) {
        _createModel$1K( Mongoose );
    }

    return Mongoose

}

var SpriteMaterial_1 = {
    getSchemaFrom:   getSchemaFrom$1M,
    getModelFrom:    getModelFrom$1K,
    registerModelTo: registerModelTo$1K
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Core/Box2
 *
 * @description The database counterpart of Three.Box2
 */

let _schema$1N = undefined;

function getSchemaFrom$1N ( Mongoose ) {

    if ( !_schema$1N ) {
        _createSchema$1N( Mongoose );
    }

    return _schema$1N

}

function _createSchema$1N ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$1N = new Schema( {
        min: Vector2,
        max: Vector2
    }, {
        _id: false,
        id:  false
    } );

}

var Box2_1 = {
    getSchemaFrom:   getSchemaFrom$1N,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

let _schema$1O = undefined;

function getSchemaFrom$1O ( Mongoose ) {

    if ( !_schema$1O ) {
        _createSchema$1O( Mongoose );
    }

    return _schema$1O

}

function _createSchema$1O ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1O = new Schema( {
        min: Vector3,
        max: Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Box3_1 = {
    getSchemaFrom:   getSchemaFrom$1O,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Face3
 *
 * @description Todo...
 */

let _schema$1P = undefined;

function getSchemaFrom$1P ( Mongoose ) {

    if ( !_schema$1P ) {
        _createSchema$1P( Mongoose );
    }

    return _schema$1P

}

function _createSchema$1P ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1P = new Schema( {
        start: Vector3,
        end:   Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Line3_1 = {
    getSchemaFrom:   getSchemaFrom$1P,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Core/Vector3
 *
 * @description The database counterpart of Three.Vector3
 */

let _schema$1Q = undefined;

function getSchemaFrom$1Q ( Mongoose ) {

    if ( !_schema$1Q ) {
        _createSchema$1Q( Mongoose );
    }

    return _schema$1Q

}

function _createSchema$1Q ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1Q = new Schema( {
        normal:   Vector3,
        constant: Number
    }, {
        _id: false,
        id:  false
    } );

}

var Plane_1 = {
    getSchemaFrom:   getSchemaFrom$1Q,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Core/Vector3
 *
 * @description The database counterpart of Three.Vector3
 */

let _schema$1R = undefined;

function getSchemaFrom$1R ( Mongoose ) {

    if ( !_schema$1R ) {
        _createSchema$1R( Mongoose );
    }

    return _schema$1R

}

function _createSchema$1R ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1R = new Schema( {
        origin:    Vector3,
        direction: Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Ray_1 = {
    getSchemaFrom:   getSchemaFrom$1R,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Core/Vector3
 *
 * @description The database counterpart of Three.Vector3
 */

let _schema$1S = undefined;

function getSchemaFrom$1S ( Mongoose ) {

    if ( !_schema$1S ) {
        _createSchema$1S( Mongoose );
    }

    return _schema$1S

}

function _createSchema$1S ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1S = new Schema( {
        center: Vector3,
        radius: Number
    }, {
        _id: false,
        id:  false
    } );

}

var Sphere_1 = {
    getSchemaFrom:   getSchemaFrom$1S,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Core/Vector3
 *
 * @description The database counterpart of Three.Vector3
 */

let _schema$1T = undefined;

function getSchemaFrom$1T ( Mongoose ) {

    if ( !_schema$1T ) {
        _createSchema$1T( Mongoose );
    }

    return _schema$1T

}

function _createSchema$1T ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1T = new Schema( {
        radius: Number,
        phi:    Number,
        theta:  Number
    }, {
        _id: false,
        id:  false
    } );

}

var Spherical_1 = {
    getSchemaFrom:   getSchemaFrom$1T,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Core/Vector3
 *
 * @description The database counterpart of Three.Vector3
 */

let _schema$1U = undefined;

function getSchemaFrom$1U ( Mongoose ) {

    if ( !_schema$1U ) {
        _createSchema$1U( Mongoose );
    }

    return _schema$1U

}

function _createSchema$1U ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1U = new Schema( {
        a: Vector3,
        b: Vector3,
        c: Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Triangle_1 = {
    getSchemaFrom:   getSchemaFrom$1U,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$x } = Object3D$1;

let _schema$1V = undefined;
let _model$1L  = undefined;

function getSchemaFrom$1V ( Mongoose ) {

    if ( !_schema$1V ) {
        _createSchema$1V( Mongoose );
    }

    return _schema$1V

}

function _createSchema$1V ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1V = new Schema( {} );

}

function getModelFrom$1L ( Mongoose ) {

    if ( !_model$1L ) {
        _createModel$1L( Mongoose );
    }

    return _model$1L

}

function _createModel$1L ( Mongoose ) {

    const Object3DBaseModel = Object3D$x.getModelFrom( Mongoose );
    _model$1L                  = Object3DBaseModel.discriminator( 'Bone', getSchemaFrom$1V( Mongoose ) );

}

function registerModelTo$1L ( Mongoose ) {

    if ( !_model$1L ) {
        _createModel$1L( Mongoose );
    }

    return Mongoose

}

var Bone_1 = {
    getSchemaFrom:   getSchemaFrom$1V,
    getModelFrom:    getModelFrom$1L,
    registerModelTo: registerModelTo$1L
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

let _schema$1W = undefined;
let _model$1M  = undefined;

function getSchemaFrom$1W ( Mongoose ) {

    if ( !_schema$1W ) {
        _createSchema$1W( Mongoose );
    }

    return _schema$1W

}

function _createSchema$1W ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1W = new Schema( {} );

}

function getModelFrom$1M ( Mongoose ) {

    if ( !_model$1M ) {
        _createModel$1M( Mongoose );
    }

    return _model$1M

}

function _createModel$1M ( Mongoose ) {

    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
    _model$1M                  = Object3DBaseModel.discriminator( 'Group', getSchemaFrom$1W( Mongoose ) );

}

function registerModelTo$1M ( Mongoose ) {

    if ( !_model$1M ) {
        _createModel$1M( Mongoose );
    }

    return Mongoose

}

const Group = {
    getSchemaFrom:   getSchemaFrom$1W,
    getModelFrom:    getModelFrom$1M,
    registerModelTo: registerModelTo$1M
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$y } = Object3D$1;

let _schema$1X = undefined;
let _model$1N  = undefined;

function getSchemaFrom$1X ( Mongoose ) {

    if ( !_schema$1X ) {
        _createSchema$1X( Mongoose );
    }

    return _schema$1X

}

function _createSchema$1X ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1X = new Schema( {} );

}

function getModelFrom$1N ( Mongoose ) {

    if ( !_model$1N ) {
        _createModel$1N( Mongoose );
    }

    return _model$1N

}

function _createModel$1N ( Mongoose ) {

    const Object3DBaseModel = Object3D$y.getModelFrom( Mongoose );
    _model$1N                  = Object3DBaseModel.discriminator( 'ImmediateRenderObject', getSchemaFrom$1X( Mongoose ) );

}

function registerModelTo$1N ( Mongoose ) {

    if ( !_model$1N ) {
        _createModel$1N( Mongoose );
    }

    return Mongoose

}

var ImmediateRenderObject_1 = {
    getSchemaFrom:   getSchemaFrom$1X,
    getModelFrom:    getModelFrom$1N,
    registerModelTo: registerModelTo$1N
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$z } = Object3D$1;

let _schema$1Y = undefined;
let _model$1O  = undefined;

function getSchemaFrom$1Y ( Mongoose ) {

    if ( !_schema$1Y ) {
        _createSchema$1Y( Mongoose );
    }

    return _schema$1Y

}

function _createSchema$1Y ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;
    const Color    = Types.Color;
    const Vector3  = Types.Vector3;

    _schema$1Y = new Schema( {
        lensFlares: [
            {
                texture:  ObjectId,
                size:     Number,
                distance: Number,
                x:        Number,
                y:        Number,
                z:        Number,
                scale:    Number,
                rotation: Number,
                opacity:  Number,
                color:    Color,
                blending: Number
            }
        ],
        positionScreen: Vector3
    } );

}

function getModelFrom$1O ( Mongoose ) {

    if ( !_model$1O ) {
        _createModel$1O( Mongoose );
    }

    return _model$1O

}

function _createModel$1O ( Mongoose ) {

    const Object3DBaseModel = Object3D$z.getModelFrom( Mongoose );
    _model$1O                  = Object3DBaseModel.discriminator( 'LensFlare', getSchemaFrom$1Y( Mongoose ) );

}

function registerModelTo$1O ( Mongoose ) {

    if ( !_model$1O ) {
        _createModel$1O( Mongoose );
    }

    return Mongoose

}

var LensFlare = {
    getSchemaFrom:   getSchemaFrom$1Y,
    getModelFrom:    getModelFrom$1O,
    registerModelTo: registerModelTo$1O
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$A } = Object3D$1;

let _schema$1Z = undefined;
let _model$1P  = undefined;

function getSchemaFrom$1Z ( Mongoose ) {

    if ( !_schema$1Z ) {
        _createSchema$1Z( Mongoose );
    }

    return _schema$1Z

}

function _createSchema$1Z ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$1Z = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [
            {
                type: ObjectId,
                ref:  'LineBasicMaterial'
            }
        ],
        drawMode: Number
    } );

}

function getModelFrom$1P ( Mongoose ) {

    if ( !_model$1P ) {
        _createModel$1P( Mongoose );
    }

    return _model$1P

}

function _createModel$1P ( Mongoose ) {

    const Object3DBaseModel = Object3D$A.getModelFrom( Mongoose );
    _model$1P                  = Object3DBaseModel.discriminator( 'Line', getSchemaFrom$1Z( Mongoose ) );

}

function registerModelTo$1P ( Mongoose ) {

    if ( !_model$1P ) {
        _createModel$1P( Mongoose );
    }

    return Mongoose

}

var Line_1 = {
    getSchemaFrom:   getSchemaFrom$1Z,
    getModelFrom:    getModelFrom$1P,
    registerModelTo: registerModelTo$1P
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$B } = Object3D$1;

let _schema$1_ = undefined;
let _model$1Q  = undefined;

function getSchemaFrom$1_ ( Mongoose ) {

    if ( !_schema$1_ ) {
        _createSchema$1_( Mongoose );
    }

    return _schema$1_

}

function _createSchema$1_ ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$1_ = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [
            {
                type: ObjectId,
                ref:  'LineBasicMaterial'
            }
        ],
        drawMode: Number
    } );

}

function getModelFrom$1Q ( Mongoose ) {

    if ( !_model$1Q ) {
        _createModel$1Q( Mongoose );
    }

    return _model$1Q

}

function _createModel$1Q ( Mongoose ) {

    const Object3DBaseModel = Object3D$B.getModelFrom( Mongoose );
    _model$1Q                  = Object3DBaseModel.discriminator( 'LineLoop', getSchemaFrom$1_( Mongoose ) );

}

function registerModelTo$1Q ( Mongoose ) {

    if ( !_model$1Q ) {
        _createModel$1Q( Mongoose );
    }

    return Mongoose

}

var LineLoop_1 = {
    getSchemaFrom:   getSchemaFrom$1_,
    getModelFrom:    getModelFrom$1Q,
    registerModelTo: registerModelTo$1Q
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$C } = Object3D$1;

let _schema$1$ = undefined;
let _model$1R  = undefined;

function getSchemaFrom$1$ ( Mongoose ) {

    if ( !_schema$1$ ) {
        _createSchema$1$( Mongoose );
    }

    return _schema$1$

}

function _createSchema$1$ ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$1$ = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [
            {
                type: ObjectId,
                ref:  'LineBasicMaterial'
            }
        ],
        drawMode: Number
    } );

}

function getModelFrom$1R ( Mongoose ) {

    if ( !_model$1R ) {
        _createModel$1R( Mongoose );
    }

    return _model$1R

}

function _createModel$1R ( Mongoose ) {

    const Object3DBaseModel = Object3D$C.getModelFrom( Mongoose );
    _model$1R                  = Object3DBaseModel.discriminator( 'LineSegments', getSchemaFrom$1$( Mongoose ) );

}

function registerModelTo$1R ( Mongoose ) {

    if ( !_model$1R ) {
        _createModel$1R( Mongoose );
    }

    return Mongoose

}

var LineSegments_1 = {
    getSchemaFrom:   getSchemaFrom$1$,
    getModelFrom:    getModelFrom$1R,
    registerModelTo: registerModelTo$1R
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$D } = Object3D$1;

let _schema$20 = undefined;
let _model$1S  = undefined;

function getSchemaFrom$20 ( Mongoose ) {

    if ( !_schema$20 ) {
        _createSchema$20( Mongoose );
    }

    return _schema$20

}

function _createSchema$20 ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$20 = new Schema( {
        levels: [ Mixed ]
    } );

}

function getModelFrom$1S ( Mongoose ) {

    if ( !_model$1S ) {
        _createModel$1S( Mongoose );
    }

    return _model$1S

}

function _createModel$1S ( Mongoose ) {

    const Object3DBaseModel = Object3D$D.getModelFrom( Mongoose );
    _model$1S                  = Object3DBaseModel.discriminator( 'LOD', getSchemaFrom$20( Mongoose ) );

}

function registerModelTo$1S ( Mongoose ) {

    if ( !_model$1S ) {
        _createModel$1S( Mongoose );
    }

    return Mongoose

}

var LOD_1 = {
    getSchemaFrom:   getSchemaFrom$20,
    getModelFrom:    getModelFrom$1S,
    registerModelTo: registerModelTo$1S
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$E } = Object3D$1;

let _schema$21 = undefined;
let _model$1T  = undefined;

function getSchemaFrom$21 ( Mongoose ) {

    if ( !_schema$21 ) {
        _createSchema$21( Mongoose );
    }

    return _schema$21

}

function _createSchema$21 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$21 = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [
            {
                type: ObjectId,
                ref:  'Material'
            }
        ],
        drawMode: Number
    } );

}

function getModelFrom$1T ( Mongoose ) {

    if ( !_model$1T ) {
        _createModel$1T( Mongoose );
    }

    return _model$1T

}

function _createModel$1T ( Mongoose ) {

    const Object3DBaseModel = Object3D$E.getModelFrom( Mongoose );
    _model$1T                  = Object3DBaseModel.discriminator( 'Mesh', getSchemaFrom$21( Mongoose ) );

}

function registerModelTo$1T ( Mongoose ) {

    if ( !_model$1T ) {
        _createModel$1T( Mongoose );
    }

    return Mongoose

}

var Mesh_1 = {
    getSchemaFrom:   getSchemaFrom$21,
    getModelFrom:    getModelFrom$1T,
    registerModelTo: registerModelTo$1T
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$F } = Object3D$1;

let _schema$22 = undefined;
let _model$1U  = undefined;

function getSchemaFrom$22 ( Mongoose ) {

    if ( !_schema$22 ) {
        _createSchema$22( Mongoose );
    }

    return _schema$22

}

function _createSchema$22 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$22 = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [
            {
                type: ObjectId,
                ref:  'PointsMaterial'
            }
        ],
        drawMode: Number
    } );

}

function getModelFrom$1U ( Mongoose ) {

    if ( !_model$1U ) {
        _createModel$1U( Mongoose );
    }

    return _model$1U

}

function _createModel$1U ( Mongoose ) {

    const Object3DBaseModel = Object3D$F.getModelFrom( Mongoose );
    _model$1U                  = Object3DBaseModel.discriminator( 'Points', getSchemaFrom$22( Mongoose ) );

}

function registerModelTo$1U ( Mongoose ) {

    if ( !_model$1U ) {
        _createModel$1U( Mongoose );
    }

    return Mongoose

}

var Points_1 = {
    getSchemaFrom:   getSchemaFrom$22,
    getModelFrom:    getModelFrom$1U,
    registerModelTo: registerModelTo$1U
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$G } = Object3D$1;

let _schema$23 = undefined;
let _model$1V  = undefined;

function getSchemaFrom$23 ( Mongoose ) {

    if ( !_schema$23 ) {
        _createSchema$23( Mongoose );
    }

    return _schema$23

}

function _createSchema$23 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$23 = new Schema( {
        bones:        [ ObjectId ],
        boneMatrices: [ Number ] // Float32Array( this.bones.length * 16 )
    } );

}

function getModelFrom$1V ( Mongoose ) {

    if ( !_model$1V ) {
        _createModel$1V( Mongoose );
    }

    return _model$1V

}

function _createModel$1V ( Mongoose ) {

    const Object3DBaseModel = Object3D$G.getModelFrom( Mongoose );
    _model$1V                  = Object3DBaseModel.discriminator( 'Skeleton', getSchemaFrom$23( Mongoose ) );

}

function registerModelTo$1V ( Mongoose ) {

    if ( !_model$1V ) {
        _createModel$1V( Mongoose );
    }

    return Mongoose

}

var Skeleton_1 = {
    getSchemaFrom:   getSchemaFrom$23,
    getModelFrom:    getModelFrom$1V,
    registerModelTo: registerModelTo$1V
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$H } = Object3D$1;

let _schema$24 = undefined;
let _model$1W  = undefined;

function getSchemaFrom$24 ( Mongoose ) {

    if ( !_schema$24 ) {
        _createSchema$24( Mongoose );
    }

    return _schema$24

}

function _createSchema$24 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$24 = new Schema( {
        // Mesh
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [
            {
                type: ObjectId,
                ref:  'Material'
            }
        ],
        drawMode: Number,

        // SkinnedMesh
        bindMode:          String,
        bindMatrix:        [ Number ],
        bindMatrixInverse: [ Number ]

    } );

}

function getModelFrom$1W ( Mongoose ) {

    if ( !_model$1W ) {
        _createModel$1W( Mongoose );
    }

    return _model$1W

}

function _createModel$1W ( Mongoose ) {

    const Object3DBaseModel = Object3D$H.getModelFrom( Mongoose );
    _model$1W                  = Object3DBaseModel.discriminator( 'SkinnedMesh', getSchemaFrom$24( Mongoose ) );

}

function registerModelTo$1W ( Mongoose ) {

    if ( !_model$1W ) {
        _createModel$1W( Mongoose );
    }

    return Mongoose

}

var SkinnedMesh_1 = {
    getSchemaFrom:   getSchemaFrom$24,
    getModelFrom:    getModelFrom$1W,
    registerModelTo: registerModelTo$1W
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Object3D: Object3D$I } = Object3D$1;

let _schema$25 = undefined;
let _model$1X  = undefined;

function getSchemaFrom$25 ( Mongoose ) {

    if ( !_schema$25 ) {
        _createSchema$25( Mongoose );
    }

    return _schema$25

}

function _createSchema$25 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$25 = new Schema( {
        material: [
            {
                type: ObjectId,
                ref:  'SpriteMaterial'
            }
        ]
    } );

}

function getModelFrom$1X ( Mongoose ) {

    if ( !_model$1X ) {
        _createModel$1X( Mongoose );
    }

    return _model$1X

}

function _createModel$1X ( Mongoose ) {

    const Object3DBaseModel = Object3D$I.getModelFrom( Mongoose );
    _model$1X                  = Object3DBaseModel.discriminator( 'Sprite', getSchemaFrom$25( Mongoose ) );

}

function registerModelTo$1X ( Mongoose ) {

    if ( !_model$1X ) {
        _createModel$1X( Mongoose );
    }

    return Mongoose

}

var Sprite_1 = {
    getSchemaFrom:   getSchemaFrom$25,
    getModelFrom:    getModelFrom$1X,
    registerModelTo: registerModelTo$1X
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

let _schema$26 = undefined;

function getSchemaFrom$26 ( Mongoose ) {

    if ( !_schema$26 ) {
        _createSchema$26( Mongoose );
    }

    return _schema$26

}

function _createSchema$26 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$26 = new Schema( {
        coordinates: {
            x: Number,
            y: Number,
            z: Number
        },
        orientation: {
            x: Number,
            y: Number,
            z: Number
        },
        thumbnail: Buffer,
        path:      String
    }, {
        _id: false,
        id:  false
    } );

}

var Fog_1 = {
    getSchemaFrom:   getSchemaFrom$26,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

var Fog = {
	Fog: Fog_1
};

const { Object3D: Object3D$J } = Object3D$1;
const { Fog: Fog$1 }      = Fog;

let _schema$27 = undefined;
let _model$1Y  = undefined;

function getSchemaFrom$27 ( Mongoose ) {

    if ( !_schema$27 ) {
        _createSchema$27( Mongoose );
    }

    return _schema$27

}

function _createSchema$27 ( Mongoose ) {

    const FogSchema = Fog$1.getSchemaFrom( Mongoose );
    const Schema    = Mongoose.Schema;
    const Types     = Schema.Types;
    const Color     = Types.Color;

    _schema$27 = new Schema( {
        background:       Color,
        fog:              FogSchema,
        overrideMaterial: String,
        autoUpdate:       Boolean
    } );

}

function getModelFrom$1Y ( Mongoose ) {

    if ( !_model$1Y ) {
        _createModel$1Y( Mongoose );
    }

    return _model$1Y

}

function _createModel$1Y ( Mongoose ) {

    const Object3DBaseModel = Object3D$J.getModelFrom( Mongoose );
    _model$1Y                  = Object3DBaseModel.discriminator( 'Scene', getSchemaFrom$27( Mongoose ) );

}

function registerModelTo$1Y ( Mongoose ) {

    if ( !_model$1Y ) {
        _createModel$1Y( Mongoose );
    }

    return Mongoose

}

var Scene_1 = {
    getSchemaFrom: getSchemaFrom$27,
    getModelFrom: getModelFrom$1Y,
    registerModelTo: registerModelTo$1Y
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Geometry
 *
 * @description Todo...
 */

let _schema$28 = undefined;
let _model$1Z  = undefined;

function getSchemaFrom$28 ( Mongoose ) {

    if ( !_schema$28 ) {
        _createSchema$28( Mongoose );
    }

    return _schema$28

}

function _createSchema$28 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;
    const Vector2  = Types.Vector2;
    const Matrix3  = Types.Matrix3;

    _schema$28 = new Schema( {
            uuid:             String,
            name:             String,
            image:            ObjectId,
            mipmaps:          [],
            mapping:          Number,
            wrapS:            Number,
            wrapT:            Number,
            magFilter:        Number,
            minFilter:        Number,
            anisotropy:       Number,
            format:           Number,
            type:             Number,
            offset:           Vector2,
            repeat:           Vector2,
            center:           Vector2,
            rotation:         Number,
            matrixAutoUpdate: Boolean,
            matrix:           Matrix3,
            generateMipmaps:  Boolean,
            premultiplyAlpha: Boolean,
            flipY:            Boolean,
            unpackAlignment:  Number,
            encoding:         Number,
            version:          Number
        },
        {
            collection:       'textures',
            discriminatorKey: 'type'
        } );

}

function getModelFrom$1Z ( Mongoose ) {

    if ( !_model$1Z ) {
        _createModel$1Z( Mongoose );
    }

    return _model$1Z

}

function _createModel$1Z ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$1Z = Mongoose.model( 'Textures', getSchemaFrom$28( Mongoose ) );
    _model$1Z.discriminator( 'Texture', new Mongoose.Schema( {} ) );

}

function registerModelTo$1Z ( Mongoose ) {

    if ( !_model$1Z ) {
        _createModel$1Z( Mongoose );
    }

    return Mongoose

}

var Texture_1 = {
    getSchemaFrom: getSchemaFrom$28,
    getModelFrom: getModelFrom$1Z,
    registerModelTo: registerModelTo$1Z
};

var Texture = {
	Texture: Texture_1
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Texture: Texture$1 } = Texture;

let _schema$29 = undefined;
let _model$1_  = undefined;

function getSchemaFrom$29 ( Mongoose ) {

    if ( !_schema$29 ) {
        _createSchema$29( Mongoose );
    }

    return _schema$29

}

function _createSchema$29 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$29 = new Schema( {
        needsUpdate: Boolean
    } );

}

function getModelFrom$1_ ( Mongoose ) {

    if ( !_model$1_ ) {
        _createModel$1_( Mongoose );
    }

    return _model$1_

}

function _createModel$1_ ( Mongoose ) {

    const TextureBaseModel = Texture$1.getModelFrom( Mongoose );
    _model$1_                 = TextureBaseModel.discriminator( 'CanvasTexture', getSchemaFrom$29( Mongoose ) );

}

function registerModelTo$1_ ( Mongoose ) {

    if ( !_model$1_ ) {
        _createModel$1_( Mongoose );
    }

    return Mongoose

}

var CanvasTexture_1 = {
    getSchemaFrom:   getSchemaFrom$29,
    getModelFrom:    getModelFrom$1_,
    registerModelTo: registerModelTo$1_
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Texture: Texture$2 } = Texture;

let _schema$2a = undefined;
let _model$1$  = undefined;

function getSchemaFrom$2a ( Mongoose ) {

    if ( !_schema$2a ) {
        _createSchema$2a( Mongoose );
    }

    return _schema$2a

}

function _createSchema$2a ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$2a = new Schema( {} );

}

function getModelFrom$1$ ( Mongoose ) {

    if ( !_model$1$ ) {
        _createModel$1$( Mongoose );
    }

    return _model$1$

}

function _createModel$1$ ( Mongoose ) {

    const TextureBaseModel = Texture$2.getModelFrom( Mongoose );
    _model$1$                 = TextureBaseModel.discriminator( 'CompressedTexture', getSchemaFrom$2a( Mongoose ) );

}

function registerModelTo$1$ ( Mongoose ) {

    if ( !_model$1$ ) {
        _createModel$1$( Mongoose );
    }

    return Mongoose

}

var CompressedTexture_1 = {
    getSchemaFrom:   getSchemaFrom$2a,
    getModelFrom:    getModelFrom$1$,
    registerModelTo: registerModelTo$1$
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Texture: Texture$3 } = Texture;

let _schema$2b = undefined;
let _model$20  = undefined;

function getSchemaFrom$2b ( Mongoose ) {

    if ( !_schema$2b ) {
        _createSchema$2b( Mongoose );
    }

    return _schema$2b

}

function _createSchema$2b ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$2b = new Schema( {} );

}

function getModelFrom$20 ( Mongoose ) {

    if ( !_model$20 ) {
        _createModel$20( Mongoose );
    }

    return _model$20

}

function _createModel$20 ( Mongoose ) {

    const TextureBaseModel = Texture$3.getModelFrom( Mongoose );
    _model$20                 = TextureBaseModel.discriminator( 'CubeTexture', getSchemaFrom$2b( Mongoose ) );

}

function registerModelTo$20 ( Mongoose ) {

    if ( !_model$20 ) {
        _createModel$20( Mongoose );
    }

    return Mongoose

}

var CubeTexture_1 = {
    getSchemaFrom:   getSchemaFrom$2b,
    getModelFrom:    getModelFrom$20,
    registerModelTo: registerModelTo$20
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Texture: Texture$4 } = Texture;

let _schema$2c = undefined;
let _model$21  = undefined;

function getSchemaFrom$2c ( Mongoose ) {

    if ( !_schema$2c ) {
        _createSchema$2c( Mongoose );
    }

    return _schema$2c

}

function _createSchema$2c ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$2c = new Schema( {} );

}

function getModelFrom$21 ( Mongoose ) {

    if ( !_model$21 ) {
        _createModel$21( Mongoose );
    }

    return _model$21

}

function _createModel$21 ( Mongoose ) {

    const TextureBaseModel = Texture$4.getModelFrom( Mongoose );
    _model$21                 = TextureBaseModel.discriminator( 'DataTexture', getSchemaFrom$2c( Mongoose ) );

}

function registerModelTo$21 ( Mongoose ) {

    if ( !_model$21 ) {
        _createModel$21( Mongoose );
    }

    return Mongoose

}

var DataTexture_1 = {
    getSchemaFrom:   getSchemaFrom$2c,
    getModelFrom:    getModelFrom$21,
    registerModelTo: registerModelTo$21
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Texture: Texture$5 } = Texture;

let _schema$2d = undefined;
let _model$22  = undefined;

function getSchemaFrom$2d ( Mongoose ) {

    if ( !_schema$2d ) {
        _createSchema$2d( Mongoose );
    }

    return _schema$2d

}

function _createSchema$2d ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$2d = new Schema( {} );

}

function getModelFrom$22 ( Mongoose ) {

    if ( !_model$22 ) {
        _createModel$22( Mongoose );
    }

    return _model$22

}

function _createModel$22 ( Mongoose ) {

    const TextureBaseModel = Texture$5.getModelFrom( Mongoose );
    _model$22                 = TextureBaseModel.discriminator( 'DepthTexture', getSchemaFrom$2d( Mongoose ) );

}

function registerModelTo$22 ( Mongoose ) {

    if ( !_model$22 ) {
        _createModel$22( Mongoose );
    }

    return Mongoose

}

var DepthTexture_1 = {
    getSchemaFrom:   getSchemaFrom$2d,
    getModelFrom:    getModelFrom$22,
    registerModelTo: registerModelTo$22
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Texture: Texture$6 } = Texture;

let _schema$2e = undefined;
let _model$23  = undefined;

function getSchemaFrom$2e ( Mongoose ) {

    if ( !_schema$2e ) {
        _createSchema$2e( Mongoose );
    }

    return _schema$2e

}

function _createSchema$2e ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$2e = new Schema( {} );

}

function getModelFrom$23 ( Mongoose ) {

    if ( !_model$23 ) {
        _createModel$23( Mongoose );
    }

    return _model$23

}

function _createModel$23 ( Mongoose ) {

    const TextureBaseModel = Texture$6.getModelFrom( Mongoose );
    _model$23                 = TextureBaseModel.discriminator( 'VideoTexture', getSchemaFrom$2e( Mongoose ) );

}

function registerModelTo$23 ( Mongoose ) {

    if ( !_model$23 ) {
        _createModel$23( Mongoose );
    }

    return Mongoose

}

var VideoTexture_1 = {
    getSchemaFrom:   getSchemaFrom$2e,
    getModelFrom:    getModelFrom$23,
    registerModelTo: registerModelTo$23
};

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
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

function EulerType ( Mongoose ) {

    const SchemaType = Mongoose.SchemaType;
    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;

    // Declare type
    function Euler ( key, options ) {
        SchemaType.call( this, key, options, 'Euler' );
    }

    Euler.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Error( `Euler: ${value} is null or undefined` ) }
            if ( iteeValidators.isNotObject( value ) && !value.isEuler ) { throw new Error( `Euler: ${value} is not a object or Euler instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain x property' ) }
            if ( iteeValidators.isNotNumber( value.x ) ) { throw new Error( `Euler: ${value} expected x to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain y property' ) }
            if ( iteeValidators.isNotNumber( value.y ) ) { throw new Error( `Euler: ${value} expected y to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain z property' ) }
            if ( iteeValidators.isNotNumber( value.z ) ) { throw new Error( `Euler: ${value} expected z to be a number` ) }

            if ( !( 'order' in value ) ) { throw new Error( 'Euler: ' + value + ' does not contain order property' ) }
            if ( iteeValidators.isNotString( value.order ) ) { throw new Error( `Euler: ${value} expected order to be a string` ) }
            if ( ![
                'XYZ',
                'YZX',
                'ZXY',
                'XZY',
                'YXZ',
                'ZYX'
            ].includes( value.order.toUpperCase() ) ) { throw new Error( `Euler: ${value} expected order to be a string in ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX']` ) }

            return {
                x:     value.x,
                y:     value.y,
                z:     value.z,
                order: value.order.toUpperCase()
            }

        }

    } );

    // Register type
    Types.Euler = Euler;
    return Mongoose

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

function Matrix3Type ( Mongoose ) {

    const SchemaType = Mongoose.SchemaType;
    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;

    // Declare type
    function Matrix3 ( key, options ) {
        SchemaType.call( this, key, options, 'Matrix3' );
    }

    Matrix3.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Error( `Matrix3: ${value} is null or undefined` ) }
            if ( iteeValidators.isNotArray( value ) && !value.isMatrix3 ) { throw new Error( `Matrix3: ${value} is not a object or Matrix3 instance` ) }

            let result = undefined;
            if ( value.isMatrix3 ) {
                result = value.toArray();
            } else {
                result = value;
            }

            // Check number of values
            const numberOfValues = result.length;
            if ( numberOfValues !== 9 ) {
                throw new Error( `Matrix3: ${value} does not contain the right number of values. Expect 9 values and found ${numberOfValues}` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ];

                if ( iteeValidators.isNotNumber( val ) ) {
                    throw new Error( `Matrix3: ${value} does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( iteeValidators.isNaN( val ) ) {
                    throw new Error( `Matrix3: ${value} does not seem to contain right values. Expect values in range 0 and 1.` )
                }

            }

            return result

        }

    } );

    // Register type
    Types.Matrix3 = Matrix3;
    return Mongoose

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

function Matrix4Type ( Mongoose ) {

    const SchemaType = Mongoose.SchemaType;
    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;

    // Declare type
    function Matrix4 ( key, options ) {
        SchemaType.call( this, key, options, 'Matrix4' );
    }

    Matrix4.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Error( `Matrix4: ${value} is null or undefined` ) }
            if ( iteeValidators.isNotArray( value ) && !value.isMatrix4 ) { throw new Error( `Matrix4: ${value} is not a object or Matrix4 instance` ) }

            let result = undefined;
            if ( value.isMatrix4 ) {
                result = value.toArray();
            } else {
                result = value;
            }

            // Check number of values
            const numberOfValues = result.length;
            if ( numberOfValues !== 16 ) {
                throw new Error( `Matrix4: ${value} does not contain the right number of values. Expect 9 values and found ${numberOfValues}` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ];

                if ( iteeValidators.isNotNumber( val ) ) {
                    throw new Error( `Matrix4: ${value} does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( iteeValidators.isNaN( val ) ) {
                    throw new Error( `Matrix4: ${value} does not seem to contain right values. Expect values in range 0 and 1.` )
                }

            }

            return result

        }

    } );

    // Register type
    Types.Matrix4 = Matrix4;
    return Mongoose

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

function QuaternionType ( Mongoose ) {

    const SchemaType = Mongoose.SchemaType;
    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;

    // Declare type
    function Quaternion ( key, options ) {
        SchemaType.call( this, key, options, 'Quaternion' );
    }

    Quaternion.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Error( `Quaternion: ${value} is null or undefined` ) }
            //if ( isNotObject( value ) && !value.isQuaternion ) { throw new Error( `Quaternion: ${value} is not a object or Quaternion instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain x property' ) }
            if ( iteeValidators.isNotNumber( value.x ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain y property' ) }
            if ( iteeValidators.isNotNumber( value.y ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain z property' ) }
            if ( iteeValidators.isNotNumber( value.z ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain w property' ) }
            if ( iteeValidators.isNotNumber( value.w ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w
            }

        }

    } );

    // Register type
    Types.Quaternion = Quaternion;
    return Mongoose

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

function Vector2Type ( Mongoose ) {

    const SchemaType = Mongoose.SchemaType;
    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;

    // Declare type
    function Vector2 ( key, options ) {
        SchemaType.call( this, key, options, 'Vector2' );
    }

    Vector2.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Error( `Vector2: ${value} is null or undefined` ) }
            if ( iteeValidators.isNotObject( value ) && !value.isVector2 ) { throw new Error( `Vector2: ${value} is not a object or Vector2 instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Vector2: ' + value + ' does not contain x property' ) }
            if ( iteeValidators.isNotNumber( value.x ) ) { throw new Error( `Vector2: ${value} expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Vector2: ' + value + ' does not contain y property' ) }
            if ( iteeValidators.isNotNumber( value.y ) ) { throw new Error( `Vector2: ${value} expected to be a number` ) }

            return {
                x: value.x,
                y: value.y
            }

        }

    } );

    // Register type
    Types.Vector2 = Vector2;
    return Mongoose

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

function Vector3Type ( Mongoose ) {

    const SchemaType = Mongoose.SchemaType;
    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;

    // Declare type
    function Vector3 ( key, options ) {
        SchemaType.call( this, key, options, 'Vector3' );
    }

    Vector3.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Error( `Vector3: ${value} is null or undefined` ) }
            if ( iteeValidators.isNotObject( value ) && !value.isVector3 ) { throw new Error( `Vector3: ${value} is not a object or Vector3 instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Vector3: ' + value + ' does not contain x property' ) }
            if ( iteeValidators.isNotNumber( value.x ) ) { throw new Error( `Vector3: ${value} expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Vector3: ' + value + ' does not contain y property' ) }
            if ( iteeValidators.isNotNumber( value.y ) ) { throw new Error( `Vector3: ${value} expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( 'Vector3: ' + value + ' does not contain z property' ) }
            if ( iteeValidators.isNotNumber( value.z ) ) { throw new Error( `Vector3: ${value} expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z
            }

        }

    } );

    // Register type
    Types.Vector3 = Vector3;
    return Mongoose

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

function Vector4Type ( Mongoose ) {

    const SchemaType = Mongoose.SchemaType;
    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;

    // Declare type
    function Vector4 ( key, options ) {
        SchemaType.call( this, key, options, 'Vector4' );
    }

    Vector4.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( iteeValidators.isNotDefined( value ) ) { throw new Error( `Vector4: ${value} is null or undefined` ) }
            if ( iteeValidators.isNotObject( value ) && !value.isVector4 ) { throw new Error( `Vector4: ${value} is not a object or Vector4 instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Vector4: ' + value + ' does not contain x property' ) }
            if ( iteeValidators.isNotNumber( value.x ) ) { throw new Error( `Vector4: ${value} expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Vector4: ' + value + ' does not contain y property' ) }
            if ( iteeValidators.isNotNumber( value.y ) ) { throw new Error( `Vector4: ${value} expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( 'Vector4: ' + value + ' does not contain z property' ) }
            if ( iteeValidators.isNotNumber( value.z ) ) { throw new Error( `Vector4: ${value} expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Error( 'Vector4: ' + value + ' does not contain w property' ) }
            if ( iteeValidators.isNotNumber( value.w ) ) { throw new Error( `Vector4: ${value} expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w
            }

        }

    } );

    // Register type
    Types.Vector4 = Vector4;
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

/**
 * Three way to register Types and Schema
 * using cjs module under types and schemas folder.
 * using FunctionRegistrator for type and add to plugin using .addType( myFunctionRegistrator ), extending class AbstractMongooseRegistrator for Schema and add to plugin using .addSchema(
 * MySchemaRegistrator ) using direct registration importing mongoose in the file (care to the loading order ! An no output about what is registered.)
 */
var MongoDBThreePlugin = new iteeDatabase.TMongoDBPlugin()
    .addType( ColorType )
    .addType( EulerType )
    .addType( Matrix3Type )
    .addType( Matrix4Type )
    .addType( QuaternionType )
    .addType( Vector2Type )
    .addType( Vector3Type )
    .addType( Vector4Type )
    .addSchema( Audio_1 )
    .addSchema( AudioListener_1 )
    .addSchema( PositionalAudio_1 )
    .addSchema( ArrayCamera_1 )
    .addSchema( Camera_1 )
    .addSchema( CubeCamera_1 )
    .addSchema( OrthographicCamera_1 )
    .addSchema( PerspectiveCamera_1 )
    .addSchema( BufferAttribute_1 )
    .addSchema( BufferGeometry_1 )
    .addSchema( CurvePath_1 )
    .addSchema( Face3_1 )
    .addSchema( Geometry )
    .addSchema( Object3D )
    .addSchema( Path_1 )
    .addSchema( Shape_1 )
    .addSchema( ArcCurve_1 )
    .addSchema( CatmullRomCurve3_1 )
    .addSchema( CubicBezierCurve_1 )
    .addSchema( CubicBezierCurve3_1 )
    .addSchema( Curve_1 )
    .addSchema( CurveExtras_1 )
    .addSchema( EllipseCurve_1 )
    .addSchema( LineCurve_1 )
    .addSchema( LineCurve3_1 )
    .addSchema( NURBSCurve_1 )
    .addSchema( NURBSSurface_1 )
    .addSchema( QuadraticBezierCurve_1 )
    .addSchema( QuadraticBezierCurve3_1 )
    .addSchema( SplineCurve_1 )
    .addSchema( BoxBufferGeometry_1 )
    .addSchema( BoxGeometry_1 )
    .addSchema( CircleBufferGeometry_1 )
    .addSchema( CircleGeometry_1 )
    .addSchema( ConeBufferGeometry_1 )
    .addSchema( ConeGeometry_1 )
    .addSchema( ConvexGeometry_1 )
    .addSchema( CylinderBufferGeometry_1 )
    .addSchema( CylinderGeometry_1 )
    .addSchema( DecalGeometry_1 )
    .addSchema( DodecahedronGeometry_1 )
    .addSchema( EdgesGeometry_1 )
    .addSchema( ExtrudeBufferGeometry_1 )
    .addSchema( ExtrudeGeometry_1 )
    .addSchema( IcosahedronBufferGeometry_1 )
    .addSchema( IcosahedronGeometry_1 )
    .addSchema( InstancedBufferGeometry_1 )
    .addSchema( LatheBufferGeometry_1 )
    .addSchema( LatheGeometry_1 )
    .addSchema( OctahedronBufferGeometry_1 )
    .addSchema( OctahedronGeometry_1 )
    .addSchema( ParametricBufferGeometry_1 )
    .addSchema( ParametricGeometry_1 )
    .addSchema( PlaneBufferGeometry_1 )
    .addSchema( PlaneGeometry_1 )
    .addSchema( PolyhedronBufferGeometry_1 )
    .addSchema( PolyhedronGeometry_1 )
    .addSchema( RingBufferGeometry_1 )
    .addSchema( RingGeometry_1 )
    .addSchema( ShapeBufferGeometry_1 )
    .addSchema( ShapeGeometry_1 )
    .addSchema( SphereBufferGeometry_1 )
    .addSchema( SphereGeometry_1 )
    .addSchema( TeapotBufferGeometry )
    .addSchema( TetrahedronBufferGeometry_1 )
    .addSchema( TetrahedronGeometry_1 )
    .addSchema( TextBufferGeometry_1 )
    .addSchema( TextGeometry_1 )
    .addSchema( TorusBufferGeometry_1 )
    .addSchema( TorusGeometry_1 )
    .addSchema( TorusKnotBufferGeometry_1 )
    .addSchema( TorusKnotGeometry_1 )
    .addSchema( TubeBufferGeometry_1 )
    .addSchema( TubeGeometry_1 )
    .addSchema( WireframeGeometry_1 )
    .addSchema( ArrowHelper_1 )
    .addSchema( AxesHelper_1 )
    .addSchema( Box3Helper_1 )
    .addSchema( BoxHelper_1 )
    .addSchema( CameraHelper_1 )
    .addSchema( DirectionalLightHelper_1 )
    .addSchema( FaceNormalsHelper_1 )
    .addSchema( GridHelper_1 )
    .addSchema( HemisphereLightHelper_1 )
    .addSchema( PlaneHelper_1 )
    .addSchema( PointLightHelper_1 )
    .addSchema( PolarGridHelper_1 )
    .addSchema( RectAreaLightHelper_1 )
    .addSchema( SkeletonHelper_1 )
    .addSchema( SpotLightHelper_1 )
    .addSchema( VertexNormalsHelper_1 )
    .addSchema( AmbientLight_1 )
    .addSchema( DirectionalLight_1 )
    //    .addSchema( DirectionalLightShadow )
    .addSchema( HemisphereLight_1 )
    .addSchema( Light_1 )
    //    .addSchema( LightShadow )
    .addSchema( PointLight_1 )
    .addSchema( RectAreaLight_1 )
    .addSchema( SpotLight_1 )
    //    .addSchema( SpotLightShadow )
    .addSchema( MeshPhongMaterial_1 )
    .addSchema( LineBasicMaterial_1 )
    .addSchema( LineDashedMaterial_1 )
    .addSchema( Material_1 )
    .addSchema( MeshBasicMaterial_1 )
    .addSchema( MeshDepthMaterial_1 )
    .addSchema( MeshLambertMaterial_1 )
    .addSchema( MeshNormalMaterial_1 )
    .addSchema( MeshPhysicalMaterial_1 )
    .addSchema( MeshStandardMaterial_1 )
    .addSchema( MeshToonMaterial_1 )
    .addSchema( PointsMaterial_1 )
    .addSchema( RawShaderMaterial_1 )
    .addSchema( ShaderMaterial_1 )
    .addSchema( ShadowMaterial_1 )
    .addSchema( SpriteMaterial_1 )
    .addSchema( Box2_1 )
    .addSchema( Box3_1 )
    //    .addSchema( ColorConverter )
    //    .addSchema( Cylindrical )
    //    .addSchema( Frustum )
    //    .addSchema( Interpolant )
    .addSchema( Line3_1 )
    //    .addSchema( Lut )
    //    .addSchema( Math )
    .addSchema( Plane_1 )
    .addSchema( Ray_1 )
    .addSchema( Sphere_1 )
    .addSchema( Spherical_1 )
    .addSchema( Triangle_1 )
    .addSchema( Bone_1 )
    //    .addSchema( Car )
    //    .addSchema( GPUParticleSystem )
    .addSchema( Group )
    //    .addSchema( Gyroscope )
    .addSchema( ImmediateRenderObject_1 )
    .addSchema( LensFlare )
    .addSchema( Line_1 )
    .addSchema( LineLoop_1 )
    .addSchema( LineSegments_1 )
    .addSchema( LOD_1 )
    //    .addSchema( MarchingCubes )
    //    .addSchema( MD2Character )
    //    .addSchema( MD2CharacterComplex )
    .addSchema( Mesh_1 )
    //    .addSchema( MorphAnimMesh )
    //    .addSchema( MorphBlendMesh )
    //    .addSchema( Ocean )
    .addSchema( Points_1 )
    //    .addSchema( Reflector )
    //    .addSchema( ReflectorRTT )
    //    .addSchema( Refractor )
    //    .addSchema( RollerCoaster )
    //    .addSchema( ShadowMesh )
    .addSchema( Skeleton_1 )
    .addSchema( SkinnedMesh_1 )
    //    .addSchema( Sky )
    .addSchema( Sprite_1 )
    //    .addSchema( UCSCharacter )
    //    .addSchema( Water )
    //    .addSchema( Water2 )
    .addSchema( Fog_1 )
    //    .addSchema( FogExp2 )
    .addSchema( Scene_1 )
    .addSchema( CanvasTexture_1 )
    .addSchema( CompressedTexture_1 )
    .addSchema( CubeTexture_1 )
    .addSchema( DataTexture_1 )
    .addSchema( DepthTexture_1 )
    .addSchema( Texture_1 )
    .addSchema( VideoTexture_1 )
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
