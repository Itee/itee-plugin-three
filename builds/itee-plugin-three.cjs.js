console.log('Itee.Plugin.Three v1.6.0 - CommonJs')
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var iteeDatabase = require('itee-database');
var iteeMongodb = require('itee-mongodb');
var require$$0$3 = require('itee-validators');
var threeFull = require('three-full');
var iteeClient = require('itee-client');
var iteeCore = require('itee-core');
var iteeUtils = require('itee-utils');
var bson = require('bson');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$3);

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @see [IFC Standard]{@link http://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/}
 *
 */

class TObjects3DController extends iteeMongodb.TMongooseController {

    constructor ( parameters = {} ) {
        super( parameters );
    }

    /**
     * Read one document based on a model type, and a object query that match.
     * If the given type or query are null or undefined it return null.
     *
     * @param {String} type - The Mongoose Model type on which read query must be perform
     * @param {Object} query - The find conditions to match document
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    /**
     * Read one document based on a model type, and a object query that match.
     * If the given type or query are null or undefined it return null.
     *
     * @param {String} type - The Mongoose Model type on which read query must be perform
     * @param {Object} query - The find conditions to match document
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _readOneDocument ( type, query ) {
        if ( require$$0$3.isNotDefined( type ) || require$$0$3.isNotDefined( query ) ) { return null }

        const model = await this._driver
                                .model( type )
                                .findOne( query )
                                .exec();

        return ( require$$0$3.isDefined( model ) ) ? model._doc : null

    }

    // Todo: Rename to _readDocuments
    /**
     * Read all document based on a model type, and a object query that match.
     * If the given type or query are null or undefined it return null.
     *
     * @param {String} type - The Mongoose Model type on which read query must be perform
     * @param {Object} query - The find conditions to match document
     * @returns {Promise<Array<Mongoose.Document|null>>|null}
     * @private
     */
    async _readManyDocument ( type, query, projection ) {
        if ( require$$0$3.isNotDefined( type ) || require$$0$3.isNotDefined( query ) ) { return null }

        let models = await this._driver
                               .model( type )
                               .find( query, projection )
                               .lean()
                               .exec();

        return models.map( model => model._doc )
    }

    /**
     * Update a database document based on given updateQuery and queryOptions.
     * If the given document is null or undefined it return null.
     *
     * @param {Mongoose.Document} document - The document to update
     * @param {Object} updateQuery - @see {@link https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate}
     * @param {Object} queryOptions - @see {@link https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate}
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _updateDocument ( document, updateQuery, queryOptions ) {

        if ( require$$0$3.isNotDefined( document ) ) {
            return null
        }

        const result = await this._driver
                                 .model( document.type )
                                 .findByIdAndUpdate( document._id, updateQuery, queryOptions )
                                 .exec();

        return result
    }

    async getAllChildrenIds ( parentId, recursive = false ) {

        const result              = {
            children:   [],
            geometries: [],
            materials:  []
        };
        const subChildrenPromises = [];
        const children            = await this._readManyDocument( 'Objects3D', { parent: parentId }, {
            _id:      true,
            geometry: true,
            material: true,
            children: true
        } );
        for ( let childIndex = 0, numberOfChildren = children.length ; childIndex < numberOfChildren ; childIndex++ ) {

            const child   = children[ childIndex ];
            const childId = child._id.toString();

            if ( require$$0$3.isDefined( childId ) ) {
                result.children.push( childId );
            }

            const childGeometry = child.geometry;
            if ( require$$0$3.isDefined( childGeometry ) ) {
                result.geometries.push( childGeometry.toString() );
            }

            const childMaterials = child.material;
            if ( childMaterials ) {
                const _materials = require$$0$3.isArray( childMaterials ) ? childMaterials.map( mat => mat.toString() ) : [ childMaterials.toString() ];
                result.materials.push( ..._materials );
            }

            const subChildren = child.children;
            if ( subChildren ) {
                const subChildrenPromise = this.getAllChildrenIds( childId, recursive );
                subChildrenPromises.push( subChildrenPromise );
            }

        }

        // Merge children results
        if ( subChildrenPromises.length > 0 ) {

            const promisesResults = await Promise.all( subChildrenPromises );
            for ( let resultIndex = 0, numberOfResults = promisesResults.length ; resultIndex < numberOfResults ; resultIndex++ ) {
                const promisesResult = promisesResults[ resultIndex ];
                result.children.push( ...promisesResult.children );
                result.geometries.push( ...promisesResult.geometries );
                result.materials.push( ...promisesResult.materials );
            }

        }


        return result

    }

    async _deleteOne ( id, response ) {

        try {

            const alternative = [ 'oneByOne', 'allInOneByParentId', 'allInOneByChildrenIds' ][ 1 ];
            if ( alternative === 'oneByOne' ) ; else if ( alternative === 'allInOneByParentId' ) {

                const results = await this.getAllChildrenIds( id, true );
                results.children.push( id );

                const cleanResults = {
                    children:   [ ...new Set( results.children ) ],
                    geometries: [ ...new Set( results.geometries ) ],
                    materials:  [ ...new Set( results.materials ) ]
                };

                //                const deletedObjectsCount     = await this._deleteDocuments( 'Objects3D', cleanResults.children )
                //                const deletedGeometriesResult = await this._deleteDocuments( 'Geometries', cleanResults.geometries )
                //                const deletedMaterialsResult  = await this._deleteDocuments( 'Materials', cleanResults.materials )

                const [ deletedObjectsCount, deletedGeometriesResult, deletedMaterialsResult ] = await Promise.all( [
                    this._deleteDocuments( 'Objects3D', cleanResults.children ),
                    this._deleteDocuments( 'Geometries', cleanResults.geometries ),
                    this._deleteDocuments( 'Materials', cleanResults.materials )
                ] );

                iteeMongodb.TMongooseController.returnData( {
                    deletedObjectsCount,
                    deletedGeometriesResult,
                    deletedMaterialsResult
                }, response );

            } else ;

        } catch ( error ) {

            iteeMongodb.TMongooseController.returnError( error, response );

        }

    }

    async _deleteDocuments ( type, documentIds ) {
        if ( require$$0$3.isEmptyArray( documentIds ) ) { return 0 }

        const deleteResult = await this._driver
                                       .model( type )
                                       .deleteMany( {
                                           _id: {
                                               $in: documentIds
                                           }
                                       } )
                                       .exec();

        return deleteResult.deletedCount

    }

    /**
     * Update a database document based on given updateQuery and queryOptions.
     * If the given document is null or undefined it return null.
     *
     * @param {Mongoose.Document} document - The document to delete
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _deleteDocument ( document ) {
        if ( require$$0$3.isNotDefined( document ) ) { return null }

        //        console.log( `Delete: ${ document.name } [${ document._id }]` )

        const deleteResult = await this._driver
                                       .model( document.type )
                                       .findByIdAndDelete( document._id )
                                       .exec();

        return ( deleteResult && deleteResult._doc ) ? deleteResult._doc._id : null

    }

    ///

    async _removeParentReference ( document ) {
        const parentId = document.parent;
        if ( require$$0$3.isNotDefined( parentId ) ) { return null }

        const parentDocument         = await this._readOneDocument( 'Objects3D', { _id: parentId } );
        const childrenIds            = parentDocument.children;
        const indexOfCurrentDocument = childrenIds.indexOf( document._id );
        childrenIds.splice( indexOfCurrentDocument, 1 );

        const updateResult = await this._updateDocument( parentDocument, {
            $set: {
                children: childrenIds
            }
        } );

        return updateResult
    }

    /**
     * Remove documents in safe and recursive way over children, and others referenced objects.
     *
     * @param {Array<Mongoose.Document>} documents - The documents to deletes
     * @returns {Promise<Array<void>>}
     * @private
     */
    async _removeChildrenDocuments ( documents ) {

        let removed = [];
        for ( let childIndex = documents.length - 1 ; childIndex >= 0 ; childIndex-- ) {
            removed.push( this._removeChildDocument( documents[ childIndex ] ) );
        }
        return Promise.all( removed )

    }

    /**
     * Remove a document from database after remove his children and other related stuff like geometry, materials etc...
     *
     * @param {Mongoose.Document} document - The document to delete
     * @returns {Promise<void>}
     * @private
     */
    async _removeChildDocument ( document ) {

        // Remove children recursively
        const children        = await this._readManyDocument( 'Objects3D', { parent: document._id } );
        const childrenResults = await this._removeChildrenDocuments( children );

        // Remove geometry only if current object is the last that reference it
        const geometryResult = await this._removeOrphanGeometryWithId( document.geometry );

        // Remove material only if current object is the last that reference it
        const materialsResult = await this._removeOrphanMaterialsWithIds( document.material || [] );

        // finally remove the incriminated document
        const documentResult = await this._deleteDocument( document );

        return {
            object:    documentResult,
            children:  childrenResults,
            geometry:  geometryResult,
            materials: materialsResult
        }

    }

    /**
     * Remove geometry only in case it is orphan and no object still reference it.
     *
     * @param {Mongoose.ObjectId|String} geometryId - The geometry id to match for deletion
     * @returns {Promise<void>}
     * @private
     */
    async _removeOrphanGeometryWithId ( geometryId ) {
        if ( require$$0$3.isNotDefined( geometryId ) ) { return }

        const referencingObjects = await this._readManyDocument( 'Objects3D', { geometry: geometryId } );
        if ( referencingObjects.length > 1 ) { return }

        const geometryDocument = await this._readOneDocument( 'Geometries', { _id: geometryId } );
        const deleteResult     = await this._deleteDocument( geometryDocument );

        return deleteResult
    }

    // Remove only orphan materials
    /**
     * Remove materials only in case they are orphan and no objects still reference them.
     *
     * @param {Array<Mongoose.ObjectId|String>} materialsIds - The materials ids to match for deletion
     * @returns {Promise<Array<void>>}
     * @private
     */
    async _removeOrphanMaterialsWithIds ( materialsIds ) {
        if ( require$$0$3.isNotDefined( materialsIds ) ) { return }
        if ( require$$0$3.isEmptyArray( materialsIds ) ) { return }

        const removed = [];
        for ( let index = 0, numberOfMaterials = materialsIds.length ; index < numberOfMaterials ; index++ ) {
            removed.push( this._removeOrphanMaterialWithId( materialsIds[ index ] ) );
        }

        return Promise.all( removed )

    }

    /**
     * Remove material only in case it is orphan and no object still reference it.
     *
     * @param {Mongoose.ObjectId|String} materialsIds - The material id to match for deletion
     * @returns {Promise<void>}
     * @private
     */
    async _removeOrphanMaterialWithId ( materialId ) {
        if ( require$$0$3.isNotDefined( materialId ) ) { return }

        const referencingObjects = await this._readManyDocument( 'Objects3D', { material: materialId } );
        if ( referencingObjects.length > 1 ) { return }

        const materialDocument = await this._readOneDocument( 'Materials', { _id: materialId } );
        const deleteResult     = await this._deleteDocument( materialDocument );
        return deleteResult
    }

}

/**
 * @module Converters/ColladaToThree
 * @desc Export JsonToThree converter class about .dae files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { ColladaLoader }          from 'three-full/sources/loaders/ColladaLoader'

/**
 * This class allow to convert .dae files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class ColladaToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {ArrayBuffer} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new threeFull.ColladaLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @module Loader/DBFLoader
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * From:
 * https://www.clicketyclick.dk/databases/xbase/format/db2_dbf.html#DBII_DBF_STRUCT
 * http://web.archive.org/web/20150323061445/http://ulisse.elettra.trieste.it/services/doc/dbase/DBFstruct.htm
 * http://www.dbase.com/Knowledgebase/INT/db7_file_fmt.htm
 *
 *
 */

/**
 *
 * @type {Object}
 */
const DBFVersion = iteeUtils.toEnum( {
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
const DataType = iteeUtils.toEnum( {
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
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class DBFLoader {

    //    static Terminator    = 0x0D
    //    static DeletedRecord = 0x1A
    //    static YearOffset    = 1900

    /**
     *
     * @param manager
     * @param logger
     * @constructor
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                manager: threeFull.DefaultLoadingManager,
                logger:  iteeCore.DefaultLogger,
                reader:  new iteeClient.TBinaryReader()
            }, ...parameters
        };

        this.manager = _parameters.manager;
        this.logger  = _parameters.logger;
        this.reader  = _parameters.reader;

    }

    get manager () {
        return this._manager
    }

    set manager ( value ) {
        this._manager = value;
    }

    get logger () {
        return this._logger
    }

    set logger ( value ) {
        this._logger = value;
    }

    get reader () {
        return this._reader
    }

    set reader ( value ) {
        this._reader = value;
    }

    setManager ( value ) {
        this.manager = value;
        return this
    }

    setLogger ( value ) {
        this.logger = value;
        return this
    }

    setReader ( value ) {
        this.reader = value;
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

        const scope = this;

        const loader = new threeFull.FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    }

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
            this.logger.error( `DBFLoader: Invalid version number: ${ version }` );
            return null
        }

        const header = this._parseHeader( version );
        const datas  = this._parseDatas( version, header );

        return {
            header,
            datas
        }

    }

    /**
     *
     * @param version
     * @return {boolean}
     * @private
     */
    _isValidVersion ( version ) {

        return DBFVersion.includes( version )

    }

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
                throw new RangeError( `Invalid version parameter: ${ version }` )

        }

        // Check terminator
        if ( this.reader.getUint8() !== DBFLoader.Terminator ) {
            this.logger.error( 'DBFLoader: Invalid terminator after field descriptors !!!' );
        }

        return header

    }

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

    }

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

    }

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

    }

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

    }

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
                        throw new RangeError( `Invalid data type parameter: ${ field.type }` )

                }

            }

            records.push( record );

        }

        return records

    }

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

    }

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

    }

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

    }

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

}

DBFLoader.Terminator    = 0x0D;
DBFLoader.DeletedRecord = 0x1A;
DBFLoader.YearOffset    = 1900;

/**
 * @module Converters/DbfToThree
 * @desc Export JsonToThree converter class about .dbf files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link module:Loader/DBFLoader Loader/DBFLoader}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * This class allow to convert .dbf files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class DbfToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( { dumpType: iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {ArrayBuffer} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
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
 * @module Converters/FbxToThree
 * @desc Export JsonToThree converter class about .fbx files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { FBXLoader }              from 'three-full/sources/loaders/FBXLoader'

/**
 * This class allow to convert .fbx files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class FbxToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {ArrayBuffer} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new threeFull.FBXLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @module Converters/JsonToThree
 * @desc Export JsonToThree converter class about .json files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { ObjectLoader }           from 'three-full/sources/loaders/ObjectLoader'

/**
 * This class allow to convert .json files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class JsonToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.JSON
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {JSON} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
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
 * @module Converters/MtlToThree
 * @desc Export JsonToThree converter class about .mtl files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { MTLLoader }              from 'three-full/sources/loaders/MTLLoader'

/**
 * This class allow to convert .mtl files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class MtlToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.String
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {String} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
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
 * @module Converters/Obj2ToThree
 * @desc Export JsonToThree converter class about .obj files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { OBJLoader2 }             from 'three-full/sources/loaders/OBJLoader2'

/**
 * This class allow to convert .obj files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class Obj2ToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.JSON
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {JSON} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
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

/**
 *
 * @type {Object}
 */
const ShapeType = iteeUtils.toEnum( {
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
                manager:      threeFull.DefaultLoadingManager,
                logger:       iteeCore.DefaultLogger,
                reader:       new iteeClient.TBinaryReader(),
                globalOffset: new threeFull.Vector3( 0, 0, 0 ),
                worldAxis:    {
                    from: 'zUp',
                    to:   'zForward'
                }
            }, ...parameters
        };

        this.manager      = _parameters.manager;
        this.logger       = _parameters.logger;
        this.reader       = _parameters.reader;
        this.globalOffset = _parameters.globalOffset;
        this.worldAxis    = _parameters.worldAxis;

    }

    get globalOffset () {
        return this._globalOffset
    }

    set globalOffset ( value ) {
        this._globalOffset = value;
    }

    get worldAxis () {
        return this._worldAxis
    }

    set worldAxis ( value ) {
        this._worldAxis = value;
    }

    get manager () {
        return this._manager
    }

    set manager ( value ) {
        this._manager = value;
    }

    get logger () {
        return this._logger
    }

    set logger ( value ) {
        this._logger = value;
    }

    get reader () {
        return this._reader
    }

    set reader ( value ) {
        this._reader = value;
    }

    setGlobalOffset ( value ) {
        this.globalOffset = value;
        return this
    }

    setWorldAxis ( value ) {
        this.worldAxis = value;
        return this
    }

    setManager ( value ) {
        this.manager = value;
        return this
    }

    setLogger ( value ) {
        this.logger = value;
        return this
    }

    setReader ( value ) {
        this.reader = value;
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

        const scope = this;

        const loader = new threeFull.FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    }

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

    }

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

    }

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
                    this.logger.error( `SHPLoader: Invalid switch parameter: ${ header.shapeType }` );
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

        this._reader.setEndianess( iteeClient.Endianness.Big );

        const recordNumber  = this._reader.getInt32();
        const contentLength = this._reader.getInt32();

        return {
            recordNumber,
            contentLength
        }

    }

    _parseNull () {

        this._reader.getInt32();
        return null

    }

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

    }

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

    }

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

            if ( iteeUtils.ringClockwise( ring ) ) {

                polygons.push( ring );
                //					polygons.push( [ ring ] );

            } else {

                holes.push( ring );

            }

        } );

        holes.forEach( hole => {

            polygons.some( polygon => {

                if ( iteeUtils.ringContainsSome( polygon[ 0 ], hole ) ) {
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

    }

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

    }

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

    }

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

}

SHPLoader.FileCode      = 9994;
SHPLoader.MinFileLength = 100;
SHPLoader.MinVersion    = 1000;

/**
 * @module Converters/ShpToThree
 * @desc Export JsonToThree converter class about .shp files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link module:Loader/SHPLoader Loader/SHPLoader}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * This class allow to convert .shp files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class ShpToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {ArrayBuffer} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
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
 * @module Converters/StlToThree
 * @desc Export JsonToThree converter class about .stl files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { STLLoader }              from 'three-full/sources/loaders/STLLoader'

/**
 * This class allow to convert .shp files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class StlToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.JSON
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @param {JSON} data - The dumped data to convert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {onSuccessCallback} onSuccess - A callback that will handle the parsed result
     * @param {onProgressCallback} onProgress - A callback that will handle the parsing progress
     * @param {onErrorCallback} onError - A callback that will handle the parsing errors
     * @return {Object}
     * @private
     */
    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new threeFull.STLLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @module Converters/TdsToThree
 * @desc Export JsonToThree converter class about .3ds files

 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { TDSLoader }              from 'three-full/sources/loaders/TDSLoader'

/**
 * This class allow to convert .3ds files into ThreeJs types
 *
 * @class
 * @augments TAbstractFileConverter
 */
class TdsToThree extends iteeDatabase.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor () {
        super( {
            dumpType: iteeDatabase.TAbstractFileConverter.DumpType.ArrayBuffer
        } );
    }

    /**
     * This private method will run the convertion of data into ThreeJs common stuff
     *
     * @private
     * @param {File} data - The file descriptor to load and convert
     * @param {Object} parameters
     * @param {callback} onSuccess A callback that will handle the parsed result
     * @param {callback} onProgress A callback that will handle the parsing progress
     * @param {callback} onError A callback that will handle the parsing errors
     * @return {Object}
     */
    _convert ( data, parameters, onSuccess, onProgress, onError ) {
        super._convert( data, parameters, onSuccess, onProgress, onError );

        try {

            const loader    = new threeFull.TDSLoader();
            const threeData = loader.parse( data );
            onSuccess( threeData );

        } catch ( error ) {

            onError( error );

        }

    }

}

/**
 * @module Inserters/ThreeToMongoDB
 * @desc Export ThreeToMongoDB mongodb inserter class.
 *
 * @requires {@link https://github.com/Itee/itee-client itee-client}
 * @requires {@link https://github.com/Itee/itee-database itee-database}
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * This class allow to insert ThreeJs stuff in MongoDB database.
 *
 * @class
 * @augments TAbstractDataInserter
 */
class ThreeToMongoDB extends iteeDatabase.TAbstractDataInserter {

    // Utils
    static _toLog ( object ) {

        return JSON.stringify( {
            type: object.type || 'undefined',
            name: object.name || 'undefined',
            uuid: object.uuid || 'undefined',
            id:   object._id || 'undefined'
        } )

    }
    /**
     * @constructor
     * @param {Object} [parameters={}] - An object containing all parameters to pass through the inheritance chain and for initialize this instance
     * @param {TLogger} [parameters.logger=Itee.Core.DefaultLogger]
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                logger: iteeCore.DefaultLogger
            }, ...parameters
        };
        super( _parameters );

        this.logger        = _parameters.logger;
        this.mergeStrategy = 'add';

        this._cache = {};

        // Addition
        // Update
        // Deletion

        // Add objects from file if missing in database
        // Remove objects from database if missing in file
        // Update objects in database if existing in file

    }
    /**
     * Main entry point to insert data into database; It apply merge strategy over data to insert.
     *
     * @param {Object} data - The ThreeJs data to insert
     * @param {Object} parameters - A parameters map that contain parsing options
     * @param {String} [parameters.mergeStrategy=add] - The merging strategy to apply during insert process
     * @param {callback} onSuccess - A callback that will handle the parsed result
     * @param {callback} onProgress - A callback that will handle the parsing progress
     * @param {callback} onError - A callback that will handle the parsing errors
     * @returns {Promise<void>}
     * @private
     */
    async _save ( data, parameters, onSuccess, onProgress, onError ) {

        const dataToParse = iteeUtils.toArray( data );
        if ( require$$0$3.isEmptyArray( dataToParse ) ) {
            onError( 'No data to save in database. Abort insert !' );
            return
        }

        const names = dataToParse.map( _data => _data.name );
        this.logger.log( `ThreeToMongoDB: Saving ${ names }` );

        // Check startegy
        if ( parameters.mergeStrategy ) {
            this.mergeStrategy = parameters.mergeStrategy;
        }

        try {

            // Check if parent is required
            const parentId  = parameters.parentId;
            let children    = null;
            let childrenIds = null;
            if ( require$$0$3.isDefined( parentId ) ) {

                const parentDocument = await this._readDocument( 'Objects3D', { _id: parentId } );
                if ( require$$0$3.isNull( parentDocument ) ) {
                    onError( `Unable to retrieve parent with id (${ parameters.parentId }). Abort insert !` );
                    return
                }

                // then update it
                if ( this.mergeStrategy === 'add' ) {

                    // If parent exist let create children
                    children    = await this._parseObjects( dataToParse, parentId );
                    childrenIds = ( require$$0$3.isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

                    // Add children to given parent
                    await this._updateDocument( parentDocument, {
                        $addToSet: {
                            children: childrenIds
                        }
                    } );

                } else if ( this.mergeStrategy === 'replace' ) {

                    // Merge children into parent
                    //// Clean up current dbObject dependencies
                    // Children create and update will be perform on children iteration but remove need to be checked here !
                    const dbChildren         = await this._readDocuments( 'Objects3D', { parent: parentId } );
                    const childrenUuids      = dataToParse.map( child => child.uuid );
                    const dbChildrenToRemove = dbChildren.filter( dbChild => !childrenUuids.includes( dbChild.uuid ) );

                    await this._removeChildrenDocuments( dbChildrenToRemove );

                    // If parent exist let create children
                    children    = await this._parseObjects( dataToParse, parentId );
                    childrenIds = ( require$$0$3.isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

                    await this._updateDocument( parentDocument, {
                        $set: {
                            children: childrenIds
                        }
                    } );

                }

            } else {

                // If not required just create children as root objects
                children    = await this._parseObjects( dataToParse, null );
                childrenIds = ( require$$0$3.isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

            }

            this.logger.log( `ThreeToMongoDB: Saved ${ childrenIds }` );
            onSuccess();

        } catch ( error ) {
            onError( error );
        } finally {
            this._cache = {};
        }

    }

    /**
     * Allow to parse multiple objects on parallel.
     * In case objects is not an array it will be converted to it before any processing.
     * If the given array is empty it return null.
     *
     * @param {Object|Array<Object>} [objects=[]] - The objects to parse
     * @param {String} [parentId=null] - The mongodb parent id to apply to current objects
     * @returns {Promise<Array<Mongoose.Query|null>>|null}
     * @private
     */
    async _parseObjects ( objects = [], parentId = null ) {
        this.logger.debug( `_parseObjects(...)` );

        const _objects = iteeUtils.toArray( objects );
        if ( require$$0$3.isEmptyArray( _objects ) ) {
            return null
        }

        const documents = [];
        for ( let index = 0, numberOfObjects = _objects.length ; index < numberOfObjects ; index++ ) {
            documents.push( this._parseObject( _objects[ index ], parentId ) );
        }

        return Promise.all( documents )

    }

    /**
     * Allow to parse one object. In function of the mergingStrategy it will perform any database CRUD operation.
     *
     * @param {Object} objects - The object to parse
     * @param {String} [parentId=null] - The mongodb parent id to apply to current object
     * @returns {Promise<Mongoose.Query|null>|null}
     * @private
     */
    async _parseObject ( object, parentId = null ) {
        this.logger.debug( `_parseObject(${ ThreeToMongoDB._toLog( object ) }, ${ parentId })` );

        if ( require$$0$3.isNotDefined( object ) ) {
            return null
        }

        // Preprocess objects here to save geometry, materials and related before to save the object itself
        const objectType      = object.type;
        const objectName      = object.name;
        const objectGeometry  = object.geometry;
        const objectChildren  = iteeUtils.toArray( object.children );
        const objectMaterials = iteeUtils.toArray( object.material );

        // If it is a terminal object ( No children ) with an empty geometry
        if ( require$$0$3.isDefined( objectGeometry ) && require$$0$3.isEmptyArray( objectChildren ) ) {

            if ( objectGeometry.isGeometry ) {

                const vertices = objectGeometry.vertices;
                if ( require$$0$3.isNotDefined( vertices ) || require$$0$3.isEmptyArray( vertices ) ) {
                    this.logger.error( `Leaf object ${ objectName } have a geometry that doesn't contain vertices ! Skip it.` );
                    return null
                }

            } else if ( objectGeometry.isBufferGeometry ) {

                const attributes = objectGeometry.attributes;
                if ( require$$0$3.isNotDefined( attributes ) ) {
                    this.logger.error( `Buffer geometry of ${ objectName } doesn't contain attributes ! Skip it.` );
                    return null
                }

                const positions = attributes.position;
                if ( require$$0$3.isNotDefined( positions ) || positions.count === 0 ) {
                    this.logger.error( `Leaf object ${ objectName } have a buffer geometry that doesn't contain position attribute ! Skip it.` );
                    return null
                }

            } else {
                this.logger.error( `Object ${ objectName } contain an unknown/unmanaged geometry of type ${ objectGeometry.type } ! Skip it.` );
                return null
            }

        }

        let availableMaterialTypes = null;

        if ( ThreeToMongoDB.AvailableLineTypes.includes( objectType ) ) {

            if ( require$$0$3.isNotDefined( objectGeometry ) ) {
                this.logger.error( `Missing geometry for object ${ object.name } of type ${ objectType }. Only Sprite can contains material without geometry ! Skip it.` );
                return null
            }

            availableMaterialTypes = ThreeToMongoDB.AvailableLineMaterialTypes;

        } else if ( ThreeToMongoDB.AvailablePointTypes.includes( objectType ) ) {

            if ( require$$0$3.isNotDefined( objectGeometry ) ) {
                this.logger.error( `Missing geometry for object ${ object.name } of type ${ objectType }. Only Sprite can contains material without geometry ! Skip it.` );
                return null
            }

            availableMaterialTypes = ThreeToMongoDB.AvailablePointMaterialTypes;

        } else if ( ThreeToMongoDB.AvailableSpriteTypes.includes( objectType ) ) {

            availableMaterialTypes = ThreeToMongoDB.AvailableSpriteMaterialTypes;

        }

        if ( availableMaterialTypes ) {

            for ( let materialIndex = 0, numberOfMaterials = objectMaterials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                const material     = objectMaterials[ materialIndex ];
                const materialType = material.type;
                if ( !availableMaterialTypes.includes( materialType ) ) {
                    this.logger.error( `Object ${ objectName } of type ${ objectType }, contain an invalid material of type ${ materialType } ! Skip it.` );
                    return null
                }

            }

        }

        const geometry   = await this._getOrCreateDocuments( objectGeometry );
        const geometryId = ( require$$0$3.isDefined( geometry ) ) ? geometry.filter( geometry => geometry ).map( geometry => geometry._id ).pop() : null;

        const materials    = await this._getOrCreateDocuments( objectMaterials );
        const materialsIds = ( require$$0$3.isDefined( materials ) ) ? materials.filter( material => material ).map( material => material._id ) : [];

        // Check if object already exist
        // We could use getOrCreateDocument here only if children/geometry/materials cleanup is perform on schema database side
        let document = await this._readDocument( objectType, {
            uuid:   object.uuid,
            parent: parentId
        } );

        // Todo if document.parent != parentId warn id collision !n m
        if ( require$$0$3.isDefined( document ) ) {

            // Check merge strategie
            // If add, only update existing and create new objects
            // else if replace, remove missings children from new data, update existing and create new
            if ( this.mergeStrategy === 'add' ) {

                const children    = await this._parseObjects( objectChildren, document._id );
                const childrenIds = ( require$$0$3.isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

                await this._updateDocument( document, {
                    $addToSet: {
                        children: childrenIds // geometry: geometryId, // Geometry is not an array !!
                        // material: materialsIds // Should check which material still exist !!!
                    }
                } );

            } else if ( this.mergeStrategy === 'replace' ) {

                //// Clean up current dbObject dependencies
                // Children create and update will be perform on children iteration but remove need to be checked here !
                const dbChildren         = await this._readDocuments( 'Objects3D', { parent: document._id } );
                const childrenUuids      = objectChildren.map( child => child.uuid );
                const dbChildrenToRemove = dbChildren.filter( dbChild => !childrenUuids.includes( dbChild.uuid ) );

                await this._removeChildrenDocuments( dbChildrenToRemove );

                const children    = await this._parseObjects( objectChildren, document._id );
                const childrenIds = ( require$$0$3.isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

                await this._updateDocument( document, {
                    $set: {
                        children: childrenIds,
                        geometry: geometryId,
                        material: materialsIds
                    }
                } );

            } else {
                this.logger.error( `Unknown/Unmanaged merge srategy ${ this.mergeStrategy }` );
            }

        } else {

            object.parent   = parentId;
            object.children = [];
            object.geometry = geometryId;
            object.material = materialsIds;
            document        = await this._createDocument( object );

            const children    = await this._parseObjects( objectChildren, document._id );
            const childrenIds = ( require$$0$3.isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

            await this._updateDocument( document, {
                $set: {
                    children: childrenIds,
                    geometry: geometryId,
                    material: materialsIds
                }
            } );

        }

        return document

    }

    /**
     * Allow to update or create multiple objects on parallel. It create object only if it does not exist in database, else it perform an update based on given data.
     * In case objects parameter is not an array it will be converted to it before any processing.
     * If the given array is empty it return null.
     *
     * @param {Object|Array<Object>} [objects=[]] - The objects to updates or creates if not exist
     * @returns {Promise<Array<Mongoose.Document|null>>|null}
     * @private
     */
    async _getOrCreateDocuments ( objects = [] ) {
        this.logger.debug( `_getOrCreateDocuments(...)` );

        const _objects = iteeUtils.toArray( objects );
        if ( require$$0$3.isEmptyArray( _objects ) ) {
            return null
        }

        const documents = [];
        for ( let index = 0, numberOfObjects = _objects.length ; index < numberOfObjects ; index++ ) {
            documents.push( this._getOrCreateDocument( _objects[ index ] ) );
        }

        return Promise.all( documents )

    }

    // Todo: Rename to _updateOrCreateDocument
    /**
     * Update or create an object. It create object only if it does not exist in database, else it perform an update based on given data.
     * If the given data is null or undefined it return null.
     *
     * @param {Object} data - The data to update or create if not exist
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _getOrCreateDocument ( data ) {
        this.logger.debug( `_getOrCreateDocument(${ ThreeToMongoDB._toLog( data ) })` );

        if ( require$$0$3.isNotDefined( data ) ) {
            return null
        }

        let document = await this._readDocument( data.type, { uuid: data.uuid } );
        if ( require$$0$3.isDefined( document ) ) {
            document = await this._updateDocument( document, data );
        } else {
            document = await this._createDocument( data );
        }

        return document

    }

    /**
     * Create new database entries based on given datas.
     * In case datas parameter is not an array it will be converted to it before any processing.
     * If the given array is empty it return null.
     *
     * @param {Object|Array<Object>} [datas=[]] - The objects to creates
     * @returns {Promise<Array<Mongoose.Document|null>>|null}
     * @private
     */
    async _createDocuments ( datas = [] ) {
        this.logger.debug( `_createDocuments(...)` );

        const _datas = iteeUtils.toArray( datas );
        if ( require$$0$3.isEmptyArray( _datas ) ) {
            return null
        }

        const documents = [];
        for ( let index = 0, numberOfDocuments = _datas.length ; index < numberOfDocuments ; index++ ) {
            documents.push( this._createDocument( _datas[ index ] ) );
        }

        return Promise.all( documents )

    }

    /**
     * Create new database entry based on given data.
     * If the given data is null or undefined it return null.
     *
     * @param {Object} data - The object to create
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _createDocument ( data ) {
        this.logger.debug( `_createDocument(${ ThreeToMongoDB._toLog( data ) })` );

        if ( require$$0$3.isNotDefined( data ) ) {
            return null
        }

        const model = await this._driver
                                .model( data.type )( data )
                                .save();

        //        const model         = this._driver.model( data.type )
        //        const savedModel = await model( data ).save()

        const savedDocument = ( require$$0$3.isDefined( model ) ) ? model._doc : null;
        if ( savedDocument ) {
            this._cache[ savedDocument.uuid ] = savedDocument;
        }

        return savedDocument

    }

    /**
     * Read all document based on a model type, and a object query that match.
     * If the given type or query are null or undefined it return null.
     *
     * @param {String} type - The Mongoose Model type on which read query must be perform
     * @param {Object} query - The find conditions to match document
     * @returns {Promise<Array<Mongoose.Document|null>>|null}
     * @private
     */
    async _readDocuments ( type, query ) {
        this.logger.debug( `_readDocuments(...)` );

        if ( require$$0$3.isNotDefined( type ) || require$$0$3.isNotDefined( query ) ) {
            return null
        }

        let models = await this._driver
                               .model( type )
                               .find( query )
                               .exec();

        return models.map( model => model._doc )
    }

    /**
     * Read one document based on a model type, and a object query that match.
     * If the given type or query are null or undefined it return null.
     *
     * @param {String} type - The Mongoose Model type on which read query must be perform
     * @param {Object} query - The find conditions to match document
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _readDocument ( type, query ) {
        this.logger.debug( `_readDocument(${ type }, ${ JSON.stringify( query ) })` );

        if ( require$$0$3.isNotDefined( type ) || require$$0$3.isNotDefined( query ) ) {
            return null
        }

        const cachedDocument = this._cache[ query.uuid ];
        if ( cachedDocument ) {
            return cachedDocument
        }

        const model = await this._driver
                                .model( type )
                                .findOne( query )
                                .exec();

        const readDocument = ( require$$0$3.isDefined( model ) ) ? model._doc : null;
        if ( readDocument ) {
            this._cache[ readDocument.uuid ] = readDocument;
        }

        return readDocument
    }

    /**
     * Update database entries based on given datas.
     * In case documents parameter is not an array it will be converted to it before any processing.
     * If the given array is empty it return null.
     *
     * @param {Array<Mongoose.Document>|Mongoose.Document} documents - The documents to updates
     * @param {Object} updateQuery - @see {@link https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate}
     * @param {Object} queryOptions - @see {@link https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate}
     * @returns {Promise<Array<Mongoose.Document|null>>|null}
     * @private
     */
    async _updateDocuments ( documents = [], updateQuery, queryOptions ) {
        this.logger.debug( `_updateDocuments(...)` );

        const _documents = iteeUtils.toArray( documents );
        if ( require$$0$3.isEmptyArray( _documents ) ) {
            return null
        }

        const updates = [];
        for ( let index = 0, numberOfDocuments = _documents.length ; index < numberOfDocuments ; index++ ) {
            updates.push( this._updateDocument( _documents[ index ], updateQuery, queryOptions ) );
        }

        return Promise.all( updates )

    }

    /**
     * Update a database document based on given updateQuery and queryOptions.
     * If the given document is null or undefined it return null.
     *
     * @param {Mongoose.Document} document - The document to update
     * @param {Object} updateQuery - @see {@link https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate}
     * @param {Object} queryOptions - @see {@link https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate}
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _updateDocument ( document, updateQuery, queryOptions = { new: true } ) {
        this.logger.debug( `_updateDocument(${ ThreeToMongoDB._toLog( document ) }, ${ JSON.stringify( updateQuery ) }, ${ JSON.stringify( queryOptions ) })` );

        if ( require$$0$3.isNotDefined( document ) ) {
            return null
        }

        const model = await this._driver
                                .model( document.type )
                                .findByIdAndUpdate( document._id, updateQuery, queryOptions )
                                .exec();

        const updatedDocument = ( require$$0$3.isDefined( model ) ) ? model._doc : null;
        if ( updatedDocument ) {
            this._cache[ updatedDocument.uuid ] = updatedDocument;
        }

        return updatedDocument
    }

    /**
     * Delete database entries based on given documents.
     * In case documents parameter is not an array it will be converted to it before any processing.
     * If the given array is empty it return null.
     *
     * @param {Array<Mongoose.Document>|Mongoose.Document} documents - The documents to deletes
     * @returns {Promise<Array<Mongoose.Document|null>>|null}
     * @private
     */
    async _deleteDocuments ( documents = [] ) {
        this.logger.debug( `_deleteDocuments(...)` );

        const _documents = iteeUtils.toArray( documents );
        if ( require$$0$3.isEmptyArray( _documents ) ) {
            return null
        }

        const deletes = [];
        for ( let index = 0, numberOfDocuments = _documents.length ; index < numberOfDocuments ; index++ ) {
            deletes.push( this._deleteDocument( _documents[ index ] ) );
        }

        return Promise.all( deletes )

    }

    /**
     * Update a database document based on given updateQuery and queryOptions.
     * If the given document is null or undefined it return null.
     *
     * @param {Mongoose.Document} document - The document to delete
     * @returns {Promise<Mongoose.Document|null>|null}
     * @private
     */
    async _deleteDocument ( document ) {
        this.logger.debug( `_deleteDocument(${ ThreeToMongoDB._toLog( document ) })` );

        if ( require$$0$3.isNotDefined( document ) ) {
            return null
        }

        const model = await this._driver
                                .model( document.type )
                                .findByIdAndDelete( document._id )
                                .exec();

        const deletedDocument = ( require$$0$3.isDefined( model ) ) ? model._doc : null;
        if ( deletedDocument ) {
            delete this._cache[ deletedDocument.uuid ];
        }

        return deletedDocument
    }

    ///
    /**
     * Remove documents in safe and recursive way over children, and others referenced objects.
     *
     * @param {Array<Mongoose.Document>} documents - The documents to deletes
     * @returns {Promise<Array<void>>}
     * @private
     */
    async _removeChildrenDocuments ( documents ) {
        this.logger.debug( `_removeChildrenDocuments(...)` );

        let removed = [];
        for ( let childIndex = documents.length - 1 ; childIndex >= 0 ; childIndex-- ) {
            removed.push( this._removeChildDocument( documents[ childIndex ] ) );
        }
        return Promise.all( removed )

    }

    /**
     * Remove a document from database after remove his children and other related stuff like geometry, materials etc...
     *
     * @param {Mongoose.Document} document - The document to delete
     * @returns {Promise<void>}
     * @private
     */
    async _removeChildDocument ( document ) {
        this.logger.debug( `_removeChildDocument(${ ThreeToMongoDB._toLog( document ) })` );

        // Remove children recursively
        const children = await this._readDocuments( 'Objects3D', { parent: document._id } );
        await this._removeChildrenDocuments( children );

        // Remove geometry only if current object is the last that reference it
        await this._removeOrphanGeometryWithId( document.geometry );

        // Remove material only if current object is the last that reference it
        await this._removeOrphanMaterialsWithIds( document.material || [] );

        // finally remove the incriminated document
        await this._deleteDocument( document );

    }

    /**
     * Remove geometry only in case it is orphan and no object still reference it.
     *
     * @param {Mongoose.ObjectId|String} geometryId - The geometry id to match for deletion
     * @returns {Promise<void>}
     * @private
     */
    async _removeOrphanGeometryWithId ( geometryId ) {
        this.logger.debug( `_removeOrphanGeometryWithId(${ geometryId })` );

        if ( require$$0$3.isNotDefined( geometryId ) ) { return }

        const referencingObjects = await this._readDocuments( 'Objects3D', { geometry: geometryId } );
        if ( referencingObjects.length > 1 ) { return }

        const geometryDocument = await this._readDocument( 'Geometries', { _id: geometryId } );
        await this._deleteDocument( geometryDocument );

    }

    // Remove only orphan materials
    /**
     * Remove materials only in case they are orphan and no objects still reference them.
     *
     * @param {Array<Mongoose.ObjectId|String>} materialsIds - The materials ids to match for deletion
     * @returns {Promise<Array<void>>}
     * @private
     */
    async _removeOrphanMaterialsWithIds ( materialsIds ) {
        this.logger.debug( `_removeOrphanMaterialsWithIds(...)` );

        const removed = [];
        for ( let index = 0, numberOfMaterials = materialsIds.length ; index < numberOfMaterials ; index++ ) {
            removed.push( this._removeOrphanMaterialWithId( materialsIds[ index ] ) );
        }

        return Promise.all( removed )

    }

    /**
     * Remove material only in case it is orphan and no object still reference it.
     *
     * @param {Mongoose.ObjectId|String} materialsIds - The material id to match for deletion
     * @returns {Promise<void>}
     * @private
     */
    async _removeOrphanMaterialWithId ( materialId ) {
        this.logger.debug( `_removeOrphanMaterialWithId(${ materialId })` );

        const referencingObjects = await this._readDocuments( 'Objects3D', { material: materialId } );
        if ( referencingObjects.length > 1 ) { return }

        const materialDocument = await this._readDocument( 'Materials', { _id: materialId } );
        await this._deleteDocument( materialDocument );

    }

}

/**
 * Allow to check if Materials correspond to expected Mesh type
 * @type {string[]}
 */
// Todo: Find a way to validate this on schema
ThreeToMongoDB.AvailableCurveTypes = [
    'Curve',
    'ArcCurve',
    'CatmullRomCurve3',
    'CubicBezierCurve',
    'CubicBezierCurve3',
    'EllipseCurve',
    'LineCurve',
    'LineCurve3',
    'QuadraticBezierCurve',
    'QuadraticBezierCurve3',
    'SplineCurve',
    'CurvePath',
    'Path',
    'Shape'
];
ThreeToMongoDB.AvailableLineTypes           = [ 'Line', 'LineLoop', 'LineSegments' ];
ThreeToMongoDB.AvailableLineMaterialTypes   = [ 'LineBasicMaterial', 'LineDashedMaterial' ];
ThreeToMongoDB.AvailablePointTypes          = [ 'Points' ];
ThreeToMongoDB.AvailablePointMaterialTypes  = [ 'PointsMaterial' ];
ThreeToMongoDB.AvailableSpriteTypes         = [ 'Sprite' ];
ThreeToMongoDB.AvailableSpriteMaterialTypes = [ 'SpriteMaterial' ];

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Object3D
 *
 * @description Todo...
 */

function Object3D$I () {}

Object3D$I.getSchemaFrom   = Mongoose => {

    if ( !Object3D$I._schema ) {
        Object3D$I._createSchema( Mongoose );
    }

    return Object3D$I._schema

};
Object3D$I._createSchema   = Mongoose => {

    const Schema     = Mongoose.Schema;
    const Types      = Schema.Types;
    const ObjectId   = Types.ObjectId;
    const Mixed      = Types.Mixed;
    const Vector3    = Types.Vector3;
    const Quaternion = Types.Quaternion;
    const Matrix4    = Types.Matrix4;
    const Euler      = Types.Euler;

    Object3D$I._schema = new Schema( {
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
            set:  value => value.mask
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
Object3D$I.getModelFrom    = Mongoose => {

    if ( !Object3D$I._model ) {
        Object3D$I._createModel( Mongoose );
    }

    return Object3D$I._model

};
Object3D$I._createModel    = Mongoose => {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    // Care here, the model contains an S char, not the discriminator !
    Object3D$I._model = Mongoose.model( 'Objects3D', Object3D$I.getSchemaFrom( Mongoose ) );
    Object3D$I._model.discriminator( 'Object3D', new Mongoose.Schema( {} ) );

};
Object3D$I.registerModelTo = Mongoose => {

    if ( !Object3D$I._model ) {
        Object3D$I._createModel( Mongoose );
    }

    return Mongoose

};
Object3D$I._schema         = null;
Object3D$I._model          = null;

var Object3D$J = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Object3D: Object3D$I
});

var require$$0$2 = /*@__PURE__*/getAugmentedNamespace(Object3D$J);

/**
 * @module Schemas/Audio/Audio
 * @desc Export the ThreeJs Audio Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$H } = require$$0$2;

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

    const Object3DBaseModel = Object3D$H.getModelFrom( Mongoose );
    _model$23                  = Object3DBaseModel.discriminator( 'Audio', getSchemaFrom$2e( Mongoose ) );

}

function registerModelTo$23 ( Mongoose ) {

    if ( !_model$23 ) {
        _createModel$23( Mongoose );
    }

    return Mongoose

}


var Audio_1 = {
    name:            'Audio',
    getSchemaFrom:   getSchemaFrom$2e,
    getModelFrom:    getModelFrom$23,
    registerModelTo: registerModelTo$23
};

/**
 * @module Schemas/Audio/AudioListener
 * @desc Export the ThreeJs AudioListener Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$G } = require$$0$2;

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

    const Object3DBaseModel = Object3D$G.getModelFrom( Mongoose );
    _model$22                  = Object3DBaseModel.discriminator( 'AudioListener', getSchemaFrom$2d( Mongoose ) );

}

function registerModelTo$22 ( Mongoose ) {

    if ( !_model$22 ) {
        _createModel$22( Mongoose );
    }

    return Mongoose

}

var AudioListener_1 = {
    name:            'AudioListener',
    getSchemaFrom:   getSchemaFrom$2d,
    getModelFrom:    getModelFrom$22,
    registerModelTo: registerModelTo$22
};

/**
 * @module Schemas/Audio/PositionalAudio
 * @desc Export the ThreeJs PositionalAudio Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$F } = require$$0$2;

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

    const Object3DBaseModel = Object3D$F.getModelFrom( Mongoose );
    _model$21                  = Object3DBaseModel.discriminator( 'PositionalAudio', getSchemaFrom$2c( Mongoose ) );

}

function registerModelTo$21 ( Mongoose ) {

    if ( !_model$21 ) {
        _createModel$21( Mongoose );
    }

    return Mongoose

}

var PositionalAudio_1 = {
    name:            'PositionalAudio',
    getSchemaFrom:   getSchemaFrom$2c,
    getModelFrom:    getModelFrom$21,
    registerModelTo: registerModelTo$21
};

/**
 * @module Schemas/Camera/ArrayCamera
 * @desc Export the ThreeJs ArrayCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$E } = require$$0$2;

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

    const Object3DBaseModel = Object3D$E.getModelFrom( Mongoose );
    _model$20                  = Object3DBaseModel.discriminator( 'ArrayCamera', getSchemaFrom$2b( Mongoose ) );

}

function registerModelTo$20 ( Mongoose ) {

    if ( !_model$20 ) {
        _createModel$20( Mongoose );
    }

    return Mongoose

}

var ArrayCamera_1 = {
    name:            'ArrayCamera',
    getSchemaFrom:   getSchemaFrom$2b,
    getModelFrom:    getModelFrom$20,
    registerModelTo: registerModelTo$20
};

/**
 * @module Schemas/Camera/Camera
 * @desc Export the ThreeJs Camera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$D } = require$$0$2;

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

    const Object3DBaseModel = Object3D$D.getModelFrom( Mongoose );
    _model$1$                  = Object3DBaseModel.discriminator( 'Camera', getSchemaFrom$2a( Mongoose ) );

}

function registerModelTo$1$ ( Mongoose ) {

    if ( !_model$1$ ) {
        _createModel$1$( Mongoose );
    }

    return Mongoose

}

var Camera_1 = {
    name:            'Camera',
    getSchemaFrom:   getSchemaFrom$2a,
    getModelFrom:    getModelFrom$1$,
    registerModelTo: registerModelTo$1$
};

/**
 * @module Schemas/Camera/CubeCamera
 * @desc Export the ThreeJs CubeCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$C } = require$$0$2;

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

    _schema$29 = new Schema( {} );

}

function getModelFrom$1_ ( Mongoose ) {

    if ( !_model$1_ ) {
        _createModel$1_( Mongoose );
    }

    return _model$1_

}

function _createModel$1_ ( Mongoose ) {

    const Object3DBaseModel = Object3D$C.getModelFrom( Mongoose );
    _model$1_                  = Object3DBaseModel.discriminator( 'CubeCamera', getSchemaFrom$29( Mongoose ) );

}

function registerModelTo$1_ ( Mongoose ) {

    if ( !_model$1_ ) {
        _createModel$1_( Mongoose );
    }

    return Mongoose

}

var CubeCamera_1 = {
    name:            'CubeCamera',
    getSchemaFrom:   getSchemaFrom$29,
    getModelFrom:    getModelFrom$1_,
    registerModelTo: registerModelTo$1_
};

/**
 * @module Schemas/Camera/OrthographicCamera
 * @desc Export the ThreeJs OrthographicCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$B } = require$$0$2;

let _schema$28 = undefined;
let _model$1Z  = undefined;

function getSchemaFrom$28 ( Mongoose ) {

    if ( !_schema$28 ) {
        _createSchema$28( Mongoose );
    }

    return _schema$28

}

function _createSchema$28 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$28 = new Schema( {} );

}

function getModelFrom$1Z ( Mongoose ) {

    if ( !_model$1Z ) {
        _createModel$1Z( Mongoose );
    }

    return _model$1Z

}

function _createModel$1Z ( Mongoose ) {

    const Object3DBaseModel = Object3D$B.getModelFrom( Mongoose );
    _model$1Z                  = Object3DBaseModel.discriminator( 'OrthographicCamera', getSchemaFrom$28( Mongoose ) );

}

function registerModelTo$1Z ( Mongoose ) {

    if ( !_model$1Z ) {
        _createModel$1Z( Mongoose );
    }

    return Mongoose

}

var OrthographicCamera_1 = {
    name:            'OrthographicCamera',
    getSchemaFrom:   getSchemaFrom$28,
    getModelFrom:    getModelFrom$1Z,
    registerModelTo: registerModelTo$1Z
};

/**
 * @module Schemas/Camera/PerspectiveCamera
 * @desc Export the ThreeJs PerspectiveCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$A } = require$$0$2;

let _schema$27 = undefined;
let _model$1Y  = undefined;

function getSchemaFrom$27 ( Mongoose ) {

    if ( !_schema$27 ) {
        _createSchema$27( Mongoose );
    }

    return _schema$27

}

function _createSchema$27 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$27 = new Schema( {} );

}

function getModelFrom$1Y ( Mongoose ) {

    if ( !_model$1Y ) {
        _createModel$1Y( Mongoose );
    }

    return _model$1Y

}

function _createModel$1Y ( Mongoose ) {

    const Object3DBaseModel = Object3D$A.getModelFrom( Mongoose );
    _model$1Y                  = Object3DBaseModel.discriminator( 'PerspectiveCamera', getSchemaFrom$27( Mongoose ) );

}

function registerModelTo$1Y ( Mongoose ) {

    if ( !_model$1Y ) {
        _createModel$1Y( Mongoose );
    }

    return Mongoose

}

var PerspectiveCamera_1 = {
    name:            'PerspectiveCamera',
    getSchemaFrom:   getSchemaFrom$27,
    getModelFrom:    getModelFrom$1Y,
    registerModelTo: registerModelTo$1Y
};

/**
 * @module Schemas/Core/BufferAttribute
 * @desc Export the ThreeJs BufferAttribute Model and Schema for Mongoose.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const {
          isInt8Array,
          isInt16Array,
          isInt32Array,
          isFloat32Array,
          isFloat64Array,
          isUint8Array,
          isUint8ClampedArray,
          isUint16Array,
          isUint32Array,
          isBigInt64Array,
          isBigUint64Array
      } = require$$0__default["default"];

let _schema$26 = undefined;

function getSchemaFrom$26 ( Mongoose ) {

    if ( !_schema$26 ) {
        _createSchema$26( Mongoose );
    }

    return _schema$26

}

function _createSchema$26 ( Mongoose ) {

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

    _schema$26 = new Schema( {
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
    name:            'BufferAttribute',
    getSchemaFrom:   getSchemaFrom$26,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Core/BufferGeometry
 * @desc Export the ThreeJs BufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferAttribute Schemas/Core/BufferAttribute}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//const { BufferAttribute } = require( './BufferAttribute' )

let _schema$25 = undefined;
let _model$1X  = undefined;

function getSchemaFrom$25 ( Mongoose ) {

    if ( !_schema$25 ) {
        _createSchema$25( Mongoose );
    }

    return _schema$25

}

function _createSchema$25 ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Vector3 = Types.Vector3;

    const BufferAttributeSchema = BufferAttribute_1.getSchemaFrom( Mongoose );

    _schema$25 = new Schema( {
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

function getModelFrom$1X ( Mongoose ) {

    if ( !_model$1X ) {
        _createModel$1X( Mongoose );
    }

    return _model$1X

}

function _createModel$1X ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$1X = Mongoose.model( 'BufferGeometries', getSchemaFrom$25( Mongoose ) );
    _model$1X.discriminator( 'BufferGeometry', new Mongoose.Schema( {} ) );

}

function registerModelTo$1X ( Mongoose ) {

    if ( !_model$1X ) {
        _createModel$1X( Mongoose );
    }

    return Mongoose

}

const BufferGeometry$l = {
    getSchemaFrom:   getSchemaFrom$25,
    getModelFrom:    getModelFrom$1X,
    registerModelTo: registerModelTo$1X
};


//module.exports.BufferGeometry =

var BufferGeometry$m = /*#__PURE__*/Object.freeze({
	__proto__: null,
	BufferGeometry: BufferGeometry$l
});

var Curve$g = {};

/**
 * @module Schemas/Curves/Curve
 * @desc Export the ThreeJs Curve Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$24 = undefined;
let _model$1W  = undefined;

function getSchemaFrom$24 ( Mongoose ) {

    if ( !_schema$24 ) {
        _createSchema$24( Mongoose );
    }

    return _schema$24

}

function _createSchema$24 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$24 = new Schema( {
        type: {
            type:    String,
            default: 'Curve'
        },
        arcLengthDivisions: Number
    }, {
        collection:       'curves',
        discriminatorKey: 'type'
    } );

}

function getModelFrom$1W ( Mongoose ) {

    if ( !_model$1W ) {
        _createModel$1W( Mongoose );
    }

    return _model$1W

}

function _createModel$1W ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$1W = Mongoose.model( 'Curves', getSchemaFrom$24( Mongoose ) );
    _model$1W.discriminator( 'Curve', new Mongoose.Schema( {} ) );

}

function registerModelTo$1W ( Mongoose ) {

    if ( !_model$1W ) {
        _createModel$1W( Mongoose );
    }

    return Mongoose

}

var Curve_1 = Curve$g.Curve = {
    name: 'Curve',
    getSchemaFrom: getSchemaFrom$24,
    getModelFrom: getModelFrom$1W,
    registerModelTo: registerModelTo$1W
};

/**
 * @module Schemas/Core/CurvePath
 * @desc Export the ThreeJs CurvePath Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 * @augments module:Schemas/Curves/Curve
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$f } = Curve$g;

let _schema$23 = undefined;
let _model$1V  = undefined;

function getSchemaFrom$23 ( Mongoose ) {

    if ( !_schema$23 ) {
        _createSchema$23( Mongoose );
    }

    return _schema$23

}

function _createSchema$23 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    const NestedCurveSchema = new Schema( {
        type: {
            type:    String,
            default: 'Curve'
        },
        arcLengthDivisions: Number
    }, {
        id:  false,
        _id: false
    } );

    _schema$23 = new Schema( {
        curves:    [ NestedCurveSchema ], // Curve
        autoClose: {
            type:    Boolean,
            default: false
        }
    } );

}

function getModelFrom$1V ( Mongoose ) {

    if ( !_model$1V ) {
        _createModel$1V( Mongoose );
    }

    return _model$1V

}

function _createModel$1V ( Mongoose ) {

    const CurveBaseModel = Curve$f.getModelFrom( Mongoose );
    _model$1V               = CurveBaseModel.discriminator( 'CurvePath', getSchemaFrom$23( Mongoose ) );

}

function registerModelTo$1V ( Mongoose ) {

    if ( !_model$1V ) {
        _createModel$1V( Mongoose );
    }

    return Mongoose

}

var CurvePath_1 = {
    name:            'CurvePath',
    getSchemaFrom:   getSchemaFrom$23,
    getModelFrom:    getModelFrom$1V,
    registerModelTo: registerModelTo$1V
};

/**
 * @module Schemas/Core/Face3
 * @desc Export the ThreeJs Face3 Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$22 = undefined;

function getSchemaFrom$22 ( Mongoose ) {

    if ( !_schema$22 ) {
        _createSchema$22( Mongoose );
    }

    return _schema$22

}

function _createSchema$22 ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Color   = Types.Color;
    const Vector3 = Types.Vector3;

    _schema$22 = new Schema( {
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
    name:            'Face3',
    getSchemaFrom:   getSchemaFrom$22,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Core/Geometry
 * @desc Export the ThreeJs Geometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Face3 Schemas/Core/Face3}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$21 = undefined;
let _model$1U  = undefined;

function getSchemaFrom$21 ( Mongoose ) {

    if ( !_schema$21 ) {
        _createSchema$21( Mongoose );
    }

    return _schema$21

}

function _createSchema$21 ( Mongoose ) {

    const Face3Schema = Face3_1.getSchemaFrom( Mongoose );
    const Schema      = Mongoose.Schema;
    const Types       = Schema.Types;
    const Vector3     = Types.Vector3;

    _schema$21 = new Schema( {
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

function getModelFrom$1U ( Mongoose ) {

    if ( !_model$1U ) {
        _createModel$1U( Mongoose );
    }

    return _model$1U

}

function _createModel$1U ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$1U = Mongoose.model( 'Geometries', getSchemaFrom$21( Mongoose ) );
    _model$1U.discriminator( 'Geometry', new Mongoose.Schema( {} ) );

}

function registerModelTo$1U ( Mongoose ) {

    if ( !_model$1U ) {
        _createModel$1U( Mongoose );
    }

    return Mongoose

}

const Geometry$o = {
    name: 'Geometry',
    getSchemaFrom: getSchemaFrom$21,
    getModelFrom: getModelFrom$1U,
    registerModelTo: registerModelTo$1U
};

var Geometry$p = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Geometry: Geometry$o
});

/**
 * @module Schemas/Core/Path
 * @desc Export the ThreeJs Path Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$e } = Curve$g;

let _schema$20 = undefined;
let _model$1T  = undefined;

function getSchemaFrom$20 ( Mongoose ) {

    if ( !_schema$20 ) {
        _createSchema$20( Mongoose );
    }

    return _schema$20

}

function _createSchema$20 ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    const NestedCurveSchema = new Schema( {
        type: {
            type:    String,
            default: 'Curve'
        },
        arcLengthDivisions: Number
    }, {
        id:  false,
        _id: false
    } );

    _schema$20 = new Schema( {

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

function getModelFrom$1T ( Mongoose ) {

    if ( !_model$1T ) {
        _createModel$1T( Mongoose );
    }

    return _model$1T

}

function _createModel$1T ( Mongoose ) {

    const CurveBaseModel = Curve$e.getModelFrom( Mongoose );
    _model$1T               = CurveBaseModel.discriminator( 'Path', getSchemaFrom$20( Mongoose ) );

}

function registerModelTo$1T ( Mongoose ) {

    if ( !_model$1T ) {
        _createModel$1T( Mongoose );
    }

    return Mongoose

}

var Path_1 = {
    name:            'Path',
    getSchemaFrom:   getSchemaFrom$20,
    getModelFrom:    getModelFrom$1T,
    registerModelTo: registerModelTo$1T
};

/**
 * @module Schemas/Core/Shape
 * @desc Export the ThreeJs Shape Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$d } = Curve$g;

let _schema$1$ = undefined;
let _model$1S  = undefined;

function getSchemaFrom$1$ ( Mongoose ) {

    if ( !_schema$1$ ) {
        _createSchema$1$( Mongoose );
    }

    return _schema$1$

}

function _createSchema$1$ ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    const NestedCurveSchema = new Schema( {
        type: {
            type:    String,
            default: 'Curve'
        },
        arcLengthDivisions: Number
    }, {
        id:  false,
        _id: false
    } );

    const NestedPathSchema = new Schema( {

        // CurvePath inheritance
        curves:    [ NestedCurveSchema ], // Curve
        autoClose: {
            type:    Boolean,
            default: false
        },

        // Path inheritance
        currentPoint: Vector2

    }, {
        id:  false,
        _id: false
    } );

    _schema$1$ = new Schema( {

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

function getModelFrom$1S ( Mongoose ) {

    if ( !_model$1S ) {
        _createModel$1S( Mongoose );
    }

    return _model$1S

}

function _createModel$1S ( Mongoose ) {

    const CurveBaseModel = Curve$d.getModelFrom( Mongoose );
    _model$1S               = CurveBaseModel.discriminator( 'Shape', getSchemaFrom$1$( Mongoose ) );

}

function registerModelTo$1S ( Mongoose ) {

    if ( !_model$1S ) {
        _createModel$1S( Mongoose );
    }

    return Mongoose

}

var Shape_1 = {
    name:            'Shape',
    getSchemaFrom:   getSchemaFrom$1$,
    getModelFrom:    getModelFrom$1S,
    registerModelTo: registerModelTo$1S
};

/**
 * @module Schemas/Curves/ArcCurve
 * @desc Export the ThreeJs ArcCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$c } = Curve$g;

let _schema$1_ = undefined;
let _model$1R  = undefined;

function getSchemaFrom$1_ ( Mongoose ) {

    if ( !_schema$1_ ) {
        _createSchema$1_( Mongoose );
    }

    return _schema$1_

}

function _createSchema$1_ ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1_ = new Schema( {
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

function getModelFrom$1R ( Mongoose ) {

    if ( !_model$1R ) {
        _createModel$1R( Mongoose );
    }

    return _model$1R

}

function _createModel$1R ( Mongoose ) {

    const CurveBaseModel = Curve$c.getModelFrom( Mongoose );
    _model$1R               = CurveBaseModel.discriminator( 'ArcCurve', getSchemaFrom$1_( Mongoose ) );

}

function registerModelTo$1R ( Mongoose ) {

    if ( !_model$1R ) {
        _createModel$1R( Mongoose );
    }

    return Mongoose

}

var ArcCurve_1 = {
    name:            'ArcCurve',
    getSchemaFrom:   getSchemaFrom$1_,
    getModelFrom:    getModelFrom$1R,
    registerModelTo: registerModelTo$1R
};

/**
 * @module Schemas/Curves/CatmullRomCurve3
 * @desc Export the ThreeJs CatmullRomCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$b } = Curve$g;

let _schema$1Z = undefined;
let _model$1Q  = undefined;

function getSchemaFrom$1Z ( Mongoose ) {

    if ( !_schema$1Z ) {
        _createSchema$1Z( Mongoose );
    }

    return _schema$1Z

}

function _createSchema$1Z ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1Z = new Schema( {
        points:    [ Vector3 ],
        closed:    Boolean,
        curveType: String,
        tension:   Number
    } );

}

function getModelFrom$1Q ( Mongoose ) {

    if ( !_model$1Q ) {
        _createModel$1Q( Mongoose );
    }

    return _model$1Q

}

function _createModel$1Q ( Mongoose ) {

    const CurveBaseModel = Curve$b.getModelFrom( Mongoose );
    _model$1Q               = CurveBaseModel.discriminator( 'CatmullRomCurve3', getSchemaFrom$1Z( Mongoose ) );

}

function registerModelTo$1Q ( Mongoose ) {

    if ( !_model$1Q ) {
        _createModel$1Q( Mongoose );
    }

    return Mongoose

}

var CatmullRomCurve3_1 = {
    name:            'CatmullRomCurve3',
    getSchemaFrom:   getSchemaFrom$1Z,
    getModelFrom:    getModelFrom$1Q,
    registerModelTo: registerModelTo$1Q
};

/**
 * @module Schemas/Curves/CubicBezierCurve
 * @desc Export the ThreeJs CubicBezierCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$a } = Curve$g;

let _schema$1Y = undefined;
let _model$1P  = undefined;

function getSchemaFrom$1Y ( Mongoose ) {

    if ( !_schema$1Y ) {
        _createSchema$1Y( Mongoose );
    }

    return _schema$1Y

}

function _createSchema$1Y ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$1Y = new Schema( {
        v0: Vector2,
        v1: Vector2,
        v2: Vector2,
        v3: Vector2
    } );

}

function getModelFrom$1P ( Mongoose ) {

    if ( !_model$1P ) {
        _createModel$1P( Mongoose );
    }

    return _model$1P

}

function _createModel$1P ( Mongoose ) {

    const CurveBaseModel = Curve$a.getModelFrom( Mongoose );
    _model$1P               = CurveBaseModel.discriminator( 'CubicBezierCurve', getSchemaFrom$1Y( Mongoose ) );

}

function registerModelTo$1P ( Mongoose ) {

    if ( !_model$1P ) {
        _createModel$1P( Mongoose );
    }

    return Mongoose

}

var CubicBezierCurve_1 = {
    name:            'CubicBezierCurve',
    getSchemaFrom:   getSchemaFrom$1Y,
    getModelFrom:    getModelFrom$1P,
    registerModelTo: registerModelTo$1P
};

/**
 * @module Schemas/Curves/CubicBezierCurve3
 * @desc Export the ThreeJs CubicBezierCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$9 } = Curve$g;

let _schema$1X = undefined;
let _model$1O  = undefined;

function getSchemaFrom$1X ( Mongoose ) {

    if ( !_schema$1X ) {
        _createSchema$1X( Mongoose );
    }

    return _schema$1X

}

function _createSchema$1X ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1X = new Schema( {
        v0: Vector3,
        v1: Vector3,
        v2: Vector3,
        v3: Vector3
    } );

}

function getModelFrom$1O ( Mongoose ) {

    if ( !_model$1O ) {
        _createModel$1O( Mongoose );
    }

    return _model$1O

}

function _createModel$1O ( Mongoose ) {

    const CurveBaseModel = Curve$9.getModelFrom( Mongoose );
    _model$1O               = CurveBaseModel.discriminator( 'CubicBezierCurve3', getSchemaFrom$1X( Mongoose ) );

}

function registerModelTo$1O ( Mongoose ) {

    if ( !_model$1O ) {
        _createModel$1O( Mongoose );
    }

    return Mongoose

}

var CubicBezierCurve3_1 = {
    name:            'CubicBezierCurve3',
    getSchemaFrom:   getSchemaFrom$1X,
    getModelFrom:    getModelFrom$1O,
    registerModelTo: registerModelTo$1O
};

/**
 * @module Schemas/Curves/CurveExtras
 * @desc Export the ThreeJs CurveExtras Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$8 } = Curve$g;

let _schema$1W = undefined;
let _model$1N  = undefined;

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

function getModelFrom$1N ( Mongoose ) {

    if ( !_model$1N ) {
        _createModel$1N( Mongoose );
    }

    return _model$1N

}

function _createModel$1N ( Mongoose ) {

    const CurveBaseModel = Curve$8.getModelFrom( Mongoose );
    _model$1N               = CurveBaseModel.discriminator( 'CurveExtras', getSchemaFrom$1W( Mongoose ) );

}

function registerModelTo$1N ( Mongoose ) {

    if ( !_model$1N ) {
        _createModel$1N( Mongoose );
    }

    return Mongoose

}

var CurveExtras_1 = {
    name:            'CurveExtras',
    getSchemaFrom:   getSchemaFrom$1W,
    getModelFrom:    getModelFrom$1N,
    registerModelTo: registerModelTo$1N
};

/**
 * @module Schemas/Curves/EllipseCurve
 * @desc Export the ThreeJs EllipseCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$7 } = Curve$g;

let _schema$1V = undefined;
let _model$1M  = undefined;

function getSchemaFrom$1V ( Mongoose ) {

    if ( !_schema$1V ) {
        _createSchema$1V( Mongoose );
    }

    return _schema$1V

}

function _createSchema$1V ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1V = new Schema( {
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

function getModelFrom$1M ( Mongoose ) {

    if ( !_model$1M ) {
        _createModel$1M( Mongoose );
    }

    return _model$1M

}

function _createModel$1M ( Mongoose ) {

    const CurveBaseModel = Curve$7.getModelFrom( Mongoose );
    _model$1M               = CurveBaseModel.discriminator( 'EllipseCurve', getSchemaFrom$1V( Mongoose ) );

}

function registerModelTo$1M ( Mongoose ) {

    if ( !_model$1M ) {
        _createModel$1M( Mongoose );
    }

    return Mongoose

}

var EllipseCurve_1 = {
    name:            'EllipseCurve',
    getSchemaFrom:   getSchemaFrom$1V,
    getModelFrom:    getModelFrom$1M,
    registerModelTo: registerModelTo$1M
};

/**
 * @module Schemas/Curves/LineCurve
 * @desc Export the ThreeJs LineCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$6 } = Curve$g;

let _schema$1U = undefined;
let _model$1L  = undefined;

function getSchemaFrom$1U ( Mongoose ) {

    if ( !_schema$1U ) {
        _createSchema$1U( Mongoose );
    }

    return _schema$1U

}

function _createSchema$1U ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$1U = new Schema( {
        v0: Vector2,
        v1: Vector2
    } );

}

function getModelFrom$1L ( Mongoose ) {

    if ( !_model$1L ) {
        _createModel$1L( Mongoose );
    }

    return _model$1L

}

function _createModel$1L ( Mongoose ) {

    const CurveBaseModel = Curve$6.getModelFrom( Mongoose );
    _model$1L               = CurveBaseModel.discriminator( 'LineCurve', getSchemaFrom$1U( Mongoose ) );

}

function registerModelTo$1L ( Mongoose ) {

    if ( !_model$1L ) {
        _createModel$1L( Mongoose );
    }

    return Mongoose

}

var LineCurve_1 = {
    name:            'LineCurve',
    getSchemaFrom:   getSchemaFrom$1U,
    getModelFrom:    getModelFrom$1L,
    registerModelTo: registerModelTo$1L
};

/**
 * @module Schemas/Curves/LineCurve3
 * @desc Export the ThreeJs LineCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$5 } = Curve$g;

let _schema$1T = undefined;
let _model$1K  = undefined;

function getSchemaFrom$1T ( Mongoose ) {

    if ( !_schema$1T ) {
        _createSchema$1T( Mongoose );
    }

    return _schema$1T

}

function _createSchema$1T ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$1T = new Schema( {
        v0: Vector3,
        v1: Vector3
    } );

}

function getModelFrom$1K ( Mongoose ) {

    if ( !_model$1K ) {
        _createModel$1K( Mongoose );
    }

    return _model$1K

}

function _createModel$1K ( Mongoose ) {

    const CurveBaseModel = Curve$5.getModelFrom( Mongoose );
    _model$1K               = CurveBaseModel.discriminator( 'LineCurve3', getSchemaFrom$1T( Mongoose ) );

}

function registerModelTo$1K ( Mongoose ) {

    if ( !_model$1K ) {
        _createModel$1K( Mongoose );
    }

    return Mongoose

}

var LineCurve3_1 = {
    name:            'LineCurve3',
    getSchemaFrom:   getSchemaFrom$1T,
    getModelFrom:    getModelFrom$1K,
    registerModelTo: registerModelTo$1K
};

/**
 * @module Schemas/Curves/NURBSCurve
 * @desc Export the ThreeJs NURBSCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$4 } = Curve$g;

let _schema$1S = undefined;
let _model$1J  = undefined;

function getSchemaFrom$1S ( Mongoose ) {

    if ( !_schema$1S ) {
        _createSchema$1S( Mongoose );
    }

    return _schema$1S

}

function _createSchema$1S ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1S = new Schema( {} );

}

function getModelFrom$1J ( Mongoose ) {

    if ( !_model$1J ) {
        _createModel$1J( Mongoose );
    }

    return _model$1J

}

function _createModel$1J ( Mongoose ) {

    const CurveBaseModel = Curve$4.getModelFrom( Mongoose );
    _model$1J               = CurveBaseModel.discriminator( 'NURBSCurve', getSchemaFrom$1S( Mongoose ) );

}

function registerModelTo$1J ( Mongoose ) {

    if ( !_model$1J ) {
        _createModel$1J( Mongoose );
    }

    return Mongoose

}

var NURBSCurve_1 = {
    name:            'NURBSCurve',
    getSchemaFrom:   getSchemaFrom$1S,
    getModelFrom:    getModelFrom$1J,
    registerModelTo: registerModelTo$1J
};

/**
 * @module Schemas/Curves/NURBSSurface
 * @desc Export the ThreeJs NURBSSurface Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$3 } = Curve$g;

let _schema$1R = undefined;
let _model$1I  = undefined;

function getSchemaFrom$1R ( Mongoose ) {

    if ( !_schema$1R ) {
        _createSchema$1R( Mongoose );
    }

    return _schema$1R

}

function _createSchema$1R ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1R = new Schema( {} );

}

function getModelFrom$1I ( Mongoose ) {

    if ( !_model$1I ) {
        _createModel$1I( Mongoose );
    }

    return _model$1I

}

function _createModel$1I ( Mongoose ) {

    const CurveBaseModel = Curve$3.getModelFrom( Mongoose );
    _model$1I               = CurveBaseModel.discriminator( 'NURBSSurface', getSchemaFrom$1R( Mongoose ) );

}

function registerModelTo$1I ( Mongoose ) {

    if ( !_model$1I ) {
        _createModel$1I( Mongoose );
    }

    return Mongoose

}

var NURBSSurface_1 = {
    name:            'NURBSSurface',
    getSchemaFrom:   getSchemaFrom$1R,
    getModelFrom:    getModelFrom$1I,
    registerModelTo: registerModelTo$1I
};

/**
 * @module Schemas/Curves/QuadraticBezierCurve
 * @desc Export the ThreeJs QuadraticBezierCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$2 } = Curve$g;

let _schema$1Q = undefined;
let _model$1H  = undefined;

function getSchemaFrom$1Q ( Mongoose ) {

    if ( !_schema$1Q ) {
        _createSchema$1Q( Mongoose );
    }

    return _schema$1Q

}

function _createSchema$1Q ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$1Q = new Schema( {
        v0: Vector2,
        v1: Vector2,
        v2: Vector2
    } );

}

function getModelFrom$1H ( Mongoose ) {

    if ( !_model$1H ) {
        _createModel$1H( Mongoose );
    }

    return _model$1H

}

function _createModel$1H ( Mongoose ) {

    const CurveBaseModel = Curve$2.getModelFrom( Mongoose );
    _model$1H               = CurveBaseModel.discriminator( 'QuadraticBezierCurve', getSchemaFrom$1Q( Mongoose ) );

}

function registerModelTo$1H ( Mongoose ) {

    if ( !_model$1H ) {
        _createModel$1H( Mongoose );
    }

    return Mongoose

}

var QuadraticBezierCurve_1 = {
    name:            'QuadraticBezierCurve',
    getSchemaFrom:   getSchemaFrom$1Q,
    getModelFrom:    getModelFrom$1H,
    registerModelTo: registerModelTo$1H
};

/**
 * @module Schemas/Curves/QuadraticBezierCurve3
 * @desc Export the ThreeJs QuadraticBezierCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve: Curve$1 } = Curve$g;

let _schema$1P = undefined;
let _model$1G  = undefined;

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
        v0: Vector3,
        v1: Vector3,
        v2: Vector3
    } );

}

function getModelFrom$1G ( Mongoose ) {

    if ( !_model$1G ) {
        _createModel$1G( Mongoose );
    }

    return _model$1G

}

function _createModel$1G ( Mongoose ) {

    const CurveBaseModel = Curve$1.getModelFrom( Mongoose );
    _model$1G               = CurveBaseModel.discriminator( 'QuadraticBezierCurve3', getSchemaFrom$1P( Mongoose ) );

}

function registerModelTo$1G ( Mongoose ) {

    if ( !_model$1G ) {
        _createModel$1G( Mongoose );
    }

    return Mongoose

}

var QuadraticBezierCurve3_1 = {
    name:            'QuadraticBezierCurve3',
    getSchemaFrom:   getSchemaFrom$1P,
    getModelFrom:    getModelFrom$1G,
    registerModelTo: registerModelTo$1G
};

/**
 * @module Schemas/Curves/SplineCurve
 * @desc Export the ThreeJs SplineCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve } = Curve$g;

let _schema$1O = undefined;
let _model$1F  = undefined;

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
        points: [ Vector3 ]
    } );

}

function getModelFrom$1F ( Mongoose ) {

    if ( !_model$1F ) {
        _createModel$1F( Mongoose );
    }

    return _model$1F

}

function _createModel$1F ( Mongoose ) {

    const CurveBaseModel = Curve.getModelFrom( Mongoose );
    _model$1F               = CurveBaseModel.discriminator( 'SplineCurve', getSchemaFrom$1O( Mongoose ) );

}

function registerModelTo$1F ( Mongoose ) {

    if ( !_model$1F ) {
        _createModel$1F( Mongoose );
    }

    return Mongoose

}

var SplineCurve_1 = {
    name:            'SplineCurve',
    getSchemaFrom:   getSchemaFrom$1O,
    getModelFrom:    getModelFrom$1F,
    registerModelTo: registerModelTo$1F
};

var require$$0$1 = /*@__PURE__*/getAugmentedNamespace(BufferGeometry$m);

/**
 * @module Schemas/Geometries/BoxBufferGeometry
 * @desc Export the ThreeJs BoxBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$k } = require$$0$1;

let _schema$1N = undefined;
let _model$1E  = undefined;

function getSchemaFrom$1N ( Mongoose ) {

    if ( !_schema$1N ) {
        _createSchema$1N( Mongoose );
    }

    return _schema$1N

}

function _createSchema$1N ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1N = new Schema( {} );

}

function getModelFrom$1E ( Mongoose ) {

    if ( !_model$1E ) {
        _createModel$1E( Mongoose );
    }

    return _model$1E

}

function _createModel$1E ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$k.getModelFrom( Mongoose );
    _model$1E                        = BufferGeometryBaseModel.discriminator( 'BoxBufferGeometry', getSchemaFrom$1N( Mongoose ) );

}

function registerModelTo$1E ( Mongoose ) {

    if ( !_model$1E ) {
        _createModel$1E( Mongoose );
    }

    return Mongoose

}

var BoxBufferGeometry_1 = {
    name:            'BoxBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1N,
    getModelFrom:    getModelFrom$1E,
    registerModelTo: registerModelTo$1E
};

var require$$0 = /*@__PURE__*/getAugmentedNamespace(Geometry$p);

/**
 * @module Schemas/Geometries/BoxGeometry
 * @desc Export the ThreeJs BoxGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$n } = require$$0;

let _schema$1M = undefined;
let _model$1D  = undefined;

function getSchemaFrom$1M ( Mongoose ) {

    if ( !_schema$1M ) {
        _createSchema$1M( Mongoose );
    }

    return _schema$1M

}

function _createSchema$1M ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1M = new Schema( {} );

}

function getModelFrom$1D ( Mongoose ) {

    if ( !_model$1D ) {
        _createModel$1D( Mongoose );
    }

    return _model$1D

}

function _createModel$1D ( Mongoose ) {

    const GeometryBaseModel = Geometry$n.getModelFrom( Mongoose );
    _model$1D                  = GeometryBaseModel.discriminator( 'BoxGeometry', getSchemaFrom$1M( Mongoose ) );

}

function registerModelTo$1D ( Mongoose ) {

    if ( !_model$1D ) {
        _createModel$1D( Mongoose );
    }

    return Mongoose

}

var BoxGeometry_1 = {
    name:            'BoxGeometry',
    getSchemaFrom:   getSchemaFrom$1M,
    getModelFrom:    getModelFrom$1D,
    registerModelTo: registerModelTo$1D
};

/**
 * @module Schemas/Geometries/CircleBufferGeometry
 * @desc Export the ThreeJs CircleBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$j } = require$$0$1;

let _schema$1L = undefined;
let _model$1C  = undefined;

function getSchemaFrom$1L ( Mongoose ) {

    if ( !_schema$1L ) {
        _createSchema$1L( Mongoose );
    }

    return _schema$1L

}

function _createSchema$1L ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1L = new Schema( {} );

}

function getModelFrom$1C ( Mongoose ) {

    if ( !_model$1C ) {
        _createModel$1C( Mongoose );
    }

    return _model$1C

}

function _createModel$1C ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$j.getModelFrom( Mongoose );
    _model$1C                        = BufferGeometryBaseModel.discriminator( 'CircleBufferGeometry', getSchemaFrom$1L( Mongoose ) );

}

function registerModelTo$1C ( Mongoose ) {

    if ( !_model$1C ) {
        _createModel$1C( Mongoose );
    }

    return Mongoose

}

var CircleBufferGeometry_1 = {
    name:            'CircleBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1L,
    getModelFrom:    getModelFrom$1C,
    registerModelTo: registerModelTo$1C
};

/**
 * @module Schemas/Geometries/CircleGeometry
 * @desc Export the ThreeJs CircleGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$m } = require$$0;

let _schema$1K = undefined;
let _model$1B  = undefined;

function getSchemaFrom$1K ( Mongoose ) {

    if ( !_schema$1K ) {
        _createSchema$1K( Mongoose );
    }

    return _schema$1K

}

function _createSchema$1K ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1K = new Schema( {} );

}

function getModelFrom$1B ( Mongoose ) {

    if ( !_model$1B ) {
        _createModel$1B( Mongoose );
    }

    return _model$1B

}

function _createModel$1B ( Mongoose ) {

    const GeometryBaseModel = Geometry$m.getModelFrom( Mongoose );
    _model$1B                  = GeometryBaseModel.discriminator( 'CircleGeometry', getSchemaFrom$1K( Mongoose ) );

}

function registerModelTo$1B ( Mongoose ) {

    if ( !_model$1B ) {
        _createModel$1B( Mongoose );
    }

    return Mongoose

}

var CircleGeometry_1 = {
    name:            'CircleGeometry',
    getSchemaFrom:   getSchemaFrom$1K,
    getModelFrom:    getModelFrom$1B,
    registerModelTo: registerModelTo$1B
};

/**
 * @module Schemas/Geometries/ConeBufferGeometry
 * @desc Export the ThreeJs ConeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$i } = require$$0$1;

let _schema$1J = undefined;
let _model$1A  = undefined;

function getSchemaFrom$1J ( Mongoose ) {

    if ( !_schema$1J ) {
        _createSchema$1J( Mongoose );
    }

    return _schema$1J

}

function _createSchema$1J ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1J = new Schema( {} );

}

function getModelFrom$1A ( Mongoose ) {

    if ( !_model$1A ) {
        _createModel$1A( Mongoose );
    }

    return _model$1A

}

function _createModel$1A ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$i.getModelFrom( Mongoose );
    _model$1A                        = BufferGeometryBaseModel.discriminator( 'ConeBufferGeometry', getSchemaFrom$1J( Mongoose ) );

}

function registerModelTo$1A ( Mongoose ) {

    if ( !_model$1A ) {
        _createModel$1A( Mongoose );
    }

    return Mongoose

}

var ConeBufferGeometry_1 = {
    name:            'ConeBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1J,
    getModelFrom:    getModelFrom$1A,
    registerModelTo: registerModelTo$1A
};

/**
 * @module Schemas/Geometries/ConeGeometry
 * @desc Export the ThreeJs ConeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$l } = require$$0;

let _schema$1I = undefined;
let _model$1z  = undefined;

function getSchemaFrom$1I ( Mongoose ) {

    if ( !_schema$1I ) {
        _createSchema$1I( Mongoose );
    }

    return _schema$1I

}

function _createSchema$1I ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1I = new Schema( {} );

}

function getModelFrom$1z ( Mongoose ) {

    if ( !_model$1z ) {
        _createModel$1z( Mongoose );
    }

    return _model$1z

}

function _createModel$1z ( Mongoose ) {

    const GeometryBaseModel = Geometry$l.getModelFrom( Mongoose );
    _model$1z                  = GeometryBaseModel.discriminator( 'ConeGeometry', getSchemaFrom$1I( Mongoose ) );

}

function registerModelTo$1z ( Mongoose ) {

    if ( !_model$1z ) {
        _createModel$1z( Mongoose );
    }

    return Mongoose

}

var ConeGeometry_1 = {
    name:            'ConeGeometry',
    getSchemaFrom:   getSchemaFrom$1I,
    getModelFrom:    getModelFrom$1z,
    registerModelTo: registerModelTo$1z
};

/**
 * @module Schemas/Geometries/ConvexGeometry
 * @desc Export the ThreeJs ConvexGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$k } = require$$0;

let _schema$1H = undefined;
let _model$1y  = undefined;

function getSchemaFrom$1H ( Mongoose ) {

    if ( !_schema$1H ) {
        _createSchema$1H( Mongoose );
    }

    return _schema$1H

}

function _createSchema$1H ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1H = new Schema( {} );

}

function getModelFrom$1y ( Mongoose ) {

    if ( !_model$1y ) {
        _createModel$1y( Mongoose );
    }

    return _model$1y

}

function _createModel$1y ( Mongoose ) {

    const GeometryBaseModel = Geometry$k.getModelFrom( Mongoose );
    _model$1y                  = GeometryBaseModel.discriminator( 'ConvexGeometry', getSchemaFrom$1H( Mongoose ) );

}

function registerModelTo$1y ( Mongoose ) {

    if ( !_model$1y ) {
        _createModel$1y( Mongoose );
    }

    return Mongoose

}

var ConvexGeometry_1 = {
    name:            'ConvexGeometry',
    getSchemaFrom:   getSchemaFrom$1H,
    getModelFrom:    getModelFrom$1y,
    registerModelTo: registerModelTo$1y
};

/**
 * @module Schemas/Geometries/CylinderBufferGeometry
 * @desc Export the ThreeJs CylinderBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$h } = require$$0$1;

let _schema$1G = undefined;
let _model$1x  = undefined;

function getSchemaFrom$1G ( Mongoose ) {

    if ( !_schema$1G ) {
        _createSchema$1G( Mongoose );
    }

    return _schema$1G

}

function _createSchema$1G ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1G = new Schema( {} );

}

function getModelFrom$1x ( Mongoose ) {

    if ( !_model$1x ) {
        _createModel$1x( Mongoose );
    }

    return _model$1x

}

function _createModel$1x ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$h.getModelFrom( Mongoose );
    _model$1x                        = BufferGeometryBaseModel.discriminator( 'CylinderBufferGeometry', getSchemaFrom$1G( Mongoose ) );

}

function registerModelTo$1x ( Mongoose ) {

    if ( !_model$1x ) {
        _createModel$1x( Mongoose );
    }

    return Mongoose

}

var CylinderBufferGeometry_1 = {
    name:            'CylinderBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1G,
    getModelFrom:    getModelFrom$1x,
    registerModelTo: registerModelTo$1x
};

/**
 * @module Schemas/Geometries/CylinderGeometry
 * @desc Export the ThreeJs CylinderGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$j } = require$$0;

let _schema$1F = undefined;
let _model$1w  = undefined;

function getSchemaFrom$1F ( Mongoose ) {

    if ( !_schema$1F ) {
        _createSchema$1F( Mongoose );
    }

    return _schema$1F

}

function _createSchema$1F ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1F = new Schema( {} );

}

function getModelFrom$1w ( Mongoose ) {

    if ( !_model$1w ) {
        _createModel$1w( Mongoose );
    }

    return _model$1w

}

function _createModel$1w ( Mongoose ) {

    const GeometryBaseModel = Geometry$j.getModelFrom( Mongoose );
    _model$1w                  = GeometryBaseModel.discriminator( 'CylinderGeometry', getSchemaFrom$1F( Mongoose ) );

}

function registerModelTo$1w ( Mongoose ) {

    if ( !_model$1w ) {
        _createModel$1w( Mongoose );
    }

    return Mongoose

}

var CylinderGeometry_1 = {
    name:            'CylinderGeometry',
    getSchemaFrom:   getSchemaFrom$1F,
    getModelFrom:    getModelFrom$1w,
    registerModelTo: registerModelTo$1w
};

/**
 * @module Schemas/Geometries/DecalGeometry
 * @desc Export the ThreeJs DecalGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$i } = require$$0;

let _schema$1E = undefined;
let _model$1v  = undefined;

function getSchemaFrom$1E ( Mongoose ) {

    if ( !_schema$1E ) {
        _createSchema$1E( Mongoose );
    }

    return _schema$1E

}

function _createSchema$1E ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1E = new Schema( {} );

}

function getModelFrom$1v ( Mongoose ) {

    if ( !_model$1v ) {
        _createModel$1v( Mongoose );
    }

    return _model$1v

}

function _createModel$1v ( Mongoose ) {

    const GeometryBaseModel = Geometry$i.getModelFrom( Mongoose );
    _model$1v                  = GeometryBaseModel.discriminator( 'DecalGeometry', getSchemaFrom$1E( Mongoose ) );

}

function registerModelTo$1v ( Mongoose ) {

    if ( !_model$1v ) {
        _createModel$1v( Mongoose );
    }

    return Mongoose

}

var DecalGeometry_1 = {
    name:            'DecalGeometry',
    getSchemaFrom:   getSchemaFrom$1E,
    getModelFrom:    getModelFrom$1v,
    registerModelTo: registerModelTo$1v
};

/**
 * @module Schemas/Geometries/DodecahedronGeometry
 * @desc Export the ThreeJs DodecahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$h } = require$$0;

let _schema$1D = undefined;
let _model$1u  = undefined;

function getSchemaFrom$1D ( Mongoose ) {

    if ( !_schema$1D ) {
        _createSchema$1D( Mongoose );
    }

    return _schema$1D

}

function _createSchema$1D ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1D = new Schema( {} );

}

function getModelFrom$1u ( Mongoose ) {

    if ( !_model$1u ) {
        _createModel$1u( Mongoose );
    }

    return _model$1u

}

function _createModel$1u ( Mongoose ) {

    const GeometryBaseModel = Geometry$h.getModelFrom( Mongoose );
    _model$1u                  = GeometryBaseModel.discriminator( 'DodecahedronGeometry', getSchemaFrom$1D( Mongoose ) );

}

function registerModelTo$1u ( Mongoose ) {

    if ( !_model$1u ) {
        _createModel$1u( Mongoose );
    }

    return Mongoose

}

var DodecahedronGeometry_1 = {
    name:            'DodecahedronGeometry',
    getSchemaFrom:   getSchemaFrom$1D,
    getModelFrom:    getModelFrom$1u,
    registerModelTo: registerModelTo$1u
};

/**
 * @module Schemas/Geometries/EdgesGeometry
 * @desc Export the ThreeJs EdgesGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$g } = require$$0;

let _schema$1C = undefined;
let _model$1t  = undefined;

function getSchemaFrom$1C ( Mongoose ) {

    if ( !_schema$1C ) {
        _createSchema$1C( Mongoose );
    }

    return _schema$1C

}

function _createSchema$1C ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1C = new Schema( {} );

}

function getModelFrom$1t ( Mongoose ) {

    if ( !_model$1t ) {
        _createModel$1t( Mongoose );
    }

    return _model$1t

}

function _createModel$1t ( Mongoose ) {

    const GeometryBaseModel = Geometry$g.getModelFrom( Mongoose );
    _model$1t                  = GeometryBaseModel.discriminator( 'EdgesGeometry', getSchemaFrom$1C( Mongoose ) );

}

function registerModelTo$1t ( Mongoose ) {

    if ( !_model$1t ) {
        _createModel$1t( Mongoose );
    }

    return Mongoose

}

var EdgesGeometry_1 = {
    name:            'EdgesGeometry',
    getSchemaFrom:   getSchemaFrom$1C,
    getModelFrom:    getModelFrom$1t,
    registerModelTo: registerModelTo$1t
};

/**
 * @module Schemas/Geometries/ExtrudeBufferGeometry
 * @desc Export the ThreeJs ExtrudeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$g } = require$$0$1;

let _schema$1B = undefined;
let _model$1s  = undefined;

function getSchemaFrom$1B ( Mongoose ) {

    if ( !_schema$1B ) {
        _createSchema$1B( Mongoose );
    }

    return _schema$1B

}

function _createSchema$1B ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1B = new Schema( {} );

}

function getModelFrom$1s ( Mongoose ) {

    if ( !_model$1s ) {
        _createModel$1s( Mongoose );
    }

    return _model$1s

}

function _createModel$1s ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$g.getModelFrom( Mongoose );
    _model$1s                        = BufferGeometryBaseModel.discriminator( 'ExtrudeBufferGeometry', getSchemaFrom$1B( Mongoose ) );

}

function registerModelTo$1s ( Mongoose ) {

    if ( !_model$1s ) {
        _createModel$1s( Mongoose );
    }

    return Mongoose

}

var ExtrudeBufferGeometry_1 = {
    name:            'ExtrudeBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1B,
    getModelFrom:    getModelFrom$1s,
    registerModelTo: registerModelTo$1s
};

/**
 * @module Schemas/Geometries/ExtrudeGeometry
 * @desc Export the ThreeJs ExtrudeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$f } = require$$0;

let _schema$1A = undefined;
let _model$1r  = undefined;

function getSchemaFrom$1A ( Mongoose ) {

    if ( !_schema$1A ) {
        _createSchema$1A( Mongoose );
    }

    return _schema$1A

}

function _createSchema$1A ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1A = new Schema( {} );

}

function getModelFrom$1r ( Mongoose ) {

    if ( !_model$1r ) {
        _createModel$1r( Mongoose );
    }

    return _model$1r

}

function _createModel$1r ( Mongoose ) {

    const GeometryBaseModel = Geometry$f.getModelFrom( Mongoose );
    _model$1r                  = GeometryBaseModel.discriminator( 'ExtrudeGeometry', getSchemaFrom$1A( Mongoose ) );

}

function registerModelTo$1r ( Mongoose ) {

    if ( !_model$1r ) {
        _createModel$1r( Mongoose );
    }

    return Mongoose

}

var ExtrudeGeometry_1 = {
    name:            'ExtrudeGeometry',
    getSchemaFrom:   getSchemaFrom$1A,
    getModelFrom:    getModelFrom$1r,
    registerModelTo: registerModelTo$1r
};

/**
 * @module Schemas/Geometries/IcosahedronBufferGeometry
 * @desc Export the ThreeJs IcosahedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$f } = require$$0$1;

let _schema$1z = undefined;
let _model$1q  = undefined;

function getSchemaFrom$1z ( Mongoose ) {

    if ( !_schema$1z ) {
        _createSchema$1z( Mongoose );
    }

    return _schema$1z

}

function _createSchema$1z ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1z = new Schema( {} );

}

function getModelFrom$1q ( Mongoose ) {

    if ( !_model$1q ) {
        _createModel$1q( Mongoose );
    }

    return _model$1q

}

function _createModel$1q ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$f.getModelFrom( Mongoose );
    _model$1q                        = BufferGeometryBaseModel.discriminator( 'IcosahedronBufferGeometry', getSchemaFrom$1z( Mongoose ) );

}

function registerModelTo$1q ( Mongoose ) {

    if ( !_model$1q ) {
        _createModel$1q( Mongoose );
    }

    return Mongoose

}

var IcosahedronBufferGeometry_1 = {
    name:            'IcosahedronBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1z,
    getModelFrom:    getModelFrom$1q,
    registerModelTo: registerModelTo$1q
};

/**
 * @module Schemas/Geometries/IcosahedronGeometry
 * @desc Export the ThreeJs IcosahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$e } = require$$0;

let _schema$1y = undefined;
let _model$1p  = undefined;

function getSchemaFrom$1y ( Mongoose ) {

    if ( !_schema$1y ) {
        _createSchema$1y( Mongoose );
    }

    return _schema$1y

}

function _createSchema$1y ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1y = new Schema( {} );

}

function getModelFrom$1p ( Mongoose ) {

    if ( !_model$1p ) {
        _createModel$1p( Mongoose );
    }

    return _model$1p

}

function _createModel$1p ( Mongoose ) {

    const GeometryBaseModel = Geometry$e.getModelFrom( Mongoose );
    _model$1p                  = GeometryBaseModel.discriminator( 'IcosahedronGeometry', getSchemaFrom$1y( Mongoose ) );

}

function registerModelTo$1p ( Mongoose ) {

    if ( !_model$1p ) {
        _createModel$1p( Mongoose );
    }

    return Mongoose

}

var IcosahedronGeometry_1 = {
    name:            'IcosahedronGeometry',
    getSchemaFrom:   getSchemaFrom$1y,
    getModelFrom:    getModelFrom$1p,
    registerModelTo: registerModelTo$1p
};

/**
 * @module Schemas/Geometries/InstancedBufferGeometry
 * @desc Export the ThreeJs InstancedBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$e } = require$$0$1;

let _schema$1x = undefined;
let _model$1o  = undefined;

function getSchemaFrom$1x ( Mongoose ) {

    if ( !_schema$1x ) {
        _createSchema$1x( Mongoose );
    }

    return _schema$1x

}

function _createSchema$1x ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$1x = new Schema( {} );

}

function getModelFrom$1o ( Mongoose ) {

    if ( !_model$1o ) {
        _createModel$1o( Mongoose );
    }

    return _model$1o

}

function _createModel$1o ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$e.getModelFrom( Mongoose );
    _model$1o                        = BufferGeometryBaseModel.discriminator( 'InstancedBufferGeometry', getSchemaFrom$1x( Mongoose ) );

}

function registerModelTo$1o ( Mongoose ) {

    if ( !_model$1o ) {
        _createModel$1o( Mongoose );
    }

    return Mongoose

}

var InstancedBufferGeometry_1 = {
    name:            'InstancedBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1x,
    getModelFrom:    getModelFrom$1o,
    registerModelTo: registerModelTo$1o
};

/**
 * @module Schemas/Geometries/LatheBufferGeometry
 * @desc Export the ThreeJs LatheBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$d } = require$$0$1;

let _schema$1w = undefined;
let _model$1n  = undefined;

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

function getModelFrom$1n ( Mongoose ) {

    if ( !_model$1n ) {
        _createModel$1n( Mongoose );
    }

    return _model$1n

}

function _createModel$1n ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$d.getModelFrom( Mongoose );
    _model$1n                        = BufferGeometryBaseModel.discriminator( 'LatheBufferGeometry', getSchemaFrom$1w( Mongoose ) );

}

function registerModelTo$1n ( Mongoose ) {

    if ( !_model$1n ) {
        _createModel$1n( Mongoose );
    }

    return Mongoose

}

var LatheBufferGeometry_1 = {
    name:            'LatheBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1w,
    getModelFrom:    getModelFrom$1n,
    registerModelTo: registerModelTo$1n
};

/**
 * @module Schemas/Geometries/LatheGeometry
 * @desc Export the ThreeJs LatheGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$d } = require$$0;

let _schema$1v = undefined;
let _model$1m  = undefined;

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

function getModelFrom$1m ( Mongoose ) {

    if ( !_model$1m ) {
        _createModel$1m( Mongoose );
    }

    return _model$1m

}

function _createModel$1m ( Mongoose ) {

    const GeometryBaseModel = Geometry$d.getModelFrom( Mongoose );
    _model$1m                  = GeometryBaseModel.discriminator( 'LatheGeometry', getSchemaFrom$1v( Mongoose ) );

}

function registerModelTo$1m ( Mongoose ) {

    if ( !_model$1m ) {
        _createModel$1m( Mongoose );
    }

    return Mongoose

}

var LatheGeometry_1 = {
    name:            'LatheGeometry',
    getSchemaFrom:   getSchemaFrom$1v,
    getModelFrom:    getModelFrom$1m,
    registerModelTo: registerModelTo$1m
};

/**
 * @module Schemas/Geometries/OctahedronBufferGeometry
 * @desc Export the ThreeJs OctahedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$c } = require$$0$1;

let _schema$1u = undefined;
let _model$1l  = undefined;

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

function getModelFrom$1l ( Mongoose ) {

    if ( !_model$1l ) {
        _createModel$1l( Mongoose );
    }

    return _model$1l

}

function _createModel$1l ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$c.getModelFrom( Mongoose );
    _model$1l                        = BufferGeometryBaseModel.discriminator( 'OctahedronBufferGeometry', getSchemaFrom$1u( Mongoose ) );

}

function registerModelTo$1l ( Mongoose ) {

    if ( !_model$1l ) {
        _createModel$1l( Mongoose );
    }

    return Mongoose

}

var OctahedronBufferGeometry_1 = {
    name:            'OctahedronBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1u,
    getModelFrom:    getModelFrom$1l,
    registerModelTo: registerModelTo$1l
};

/**
 * @module Schemas/Geometries/OctahedronGeometry
 * @desc Export the ThreeJs OctahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$c } = require$$0;

let _schema$1t = undefined;
let _model$1k  = undefined;

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

function getModelFrom$1k ( Mongoose ) {

    if ( !_model$1k ) {
        _createModel$1k( Mongoose );
    }

    return _model$1k

}

function _createModel$1k ( Mongoose ) {

    const GeometryBaseModel = Geometry$c.getModelFrom( Mongoose );
    _model$1k                  = GeometryBaseModel.discriminator( 'OctahedronGeometry', getSchemaFrom$1t( Mongoose ) );

}

function registerModelTo$1k ( Mongoose ) {

    if ( !_model$1k ) {
        _createModel$1k( Mongoose );
    }

    return Mongoose

}

var OctahedronGeometry_1 = {
    name:            'OctahedronGeometry',
    getSchemaFrom:   getSchemaFrom$1t,
    getModelFrom:    getModelFrom$1k,
    registerModelTo: registerModelTo$1k
};

/**
 * @module Schemas/Geometries/ParametricBufferGeometry
 * @desc Export the ThreeJs ParametricBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$b } = require$$0$1;

let _schema$1s = undefined;
let _model$1j  = undefined;

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

function getModelFrom$1j ( Mongoose ) {

    if ( !_model$1j ) {
        _createModel$1j( Mongoose );
    }

    return _model$1j

}

function _createModel$1j ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$b.getModelFrom( Mongoose );
    _model$1j                        = BufferGeometryBaseModel.discriminator( 'ParametricBufferGeometry', getSchemaFrom$1s( Mongoose ) );

}

function registerModelTo$1j ( Mongoose ) {

    if ( !_model$1j ) {
        _createModel$1j( Mongoose );
    }

    return Mongoose

}

var ParametricBufferGeometry_1 = {
    name:            'ParametricBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1s,
    getModelFrom:    getModelFrom$1j,
    registerModelTo: registerModelTo$1j
};

/**
 * @module Schemas/Geometries/ParametricGeometry
 * @desc Export the ThreeJs ParametricGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$b } = require$$0;

let _schema$1r = undefined;
let _model$1i  = undefined;

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

function getModelFrom$1i ( Mongoose ) {

    if ( !_model$1i ) {
        _createModel$1i( Mongoose );
    }

    return _model$1i

}

function _createModel$1i ( Mongoose ) {

    const GeometryBaseModel = Geometry$b.getModelFrom( Mongoose );
    _model$1i                  = GeometryBaseModel.discriminator( 'ParametricGeometry', getSchemaFrom$1r( Mongoose ) );

}

function registerModelTo$1i ( Mongoose ) {

    if ( !_model$1i ) {
        _createModel$1i( Mongoose );
    }

    return Mongoose

}

var ParametricGeometry_1 = {
    name:            'ParametricGeometry',
    getSchemaFrom:   getSchemaFrom$1r,
    getModelFrom:    getModelFrom$1i,
    registerModelTo: registerModelTo$1i
};

/**
 * @module Schemas/Geometries/PlaneBufferGeometry
 * @desc Export the ThreeJs PlaneBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$a } = require$$0$1;

let _schema$1q = undefined;
let _model$1h  = undefined;

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

function getModelFrom$1h ( Mongoose ) {

    if ( !_model$1h ) {
        _createModel$1h( Mongoose );
    }

    return _model$1h

}

function _createModel$1h ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$a.getModelFrom( Mongoose );
    _model$1h                        = BufferGeometryBaseModel.discriminator( 'PlaneBufferGeometry', getSchemaFrom$1q( Mongoose ) );

}

function registerModelTo$1h ( Mongoose ) {

    if ( !_model$1h ) {
        _createModel$1h( Mongoose );
    }

    return Mongoose

}

var PlaneBufferGeometry_1 = {
    name:            'PlaneBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1q,
    getModelFrom:    getModelFrom$1h,
    registerModelTo: registerModelTo$1h
};

/**
 * @module Schemas/Geometries/PlaneGeometry
 * @desc Export the ThreeJs PlaneGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$a } = require$$0;

let _schema$1p = undefined;
let _model$1g  = undefined;

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

function getModelFrom$1g ( Mongoose ) {

    if ( !_model$1g ) {
        _createModel$1g( Mongoose );
    }

    return _model$1g

}

function _createModel$1g ( Mongoose ) {

    const GeometryBaseModel = Geometry$a.getModelFrom( Mongoose );
    _model$1g                  = GeometryBaseModel.discriminator( 'PlaneGeometry', getSchemaFrom$1p( Mongoose ) );

}

function registerModelTo$1g ( Mongoose ) {

    if ( !_model$1g ) {
        _createModel$1g( Mongoose );
    }

    return Mongoose

}

var PlaneGeometry_1 = {
    name:            'PlaneGeometry',
    getSchemaFrom:   getSchemaFrom$1p,
    getModelFrom:    getModelFrom$1g,
    registerModelTo: registerModelTo$1g
};

/**
 * @module Schemas/Geometries/PolyhedronBufferGeometry
 * @desc Export the ThreeJs PolyhedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$9 } = require$$0$1;

let _schema$1o = undefined;
let _model$1f  = undefined;

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

function getModelFrom$1f ( Mongoose ) {

    if ( !_model$1f ) {
        _createModel$1f( Mongoose );
    }

    return _model$1f

}

function _createModel$1f ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$9.getModelFrom( Mongoose );
    _model$1f                        = BufferGeometryBaseModel.discriminator( 'PolyhedronBufferGeometry', getSchemaFrom$1o( Mongoose ) );

}

function registerModelTo$1f ( Mongoose ) {

    if ( !_model$1f ) {
        _createModel$1f( Mongoose );
    }

    return Mongoose

}

var PolyhedronBufferGeometry_1 = {
    name:            'PolyhedronBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1o,
    getModelFrom:    getModelFrom$1f,
    registerModelTo: registerModelTo$1f
};

/**
 * @module Schemas/Geometries/PolyhedronGeometry
 * @desc Export the ThreeJs PolyhedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$9 } = require$$0;

let _schema$1n = undefined;
let _model$1e  = undefined;

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

function getModelFrom$1e ( Mongoose ) {

    if ( !_model$1e ) {
        _createModel$1e( Mongoose );
    }

    return _model$1e

}

function _createModel$1e ( Mongoose ) {

    const GeometryBaseModel = Geometry$9.getModelFrom( Mongoose );
    _model$1e                  = GeometryBaseModel.discriminator( 'PolyhedronGeometry', getSchemaFrom$1n( Mongoose ) );

}

function registerModelTo$1e ( Mongoose ) {

    if ( !_model$1e ) {
        _createModel$1e( Mongoose );
    }

    return Mongoose

}

var PolyhedronGeometry_1 = {
    name:            'PolyhedronGeometry',
    getSchemaFrom:   getSchemaFrom$1n,
    getModelFrom:    getModelFrom$1e,
    registerModelTo: registerModelTo$1e
};

/**
 * @module Schemas/Geometries/RingBufferGeometry
 * @desc Export the ThreeJs RingBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$8 } = require$$0$1;

let _schema$1m = undefined;
let _model$1d  = undefined;

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

function getModelFrom$1d ( Mongoose ) {

    if ( !_model$1d ) {
        _createModel$1d( Mongoose );
    }

    return _model$1d

}

function _createModel$1d ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$8.getModelFrom( Mongoose );
    _model$1d                        = BufferGeometryBaseModel.discriminator( 'RingBufferGeometry', getSchemaFrom$1m( Mongoose ) );

}

function registerModelTo$1d ( Mongoose ) {

    if ( !_model$1d ) {
        _createModel$1d( Mongoose );
    }

    return Mongoose

}

var RingBufferGeometry_1 = {
    name:            'RingBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1m,
    getModelFrom:    getModelFrom$1d,
    registerModelTo: registerModelTo$1d
};

/**
 * @module Schemas/Geometries/RingGeometry
 * @desc Export the ThreeJs RingGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$8 } = require$$0;

let _schema$1l = undefined;
let _model$1c  = undefined;

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

function getModelFrom$1c ( Mongoose ) {

    if ( !_model$1c ) {
        _createModel$1c( Mongoose );
    }

    return _model$1c

}

function _createModel$1c ( Mongoose ) {

    const GeometryBaseModel = Geometry$8.getModelFrom( Mongoose );
    _model$1c                  = GeometryBaseModel.discriminator( 'RingGeometry', getSchemaFrom$1l( Mongoose ) );

}

function registerModelTo$1c ( Mongoose ) {

    if ( !_model$1c ) {
        _createModel$1c( Mongoose );
    }

    return Mongoose

}

var RingGeometry_1 = {
    name:            'RingGeometry',
    getSchemaFrom:   getSchemaFrom$1l,
    getModelFrom:    getModelFrom$1c,
    registerModelTo: registerModelTo$1c
};

/**
 * @module Schemas/Geometries/ShapeBufferGeometry
 * @desc Export the ThreeJs ShapeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$7 } = require$$0$1;

let _schema$1k = undefined;
let _model$1b  = undefined;

function getSchemaFrom$1k ( Mongoose ) {

    if ( !_schema$1k ) {
        _createSchema$1k( Mongoose );
    }

    return _schema$1k

}

function _createSchema$1k ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    const NestedCurveSchema = new Schema( {
        type: {
            type:    String,
            default: 'Curve'
        },
        arcLengthDivisions: Number
    }, {
        id:  false,
        _id: false
    } );

    const NestedPathSchema = new Schema( {

        // CurvePath inheritance
        curves:    [ NestedCurveSchema ], // Curve
        autoClose: {
            type:    Boolean,
            default: false
        },

        // Path inheritance
        currentPoint: Vector2

    }, {
        id:  false,
        _id: false
    } );

    const NestedShapeSchema = new Schema( {

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

    }, {
        id:  false,
        _id: false
    } );

    _schema$1k = new Schema( {
        shapes:        [ NestedShapeSchema ],
        curveSegments: Number
    } );

}

function getModelFrom$1b ( Mongoose ) {

    if ( !_model$1b ) {
        _createModel$1b( Mongoose );
    }

    return _model$1b

}

function _createModel$1b ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$7.getModelFrom( Mongoose );
    _model$1b                        = BufferGeometryBaseModel.discriminator( 'ShapeBufferGeometry', getSchemaFrom$1k( Mongoose ) );

}

function registerModelTo$1b ( Mongoose ) {

    if ( !_model$1b ) {
        _createModel$1b( Mongoose );
    }

    return Mongoose

}

var ShapeBufferGeometry_1 = {
    name:            'ShapeBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1k,
    getModelFrom:    getModelFrom$1b,
    registerModelTo: registerModelTo$1b
};

/**
 * @module Schemas/Geometries/ShapeGeometry
 * @desc Export the ThreeJs ShapeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$7 } = require$$0;

let _schema$1j = undefined;
let _model$1a  = undefined;

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

function getModelFrom$1a ( Mongoose ) {

    if ( !_model$1a ) {
        _createModel$1a( Mongoose );
    }

    return _model$1a

}

function _createModel$1a ( Mongoose ) {

    const GeometryBaseModel = Geometry$7.getModelFrom( Mongoose );
    _model$1a                  = GeometryBaseModel.discriminator( 'ShapeGeometry', getSchemaFrom$1j( Mongoose ) );

}

function registerModelTo$1a ( Mongoose ) {

    if ( !_model$1a ) {
        _createModel$1a( Mongoose );
    }

    return Mongoose

}

var ShapeGeometry_1 = {
    name:            'ShapeGeometry',
    getSchemaFrom:   getSchemaFrom$1j,
    getModelFrom:    getModelFrom$1a,
    registerModelTo: registerModelTo$1a
};

/**
 * @module Schemas/Geometries/SphereBufferGeometry
 * @desc Export the ThreeJs SphereBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$6 } = require$$0$1;

let _schema$1i = undefined;
let _model$19  = undefined;

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

function getModelFrom$19 ( Mongoose ) {

    if ( !_model$19 ) {
        _createModel$19( Mongoose );
    }

    return _model$19

}

function _createModel$19 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$6.getModelFrom( Mongoose );
    _model$19                        = BufferGeometryBaseModel.discriminator( 'SphereBufferGeometry', getSchemaFrom$1i( Mongoose ) );

}

function registerModelTo$19 ( Mongoose ) {

    if ( !_model$19 ) {
        _createModel$19( Mongoose );
    }

    return Mongoose

}

var SphereBufferGeometry_1 = {
    name:            'SphereBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1i,
    getModelFrom:    getModelFrom$19,
    registerModelTo: registerModelTo$19
};

/**
 * @module Schemas/Geometries/SphereGeometry
 * @desc Export the ThreeJs SphereGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$6 } = require$$0;

let _schema$1h = undefined;
let _model$18  = undefined;

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

function getModelFrom$18 ( Mongoose ) {

    if ( !_model$18 ) {
        _createModel$18( Mongoose );
    }

    return _model$18

}

function _createModel$18 ( Mongoose ) {

    const GeometryBaseModel = Geometry$6.getModelFrom( Mongoose );
    _model$18                  = GeometryBaseModel.discriminator( 'SphereGeometry', getSchemaFrom$1h( Mongoose ) );

}

function registerModelTo$18 ( Mongoose ) {

    if ( !_model$18 ) {
        _createModel$18( Mongoose );
    }

    return Mongoose

}

var SphereGeometry_1 = {
    name:            'SphereGeometry',
    getSchemaFrom:   getSchemaFrom$1h,
    getModelFrom:    getModelFrom$18,
    registerModelTo: registerModelTo$18
};

/**
 * @module Schemas/Geometries/TeapotBufferGeometry
 * @desc Export the ThreeJs TeapotBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$5 } = require$$0$1;

let _schema$1g = undefined;
let _model$17  = undefined;

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

function getModelFrom$17 ( Mongoose ) {

    if ( !_model$17 ) {
        _createModel$17( Mongoose );
    }

    return _model$17

}

function _createModel$17 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$5.getModelFrom( Mongoose );
    _model$17                        = BufferGeometryBaseModel.discriminator( 'TeapotBufferGeometry', getSchemaFrom$1g( Mongoose ) );

}

function registerModelTo$17 ( Mongoose ) {

    if ( !_model$17 ) {
        _createModel$17( Mongoose );
    }

    return Mongoose

}

var TeapotBufferGeometry = {
    name:            'TeapotBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1g,
    getModelFrom:    getModelFrom$17,
    registerModelTo: registerModelTo$17
};

/**
 * @module Schemas/Geometries/TetrahedronBufferGeometry
 * @desc Export the ThreeJs TetrahedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$4 } = require$$0$1;

let _schema$1f = undefined;
let _model$16  = undefined;

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

function getModelFrom$16 ( Mongoose ) {

    if ( !_model$16 ) {
        _createModel$16( Mongoose );
    }

    return _model$16

}

function _createModel$16 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$4.getModelFrom( Mongoose );
    _model$16                        = BufferGeometryBaseModel.discriminator( 'TetrahedronBufferGeometry', getSchemaFrom$1f( Mongoose ) );

}

function registerModelTo$16 ( Mongoose ) {

    if ( !_model$16 ) {
        _createModel$16( Mongoose );
    }

    return Mongoose

}

var TetrahedronBufferGeometry_1 = {
    name:            'TetrahedronBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1f,
    getModelFrom:    getModelFrom$16,
    registerModelTo: registerModelTo$16
};

/**
 * @module Schemas/Geometries/TetrahedronGeometry
 * @desc Export the ThreeJs TetrahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$5 } = require$$0;

let _schema$1e = undefined;
let _model$15  = undefined;

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

function getModelFrom$15 ( Mongoose ) {

    if ( !_model$15 ) {
        _createModel$15( Mongoose );
    }

    return _model$15

}

function _createModel$15 ( Mongoose ) {

    const GeometryBaseModel = Geometry$5.getModelFrom( Mongoose );
    _model$15                  = GeometryBaseModel.discriminator( 'TetrahedronGeometry', getSchemaFrom$1e( Mongoose ) );

}

function registerModelTo$15 ( Mongoose ) {

    if ( !_model$15 ) {
        _createModel$15( Mongoose );
    }

    return Mongoose

}

var TetrahedronGeometry_1 = {
    name:            'TetrahedronGeometry',
    getSchemaFrom:   getSchemaFrom$1e,
    getModelFrom:    getModelFrom$15,
    registerModelTo: registerModelTo$15
};

/**
 * @module Schemas/Geometries/TextBufferGeometry
 * @desc Export the ThreeJs TextBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$3 } = require$$0$1;

let _schema$1d = undefined;
let _model$14  = undefined;

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

function getModelFrom$14 ( Mongoose ) {

    if ( !_model$14 ) {
        _createModel$14( Mongoose );
    }

    return _model$14

}

function _createModel$14 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$3.getModelFrom( Mongoose );
    _model$14                        = BufferGeometryBaseModel.discriminator( 'TextBufferGeometry', getSchemaFrom$1d( Mongoose ) );

}

function registerModelTo$14 ( Mongoose ) {

    if ( !_model$14 ) {
        _createModel$14( Mongoose );
    }

    return Mongoose

}

var TextBufferGeometry_1 = {
    name:            'TextBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1d,
    getModelFrom:    getModelFrom$14,
    registerModelTo: registerModelTo$14
};

/**
 * @module Schemas/Geometries/TextGeometry
 * @desc Export the ThreeJs TextGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$4 } = require$$0;

let _schema$1c = undefined;
let _model$13  = undefined;

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

function getModelFrom$13 ( Mongoose ) {

    if ( !_model$13 ) {
        _createModel$13( Mongoose );
    }

    return _model$13

}

function _createModel$13 ( Mongoose ) {

    const GeometryBaseModel = Geometry$4.getModelFrom( Mongoose );
    _model$13                  = GeometryBaseModel.discriminator( 'TextGeometry', getSchemaFrom$1c( Mongoose ) );

}

function registerModelTo$13 ( Mongoose ) {

    if ( !_model$13 ) {
        _createModel$13( Mongoose );
    }

    return Mongoose

}

var TextGeometry_1 = {
    name:            'TextGeometry',
    getSchemaFrom:   getSchemaFrom$1c,
    getModelFrom:    getModelFrom$13,
    registerModelTo: registerModelTo$13
};

/**
 * @module Schemas/Geometries/TorusBufferGeometry
 * @desc Export the ThreeJs TorusBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$2 } = require$$0$1;

let _schema$1b = undefined;
let _model$12  = undefined;

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

function getModelFrom$12 ( Mongoose ) {

    if ( !_model$12 ) {
        _createModel$12( Mongoose );
    }

    return _model$12

}

function _createModel$12 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$2.getModelFrom( Mongoose );
    _model$12                        = BufferGeometryBaseModel.discriminator( 'TorusBufferGeometry', getSchemaFrom$1b( Mongoose ) );

}

function registerModelTo$12 ( Mongoose ) {

    if ( !_model$12 ) {
        _createModel$12( Mongoose );
    }

    return Mongoose

}

var TorusBufferGeometry_1 = {
    name:            'TorusBufferGeometry',
    getSchemaFrom:   getSchemaFrom$1b,
    getModelFrom:    getModelFrom$12,
    registerModelTo: registerModelTo$12
};

/**
 * @module Schemas/Geometries/TorusGeometry
 * @desc Export the ThreeJs TorusGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$3 } = require$$0;

let _schema$1a = undefined;
let _model$11  = undefined;

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

function getModelFrom$11 ( Mongoose ) {

    if ( !_model$11 ) {
        _createModel$11( Mongoose );
    }

    return _model$11

}

function _createModel$11 ( Mongoose ) {

    const GeometryBaseModel = Geometry$3.getModelFrom( Mongoose );
    _model$11                  = GeometryBaseModel.discriminator( 'TorusGeometry', getSchemaFrom$1a( Mongoose ) );

}

function registerModelTo$11 ( Mongoose ) {

    if ( !_model$11 ) {
        _createModel$11( Mongoose );
    }

    return Mongoose

}

var TorusGeometry_1 = {
    name:            'TorusGeometry',
    getSchemaFrom:   getSchemaFrom$1a,
    getModelFrom:    getModelFrom$11,
    registerModelTo: registerModelTo$11
};

/**
 * @module Schemas/Geometries/TorusKnotBufferGeometry
 * @desc Export the ThreeJs TorusKnotBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry: BufferGeometry$1 } = require$$0$1;

let _schema$19 = undefined;
let _model$10  = undefined;

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

function getModelFrom$10 ( Mongoose ) {

    if ( !_model$10 ) {
        _createModel$10( Mongoose );
    }

    return _model$10

}

function _createModel$10 ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry$1.getModelFrom( Mongoose );
    _model$10                        = BufferGeometryBaseModel.discriminator( 'TorusKnotBufferGeometry', getSchemaFrom$19( Mongoose ) );

}

function registerModelTo$10 ( Mongoose ) {

    if ( !_model$10 ) {
        _createModel$10( Mongoose );
    }

    return Mongoose

}

var TorusKnotBufferGeometry_1 = {
    name:            'TorusKnotBufferGeometry',
    getSchemaFrom:   getSchemaFrom$19,
    getModelFrom:    getModelFrom$10,
    registerModelTo: registerModelTo$10
};

/**
 * @module Schemas/Geometries/TorusKnotGeometry
 * @desc Export the ThreeJs TorusKnotGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$2 } = require$$0;

let _schema$18 = undefined;
let _model$$  = undefined;

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

function getModelFrom$$ ( Mongoose ) {

    if ( !_model$$ ) {
        _createModel$$( Mongoose );
    }

    return _model$$

}

function _createModel$$ ( Mongoose ) {

    const GeometryBaseModel = Geometry$2.getModelFrom( Mongoose );
    _model$$                  = GeometryBaseModel.discriminator( 'TorusKnotGeometry', getSchemaFrom$18( Mongoose ) );

}

function registerModelTo$$ ( Mongoose ) {

    if ( !_model$$ ) {
        _createModel$$( Mongoose );
    }

    return Mongoose

}

var TorusKnotGeometry_1 = {
    name:            'TorusKnotGeometry',
    getSchemaFrom:   getSchemaFrom$18,
    getModelFrom:    getModelFrom$$,
    registerModelTo: registerModelTo$$
};

/**
 * @module Schemas/Geometries/TubeBufferGeometry
 * @desc Export the ThreeJs TubeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry } = require$$0$1;

let _schema$17 = undefined;
let _model$_  = undefined;

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

function getModelFrom$_ ( Mongoose ) {

    if ( !_model$_ ) {
        _createModel$_( Mongoose );
    }

    return _model$_

}

function _createModel$_ ( Mongoose ) {

    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
    _model$_                        = BufferGeometryBaseModel.discriminator( 'TubeBufferGeometry', getSchemaFrom$17( Mongoose ) );

}

function registerModelTo$_ ( Mongoose ) {

    if ( !_model$_ ) {
        _createModel$_( Mongoose );
    }

    return Mongoose

}

var TubeBufferGeometry_1 = {
    name:            'TubeBufferGeometry',
    getSchemaFrom:   getSchemaFrom$17,
    getModelFrom:    getModelFrom$_,
    registerModelTo: registerModelTo$_
};

/**
 * @module Schemas/Geometries/TubeGeometry
 * @desc Export the ThreeJs TubeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry: Geometry$1 } = require$$0;

let _schema$16 = undefined;
let _model$Z  = undefined;

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

function getModelFrom$Z ( Mongoose ) {

    if ( !_model$Z ) {
        _createModel$Z( Mongoose );
    }

    return _model$Z

}

function _createModel$Z ( Mongoose ) {

    const GeometryBaseModel = Geometry$1.getModelFrom( Mongoose );
    _model$Z                  = GeometryBaseModel.discriminator( 'TubeGeometry', getSchemaFrom$16( Mongoose ) );

}

function registerModelTo$Z ( Mongoose ) {

    if ( !_model$Z ) {
        _createModel$Z( Mongoose );
    }

    return Mongoose

}

var TubeGeometry_1 = {
    name:            'TubeGeometry',
    getSchemaFrom:   getSchemaFrom$16,
    getModelFrom:    getModelFrom$Z,
    registerModelTo: registerModelTo$Z
};

/**
 * @module Schemas/Geometries/WireframeGeometry
 * @desc Export the ThreeJs WireframeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry } = require$$0;

let _schema$15 = undefined;
let _model$Y  = undefined;

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

function getModelFrom$Y ( Mongoose ) {

    if ( !_model$Y ) {
        _createModel$Y( Mongoose );
    }

    return _model$Y

}

function _createModel$Y ( Mongoose ) {

    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
    _model$Y                  = GeometryBaseModel.discriminator( 'WireframeGeometry', getSchemaFrom$15( Mongoose ) );

}

function registerModelTo$Y ( Mongoose ) {

    if ( !_model$Y ) {
        _createModel$Y( Mongoose );
    }

    return Mongoose

}

var WireframeGeometry_1 = {
    name:            'WireframeGeometry',
    getSchemaFrom:   getSchemaFrom$15,
    getModelFrom:    getModelFrom$Y,
    registerModelTo: registerModelTo$Y
};

/**
 * @module Schemas/Helpers/ArrowHelper
 * @desc Export the ThreeJs ArrowHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$z } = require$$0$2;

let _schema$14 = undefined;
let _model$X  = undefined;

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

function getModelFrom$X ( Mongoose ) {

    if ( !_model$X ) {
        _createModel$X( Mongoose );
    }

    return _model$X

}

function _createModel$X ( Mongoose ) {

    const Object3DBaseModel = Object3D$z.getModelFrom( Mongoose );
    _model$X                  = Object3DBaseModel.discriminator( 'ArrowHelper', getSchemaFrom$14( Mongoose ) );

}

function registerModelTo$X ( Mongoose ) {

    if ( !_model$X ) {
        _createModel$X( Mongoose );
    }

    return Mongoose

}

var ArrowHelper_1 = {
    name:            'ArrowHelper',
    getSchemaFrom:   getSchemaFrom$14,
    getModelFrom:    getModelFrom$X,
    registerModelTo: registerModelTo$X
};

/**
 * @module Schemas/Helpers/AxesHelper
 * @desc Export the ThreeJs AxesHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$y } = require$$0$2;

let _schema$13 = undefined;
let _model$W  = undefined;

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

function getModelFrom$W ( Mongoose ) {

    if ( !_model$W ) {
        _createModel$W( Mongoose );
    }

    return _model$W

}

function _createModel$W ( Mongoose ) {

    const Object3DBaseModel = Object3D$y.getModelFrom( Mongoose );
    _model$W                  = Object3DBaseModel.discriminator( 'AxesHelper', getSchemaFrom$13( Mongoose ) );

}

function registerModelTo$W ( Mongoose ) {

    if ( !_model$W ) {
        _createModel$W( Mongoose );
    }

    return Mongoose

}

var AxesHelper_1 = {
    name:            'AxesHelper',
    getSchemaFrom:   getSchemaFrom$13,
    getModelFrom:    getModelFrom$W,
    registerModelTo: registerModelTo$W
};

/**
 * @module Schemas/Helpers/Box3Helper
 * @desc Export the ThreeJs Box3Helper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$x } = require$$0$2;

let _schema$12 = undefined;
let _model$V  = undefined;

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

function getModelFrom$V ( Mongoose ) {

    if ( !_model$V ) {
        _createModel$V( Mongoose );
    }

    return _model$V

}

function _createModel$V ( Mongoose ) {

    const Object3DBaseModel = Object3D$x.getModelFrom( Mongoose );
    _model$V                  = Object3DBaseModel.discriminator( 'Box3Helper', getSchemaFrom$12( Mongoose ) );

}

function registerModelTo$V ( Mongoose ) {

    if ( !_model$V ) {
        _createModel$V( Mongoose );
    }

    return Mongoose

}

var Box3Helper_1 = {
    name:            'Box3Helper',
    getSchemaFrom:   getSchemaFrom$12,
    getModelFrom:    getModelFrom$V,
    registerModelTo: registerModelTo$V
};

/**
 * @module Schemas/Helpers/BoxHelper
 * @desc Export the ThreeJs BoxHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$w } = require$$0$2;

let _schema$11 = undefined;
let _model$U  = undefined;

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

function getModelFrom$U ( Mongoose ) {

    if ( !_model$U ) {
        _createModel$U( Mongoose );
    }

    return _model$U

}

function _createModel$U ( Mongoose ) {

    const Object3DBaseModel = Object3D$w.getModelFrom( Mongoose );
    _model$U                  = Object3DBaseModel.discriminator( 'BoxHelper', getSchemaFrom$11( Mongoose ) );

}

function registerModelTo$U ( Mongoose ) {

    if ( !_model$U ) {
        _createModel$U( Mongoose );
    }

    return Mongoose

}

var BoxHelper_1 = {
    name:            'BoxHelper',
    getSchemaFrom:   getSchemaFrom$11,
    getModelFrom:    getModelFrom$U,
    registerModelTo: registerModelTo$U
};

/**
 * @module Schemas/Helpers/CameraHelper
 * @desc Export the ThreeJs CameraHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$v } = require$$0$2;

let _schema$10 = undefined;
let _model$T  = undefined;

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

function getModelFrom$T ( Mongoose ) {

    if ( !_model$T ) {
        _createModel$T( Mongoose );
    }

    return _model$T

}

function _createModel$T ( Mongoose ) {

    const Object3DBaseModel = Object3D$v.getModelFrom( Mongoose );
    _model$T                  = Object3DBaseModel.discriminator( 'CameraHelper', getSchemaFrom$10( Mongoose ) );

}

function registerModelTo$T ( Mongoose ) {

    if ( !_model$T ) {
        _createModel$T( Mongoose );
    }

    return Mongoose

}

var CameraHelper_1 = {
    name:            'CameraHelper',
    getSchemaFrom:   getSchemaFrom$10,
    getModelFrom:    getModelFrom$T,
    registerModelTo: registerModelTo$T
};

/**
 * @module Schemas/Helpers/DirectionalLightHelper
 * @desc Export the ThreeJs DirectionalLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$u } = require$$0$2;

let _schema$$ = undefined;
let _model$S  = undefined;

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

function getModelFrom$S ( Mongoose ) {

    if ( !_model$S ) {
        _createModel$S( Mongoose );
    }

    return _model$S

}

function _createModel$S ( Mongoose ) {

    const Object3DBaseModel = Object3D$u.getModelFrom( Mongoose );
    _model$S                  = Object3DBaseModel.discriminator( 'DirectionalLightHelper', getSchemaFrom$$( Mongoose ) );

}

function registerModelTo$S ( Mongoose ) {

    if ( !_model$S ) {
        _createModel$S( Mongoose );
    }

    return Mongoose

}

var DirectionalLightHelper_1 = {
    name:            'DirectionalLightHelper',
    getSchemaFrom:   getSchemaFrom$$,
    getModelFrom:    getModelFrom$S,
    registerModelTo: registerModelTo$S
};

/**
 * @module Schemas/Helpers/FaceNormalsHelper
 * @desc Export the ThreeJs FaceNormalsHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$t } = require$$0$2;

let _schema$_ = undefined;
let _model$R  = undefined;

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

function getModelFrom$R ( Mongoose ) {

    if ( !_model$R ) {
        _createModel$R( Mongoose );
    }

    return _model$R

}

function _createModel$R ( Mongoose ) {

    const Object3DBaseModel = Object3D$t.getModelFrom( Mongoose );
    _model$R                  = Object3DBaseModel.discriminator( 'FaceNormalsHelper', getSchemaFrom$_( Mongoose ) );

}

function registerModelTo$R ( Mongoose ) {

    if ( !_model$R ) {
        _createModel$R( Mongoose );
    }

    return Mongoose

}

var FaceNormalsHelper_1 = {
    name:            'FaceNormalsHelper',
    getSchemaFrom:   getSchemaFrom$_,
    getModelFrom:    getModelFrom$R,
    registerModelTo: registerModelTo$R
};

/**
 * @module Schemas/Helpers/GridHelper
 * @desc Export the ThreeJs GridHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$s } = require$$0$2;

let _schema$Z = undefined;
let _model$Q  = undefined;

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

function getModelFrom$Q ( Mongoose ) {

    if ( !_model$Q ) {
        _createModel$Q( Mongoose );
    }

    return _model$Q

}

function _createModel$Q ( Mongoose ) {

    const Object3DBaseModel = Object3D$s.getModelFrom( Mongoose );
    _model$Q                  = Object3DBaseModel.discriminator( 'GridHelper', getSchemaFrom$Z( Mongoose ) );

}

function registerModelTo$Q ( Mongoose ) {

    if ( !_model$Q ) {
        _createModel$Q( Mongoose );
    }

    return Mongoose

}

var GridHelper_1 = {
    name:            'GridHelper',
    getSchemaFrom:   getSchemaFrom$Z,
    getModelFrom:    getModelFrom$Q,
    registerModelTo: registerModelTo$Q
};

/**
 * @module Schemas/Helpers/HemisphereLightHelper
 * @desc Export the ThreeJs HemisphereLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$r } = require$$0$2;

let _schema$Y = undefined;
let _model$P  = undefined;

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

function getModelFrom$P ( Mongoose ) {

    if ( !_model$P ) {
        _createModel$P( Mongoose );
    }

    return _model$P

}

function _createModel$P ( Mongoose ) {

    const Object3DBaseModel = Object3D$r.getModelFrom( Mongoose );
    _model$P                  = Object3DBaseModel.discriminator( 'HemisphereLightHelper', getSchemaFrom$Y( Mongoose ) );

}

function registerModelTo$P ( Mongoose ) {

    if ( !_model$P ) {
        _createModel$P( Mongoose );
    }

    return Mongoose

}

var HemisphereLightHelper_1 = {
    name:            'HemisphereLightHelper',
    getSchemaFrom:   getSchemaFrom$Y,
    getModelFrom:    getModelFrom$P,
    registerModelTo: registerModelTo$P
};

/**
 * @module Schemas/Helpers/PlaneHelper
 * @desc Export the ThreeJs PlaneHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$q } = require$$0$2;

let _schema$X = undefined;
let _model$O  = undefined;

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

function getModelFrom$O ( Mongoose ) {

    if ( !_model$O ) {
        _createModel$O( Mongoose );
    }

    return _model$O

}

function _createModel$O ( Mongoose ) {

    const Object3DBaseModel = Object3D$q.getModelFrom( Mongoose );
    _model$O                  = Object3DBaseModel.discriminator( 'PlaneHelper', getSchemaFrom$X( Mongoose ) );

}

function registerModelTo$O ( Mongoose ) {

    if ( !_model$O ) {
        _createModel$O( Mongoose );
    }

    return Mongoose

}

var PlaneHelper_1 = {
    name:            'PlaneHelper',
    getSchemaFrom:   getSchemaFrom$X,
    getModelFrom:    getModelFrom$O,
    registerModelTo: registerModelTo$O
};

/**
 * @module Schemas/Helpers/PointLightHelper
 * @desc Export the ThreeJs PointLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$p } = require$$0$2;

let _schema$W = undefined;
let _model$N  = undefined;

function getSchemaFrom$W ( Mongoose ) {

    if ( !_schema$W ) {
        _createSchema$W( Mongoose );
    }

    return _schema$W

}

function _createSchema$W ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$W = new Schema( {} );

}

function getModelFrom$N ( Mongoose ) {

    if ( !_model$N ) {
        _createModel$N( Mongoose );
    }

    return _model$N

}

function _createModel$N ( Mongoose ) {

    const Object3DBaseModel = Object3D$p.getModelFrom( Mongoose );
    _model$N                  = Object3DBaseModel.discriminator( 'PointLightHelper', getSchemaFrom$W( Mongoose ) );

}

function registerModelTo$N ( Mongoose ) {

    if ( !_model$N ) {
        _createModel$N( Mongoose );
    }

    return Mongoose

}

var PointLightHelper_1 = {
    name:            'PointLightHelper',
    getSchemaFrom:   getSchemaFrom$W,
    getModelFrom:    getModelFrom$N,
    registerModelTo: registerModelTo$N
};

/**
 * @module Schemas/Helpers/PolarGridHelper
 * @desc Export the ThreeJs PolarGridHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$o } = require$$0$2;

let _schema$V = undefined;
let _model$M  = undefined;

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

function getModelFrom$M ( Mongoose ) {

    if ( !_model$M ) {
        _createModel$M( Mongoose );
    }

    return _model$M

}

function _createModel$M ( Mongoose ) {

    const Object3DBaseModel = Object3D$o.getModelFrom( Mongoose );
    _model$M                  = Object3DBaseModel.discriminator( 'PolarGridHelper', getSchemaFrom$V( Mongoose ) );

}

function registerModelTo$M ( Mongoose ) {

    if ( !_model$M ) {
        _createModel$M( Mongoose );
    }

    return Mongoose

}

var PolarGridHelper_1 = {
    name:            'PolarGridHelper',
    getSchemaFrom:   getSchemaFrom$V,
    getModelFrom:    getModelFrom$M,
    registerModelTo: registerModelTo$M
};

/**
 * @module Schemas/Helpers/RectAreaLightHelper
 * @desc Export the ThreeJs RectAreaLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$n } = require$$0$2;

let _schema$U = undefined;
let _model$L  = undefined;

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

function getModelFrom$L ( Mongoose ) {

    if ( !_model$L ) {
        _createModel$L( Mongoose );
    }

    return _model$L

}

function _createModel$L ( Mongoose ) {

    const Object3DBaseModel = Object3D$n.getModelFrom( Mongoose );
    _model$L                  = Object3DBaseModel.discriminator( 'RectAreaLightHelper', getSchemaFrom$U( Mongoose ) );

}

function registerModelTo$L ( Mongoose ) {

    if ( !_model$L ) {
        _createModel$L( Mongoose );
    }

    return Mongoose

}

var RectAreaLightHelper_1 = {
    name:            'RectAreaLightHelper',
    getSchemaFrom:   getSchemaFrom$U,
    getModelFrom:    getModelFrom$L,
    registerModelTo: registerModelTo$L
};

/**
 * @module Schemas/Helpers/SkeletonHelper
 * @desc Export the ThreeJs SkeletonHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$m } = require$$0$2;

let _schema$T = undefined;
let _model$K  = undefined;

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

function getModelFrom$K ( Mongoose ) {

    if ( !_model$K ) {
        _createModel$K( Mongoose );
    }

    return _model$K

}

function _createModel$K ( Mongoose ) {

    const Object3DBaseModel = Object3D$m.getModelFrom( Mongoose );
    _model$K                  = Object3DBaseModel.discriminator( 'SkeletonHelper', getSchemaFrom$T( Mongoose ) );

}

function registerModelTo$K ( Mongoose ) {

    if ( !_model$K ) {
        _createModel$K( Mongoose );
    }

    return Mongoose

}

var SkeletonHelper_1 = {
    name:            'SkeletonHelper',
    getSchemaFrom:   getSchemaFrom$T,
    getModelFrom:    getModelFrom$K,
    registerModelTo: registerModelTo$K
};

/**
 * @module Schemas/Helpers/SpotLightHelper
 * @desc Export the ThreeJs SpotLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$l } = require$$0$2;

let _schema$S = undefined;
let _model$J  = undefined;

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

function getModelFrom$J ( Mongoose ) {

    if ( !_model$J ) {
        _createModel$J( Mongoose );
    }

    return _model$J

}

function _createModel$J ( Mongoose ) {

    const Object3DBaseModel = Object3D$l.getModelFrom( Mongoose );
    _model$J                  = Object3DBaseModel.discriminator( 'SpotLightHelper', getSchemaFrom$S( Mongoose ) );

}

function registerModelTo$J ( Mongoose ) {

    if ( !_model$J ) {
        _createModel$J( Mongoose );
    }

    return Mongoose

}

var SpotLightHelper_1 = {
    name:            'SpotLightHelper',
    getSchemaFrom:   getSchemaFrom$S,
    getModelFrom:    getModelFrom$J,
    registerModelTo: registerModelTo$J
};

/**
 * @module Schemas/Helpers/VertexNormalsHelper
 * @desc Export the ThreeJs VertexNormalsHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$k } = require$$0$2;

let _schema$R = undefined;
let _model$I  = undefined;

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

function getModelFrom$I ( Mongoose ) {

    if ( !_model$I ) {
        _createModel$I( Mongoose );
    }

    return _model$I

}

function _createModel$I ( Mongoose ) {

    const Object3DBaseModel = Object3D$k.getModelFrom( Mongoose );
    _model$I                  = Object3DBaseModel.discriminator( 'VertexNormalsHelper', getSchemaFrom$R( Mongoose ) );

}

function registerModelTo$I ( Mongoose ) {

    if ( !_model$I ) {
        _createModel$I( Mongoose );
    }

    return Mongoose

}

var VertexNormalsHelper_1 = {
    name:            'VertexNormalsHelper',
    getSchemaFrom:   getSchemaFrom$R,
    getModelFrom:    getModelFrom$I,
    registerModelTo: registerModelTo$I
};

/**
 * @module Schemas/Lights/AmbientLight
 * @desc Export the ThreeJs AmbientLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$j } = require$$0$2;

let _schema$Q = undefined;
let _model$H  = undefined;

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

function getModelFrom$H ( Mongoose ) {

    if ( !_model$H ) {
        _createModel$H( Mongoose );
    }

    return _model$H

}

function _createModel$H ( Mongoose ) {

    const Object3DBaseModel = Object3D$j.getModelFrom( Mongoose );
    _model$H                  = Object3DBaseModel.discriminator( 'AmbientLight', getSchemaFrom$Q( Mongoose ) );

}

function registerModelTo$H ( Mongoose ) {

    if ( !_model$H ) {
        _createModel$H( Mongoose );
    }

    return Mongoose

}

var AmbientLight_1 = {
    name:            'AmbientLight',
    getSchemaFrom:   getSchemaFrom$Q,
    getModelFrom:    getModelFrom$H,
    registerModelTo: registerModelTo$H
};

/**
 * @module Schemas/Lights/DirectionalLight
 * @desc Export the ThreeJs DirectionalLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$i } = require$$0$2;

let _schema$P = undefined;
let _model$G  = undefined;

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

function getModelFrom$G ( Mongoose ) {

    if ( !_model$G ) {
        _createModel$G( Mongoose );
    }

    return _model$G

}

function _createModel$G ( Mongoose ) {

    const Object3DBaseModel = Object3D$i.getModelFrom( Mongoose );
    _model$G                  = Object3DBaseModel.discriminator( 'DirectionalLight', getSchemaFrom$P( Mongoose ) );

}

function registerModelTo$G ( Mongoose ) {

    if ( !_model$G ) {
        _createModel$G( Mongoose );
    }

    return Mongoose

}

var DirectionalLight_1 = {
    name:            'DirectionalLight',
    getSchemaFrom:   getSchemaFrom$P,
    getModelFrom:    getModelFrom$G,
    registerModelTo: registerModelTo$G
};

/**
 * @module Schemas/Lights/HemisphereLight
 * @desc Export the ThreeJs HemisphereLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$h } = require$$0$2;

let _schema$O = undefined;
let _model$F  = undefined;

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

function getModelFrom$F ( Mongoose ) {

    if ( !_model$F ) {
        _createModel$F( Mongoose );
    }

    return _model$F

}

function _createModel$F ( Mongoose ) {

    const Object3DBaseModel = Object3D$h.getModelFrom( Mongoose );
    _model$F                  = Object3DBaseModel.discriminator( 'HemisphereLight', getSchemaFrom$O( Mongoose ) );

}

function registerModelTo$F ( Mongoose ) {

    if ( !_model$F ) {
        _createModel$F( Mongoose );
    }

    return Mongoose

}

var HemisphereLight_1 = {
    name:            'HemisphereLight',
    getSchemaFrom:   getSchemaFrom$O,
    getModelFrom:    getModelFrom$F,
    registerModelTo: registerModelTo$F
};

/**
 * @module Schemas/Lights/Light
 * @desc Export the ThreeJs Light Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$g } = require$$0$2;

let _schema$N = undefined;
let _model$E  = undefined;

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

function getModelFrom$E ( Mongoose ) {

    if ( !_model$E ) {
        _createModel$E( Mongoose );
    }

    return _model$E

}

function _createModel$E ( Mongoose ) {

    const Object3DBaseModel = Object3D$g.getModelFrom( Mongoose );
    _model$E                  = Object3DBaseModel.discriminator( 'Light', getSchemaFrom$N( Mongoose ) );

}

function registerModelTo$E ( Mongoose ) {

    if ( !_model$E ) {
        _createModel$E( Mongoose );
    }

    return Mongoose

}

var Light_1 = {
    name:            'Light',
    getSchemaFrom:   getSchemaFrom$N,
    getModelFrom:    getModelFrom$E,
    registerModelTo: registerModelTo$E
};

/**
 * @module Schemas/Lights/PointLight
 * @desc Export the ThreeJs PointLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$f } = require$$0$2;

let _schema$M = undefined;
let _model$D  = undefined;

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

function getModelFrom$D ( Mongoose ) {

    if ( !_model$D ) {
        _createModel$D( Mongoose );
    }

    return _model$D

}

function _createModel$D ( Mongoose ) {

    const Object3DBaseModel = Object3D$f.getModelFrom( Mongoose );
    _model$D                  = Object3DBaseModel.discriminator( 'PointLight', getSchemaFrom$M( Mongoose ) );

}

function registerModelTo$D ( Mongoose ) {

    if ( !_model$D ) {
        _createModel$D( Mongoose );
    }

    return Mongoose

}

var PointLight_1 = {
    name:            'PointLight',
    getSchemaFrom:   getSchemaFrom$M,
    getModelFrom:    getModelFrom$D,
    registerModelTo: registerModelTo$D
};

/**
 * @module Schemas/Lights/RectAreaLight
 * @desc Export the ThreeJs RectAreaLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$e } = require$$0$2;

let _schema$L = undefined;
let _model$C  = undefined;

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

function getModelFrom$C ( Mongoose ) {

    if ( !_model$C ) {
        _createModel$C( Mongoose );
    }

    return _model$C

}

function _createModel$C ( Mongoose ) {

    const Object3DBaseModel = Object3D$e.getModelFrom( Mongoose );
    _model$C                  = Object3DBaseModel.discriminator( 'RectAreaLight', getSchemaFrom$L( Mongoose ) );

}

function registerModelTo$C ( Mongoose ) {

    if ( !_model$C ) {
        _createModel$C( Mongoose );
    }

    return Mongoose

}

var RectAreaLight_1 = {
    name:            'RectAreaLight',
    getSchemaFrom:   getSchemaFrom$L,
    getModelFrom:    getModelFrom$C,
    registerModelTo: registerModelTo$C
};

/**
 * @module Schemas/Lights/SpotLight
 * @desc Export the ThreeJs SpotLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$d } = require$$0$2;

let _schema$K = undefined;
let _model$B  = undefined;

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

function getModelFrom$B ( Mongoose ) {

    if ( !_model$B ) {
        _createModel$B( Mongoose );
    }

    return _model$B

}

function _createModel$B ( Mongoose ) {

    const Object3DBaseModel = Object3D$d.getModelFrom( Mongoose );
    _model$B                  = Object3DBaseModel.discriminator( 'SpotLight', getSchemaFrom$K( Mongoose ) );

}

function registerModelTo$B ( Mongoose ) {

    if ( !_model$B ) {
        _createModel$B( Mongoose );
    }

    return Mongoose

}

var SpotLight_1 = {
    name:            'SpotLight',
    getSchemaFrom:   getSchemaFrom$K,
    getModelFrom:    getModelFrom$B,
    registerModelTo: registerModelTo$B
};

var Material$f = {};

/**
 * @module Schemas/Materials/Material
 * @desc Export the ThreeJs Material Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$J = undefined;
let _model$A  = undefined;

function getSchemaFrom$J ( Mongoose ) {

    if ( !_schema$J ) {
        _createSchema$J( Mongoose );
    }

    return _schema$J

}

function _createSchema$J ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$J = new Schema( {
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

function getModelFrom$A ( Mongoose ) {

    if ( !_model$A ) {
        _createModel$A( Mongoose );
    }

    return _model$A

}

function _createModel$A ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$A = Mongoose.model( 'Materials', getSchemaFrom$J( Mongoose ) );
    _model$A.discriminator( 'Material', new Mongoose.Schema( {} ) );

}

function registerModelTo$A ( Mongoose ) {

    if ( !_model$A ) {
        _createModel$A( Mongoose );
    }

    return Mongoose

}

var Material_1 = Material$f.Material = {
    name:            'Material',
    getSchemaFrom:   getSchemaFrom$J,
    getModelFrom:    getModelFrom$A,
    registerModelTo: registerModelTo$A
};

/**
 * @module Schemas/Materials/LineBasicMaterial
 * @desc Export the ThreeJs LineBasicMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$e } = Material$f;

let _schema$I = undefined;
let _model$z  = undefined;

function getSchemaFrom$I ( Mongoose ) {

    if ( !_schema$I ) {
        _createSchema$I( Mongoose );
    }

    return _schema$I

}

function _createSchema$I ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;

    _schema$I = new Schema( {
        color:     Color,
        light:     Boolean,
        lineWidth: Number,
        linecap:   String,
        linejoin:  String
    } );

}

function getModelFrom$z ( Mongoose ) {

    if ( !_model$z ) {
        _createModel$z( Mongoose );
    }

    return _model$z

}

function _createModel$z ( Mongoose ) {

    const MaterialBaseModel = Material$e.getModelFrom( Mongoose );
    _model$z                  = MaterialBaseModel.discriminator( 'LineBasicMaterial', getSchemaFrom$I( Mongoose ) );

}

function registerModelTo$z ( Mongoose ) {

    if ( !_model$z ) {
        _createModel$z( Mongoose );
    }

    return Mongoose

}

var LineBasicMaterial_1 = {
    name:            'LineBasicMaterial',
    getSchemaFrom:   getSchemaFrom$I,
    getModelFrom:    getModelFrom$z,
    registerModelTo: registerModelTo$z
};

/**
 * @module Schemas/Materials/LineDashedMaterial
 * @desc Export the ThreeJs LineDashedMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$d } = Material$f;

let _schema$H = undefined;
let _model$y  = undefined;

function getSchemaFrom$H ( Mongoose ) {

    if ( !_schema$H ) {
        _createSchema$H( Mongoose );
    }

    return _schema$H

}

function _createSchema$H ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;

    _schema$H = new Schema( {
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

function getModelFrom$y ( Mongoose ) {

    if ( !_model$y ) {
        _createModel$y( Mongoose );
    }

    return _model$y

}

function _createModel$y ( Mongoose ) {

    const MaterialBaseModel = Material$d.getModelFrom( Mongoose );
    _model$y                  = MaterialBaseModel.discriminator( 'LineDashedMaterial', getSchemaFrom$H( Mongoose ) );

}

function registerModelTo$y ( Mongoose ) {

    if ( !_model$y ) {
        _createModel$y( Mongoose );
    }

    return Mongoose

}

var LineDashedMaterial_1 = {
    name:            'LineDashedMaterial',
    getSchemaFrom:   getSchemaFrom$H,
    getModelFrom:    getModelFrom$y,
    registerModelTo: registerModelTo$y
};

/**
 * @module Schemas/Materials/MeshBasicMaterial
 * @desc Export the ThreeJs MeshBasicMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$c } = Material$f;

let _schema$G = undefined;
let _model$x  = undefined;

function getSchemaFrom$G ( Mongoose ) {

    if ( !_schema$G ) {
        _createSchema$G( Mongoose );
    }

    return _schema$G

}

function _createSchema$G ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;
    const Color  = Types.Color;

    _schema$G = new Schema( {
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

function getModelFrom$x ( Mongoose ) {

    if ( !_model$x ) {
        _createModel$x( Mongoose );
    }

    return _model$x

}

function _createModel$x ( Mongoose ) {

    const MaterialBaseModel = Material$c.getModelFrom( Mongoose );
    _model$x                  = MaterialBaseModel.discriminator( 'MeshBasicMaterial', getSchemaFrom$G( Mongoose ) );

}

function registerModelTo$x ( Mongoose ) {

    if ( !_model$x ) {
        _createModel$x( Mongoose );
    }

    return Mongoose

}

var MeshBasicMaterial_1 = {
    name:            'MeshBasicMaterial',
    getSchemaFrom:   getSchemaFrom$G,
    getModelFrom:    getModelFrom$x,
    registerModelTo: registerModelTo$x
};

/**
 * @module Schemas/Materials/MeshDepthMaterial
 * @desc Export the ThreeJs MeshDepthMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$b } = Material$f;

let _schema$F = undefined;
let _model$w  = undefined;

function getSchemaFrom$F ( Mongoose ) {

    if ( !_schema$F ) {
        _createSchema$F( Mongoose );
    }

    return _schema$F

}

function _createSchema$F ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$F = new Schema( {
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

function getModelFrom$w ( Mongoose ) {

    if ( !_model$w ) {
        _createModel$w( Mongoose );
    }

    return _model$w

}

function _createModel$w ( Mongoose ) {

    const MaterialBaseModel = Material$b.getModelFrom( Mongoose );
    _model$w                  = MaterialBaseModel.discriminator( 'MeshDepthMaterial', getSchemaFrom$F( Mongoose ) );

}

function registerModelTo$w ( Mongoose ) {

    if ( !_model$w ) {
        _createModel$w( Mongoose );
    }

    return Mongoose

}

var MeshDepthMaterial_1 = {
    name:            'MeshDepthMaterial',
    getSchemaFrom:   getSchemaFrom$F,
    getModelFrom:    getModelFrom$w,
    registerModelTo: registerModelTo$w
};

/**
 * @module Schemas/Materials/MeshLambertMaterial
 * @desc Export the ThreeJs MeshLambertMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$a } = Material$f;

let _schema$E = undefined;
let _model$v  = undefined;

function getSchemaFrom$E ( Mongoose ) {

    if ( !_schema$E ) {
        _createSchema$E( Mongoose );
    }

    return _schema$E

}

function _createSchema$E ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;
    const Mixed  = Types.Mixed;

    _schema$E = new Schema( {
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

function getModelFrom$v ( Mongoose ) {

    if ( !_model$v ) {
        _createModel$v( Mongoose );
    }

    return _model$v

}

function _createModel$v ( Mongoose ) {

    const MaterialBaseModel = Material$a.getModelFrom( Mongoose );
    _model$v                  = MaterialBaseModel.discriminator( 'MeshLambertMaterial', getSchemaFrom$E( Mongoose ) );

}

function registerModelTo$v ( Mongoose ) {

    if ( !_model$v ) {
        _createModel$v( Mongoose );
    }

    return Mongoose

}

var MeshLambertMaterial_1 = {
    name:            'MeshLambertMaterial',
    getSchemaFrom:   getSchemaFrom$E,
    getModelFrom:    getModelFrom$v,
    registerModelTo: registerModelTo$v
};

/**
 * @module Schemas/Materials/MeshNormalMaterial
 * @desc Export the ThreeJs MeshNormalMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$9 } = Material$f;

let _schema$D = undefined;
let _model$u  = undefined;

function getSchemaFrom$D ( Mongoose ) {

    if ( !_schema$D ) {
        _createSchema$D( Mongoose );
    }

    return _schema$D

}

function _createSchema$D ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Vector2 = Types.Vector2;

    _schema$D = new Schema( {
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

function getModelFrom$u ( Mongoose ) {

    if ( !_model$u ) {
        _createModel$u( Mongoose );
    }

    return _model$u

}

function _createModel$u ( Mongoose ) {

    const MaterialBaseModel = Material$9.getModelFrom( Mongoose );
    _model$u                  = MaterialBaseModel.discriminator( 'MeshNormalMaterial', getSchemaFrom$D( Mongoose ) );

}

function registerModelTo$u ( Mongoose ) {

    if ( !_model$u ) {
        _createModel$u( Mongoose );
    }

    return Mongoose

}

var MeshNormalMaterial_1 = {
    name:            'MeshNormalMaterial',
    getSchemaFrom:   getSchemaFrom$D,
    getModelFrom:    getModelFrom$u,
    registerModelTo: registerModelTo$u
};

/**
 * @module Schemas/Materials/MeshPhongMaterial
 * @desc Export the ThreeJs MeshPhongMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$8 } = Material$f;

let _schema$C = undefined;
let _model$t  = undefined;

function getSchemaFrom$C ( Mongoose ) {

    if ( !_schema$C ) {
        _createSchema$C( Mongoose );
    }

    return _schema$C

}

function _createSchema$C ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Color   = Types.Color;
    const Vector2 = Types.Vector2;

    _schema$C = new Schema( {
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

function getModelFrom$t ( Mongoose ) {

    if ( !_model$t ) {
        _createModel$t( Mongoose );
    }

    return _model$t

}

function _createModel$t ( Mongoose ) {

    const MaterialBaseModel = Material$8.getModelFrom( Mongoose );
    _model$t                  = MaterialBaseModel.discriminator( 'MeshPhongMaterial', getSchemaFrom$C( Mongoose ) );

}

function registerModelTo$t ( Mongoose ) {

    if ( !_model$t ) {
        _createModel$t( Mongoose );
    }

    return Mongoose

}

var MeshPhongMaterial_1 = {
    name:            'MeshPhongMaterial',
    getSchemaFrom:   getSchemaFrom$C,
    getModelFrom:    getModelFrom$t,
    registerModelTo: registerModelTo$t
};

/**
 * @module Schemas/Materials/MeshPhysicalMaterial
 * @desc Export the ThreeJs MeshPhysicalMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$7 } = Material$f;

let _schema$B = undefined;
let _model$s  = undefined;

function getSchemaFrom$B ( Mongoose ) {

    if ( !_schema$B ) {
        _createSchema$B( Mongoose );
    }

    return _schema$B

}

function _createSchema$B ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$B = new Schema( {
        reflectivity:       Number,
        clearCoat:          Number,
        clearCoatRoughness: Number
    } );

}

function getModelFrom$s ( Mongoose ) {

    if ( !_model$s ) {
        _createModel$s( Mongoose );
    }

    return _model$s

}

function _createModel$s ( Mongoose ) {

    const MaterialBaseModel = Material$7.getModelFrom( Mongoose );
    _model$s                  = MaterialBaseModel.discriminator( 'MeshPhysicalMaterial', getSchemaFrom$B( Mongoose ) );

}

function registerModelTo$s ( Mongoose ) {

    if ( !_model$s ) {
        _createModel$s( Mongoose );
    }

    return Mongoose

}

var MeshPhysicalMaterial_1 = {
    name:            'MeshPhysicalMaterial',
    getSchemaFrom:   getSchemaFrom$B,
    getModelFrom:    getModelFrom$s,
    registerModelTo: registerModelTo$s
};

/**
 * @module Schemas/Materials/MeshStandardMaterial
 * @desc Export the ThreeJs MeshStandardMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$6 } = Material$f;

let _schema$A = undefined;
let _model$r  = undefined;

function getSchemaFrom$A ( Mongoose ) {

    if ( !_schema$A ) {
        _createSchema$A( Mongoose );
    }

    return _schema$A

}

function _createSchema$A ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Color   = Types.Color;
    const Vector2 = Types.Vector2;

    _schema$A = new Schema( {
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

function getModelFrom$r ( Mongoose ) {

    if ( !_model$r ) {
        _createModel$r( Mongoose );
    }

    return _model$r

}

function _createModel$r ( Mongoose ) {

    const MaterialBaseModel = Material$6.getModelFrom( Mongoose );
    _model$r                  = MaterialBaseModel.discriminator( 'MeshStandardMaterial', getSchemaFrom$A( Mongoose ) );

}

function registerModelTo$r ( Mongoose ) {

    if ( !_model$r ) {
        _createModel$r( Mongoose );
    }

    return Mongoose

}

var MeshStandardMaterial_1 = {
    name:            'MeshStandardMaterial',
    getSchemaFrom:   getSchemaFrom$A,
    getModelFrom:    getModelFrom$r,
    registerModelTo: registerModelTo$r
};

/**
 * @module Schemas/Materials/MeshToonMaterial
 * @desc Export the ThreeJs MeshToonMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$5 } = Material$f;

let _schema$z = undefined;
let _model$q  = undefined;

function getSchemaFrom$z ( Mongoose ) {

    if ( !_schema$z ) {
        _createSchema$z( Mongoose );
    }

    return _schema$z

}

function _createSchema$z ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Color   = Types.Color;
    const Vector2 = Types.Vector2;

    _schema$z = new Schema( {
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

function getModelFrom$q ( Mongoose ) {

    if ( !_model$q ) {
        _createModel$q( Mongoose );
    }

    return _model$q

}

function _createModel$q ( Mongoose ) {

    const MaterialBaseModel = Material$5.getModelFrom( Mongoose );
    _model$q                  = MaterialBaseModel.discriminator( 'MeshToonMaterial', getSchemaFrom$z( Mongoose ) );

}

function registerModelTo$q ( Mongoose ) {

    if ( !_model$q ) {
        _createModel$q( Mongoose );
    }

    return Mongoose

}

var MeshToonMaterial_1 = {
    name:            'MeshToonMaterial',
    getSchemaFrom:   getSchemaFrom$z,
    getModelFrom:    getModelFrom$q,
    registerModelTo: registerModelTo$q
};

/**
 * @module Schemas/Materials/PointsMaterial
 * @desc Export the ThreeJs PointsMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$4 } = Material$f;

let _schema$y = undefined;
let _model$p  = undefined;

function getSchemaFrom$y ( Mongoose ) {

    if ( !_schema$y ) {
        _createSchema$y( Mongoose );
    }

    return _schema$y

}

function _createSchema$y ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;
    const Mixed  = Types.Mixed;

    _schema$y = new Schema( {
        color:           Color,
        map:             Mixed, // Unknown yet
        size:            Number,
        sizeAttenuation: Boolean,
        lights:          Boolean
    } );

}

function getModelFrom$p ( Mongoose ) {

    if ( !_model$p ) {
        _createModel$p( Mongoose );
    }

    return _model$p

}

function _createModel$p ( Mongoose ) {

    const MaterialBaseModel = Material$4.getModelFrom( Mongoose );
    _model$p                  = MaterialBaseModel.discriminator( 'PointsMaterial', getSchemaFrom$y( Mongoose ) );

}

function registerModelTo$p ( Mongoose ) {

    if ( !_model$p ) {
        _createModel$p( Mongoose );
    }

    return Mongoose

}

var PointsMaterial_1 = {
    name:            'PointsMaterial',
    getSchemaFrom:   getSchemaFrom$y,
    getModelFrom:    getModelFrom$p,
    registerModelTo: registerModelTo$p
};

/**
 * @module Schemas/Materials/RawShaderMaterial
 * @desc Export the ThreeJs RawShaderMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$3 } = Material$f;

let _schema$x = undefined;
let _model$o  = undefined;

function getSchemaFrom$x ( Mongoose ) {

    if ( !_schema$x ) {
        _createSchema$x( Mongoose );
    }

    return _schema$x

}

function _createSchema$x ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$x = new Schema( {
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

function getModelFrom$o ( Mongoose ) {

    if ( !_model$o ) {
        _createModel$o( Mongoose );
    }

    return _model$o

}

function _createModel$o ( Mongoose ) {

    const MaterialBaseModel = Material$3.getModelFrom( Mongoose );
    _model$o                  = MaterialBaseModel.discriminator( 'RawShaderMaterial', getSchemaFrom$x( Mongoose ) );

}

function registerModelTo$o ( Mongoose ) {

    if ( !_model$o ) {
        _createModel$o( Mongoose );
    }

    return Mongoose

}

var RawShaderMaterial_1 = {
    name:            'RawShaderMaterial',
    getSchemaFrom:   getSchemaFrom$x,
    getModelFrom:    getModelFrom$o,
    registerModelTo: registerModelTo$o
};

/**
 * @module Schemas/Materials/ShaderMaterial
 * @desc Export the ThreeJs ShaderMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$2 } = Material$f;

let _schema$w = undefined;
let _model$n  = undefined;

function getSchemaFrom$w ( Mongoose ) {

    if ( !_schema$w ) {
        _createSchema$w( Mongoose );
    }

    return _schema$w

}

function _createSchema$w ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$w = new Schema( {
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

function getModelFrom$n ( Mongoose ) {

    if ( !_model$n ) {
        _createModel$n( Mongoose );
    }

    return _model$n

}

function _createModel$n ( Mongoose ) {

    const MaterialBaseModel = Material$2.getModelFrom( Mongoose );
    _model$n                  = MaterialBaseModel.discriminator( 'ShaderMaterial', getSchemaFrom$w( Mongoose ) );

}

function registerModelTo$n ( Mongoose ) {

    if ( !_model$n ) {
        _createModel$n( Mongoose );
    }

    return Mongoose

}

var ShaderMaterial_1 = {
    name:            'ShaderMaterial',
    getSchemaFrom:   getSchemaFrom$w,
    getModelFrom:    getModelFrom$n,
    registerModelTo: registerModelTo$n
};

/**
 * @module Schemas/Materials/ShadowMaterial
 * @desc Export the ThreeJs ShadowMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material: Material$1 } = Material$f;

let _schema$v = undefined;
let _model$m  = undefined;

function getSchemaFrom$v ( Mongoose ) {

    if ( !_schema$v ) {
        _createSchema$v( Mongoose );
    }

    return _schema$v

}

function _createSchema$v ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;

    _schema$v = new Schema( {
        color:       Color,
        opacity:     Number,
        lights:      Boolean,
        transparent: Boolean
    } );

}

function getModelFrom$m ( Mongoose ) {

    if ( !_model$m ) {
        _createModel$m( Mongoose );
    }

    return _model$m

}

function _createModel$m ( Mongoose ) {

    const MaterialBaseModel = Material$1.getModelFrom( Mongoose );
    _model$m                  = MaterialBaseModel.discriminator( 'ShadowMaterial', getSchemaFrom$v( Mongoose ) );

}

function registerModelTo$m ( Mongoose ) {

    if ( !_model$m ) {
        _createModel$m( Mongoose );
    }

    return Mongoose

}

var ShadowMaterial_1 = {
    name:            'ShadowMaterial',
    getSchemaFrom:   getSchemaFrom$v,
    getModelFrom:    getModelFrom$m,
    registerModelTo: registerModelTo$m
};

/**
 * @module Schemas/Materials/SpriteMaterial
 * @desc Export the ThreeJs SpriteMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material } = Material$f;

let _schema$u = undefined;
let _model$l  = undefined;

function getSchemaFrom$u ( Mongoose ) {

    if ( !_schema$u ) {
        _createSchema$u( Mongoose );
    }

    return _schema$u

}

function _createSchema$u ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Color  = Types.Color;
    const Mixed  = Types.Mixed;

    _schema$u = new Schema( {
        color:    Color,
        map:      Mixed, // Unknown yet
        rotation: Number,
        fog:      Boolean,
        lights:   Boolean
    } );

}

function getModelFrom$l ( Mongoose ) {

    if ( !_model$l ) {
        _createModel$l( Mongoose );
    }

    return _model$l

}

function _createModel$l ( Mongoose ) {

    const MaterialBaseModel = Material.getModelFrom( Mongoose );
    _model$l                  = MaterialBaseModel.discriminator( 'SpriteMaterial', getSchemaFrom$u( Mongoose ) );

}

function registerModelTo$l ( Mongoose ) {

    if ( !_model$l ) {
        _createModel$l( Mongoose );
    }

    return Mongoose

}

var SpriteMaterial_1 = {
    name:            'SpriteMaterial',
    getSchemaFrom:   getSchemaFrom$u,
    getModelFrom:    getModelFrom$l,
    registerModelTo: registerModelTo$l
};

/**
 * @module Schemas/Math/Box2
 * @desc Export the ThreeJs Box2 Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$t = undefined;

function getSchemaFrom$t ( Mongoose ) {

    if ( !_schema$t ) {
        _createSchema$t( Mongoose );
    }

    return _schema$t

}

function _createSchema$t ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector2 = Types.Vector2;

    _schema$t = new Schema( {
        min: Vector2,
        max: Vector2
    }, {
        _id: false,
        id:  false
    } );

}

var Box2_1 = {
    name:            'Box2',
    getSchemaFrom:   getSchemaFrom$t,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Math/Box3
 * @desc Export the ThreeJs Box3 Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$s = undefined;

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
        min: Vector3,
        max: Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Box3_1 = {
    name:            'Box3',
    getSchemaFrom:   getSchemaFrom$s,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Math/Line3
 * @desc Export the ThreeJs Line3 Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$r = undefined;

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
        start: Vector3,
        end:   Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Line3_1 = {
    name:            'Line3',
    getSchemaFrom:   getSchemaFrom$r,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Math/Plane
 * @desc Export the ThreeJs Plane Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$q = undefined;

function getSchemaFrom$q ( Mongoose ) {

    if ( !_schema$q ) {
        _createSchema$q( Mongoose );
    }

    return _schema$q

}

function _createSchema$q ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$q = new Schema( {
        normal:   Vector3,
        constant: Number
    }, {
        _id: false,
        id:  false
    } );

}

var Plane_1 = {
    name:            'Plane',
    getSchemaFrom:   getSchemaFrom$q,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Math/Ray
 * @desc Export the ThreeJs Ray Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$p = undefined;

function getSchemaFrom$p ( Mongoose ) {

    if ( !_schema$p ) {
        _createSchema$p( Mongoose );
    }

    return _schema$p

}

function _createSchema$p ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$p = new Schema( {
        origin:    Vector3,
        direction: Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Ray_1 = {
    name:            'Ray',
    getSchemaFrom:   getSchemaFrom$p,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Math/Sphere
 * @desc Export the ThreeJs Sphere Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$o = undefined;

function getSchemaFrom$o ( Mongoose ) {

    if ( !_schema$o ) {
        _createSchema$o( Mongoose );
    }

    return _schema$o

}

function _createSchema$o ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$o = new Schema( {
        center: Vector3,
        radius: Number
    }, {
        _id: false,
        id:  false
    } );

}

var Sphere_1 = {
    name:            'Sphere',
    getSchemaFrom:   getSchemaFrom$o,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Math/Spherical
 * @desc Export the ThreeJs Spherical Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$n = undefined;

function getSchemaFrom$n ( Mongoose ) {

    if ( !_schema$n ) {
        _createSchema$n( Mongoose );
    }

    return _schema$n

}

function _createSchema$n ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$n = new Schema( {
        radius: Number,
        phi:    Number,
        theta:  Number
    }, {
        _id: false,
        id:  false
    } );

}

var Spherical_1 = {
    name:            'Spherical',
    getSchemaFrom:   getSchemaFrom$n,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Math/Triangle
 * @desc Export the ThreeJs Triangle Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$m = undefined;

function getSchemaFrom$m ( Mongoose ) {

    if ( !_schema$m ) {
        _createSchema$m( Mongoose );
    }

    return _schema$m

}

function _createSchema$m ( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Vector3 = Types.Vector3;

    _schema$m = new Schema( {
        a: Vector3,
        b: Vector3,
        c: Vector3
    }, {
        _id: false,
        id:  false
    } );

}

var Triangle_1 = {
    name:            'Triangle',
    getSchemaFrom:   getSchemaFrom$m,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Objects/Bone
 * @desc Export the ThreeJs Bone Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$c } = require$$0$2;

let _schema$l = undefined;
let _model$k  = undefined;

function getSchemaFrom$l ( Mongoose ) {

    if ( !_schema$l ) {
        _createSchema$l( Mongoose );
    }

    return _schema$l

}

function _createSchema$l ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$l = new Schema( {} );

}

function getModelFrom$k ( Mongoose ) {

    if ( !_model$k ) {
        _createModel$k( Mongoose );
    }

    return _model$k

}

function _createModel$k ( Mongoose ) {

    const Object3DBaseModel = Object3D$c.getModelFrom( Mongoose );
    _model$k                  = Object3DBaseModel.discriminator( 'Bone', getSchemaFrom$l( Mongoose ) );

}

function registerModelTo$k ( Mongoose ) {

    if ( !_model$k ) {
        _createModel$k( Mongoose );
    }

    return Mongoose

}

var Bone_1 = {
    name:            'Bone',
    getSchemaFrom:   getSchemaFrom$l,
    getModelFrom:    getModelFrom$k,
    registerModelTo: registerModelTo$k
};

/**
 * @module Schemas/Objects/Group
 * @desc Export the ThreeJs Group Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$k = undefined;
let _model$j  = undefined;

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

function getModelFrom$j ( Mongoose ) {

    if ( !_model$j ) {
        _createModel$j( Mongoose );
    }

    return _model$j

}

function _createModel$j ( Mongoose ) {

    const Object3DBaseModel = Object3D$I.getModelFrom( Mongoose );
    _model$j                  = Object3DBaseModel.discriminator( 'Group', getSchemaFrom$k( Mongoose ) );

}

function registerModelTo$j ( Mongoose ) {

    if ( !_model$j ) {
        _createModel$j( Mongoose );
    }

    return Mongoose

}

const Group = {
    name:            'Group',
    getSchemaFrom:   getSchemaFrom$k,
    getModelFrom:    getModelFrom$j,
    registerModelTo: registerModelTo$j
};

/**
 * @module Schemas/Objects/ImmediateRenderObject
 * @desc Export the ThreeJs ImmediateRenderObject Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$b } = require$$0$2;

let _schema$j = undefined;
let _model$i  = undefined;

function getSchemaFrom$j ( Mongoose ) {

    if ( !_schema$j ) {
        _createSchema$j( Mongoose );
    }

    return _schema$j

}

function _createSchema$j ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$j = new Schema( {} );

}

function getModelFrom$i ( Mongoose ) {

    if ( !_model$i ) {
        _createModel$i( Mongoose );
    }

    return _model$i

}

function _createModel$i ( Mongoose ) {

    const Object3DBaseModel = Object3D$b.getModelFrom( Mongoose );
    _model$i                  = Object3DBaseModel.discriminator( 'ImmediateRenderObject', getSchemaFrom$j( Mongoose ) );

}

function registerModelTo$i ( Mongoose ) {

    if ( !_model$i ) {
        _createModel$i( Mongoose );
    }

    return Mongoose

}

var ImmediateRenderObject_1 = {
    name:            'ImmediateRenderObject',
    getSchemaFrom:   getSchemaFrom$j,
    getModelFrom:    getModelFrom$i,
    registerModelTo: registerModelTo$i
};

/**
 * @module Schemas/Objects/LensFlare
 * @desc Export the ThreeJs LensFlare Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$a } = require$$0$2;

let _schema$i = undefined;
let _model$h  = undefined;

function getSchemaFrom$i ( Mongoose ) {

    if ( !_schema$i ) {
        _createSchema$i( Mongoose );
    }

    return _schema$i

}

function _createSchema$i ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;
    const Color    = Types.Color;
    const Vector3  = Types.Vector3;

    _schema$i = new Schema( {
        lensFlares: [ {
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
        } ],
        positionScreen: Vector3
    } );

}

function getModelFrom$h ( Mongoose ) {

    if ( !_model$h ) {
        _createModel$h( Mongoose );
    }

    return _model$h

}

function _createModel$h ( Mongoose ) {

    const Object3DBaseModel = Object3D$a.getModelFrom( Mongoose );
    _model$h                  = Object3DBaseModel.discriminator( 'LensFlare', getSchemaFrom$i( Mongoose ) );

}

function registerModelTo$h ( Mongoose ) {

    if ( !_model$h ) {
        _createModel$h( Mongoose );
    }

    return Mongoose

}

var LensFlare = {
    name:            'LensFlare',
    getSchemaFrom:   getSchemaFrom$i,
    getModelFrom:    getModelFrom$h,
    registerModelTo: registerModelTo$h
};

/**
 * @module Schemas/Objects/Line
 * @desc Export the ThreeJs Line Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$9 } = require$$0$2;

let _schema$h = undefined;
let _model$g  = undefined;

function getSchemaFrom$h ( Mongoose ) {

    if ( !_schema$h ) {
        _createSchema$h( Mongoose );
    }

    return _schema$h

}

function _createSchema$h ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$h = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [ {
            type: ObjectId,
            ref:  'LineBasicMaterial'
        } ],
        drawMode: Number
    } );

}

function getModelFrom$g ( Mongoose ) {

    if ( !_model$g ) {
        _createModel$g( Mongoose );
    }

    return _model$g

}

function _createModel$g ( Mongoose ) {

    const Object3DBaseModel = Object3D$9.getModelFrom( Mongoose );
    _model$g                  = Object3DBaseModel.discriminator( 'Line', getSchemaFrom$h( Mongoose ) );

}

function registerModelTo$g ( Mongoose ) {

    if ( !_model$g ) {
        _createModel$g( Mongoose );
    }

    return Mongoose

}

var Line_1 = {
    name:            'Line',
    getSchemaFrom:   getSchemaFrom$h,
    getModelFrom:    getModelFrom$g,
    registerModelTo: registerModelTo$g
};

/**
 * @module Schemas/Objects/LineLoop
 * @desc Export the ThreeJs LineLoop Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$8 } = require$$0$2;

let _schema$g = undefined;
let _model$f  = undefined;

function getSchemaFrom$g ( Mongoose ) {

    if ( !_schema$g ) {
        _createSchema$g( Mongoose );
    }

    return _schema$g

}

function _createSchema$g ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$g = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [ {
            type: ObjectId,
            ref:  'LineBasicMaterial'
        } ],
        drawMode: Number
    } );

}

function getModelFrom$f ( Mongoose ) {

    if ( !_model$f ) {
        _createModel$f( Mongoose );
    }

    return _model$f

}

function _createModel$f ( Mongoose ) {

    const Object3DBaseModel = Object3D$8.getModelFrom( Mongoose );
    _model$f                  = Object3DBaseModel.discriminator( 'LineLoop', getSchemaFrom$g( Mongoose ) );

}

function registerModelTo$f ( Mongoose ) {

    if ( !_model$f ) {
        _createModel$f( Mongoose );
    }

    return Mongoose

}

var LineLoop_1 = {
    name:            'LineLoop',
    getSchemaFrom:   getSchemaFrom$g,
    getModelFrom:    getModelFrom$f,
    registerModelTo: registerModelTo$f
};

/**
 * @module Schemas/Objects/LineSegments
 * @desc Export the ThreeJs LineSegments Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$7 } = require$$0$2;

let _schema$f = undefined;
let _model$e  = undefined;

function getSchemaFrom$f ( Mongoose ) {

    if ( !_schema$f ) {
        _createSchema$f( Mongoose );
    }

    return _schema$f

}

function _createSchema$f ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$f = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [ {
            type: ObjectId,
            ref:  'LineBasicMaterial'
        } ],
        drawMode: Number
    } );

}

function getModelFrom$e ( Mongoose ) {

    if ( !_model$e ) {
        _createModel$e( Mongoose );
    }

    return _model$e

}

function _createModel$e ( Mongoose ) {

    const Object3DBaseModel = Object3D$7.getModelFrom( Mongoose );
    _model$e                  = Object3DBaseModel.discriminator( 'LineSegments', getSchemaFrom$f( Mongoose ) );

}

function registerModelTo$e ( Mongoose ) {

    if ( !_model$e ) {
        _createModel$e( Mongoose );
    }

    return Mongoose

}

var LineSegments_1 = {
    name:            'LineSegments',
    getSchemaFrom:   getSchemaFrom$f,
    getModelFrom:    getModelFrom$e,
    registerModelTo: registerModelTo$e
};

/**
 * @module Schemas/Objects/LOD
 * @desc Export the ThreeJs LOD Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$6 } = require$$0$2;

let _schema$e = undefined;
let _model$d  = undefined;

function getSchemaFrom$e ( Mongoose ) {

    if ( !_schema$e ) {
        _createSchema$e( Mongoose );
    }

    return _schema$e

}

function _createSchema$e ( Mongoose ) {

    const Schema = Mongoose.Schema;
    const Types  = Schema.Types;
    const Mixed  = Types.Mixed;

    _schema$e = new Schema( {
        levels: [ Mixed ]
    } );

}

function getModelFrom$d ( Mongoose ) {

    if ( !_model$d ) {
        _createModel$d( Mongoose );
    }

    return _model$d

}

function _createModel$d ( Mongoose ) {

    const Object3DBaseModel = Object3D$6.getModelFrom( Mongoose );
    _model$d                  = Object3DBaseModel.discriminator( 'LOD', getSchemaFrom$e( Mongoose ) );

}

function registerModelTo$d ( Mongoose ) {

    if ( !_model$d ) {
        _createModel$d( Mongoose );
    }

    return Mongoose

}

var LOD_1 = {
    name:            'LOD',
    getSchemaFrom:   getSchemaFrom$e,
    getModelFrom:    getModelFrom$d,
    registerModelTo: registerModelTo$d
};

/**
 * @module Schemas/Objects/Mesh
 * @desc Export the ThreeJs Mesh Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$5 } = require$$0$2;

let _schema$d = undefined;
let _model$c  = undefined;

function getSchemaFrom$d ( Mongoose ) {

    if ( !_schema$d ) {
        _createSchema$d( Mongoose );
    }

    return _schema$d

}

function _createSchema$d ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$d = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [ {
            type: ObjectId,
            ref:  'Material'
        } ],
        drawMode: Number
    } );

}

function getModelFrom$c ( Mongoose ) {

    if ( !_model$c ) {
        _createModel$c( Mongoose );
    }

    return _model$c

}

function _createModel$c ( Mongoose ) {

    const Object3DBaseModel = Object3D$5.getModelFrom( Mongoose );
    _model$c                  = Object3DBaseModel.discriminator( 'Mesh', getSchemaFrom$d( Mongoose ) );

}

function registerModelTo$c ( Mongoose ) {

    if ( !_model$c ) {
        _createModel$c( Mongoose );
    }

    return Mongoose

}

var Mesh_1 = {
    name:            'Mesh',
    getSchemaFrom:   getSchemaFrom$d,
    getModelFrom:    getModelFrom$c,
    registerModelTo: registerModelTo$c
};

/**
 * @module Schemas/Objects/Points
 * @desc Export the ThreeJs Points Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$4 } = require$$0$2;

let _schema$c = undefined;
let _model$b  = undefined;

function getSchemaFrom$c ( Mongoose ) {

    if ( !_schema$c ) {
        _createSchema$c( Mongoose );
    }

    return _schema$c

}

function _createSchema$c ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$c = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [ {
            type: ObjectId,
            ref:  'PointsMaterial'
        } ],
        drawMode: Number
    } );

}

function getModelFrom$b ( Mongoose ) {

    if ( !_model$b ) {
        _createModel$b( Mongoose );
    }

    return _model$b

}

function _createModel$b ( Mongoose ) {

    const Object3DBaseModel = Object3D$4.getModelFrom( Mongoose );
    _model$b                  = Object3DBaseModel.discriminator( 'Points', getSchemaFrom$c( Mongoose ) );

}

function registerModelTo$b ( Mongoose ) {

    if ( !_model$b ) {
        _createModel$b( Mongoose );
    }

    return Mongoose

}

var Points_1 = {
    name:            'Points',
    getSchemaFrom:   getSchemaFrom$c,
    getModelFrom:    getModelFrom$b,
    registerModelTo: registerModelTo$b
};

/**
 * @module Schemas/Objects/Skeleton
 * @desc Export the ThreeJs Skeleton Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$3 } = require$$0$2;

let _schema$b = undefined;
let _model$a  = undefined;

function getSchemaFrom$b ( Mongoose ) {

    if ( !_schema$b ) {
        _createSchema$b( Mongoose );
    }

    return _schema$b

}

function _createSchema$b ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$b = new Schema( {
        bones:        [ ObjectId ],
        boneMatrices: [ Number ] // Float32Array( this.bones.length * 16 )
    } );

}

function getModelFrom$a ( Mongoose ) {

    if ( !_model$a ) {
        _createModel$a( Mongoose );
    }

    return _model$a

}

function _createModel$a ( Mongoose ) {

    const Object3DBaseModel = Object3D$3.getModelFrom( Mongoose );
    _model$a                  = Object3DBaseModel.discriminator( 'Skeleton', getSchemaFrom$b( Mongoose ) );

}

function registerModelTo$a ( Mongoose ) {

    if ( !_model$a ) {
        _createModel$a( Mongoose );
    }

    return Mongoose

}

var Skeleton_1 = {
    name:            'Skeleton',
    getSchemaFrom:   getSchemaFrom$b,
    getModelFrom:    getModelFrom$a,
    registerModelTo: registerModelTo$a
};

/**
 * @module Schemas/Objects/SkinnedMesh
 * @desc Export the ThreeJs SkinnedMesh Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$2 } = require$$0$2;

let _schema$a = undefined;
let _model$9  = undefined;

function getSchemaFrom$a ( Mongoose ) {

    if ( !_schema$a ) {
        _createSchema$a( Mongoose );
    }

    return _schema$a

}

function _createSchema$a ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$a = new Schema( {
        // Mesh
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [ {
            type: ObjectId,
            ref:  'Material'
        } ],
        drawMode: Number,

        // SkinnedMesh
        bindMode:          String,
        bindMatrix:        [ Number ],
        bindMatrixInverse: [ Number ]

    } );

}

function getModelFrom$9 ( Mongoose ) {

    if ( !_model$9 ) {
        _createModel$9( Mongoose );
    }

    return _model$9

}

function _createModel$9 ( Mongoose ) {

    const Object3DBaseModel = Object3D$2.getModelFrom( Mongoose );
    _model$9                  = Object3DBaseModel.discriminator( 'SkinnedMesh', getSchemaFrom$a( Mongoose ) );

}

function registerModelTo$9 ( Mongoose ) {

    if ( !_model$9 ) {
        _createModel$9( Mongoose );
    }

    return Mongoose

}

var SkinnedMesh_1 = {
    name:            'SkinnedMesh',
    getSchemaFrom:   getSchemaFrom$a,
    getModelFrom:    getModelFrom$9,
    registerModelTo: registerModelTo$9
};

/**
 * @module Schemas/Objects/Sprite
 * @desc Export the ThreeJs Sprite Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D: Object3D$1 } = require$$0$2;

let _schema$9 = undefined;
let _model$8  = undefined;

function getSchemaFrom$9 ( Mongoose ) {

    if ( !_schema$9 ) {
        _createSchema$9( Mongoose );
    }

    return _schema$9

}

function _createSchema$9 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;

    _schema$9 = new Schema( {
        material: [ {
            type: ObjectId,
            ref:  'SpriteMaterial'
        } ]
    } );

}

function getModelFrom$8 ( Mongoose ) {

    if ( !_model$8 ) {
        _createModel$8( Mongoose );
    }

    return _model$8

}

function _createModel$8 ( Mongoose ) {

    const Object3DBaseModel = Object3D$1.getModelFrom( Mongoose );
    _model$8                  = Object3DBaseModel.discriminator( 'Sprite', getSchemaFrom$9( Mongoose ) );

}

function registerModelTo$8 ( Mongoose ) {

    if ( !_model$8 ) {
        _createModel$8( Mongoose );
    }

    return Mongoose

}

var Sprite_1 = {
    name:            'Sprite',
    getSchemaFrom:   getSchemaFrom$9,
    getModelFrom:    getModelFrom$8,
    registerModelTo: registerModelTo$8
};

var Fog$1 = {};

/**
 * @module Schemas/Scenes/Fog
 * @desc Export the ThreeJs Fog Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Scenes/Scene Schemas/Scenes/Scene}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$8 = undefined;

function getSchemaFrom$8 ( Mongoose ) {

    if ( !_schema$8 ) {
        _createSchema$8( Mongoose );
    }

    return _schema$8

}

function _createSchema$8 ( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema$8 = new Schema( {
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

var Fog_1 = Fog$1.Fog = {
    name:            'Fog',
    getSchemaFrom:   getSchemaFrom$8,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
};

/**
 * @module Schemas/Scenes/FogExp2
 * @desc Export the ThreeJs FogExp2 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 * @requires {@link module:Schemas/Scenes/Fog Schemas/Scenes/Fog}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D } = require$$0$2;
const { Fog }      = Fog$1;

let _schema$7 = undefined;
let _model$7  = undefined;

function getSchemaFrom$7 ( Mongoose ) {

    if ( !_schema$7 ) {
        _createSchema$7( Mongoose );
    }

    return _schema$7

}

function _createSchema$7 ( Mongoose ) {

    const FogSchema = Fog.getSchemaFrom( Mongoose );
    const Schema    = Mongoose.Schema;
    const Types     = Schema.Types;
    const Color     = Types.Color;

    _schema$7 = new Schema( {
        background:       Color,
        fog:              FogSchema,
        overrideMaterial: String,
        autoUpdate:       Boolean
    } );

}

function getModelFrom$7 ( Mongoose ) {

    if ( !_model$7 ) {
        _createModel$7( Mongoose );
    }

    return _model$7

}

function _createModel$7 ( Mongoose ) {

    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
    _model$7                  = Object3DBaseModel.discriminator( 'Scene', getSchemaFrom$7( Mongoose ) );

}

function registerModelTo$7 ( Mongoose ) {

    if ( !_model$7 ) {
        _createModel$7( Mongoose );
    }

    return Mongoose

}

var Scene_1 = {
    name: 'Scene',
    getSchemaFrom: getSchemaFrom$7,
    getModelFrom: getModelFrom$7,
    registerModelTo: registerModelTo$7
};

var Texture$6 = {};

/**
 * @module Schemas/Textures/Texture
 * @desc Export the ThreeJs Texture Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema$6 = undefined;
let _model$6  = undefined;

function getSchemaFrom$6 ( Mongoose ) {

    if ( !_schema$6 ) {
        _createSchema$6( Mongoose );
    }

    return _schema$6

}

function _createSchema$6 ( Mongoose ) {

    const Schema   = Mongoose.Schema;
    const Types    = Schema.Types;
    const ObjectId = Types.ObjectId;
    const Vector2  = Types.Vector2;
    const Matrix3  = Types.Matrix3;

    _schema$6 = new Schema( {
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
    }, {
        collection:       'textures',
        discriminatorKey: 'type'
    } );

}

function getModelFrom$6 ( Mongoose ) {

    if ( !_model$6 ) {
        _createModel$6( Mongoose );
    }

    return _model$6

}

function _createModel$6 ( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$6 = Mongoose.model( 'Textures', getSchemaFrom$6( Mongoose ) );
    _model$6.discriminator( 'Texture', new Mongoose.Schema( {} ) );

}

function registerModelTo$6 ( Mongoose ) {

    if ( !_model$6 ) {
        _createModel$6( Mongoose );
    }

    return Mongoose

}

var Texture_1 = Texture$6.Texture = {
    name: 'Texture',
    getSchemaFrom: getSchemaFrom$6,
    getModelFrom: getModelFrom$6,
    registerModelTo: registerModelTo$6
};

/**
 * @module Schemas/Textures/CanvasTexture
 * @desc Export the ThreeJs CanvasTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Texture: Texture$5 } = Texture$6;

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

    _schema$5 = new Schema( {
        needsUpdate: Boolean
    } );

}

function getModelFrom$5 ( Mongoose ) {

    if ( !_model$5 ) {
        _createModel$5( Mongoose );
    }

    return _model$5

}

function _createModel$5 ( Mongoose ) {

    const TextureBaseModel = Texture$5.getModelFrom( Mongoose );
    _model$5                 = TextureBaseModel.discriminator( 'CanvasTexture', getSchemaFrom$5( Mongoose ) );

}

function registerModelTo$5 ( Mongoose ) {

    if ( !_model$5 ) {
        _createModel$5( Mongoose );
    }

    return Mongoose

}

var CanvasTexture_1 = {
    name:            'CanvasTexture',
    getSchemaFrom:   getSchemaFrom$5,
    getModelFrom:    getModelFrom$5,
    registerModelTo: registerModelTo$5
};

/**
 * @module Schemas/Textures/CompressedTexture
 * @desc Export the ThreeJs CompressedTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Texture: Texture$4 } = Texture$6;

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

    const TextureBaseModel = Texture$4.getModelFrom( Mongoose );
    _model$4                 = TextureBaseModel.discriminator( 'CompressedTexture', getSchemaFrom$4( Mongoose ) );

}

function registerModelTo$4 ( Mongoose ) {

    if ( !_model$4 ) {
        _createModel$4( Mongoose );
    }

    return Mongoose

}

var CompressedTexture_1 = {
    name:            'CompressedTexture',
    getSchemaFrom:   getSchemaFrom$4,
    getModelFrom:    getModelFrom$4,
    registerModelTo: registerModelTo$4
};

/**
 * @module Schemas/Textures/CubeTexture
 * @desc Export the ThreeJs CubeTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Texture: Texture$3 } = Texture$6;

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

    const TextureBaseModel = Texture$3.getModelFrom( Mongoose );
    _model$3                 = TextureBaseModel.discriminator( 'CubeTexture', getSchemaFrom$3( Mongoose ) );

}

function registerModelTo$3 ( Mongoose ) {

    if ( !_model$3 ) {
        _createModel$3( Mongoose );
    }

    return Mongoose

}

var CubeTexture_1 = {
    name:            'CubeTexture',
    getSchemaFrom:   getSchemaFrom$3,
    getModelFrom:    getModelFrom$3,
    registerModelTo: registerModelTo$3
};

/**
 * @module Schemas/Textures/DataTexture
 * @desc Export the ThreeJs DataTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Texture: Texture$2 } = Texture$6;

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

    const TextureBaseModel = Texture$2.getModelFrom( Mongoose );
    _model$2                 = TextureBaseModel.discriminator( 'DataTexture', getSchemaFrom$2( Mongoose ) );

}

function registerModelTo$2 ( Mongoose ) {

    if ( !_model$2 ) {
        _createModel$2( Mongoose );
    }

    return Mongoose

}

var DataTexture_1 = {
    name:            'DataTexture',
    getSchemaFrom:   getSchemaFrom$2,
    getModelFrom:    getModelFrom$2,
    registerModelTo: registerModelTo$2
};

/**
 * @module Schemas/Textures/DepthTexture
 * @desc Export the ThreeJs DepthTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Texture: Texture$1 } = Texture$6;

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

    const TextureBaseModel = Texture$1.getModelFrom( Mongoose );
    _model$1                 = TextureBaseModel.discriminator( 'DepthTexture', getSchemaFrom$1( Mongoose ) );

}

function registerModelTo$1 ( Mongoose ) {

    if ( !_model$1 ) {
        _createModel$1( Mongoose );
    }

    return Mongoose

}

var DepthTexture_1 = {
    name:            'DepthTexture',
    getSchemaFrom:   getSchemaFrom$1,
    getModelFrom:    getModelFrom$1,
    registerModelTo: registerModelTo$1
};

/**
 * @module Schemas/Textures/VideoTexture
 * @desc Export the ThreeJs VideoTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Texture } = Texture$6;

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

    const TextureBaseModel = Texture.getModelFrom( Mongoose );
    _model                 = TextureBaseModel.discriminator( 'VideoTexture', getSchemaFrom( Mongoose ) );

}

function registerModelTo ( Mongoose ) {

    if ( !_model ) {
        _createModel( Mongoose );
    }

    return Mongoose

}

var VideoTexture_1 = {
    name:            'VideoTexture',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
};

/**
 * @module Types/Color
 * @desc Export the three js Color type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Color type
 * @returns {Mongoose}
 */
function ColorType ( Mongoose ) {

    /**
     * The Color type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Color extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @constructor
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Color' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Color|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Color.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains r property.
         * @throws {Mongoose~CastError} Will throw an error if the argument r property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains g property.
         * @throws {Mongoose~CastError} Will throw an error if the argument g property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains b property.
         * @throws {Mongoose~CastError} Will throw an error if the argument b property is not a number.
         * @returns {{r: Number, b: Number, g: Number}}
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotObject( value ) && !value.isColor ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is not a object or Three.Color instance` ) }

            if ( !( 'r' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain r property` ) }
            if ( require$$0$3.isNotNumber( value.r ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'g' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain g property` ) }
            if ( require$$0$3.isNotNumber( value.g ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'b' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain b property` ) }
            if ( require$$0$3.isNotNumber( value.b ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            return {
                r: value.r,
                g: value.g,
                b: value.b
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Color.COLOR_BSON_TYPE = bson.BSON_DATA_OBJECT;

    // Register type
    Mongoose.Schema.Types.Color = Color;

    return Mongoose

}

/**
 * @module Types/Euler
 * @desc Export the three js Euler type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Euler type
 * @returns {Mongoose}
 */
function EulerType ( Mongoose ) {

    /**
     * The Euler type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Euler extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Euler' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Euler|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Euler.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains z property.
         * @throws {Mongoose~CastError} Will throw an error if the argument z property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains order property.
         * @throws {Mongoose~CastError} Will throw an error if the argument order property is not a string in ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'].
         * @returns {{x: Number, y: Number, z: Number, order: String}}
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotObject( value ) && !value.isEuler ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } is not a object or Euler instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain x property` ) }
            if ( require$$0$3.isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected x to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain y property` ) }
            if ( require$$0$3.isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected y to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain z property` ) }
            if ( require$$0$3.isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected z to be a number` ) }

            if ( !( 'order' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain order property` ) }
            if ( require$$0$3.isNotString( value.order ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected order to be a string` ) }
            if ( ![ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ].includes( value.order.toUpperCase() ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected order to be a string in ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX']` ) }

            return {
                x:     value.x,
                y:     value.y,
                z:     value.z,
                order: value.order.toUpperCase()
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Euler.EULER_BSON_TYPE = bson.BSON_DATA_OBJECT;

    // Register type
    Mongoose.Schema.Types.Euler = Euler;

    return Mongoose

}

/**
 * @module Types/Matrix3
 * @desc Export the three js Matrix3 type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Matrix3 type
 * @returns {Mongoose}
 */
function Matrix3Type ( Mongoose ) {

    /**
     * The Matrix3 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Matrix3 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Matrix3' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Matrix3|Array.<Number>|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an array nor an instance of Three.Matrix3.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array length is different from 9.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array contains NaN or not number values.
         * @returns {Array.<Number>} The validated array of length 9
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotArray( value ) && !value.isMatrix3 ) { throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } is not an array or Matrix3 instance` ) }

            let result = undefined;
            if ( value.isMatrix3 ) {
                result = value.toArray();
            } else {
                result = value;
            }

            // Check number of values
            const numberOfValues = result.length;
            if ( numberOfValues !== 9 ) {
                throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } does not contain the right number of values. Expect 9 values and found ${ numberOfValues }` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ];

                if ( require$$0$3.isNotNumber( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( require$$0$3.isNaN( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

            }

            return result

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Matrix3.MATRIX3_BSON_TYPE = bson.BSON_DATA_ARRAY;

    // Register type
    Mongoose.Schema.Types.Matrix3 = Matrix3;

    return Mongoose

}

/**
 * @module Types/Matrix4
 * @desc Export the three js Matrix4 type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Matrix4 type
 * @returns {Mongoose}
 */
function Matrix4Type ( Mongoose ) {

    /**
     * The Matrix4 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Matrix4 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Matrix4' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Matrix4|Array.<Number>|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an array nor an instance of Three.Matrix4.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array length is different from 16.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array contains NaN or not number values.
         * @returns {Array.<Number>} The validated array of length 9
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotArray( value ) && !value.isMatrix4 ) { throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } is not an array or Matrix4 instance` ) }

            let result = undefined;
            if ( value.isMatrix4 ) {
                result = value.toArray();
            } else {
                result = value;
            }

            // Check number of values
            const numberOfValues = result.length;
            if ( numberOfValues !== 16 ) {
                throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } does not contain the right number of values. Expect 9 values and found ${ numberOfValues }` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ];

                if ( require$$0$3.isNotNumber( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( require$$0$3.isNaN( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

            }

            return result

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Matrix4.MATRIX4_BSON_TYPE = bson.BSON_DATA_ARRAY;

    // Register type
    Mongoose.Schema.Types.Matrix4 = Matrix4;

    return Mongoose

}

/**
 * @module Types/Quaternion
 * @desc Export the three js Quaternion type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Quaternion type
 * @returns {Mongoose}
 */
function QuaternionType ( Mongoose ) {

    /**
     * The Quaternion type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Quaternion extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Quaternion' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Quaternion|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Quaternion.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains z property.
         * @throws {Mongoose~CastError} Will throw an error if the argument z property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains w property.
         * @throws {Mongoose~CastError} Will throw an error if the argument w property is not a number.
         * @returns {{x: Number, y: Number, z: Number, w: Number}}
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotObject( value ) && !value.isQuaternion ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } is not a object or Quaternion instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain x property` ) }
            if ( require$$0$3.isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain y property` ) }
            if ( require$$0$3.isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain z property` ) }
            if ( require$$0$3.isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain w property` ) }
            if ( require$$0$3.isNotNumber( value.w ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Quaternion.QUATERNION_BSON_TYPE = bson.BSON_DATA_OBJECT;

    // Register type
    Mongoose.Schema.Types.Quaternion = Quaternion;

    return Mongoose

}

/**
 * @module Types/Vector2
 * @desc Export the three js Vector2 type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Vector2 type
 * @returns {Mongoose}
 */
function Vector2Type ( Mongoose ) {

    /**
     * The Vector2 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Vector2 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Vector2' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Vector2|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Vector2.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @returns {{x: Number, y: Number}}
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotObject( value ) && !value.isVector2 ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } is not a object or Vector2 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } does not contain x property` ) }
            if ( require$$0$3.isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } does not contain y property` ) }
            if ( require$$0$3.isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Vector2.VECTOR2_BSON_TYPE = bson.BSON_DATA_OBJECT;

    // Register type
    Mongoose.Schema.Types.Vector2 = Vector2;

    return Mongoose

}

/**
 * @module Types/Vector3
 * @desc Export the three js Vector3 type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Vector3 type
 * @returns {Mongoose}
 */
function Vector3Type ( Mongoose ) {

    /**
     * The Vector3 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Vector3 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Vector3' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Vector3|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Vector3.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains z property.
         * @throws {Mongoose~CastError} Will throw an error if the argument z property is not a number.
         * @returns {{x: Number, y: Number, z: Number}}
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotObject( value ) && !value.isVector3 ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } is not a object or Vector3 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain x property` ) }
            if ( require$$0$3.isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain y property` ) }
            if ( require$$0$3.isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain z property` ) }
            if ( require$$0$3.isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Vector3.VECTOR3_BSON_TYPE = bson.BSON_DATA_OBJECT;

    // Register type
    Mongoose.Schema.Types.Vector3 = Vector3;

    return Mongoose

}

/**
 * @module Types/Vector4
 * @desc Export the three js Vector4 type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Vector4 type
 * @returns {Mongoose}
 */
function Vector4Type ( Mongoose ) {

    /**
     * The Vector4 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Vector4 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Vector4' );

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Vector4|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Vector4.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains z property.
         * @throws {Mongoose~CastError} Will throw an error if the argument z property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains w property.
         * @throws {Mongoose~CastError} Will throw an error if the argument w property is not a number.
         * @returns {{x: Number, y: Number, z: Number, w: Number}}
         */
        cast ( value ) {

            if ( require$$0$3.isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } is null or undefined` ) }
            if ( require$$0$3.isNotObject( value ) && !value.isVector4 ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } is not a object or Vector4 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain x property` ) }
            if ( require$$0$3.isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain y property` ) }
            if ( require$$0$3.isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain z property` ) }
            if ( require$$0$3.isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain w property` ) }
            if ( require$$0$3.isNotNumber( value.w ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Vector4.VECTOR4_BSON_TYPE = bson.BSON_DATA_OBJECT;

    // Register type
    Mongoose.Schema.Types.Vector4 = Vector4;

    return Mongoose

}

/**
 * @module MongoDBThreePlugin
 * @desc Three way to register Types and Schema
 * using cjs module under types and schemas folder.
 * using FunctionRegistrator for type and add to plugin using .addType( myFunctionRegistrator ), extending class AbstractMongooseRegistrator for Schema and add to plugin using .addSchema(
 * MySchemaRegistrator ) using direct registration importing mongoose in the file (care to the loading order ! An no output about what is registered.)
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 */

function registerPlugin( parameters ) {

    return new iteeMongodb.TMongoDBPlugin( parameters )
        .addType( ColorType )
        .addType( EulerType )
        .addType( Matrix3Type )
        .addType( Matrix4Type )
        .addType( QuaternionType )
        .addType( Vector2Type )
        .addType( Vector3Type )
        .addType( Vector4Type )
        //    .addSchema( KeyframeTrack )
        //    .addSchema( BooleanKeyframeTrack )
        //    .addSchema( ColorKeyframeTrack )
        .addSchema( Audio_1 )
        .addSchema( AudioListener_1 )
        .addSchema( PositionalAudio_1 )
        .addSchema( ArrayCamera_1 )
        .addSchema( Camera_1 )
        .addSchema( CubeCamera_1 )
        .addSchema( OrthographicCamera_1 )
        .addSchema( PerspectiveCamera_1 )
        .addSchema( BufferAttribute_1 )
        .addSchema( BufferGeometry$l )
        .addSchema( CurvePath_1 )
        .addSchema( Face3_1 )
        .addSchema( Geometry$o )
        .addSchema( Object3D$I )
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
        .addController( TObjects3DController )
        .addDescriptor( {
            route:      '/objects',
            controller: {
                name:    'TObjects3DController',
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
        .addController( iteeMongodb.TMongooseController )
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
                        JsonToThree:    new JsonToThree(),
                        ShpToThree:     new ShpToThree(),
                        DbfToThree:     new DbfToThree(),
                        FbxToThree:     new FbxToThree(),
                        ColladaToThree: new ColladaToThree(),
                        StlToThree:     new StlToThree(),
                        TdsToThree:     new TdsToThree(),
                        MtlToThree:     new MtlToThree(),
                        ObjToThree:     new Obj2ToThree()
                    },
                    rules: [ {
                        on:  '.json',
                        use: 'JsonToThree'
                    }, {
                        on:  '.dae',
                        use: 'ColladaToThree'
                    }, {
                        on:  '.fbx',
                        use: 'FbxToThree'
                    }, {
                        on:  '.stl',
                        use: 'StlToThree'
                    }, {
                        on:  '.3ds',
                        use: 'TdsToThree'
                    }, {
                        on:  '.shp',
                        use: 'ShpToThree'
                    }, {
                        on:  '.dbf',
                        use: 'DbfToThree'
                    }, {
                        on:  [ '.shp', '.dbf' ],
                        use: [ 'ShpToThree', 'DbfToThree' ]
                    }, {
                        on:  '.mtl',
                        use: 'MtlToThree'
                    }, {
                        on:  '.obj',
                        use: 'ObjToThree'
                    }, {
                        on:  [ '.mtl', '.obj' ],
                        use: [ 'MtlToThree', 'ObjToThree' ]
                    } ],
                    inserter: ThreeToMongoDB
                },
                can: {
                    processFiles: {
                        on:   'post',
                        over: '/'
                    }
                }
            }
        } )

}

/*
export default ( parameters ) => {
    return new TMongoDBPlugin( parameters )
        .addType( ColorType )
        .addType( EulerType )
        .addType( Matrix3Type )
        .addType( Matrix4Type )
        .addType( QuaternionType )
        .addType( Vector2Type )
        .addType( Vector3Type )
        .addType( Vector4Type )
        //    .addSchema( KeyframeTrack )
        //    .addSchema( BooleanKeyframeTrack )
        //    .addSchema( ColorKeyframeTrack )
        .addSchema( Audio )
        .addSchema( AudioListener )
        .addSchema( PositionalAudio )
        .addSchema( ArrayCamera )
        .addSchema( Camera )
        .addSchema( CubeCamera )
        .addSchema( OrthographicCamera )
        .addSchema( PerspectiveCamera )
        .addSchema( BufferAttribute )
        .addSchema( BufferGeometry )
        .addSchema( CurvePath )
        .addSchema( Face3 )
        .addSchema( Geometry )
        .addSchema( Object3D )
        .addSchema( Path )
        .addSchema( Shape )
        .addSchema( ArcCurve )
        .addSchema( CatmullRomCurve3 )
        .addSchema( CubicBezierCurve )
        .addSchema( CubicBezierCurve3 )
        .addSchema( Curve )
        .addSchema( CurveExtras )
        .addSchema( EllipseCurve )
        .addSchema( LineCurve )
        .addSchema( LineCurve3 )
        .addSchema( NURBSCurve )
        .addSchema( NURBSSurface )
        .addSchema( QuadraticBezierCurve )
        .addSchema( QuadraticBezierCurve3 )
        .addSchema( SplineCurve )
        .addSchema( BoxBufferGeometry )
        .addSchema( BoxGeometry )
        .addSchema( CircleBufferGeometry )
        .addSchema( CircleGeometry )
        .addSchema( ConeBufferGeometry )
        .addSchema( ConeGeometry )
        .addSchema( ConvexGeometry )
        .addSchema( CylinderBufferGeometry )
        .addSchema( CylinderGeometry )
        .addSchema( DecalGeometry )
        .addSchema( DodecahedronGeometry )
        .addSchema( EdgesGeometry )
        .addSchema( ExtrudeBufferGeometry )
        .addSchema( ExtrudeGeometry )
        .addSchema( IcosahedronBufferGeometry )
        .addSchema( IcosahedronGeometry )
        .addSchema( InstancedBufferGeometry )
        .addSchema( LatheBufferGeometry )
        .addSchema( LatheGeometry )
        .addSchema( OctahedronBufferGeometry )
        .addSchema( OctahedronGeometry )
        .addSchema( ParametricBufferGeometry )
        .addSchema( ParametricGeometry )
        .addSchema( PlaneBufferGeometry )
        .addSchema( PlaneGeometry )
        .addSchema( PolyhedronBufferGeometry )
        .addSchema( PolyhedronGeometry )
        .addSchema( RingBufferGeometry )
        .addSchema( RingGeometry )
        .addSchema( ShapeBufferGeometry )
        .addSchema( ShapeGeometry )
        .addSchema( SphereBufferGeometry )
        .addSchema( SphereGeometry )
        .addSchema( TeapotBufferGeometry )
        .addSchema( TetrahedronBufferGeometry )
        .addSchema( TetrahedronGeometry )
        .addSchema( TextBufferGeometry )
        .addSchema( TextGeometry )
        .addSchema( TorusBufferGeometry )
        .addSchema( TorusGeometry )
        .addSchema( TorusKnotBufferGeometry )
        .addSchema( TorusKnotGeometry )
        .addSchema( TubeBufferGeometry )
        .addSchema( TubeGeometry )
        .addSchema( WireframeGeometry )
        .addSchema( ArrowHelper )
        .addSchema( AxesHelper )
        .addSchema( Box3Helper )
        .addSchema( BoxHelper )
        .addSchema( CameraHelper )
        .addSchema( DirectionalLightHelper )
        .addSchema( FaceNormalsHelper )
        .addSchema( GridHelper )
        .addSchema( HemisphereLightHelper )
        .addSchema( PlaneHelper )
        .addSchema( PointLightHelper )
        .addSchema( PolarGridHelper )
        .addSchema( RectAreaLightHelper )
        .addSchema( SkeletonHelper )
        .addSchema( SpotLightHelper )
        .addSchema( VertexNormalsHelper )
        .addSchema( AmbientLight )
        .addSchema( DirectionalLight )
        //    .addSchema( DirectionalLightShadow )
        .addSchema( HemisphereLight )
        .addSchema( Light )
        //    .addSchema( LightShadow )
        .addSchema( PointLight )
        .addSchema( RectAreaLight )
        .addSchema( SpotLight )
        //    .addSchema( SpotLightShadow )
        .addSchema( MeshPhongMaterial )
        .addSchema( LineBasicMaterial )
        .addSchema( LineDashedMaterial )
        .addSchema( Material )
        .addSchema( MeshBasicMaterial )
        .addSchema( MeshDepthMaterial )
        .addSchema( MeshLambertMaterial )
        .addSchema( MeshNormalMaterial )
        .addSchema( MeshPhysicalMaterial )
        .addSchema( MeshStandardMaterial )
        .addSchema( MeshToonMaterial )
        .addSchema( PointsMaterial )
        .addSchema( RawShaderMaterial )
        .addSchema( ShaderMaterial )
        .addSchema( ShadowMaterial )
        .addSchema( SpriteMaterial )
        .addSchema( Box2 )
        .addSchema( Box3 )
        //    .addSchema( ColorConverter )
        //    .addSchema( Cylindrical )
        //    .addSchema( Frustum )
        //    .addSchema( Interpolant )
        .addSchema( Line3 )
        //    .addSchema( Lut )
        //    .addSchema( Math )
        .addSchema( Plane )
        .addSchema( Ray )
        .addSchema( Sphere )
        .addSchema( Spherical )
        .addSchema( Triangle )
        .addSchema( Bone )
        //    .addSchema( Car )
        //    .addSchema( GPUParticleSystem )
        .addSchema( Group )
        //    .addSchema( Gyroscope )
        .addSchema( ImmediateRenderObject )
        .addSchema( LensFlare )
        .addSchema( Line )
        .addSchema( LineLoop )
        .addSchema( LineSegments )
        .addSchema( LOD )
        //    .addSchema( MarchingCubes )
        //    .addSchema( MD2Character )
        //    .addSchema( MD2CharacterComplex )
        .addSchema( Mesh )
        //    .addSchema( MorphAnimMesh )
        //    .addSchema( MorphBlendMesh )
        //    .addSchema( Ocean )
        .addSchema( Points )
        //    .addSchema( Reflector )
        //    .addSchema( ReflectorRTT )
        //    .addSchema( Refractor )
        //    .addSchema( RollerCoaster )
        //    .addSchema( ShadowMesh )
        .addSchema( Skeleton )
        .addSchema( SkinnedMesh )
        //    .addSchema( Sky )
        .addSchema( Sprite )
        //    .addSchema( UCSCharacter )
        //    .addSchema( Water )
        //    .addSchema( Water2 )
        .addSchema( Fog )
        //    .addSchema( FogExp2 )
        .addSchema( Scene )
        .addSchema( CanvasTexture )
        .addSchema( CompressedTexture )
        .addSchema( CubeTexture )
        .addSchema( DataTexture )
        .addSchema( DepthTexture )
        .addSchema( Texture )
        .addSchema( VideoTexture )
        .addController( TObjects3DController )
        .addDescriptor( {
            route:      '/objects',
            controller: {
                name:    'TObjects3DController',
                options: {
                    schemaName: 'Objects3D'
                },
                can:     {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read:   {
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
        .addController( TMongooseController )
        .addDescriptor( {
            route:      '/curves',
            controller: {
                name:    'TMongooseController',
                options: {
                    schemaName: 'Curves'
                },
                can:     {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read:   {
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
                can:     {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read:   {
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
                can:     {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read:   {
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
                can:     {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read:   {
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
        .addController( TAbstractConverterManager )
        .addDescriptor( {
            route:      '/uploads',
            controller: {
                name:    'TAbstractConverterManager',
                options: {
                    useNext:    true,
                    converters: {
                        JsonToThree:    new JsonToThree(),
                        ShpToThree:     new ShpToThree(),
                        DbfToThree:     new DbfToThree(),
                        FbxToThree:     new FbxToThree(),
                        ColladaToThree: new ColladaToThree(),
                        StlToThree:     new StlToThree(),
                        TdsToThree:     new TdsToThree(),
                        MtlToThree:     new MtlToThree(),
                        ObjToThree:     new Obj2ToThree()
                    },
                    rules:      [ {
                        on:  '.json',
                        use: 'JsonToThree'
                    }, {
                        on:  '.dae',
                        use: 'ColladaToThree'
                    }, {
                        on:  '.fbx',
                        use: 'FbxToThree'
                    }, {
                        on:  '.stl',
                        use: 'StlToThree'
                    }, {
                        on:  '.3ds',
                        use: 'TdsToThree'
                    }, {
                        on:  '.shp',
                        use: 'ShpToThree'
                    }, {
                        on:  '.dbf',
                        use: 'DbfToThree'
                    }, {
                        on:  [ '.shp', '.dbf' ],
                        use: [ 'ShpToThree', 'DbfToThree' ]
                    }, {
                        on:  '.mtl',
                        use: 'MtlToThree'
                    }, {
                        on:  '.obj',
                        use: 'ObjToThree'
                    }, {
                        on:  [ '.mtl', '.obj' ],
                        use: [ 'MtlToThree', 'ObjToThree' ]
                    } ],
                    inserter:   ThreeToMongoDB
                },
                can:     {
                    processFiles: {
                        on:   'post',
                        over: '/'
                    }
                }
            }
        } )
}
*/

/**
 * @module Loader/ASCLoader
 * @desc A loader for ASC cloud point files.
 *
 * @requires {@link https://github.com/Itee/itee-client itee-client}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example
 *
 * import { ASCLoader } from 'itee-plugin-three'
 *
 * const loader = new ASCLoader();
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

/**
 * The ASCLoader class definition.
 * It allow to load and parse an .asc file
 *
 * @class
 */
class ASCLoader {

    /**
     * @constructor
     * @param {LoadingManager} [manager=Itee.Client.DefaultLoadingManager] - A loading manager
     * @param {TLogger} [logger=Itee.Client.DefaultLogger] - A logger for any log/errors output
     */
    constructor ( manager = threeFull.DefaultLoadingManager, logger = iteeCore.DefaultLogger ) {

        this.manager = manager;
        this.logger  = logger;

        this._boundingBox    = new threeFull.Box3();
        this._points         = [];
        this._numberOfPoints = 0;
        this._coloredPoints  = false;
        this._autoOffset     = false; // Only for tiny files !!!!!!!
        this._offset         = {
            x: 0,
            y: 0,
            z: 0
        };

        this._positions   = null;
        this._bufferIndex = 0;

        this._positionsC   = null;
        this._bufferIndexC = 0;

        this.wrongPoints = 0;

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

        //        //this.logger.time("ASCLoader")

        const loader = new threeFull.FileLoader( this.manager );
        loader.setResponseType( 'blob' );
        loader.load( url, function ( blob ) {

            const groupToFeed = new threeFull.Group();
            this._parse( blob, groupToFeed, onLoad, onProgress, onError, sampling );
            onLoad( groupToFeed );

        }.bind( this ), onProgress, onError );

    }

    /**
     * An alternative setter to offset property
     *
     * @param {Three.Vector3|Object} offset - An global position offset to apply on the point cloud.
     */
    setOffset ( offset ) {

        //TODO: check is correct

        this._offset     = offset;
        this._autoOffset = false;

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
    _parse ( blob, groupToFeed, onLoad, onProgress, onError, sampling ) {

        const self = this;

        const _sampling = ( sampling ) ? sampling : 100;

        const reader     = new FileReader();
        const CHUNK_SIZE = 134217728;
        let offset       = 0;

        reader.onabort = ( abortEvent ) => {

            this.logger.log( 'abortEvent:' );
            this.logger.log( abortEvent );

        };

        reader.onerror = ( errorEvent ) => {

            this.logger.log( 'errorEvent:' );
            this.logger.log( errorEvent );

            if ( onError ) {
                onError( errorEvent );
            }

        };

        reader.onloadstart = ( loadStartEvent ) => {

            this.logger.log( 'loadStartEvent:' );
            this.logger.log( loadStartEvent );

        };

        reader.onprogress = ( progressEvent ) => {

            this.logger.log( 'progressEvent:' );
            this.logger.log( progressEvent );

            // // By lines
            // var lines = this.result.split('\n');
            // for(var lineIndex = 0, numberOfLine = lines.length; lineIndex < numberOfLine; ++lineIndex){
            //     self._parseLine(lines[lineIndex])
            // }

            if ( onProgress ) {
                onProgress( progressEvent );
            }

        };

        reader.onload = ( loadEvent ) => {

            this.logger.log( 'loadEvent:' );
            this.logger.log( loadEvent );

            // By lines
            const lines         = loadEvent.target.result.split( '\n' );
            const numberOfLines = lines.length;

            // /!\ Rollback offset for last line that is uncompleted in most time
            offset -= lines[ numberOfLines - 1 ].length;

            // //this.logger.time("Parse Lines A");
            const modSampling = Math.round( 100 / _sampling );
            for ( let lineIndex = 0 ; lineIndex < numberOfLines - 1 ; lineIndex++ ) {
                if ( lineIndex % modSampling === 0 ) // Just to make cloud lighter under debug !!!!
                {
                    self._parseLine( lines[ lineIndex ] );
                }
            }
            // //this.logger.timeEnd("Parse Lines A");

            // //this.logger.time("Parse Lines B");
            // self._parseLines(lines);
            // //this.logger.timeEnd("Parse Lines B");

            ////Todo: use ArrayBuffer instead !!!
            // //this.logger.time("Parse Lines B");
            // self._bufferIndex = 0;
            // self._positions = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // //this.logger.timeEnd("Parse Lines B");
            //
            // //this.logger.time("Parse Lines C");
            // self._bufferIndexC = 0;
            // self._positionsC = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // //this.logger.timeEnd("Parse Lines C");

        };

        reader.onloadend = ( loadEndEvent ) => {

            this.logger.log( 'loadEndEvent' );
            this.logger.log( loadEndEvent );

            if ( this._points.length > 1000000 || offset + CHUNK_SIZE >= blob.size ) {

                // //this.logger.time("Offset Points");
                this._offsetPoints();
                // //this.logger.timeEnd("Offset Points");

                // //this.logger.time("Create WorldCell");
                this._createSubCloudPoint( groupToFeed );
                // //this.logger.timeEnd("Create WorldCell");

            }

            offset += CHUNK_SIZE;
            seek();

        };

        // reader.readAsText(blob);
        seek();

        function seek () {

            if ( offset >= blob.size ) { return }

            const slice = blob.slice( offset, offset + CHUNK_SIZE, 'text/plain' );
            reader.readAsText( slice );

        }

    }

    /**
     *
     * @param line
     * @private
     */
    _parseLine ( line ) {

        const values        = line.split( /\s/g ).filter( Boolean );
        const numberOfWords = values.length;

        if ( numberOfWords === 3 ) { // XYZ

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] )
            } );

        } else if ( numberOfWords === 4 ) { // XYZI

            this._pointsHaveIntensity = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] )
            } );

        } else if ( numberOfWords === 6 ) { // XYZRGB

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveColor = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                r: parseFloat( values[ 3 ] ),
                g: parseFloat( values[ 4 ] ),
                b: parseFloat( values[ 5 ] )
            } );

        } else if ( numberOfWords === 7 ) { // XYZIRGB

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveIntensity = true;
            this._pointsHaveColor     = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] ),
                r: parseFloat( values[ 4 ] ),
                g: parseFloat( values[ 5 ] ),
                b: parseFloat( values[ 6 ] )
            } );

        } else if ( numberOfWords === 9 ) {

            this._pointsHaveColor   = true;
            this._pointsHaveNormals = true;

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                r:  parseFloat( values[ 3 ] ),
                g:  parseFloat( values[ 4 ] ),
                b:  parseFloat( values[ 5 ] ),
                nx: parseFloat( values[ 6 ] ),
                ny: parseFloat( values[ 7 ] ),
                nz: parseFloat( values[ 8 ] )
            } );

        } else if ( numberOfWords === 10 ) {

            this._pointsHaveIntensity = true;
            this._pointsHaveColor     = true;
            this._pointsHaveNormals   = true;

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                i:  parseFloat( values[ 3 ] ),
                r:  parseFloat( values[ 4 ] ),
                g:  parseFloat( values[ 5 ] ),
                b:  parseFloat( values[ 6 ] ),
                nx: parseFloat( values[ 7 ] ),
                ny: parseFloat( values[ 8 ] ),
                nz: parseFloat( values[ 9 ] )
            } );

        } else {
            this.logger.error( `Invalid data line: ${ line }` );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLines ( lines ) {

        const firstLine = lines[ 0 ].split( /\s/g ).filter( Boolean );
        const pointType = firstLine.length;

        if ( pointType === 3 ) {

            this._parseLinesAsXYZ( lines );

        } else if ( pointType === 4 ) {

            this._parseLinesAsXYZI( lines );

        } else if ( pointType === 6 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZRGB( lines );

        } else if ( pointType === 7 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals see _parseLinesAsXYZInXnYnZ
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZIRGB( lines );

        } else if ( pointType === 9 ) {

            this._parseLinesAsXYZRGBnXnYnZ( lines );

        } else if ( pointType === 10 ) {

            this._parseLinesAsXYZIRGBnXnYnZ( lines );

        } else {
            this.logger.error( `Invalid data line: ${ lines }` );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZ ( lines ) {

        let words = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] )
            } );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZI ( lines ) {

        this._pointsHaveIntensity = true;
        let words                 = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZRGB ( lines ) {

        this._pointsHaveColor = true;
        let words             = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                r: parseFloat( words[ 3 ] ),
                g: parseFloat( words[ 4 ] ),
                b: parseFloat( words[ 5 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZnXnYnZ ( lines ) {

        let words = [];
        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZIRGB ( lines ) {

        this._pointsHaveIntensity = true;
        this._pointsHaveColor     = true;
        let words                 = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] ),
                r: parseFloat( words[ 4 ] ),
                g: parseFloat( words[ 5 ] ),
                b: parseFloat( words[ 6 ] )
            } );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZInXnYnZ ( lines ) {

        let words = [];
        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                i:  parseFloat( words[ 3 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZRGBnXnYnZ ( lines ) {

        this._pointsHaveColor   = true;
        this._pointsHaveNormals = true;
        let words               = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                r:  parseFloat( words[ 3 ] ),
                g:  parseFloat( words[ 4 ] ),
                b:  parseFloat( words[ 5 ] ),
                nx: parseFloat( words[ 6 ] ),
                ny: parseFloat( words[ 7 ] ),
                nz: parseFloat( words[ 8 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZIRGBnXnYnZ ( lines ) {

        this._pointsHaveIntensity = true;
        this._pointsHaveColor     = true;
        this._pointsHaveNormals   = true;
        let words                 = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                i:  parseFloat( words[ 3 ] ),
                r:  parseFloat( words[ 4 ] ),
                g:  parseFloat( words[ 5 ] ),
                b:  parseFloat( words[ 6 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } );

        }
    }

    /**
     *
     * @param line
     * @private
     */
    _parseLineB ( line ) {

        const values        = line.split( /\s/g ).filter( Boolean );
        const numberOfWords = values.length;
        const bufferIndex   = this._bufferIndex;

        if ( numberOfWords === 3 ) {

            // positions
            this._positions[ bufferIndex ]     = parseFloat( values[ 0 ] );
            this._positions[ bufferIndex + 1 ] = parseFloat( values[ 1 ] );
            this._positions[ bufferIndex + 2 ] = parseFloat( values[ 2 ] );

            this._bufferIndex += 3;

        }

    }

    /**
     *
     * @param line
     * @private
     */
    _parseLineC ( line ) {

        const values        = line.split( /\s/g ).filter( Boolean );
        const numberOfWords = values.length;
        const bufferIndex   = this._bufferIndexC;

        if ( numberOfWords === 3 ) {

            // positions
            this._positionsC[ bufferIndex ]     = Number.parseFloat( values[ 0 ] );
            this._positionsC[ bufferIndex + 1 ] = Number.parseFloat( values[ 1 ] );
            this._positionsC[ bufferIndex + 2 ] = Number.parseFloat( values[ 2 ] );

            this._bufferIndexC += 3;

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
            this._boundingBox.setFromPoints( this._points );
            this.setOffset( this._boundingBox.getCenter() );
            //this.logger.timeEnd("Compute Points");
        }

        const offsetX = this._offset.x;
        const offsetY = this._offset.y;
        const offsetZ = this._offset.z;
        let point     = null;
        for ( let i = 0, numberOfPoints = this._points.length ; i < numberOfPoints ; ++i ) {

            point = this._points[ i ];
            point.x -= offsetX;
            point.y -= offsetY;
            point.z -= offsetZ;

        }

    }

    /**
     *
     * @param groupToFeed
     * @private
     */
    _createCloudPoint ( groupToFeed ) {

        const SPLIT_LIMIT        = 1000000;
        // var group = new Group();
        const numberOfPoints     = this._points.length;
        const numberOfSplit      = Math.ceil( numberOfPoints / SPLIT_LIMIT );
        let splice               = null;
        let numberOfPointInSplit = 0;
        let cloud                = null;

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = this._points.splice( 0, SPLIT_LIMIT );
            numberOfPointInSplit = splice.length;

            const geometry  = new threeFull.BufferGeometry();
            const positions = new Float32Array( numberOfPointInSplit * 3 );
            const colors    = new Float32Array( numberOfPointInSplit * 3 );
            let bufferIndex = 0;
            let point       = null;

            for ( let i = 0 ; i < numberOfPointInSplit ; ++i ) {

                // current point
                point = splice[ i ];

                // positions
                positions[ bufferIndex ]     = point.x;
                positions[ bufferIndex + 1 ] = point.y;
                positions[ bufferIndex + 2 ] = point.z;

                // colors
                if ( this._pointsHaveColor ) {
                    colors[ bufferIndex ]     = point.r / 255;
                    colors[ bufferIndex + 1 ] = point.g / 255;
                    colors[ bufferIndex + 2 ] = point.b / 255;
                } else {
                    colors[ bufferIndex ]     = 0.1;
                    colors[ bufferIndex + 1 ] = 0.2;
                    colors[ bufferIndex + 2 ] = 0.5;
                }

                bufferIndex += 3;

            }

            geometry.setAttribute( 'position', new threeFull.BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new threeFull.BufferAttribute( colors, 3 ) );

            const material = new threeFull.PointsMaterial( {
                size:         0.01,
                vertexColors: true
            } );

            cloud = new threeFull.Points( geometry, material );
            groupToFeed.children.push( cloud );
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

        const numberOfPoints = this._points.length;
        const geometry       = new threeFull.BufferGeometry();
        const positions      = new Float32Array( numberOfPoints * 3 );
        const colors         = new Float32Array( numberOfPoints * 3 );
        let bufferIndex      = 0;
        let point            = null;

        for ( let i = 0 ; i < numberOfPoints ; ++i ) {

            // current point
            point = this._points[ i ];

            // positions
            positions[ bufferIndex ]     = point.x;
            positions[ bufferIndex + 1 ] = point.y;
            positions[ bufferIndex + 2 ] = point.z;

            // colors
            if ( this._pointsHaveColor ) {
                colors[ bufferIndex ]     = point.r / 255;
                colors[ bufferIndex + 1 ] = point.g / 255;
                colors[ bufferIndex + 2 ] = point.b / 255;
            } else {
                colors[ bufferIndex ]     = 0.1;
                colors[ bufferIndex + 1 ] = 0.2;
                colors[ bufferIndex + 2 ] = 0.5;
            }

            bufferIndex += 3;

        }

        geometry.setAttribute( 'position', new threeFull.BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'color', new threeFull.BufferAttribute( colors, 3 ) );

        const material = new threeFull.PointsMaterial( {
            size:         0.005,
            vertexColors: true
        } );

        const cloud = new threeFull.Points( geometry, material );

        //Todo: Apply import coordinates syteme here !
        cloud.rotation.x -= Math.PI / 2;

        group.children.push( cloud );

        // Clear current processed points
        this._points = [];

    }

}

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
//import { BufferAttribute }       from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }        from 'three-full/sources/core/BufferGeometry'
//import { FileLoader }            from 'three-full/sources/loaders/FileLoader'
//import { Box3 }                  from 'three-full/sources/math/Box3'
//import { DefaultLoadingManager } from 'three-full/sources/loaders/LoadingManager'
//import { PointsMaterial }        from 'three-full/sources/materials/PointsMaterial'
//import { Group }                 from 'three-full/sources/objects/Group'
//import { Points }                from 'three-full/sources/objects/Points'

/////////////

const NullCharRegex = new RegExp( '\0', 'g' ); // eslint-disable-line no-control-regex

const PointClasses = iteeUtils.toEnum( {
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
} );

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
    constructor ( manager = threeFull.DefaultLoadingManager, logger = iteeCore.DefaultLogger ) {

        this.manager = manager;
        this.logger  = logger;

        this._reader         = new iteeClient.TBinaryReader();
        this._fullVersion    = '';
        this._boundingBox    = new threeFull.Box3();
        this._points         = [];
        this._numberOfPoints = 0;
        this._coloredPoints  = false;
        this._autoOffset     = false; // Only for tiny files !!!!!!!
        this._offset         = {
            x: 0,
            y: 0,
            z: 0
        };

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
        };
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

        //this.logger.time("LASLoader")

        const loader = new threeFull.FileLoader( this.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, ( arraybuffer ) => {

            this.parse( arraybuffer, onLoad, onProgress, onError, sampling );

        }, onProgress, onError );

    }

    /**
     * An alternative setter to offset property
     *
     * @param {Three.Vector3|Object} offset - An global position offset to apply on the point cloud.
     */
    setOffset ( offset ) {

        //TODO: check is correct

        this._offset     = offset;
        this._autoOffset = false;

        //TODO: that allow chaining.

    }

    /**
     *
     * @param arraybuffer
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    parse ( arraybuffer, onLoad, onProgress, onError ) {

        try {

            this._reader.buffer = arraybuffer;

            const fileSignature = this._reader.getString( 4, false );
            if ( fileSignature !== 'LASF' ) { throw new Error( 'Invalid las file signature. Abort parsing !' ) }

            // Extract version then reset reader cursor position to start
            this._reader.skipOffsetOf( 24 );
            const majorVersion = this._reader.getUint8();
            const minorVersion = this._reader.getUint8();
            this._reader.skipOffsetTo( 0 );

            const lasVersion = `${ majorVersion }.${ minorVersion }`;

            const header                = this._parseHeader( lasVersion );
            const variableLengthRecords = this._parseVariableLengthRecords( header );
            const pointDataRecords      = this._parsePointDataRecords( header, onProgress );

            this.convert( {
                Header:                header,
                VariableLengthRecords: variableLengthRecords,
                PointDataRecords:      pointDataRecords
            }, onLoad, onProgress, onError );

        } catch ( error ) {

            onError( error );

        }

    }

    // Header

    _parseHeader ( lasVersion ) {

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

    _parseHeader_1_0 () {

        return {
            FileSignature:                 this._reader.getString( 4 ),
            Reserved:                      this._reader.skipOffsetOf( iteeClient.Byte.Four ),
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

    _parseHeader_1_1 () {

        return {
            FileSignature:                 this._reader.getString( 4 ),
            FileSourceId:                  this._reader.getUint16(),
            Reserved:                      this._reader.skipOffsetOf( iteeClient.Byte.Two ) && null,
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

    _parseHeader_1_2 () {

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

    _parseHeader_1_3 () {

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

    _parseHeader_1_4 () {

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

    _parseVariableLengthRecords ( header ) {

        const fullVersion            = `${ header.VersionMajor }.${ header.VersionMinor }`;
        const variablesLengthRecords = [];

        for ( let i = 0 ; i < header.NumberOfVariableLengthRecords ; i++ ) {

            const header = this._parseVariableLengthRecordHeader();

            //!\ Legacy => RecordSignature = Reserved since las v1.1
            if ( fullVersion === '1.0' && header.Reserved !== 0xAABB ) {
                throw new Error( 'Invalid variable length record header signature... Abort parsing !' )
            }

            const userId       = header.UserID;
            const recordId     = header.RecordID;
            const recordLength = header.RecordLengthAfterHeader;
            const content      = this._parseVariableLengthRecordContent( userId, recordId, recordLength );

            variablesLengthRecords.push( {
                Header:  header,
                Content: content
            } );

        }

        return variablesLengthRecords

    }

    _parseVariableLengthRecordHeader () {

        return {
            Reserved:                this._reader.getUint16(),
            UserID:                  this._reader.getString( 16 ).replace( NullCharRegex, '' ),
            RecordID:                this._reader.getUint16(),
            RecordLengthAfterHeader: this._reader.getUint16(),
            Description:             this._reader.getString( 32 ).replace( NullCharRegex, '' )
        }

    }
    _parseVariableLengthRecordContent ( userId, recordId, recordLength ) {

        switch ( userId ) {
            case 'LASF_Projection':
                return this._parseProjectionRecord( recordId, recordLength )
            case 'LASF_Spec':
                return this._parseSpecRecord()

            default:
                return this._parseCustomRecord( recordLength )
        }

    }

    _parseProjectionRecord ( recordId, recordLength ) {

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
                console.error( 'Unable to determine LASF_Projection underlying type ! Skip current record.' );
                this._reader.skipOffsetOf( recordLength );
        }

    }

    // Todo
    _parseOGCMathTransformWKT () {

        return undefined

    }

    // Todo
    _parseOGCCoordinateTransformWKT () {

        return undefined

    }

    _parseGeoKeyDirectoryTag () {

        const geoKey = {
            wKeyDirectoryVersion: this._reader.getUint16(),
            wKeyRevision:         this._reader.getUint16(),
            wMinorRevision:       this._reader.getUint16(),
            wNumberOfKeys:        this._reader.getUint16(),
            sKeyEntry:            []
        };

        for ( let j = 0 ; j < geoKey.wNumberOfKeys ; j++ ) {
            geoKey.sKeyEntry.push( {
                wKeyID:           this._reader.getUint16(),
                wTIFFTagLocation: this._reader.getUint16(),
                wCount:           this._reader.getUint16(),
                wValue_Offset:    this._reader.getUint16()
            } );
        }

        return geoKey

    }

    _parseGeoDoubleParamsTag ( recordLength ) {

        const numberOfEntries = recordLength / iteeClient.Byte.Height;
        const params          = [];

        for ( let i = 0 ; i < numberOfEntries ; i++ ) {
            params[ i ] = this._reader.getFloat64();
        }

        return params

    }

    _parseGeoASCIIParamsTag ( recordLength ) {

        return this._reader.getString( recordLength ).replace( NullCharRegex, '' )

    }

    _parseSpecRecord ( recordId ) {

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

    _parseClassificationLookupRecord () {

        const records = [];

        for ( let i = 0 ; i < 256 ; i++ ) {
            records.push( {
                ClassNumber: this._reader.getUint8(),
                Description: this._reader.getString( 15 ).replace( NullCharRegex, '' )
            } );
        }

        return records

    }

    _parseHeaderLookupForFlightLinesRecord () {

        return {
            FileMarkerNumber: this._reader.getUint8(),
            Filename:         this._reader.getString( 256 ).replace( NullCharRegex, '' )
        }

    }

    _parseHistogramRecord () {

        return undefined

    }

    _parseTextAreaDescriptionRecord () {

        return undefined

    }

    // Todo
    _parseExtraBytesRecord () {

        return undefined

    }

    // Todo
    _parseSupersededRecord () {

        return undefined

    }

    // Todo
    _parseWaveformPacketDesciptor () {

        return undefined

    }

    // Todo
    _parseWaveformDataPacket () {

        return undefined

    }

    _parseCustomRecord ( recordLength ) {

        const record = new Uint8Array( recordLength );

        for ( let i = 0 ; i < recordLength ; i++ ) {
            record[ i ] = this._reader.getUint8();
        }

        return record

    }

    // PointDataRecords

    _parsePointDataRecords ( header, onProgress ) {

        const offsetToPointData = header.OffsetToPointData;
        if ( this._reader.offset !== offsetToPointData ) {
            console.error( 'The current reader offset does not match the header offset to point data ! Defaulting to header value.' );
            this._reader.skipOffsetTo( offsetToPointData );
        }

        const pointDataRecordFormat              = ( header.VersionMinor < 4 ) ? header.PointDataFormatID : header.PointDataRecordFormat;
        const parsePointDataRecordFormatFunction = this._getPointDataRecordFormat( pointDataRecordFormat );

        const numberOfPointRecords = ( header.VersionMinor < 4 ) ? header.NumberOfPointRecords : header.LegacyNumberOfPointRecords;
        const points               = new Array( numberOfPointRecords );

        for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
            points[ i ] = parsePointDataRecordFormatFunction();

            if ( i % 100000 === 0 ) {
                onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                    lengthComputable: true,
                    loaded:           i,
                    total:            numberOfPointRecords
                } ) );
            }
        }

        return points

    }

    _getPointDataRecordFormat ( format ) {

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

    _parsePointDataRecordFormat_0 () {

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

    _parsePointDataRecordFormat_1 () {

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

    _parsePointDataRecordFormat_2 () {

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

    _parsePointDataRecordFormat_3 () {

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

    _parsePointDataRecordFormat_4 () {

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

    _parsePointDataRecordFormat_5 () {

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

    _parsePointDataRecordFormat_6 () {

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

    _parsePointDataRecordFormat_7 () {

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

    _parsePointDataRecordFormat_8 () {

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

    _parsePointDataRecordFormat_9 () {

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

    _parsePointDataRecordFormat_10 () {

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

    convert ( lasDatas, onLoad, onProgress, onError ) {

        try {

            const pointsGroup            = new threeFull.Group();
            pointsGroup.name             = 'Cloud';
            pointsGroup.matrixAutoUpdate = false;
            pointsGroup.position.x       = lasDatas.Header.XOffset;
            pointsGroup.position.y       = lasDatas.Header.YOffset;
            pointsGroup.position.z       = lasDatas.Header.ZOffset;
            //            pointsGroup.scale.x          = lasDatas.Header.XScaleFactor
            //            pointsGroup.scale.y          = lasDatas.Header.YScaleFactor
            //            pointsGroup.scale.z          = lasDatas.Header.ZScaleFactor
            //        pointsGroup.rotation.x -= PiOnTwo
            pointsGroup.userData = {
                header:  lasDatas.Header,
                records: lasDatas.VariableLengthRecords
            };

            this._createCloudPoints( pointsGroup, lasDatas, onProgress );

            onLoad( pointsGroup );

        } catch ( error ) {

            onError( error );

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
            this._boundingBox.setFromPoints( this._points );
            this.setOffset( this._boundingBox.getCenter() );
            //this.logger.timeEnd("Compute Points");
        }

        const offsetX = this._offset.x;
        const offsetY = this._offset.y;
        const offsetZ = this._offset.z;
        let point     = null;
        for ( let i = 0, numberOfPoints = this._points.length ; i < numberOfPoints ; ++i ) {

            point = this._points[ i ];
            point.x -= offsetX;
            point.y -= offsetY;
            point.z -= offsetZ;

        }

    }

    /**
     *
     * @param groupToFeed
     * @private
     */
    _createCloudPoints ( groupToFeed, lasDatas, onProgress ) {

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
        };

        // Precompute max intensity for all splits
        let maxIntensity = -Infinity;
        for ( let pointDataRecord of lasDatas.PointDataRecords ) {
            const i = pointDataRecord.Intensity;
            if ( i > maxIntensity ) {
                maxIntensity = i;
            }
        }


        const scaleX                = lasDatas.Header.XScaleFactor;
        const scaleY                = lasDatas.Header.YScaleFactor;
        const scaleZ                = lasDatas.Header.ZScaleFactor;
        const SPLIT_LIMIT           = 1000000;
        const numberOfPoints        = lasDatas.PointDataRecords.length;
        const numberOfSplit         = Math.ceil( numberOfPoints / SPLIT_LIMIT );
        const pointDataRecordFormat = ( lasDatas.Header.VersionMinor < 4 ) ? lasDatas.Header.PointDataFormatID : lasDatas.Header.PointDataRecordFormat;
        const pointHaveColor        = ![ 0, 1, 4, 6, 9 ].includes( pointDataRecordFormat );
        const material              = new threeFull.PointsMaterial( {
            size:         0.01,
            vertexColors: true
        } );
        let numberOfPointInSplit    = 0;
        let splice                  = null;
        let cloudPoint              = null;

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = lasDatas.PointDataRecords.splice( 0, SPLIT_LIMIT );
            numberOfPointInSplit = splice.length;
            const geometry       = new threeFull.BufferGeometry();
            const positions      = new Float32Array( numberOfPointInSplit * 3 );
            const colors         = new Float32Array( numberOfPointInSplit * 3 );
            let bufferIndex      = 0;
            let point            = null;

            for ( let i = 0 ; i < numberOfPointInSplit ; ++i ) {

                const currentPointIndex = i + ( splitIndex * SPLIT_LIMIT );
                if ( currentPointIndex % 100000 === 0 ) {
                    onProgress( new ProgressEvent( 'ConvertPointDataRecords', {
                        lengthComputable: true,
                        loaded:           currentPointIndex,
                        total:            numberOfPoints
                    } ) );
                }

                // current point
                point = splice[ i ];

                // positions
                //                positions[ bufferIndex ]     = point.X
                //                positions[ bufferIndex + 1 ] = point.Y
                //                positions[ bufferIndex + 2 ] = point.Z
                positions[ bufferIndex ]     = point.X * scaleX;
                positions[ bufferIndex + 1 ] = point.Y * scaleY;
                positions[ bufferIndex + 2 ] = point.Z * scaleZ;
                //                                    const x      = ( record.X * scaleX ) + offsetX
                //                                    const y      = ( record.Y * scaleY ) + offsetY
                //                                    const z      = ( record.Z * scaleZ ) + offsetZ


                // colors
                if ( pointHaveColor ) {

                    colors[ bufferIndex ]     = point.R / 65535;
                    colors[ bufferIndex + 1 ] = point.G / 65535;
                    colors[ bufferIndex + 2 ] = point.B / 65535;

                } else {

                    const colorPointClass = this.colorForPointClass[ classPointReverseMap[ point.Classification.Class ] ];
                    if ( require$$0$3.isDefined( colorPointClass ) ) {

                        colors[ bufferIndex ]     = colorPointClass.r / 255;
                        colors[ bufferIndex + 1 ] = colorPointClass.g / 255;
                        colors[ bufferIndex + 2 ] = colorPointClass.b / 255;

                    } else {

                        const intensity           = point.Intensity;
                        colors[ bufferIndex ]     = intensity / maxIntensity; //255
                        colors[ bufferIndex + 1 ] = intensity / maxIntensity; //255
                        colors[ bufferIndex + 2 ] = intensity / maxIntensity; //255

                    }

                }

                bufferIndex += 3;

            }

            geometry.setAttribute( 'position', new threeFull.BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new threeFull.BufferAttribute( colors, 3 ) );

            cloudPoint = new threeFull.Points( geometry, material );
            groupToFeed.add( cloudPoint );

        }

    }

    /**
     *
     * @param group
     * @private
     */
    _createSubCloudPoint ( group ) {

        const numberOfPoints = this._points.length;
        const geometry       = new threeFull.BufferGeometry();
        const positions      = new Float32Array( numberOfPoints * 3 );
        const colors         = new Float32Array( numberOfPoints * 3 );
        let bufferIndex      = 0;
        let point            = null;

        for ( let i = 0 ; i < numberOfPoints ; ++i ) {

            // current point
            point = this._points[ i ];

            // positions
            positions[ bufferIndex ]     = point.x;
            positions[ bufferIndex + 1 ] = point.y;
            positions[ bufferIndex + 2 ] = point.z;

            // colors
            if ( this._pointsHaveColor ) {
                colors[ bufferIndex ]     = point.r / 255;
                colors[ bufferIndex + 1 ] = point.g / 255;
                colors[ bufferIndex + 2 ] = point.b / 255;
            } else {
                colors[ bufferIndex ]     = 0.1;
                colors[ bufferIndex + 1 ] = 0.2;
                colors[ bufferIndex + 2 ] = 0.5;
            }

            bufferIndex += 3;

        }

        geometry.setAttribute( 'position', new threeFull.BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'color', new threeFull.BufferAttribute( colors, 3 ) );

        const material = new threeFull.PointsMaterial( {
            size:         0.005,
            vertexColors: true
        } );

        const cloud = new threeFull.Points( geometry, material );

        //Todo: Apply import coordinates syteme here !
        cloud.rotation.x -= Math.PI / 2;

        group.children.push( cloud );

        // Clear current processed points
        this._points = [];

    }

}

/* BitArray DataType */

class BitArray {

    /* PRIVATE STATIC METHODS */

    // Calculate the intersection of two bits
    static _intersect ( bit1, bit2 ) {
        return bit1 === BitArray._ON && bit2 === BitArray._ON ? BitArray._ON : BitArray._OFF
    }

    // Calculate the union of two bits
    static _union ( bit1, bit2 ) {
        return bit1 === BitArray._ON || bit2 === BitArray._ON ? BitArray._ON : BitArray._OFF
    }

    // Calculate the difference of two bits
    static _difference ( bit1, bit2 ) {
        return bit1 === BitArray._ON && bit2 !== BitArray._ON ? BitArray._ON : BitArray._OFF
    }

    // Get the longest or shortest (smallest) length of the two bit arrays
    static _getLen ( bitArray1, bitArray2, smallest ) {
        var l1 = bitArray1.getLength();
        var l2 = bitArray2.getLength();

        return l1 > l2 ? smallest ? l2 : l1 : smallest ? l2 : l1
    }

    /* PUBLIC STATIC METHODS */
    static getUnion ( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._union( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }

    static getIntersection ( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._intersect( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }

    static getDifference ( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._difference( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }

    static shred ( number ) {
        var bits = new Array();
        var q    = number;
        do {
            bits.push( q % 2 );
            q = Math.floor( q / 2 );
        } while ( q > 0 )
        return new BitArray( bits.length, bits.reverse() )
    }

    constructor ( size, bits ) {
        // Private field - array for our bits
        this.m_bits = new Array();

        //.ctor - initialize as a copy of an array of true/false or from a numeric value
        if ( bits && bits.length ) {
            for ( let i = 0 ; i < bits.length ; i++ ) {
                this.m_bits.push( bits[ i ] ? BitArray._ON : BitArray._OFF );
            }
        } else if ( !isNaN( bits ) ) {
            this.m_bits = BitArray.shred( bits ).m_bits;
        }
        if ( size && this.m_bits.length !== size ) {
            if ( this.m_bits.length < size ) {
                for ( let i = this.m_bits.length ; i < size ; i++ ) {
                    this.m_bits.push( BitArray._OFF );
                }
            } else {
                for ( let i = size ; i > this.m_bits.length ; i-- ) {
                    this.m_bits.pop();
                }
            }
        }
    }

    getLength () {
        return this.m_bits.length
    }

    getAt ( index ) {
        if ( index < this.m_bits.length ) {
            return this.m_bits[ index ]
        }
        return null
    }

    setAt ( index, value ) {
        if ( index < this.m_bits.length ) {
            this.m_bits[ index ] = value ? BitArray._ON : BitArray._OFF;
        }
    }

    resize ( newSize ) {
        var tmp = new Array();
        for ( var i = 0 ; i < newSize ; i++ ) {
            if ( i < this.m_bits.length ) {
                tmp.push( this.m_bits[ i ] );
            } else {
                tmp.push( BitArray._OFF );
            }
        }
        this.m_bits = tmp;
    }

    getCompliment () {
        var result = new BitArray( this.m_bits.length );
        for ( var i = 0 ; i < this.m_bits.length ; i++ ) {
            result.setAt( i, this.m_bits[ i ] ? BitArray._OFF : BitArray._ON );
        }
        return result
    }

    toString () {
        var s = new String();
        for ( var i = 0 ; i < this.m_bits.length ; i++ ) {
            s = s.concat( this.m_bits[ i ] === BitArray._ON ? '1' : '0' );
        }
        return s
    }

    toNumber () {
        var pow = 0;
        var n   = 0;
        for ( var i = this.m_bits.length - 1 ; i >= 0 ; i-- ) {
            if ( this.m_bits[ i ] === BitArray._ON ) {
                n += Math.pow( 2, pow );
            }
            pow++;
        }
        return n
    }
}

/* BitArray PRIVATE STATIC CONSTANTS */
BitArray._ON  = 1;
BitArray._OFF = 0;

/**
 *
 */

class BitManager {

    static getBit ( bitField, bitPosition ) {
        return ( bitField & ( 1 << bitPosition ) ) === 0 ? 0 : 1
    }

    static setBit ( bitField, bitPosition ) {
        return bitField | ( 1 << bitPosition )
    }

    static clearBit ( bitField, bitPosition ) {
        const mask = ~( 1 << bitPosition );
        return bitField & mask
    }

    static updateBit ( bitField, bitPosition, bitValue ) {
        const bitValueNormalized = bitValue ? 1 : 0;
        const clearMask          = ~( 1 << bitPosition );
        return ( bitField & clearMask ) | ( bitValueNormalized << bitPosition )
    }

    static getBits ( bitField, bitPositions ) {
        let bits = 0;
        for ( let bitPosition of bitPositions ) {
            if ( BitManager.getBit( bitField, bitPosition ) ) {
                bits = BitManager.setBit( bits, bitPosition );
            }
        }
        return bits
    }

}

exports.ASCLoader = ASCLoader;
exports.BitArray = BitArray;
exports.BitManager = BitManager;
exports.DBFLoader = DBFLoader;
exports.LASLoader = LASLoader;
exports.PointClasses = PointClasses;
exports.SHPLoader = SHPLoader;
exports.ShapeType = ShapeType;
exports.registerPlugin = registerPlugin;
//# sourceMappingURL=itee-plugin-three.cjs.js.map
