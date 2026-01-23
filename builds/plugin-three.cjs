/**
 * ┳      ┏┓┓    •     ┓           ┏┓ ┏┓ ┏┓      ┏┓            ┏┳ 
 * ┃╋┏┓┏┓ ┃┃┃┓┏┏┓┓┏┓━━╋┣┓┏┓┏┓┏┓  ┓┏┏┛ ┃┫ ┃┫  ━━  ┃ ┏┓┏┳┓┏┳┓┏┓┏┓ ┃┏
 * ┻┗┗ ┗ •┣┛┗┗┻┗┫┗┛┗  ┗┛┗┛ ┗ ┗   ┗┛┗━•┗┛•┗┛      ┗┛┗┛┛┗┗┛┗┗┗┛┛┗┗┛┛
 *              ┛                                                 
 * @desc    This itee plugin allow to use three js content from end to end in an itee client-server-database architecture
 * @author  [Itee (Tristan Valcke)]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses}
 * 
 */
'use strict';

var database = require('@itee/database');
var mongodb = require('@itee/mongodb');
var require$$0$3 = require('@itee/validators');
var threeFull = require('three-full');
var client = require('@itee/client');
var core = require('@itee/core');
var utils = require('@itee/utils');
var node_module = require('node:module');
var bson = require('bson');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var require$$0__default = /*#__PURE__*/_interopDefault(require$$0$3);

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @see [IFC Standard]{@link http://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/}
 *
 */


class TObjects3DController extends mongodb.TMongooseController {

    constructor( parameters = {} ) {
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
    async _readOneDocument( type, query ) {
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
    async _readManyDocument( type, query, projection ) {
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
    async _updateDocument( document, updateQuery, queryOptions ) {

        if ( require$$0$3.isNotDefined( document ) ) {
            return null
        }

        const result = await this._driver
                                 .model( document.type )
                                 .findByIdAndUpdate( document._id, updateQuery, queryOptions )
                                 .exec();

        return result
    }

    async getAllChildrenIds( parentId, recursive = false ) {

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

    async _deleteOne( id, response ) {

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

                mongodb.TMongooseController.returnData( {
                    deletedObjectsCount,
                    deletedGeometriesResult,
                    deletedMaterialsResult
                }, response );

            } else ;

        } catch ( error ) {

            mongodb.TMongooseController.returnError( error, response );

        }

    }

    async _deleteDocuments( type, documentIds ) {
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
    async _deleteDocument( document ) {
        if ( require$$0$3.isNotDefined( document ) ) { return null }

        //        console.log( `Delete: ${ document.name } [${ document._id }]` )

        const deleteResult = await this._driver
                                       .model( document.type )
                                       .findByIdAndDelete( document._id )
                                       .exec();

        return ( deleteResult && deleteResult._doc ) ? deleteResult._doc._id : null

    }

    ///

    async _removeParentReference( document ) {
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
    async _removeChildrenDocuments( documents ) {

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
    async _removeChildDocument( document ) {

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
    async _removeOrphanGeometryWithId( geometryId ) {
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
    async _removeOrphanMaterialsWithIds( materialsIds ) {
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
    async _removeOrphanMaterialWithId( materialId ) {
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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class ColladaToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.ArrayBuffer
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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
const DBFVersion = /*#__PURE__*/utils.toEnum( {
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
const DataType = /*#__PURE__*/utils.toEnum( {
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
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                manager: threeFull.DefaultLoadingManager,
                logger:  core.DefaultLogger,
                reader:  new client.TBinaryReader()
            }, ...parameters
        };

        this.manager = _parameters.manager;
        this.logger  = _parameters.logger;
        this.reader  = _parameters.reader;

    }

    get manager() {
        return this._manager
    }

    set manager( value ) {
        this._manager = value;
    }

    get logger() {
        return this._logger
    }

    set logger( value ) {
        this._logger = value;
    }

    get reader() {
        return this._reader
    }

    set reader( value ) {
        this._reader = value;
    }

    setManager( value ) {
        this.manager = value;
        return this
    }

    setLogger( value ) {
        this.logger = value;
        return this
    }

    setReader( value ) {
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
    load( url, onLoad, onProgress, onError ) {

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
    parse( arrayBuffer ) {

        this.reader
            .setEndianess( client.Endianness.Big )
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
    _isValidVersion( version ) {

        return DBFVersion.includes( version )

    }

    /**
     *
     * @param version
     * @return {{}}
     * @private
     */
    _parseHeader( version ) {

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
    _parseHeaderV2() {

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
    _parseHeaderV2_5() {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();

        this.reader.setEndianess( client.Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( client.Endianness.Big );
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
    _parseHeaderV3() {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( client.Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( client.Endianness.Big );
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
    _parseHeaderV4() {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( client.Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( client.Endianness.Big );
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
    _parseDatas( version, header ) {

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
    _parseFieldProperties() {

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
    _getStandardProperties() {

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
    _getCustomProperties() {

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
    _getReferentialIntegrityProperties() {

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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class DbfToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( { dumpType: database.TAbstractFileConverter.DumpType.ArrayBuffer } );
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class FbxToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.ArrayBuffer
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class JsonToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.JSON
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class MtlToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.String
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class Obj2ToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.JSON
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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
 * @requires {@link https://github.com/Itee/@itee/client @itee/client}
 * @requires {@link https://github.com/Itee/@itee/utils @itee/utils}
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
const ShapeType = /*#__PURE__*/utils.toEnum( {
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
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                manager:      threeFull.DefaultLoadingManager,
                logger:       core.DefaultLogger,
                reader:       new client.TBinaryReader(),
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

    get globalOffset() {
        return this._globalOffset
    }

    set globalOffset( value ) {
        this._globalOffset = value;
    }

    get worldAxis() {
        return this._worldAxis
    }

    set worldAxis( value ) {
        this._worldAxis = value;
    }

    get manager() {
        return this._manager
    }

    set manager( value ) {
        this._manager = value;
    }

    get logger() {
        return this._logger
    }

    set logger( value ) {
        this._logger = value;
    }

    get reader() {
        return this._reader
    }

    set reader( value ) {
        this._reader = value;
    }

    setGlobalOffset( value ) {
        this.globalOffset = value;
        return this
    }

    setWorldAxis( value ) {
        this.worldAxis = value;
        return this
    }

    setManager( value ) {
        this.manager = value;
        return this
    }

    setLogger( value ) {
        this.logger = value;
        return this
    }

    setReader( value ) {
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
    load( url, onLoad, onProgress, onError ) {

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
    parse( arrayBuffer ) {

        this._reader
            .setEndianess( client.Endianness.Big )
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
    _parseHeader() {

        const fileCode = this._reader.getInt32();
        this._reader.skipOffsetOf( 20 );
        const fileLength = this._reader.getInt32();

        this._reader.setEndianess( client.Endianness.Little );

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
    _parseDatas( header ) {

        this._reader.skipOffsetTo( 100 );

        let datas         = [];
        let recordHeader  = undefined;
        let endOfRecord   = undefined;
        let recordContent = undefined;

        while ( !this._reader.isEndOfFile() ) {

            recordHeader = this._parseRecordHeader();
            endOfRecord  = this._reader.getOffset() + ( recordHeader.contentLength * 2 );

            // All parsing methods use little below
            this._reader.setEndianess( client.Endianness.Little );

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
    _parseRecordHeader() {

        this._reader.setEndianess( client.Endianness.Big );

        const recordNumber  = this._reader.getInt32();
        const contentLength = this._reader.getInt32();

        return {
            recordNumber,
            contentLength
        }

    }

    _parseNull() {

        this._reader.getInt32();
        return null

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parsePoint() {

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
    _parsePolyLine() {

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
    _parsePolygon() {

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

            if ( utils.ringClockwise( ring ) ) {

                polygons.push( ring );
                //					polygons.push( [ ring ] );

            } else {

                holes.push( ring );

            }

        } );

        holes.forEach( hole => {

            polygons.some( polygon => {

                if ( utils.ringContainsSome( polygon[ 0 ], hole ) ) {
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
    _parseMultiPoint() {

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
    _parseMultiPatch() {

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
    _convertToObjects( datas ) {

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

        function __createObjectsFromArrays( arrays ) {

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

        function __createObjectFromPoints( points ) {

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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class ShpToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.ArrayBuffer
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class StlToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.JSON
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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

 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
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
class TdsToThree extends database.TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: database.TAbstractFileConverter.DumpType.ArrayBuffer
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
    _convert( data, parameters, onSuccess, onProgress, onError ) {
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
 * @requires {@link https://github.com/Itee/@itee/client @itee/client}
 * @requires {@link https://github.com/Itee/@itee/database @itee/database}
 * @requires {@link https://github.com/Itee/@itee/validators @itee/validators}
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
class ThreeToMongoDB extends database.TAbstractDataInserter {

    /**
     * @constructor
     * @param {Object} [parameters={}] - An object containing all parameters to pass through the inheritance chain and for initialize this instance
     * @param {TLogger} [parameters.logger=Itee.Core.DefaultLogger]
     */
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                logger: core.DefaultLogger
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
    // Utils
    static _toLog( object ) {

        return JSON.stringify( {
            type: object.type || 'undefined',
            name: object.name || 'undefined',
            uuid: object.uuid || 'undefined',
            id:   object._id || 'undefined'
        } )

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
    async _save( data, parameters, onSuccess, onProgress, onError ) {

        const dataToParse = utils.toArray( data );
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
    async _parseObjects( objects = [], parentId = null ) {
        this.logger.debug( `_parseObjects(...)` );

        const _objects = utils.toArray( objects );
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
    async _parseObject( object, parentId = null ) {
        this.logger.debug( `_parseObject(${ ThreeToMongoDB._toLog( object ) }, ${ parentId })` );

        if ( require$$0$3.isNotDefined( object ) ) {
            return null
        }

        // Preprocess objects here to save geometry, materials and related before to save the object itself
        const objectType      = object.type;
        const objectName      = object.name;
        const objectGeometry  = object.geometry;
        const objectChildren  = utils.toArray( object.children );
        const objectMaterials = utils.toArray( object.material );

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
    async _getOrCreateDocuments( objects = [] ) {
        this.logger.debug( `_getOrCreateDocuments(...)` );

        const _objects = utils.toArray( objects );
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
    async _getOrCreateDocument( data ) {
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
    async _createDocuments( datas = [] ) {
        this.logger.debug( `_createDocuments(...)` );

        const _datas = utils.toArray( datas );
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
    async _createDocument( data ) {
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
    async _readDocuments( type, query ) {
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
    async _readDocument( type, query ) {
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
    async _updateDocuments( documents = [], updateQuery, queryOptions ) {
        this.logger.debug( `_updateDocuments(...)` );

        const _documents = utils.toArray( documents );
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
    async _updateDocument( document, updateQuery, queryOptions = { new: true } ) {
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
    async _deleteDocuments( documents = [] ) {
        this.logger.debug( `_deleteDocuments(...)` );

        const _documents = utils.toArray( documents );
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
    async _deleteDocument( document ) {
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
    async _removeChildrenDocuments( documents ) {
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
    async _removeChildDocument( document ) {
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
    async _removeOrphanGeometryWithId( geometryId ) {
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
    async _removeOrphanMaterialsWithIds( materialsIds ) {
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
    async _removeOrphanMaterialWithId( materialId ) {
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
  if (Object.prototype.hasOwnProperty.call(n, '__esModule')) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			var isInstance = false;
      try {
        isInstance = this instanceof a;
      } catch {}
			if (isInstance) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
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

var Audio = {};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Object3D
 *
 * @description Todo...
 */

function Object3D() {}

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

                function RemoveRecursivelyDotInKeyOf( properties ) {
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
    // Care here, the model contains an S char, not the discriminator !
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
	__proto__: null,
	Object3D: Object3D
});

var require$$0$2 = /*@__PURE__*/getAugmentedNamespace(Object3D$1);

/**
 * @module Schemas/Audio/Audio
 * @desc Export the ThreeJs Audio Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredAudio;

function requireAudio () {
	if (hasRequiredAudio) return Audio;
	hasRequiredAudio = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Audio', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}


	Audio.Audio = {
	    name:            'Audio',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Audio;
}

var AudioExports = requireAudio();

var AudioListener = {};

/**
 * @module Schemas/Audio/AudioListener
 * @desc Export the ThreeJs AudioListener Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredAudioListener;

function requireAudioListener () {
	if (hasRequiredAudioListener) return AudioListener;
	hasRequiredAudioListener = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'AudioListener', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	AudioListener.AudioListener = {
	    name:            'AudioListener',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return AudioListener;
}

var AudioListenerExports = requireAudioListener();

var PositionalAudio = {};

/**
 * @module Schemas/Audio/PositionalAudio
 * @desc Export the ThreeJs PositionalAudio Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPositionalAudio;

function requirePositionalAudio () {
	if (hasRequiredPositionalAudio) return PositionalAudio;
	hasRequiredPositionalAudio = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'PositionalAudio', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PositionalAudio.PositionalAudio = {
	    name:            'PositionalAudio',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PositionalAudio;
}

var PositionalAudioExports = requirePositionalAudio();

var ArrayCamera = {};

/**
 * @module Schemas/Camera/ArrayCamera
 * @desc Export the ThreeJs ArrayCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredArrayCamera;

function requireArrayCamera () {
	if (hasRequiredArrayCamera) return ArrayCamera;
	hasRequiredArrayCamera = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'ArrayCamera', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ArrayCamera.ArrayCamera = {
	    name:            'ArrayCamera',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ArrayCamera;
}

var ArrayCameraExports = requireArrayCamera();

var Camera = {};

/**
 * @module Schemas/Camera/Camera
 * @desc Export the ThreeJs Camera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCamera;

function requireCamera () {
	if (hasRequiredCamera) return Camera;
	hasRequiredCamera = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Camera', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Camera.Camera = {
	    name:            'Camera',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Camera;
}

var CameraExports = requireCamera();

var CubeCamera = {};

/**
 * @module Schemas/Camera/CubeCamera
 * @desc Export the ThreeJs CubeCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCubeCamera;

function requireCubeCamera () {
	if (hasRequiredCubeCamera) return CubeCamera;
	hasRequiredCubeCamera = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'CubeCamera', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CubeCamera.CubeCamera = {
	    name:            'CubeCamera',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CubeCamera;
}

var CubeCameraExports = requireCubeCamera();

var OrthographicCamera = {};

/**
 * @module Schemas/Camera/OrthographicCamera
 * @desc Export the ThreeJs OrthographicCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredOrthographicCamera;

function requireOrthographicCamera () {
	if (hasRequiredOrthographicCamera) return OrthographicCamera;
	hasRequiredOrthographicCamera = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'OrthographicCamera', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	OrthographicCamera.OrthographicCamera = {
	    name:            'OrthographicCamera',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return OrthographicCamera;
}

var OrthographicCameraExports = requireOrthographicCamera();

var PerspectiveCamera = {};

/**
 * @module Schemas/Camera/PerspectiveCamera
 * @desc Export the ThreeJs PerspectiveCamera Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPerspectiveCamera;

function requirePerspectiveCamera () {
	if (hasRequiredPerspectiveCamera) return PerspectiveCamera;
	hasRequiredPerspectiveCamera = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'PerspectiveCamera', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PerspectiveCamera.PerspectiveCamera = {
	    name:            'PerspectiveCamera',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PerspectiveCamera;
}

var PerspectiveCameraExports = requirePerspectiveCamera();

var BufferAttribute = {};

const require$1 = node_module.createRequire((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('plugin-three.cjs', document.baseURI).href)));
function __require() { return require$1("node:buffer"); }

/**
 * @module Schemas/Core/BufferAttribute
 * @desc Export the ThreeJs BufferAttribute Model and Schema for Mongoose.
 *
 * @requires {@link https://github.com/Itee/@itee/validators @itee/validators}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBufferAttribute;

function requireBufferAttribute () {
	if (hasRequiredBufferAttribute) return BufferAttribute;
	hasRequiredBufferAttribute = 1;
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
	      } = require$$0__default.default;
	const { Buffer } = __require();

	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

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

	    _schema = new Schema( {
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

	BufferAttribute.BufferAttribute = {
	    name:            'BufferAttribute',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return BufferAttribute;
}

var BufferAttributeExports = requireBufferAttribute();

/**
 * @module Schemas/Core/BufferGeometry
 * @desc Export the ThreeJs BufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferAttribute Schemas/Core/BufferAttribute}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


let _schema$2 = undefined;
let _model$2  = undefined;

function getSchemaFrom$2( Mongoose ) {

    if ( !_schema$2 ) {
        _createSchema$2( Mongoose );
    }

    return _schema$2

}

function _createSchema$2( Mongoose ) {

    const Schema  = Mongoose.Schema;
    const Types   = Schema.Types;
    const Mixed   = Types.Mixed;
    const Vector3 = Types.Vector3;

    const BufferAttributeSchema = BufferAttributeExports.BufferAttribute.getSchemaFrom( Mongoose );

    _schema$2 = new Schema( {
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

function getModelFrom$2( Mongoose ) {

    if ( !_model$2 ) {
        _createModel$2( Mongoose );
    }

    return _model$2

}

function _createModel$2( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$2 = Mongoose.model( 'BufferGeometries', getSchemaFrom$2( Mongoose ) );
    _model$2.discriminator( 'BufferGeometry', new Mongoose.Schema( {} ) );

}

function registerModelTo$2( Mongoose ) {

    if ( !_model$2 ) {
        _createModel$2( Mongoose );
    }

    return Mongoose

}

const BufferGeometry = {
    getSchemaFrom:   getSchemaFrom$2,
    getModelFrom:    getModelFrom$2,
    registerModelTo: registerModelTo$2
};


//module.exports.BufferGeometry =

var BufferGeometry$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	BufferGeometry: BufferGeometry
});

var CurvePath = {};

var Curve = {};

/**
 * @module Schemas/Curves/Curve
 * @desc Export the ThreeJs Curve Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCurve;

function requireCurve () {
	if (hasRequiredCurve) return Curve;
	hasRequiredCurve = 1;
	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    // We need to pre-declare the base model to be able to use correctly
	    // the discriminator 'type' correctly with the main type, instead of
	    // directly register the model as it
	    _model = Mongoose.model( 'Curves', getSchemaFrom( Mongoose ) );
	    _model.discriminator( 'Curve', new Mongoose.Schema( {} ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Curve.Curve = {
	    name: 'Curve',
	    getSchemaFrom,
	    getModelFrom,
	    registerModelTo
	};
	return Curve;
}

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

var hasRequiredCurvePath;

function requireCurvePath () {
	if (hasRequiredCurvePath) return CurvePath;
	hasRequiredCurvePath = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

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

	    _schema = new Schema( {
	        curves:    [ NestedCurveSchema ], // Curve
	        autoClose: {
	            type:    Boolean,
	            default: false
	        }
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'CurvePath', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CurvePath.CurvePath = {
	    name:            'CurvePath',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CurvePath;
}

var CurvePathExports = requireCurvePath();

var Face3 = {};

/**
 * @module Schemas/Core/Face3
 * @desc Export the ThreeJs Face3 Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredFace3;

function requireFace3 () {
	if (hasRequiredFace3) return Face3;
	hasRequiredFace3 = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Color   = Types.Color;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
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

	Face3.Face3 = {
	    name:            'Face3',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Face3;
}

var Face3Exports = requireFace3();

/**
 * @module Schemas/Core/Geometry
 * @desc Export the ThreeJs Geometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Face3 Schemas/Core/Face3}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


let _schema$1 = undefined;
let _model$1  = undefined;

function getSchemaFrom$1( Mongoose ) {

    if ( !_schema$1 ) {
        _createSchema$1( Mongoose );
    }

    return _schema$1

}

function _createSchema$1( Mongoose ) {

    const Face3Schema = Face3Exports.Face3.getSchemaFrom( Mongoose );
    const Schema      = Mongoose.Schema;
    const Types       = Schema.Types;
    const Vector3     = Types.Vector3;

    _schema$1 = new Schema( {
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

function getModelFrom$1( Mongoose ) {

    if ( !_model$1 ) {
        _createModel$1( Mongoose );
    }

    return _model$1

}

function _createModel$1( Mongoose ) {

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model$1 = Mongoose.model( 'Geometries', getSchemaFrom$1( Mongoose ) );
    _model$1.discriminator( 'Geometry', new Mongoose.Schema( {} ) );

}

function registerModelTo$1( Mongoose ) {

    if ( !_model$1 ) {
        _createModel$1( Mongoose );
    }

    return Mongoose

}

const Geometry = {
    name: 'Geometry',
    getSchemaFrom: getSchemaFrom$1,
    getModelFrom: getModelFrom$1,
    registerModelTo: registerModelTo$1
};

var Geometry$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Geometry: Geometry
});

var Path = {};

/**
 * @module Schemas/Core/Path
 * @desc Export the ThreeJs Path Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPath;

function requirePath () {
	if (hasRequiredPath) return Path;
	hasRequiredPath = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

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

	    _schema = new Schema( {

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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'Path', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Path.Path = {
	    name:            'Path',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Path;
}

var PathExports = requirePath();

var Shape = {};

/**
 * @module Schemas/Core/Shape
 * @desc Export the ThreeJs Shape Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredShape;

function requireShape () {
	if (hasRequiredShape) return Shape;
	hasRequiredShape = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

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

	    _schema = new Schema( {

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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'Shape', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Shape.Shape = {
	    name:            'Shape',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Shape;
}

var ShapeExports = requireShape();

var ArcCurve = {};

/**
 * @module Schemas/Curves/ArcCurve
 * @desc Export the ThreeJs ArcCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredArcCurve;

function requireArcCurve () {
	if (hasRequiredArcCurve) return ArcCurve;
	hasRequiredArcCurve = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'ArcCurve', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ArcCurve.ArcCurve = {
	    name:            'ArcCurve',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ArcCurve;
}

var ArcCurveExports = requireArcCurve();

var CatmullRomCurve3 = {};

/**
 * @module Schemas/Curves/CatmullRomCurve3
 * @desc Export the ThreeJs CatmullRomCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCatmullRomCurve3;

function requireCatmullRomCurve3 () {
	if (hasRequiredCatmullRomCurve3) return CatmullRomCurve3;
	hasRequiredCatmullRomCurve3 = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        points:    [ Vector3 ],
	        closed:    Boolean,
	        curveType: String,
	        tension:   Number
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'CatmullRomCurve3', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CatmullRomCurve3.CatmullRomCurve3 = {
	    name:            'CatmullRomCurve3',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CatmullRomCurve3;
}

var CatmullRomCurve3Exports = requireCatmullRomCurve3();

var CubicBezierCurve = {};

/**
 * @module Schemas/Curves/CubicBezierCurve
 * @desc Export the ThreeJs CubicBezierCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCubicBezierCurve;

function requireCubicBezierCurve () {
	if (hasRequiredCubicBezierCurve) return CubicBezierCurve;
	hasRequiredCubicBezierCurve = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
	        v0: Vector2,
	        v1: Vector2,
	        v2: Vector2,
	        v3: Vector2
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'CubicBezierCurve', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CubicBezierCurve.CubicBezierCurve = {
	    name:            'CubicBezierCurve',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CubicBezierCurve;
}

var CubicBezierCurveExports = requireCubicBezierCurve();

var CubicBezierCurve3 = {};

/**
 * @module Schemas/Curves/CubicBezierCurve3
 * @desc Export the ThreeJs CubicBezierCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCubicBezierCurve3;

function requireCubicBezierCurve3 () {
	if (hasRequiredCubicBezierCurve3) return CubicBezierCurve3;
	hasRequiredCubicBezierCurve3 = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        v0: Vector3,
	        v1: Vector3,
	        v2: Vector3,
	        v3: Vector3
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'CubicBezierCurve3', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CubicBezierCurve3.CubicBezierCurve3 = {
	    name:            'CubicBezierCurve3',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CubicBezierCurve3;
}

var CubicBezierCurve3Exports = requireCubicBezierCurve3();

var CurveExports = requireCurve();

var CurveExtras = {};

/**
 * @module Schemas/Curves/CurveExtras
 * @desc Export the ThreeJs CurveExtras Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCurveExtras;

function requireCurveExtras () {
	if (hasRequiredCurveExtras) return CurveExtras;
	hasRequiredCurveExtras = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'CurveExtras', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CurveExtras.CurveExtras = {
	    name:            'CurveExtras',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CurveExtras;
}

var CurveExtrasExports = requireCurveExtras();

var EllipseCurve = {};

/**
 * @module Schemas/Curves/EllipseCurve
 * @desc Export the ThreeJs EllipseCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredEllipseCurve;

function requireEllipseCurve () {
	if (hasRequiredEllipseCurve) return EllipseCurve;
	hasRequiredEllipseCurve = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'EllipseCurve', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	EllipseCurve.EllipseCurve = {
	    name:            'EllipseCurve',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return EllipseCurve;
}

var EllipseCurveExports = requireEllipseCurve();

var LineCurve = {};

/**
 * @module Schemas/Curves/LineCurve
 * @desc Export the ThreeJs LineCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLineCurve;

function requireLineCurve () {
	if (hasRequiredLineCurve) return LineCurve;
	hasRequiredLineCurve = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
	        v0: Vector2,
	        v1: Vector2
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'LineCurve', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LineCurve.LineCurve = {
	    name:            'LineCurve',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LineCurve;
}

var LineCurveExports = requireLineCurve();

var LineCurve3 = {};

/**
 * @module Schemas/Curves/LineCurve3
 * @desc Export the ThreeJs LineCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLineCurve3;

function requireLineCurve3 () {
	if (hasRequiredLineCurve3) return LineCurve3;
	hasRequiredLineCurve3 = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        v0: Vector3,
	        v1: Vector3
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'LineCurve3', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LineCurve3.LineCurve3 = {
	    name:            'LineCurve3',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LineCurve3;
}

var LineCurve3Exports = requireLineCurve3();

var NURBSCurve = {};

/**
 * @module Schemas/Curves/NURBSCurve
 * @desc Export the ThreeJs NURBSCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredNURBSCurve;

function requireNURBSCurve () {
	if (hasRequiredNURBSCurve) return NURBSCurve;
	hasRequiredNURBSCurve = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'NURBSCurve', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	NURBSCurve.NURBSCurve = {
	    name:            'NURBSCurve',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return NURBSCurve;
}

var NURBSCurveExports = requireNURBSCurve();

var NURBSSurface = {};

/**
 * @module Schemas/Curves/NURBSSurface
 * @desc Export the ThreeJs NURBSSurface Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredNURBSSurface;

function requireNURBSSurface () {
	if (hasRequiredNURBSSurface) return NURBSSurface;
	hasRequiredNURBSSurface = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'NURBSSurface', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	NURBSSurface.NURBSSurface = {
	    name:            'NURBSSurface',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return NURBSSurface;
}

var NURBSSurfaceExports = requireNURBSSurface();

var QuadraticBezierCurve = {};

/**
 * @module Schemas/Curves/QuadraticBezierCurve
 * @desc Export the ThreeJs QuadraticBezierCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredQuadraticBezierCurve;

function requireQuadraticBezierCurve () {
	if (hasRequiredQuadraticBezierCurve) return QuadraticBezierCurve;
	hasRequiredQuadraticBezierCurve = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
	        v0: Vector2,
	        v1: Vector2,
	        v2: Vector2
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'QuadraticBezierCurve', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	QuadraticBezierCurve.QuadraticBezierCurve = {
	    name:            'QuadraticBezierCurve',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return QuadraticBezierCurve;
}

var QuadraticBezierCurveExports = requireQuadraticBezierCurve();

var QuadraticBezierCurve3 = {};

/**
 * @module Schemas/Curves/QuadraticBezierCurve3
 * @desc Export the ThreeJs QuadraticBezierCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredQuadraticBezierCurve3;

function requireQuadraticBezierCurve3 () {
	if (hasRequiredQuadraticBezierCurve3) return QuadraticBezierCurve3;
	hasRequiredQuadraticBezierCurve3 = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        v0: Vector3,
	        v1: Vector3,
	        v2: Vector3
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'QuadraticBezierCurve3', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	QuadraticBezierCurve3.QuadraticBezierCurve3 = {
	    name:            'QuadraticBezierCurve3',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return QuadraticBezierCurve3;
}

var QuadraticBezierCurve3Exports = requireQuadraticBezierCurve3();

var SplineCurve = {};

/**
 * @module Schemas/Curves/SplineCurve
 * @desc Export the ThreeJs SplineCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSplineCurve;

function requireSplineCurve () {
	if (hasRequiredSplineCurve) return SplineCurve;
	hasRequiredSplineCurve = 1;
	const { Curve } = requireCurve();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        points: [ Vector3 ]
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const CurveBaseModel = Curve.getModelFrom( Mongoose );
	    _model               = CurveBaseModel.discriminator( 'SplineCurve', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SplineCurve.SplineCurve = {
	    name:            'SplineCurve',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SplineCurve;
}

var SplineCurveExports = requireSplineCurve();

var BoxBufferGeometry = {};

var require$$0$1 = /*@__PURE__*/getAugmentedNamespace(BufferGeometry$1);

/**
 * @module Schemas/Geometries/BoxBufferGeometry
 * @desc Export the ThreeJs BoxBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBoxBufferGeometry;

function requireBoxBufferGeometry () {
	if (hasRequiredBoxBufferGeometry) return BoxBufferGeometry;
	hasRequiredBoxBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'BoxBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	BoxBufferGeometry.BoxBufferGeometry = {
	    name:            'BoxBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return BoxBufferGeometry;
}

var BoxBufferGeometryExports = requireBoxBufferGeometry();

var BoxGeometry = {};

var require$$0 = /*@__PURE__*/getAugmentedNamespace(Geometry$1);

/**
 * @module Schemas/Geometries/BoxGeometry
 * @desc Export the ThreeJs BoxGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBoxGeometry;

function requireBoxGeometry () {
	if (hasRequiredBoxGeometry) return BoxGeometry;
	hasRequiredBoxGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'BoxGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	BoxGeometry.BoxGeometry = {
	    name:            'BoxGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return BoxGeometry;
}

var BoxGeometryExports = requireBoxGeometry();

var CircleBufferGeometry = {};

/**
 * @module Schemas/Geometries/CircleBufferGeometry
 * @desc Export the ThreeJs CircleBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCircleBufferGeometry;

function requireCircleBufferGeometry () {
	if (hasRequiredCircleBufferGeometry) return CircleBufferGeometry;
	hasRequiredCircleBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'CircleBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CircleBufferGeometry.CircleBufferGeometry = {
	    name:            'CircleBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CircleBufferGeometry;
}

var CircleBufferGeometryExports = requireCircleBufferGeometry();

var CircleGeometry = {};

/**
 * @module Schemas/Geometries/CircleGeometry
 * @desc Export the ThreeJs CircleGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCircleGeometry;

function requireCircleGeometry () {
	if (hasRequiredCircleGeometry) return CircleGeometry;
	hasRequiredCircleGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'CircleGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CircleGeometry.CircleGeometry = {
	    name:            'CircleGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CircleGeometry;
}

var CircleGeometryExports = requireCircleGeometry();

var ConeBufferGeometry = {};

/**
 * @module Schemas/Geometries/ConeBufferGeometry
 * @desc Export the ThreeJs ConeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredConeBufferGeometry;

function requireConeBufferGeometry () {
	if (hasRequiredConeBufferGeometry) return ConeBufferGeometry;
	hasRequiredConeBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'ConeBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ConeBufferGeometry.ConeBufferGeometry = {
	    name:            'ConeBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ConeBufferGeometry;
}

var ConeBufferGeometryExports = requireConeBufferGeometry();

var ConeGeometry = {};

/**
 * @module Schemas/Geometries/ConeGeometry
 * @desc Export the ThreeJs ConeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredConeGeometry;

function requireConeGeometry () {
	if (hasRequiredConeGeometry) return ConeGeometry;
	hasRequiredConeGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'ConeGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ConeGeometry.ConeGeometry = {
	    name:            'ConeGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ConeGeometry;
}

var ConeGeometryExports = requireConeGeometry();

var ConvexGeometry = {};

/**
 * @module Schemas/Geometries/ConvexGeometry
 * @desc Export the ThreeJs ConvexGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredConvexGeometry;

function requireConvexGeometry () {
	if (hasRequiredConvexGeometry) return ConvexGeometry;
	hasRequiredConvexGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'ConvexGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ConvexGeometry.ConvexGeometry = {
	    name:            'ConvexGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ConvexGeometry;
}

var ConvexGeometryExports = requireConvexGeometry();

var CylinderBufferGeometry = {};

/**
 * @module Schemas/Geometries/CylinderBufferGeometry
 * @desc Export the ThreeJs CylinderBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCylinderBufferGeometry;

function requireCylinderBufferGeometry () {
	if (hasRequiredCylinderBufferGeometry) return CylinderBufferGeometry;
	hasRequiredCylinderBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'CylinderBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CylinderBufferGeometry.CylinderBufferGeometry = {
	    name:            'CylinderBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CylinderBufferGeometry;
}

var CylinderBufferGeometryExports = requireCylinderBufferGeometry();

var CylinderGeometry = {};

/**
 * @module Schemas/Geometries/CylinderGeometry
 * @desc Export the ThreeJs CylinderGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCylinderGeometry;

function requireCylinderGeometry () {
	if (hasRequiredCylinderGeometry) return CylinderGeometry;
	hasRequiredCylinderGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'CylinderGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CylinderGeometry.CylinderGeometry = {
	    name:            'CylinderGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CylinderGeometry;
}

var CylinderGeometryExports = requireCylinderGeometry();

var DecalGeometry = {};

/**
 * @module Schemas/Geometries/DecalGeometry
 * @desc Export the ThreeJs DecalGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredDecalGeometry;

function requireDecalGeometry () {
	if (hasRequiredDecalGeometry) return DecalGeometry;
	hasRequiredDecalGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'DecalGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	DecalGeometry.DecalGeometry = {
	    name:            'DecalGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return DecalGeometry;
}

var DecalGeometryExports = requireDecalGeometry();

var DodecahedronGeometry = {};

/**
 * @module Schemas/Geometries/DodecahedronGeometry
 * @desc Export the ThreeJs DodecahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredDodecahedronGeometry;

function requireDodecahedronGeometry () {
	if (hasRequiredDodecahedronGeometry) return DodecahedronGeometry;
	hasRequiredDodecahedronGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'DodecahedronGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	DodecahedronGeometry.DodecahedronGeometry = {
	    name:            'DodecahedronGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return DodecahedronGeometry;
}

var DodecahedronGeometryExports = requireDodecahedronGeometry();

var EdgesGeometry = {};

/**
 * @module Schemas/Geometries/EdgesGeometry
 * @desc Export the ThreeJs EdgesGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredEdgesGeometry;

function requireEdgesGeometry () {
	if (hasRequiredEdgesGeometry) return EdgesGeometry;
	hasRequiredEdgesGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'EdgesGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	EdgesGeometry.EdgesGeometry = {
	    name:            'EdgesGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return EdgesGeometry;
}

var EdgesGeometryExports = requireEdgesGeometry();

var ExtrudeBufferGeometry = {};

/**
 * @module Schemas/Geometries/ExtrudeBufferGeometry
 * @desc Export the ThreeJs ExtrudeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredExtrudeBufferGeometry;

function requireExtrudeBufferGeometry () {
	if (hasRequiredExtrudeBufferGeometry) return ExtrudeBufferGeometry;
	hasRequiredExtrudeBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'ExtrudeBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ExtrudeBufferGeometry.ExtrudeBufferGeometry = {
	    name:            'ExtrudeBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ExtrudeBufferGeometry;
}

var ExtrudeBufferGeometryExports = requireExtrudeBufferGeometry();

var ExtrudeGeometry = {};

/**
 * @module Schemas/Geometries/ExtrudeGeometry
 * @desc Export the ThreeJs ExtrudeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredExtrudeGeometry;

function requireExtrudeGeometry () {
	if (hasRequiredExtrudeGeometry) return ExtrudeGeometry;
	hasRequiredExtrudeGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'ExtrudeGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ExtrudeGeometry.ExtrudeGeometry = {
	    name:            'ExtrudeGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ExtrudeGeometry;
}

var ExtrudeGeometryExports = requireExtrudeGeometry();

var IcosahedronBufferGeometry = {};

/**
 * @module Schemas/Geometries/IcosahedronBufferGeometry
 * @desc Export the ThreeJs IcosahedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredIcosahedronBufferGeometry;

function requireIcosahedronBufferGeometry () {
	if (hasRequiredIcosahedronBufferGeometry) return IcosahedronBufferGeometry;
	hasRequiredIcosahedronBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'IcosahedronBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	IcosahedronBufferGeometry.IcosahedronBufferGeometry = {
	    name:            'IcosahedronBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return IcosahedronBufferGeometry;
}

var IcosahedronBufferGeometryExports = requireIcosahedronBufferGeometry();

var IcosahedronGeometry = {};

/**
 * @module Schemas/Geometries/IcosahedronGeometry
 * @desc Export the ThreeJs IcosahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredIcosahedronGeometry;

function requireIcosahedronGeometry () {
	if (hasRequiredIcosahedronGeometry) return IcosahedronGeometry;
	hasRequiredIcosahedronGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'IcosahedronGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	IcosahedronGeometry.IcosahedronGeometry = {
	    name:            'IcosahedronGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return IcosahedronGeometry;
}

var IcosahedronGeometryExports = requireIcosahedronGeometry();

var InstancedBufferGeometry = {};

/**
 * @module Schemas/Geometries/InstancedBufferGeometry
 * @desc Export the ThreeJs InstancedBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredInstancedBufferGeometry;

function requireInstancedBufferGeometry () {
	if (hasRequiredInstancedBufferGeometry) return InstancedBufferGeometry;
	hasRequiredInstancedBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'InstancedBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	InstancedBufferGeometry.InstancedBufferGeometry = {
	    name:            'InstancedBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return InstancedBufferGeometry;
}

var InstancedBufferGeometryExports = requireInstancedBufferGeometry();

var LatheBufferGeometry = {};

/**
 * @module Schemas/Geometries/LatheBufferGeometry
 * @desc Export the ThreeJs LatheBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLatheBufferGeometry;

function requireLatheBufferGeometry () {
	if (hasRequiredLatheBufferGeometry) return LatheBufferGeometry;
	hasRequiredLatheBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'LatheBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LatheBufferGeometry.LatheBufferGeometry = {
	    name:            'LatheBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LatheBufferGeometry;
}

var LatheBufferGeometryExports = requireLatheBufferGeometry();

var LatheGeometry = {};

/**
 * @module Schemas/Geometries/LatheGeometry
 * @desc Export the ThreeJs LatheGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLatheGeometry;

function requireLatheGeometry () {
	if (hasRequiredLatheGeometry) return LatheGeometry;
	hasRequiredLatheGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'LatheGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LatheGeometry.LatheGeometry = {
	    name:            'LatheGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LatheGeometry;
}

var LatheGeometryExports = requireLatheGeometry();

var OctahedronBufferGeometry = {};

/**
 * @module Schemas/Geometries/OctahedronBufferGeometry
 * @desc Export the ThreeJs OctahedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredOctahedronBufferGeometry;

function requireOctahedronBufferGeometry () {
	if (hasRequiredOctahedronBufferGeometry) return OctahedronBufferGeometry;
	hasRequiredOctahedronBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'OctahedronBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	OctahedronBufferGeometry.OctahedronBufferGeometry = {
	    name:            'OctahedronBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return OctahedronBufferGeometry;
}

var OctahedronBufferGeometryExports = requireOctahedronBufferGeometry();

var OctahedronGeometry = {};

/**
 * @module Schemas/Geometries/OctahedronGeometry
 * @desc Export the ThreeJs OctahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredOctahedronGeometry;

function requireOctahedronGeometry () {
	if (hasRequiredOctahedronGeometry) return OctahedronGeometry;
	hasRequiredOctahedronGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'OctahedronGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	OctahedronGeometry.OctahedronGeometry = {
	    name:            'OctahedronGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return OctahedronGeometry;
}

var OctahedronGeometryExports = requireOctahedronGeometry();

var ParametricBufferGeometry = {};

/**
 * @module Schemas/Geometries/ParametricBufferGeometry
 * @desc Export the ThreeJs ParametricBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredParametricBufferGeometry;

function requireParametricBufferGeometry () {
	if (hasRequiredParametricBufferGeometry) return ParametricBufferGeometry;
	hasRequiredParametricBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'ParametricBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ParametricBufferGeometry.ParametricBufferGeometry = {
	    name:            'ParametricBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ParametricBufferGeometry;
}

var ParametricBufferGeometryExports = requireParametricBufferGeometry();

var ParametricGeometry = {};

/**
 * @module Schemas/Geometries/ParametricGeometry
 * @desc Export the ThreeJs ParametricGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredParametricGeometry;

function requireParametricGeometry () {
	if (hasRequiredParametricGeometry) return ParametricGeometry;
	hasRequiredParametricGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'ParametricGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ParametricGeometry.ParametricGeometry = {
	    name:            'ParametricGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ParametricGeometry;
}

var ParametricGeometryExports = requireParametricGeometry();

var PlaneBufferGeometry = {};

/**
 * @module Schemas/Geometries/PlaneBufferGeometry
 * @desc Export the ThreeJs PlaneBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPlaneBufferGeometry;

function requirePlaneBufferGeometry () {
	if (hasRequiredPlaneBufferGeometry) return PlaneBufferGeometry;
	hasRequiredPlaneBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'PlaneBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PlaneBufferGeometry.PlaneBufferGeometry = {
	    name:            'PlaneBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PlaneBufferGeometry;
}

var PlaneBufferGeometryExports = requirePlaneBufferGeometry();

var PlaneGeometry = {};

/**
 * @module Schemas/Geometries/PlaneGeometry
 * @desc Export the ThreeJs PlaneGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPlaneGeometry;

function requirePlaneGeometry () {
	if (hasRequiredPlaneGeometry) return PlaneGeometry;
	hasRequiredPlaneGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'PlaneGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PlaneGeometry.PlaneGeometry = {
	    name:            'PlaneGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PlaneGeometry;
}

var PlaneGeometryExports = requirePlaneGeometry();

var PolyhedronBufferGeometry = {};

/**
 * @module Schemas/Geometries/PolyhedronBufferGeometry
 * @desc Export the ThreeJs PolyhedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPolyhedronBufferGeometry;

function requirePolyhedronBufferGeometry () {
	if (hasRequiredPolyhedronBufferGeometry) return PolyhedronBufferGeometry;
	hasRequiredPolyhedronBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'PolyhedronBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PolyhedronBufferGeometry.PolyhedronBufferGeometry = {
	    name:            'PolyhedronBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PolyhedronBufferGeometry;
}

var PolyhedronBufferGeometryExports = requirePolyhedronBufferGeometry();

var PolyhedronGeometry = {};

/**
 * @module Schemas/Geometries/PolyhedronGeometry
 * @desc Export the ThreeJs PolyhedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPolyhedronGeometry;

function requirePolyhedronGeometry () {
	if (hasRequiredPolyhedronGeometry) return PolyhedronGeometry;
	hasRequiredPolyhedronGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'PolyhedronGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PolyhedronGeometry.PolyhedronGeometry = {
	    name:            'PolyhedronGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PolyhedronGeometry;
}

var PolyhedronGeometryExports = requirePolyhedronGeometry();

var RingBufferGeometry = {};

/**
 * @module Schemas/Geometries/RingBufferGeometry
 * @desc Export the ThreeJs RingBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredRingBufferGeometry;

function requireRingBufferGeometry () {
	if (hasRequiredRingBufferGeometry) return RingBufferGeometry;
	hasRequiredRingBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'RingBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	RingBufferGeometry.RingBufferGeometry = {
	    name:            'RingBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return RingBufferGeometry;
}

var RingBufferGeometryExports = requireRingBufferGeometry();

var RingGeometry = {};

/**
 * @module Schemas/Geometries/RingGeometry
 * @desc Export the ThreeJs RingGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredRingGeometry;

function requireRingGeometry () {
	if (hasRequiredRingGeometry) return RingGeometry;
	hasRequiredRingGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'RingGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	RingGeometry.RingGeometry = {
	    name:            'RingGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return RingGeometry;
}

var RingGeometryExports = requireRingGeometry();

var ShapeBufferGeometry = {};

/**
 * @module Schemas/Geometries/ShapeBufferGeometry
 * @desc Export the ThreeJs ShapeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredShapeBufferGeometry;

function requireShapeBufferGeometry () {
	if (hasRequiredShapeBufferGeometry) return ShapeBufferGeometry;
	hasRequiredShapeBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

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

	    _schema = new Schema( {
	        shapes:        [ NestedShapeSchema ],
	        curveSegments: Number
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'ShapeBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ShapeBufferGeometry.ShapeBufferGeometry = {
	    name:            'ShapeBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ShapeBufferGeometry;
}

var ShapeBufferGeometryExports = requireShapeBufferGeometry();

var ShapeGeometry = {};

/**
 * @module Schemas/Geometries/ShapeGeometry
 * @desc Export the ThreeJs ShapeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredShapeGeometry;

function requireShapeGeometry () {
	if (hasRequiredShapeGeometry) return ShapeGeometry;
	hasRequiredShapeGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'ShapeGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ShapeGeometry.ShapeGeometry = {
	    name:            'ShapeGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ShapeGeometry;
}

var ShapeGeometryExports = requireShapeGeometry();

var SphereBufferGeometry = {};

/**
 * @module Schemas/Geometries/SphereBufferGeometry
 * @desc Export the ThreeJs SphereBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSphereBufferGeometry;

function requireSphereBufferGeometry () {
	if (hasRequiredSphereBufferGeometry) return SphereBufferGeometry;
	hasRequiredSphereBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'SphereBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SphereBufferGeometry.SphereBufferGeometry = {
	    name:            'SphereBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SphereBufferGeometry;
}

var SphereBufferGeometryExports = requireSphereBufferGeometry();

var SphereGeometry = {};

/**
 * @module Schemas/Geometries/SphereGeometry
 * @desc Export the ThreeJs SphereGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSphereGeometry;

function requireSphereGeometry () {
	if (hasRequiredSphereGeometry) return SphereGeometry;
	hasRequiredSphereGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'SphereGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SphereGeometry.SphereGeometry = {
	    name:            'SphereGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SphereGeometry;
}

var SphereGeometryExports = requireSphereGeometry();

var TeopotBufferGeometry = {};

/**
 * @module Schemas/Geometries/TeapotBufferGeometry
 * @desc Export the ThreeJs TeapotBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTeopotBufferGeometry;

function requireTeopotBufferGeometry () {
	if (hasRequiredTeopotBufferGeometry) return TeopotBufferGeometry;
	hasRequiredTeopotBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'TeapotBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TeopotBufferGeometry.TeapotBufferGeometry = {
	    name:            'TeapotBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TeopotBufferGeometry;
}

var TeopotBufferGeometryExports = requireTeopotBufferGeometry();

var TetrahedronBufferGeometry = {};

/**
 * @module Schemas/Geometries/TetrahedronBufferGeometry
 * @desc Export the ThreeJs TetrahedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTetrahedronBufferGeometry;

function requireTetrahedronBufferGeometry () {
	if (hasRequiredTetrahedronBufferGeometry) return TetrahedronBufferGeometry;
	hasRequiredTetrahedronBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'TetrahedronBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TetrahedronBufferGeometry.TetrahedronBufferGeometry = {
	    name:            'TetrahedronBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TetrahedronBufferGeometry;
}

var TetrahedronBufferGeometryExports = requireTetrahedronBufferGeometry();

var TetrahedronGeometry = {};

/**
 * @module Schemas/Geometries/TetrahedronGeometry
 * @desc Export the ThreeJs TetrahedronGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTetrahedronGeometry;

function requireTetrahedronGeometry () {
	if (hasRequiredTetrahedronGeometry) return TetrahedronGeometry;
	hasRequiredTetrahedronGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'TetrahedronGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TetrahedronGeometry.TetrahedronGeometry = {
	    name:            'TetrahedronGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TetrahedronGeometry;
}

var TetrahedronGeometryExports = requireTetrahedronGeometry();

var TextBufferGeometry = {};

/**
 * @module Schemas/Geometries/TextBufferGeometry
 * @desc Export the ThreeJs TextBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTextBufferGeometry;

function requireTextBufferGeometry () {
	if (hasRequiredTextBufferGeometry) return TextBufferGeometry;
	hasRequiredTextBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'TextBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TextBufferGeometry.TextBufferGeometry = {
	    name:            'TextBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TextBufferGeometry;
}

var TextBufferGeometryExports = requireTextBufferGeometry();

var TextGeometry = {};

/**
 * @module Schemas/Geometries/TextGeometry
 * @desc Export the ThreeJs TextGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTextGeometry;

function requireTextGeometry () {
	if (hasRequiredTextGeometry) return TextGeometry;
	hasRequiredTextGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'TextGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TextGeometry.TextGeometry = {
	    name:            'TextGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TextGeometry;
}

var TextGeometryExports = requireTextGeometry();

var TorusBufferGeometry = {};

/**
 * @module Schemas/Geometries/TorusBufferGeometry
 * @desc Export the ThreeJs TorusBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTorusBufferGeometry;

function requireTorusBufferGeometry () {
	if (hasRequiredTorusBufferGeometry) return TorusBufferGeometry;
	hasRequiredTorusBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'TorusBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TorusBufferGeometry.TorusBufferGeometry = {
	    name:            'TorusBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TorusBufferGeometry;
}

var TorusBufferGeometryExports = requireTorusBufferGeometry();

var TorusGeometry = {};

/**
 * @module Schemas/Geometries/TorusGeometry
 * @desc Export the ThreeJs TorusGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTorusGeometry;

function requireTorusGeometry () {
	if (hasRequiredTorusGeometry) return TorusGeometry;
	hasRequiredTorusGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'TorusGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TorusGeometry.TorusGeometry = {
	    name:            'TorusGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TorusGeometry;
}

var TorusGeometryExports = requireTorusGeometry();

var TorusKnotBufferGeometry = {};

/**
 * @module Schemas/Geometries/TorusKnotBufferGeometry
 * @desc Export the ThreeJs TorusKnotBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTorusKnotBufferGeometry;

function requireTorusKnotBufferGeometry () {
	if (hasRequiredTorusKnotBufferGeometry) return TorusKnotBufferGeometry;
	hasRequiredTorusKnotBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'TorusKnotBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TorusKnotBufferGeometry.TorusKnotBufferGeometry = {
	    name:            'TorusKnotBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TorusKnotBufferGeometry;
}

var TorusKnotBufferGeometryExports = requireTorusKnotBufferGeometry();

var TorusKnotGeometry = {};

/**
 * @module Schemas/Geometries/TorusKnotGeometry
 * @desc Export the ThreeJs TorusKnotGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTorusKnotGeometry;

function requireTorusKnotGeometry () {
	if (hasRequiredTorusKnotGeometry) return TorusKnotGeometry;
	hasRequiredTorusKnotGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'TorusKnotGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TorusKnotGeometry.TorusKnotGeometry = {
	    name:            'TorusKnotGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TorusKnotGeometry;
}

var TorusKnotGeometryExports = requireTorusKnotGeometry();

var TubeBufferGeometry = {};

/**
 * @module Schemas/Geometries/TubeBufferGeometry
 * @desc Export the ThreeJs TubeBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTubeBufferGeometry;

function requireTubeBufferGeometry () {
	if (hasRequiredTubeBufferGeometry) return TubeBufferGeometry;
	hasRequiredTubeBufferGeometry = 1;
	const { BufferGeometry } = require$$0$1;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose );
	    _model                        = BufferGeometryBaseModel.discriminator( 'TubeBufferGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TubeBufferGeometry.TubeBufferGeometry = {
	    name:            'TubeBufferGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TubeBufferGeometry;
}

var TubeBufferGeometryExports = requireTubeBufferGeometry();

var TubeGeometry = {};

/**
 * @module Schemas/Geometries/TubeGeometry
 * @desc Export the ThreeJs TubeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTubeGeometry;

function requireTubeGeometry () {
	if (hasRequiredTubeGeometry) return TubeGeometry;
	hasRequiredTubeGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'TubeGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	TubeGeometry.TubeGeometry = {
	    name:            'TubeGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return TubeGeometry;
}

var TubeGeometryExports = requireTubeGeometry();

var WireframeGeometry = {};

/**
 * @module Schemas/Geometries/WireframeGeometry
 * @desc Export the ThreeJs WireframeGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredWireframeGeometry;

function requireWireframeGeometry () {
	if (hasRequiredWireframeGeometry) return WireframeGeometry;
	hasRequiredWireframeGeometry = 1;
	const { Geometry } = require$$0;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const GeometryBaseModel = Geometry.getModelFrom( Mongoose );
	    _model                  = GeometryBaseModel.discriminator( 'WireframeGeometry', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	WireframeGeometry.WireframeGeometry = {
	    name:            'WireframeGeometry',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return WireframeGeometry;
}

var WireframeGeometryExports = requireWireframeGeometry();

var ArrowHelper = {};

/**
 * @module Schemas/Helpers/ArrowHelper
 * @desc Export the ThreeJs ArrowHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredArrowHelper;

function requireArrowHelper () {
	if (hasRequiredArrowHelper) return ArrowHelper;
	hasRequiredArrowHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'ArrowHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ArrowHelper.ArrowHelper = {
	    name:            'ArrowHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ArrowHelper;
}

var ArrowHelperExports = requireArrowHelper();

var AxesHelper = {};

/**
 * @module Schemas/Helpers/AxesHelper
 * @desc Export the ThreeJs AxesHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredAxesHelper;

function requireAxesHelper () {
	if (hasRequiredAxesHelper) return AxesHelper;
	hasRequiredAxesHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'AxesHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	AxesHelper.AxesHelper = {
	    name:            'AxesHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return AxesHelper;
}

var AxesHelperExports = requireAxesHelper();

var Box3Helper = {};

/**
 * @module Schemas/Helpers/Box3Helper
 * @desc Export the ThreeJs Box3Helper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBox3Helper;

function requireBox3Helper () {
	if (hasRequiredBox3Helper) return Box3Helper;
	hasRequiredBox3Helper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Box3Helper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Box3Helper.Box3Helper = {
	    name:            'Box3Helper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Box3Helper;
}

var Box3HelperExports = requireBox3Helper();

var BoxHelper = {};

/**
 * @module Schemas/Helpers/BoxHelper
 * @desc Export the ThreeJs BoxHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBoxHelper;

function requireBoxHelper () {
	if (hasRequiredBoxHelper) return BoxHelper;
	hasRequiredBoxHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'BoxHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	BoxHelper.BoxHelper = {
	    name:            'BoxHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return BoxHelper;
}

var BoxHelperExports = requireBoxHelper();

var CameraHelper = {};

/**
 * @module Schemas/Helpers/CameraHelper
 * @desc Export the ThreeJs CameraHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCameraHelper;

function requireCameraHelper () {
	if (hasRequiredCameraHelper) return CameraHelper;
	hasRequiredCameraHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'CameraHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CameraHelper.CameraHelper = {
	    name:            'CameraHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CameraHelper;
}

var CameraHelperExports = requireCameraHelper();

var DirectionalLightHelper = {};

/**
 * @module Schemas/Helpers/DirectionalLightHelper
 * @desc Export the ThreeJs DirectionalLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredDirectionalLightHelper;

function requireDirectionalLightHelper () {
	if (hasRequiredDirectionalLightHelper) return DirectionalLightHelper;
	hasRequiredDirectionalLightHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'DirectionalLightHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	DirectionalLightHelper.DirectionalLightHelper = {
	    name:            'DirectionalLightHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return DirectionalLightHelper;
}

var DirectionalLightHelperExports = requireDirectionalLightHelper();

var FaceNormalsHelper = {};

/**
 * @module Schemas/Helpers/FaceNormalsHelper
 * @desc Export the ThreeJs FaceNormalsHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredFaceNormalsHelper;

function requireFaceNormalsHelper () {
	if (hasRequiredFaceNormalsHelper) return FaceNormalsHelper;
	hasRequiredFaceNormalsHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'FaceNormalsHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	FaceNormalsHelper.FaceNormalsHelper = {
	    name:            'FaceNormalsHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return FaceNormalsHelper;
}

var FaceNormalsHelperExports = requireFaceNormalsHelper();

var GridHelper = {};

/**
 * @module Schemas/Helpers/GridHelper
 * @desc Export the ThreeJs GridHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredGridHelper;

function requireGridHelper () {
	if (hasRequiredGridHelper) return GridHelper;
	hasRequiredGridHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'GridHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	GridHelper.GridHelper = {
	    name:            'GridHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return GridHelper;
}

var GridHelperExports = requireGridHelper();

var HemisphereLightHelper = {};

/**
 * @module Schemas/Helpers/HemisphereLightHelper
 * @desc Export the ThreeJs HemisphereLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredHemisphereLightHelper;

function requireHemisphereLightHelper () {
	if (hasRequiredHemisphereLightHelper) return HemisphereLightHelper;
	hasRequiredHemisphereLightHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'HemisphereLightHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	HemisphereLightHelper.HemisphereLightHelper = {
	    name:            'HemisphereLightHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return HemisphereLightHelper;
}

var HemisphereLightHelperExports = requireHemisphereLightHelper();

var PlaneHelper = {};

/**
 * @module Schemas/Helpers/PlaneHelper
 * @desc Export the ThreeJs PlaneHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPlaneHelper;

function requirePlaneHelper () {
	if (hasRequiredPlaneHelper) return PlaneHelper;
	hasRequiredPlaneHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'PlaneHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PlaneHelper.PlaneHelper = {
	    name:            'PlaneHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PlaneHelper;
}

var PlaneHelperExports = requirePlaneHelper();

var PointLightHelper = {};

/**
 * @module Schemas/Helpers/PointLightHelper
 * @desc Export the ThreeJs PointLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPointLightHelper;

function requirePointLightHelper () {
	if (hasRequiredPointLightHelper) return PointLightHelper;
	hasRequiredPointLightHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'PointLightHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PointLightHelper.PointLightHelper = {
	    name:            'PointLightHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PointLightHelper;
}

var PointLightHelperExports = requirePointLightHelper();

var PolarGridHelper = {};

/**
 * @module Schemas/Helpers/PolarGridHelper
 * @desc Export the ThreeJs PolarGridHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPolarGridHelper;

function requirePolarGridHelper () {
	if (hasRequiredPolarGridHelper) return PolarGridHelper;
	hasRequiredPolarGridHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'PolarGridHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PolarGridHelper.PolarGridHelper = {
	    name:            'PolarGridHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PolarGridHelper;
}

var PolarGridHelperExports = requirePolarGridHelper();

var RectAreaLightHelper = {};

/**
 * @module Schemas/Helpers/RectAreaLightHelper
 * @desc Export the ThreeJs RectAreaLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredRectAreaLightHelper;

function requireRectAreaLightHelper () {
	if (hasRequiredRectAreaLightHelper) return RectAreaLightHelper;
	hasRequiredRectAreaLightHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'RectAreaLightHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	RectAreaLightHelper.RectAreaLightHelper = {
	    name:            'RectAreaLightHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return RectAreaLightHelper;
}

var RectAreaLightHelperExports = requireRectAreaLightHelper();

var SkeletonHelper = {};

/**
 * @module Schemas/Helpers/SkeletonHelper
 * @desc Export the ThreeJs SkeletonHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSkeletonHelper;

function requireSkeletonHelper () {
	if (hasRequiredSkeletonHelper) return SkeletonHelper;
	hasRequiredSkeletonHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'SkeletonHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SkeletonHelper.SkeletonHelper = {
	    name:            'SkeletonHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SkeletonHelper;
}

var SkeletonHelperExports = requireSkeletonHelper();

var SpotLightHelper = {};

/**
 * @module Schemas/Helpers/SpotLightHelper
 * @desc Export the ThreeJs SpotLightHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSpotLightHelper;

function requireSpotLightHelper () {
	if (hasRequiredSpotLightHelper) return SpotLightHelper;
	hasRequiredSpotLightHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'SpotLightHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SpotLightHelper.SpotLightHelper = {
	    name:            'SpotLightHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SpotLightHelper;
}

var SpotLightHelperExports = requireSpotLightHelper();

var VertexNormalsHelper = {};

/**
 * @module Schemas/Helpers/VertexNormalsHelper
 * @desc Export the ThreeJs VertexNormalsHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredVertexNormalsHelper;

function requireVertexNormalsHelper () {
	if (hasRequiredVertexNormalsHelper) return VertexNormalsHelper;
	hasRequiredVertexNormalsHelper = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'VertexNormalsHelper', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	VertexNormalsHelper.VertexNormalsHelper = {
	    name:            'VertexNormalsHelper',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return VertexNormalsHelper;
}

var VertexNormalsHelperExports = requireVertexNormalsHelper();

var AmbientLight = {};

/**
 * @module Schemas/Lights/AmbientLight
 * @desc Export the ThreeJs AmbientLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredAmbientLight;

function requireAmbientLight () {
	if (hasRequiredAmbientLight) return AmbientLight;
	hasRequiredAmbientLight = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'AmbientLight', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	AmbientLight.AmbientLight = {
	    name:            'AmbientLight',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return AmbientLight;
}

var AmbientLightExports = requireAmbientLight();

var DirectionalLight = {};

/**
 * @module Schemas/Lights/DirectionalLight
 * @desc Export the ThreeJs DirectionalLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredDirectionalLight;

function requireDirectionalLight () {
	if (hasRequiredDirectionalLight) return DirectionalLight;
	hasRequiredDirectionalLight = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'DirectionalLight', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	DirectionalLight.DirectionalLight = {
	    name:            'DirectionalLight',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return DirectionalLight;
}

var DirectionalLightExports = requireDirectionalLight();

var HemisphereLight = {};

/**
 * @module Schemas/Lights/HemisphereLight
 * @desc Export the ThreeJs HemisphereLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredHemisphereLight;

function requireHemisphereLight () {
	if (hasRequiredHemisphereLight) return HemisphereLight;
	hasRequiredHemisphereLight = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'HemisphereLight', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	HemisphereLight.HemisphereLight = {
	    name:            'HemisphereLight',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return HemisphereLight;
}

var HemisphereLightExports = requireHemisphereLight();

var Light = {};

/**
 * @module Schemas/Lights/Light
 * @desc Export the ThreeJs Light Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLight;

function requireLight () {
	if (hasRequiredLight) return Light;
	hasRequiredLight = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Light', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Light.Light = {
	    name:            'Light',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Light;
}

var LightExports = requireLight();

var PointLight = {};

/**
 * @module Schemas/Lights/PointLight
 * @desc Export the ThreeJs PointLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPointLight;

function requirePointLight () {
	if (hasRequiredPointLight) return PointLight;
	hasRequiredPointLight = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'PointLight', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PointLight.PointLight = {
	    name:            'PointLight',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PointLight;
}

var PointLightExports = requirePointLight();

var RectAreaLight = {};

/**
 * @module Schemas/Lights/RectAreaLight
 * @desc Export the ThreeJs RectAreaLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredRectAreaLight;

function requireRectAreaLight () {
	if (hasRequiredRectAreaLight) return RectAreaLight;
	hasRequiredRectAreaLight = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'RectAreaLight', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	RectAreaLight.RectAreaLight = {
	    name:            'RectAreaLight',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return RectAreaLight;
}

var RectAreaLightExports = requireRectAreaLight();

var SpotLight = {};

/**
 * @module Schemas/Lights/SpotLight
 * @desc Export the ThreeJs SpotLight Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSpotLight;

function requireSpotLight () {
	if (hasRequiredSpotLight) return SpotLight;
	hasRequiredSpotLight = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'SpotLight', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SpotLight.SpotLight = {
	    name:            'SpotLight',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SpotLight;
}

var SpotLightExports = requireSpotLight();

var LineBasicMaterial = {};

var Material = {};

/**
 * @module Schemas/Materials/Material
 * @desc Export the ThreeJs Material Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMaterial;

function requireMaterial () {
	if (hasRequiredMaterial) return Material;
	hasRequiredMaterial = 1;
	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    // We need to pre-declare the base model to be able to use correctly
	    // the discriminator 'type' correctly with the main type, instead of
	    // directly register the model as it
	    _model = Mongoose.model( 'Materials', getSchemaFrom( Mongoose ) );
	    _model.discriminator( 'Material', new Mongoose.Schema( {} ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Material.Material = {
	    name:            'Material',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Material;
}

/**
 * @module Schemas/Materials/LineBasicMaterial
 * @desc Export the ThreeJs LineBasicMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLineBasicMaterial;

function requireLineBasicMaterial () {
	if (hasRequiredLineBasicMaterial) return LineBasicMaterial;
	hasRequiredLineBasicMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Color  = Types.Color;

	    _schema = new Schema( {
	        color:     Color,
	        light:     Boolean,
	        lineWidth: Number,
	        linecap:   String,
	        linejoin:  String
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'LineBasicMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LineBasicMaterial.LineBasicMaterial = {
	    name:            'LineBasicMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LineBasicMaterial;
}

var LineBasicMaterialExports = requireLineBasicMaterial();

var LineDashedMaterial = {};

/**
 * @module Schemas/Materials/LineDashedMaterial
 * @desc Export the ThreeJs LineDashedMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLineDashedMaterial;

function requireLineDashedMaterial () {
	if (hasRequiredLineDashedMaterial) return LineDashedMaterial;
	hasRequiredLineDashedMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Color  = Types.Color;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'LineDashedMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LineDashedMaterial.LineDashedMaterial = {
	    name:            'LineDashedMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LineDashedMaterial;
}

var LineDashedMaterialExports = requireLineDashedMaterial();

var MaterialExports = requireMaterial();

var MeshBasicMaterial = {};

/**
 * @module Schemas/Materials/MeshBasicMaterial
 * @desc Export the ThreeJs MeshBasicMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshBasicMaterial;

function requireMeshBasicMaterial () {
	if (hasRequiredMeshBasicMaterial) return MeshBasicMaterial;
	hasRequiredMeshBasicMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Mixed  = Types.Mixed;
	    const Color  = Types.Color;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshBasicMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshBasicMaterial.MeshBasicMaterial = {
	    name:            'MeshBasicMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshBasicMaterial;
}

var MeshBasicMaterialExports = requireMeshBasicMaterial();

var MeshDepthMaterial = {};

/**
 * @module Schemas/Materials/MeshDepthMaterial
 * @desc Export the ThreeJs MeshDepthMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshDepthMaterial;

function requireMeshDepthMaterial () {
	if (hasRequiredMeshDepthMaterial) return MeshDepthMaterial;
	hasRequiredMeshDepthMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshDepthMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshDepthMaterial.MeshDepthMaterial = {
	    name:            'MeshDepthMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshDepthMaterial;
}

var MeshDepthMaterialExports = requireMeshDepthMaterial();

var MeshLambertMaterial = {};

/**
 * @module Schemas/Materials/MeshLambertMaterial
 * @desc Export the ThreeJs MeshLambertMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshLambertMaterial;

function requireMeshLambertMaterial () {
	if (hasRequiredMeshLambertMaterial) return MeshLambertMaterial;
	hasRequiredMeshLambertMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Color  = Types.Color;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshLambertMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshLambertMaterial.MeshLambertMaterial = {
	    name:            'MeshLambertMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshLambertMaterial;
}

var MeshLambertMaterialExports = requireMeshLambertMaterial();

var MeshNormalMaterial = {};

/**
 * @module Schemas/Materials/MeshNormalMaterial
 * @desc Export the ThreeJs MeshNormalMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshNormalMaterial;

function requireMeshNormalMaterial () {
	if (hasRequiredMeshNormalMaterial) return MeshNormalMaterial;
	hasRequiredMeshNormalMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Mixed   = Types.Mixed;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshNormalMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshNormalMaterial.MeshNormalMaterial = {
	    name:            'MeshNormalMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshNormalMaterial;
}

var MeshNormalMaterialExports = requireMeshNormalMaterial();

var MeshPhongMaterial = {};

/**
 * @module Schemas/Materials/MeshPhongMaterial
 * @desc Export the ThreeJs MeshPhongMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshPhongMaterial;

function requireMeshPhongMaterial () {
	if (hasRequiredMeshPhongMaterial) return MeshPhongMaterial;
	hasRequiredMeshPhongMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Mixed   = Types.Mixed;
	    const Color   = Types.Color;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshPhongMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshPhongMaterial.MeshPhongMaterial = {
	    name:            'MeshPhongMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshPhongMaterial;
}

var MeshPhongMaterialExports = requireMeshPhongMaterial();

var MeshPhysicalMaterial = {};

/**
 * @module Schemas/Materials/MeshPhysicalMaterial
 * @desc Export the ThreeJs MeshPhysicalMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshPhysicalMaterial;

function requireMeshPhysicalMaterial () {
	if (hasRequiredMeshPhysicalMaterial) return MeshPhysicalMaterial;
	hasRequiredMeshPhysicalMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {
	        reflectivity:       Number,
	        clearCoat:          Number,
	        clearCoatRoughness: Number
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshPhysicalMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshPhysicalMaterial.MeshPhysicalMaterial = {
	    name:            'MeshPhysicalMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshPhysicalMaterial;
}

var MeshPhysicalMaterialExports = requireMeshPhysicalMaterial();

var MeshStandardMaterial = {};

/**
 * @module Schemas/Materials/MeshStandardMaterial
 * @desc Export the ThreeJs MeshStandardMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshStandardMaterial;

function requireMeshStandardMaterial () {
	if (hasRequiredMeshStandardMaterial) return MeshStandardMaterial;
	hasRequiredMeshStandardMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Mixed   = Types.Mixed;
	    const Color   = Types.Color;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshStandardMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshStandardMaterial.MeshStandardMaterial = {
	    name:            'MeshStandardMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshStandardMaterial;
}

var MeshStandardMaterialExports = requireMeshStandardMaterial();

var MeshToonMaterial = {};

/**
 * @module Schemas/Materials/MeshToonMaterial
 * @desc Export the ThreeJs MeshToonMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMeshToonMaterial;

function requireMeshToonMaterial () {
	if (hasRequiredMeshToonMaterial) return MeshToonMaterial;
	hasRequiredMeshToonMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Mixed   = Types.Mixed;
	    const Color   = Types.Color;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'MeshToonMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	MeshToonMaterial.MeshToonMaterial = {
	    name:            'MeshToonMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return MeshToonMaterial;
}

var MeshToonMaterialExports = requireMeshToonMaterial();

var PointsMaterial = {};

/**
 * @module Schemas/Materials/PointsMaterial
 * @desc Export the ThreeJs PointsMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPointsMaterial;

function requirePointsMaterial () {
	if (hasRequiredPointsMaterial) return PointsMaterial;
	hasRequiredPointsMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Color  = Types.Color;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
	        color:           Color,
	        map:             Mixed, // Unknown yet
	        size:            Number,
	        sizeAttenuation: Boolean,
	        lights:          Boolean
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'PointsMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	PointsMaterial.PointsMaterial = {
	    name:            'PointsMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return PointsMaterial;
}

var PointsMaterialExports = requirePointsMaterial();

var RawShaderMaterial = {};

/**
 * @module Schemas/Materials/RawShaderMaterial
 * @desc Export the ThreeJs RawShaderMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredRawShaderMaterial;

function requireRawShaderMaterial () {
	if (hasRequiredRawShaderMaterial) return RawShaderMaterial;
	hasRequiredRawShaderMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'RawShaderMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	RawShaderMaterial.RawShaderMaterial = {
	    name:            'RawShaderMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return RawShaderMaterial;
}

var RawShaderMaterialExports = requireRawShaderMaterial();

var ShaderMaterial = {};

/**
 * @module Schemas/Materials/ShaderMaterial
 * @desc Export the ThreeJs ShaderMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredShaderMaterial;

function requireShaderMaterial () {
	if (hasRequiredShaderMaterial) return ShaderMaterial;
	hasRequiredShaderMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'ShaderMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ShaderMaterial.ShaderMaterial = {
	    name:            'ShaderMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ShaderMaterial;
}

var ShaderMaterialExports = requireShaderMaterial();

var ShadowMaterial = {};

/**
 * @module Schemas/Materials/ShadowMaterial
 * @desc Export the ThreeJs ShadowMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredShadowMaterial;

function requireShadowMaterial () {
	if (hasRequiredShadowMaterial) return ShadowMaterial;
	hasRequiredShadowMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Color  = Types.Color;

	    _schema = new Schema( {
	        color:       Color,
	        opacity:     Number,
	        lights:      Boolean,
	        transparent: Boolean
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'ShadowMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ShadowMaterial.ShadowMaterial = {
	    name:            'ShadowMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ShadowMaterial;
}

var ShadowMaterialExports = requireShadowMaterial();

var SpriteMaterial = {};

/**
 * @module Schemas/Materials/SpriteMaterial
 * @desc Export the ThreeJs SpriteMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSpriteMaterial;

function requireSpriteMaterial () {
	if (hasRequiredSpriteMaterial) return SpriteMaterial;
	hasRequiredSpriteMaterial = 1;
	const { Material } = requireMaterial();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Color  = Types.Color;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
	        color:    Color,
	        map:      Mixed, // Unknown yet
	        rotation: Number,
	        fog:      Boolean,
	        lights:   Boolean
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const MaterialBaseModel = Material.getModelFrom( Mongoose );
	    _model                  = MaterialBaseModel.discriminator( 'SpriteMaterial', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SpriteMaterial.SpriteMaterial = {
	    name:            'SpriteMaterial',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SpriteMaterial;
}

var SpriteMaterialExports = requireSpriteMaterial();

var Box2 = {};

/**
 * @module Schemas/Math/Box2
 * @desc Export the ThreeJs Box2 Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBox2;

function requireBox2 () {
	if (hasRequiredBox2) return Box2;
	hasRequiredBox2 = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector2 = Types.Vector2;

	    _schema = new Schema( {
	        min: Vector2,
	        max: Vector2
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Box2.Box2 = {
	    name:            'Box2',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Box2;
}

var Box2Exports = requireBox2();

var Box3 = {};

/**
 * @module Schemas/Math/Box3
 * @desc Export the ThreeJs Box3 Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBox3;

function requireBox3 () {
	if (hasRequiredBox3) return Box3;
	hasRequiredBox3 = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        min: Vector3,
	        max: Vector3
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Box3.Box3 = {
	    name:            'Box3',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Box3;
}

var Box3Exports = requireBox3();

var Line3 = {};

/**
 * @module Schemas/Math/Line3
 * @desc Export the ThreeJs Line3 Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLine3;

function requireLine3 () {
	if (hasRequiredLine3) return Line3;
	hasRequiredLine3 = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        start: Vector3,
	        end:   Vector3
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Line3.Line3 = {
	    name:            'Line3',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Line3;
}

var Line3Exports = requireLine3();

var Plane = {};

/**
 * @module Schemas/Math/Plane
 * @desc Export the ThreeJs Plane Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPlane;

function requirePlane () {
	if (hasRequiredPlane) return Plane;
	hasRequiredPlane = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        normal:   Vector3,
	        constant: Number
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Plane.Plane = {
	    name:            'Plane',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Plane;
}

var PlaneExports = requirePlane();

var Ray = {};

/**
 * @module Schemas/Math/Ray
 * @desc Export the ThreeJs Ray Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredRay;

function requireRay () {
	if (hasRequiredRay) return Ray;
	hasRequiredRay = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        origin:    Vector3,
	        direction: Vector3
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Ray.Ray = {
	    name:            'Ray',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Ray;
}

var RayExports = requireRay();

var Sphere = {};

/**
 * @module Schemas/Math/Sphere
 * @desc Export the ThreeJs Sphere Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSphere;

function requireSphere () {
	if (hasRequiredSphere) return Sphere;
	hasRequiredSphere = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        center: Vector3,
	        radius: Number
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Sphere.Sphere = {
	    name:            'Sphere',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Sphere;
}

var SphereExports = requireSphere();

var Spherical = {};

/**
 * @module Schemas/Math/Spherical
 * @desc Export the ThreeJs Spherical Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSpherical;

function requireSpherical () {
	if (hasRequiredSpherical) return Spherical;
	hasRequiredSpherical = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {
	        radius: Number,
	        phi:    Number,
	        theta:  Number
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Spherical.Spherical = {
	    name:            'Spherical',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Spherical;
}

var SphericalExports = requireSpherical();

var Triangle = {};

/**
 * @module Schemas/Math/Triangle
 * @desc Export the ThreeJs Triangle Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTriangle;

function requireTriangle () {
	if (hasRequiredTriangle) return Triangle;
	hasRequiredTriangle = 1;
	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema  = Mongoose.Schema;
	    const Types   = Schema.Types;
	    const Vector3 = Types.Vector3;

	    _schema = new Schema( {
	        a: Vector3,
	        b: Vector3,
	        c: Vector3
	    }, {
	        _id: false,
	        id:  false
	    } );

	}

	Triangle.Triangle = {
	    name:            'Triangle',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Triangle;
}

var TriangleExports = requireTriangle();

var Bone = {};

/**
 * @module Schemas/Objects/Bone
 * @desc Export the ThreeJs Bone Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredBone;

function requireBone () {
	if (hasRequiredBone) return Bone;
	hasRequiredBone = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Bone', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Bone.Bone = {
	    name:            'Bone',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Bone;
}

var BoneExports = requireBone();

/**
 * @module Schemas/Objects/Group
 * @desc Export the ThreeJs Group Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


let _schema = undefined;
let _model  = undefined;

function getSchemaFrom( Mongoose ) {

    if ( !_schema ) {
        _createSchema( Mongoose );
    }

    return _schema

}

function _createSchema( Mongoose ) {

    const Schema = Mongoose.Schema;

    _schema = new Schema( {} );

}

function getModelFrom( Mongoose ) {

    if ( !_model ) {
        _createModel( Mongoose );
    }

    return _model

}

function _createModel( Mongoose ) {

    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
    _model                  = Object3DBaseModel.discriminator( 'Group', getSchemaFrom( Mongoose ) );

}

function registerModelTo( Mongoose ) {

    if ( !_model ) {
        _createModel( Mongoose );
    }

    return Mongoose

}

const Group = {
    name:            'Group',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
};

var ImmediateRenderObject = {};

/**
 * @module Schemas/Objects/ImmediateRenderObject
 * @desc Export the ThreeJs ImmediateRenderObject Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredImmediateRenderObject;

function requireImmediateRenderObject () {
	if (hasRequiredImmediateRenderObject) return ImmediateRenderObject;
	hasRequiredImmediateRenderObject = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'ImmediateRenderObject', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	ImmediateRenderObject.ImmediateRenderObject = {
	    name:            'ImmediateRenderObject',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return ImmediateRenderObject;
}

var ImmediateRenderObjectExports = requireImmediateRenderObject();

var Lensflare = {};

/**
 * @module Schemas/Objects/LensFlare
 * @desc Export the ThreeJs LensFlare Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLensflare;

function requireLensflare () {
	if (hasRequiredLensflare) return Lensflare;
	hasRequiredLensflare = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;
	    const Color    = Types.Color;
	    const Vector3  = Types.Vector3;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'LensFlare', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Lensflare.LensFlare = {
	    name:            'LensFlare',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Lensflare;
}

var LensflareExports = requireLensflare();

var Line = {};

/**
 * @module Schemas/Objects/Line
 * @desc Export the ThreeJs Line Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLine;

function requireLine () {
	if (hasRequiredLine) return Line;
	hasRequiredLine = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Line', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Line.Line = {
	    name:            'Line',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Line;
}

var LineExports = requireLine();

var LineLoop = {};

/**
 * @module Schemas/Objects/LineLoop
 * @desc Export the ThreeJs LineLoop Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLineLoop;

function requireLineLoop () {
	if (hasRequiredLineLoop) return LineLoop;
	hasRequiredLineLoop = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'LineLoop', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LineLoop.LineLoop = {
	    name:            'LineLoop',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LineLoop;
}

var LineLoopExports = requireLineLoop();

var LineSegments = {};

/**
 * @module Schemas/Objects/LineSegments
 * @desc Export the ThreeJs LineSegments Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLineSegments;

function requireLineSegments () {
	if (hasRequiredLineSegments) return LineSegments;
	hasRequiredLineSegments = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'LineSegments', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LineSegments.LineSegments = {
	    name:            'LineSegments',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LineSegments;
}

var LineSegmentsExports = requireLineSegments();

var LOD = {};

/**
 * @module Schemas/Objects/LOD
 * @desc Export the ThreeJs LOD Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredLOD;

function requireLOD () {
	if (hasRequiredLOD) return LOD;
	hasRequiredLOD = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;
	    const Types  = Schema.Types;
	    const Mixed  = Types.Mixed;

	    _schema = new Schema( {
	        levels: [ Mixed ]
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'LOD', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	LOD.LOD = {
	    name:            'LOD',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return LOD;
}

var LODExports = requireLOD();

var Mesh = {};

/**
 * @module Schemas/Objects/Mesh
 * @desc Export the ThreeJs Mesh Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredMesh;

function requireMesh () {
	if (hasRequiredMesh) return Mesh;
	hasRequiredMesh = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Mesh', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Mesh.Mesh = {
	    name:            'Mesh',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Mesh;
}

var MeshExports = requireMesh();

var Points = {};

/**
 * @module Schemas/Objects/Points
 * @desc Export the ThreeJs Points Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredPoints;

function requirePoints () {
	if (hasRequiredPoints) return Points;
	hasRequiredPoints = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Points', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Points.Points = {
	    name:            'Points',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Points;
}

var PointsExports = requirePoints();

var Skeleton = {};

/**
 * @module Schemas/Objects/Skeleton
 * @desc Export the ThreeJs Skeleton Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSkeleton;

function requireSkeleton () {
	if (hasRequiredSkeleton) return Skeleton;
	hasRequiredSkeleton = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
	        bones:        [ ObjectId ],
	        boneMatrices: [ Number ] // Float32Array( this.bones.length * 16 )
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Skeleton', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Skeleton.Skeleton = {
	    name:            'Skeleton',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Skeleton;
}

var SkeletonExports = requireSkeleton();

var SkinnedMesh = {};

/**
 * @module Schemas/Objects/SkinnedMesh
 * @desc Export the ThreeJs SkinnedMesh Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSkinnedMesh;

function requireSkinnedMesh () {
	if (hasRequiredSkinnedMesh) return SkinnedMesh;
	hasRequiredSkinnedMesh = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'SkinnedMesh', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	SkinnedMesh.SkinnedMesh = {
	    name:            'SkinnedMesh',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return SkinnedMesh;
}

var SkinnedMeshExports = requireSkinnedMesh();

var Sprite = {};

/**
 * @module Schemas/Objects/Sprite
 * @desc Export the ThreeJs Sprite Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredSprite;

function requireSprite () {
	if (hasRequiredSprite) return Sprite;
	hasRequiredSprite = 1;
	const { Object3D } = require$$0$2;

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;

	    _schema = new Schema( {
	        material: [
	            {
	                type: ObjectId,
	                ref:  'SpriteMaterial'
	            }
	        ]
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Sprite', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Sprite.Sprite = {
	    name:            'Sprite',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return Sprite;
}

var SpriteExports = requireSprite();

var Fog = {};

/**
 * @module Schemas/Scenes/Fog
 * @desc Export the ThreeJs Fog Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Scenes/Scene Schemas/Scenes/Scene}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredFog;

function requireFog () {
	if (hasRequiredFog) return Fog;
	hasRequiredFog = 1;
	const { Buffer } = __require();

	let _schema = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {
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

	Fog.Fog = {
	    name:            'Fog',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    () => null,
	    registerModelTo: Mongoose => Mongoose
	};
	return Fog;
}

var FogExports = requireFog();

var Scene = {};

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

var hasRequiredScene;

function requireScene () {
	if (hasRequiredScene) return Scene;
	hasRequiredScene = 1;
	const { Object3D } = require$$0$2;
	const { Fog }      = requireFog();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const FogSchema = Fog.getSchemaFrom( Mongoose );
	    const Schema    = Mongoose.Schema;
	    const Types     = Schema.Types;
	    const Color     = Types.Color;

	    _schema = new Schema( {
	        background:       Color,
	        fog:              FogSchema,
	        overrideMaterial: String,
	        autoUpdate:       Boolean
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const Object3DBaseModel = Object3D.getModelFrom( Mongoose );
	    _model                  = Object3DBaseModel.discriminator( 'Scene', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Scene.Scene = {
	    name: 'Scene',
	    getSchemaFrom,
	    getModelFrom,
	    registerModelTo
	};
	return Scene;
}

var SceneExports = requireScene();

var CanvasTexture = {};

var Texture = {};

/**
 * @module Schemas/Textures/Texture
 * @desc Export the ThreeJs Texture Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredTexture;

function requireTexture () {
	if (hasRequiredTexture) return Texture;
	hasRequiredTexture = 1;
	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema   = Mongoose.Schema;
	    const Types    = Schema.Types;
	    const ObjectId = Types.ObjectId;
	    const Vector2  = Types.Vector2;
	    const Matrix3  = Types.Matrix3;

	    _schema = new Schema( {
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

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    // We need to pre-declare the base model to be able to use correctly
	    // the discriminator 'type' correctly with the main type, instead of
	    // directly register the model as it
	    _model = Mongoose.model( 'Textures', getSchemaFrom( Mongoose ) );
	    _model.discriminator( 'Texture', new Mongoose.Schema( {} ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	Texture.Texture = {
	    name: 'Texture',
	    getSchemaFrom,
	    getModelFrom,
	    registerModelTo
	};
	return Texture;
}

/**
 * @module Schemas/Textures/CanvasTexture
 * @desc Export the ThreeJs CanvasTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCanvasTexture;

function requireCanvasTexture () {
	if (hasRequiredCanvasTexture) return CanvasTexture;
	hasRequiredCanvasTexture = 1;
	const { Texture } = requireTexture();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {
	        needsUpdate: Boolean
	    } );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const TextureBaseModel = Texture.getModelFrom( Mongoose );
	    _model                 = TextureBaseModel.discriminator( 'CanvasTexture', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CanvasTexture.CanvasTexture = {
	    name:            'CanvasTexture',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CanvasTexture;
}

var CanvasTextureExports = requireCanvasTexture();

var CompressedTexture = {};

/**
 * @module Schemas/Textures/CompressedTexture
 * @desc Export the ThreeJs CompressedTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCompressedTexture;

function requireCompressedTexture () {
	if (hasRequiredCompressedTexture) return CompressedTexture;
	hasRequiredCompressedTexture = 1;
	const { Texture } = requireTexture();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const TextureBaseModel = Texture.getModelFrom( Mongoose );
	    _model                 = TextureBaseModel.discriminator( 'CompressedTexture', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CompressedTexture.CompressedTexture = {
	    name:            'CompressedTexture',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CompressedTexture;
}

var CompressedTextureExports = requireCompressedTexture();

var CubeTexture = {};

/**
 * @module Schemas/Textures/CubeTexture
 * @desc Export the ThreeJs CubeTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredCubeTexture;

function requireCubeTexture () {
	if (hasRequiredCubeTexture) return CubeTexture;
	hasRequiredCubeTexture = 1;
	const { Texture } = requireTexture();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const TextureBaseModel = Texture.getModelFrom( Mongoose );
	    _model                 = TextureBaseModel.discriminator( 'CubeTexture', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	CubeTexture.CubeTexture = {
	    name:            'CubeTexture',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return CubeTexture;
}

var CubeTextureExports = requireCubeTexture();

var DataTexture = {};

/**
 * @module Schemas/Textures/DataTexture
 * @desc Export the ThreeJs DataTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredDataTexture;

function requireDataTexture () {
	if (hasRequiredDataTexture) return DataTexture;
	hasRequiredDataTexture = 1;
	const { Texture } = requireTexture();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const TextureBaseModel = Texture.getModelFrom( Mongoose );
	    _model                 = TextureBaseModel.discriminator( 'DataTexture', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	DataTexture.DataTexture = {
	    name:            'DataTexture',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return DataTexture;
}

var DataTextureExports = requireDataTexture();

var DepthTexture = {};

/**
 * @module Schemas/Textures/DepthTexture
 * @desc Export the ThreeJs DepthTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredDepthTexture;

function requireDepthTexture () {
	if (hasRequiredDepthTexture) return DepthTexture;
	hasRequiredDepthTexture = 1;
	const { Texture } = requireTexture();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const TextureBaseModel = Texture.getModelFrom( Mongoose );
	    _model                 = TextureBaseModel.discriminator( 'DepthTexture', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	DepthTexture.DepthTexture = {
	    name:            'DepthTexture',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return DepthTexture;
}

var DepthTextureExports = requireDepthTexture();

var TextureExports = requireTexture();

var VideoTexture = {};

/**
 * @module Schemas/Textures/VideoTexture
 * @desc Export the ThreeJs VideoTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

var hasRequiredVideoTexture;

function requireVideoTexture () {
	if (hasRequiredVideoTexture) return VideoTexture;
	hasRequiredVideoTexture = 1;
	const { Texture } = requireTexture();

	let _schema = undefined;
	let _model  = undefined;

	function getSchemaFrom( Mongoose ) {

	    if ( !_schema ) {
	        _createSchema( Mongoose );
	    }

	    return _schema

	}

	function _createSchema( Mongoose ) {

	    const Schema = Mongoose.Schema;

	    _schema = new Schema( {} );

	}

	function getModelFrom( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return _model

	}

	function _createModel( Mongoose ) {

	    const TextureBaseModel = Texture.getModelFrom( Mongoose );
	    _model                 = TextureBaseModel.discriminator( 'VideoTexture', getSchemaFrom( Mongoose ) );

	}

	function registerModelTo( Mongoose ) {

	    if ( !_model ) {
	        _createModel( Mongoose );
	    }

	    return Mongoose

	}

	VideoTexture.VideoTexture = {
	    name:            'VideoTexture',
	    getSchemaFrom:   getSchemaFrom,
	    getModelFrom:    getModelFrom,
	    registerModelTo: registerModelTo
	};
	return VideoTexture;
}

var VideoTextureExports = requireVideoTexture();

/**
 * @module Types/Color
 * @desc Export the three js Color type for Mongoose.
 *
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
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
function ColorType( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Euler type
 * @returns {Mongoose}
 */
function EulerType( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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
            if ( ![
                'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'
            ].includes( value.order.toUpperCase() ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected order to be a string in ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX']` ) }

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
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
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
function Matrix3Type( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
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
function Matrix4Type( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
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
function QuaternionType( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
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
function Vector2Type( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
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
function Vector3Type( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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
 * @requires {@link module: [@itee/validators]{@link https://github.com/Itee/@itee/validators}}
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
function Vector4Type( Mongoose ) {

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
        constructor( path, options ) {

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
        cast( value ) {

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

    return new mongodb.TMongoDBPlugin( parameters )
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
        .addSchema( AudioExports.Audio )
        .addSchema( AudioListenerExports.AudioListener )
        .addSchema( PositionalAudioExports.PositionalAudio )
        .addSchema( ArrayCameraExports.ArrayCamera )
        .addSchema( CameraExports.Camera )
        .addSchema( CubeCameraExports.CubeCamera )
        .addSchema( OrthographicCameraExports.OrthographicCamera )
        .addSchema( PerspectiveCameraExports.PerspectiveCamera )
        .addSchema( BufferAttributeExports.BufferAttribute )
        .addSchema( BufferGeometry )
        .addSchema( CurvePathExports.CurvePath )
        .addSchema( Face3Exports.Face3 )
        .addSchema( Geometry )
        .addSchema( Object3D )
        .addSchema( PathExports.Path )
        .addSchema( ShapeExports.Shape )
        .addSchema( ArcCurveExports.ArcCurve )
        .addSchema( CatmullRomCurve3Exports.CatmullRomCurve3 )
        .addSchema( CubicBezierCurveExports.CubicBezierCurve )
        .addSchema( CubicBezierCurve3Exports.CubicBezierCurve3 )
        .addSchema( CurveExports.Curve )
        .addSchema( CurveExtrasExports.CurveExtras )
        .addSchema( EllipseCurveExports.EllipseCurve )
        .addSchema( LineCurveExports.LineCurve )
        .addSchema( LineCurve3Exports.LineCurve3 )
        .addSchema( NURBSCurveExports.NURBSCurve )
        .addSchema( NURBSSurfaceExports.NURBSSurface )
        .addSchema( QuadraticBezierCurveExports.QuadraticBezierCurve )
        .addSchema( QuadraticBezierCurve3Exports.QuadraticBezierCurve3 )
        .addSchema( SplineCurveExports.SplineCurve )
        .addSchema( BoxBufferGeometryExports.BoxBufferGeometry )
        .addSchema( BoxGeometryExports.BoxGeometry )
        .addSchema( CircleBufferGeometryExports.CircleBufferGeometry )
        .addSchema( CircleGeometryExports.CircleGeometry )
        .addSchema( ConeBufferGeometryExports.ConeBufferGeometry )
        .addSchema( ConeGeometryExports.ConeGeometry )
        .addSchema( ConvexGeometryExports.ConvexGeometry )
        .addSchema( CylinderBufferGeometryExports.CylinderBufferGeometry )
        .addSchema( CylinderGeometryExports.CylinderGeometry )
        .addSchema( DecalGeometryExports.DecalGeometry )
        .addSchema( DodecahedronGeometryExports.DodecahedronGeometry )
        .addSchema( EdgesGeometryExports.EdgesGeometry )
        .addSchema( ExtrudeBufferGeometryExports.ExtrudeBufferGeometry )
        .addSchema( ExtrudeGeometryExports.ExtrudeGeometry )
        .addSchema( IcosahedronBufferGeometryExports.IcosahedronBufferGeometry )
        .addSchema( IcosahedronGeometryExports.IcosahedronGeometry )
        .addSchema( InstancedBufferGeometryExports.InstancedBufferGeometry )
        .addSchema( LatheBufferGeometryExports.LatheBufferGeometry )
        .addSchema( LatheGeometryExports.LatheGeometry )
        .addSchema( OctahedronBufferGeometryExports.OctahedronBufferGeometry )
        .addSchema( OctahedronGeometryExports.OctahedronGeometry )
        .addSchema( ParametricBufferGeometryExports.ParametricBufferGeometry )
        .addSchema( ParametricGeometryExports.ParametricGeometry )
        .addSchema( PlaneBufferGeometryExports.PlaneBufferGeometry )
        .addSchema( PlaneGeometryExports.PlaneGeometry )
        .addSchema( PolyhedronBufferGeometryExports.PolyhedronBufferGeometry )
        .addSchema( PolyhedronGeometryExports.PolyhedronGeometry )
        .addSchema( RingBufferGeometryExports.RingBufferGeometry )
        .addSchema( RingGeometryExports.RingGeometry )
        .addSchema( ShapeBufferGeometryExports.ShapeBufferGeometry )
        .addSchema( ShapeGeometryExports.ShapeGeometry )
        .addSchema( SphereBufferGeometryExports.SphereBufferGeometry )
        .addSchema( SphereGeometryExports.SphereGeometry )
        .addSchema( TeopotBufferGeometryExports.TeapotBufferGeometry )
        .addSchema( TetrahedronBufferGeometryExports.TetrahedronBufferGeometry )
        .addSchema( TetrahedronGeometryExports.TetrahedronGeometry )
        .addSchema( TextBufferGeometryExports.TextBufferGeometry )
        .addSchema( TextGeometryExports.TextGeometry )
        .addSchema( TorusBufferGeometryExports.TorusBufferGeometry )
        .addSchema( TorusGeometryExports.TorusGeometry )
        .addSchema( TorusKnotBufferGeometryExports.TorusKnotBufferGeometry )
        .addSchema( TorusKnotGeometryExports.TorusKnotGeometry )
        .addSchema( TubeBufferGeometryExports.TubeBufferGeometry )
        .addSchema( TubeGeometryExports.TubeGeometry )
        .addSchema( WireframeGeometryExports.WireframeGeometry )
        .addSchema( ArrowHelperExports.ArrowHelper )
        .addSchema( AxesHelperExports.AxesHelper )
        .addSchema( Box3HelperExports.Box3Helper )
        .addSchema( BoxHelperExports.BoxHelper )
        .addSchema( CameraHelperExports.CameraHelper )
        .addSchema( DirectionalLightHelperExports.DirectionalLightHelper )
        .addSchema( FaceNormalsHelperExports.FaceNormalsHelper )
        .addSchema( GridHelperExports.GridHelper )
        .addSchema( HemisphereLightHelperExports.HemisphereLightHelper )
        .addSchema( PlaneHelperExports.PlaneHelper )
        .addSchema( PointLightHelperExports.PointLightHelper )
        .addSchema( PolarGridHelperExports.PolarGridHelper )
        .addSchema( RectAreaLightHelperExports.RectAreaLightHelper )
        .addSchema( SkeletonHelperExports.SkeletonHelper )
        .addSchema( SpotLightHelperExports.SpotLightHelper )
        .addSchema( VertexNormalsHelperExports.VertexNormalsHelper )
        .addSchema( AmbientLightExports.AmbientLight )
        .addSchema( DirectionalLightExports.DirectionalLight )
        //    .addSchema( DirectionalLightShadow )
        .addSchema( HemisphereLightExports.HemisphereLight )
        .addSchema( LightExports.Light )
        //    .addSchema( LightShadow )
        .addSchema( PointLightExports.PointLight )
        .addSchema( RectAreaLightExports.RectAreaLight )
        .addSchema( SpotLightExports.SpotLight )
        //    .addSchema( SpotLightShadow )
        .addSchema( MeshPhongMaterialExports.MeshPhongMaterial )
        .addSchema( LineBasicMaterialExports.LineBasicMaterial )
        .addSchema( LineDashedMaterialExports.LineDashedMaterial )
        .addSchema( MaterialExports.Material )
        .addSchema( MeshBasicMaterialExports.MeshBasicMaterial )
        .addSchema( MeshDepthMaterialExports.MeshDepthMaterial )
        .addSchema( MeshLambertMaterialExports.MeshLambertMaterial )
        .addSchema( MeshNormalMaterialExports.MeshNormalMaterial )
        .addSchema( MeshPhysicalMaterialExports.MeshPhysicalMaterial )
        .addSchema( MeshStandardMaterialExports.MeshStandardMaterial )
        .addSchema( MeshToonMaterialExports.MeshToonMaterial )
        .addSchema( PointsMaterialExports.PointsMaterial )
        .addSchema( RawShaderMaterialExports.RawShaderMaterial )
        .addSchema( ShaderMaterialExports.ShaderMaterial )
        .addSchema( ShadowMaterialExports.ShadowMaterial )
        .addSchema( SpriteMaterialExports.SpriteMaterial )
        .addSchema( Box2Exports.Box2 )
        .addSchema( Box3Exports.Box3 )
        //    .addSchema( ColorConverter )
        //    .addSchema( Cylindrical )
        //    .addSchema( Frustum )
        //    .addSchema( Interpolant )
        .addSchema( Line3Exports.Line3 )
        //    .addSchema( Lut )
        //    .addSchema( Math )
        .addSchema( PlaneExports.Plane )
        .addSchema( RayExports.Ray )
        .addSchema( SphereExports.Sphere )
        .addSchema( SphericalExports.Spherical )
        .addSchema( TriangleExports.Triangle )
        .addSchema( BoneExports.Bone )
        //    .addSchema( Car )
        //    .addSchema( GPUParticleSystem )
        .addSchema( Group )
        //    .addSchema( Gyroscope )
        .addSchema( ImmediateRenderObjectExports.ImmediateRenderObject )
        .addSchema( LensflareExports.LensFlare )
        .addSchema( LineExports.Line )
        .addSchema( LineLoopExports.LineLoop )
        .addSchema( LineSegmentsExports.LineSegments )
        .addSchema( LODExports.LOD )
        //    .addSchema( MarchingCubes )
        //    .addSchema( MD2Character )
        //    .addSchema( MD2CharacterComplex )
        .addSchema( MeshExports.Mesh )
        //    .addSchema( MorphAnimMesh )
        //    .addSchema( MorphBlendMesh )
        //    .addSchema( Ocean )
        .addSchema( PointsExports.Points )
        //    .addSchema( Reflector )
        //    .addSchema( ReflectorRTT )
        //    .addSchema( Refractor )
        //    .addSchema( RollerCoaster )
        //    .addSchema( ShadowMesh )
        .addSchema( SkeletonExports.Skeleton )
        .addSchema( SkinnedMeshExports.SkinnedMesh )
        //    .addSchema( Sky )
        .addSchema( SpriteExports.Sprite )
        //    .addSchema( UCSCharacter )
        //    .addSchema( Water )
        //    .addSchema( Water2 )
        .addSchema( FogExports.Fog )
        //    .addSchema( FogExp2 )
        .addSchema( SceneExports.Scene )
        .addSchema( CanvasTextureExports.CanvasTexture )
        .addSchema( CompressedTextureExports.CompressedTexture )
        .addSchema( CubeTextureExports.CubeTexture )
        .addSchema( DataTextureExports.DataTexture )
        .addSchema( DepthTextureExports.DepthTexture )
        .addSchema( TextureExports.Texture )
        .addSchema( VideoTextureExports.VideoTexture )
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
        .addController( mongodb.TMongooseController )
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
        .addController( database.TAbstractConverterManager )
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
                    rules: [
                        {
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
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const REVISION = '149';
const SRGBColorSpace = 'srgb';
const LinearSRGBColorSpace = 'srgb-linear';

function clamp( value, min, max ) {

	return Math.max( min, Math.min( max, value ) );

}

// compute euclidean modulo of m % n
// https://en.wikipedia.org/wiki/Modulo_operation
function euclideanModulo( n, m ) {

	return ( ( n % m ) + m ) % m;

}

// https://en.wikipedia.org/wiki/Linear_interpolation
function lerp( x, y, t ) {

	return ( 1 - t ) * x + t * y;

}

function SRGBToLinear( c ) {

	return ( c < 0.04045 ) ? c * 0.0773993808 : Math.pow( c * 0.9478672986 + 0.0521327014, 2.4 );

}

function LinearToSRGB( c ) {

	return ( c < 0.0031308 ) ? c * 12.92 : 1.055 * ( Math.pow( c, 0.41666 ) ) - 0.055;

}

// JavaScript RGB-to-RGB transforms, defined as
// FN[InputColorSpace][OutputColorSpace] callback functions.
const FN = {
	[ SRGBColorSpace ]: { [ LinearSRGBColorSpace ]: SRGBToLinear },
	[ LinearSRGBColorSpace ]: { [ SRGBColorSpace ]: LinearToSRGB },
};

const ColorManagement = {

	legacyMode: true,

	get workingColorSpace() {

		return LinearSRGBColorSpace;

	},

	set workingColorSpace( colorSpace ) {

		console.warn( 'THREE.ColorManagement: .workingColorSpace is readonly.' );

	},

	convert: function ( color, sourceColorSpace, targetColorSpace ) {

		if ( this.legacyMode || sourceColorSpace === targetColorSpace || ! sourceColorSpace || ! targetColorSpace ) {

			return color;

		}

		if ( FN[ sourceColorSpace ] && FN[ sourceColorSpace ][ targetColorSpace ] !== undefined ) {

			const fn = FN[ sourceColorSpace ][ targetColorSpace ];

			color.r = fn( color.r );
			color.g = fn( color.g );
			color.b = fn( color.b );

			return color;

		}

		throw new Error( 'Unsupported color space conversion.' );

	},

	fromWorkingColorSpace: function ( color, targetColorSpace ) {

		return this.convert( color, this.workingColorSpace, targetColorSpace );

	},

	toWorkingColorSpace: function ( color, sourceColorSpace ) {

		return this.convert( color, sourceColorSpace, this.workingColorSpace );

	},

};

const _colorKeywords = { 'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
	'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
	'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
	'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
	'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
	'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
	'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
	'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
	'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
	'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
	'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
	'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
	'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
	'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
	'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
	'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
	'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
	'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
	'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
	'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'rebeccapurple': 0x663399, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
	'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
	'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
	'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
	'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32 };

const _rgb$1 = { r: 0, g: 0, b: 0 };
const _hslA = { h: 0, s: 0, l: 0 };
const _hslB = { h: 0, s: 0, l: 0 };

function hue2rgb( p, q, t ) {

	if ( t < 0 ) t += 1;
	if ( t > 1 ) t -= 1;
	if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
	if ( t < 1 / 2 ) return q;
	if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
	return p;

}

function toComponents( source, target ) {

	target.r = source.r;
	target.g = source.g;
	target.b = source.b;

	return target;

}

class Color {

	constructor( r, g, b ) {

		this.isColor = true;

		this.r = 1;
		this.g = 1;
		this.b = 1;

		if ( g === undefined && b === undefined ) {

			// r is THREE.Color, hex or string
			return this.set( r );

		}

		return this.setRGB( r, g, b );

	}

	set( value ) {

		if ( value && value.isColor ) {

			this.copy( value );

		} else if ( typeof value === 'number' ) {

			this.setHex( value );

		} else if ( typeof value === 'string' ) {

			this.setStyle( value );

		}

		return this;

	}

	setScalar( scalar ) {

		this.r = scalar;
		this.g = scalar;
		this.b = scalar;

		return this;

	}

	setHex( hex, colorSpace = SRGBColorSpace ) {

		hex = Math.floor( hex );

		this.r = ( hex >> 16 & 255 ) / 255;
		this.g = ( hex >> 8 & 255 ) / 255;
		this.b = ( hex & 255 ) / 255;

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setRGB( r, g, b, colorSpace = ColorManagement.workingColorSpace ) {

		this.r = r;
		this.g = g;
		this.b = b;

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setHSL( h, s, l, colorSpace = ColorManagement.workingColorSpace ) {

		// h,s,l ranges are in 0.0 - 1.0
		h = euclideanModulo( h, 1 );
		s = clamp( s, 0, 1 );
		l = clamp( l, 0, 1 );

		if ( s === 0 ) {

			this.r = this.g = this.b = l;

		} else {

			const p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
			const q = ( 2 * l ) - p;

			this.r = hue2rgb( q, p, h + 1 / 3 );
			this.g = hue2rgb( q, p, h );
			this.b = hue2rgb( q, p, h - 1 / 3 );

		}

		ColorManagement.toWorkingColorSpace( this, colorSpace );

		return this;

	}

	setStyle( style, colorSpace = SRGBColorSpace ) {

		function handleAlpha( string ) {

			if ( string === undefined ) return;

			if ( parseFloat( string ) < 1 ) {

				console.warn( 'THREE.Color: Alpha component of ' + style + ' will be ignored.' );

			}

		}


		let m;

		if ( m = /^((?:rgb|hsl)a?)\(([^\)]*)\)/.exec( style ) ) {

			// rgb / hsl

			let color;
			const name = m[ 1 ];
			const components = m[ 2 ];

			switch ( name ) {

				case 'rgb':
				case 'rgba':

					if ( color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// rgb(255,0,0) rgba(255,0,0,0.5)
						this.r = Math.min( 255, parseInt( color[ 1 ], 10 ) ) / 255;
						this.g = Math.min( 255, parseInt( color[ 2 ], 10 ) ) / 255;
						this.b = Math.min( 255, parseInt( color[ 3 ], 10 ) ) / 255;

						ColorManagement.toWorkingColorSpace( this, colorSpace );

						handleAlpha( color[ 4 ] );

						return this;

					}

					if ( color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
						this.r = Math.min( 100, parseInt( color[ 1 ], 10 ) ) / 100;
						this.g = Math.min( 100, parseInt( color[ 2 ], 10 ) ) / 100;
						this.b = Math.min( 100, parseInt( color[ 3 ], 10 ) ) / 100;

						ColorManagement.toWorkingColorSpace( this, colorSpace );

						handleAlpha( color[ 4 ] );

						return this;

					}

					break;

				case 'hsl':
				case 'hsla':

					if ( color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec( components ) ) {

						// hsl(120,50%,50%) hsla(120,50%,50%,0.5)
						const h = parseFloat( color[ 1 ] ) / 360;
						const s = parseFloat( color[ 2 ] ) / 100;
						const l = parseFloat( color[ 3 ] ) / 100;

						handleAlpha( color[ 4 ] );

						return this.setHSL( h, s, l, colorSpace );

					}

					break;

			}

		} else if ( m = /^\#([A-Fa-f\d]+)$/.exec( style ) ) {

			// hex color

			const hex = m[ 1 ];
			const size = hex.length;

			if ( size === 3 ) {

				// #ff0
				this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 0 ), 16 ) / 255;
				this.g = parseInt( hex.charAt( 1 ) + hex.charAt( 1 ), 16 ) / 255;
				this.b = parseInt( hex.charAt( 2 ) + hex.charAt( 2 ), 16 ) / 255;

				ColorManagement.toWorkingColorSpace( this, colorSpace );

				return this;

			} else if ( size === 6 ) {

				// #ff0000
				this.r = parseInt( hex.charAt( 0 ) + hex.charAt( 1 ), 16 ) / 255;
				this.g = parseInt( hex.charAt( 2 ) + hex.charAt( 3 ), 16 ) / 255;
				this.b = parseInt( hex.charAt( 4 ) + hex.charAt( 5 ), 16 ) / 255;

				ColorManagement.toWorkingColorSpace( this, colorSpace );

				return this;

			}

		}

		if ( style && style.length > 0 ) {

			return this.setColorName( style, colorSpace );

		}

		return this;

	}

	setColorName( style, colorSpace = SRGBColorSpace ) {

		// color keywords
		const hex = _colorKeywords[ style.toLowerCase() ];

		if ( hex !== undefined ) {

			// red
			this.setHex( hex, colorSpace );

		} else {

			// unknown color
			console.warn( 'THREE.Color: Unknown color ' + style );

		}

		return this;

	}

	clone() {

		return new this.constructor( this.r, this.g, this.b );

	}

	copy( color ) {

		this.r = color.r;
		this.g = color.g;
		this.b = color.b;

		return this;

	}

	copySRGBToLinear( color ) {

		this.r = SRGBToLinear( color.r );
		this.g = SRGBToLinear( color.g );
		this.b = SRGBToLinear( color.b );

		return this;

	}

	copyLinearToSRGB( color ) {

		this.r = LinearToSRGB( color.r );
		this.g = LinearToSRGB( color.g );
		this.b = LinearToSRGB( color.b );

		return this;

	}

	convertSRGBToLinear() {

		this.copySRGBToLinear( this );

		return this;

	}

	convertLinearToSRGB() {

		this.copyLinearToSRGB( this );

		return this;

	}

	getHex( colorSpace = SRGBColorSpace ) {

		ColorManagement.fromWorkingColorSpace( toComponents( this, _rgb$1 ), colorSpace );

		return clamp( _rgb$1.r * 255, 0, 255 ) << 16 ^ clamp( _rgb$1.g * 255, 0, 255 ) << 8 ^ clamp( _rgb$1.b * 255, 0, 255 ) << 0;

	}

	getHexString( colorSpace = SRGBColorSpace ) {

		return ( '000000' + this.getHex( colorSpace ).toString( 16 ) ).slice( -6 );

	}

	getHSL( target, colorSpace = ColorManagement.workingColorSpace ) {

		// h,s,l ranges are in 0.0 - 1.0

		ColorManagement.fromWorkingColorSpace( toComponents( this, _rgb$1 ), colorSpace );

		const r = _rgb$1.r, g = _rgb$1.g, b = _rgb$1.b;

		const max = Math.max( r, g, b );
		const min = Math.min( r, g, b );

		let hue, saturation;
		const lightness = ( min + max ) / 2.0;

		if ( min === max ) {

			hue = 0;
			saturation = 0;

		} else {

			const delta = max - min;

			saturation = lightness <= 0.5 ? delta / ( max + min ) : delta / ( 2 - max - min );

			switch ( max ) {

				case r: hue = ( g - b ) / delta + ( g < b ? 6 : 0 ); break;
				case g: hue = ( b - r ) / delta + 2; break;
				case b: hue = ( r - g ) / delta + 4; break;

			}

			hue /= 6;

		}

		target.h = hue;
		target.s = saturation;
		target.l = lightness;

		return target;

	}

	getRGB( target, colorSpace = ColorManagement.workingColorSpace ) {

		ColorManagement.fromWorkingColorSpace( toComponents( this, _rgb$1 ), colorSpace );

		target.r = _rgb$1.r;
		target.g = _rgb$1.g;
		target.b = _rgb$1.b;

		return target;

	}

	getStyle( colorSpace = SRGBColorSpace ) {

		ColorManagement.fromWorkingColorSpace( toComponents( this, _rgb$1 ), colorSpace );

		if ( colorSpace !== SRGBColorSpace ) {

			// Requires CSS Color Module Level 4 (https://www.w3.org/TR/css-color-4/).
			return `color(${ colorSpace } ${ _rgb$1.r } ${ _rgb$1.g } ${ _rgb$1.b })`;

		}

		return `rgb(${( _rgb$1.r * 255 ) | 0},${( _rgb$1.g * 255 ) | 0},${( _rgb$1.b * 255 ) | 0})`;

	}

	offsetHSL( h, s, l ) {

		this.getHSL( _hslA );

		_hslA.h += h; _hslA.s += s; _hslA.l += l;

		this.setHSL( _hslA.h, _hslA.s, _hslA.l );

		return this;

	}

	add( color ) {

		this.r += color.r;
		this.g += color.g;
		this.b += color.b;

		return this;

	}

	addColors( color1, color2 ) {

		this.r = color1.r + color2.r;
		this.g = color1.g + color2.g;
		this.b = color1.b + color2.b;

		return this;

	}

	addScalar( s ) {

		this.r += s;
		this.g += s;
		this.b += s;

		return this;

	}

	sub( color ) {

		this.r = Math.max( 0, this.r - color.r );
		this.g = Math.max( 0, this.g - color.g );
		this.b = Math.max( 0, this.b - color.b );

		return this;

	}

	multiply( color ) {

		this.r *= color.r;
		this.g *= color.g;
		this.b *= color.b;

		return this;

	}

	multiplyScalar( s ) {

		this.r *= s;
		this.g *= s;
		this.b *= s;

		return this;

	}

	lerp( color, alpha ) {

		this.r += ( color.r - this.r ) * alpha;
		this.g += ( color.g - this.g ) * alpha;
		this.b += ( color.b - this.b ) * alpha;

		return this;

	}

	lerpColors( color1, color2, alpha ) {

		this.r = color1.r + ( color2.r - color1.r ) * alpha;
		this.g = color1.g + ( color2.g - color1.g ) * alpha;
		this.b = color1.b + ( color2.b - color1.b ) * alpha;

		return this;

	}

	lerpHSL( color, alpha ) {

		this.getHSL( _hslA );
		color.getHSL( _hslB );

		const h = lerp( _hslA.h, _hslB.h, alpha );
		const s = lerp( _hslA.s, _hslB.s, alpha );
		const l = lerp( _hslA.l, _hslB.l, alpha );

		this.setHSL( h, s, l );

		return this;

	}

	equals( c ) {

		return ( c.r === this.r ) && ( c.g === this.g ) && ( c.b === this.b );

	}

	fromArray( array, offset = 0 ) {

		this.r = array[ offset ];
		this.g = array[ offset + 1 ];
		this.b = array[ offset + 2 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.r;
		array[ offset + 1 ] = this.g;
		array[ offset + 2 ] = this.b;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.r = attribute.getX( index );
		this.g = attribute.getY( index );
		this.b = attribute.getZ( index );

		return this;

	}

	toJSON() {

		return this.getHex();

	}

	*[ Symbol.iterator ]() {

		yield this.r;
		yield this.g;
		yield this.b;

	}

}

Color.NAMES = _colorKeywords;

class Quaternion {

	constructor( x = 0, y = 0, z = 0, w = 1 ) {

		this.isQuaternion = true;

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

	}

	static slerpFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t ) {

		// fuzz-free, array-based Quaternion SLERP operation

		let x0 = src0[ srcOffset0 + 0 ],
			y0 = src0[ srcOffset0 + 1 ],
			z0 = src0[ srcOffset0 + 2 ],
			w0 = src0[ srcOffset0 + 3 ];

		const x1 = src1[ srcOffset1 + 0 ],
			y1 = src1[ srcOffset1 + 1 ],
			z1 = src1[ srcOffset1 + 2 ],
			w1 = src1[ srcOffset1 + 3 ];

		if ( t === 0 ) {

			dst[ dstOffset + 0 ] = x0;
			dst[ dstOffset + 1 ] = y0;
			dst[ dstOffset + 2 ] = z0;
			dst[ dstOffset + 3 ] = w0;
			return;

		}

		if ( t === 1 ) {

			dst[ dstOffset + 0 ] = x1;
			dst[ dstOffset + 1 ] = y1;
			dst[ dstOffset + 2 ] = z1;
			dst[ dstOffset + 3 ] = w1;
			return;

		}

		if ( w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1 ) {

			let s = 1 - t;
			const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
				dir = ( cos >= 0 ? 1 : -1 ),
				sqrSin = 1 - cos * cos;

			// Skip the Slerp for tiny steps to avoid numeric problems:
			if ( sqrSin > Number.EPSILON ) {

				const sin = Math.sqrt( sqrSin ),
					len = Math.atan2( sin, cos * dir );

				s = Math.sin( s * len ) / sin;
				t = Math.sin( t * len ) / sin;

			}

			const tDir = t * dir;

			x0 = x0 * s + x1 * tDir;
			y0 = y0 * s + y1 * tDir;
			z0 = z0 * s + z1 * tDir;
			w0 = w0 * s + w1 * tDir;

			// Normalize in case we just did a lerp:
			if ( s === 1 - t ) {

				const f = 1 / Math.sqrt( x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0 );

				x0 *= f;
				y0 *= f;
				z0 *= f;
				w0 *= f;

			}

		}

		dst[ dstOffset ] = x0;
		dst[ dstOffset + 1 ] = y0;
		dst[ dstOffset + 2 ] = z0;
		dst[ dstOffset + 3 ] = w0;

	}

	static multiplyQuaternionsFlat( dst, dstOffset, src0, srcOffset0, src1, srcOffset1 ) {

		const x0 = src0[ srcOffset0 ];
		const y0 = src0[ srcOffset0 + 1 ];
		const z0 = src0[ srcOffset0 + 2 ];
		const w0 = src0[ srcOffset0 + 3 ];

		const x1 = src1[ srcOffset1 ];
		const y1 = src1[ srcOffset1 + 1 ];
		const z1 = src1[ srcOffset1 + 2 ];
		const w1 = src1[ srcOffset1 + 3 ];

		dst[ dstOffset ] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
		dst[ dstOffset + 1 ] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
		dst[ dstOffset + 2 ] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
		dst[ dstOffset + 3 ] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

		return dst;

	}

	get x() {

		return this._x;

	}

	set x( value ) {

		this._x = value;
		this._onChangeCallback();

	}

	get y() {

		return this._y;

	}

	set y( value ) {

		this._y = value;
		this._onChangeCallback();

	}

	get z() {

		return this._z;

	}

	set z( value ) {

		this._z = value;
		this._onChangeCallback();

	}

	get w() {

		return this._w;

	}

	set w( value ) {

		this._w = value;
		this._onChangeCallback();

	}

	set( x, y, z, w ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this._onChangeCallback();

		return this;

	}

	clone() {

		return new this.constructor( this._x, this._y, this._z, this._w );

	}

	copy( quaternion ) {

		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;

		this._onChangeCallback();

		return this;

	}

	setFromEuler( euler, update ) {

		const x = euler._x, y = euler._y, z = euler._z, order = euler._order;

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		const cos = Math.cos;
		const sin = Math.sin;

		const c1 = cos( x / 2 );
		const c2 = cos( y / 2 );
		const c3 = cos( z / 2 );

		const s1 = sin( x / 2 );
		const s2 = sin( y / 2 );
		const s3 = sin( z / 2 );

		switch ( order ) {

			case 'XYZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'YXZ':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'ZXY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'ZYX':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			case 'YZX':
				this._x = s1 * c2 * c3 + c1 * s2 * s3;
				this._y = c1 * s2 * c3 + s1 * c2 * s3;
				this._z = c1 * c2 * s3 - s1 * s2 * c3;
				this._w = c1 * c2 * c3 - s1 * s2 * s3;
				break;

			case 'XZY':
				this._x = s1 * c2 * c3 - c1 * s2 * s3;
				this._y = c1 * s2 * c3 - s1 * c2 * s3;
				this._z = c1 * c2 * s3 + s1 * s2 * c3;
				this._w = c1 * c2 * c3 + s1 * s2 * s3;
				break;

			default:
				console.warn( 'THREE.Quaternion: .setFromEuler() encountered an unknown order: ' + order );

		}

		if ( update !== false ) this._onChangeCallback();

		return this;

	}

	setFromAxisAngle( axis, angle ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		const halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this._onChangeCallback();

		return this;

	}

	setFromRotationMatrix( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		const te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

			trace = m11 + m22 + m33;

		if ( trace > 0 ) {

			const s = 0.5 / Math.sqrt( trace + 1.0 );

			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this._w = ( m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = ( m12 + m21 ) / s;
			this._z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			const s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this._w = ( m13 - m31 ) / s;
			this._x = ( m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = ( m23 + m32 ) / s;

		} else {

			const s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;

		}

		this._onChangeCallback();

		return this;

	}

	setFromUnitVectors( vFrom, vTo ) {

		// assumes direction vectors vFrom and vTo are normalized

		let r = vFrom.dot( vTo ) + 1;

		if ( r < Number.EPSILON ) {

			// vFrom and vTo point in opposite directions

			r = 0;

			if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

				this._x = - vFrom.y;
				this._y = vFrom.x;
				this._z = 0;
				this._w = r;

			} else {

				this._x = 0;
				this._y = - vFrom.z;
				this._z = vFrom.y;
				this._w = r;

			}

		} else {

			// crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

			this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
			this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
			this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
			this._w = r;

		}

		return this.normalize();

	}

	angleTo( q ) {

		return 2 * Math.acos( Math.abs( clamp( this.dot( q ), -1, 1 ) ) );

	}

	rotateTowards( q, step ) {

		const angle = this.angleTo( q );

		if ( angle === 0 ) return this;

		const t = Math.min( 1, step / angle );

		this.slerp( q, t );

		return this;

	}

	identity() {

		return this.set( 0, 0, 0, 1 );

	}

	invert() {

		// quaternion is assumed to have unit length

		return this.conjugate();

	}

	conjugate() {

		this._x *= -1;
		this._y *= -1;
		this._z *= -1;

		this._onChangeCallback();

		return this;

	}

	dot( v ) {

		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

	}

	lengthSq() {

		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

	}

	length() {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

	}

	normalize() {

		let l = this.length();

		if ( l === 0 ) {

			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;

		} else {

			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;

		}

		this._onChangeCallback();

		return this;

	}

	multiply( q ) {

		return this.multiplyQuaternions( this, q );

	}

	premultiply( q ) {

		return this.multiplyQuaternions( q, this );

	}

	multiplyQuaternions( a, b ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		const qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		const qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this._onChangeCallback();

		return this;

	}

	slerp( qb, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( qb );

		const x = this._x, y = this._y, z = this._z, w = this._w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

		if ( cosHalfTheta < 0 ) {

			this._w = - qb._w;
			this._x = - qb._x;
			this._y = - qb._y;
			this._z = - qb._z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( qb );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;

			return this;

		}

		const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

		if ( sqrSinHalfTheta <= Number.EPSILON ) {

			const s = 1 - t;
			this._w = s * w + t * this._w;
			this._x = s * x + t * this._x;
			this._y = s * y + t * this._y;
			this._z = s * z + t * this._z;

			this.normalize();
			this._onChangeCallback();

			return this;

		}

		const sinHalfTheta = Math.sqrt( sqrSinHalfTheta );
		const halfTheta = Math.atan2( sinHalfTheta, cosHalfTheta );
		const ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
			ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this._w = ( w * ratioA + this._w * ratioB );
		this._x = ( x * ratioA + this._x * ratioB );
		this._y = ( y * ratioA + this._y * ratioB );
		this._z = ( z * ratioA + this._z * ratioB );

		this._onChangeCallback();

		return this;

	}

	slerpQuaternions( qa, qb, t ) {

		return this.copy( qa ).slerp( qb, t );

	}

	random() {

		// Derived from http://planning.cs.uiuc.edu/node198.html
		// Note, this source uses w, x, y, z ordering,
		// so we swap the order below.

		const u1 = Math.random();
		const sqrt1u1 = Math.sqrt( 1 - u1 );
		const sqrtu1 = Math.sqrt( u1 );

		const u2 = 2 * Math.PI * Math.random();

		const u3 = 2 * Math.PI * Math.random();

		return this.set(
			sqrt1u1 * Math.cos( u2 ),
			sqrtu1 * Math.sin( u3 ),
			sqrtu1 * Math.cos( u3 ),
			sqrt1u1 * Math.sin( u2 ),
		);

	}

	equals( quaternion ) {

		return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

	}

	fromArray( array, offset = 0 ) {

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];
		this._w = array[ offset + 3 ];

		this._onChangeCallback();

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._w;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this._x = attribute.getX( index );
		this._y = attribute.getY( index );
		this._z = attribute.getZ( index );
		this._w = attribute.getW( index );

		return this;

	}

	_onChange( callback ) {

		this._onChangeCallback = callback;

		return this;

	}

	_onChangeCallback() {}

	*[ Symbol.iterator ]() {

		yield this._x;
		yield this._y;
		yield this._z;
		yield this._w;

	}

}

class Vector3 {

	constructor( x = 0, y = 0, z = 0 ) {

		Vector3.prototype.isVector3 = true;

		this.x = x;
		this.y = y;
		this.z = z;

	}

	set( x, y, z ) {

		if ( z === undefined ) z = this.z; // sprite.scale.set(x,y)

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	}

	setScalar( scalar ) {

		this.x = scalar;
		this.y = scalar;
		this.z = scalar;

		return this;

	}

	setX( x ) {

		this.x = x;

		return this;

	}

	setY( y ) {

		this.y = y;

		return this;

	}

	setZ( z ) {

		this.z = z;

		return this;

	}

	setComponent( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

		return this;

	}

	getComponent( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	}

	clone() {

		return new this.constructor( this.x, this.y, this.z );

	}

	copy( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	}

	add( v ) {

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	}

	addScalar( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	}

	addVectors( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	}

	addScaledVector( v, s ) {

		this.x += v.x * s;
		this.y += v.y * s;
		this.z += v.z * s;

		return this;

	}

	sub( v ) {

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	}

	subScalar( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	}

	subVectors( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	}

	multiply( v ) {

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	}

	multiplyScalar( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	}

	multiplyVectors( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	}

	applyEuler( euler ) {

		return this.applyQuaternion( _quaternion$4.setFromEuler( euler ) );

	}

	applyAxisAngle( axis, angle ) {

		return this.applyQuaternion( _quaternion$4.setFromAxisAngle( axis, angle ) );

	}

	applyMatrix3( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	}

	applyNormalMatrix( m ) {

		return this.applyMatrix3( m ).normalize();

	}

	applyMatrix4( m ) {

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		const w = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] );

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z + e[ 12 ] ) * w;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z + e[ 13 ] ) * w;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * w;

		return this;

	}

	applyQuaternion( q ) {

		const x = this.x, y = this.y, z = this.z;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

		// calculate quat * vector

		const ix = qw * x + qy * z - qz * y;
		const iy = qw * y + qz * x - qx * z;
		const iz = qw * z + qx * y - qy * x;
		const iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	}

	project( camera ) {

		return this.applyMatrix4( camera.matrixWorldInverse ).applyMatrix4( camera.projectionMatrix );

	}

	unproject( camera ) {

		return this.applyMatrix4( camera.projectionMatrixInverse ).applyMatrix4( camera.matrixWorld );

	}

	transformDirection( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		const x = this.x, y = this.y, z = this.z;
		const e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ] * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ] * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		return this.normalize();

	}

	divide( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	}

	divideScalar( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	min( v ) {

		this.x = Math.min( this.x, v.x );
		this.y = Math.min( this.y, v.y );
		this.z = Math.min( this.z, v.z );

		return this;

	}

	max( v ) {

		this.x = Math.max( this.x, v.x );
		this.y = Math.max( this.y, v.y );
		this.z = Math.max( this.z, v.z );

		return this;

	}

	clamp( min, max ) {

		// assumes min < max, componentwise

		this.x = Math.max( min.x, Math.min( max.x, this.x ) );
		this.y = Math.max( min.y, Math.min( max.y, this.y ) );
		this.z = Math.max( min.z, Math.min( max.z, this.z ) );

		return this;

	}

	clampScalar( minVal, maxVal ) {

		this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
		this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
		this.z = Math.max( minVal, Math.min( maxVal, this.z ) );

		return this;

	}

	clampLength( min, max ) {

		const length = this.length();

		return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

	}

	floor() {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	}

	ceil() {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	}

	round() {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	}

	roundToZero() {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	}

	negate() {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	}

	dot( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	}

	// TODO lengthSquared?

	lengthSq() {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	}

	length() {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	}

	manhattanLength() {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	}

	normalize() {

		return this.divideScalar( this.length() || 1 );

	}

	setLength( length ) {

		return this.normalize().multiplyScalar( length );

	}

	lerp( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	}

	lerpVectors( v1, v2, alpha ) {

		this.x = v1.x + ( v2.x - v1.x ) * alpha;
		this.y = v1.y + ( v2.y - v1.y ) * alpha;
		this.z = v1.z + ( v2.z - v1.z ) * alpha;

		return this;

	}

	cross( v ) {

		return this.crossVectors( this, v );

	}

	crossVectors( a, b ) {

		const ax = a.x, ay = a.y, az = a.z;
		const bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	}

	projectOnVector( v ) {

		const denominator = v.lengthSq();

		if ( denominator === 0 ) return this.set( 0, 0, 0 );

		const scalar = v.dot( this ) / denominator;

		return this.copy( v ).multiplyScalar( scalar );

	}

	projectOnPlane( planeNormal ) {

		_vector$c.copy( this ).projectOnVector( planeNormal );

		return this.sub( _vector$c );

	}

	reflect( normal ) {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		return this.sub( _vector$c.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

	}

	angleTo( v ) {

		const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

		if ( denominator === 0 ) return Math.PI / 2;

		const theta = this.dot( v ) / denominator;

		// clamp, to handle numerical problems

		return Math.acos( clamp( theta, -1, 1 ) );

	}

	distanceTo( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	}

	distanceToSquared( v ) {

		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	}

	manhattanDistanceTo( v ) {

		return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

	}

	setFromSpherical( s ) {

		return this.setFromSphericalCoords( s.radius, s.phi, s.theta );

	}

	setFromSphericalCoords( radius, phi, theta ) {

		const sinPhiRadius = Math.sin( phi ) * radius;

		this.x = sinPhiRadius * Math.sin( theta );
		this.y = Math.cos( phi ) * radius;
		this.z = sinPhiRadius * Math.cos( theta );

		return this;

	}

	setFromCylindrical( c ) {

		return this.setFromCylindricalCoords( c.radius, c.theta, c.y );

	}

	setFromCylindricalCoords( radius, theta, y ) {

		this.x = radius * Math.sin( theta );
		this.y = y;
		this.z = radius * Math.cos( theta );

		return this;

	}

	setFromMatrixPosition( m ) {

		const e = m.elements;

		this.x = e[ 12 ];
		this.y = e[ 13 ];
		this.z = e[ 14 ];

		return this;

	}

	setFromMatrixScale( m ) {

		const sx = this.setFromMatrixColumn( m, 0 ).length();
		const sy = this.setFromMatrixColumn( m, 1 ).length();
		const sz = this.setFromMatrixColumn( m, 2 ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;

	}

	setFromMatrixColumn( m, index ) {

		return this.fromArray( m.elements, index * 4 );

	}

	setFromMatrix3Column( m, index ) {

		return this.fromArray( m.elements, index * 3 );

	}

	setFromEuler( e ) {

		this.x = e._x;
		this.y = e._y;
		this.z = e._z;

		return this;

	}

	equals( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	}

	fromArray( array, offset = 0 ) {

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	}

	toArray( array = [], offset = 0 ) {

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	}

	fromBufferAttribute( attribute, index ) {

		this.x = attribute.getX( index );
		this.y = attribute.getY( index );
		this.z = attribute.getZ( index );

		return this;

	}

	random() {

		this.x = Math.random();
		this.y = Math.random();
		this.z = Math.random();

		return this;

	}

	randomDirection() {

		// Derived from https://mathworld.wolfram.com/SpherePointPicking.html

		const u = ( Math.random() - 0.5 ) * 2;
		const t = Math.random() * Math.PI * 2;
		const f = Math.sqrt( 1 - u ** 2 );

		this.x = f * Math.cos( t );
		this.y = f * Math.sin( t );
		this.z = u;

		return this;

	}

	*[ Symbol.iterator ]() {

		yield this.x;
		yield this.y;
		yield this.z;

	}

}

const _vector$c = /*@__PURE__*/ new Vector3();
const _quaternion$4 = /*@__PURE__*/ new Quaternion();

if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

	__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'register', { detail: {
		revision: REVISION,
	} } ) );

}

if ( typeof window !== 'undefined' ) {

	if ( window.__THREE__ ) {

		console.warn( 'WARNING: Multiple instances of Three.js being imported.' );

	} else {

		window.__THREE__ = REVISION;

	}

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


const Colors = /*#__PURE__*/utils.toEnum( {
    Black:                /*#__PURE__*/new Color( '#000000' ),
    Navy:                 /*#__PURE__*/new Color( '#000080' ),
    DarkBlue:             /*#__PURE__*/new Color( '#00008b' ),
    MediumBlue:           /*#__PURE__*/new Color( '#0000cd' ),
    Blue:                 /*#__PURE__*/new Color( '#0000ff' ),
    DarkGreen:            /*#__PURE__*/new Color( '#006400' ),
    Green:                /*#__PURE__*/new Color( '#008000' ),
    Teal:                 /*#__PURE__*/new Color( '#008080' ),
    DarkCyan:             /*#__PURE__*/new Color( '#008b8b' ),
    DeepSkyBlue:          /*#__PURE__*/new Color( '#00bfff' ),
    DarkTurquoise:        /*#__PURE__*/new Color( '#00ced1' ),
    MediumSpringGreen:    /*#__PURE__*/new Color( '#00fa9a' ),
    Lime:                 /*#__PURE__*/new Color( '#00ff00' ),
    SpringGreen:          /*#__PURE__*/new Color( '#00ff7f' ),
    Aqua:                 /*#__PURE__*/new Color( '#00ffff' ),
    Cyan:                 /*#__PURE__*/new Color( '#00ffff' ),
    MidnightBlue:         /*#__PURE__*/new Color( '#191970' ),
    DodgerBlue:           /*#__PURE__*/new Color( '#1e90ff' ),
    LightSeaGreen:        /*#__PURE__*/new Color( '#20b2aa' ),
    ForestGreen:          /*#__PURE__*/new Color( '#228b22' ),
    SeaGreen:             /*#__PURE__*/new Color( '#2e8b57' ),
    DarkSlateGray:        /*#__PURE__*/new Color( '#2f4f4f' ),
    DarkSlateGrey:        /*#__PURE__*/new Color( '#2f4f4f' ),
    LimeGreen:            /*#__PURE__*/new Color( '#32cd32' ),
    MediumSeaGreen:       /*#__PURE__*/new Color( '#3cb371' ),
    Turquoise:            /*#__PURE__*/new Color( '#40e0d0' ),
    RoyalBlue:            /*#__PURE__*/new Color( '#4169e1' ),
    SteelBlue:            /*#__PURE__*/new Color( '#4682b4' ),
    DarkSlateBlue:        /*#__PURE__*/new Color( '#483d8b' ),
    MediumTurquoise:      /*#__PURE__*/new Color( '#48d1cc' ),
    Indigo:               /*#__PURE__*/new Color( '#4b0082' ),
    DarkOliveGreen:       /*#__PURE__*/new Color( '#556b2f' ),
    CadetBlue:            /*#__PURE__*/new Color( '#5f9ea0' ),
    CornflowerBlue:       /*#__PURE__*/new Color( '#6495ed' ),
    RebeccaPurple:        /*#__PURE__*/new Color( '#663399' ),
    MediumAquaMarine:     /*#__PURE__*/new Color( '#66cdaa' ),
    DimGray:              /*#__PURE__*/new Color( '#696969' ),
    DimGrey:              /*#__PURE__*/new Color( '#696969' ),
    SlateBlue:            /*#__PURE__*/new Color( '#6a5acd' ),
    OliveDrab:            /*#__PURE__*/new Color( '#6b8e23' ),
    SlateGray:            /*#__PURE__*/new Color( '#708090' ),
    SlateGrey:            /*#__PURE__*/new Color( '#708090' ),
    LightSlateGray:       /*#__PURE__*/new Color( '#778899' ),
    LightSlateGrey:       /*#__PURE__*/new Color( '#778899' ),
    MediumSlateBlue:      /*#__PURE__*/new Color( '#7b68ee' ),
    LawnGreen:            /*#__PURE__*/new Color( '#7cfc00' ),
    Chartreuse:           /*#__PURE__*/new Color( '#7fff00' ),
    Aquamarine:           /*#__PURE__*/new Color( '#7fffd4' ),
    Maroon:               /*#__PURE__*/new Color( '#800000' ),
    Purple:               /*#__PURE__*/new Color( '#800080' ),
    Olive:                /*#__PURE__*/new Color( '#808000' ),
    Gray:                 /*#__PURE__*/new Color( '#808080' ),
    Grey:                 /*#__PURE__*/new Color( '#808080' ),
    SkyBlue:              /*#__PURE__*/new Color( '#87ceeb' ),
    LightSkyBlue:         /*#__PURE__*/new Color( '#87cefa' ),
    BlueViolet:           /*#__PURE__*/new Color( '#8a2be2' ),
    DarkRed:              /*#__PURE__*/new Color( '#8b0000' ),
    DarkMagenta:          /*#__PURE__*/new Color( '#8b008b' ),
    SaddleBrown:          /*#__PURE__*/new Color( '#8b4513' ),
    DarkSeaGreen:         /*#__PURE__*/new Color( '#8fbc8f' ),
    LightGreen:           /*#__PURE__*/new Color( '#90ee90' ),
    MediumPurple:         /*#__PURE__*/new Color( '#9370db' ),
    DarkViolet:           /*#__PURE__*/new Color( '#9400d3' ),
    PaleGreen:            /*#__PURE__*/new Color( '#98fb98' ),
    DarkOrchid:           /*#__PURE__*/new Color( '#9932cc' ),
    YellowGreen:          /*#__PURE__*/new Color( '#9acd32' ),
    Sienna:               /*#__PURE__*/new Color( '#a0522d' ),
    Brown:                /*#__PURE__*/new Color( '#a52a2a' ),
    DarkGray:             /*#__PURE__*/new Color( '#a9a9a9' ),
    DarkGrey:             /*#__PURE__*/new Color( '#a9a9a9' ),
    LightBlue:            /*#__PURE__*/new Color( '#add8e6' ),
    GreenYellow:          /*#__PURE__*/new Color( '#adff2f' ),
    PaleTurquoise:        /*#__PURE__*/new Color( '#afeeee' ),
    LightSteelBlue:       /*#__PURE__*/new Color( '#b0c4de' ),
    PowderBlue:           /*#__PURE__*/new Color( '#b0e0e6' ),
    FireBrick:            /*#__PURE__*/new Color( '#b22222' ),
    DarkGoldenRod:        /*#__PURE__*/new Color( '#b8860b' ),
    MediumOrchid:         /*#__PURE__*/new Color( '#ba55d3' ),
    RosyBrown:            /*#__PURE__*/new Color( '#bc8f8f' ),
    DarkKhaki:            /*#__PURE__*/new Color( '#bdb76b' ),
    Silver:               /*#__PURE__*/new Color( '#c0c0c0' ),
    MediumVioletRed:      /*#__PURE__*/new Color( '#c71585' ),
    IndianRed:            /*#__PURE__*/new Color( '#cd5c5c' ),
    Peru:                 /*#__PURE__*/new Color( '#cd853f' ),
    Chocolate:            /*#__PURE__*/new Color( '#d2691e' ),
    Tan:                  /*#__PURE__*/new Color( '#d2b48c' ),
    LightGray:            /*#__PURE__*/new Color( '#d3d3d3' ),
    LightGrey:            /*#__PURE__*/new Color( '#d3d3d3' ),
    Thistle:              /*#__PURE__*/new Color( '#d8bfd8' ),
    Orchid:               /*#__PURE__*/new Color( '#da70d6' ),
    GoldenRod:            /*#__PURE__*/new Color( '#daa520' ),
    PaleVioletRed:        /*#__PURE__*/new Color( '#db7093' ),
    Crimson:              /*#__PURE__*/new Color( '#dc143c' ),
    Gainsboro:            /*#__PURE__*/new Color( '#dcdcdc' ),
    Plum:                 /*#__PURE__*/new Color( '#dda0dd' ),
    BurlyWood:            /*#__PURE__*/new Color( '#deb887' ),
    LightCyan:            /*#__PURE__*/new Color( '#e0ffff' ),
    Lavender:             /*#__PURE__*/new Color( '#e6e6fa' ),
    DarkSalmon:           /*#__PURE__*/new Color( '#e9967a' ),
    Violet:               /*#__PURE__*/new Color( '#ee82ee' ),
    PaleGoldenRod:        /*#__PURE__*/new Color( '#eee8aa' ),
    LightCoral:           /*#__PURE__*/new Color( '#f08080' ),
    Khaki:                /*#__PURE__*/new Color( '#f0e68c' ),
    AliceBlue:            /*#__PURE__*/new Color( '#f0f8ff' ),
    HoneyDew:             /*#__PURE__*/new Color( '#f0fff0' ),
    Azure:                /*#__PURE__*/new Color( '#f0ffff' ),
    SandyBrown:           /*#__PURE__*/new Color( '#f4a460' ),
    Wheat:                /*#__PURE__*/new Color( '#f5deb3' ),
    Beige:                /*#__PURE__*/new Color( '#f5f5dc' ),
    WhiteSmoke:           /*#__PURE__*/new Color( '#f5f5f5' ),
    MintCream:            /*#__PURE__*/new Color( '#f5fffa' ),
    GhostWhite:           /*#__PURE__*/new Color( '#f8f8ff' ),
    Salmon:               /*#__PURE__*/new Color( '#fa8072' ),
    AntiqueWhite:         /*#__PURE__*/new Color( '#faebd7' ),
    Linen:                /*#__PURE__*/new Color( '#faf0e6' ),
    LightGoldenRodYellow: /*#__PURE__*/new Color( '#fafad2' ),
    OldLace:              /*#__PURE__*/new Color( '#fdf5e6' ),
    Red:                  /*#__PURE__*/new Color( '#ff0000' ),
    Fuchsia:              /*#__PURE__*/new Color( '#ff00ff' ),
    Magenta:              /*#__PURE__*/new Color( '#ff00ff' ),
    DeepPink:             /*#__PURE__*/new Color( '#ff1493' ),
    OrangeRed:            /*#__PURE__*/new Color( '#ff4500' ),
    Tomato:               /*#__PURE__*/new Color( '#ff6347' ),
    HotPink:              /*#__PURE__*/new Color( '#ff69b4' ),
    Coral:                /*#__PURE__*/new Color( '#ff7f50' ),
    DarkOrange:           /*#__PURE__*/new Color( '#ff8c00' ),
    LightSalmon:          /*#__PURE__*/new Color( '#ffa07a' ),
    Orange:               /*#__PURE__*/new Color( '#ffa500' ),
    LightPink:            /*#__PURE__*/new Color( '#ffb6c1' ),
    Pink:                 /*#__PURE__*/new Color( '#ffc0cb' ),
    Gold:                 /*#__PURE__*/new Color( '#ffd700' ),
    PeachPuff:            /*#__PURE__*/new Color( '#ffdab9' ),
    NavajoWhite:          /*#__PURE__*/new Color( '#ffdead' ),
    Moccasin:             /*#__PURE__*/new Color( '#ffe4b5' ),
    Bisque:               /*#__PURE__*/new Color( '#ffe4c4' ),
    MistyRose:            /*#__PURE__*/new Color( '#ffe4e1' ),
    BlanchedAlmond:       /*#__PURE__*/new Color( '#ffebcd' ),
    PapayaWhip:           /*#__PURE__*/new Color( '#ffefd5' ),
    LavenderBlush:        /*#__PURE__*/new Color( '#fff0f5' ),
    SeaShell:             /*#__PURE__*/new Color( '#fff5ee' ),
    Cornsilk:             /*#__PURE__*/new Color( '#fff8dc' ),
    LemonChiffon:         /*#__PURE__*/new Color( '#fffacd' ),
    FloralWhite:          /*#__PURE__*/new Color( '#fffaf0' ),
    Snow:                 /*#__PURE__*/new Color( '#fffafa' ),
    Yellow:               /*#__PURE__*/new Color( '#ffff00' ),
    LightYellow:          /*#__PURE__*/new Color( '#ffffe0' ),
    Ivory:                /*#__PURE__*/new Color( '#fffff0' ),
    White:                /*#__PURE__*/new Color( '#ffffff' )
} );

class ColorPalette {

    constructor( palette ) {
        if ( palette.default ) {
            this.default.set( palette.default );
        } else {
            this.default.set( Colors.Fuchsia );
        }

        if ( palette.intersected ) {
            this.intersected.set( palette.intersected );
        } else {
            this.default.set( Colors.PeachPuff );
        }

        if ( palette.selected ) {
            this.selected.set( palette.selected );
        } else {
            this.default.set( Colors.DarkOrange );
        }

        if ( palette.active ) {
            this.active.set( palette.active );
        } else {
            this.default.set( Colors.YellowGreen );
        }

        if ( palette.inactive ) {
            this.inactive.set( palette.inactive );
        } else {
            this.default.set( Colors.LightCyan );
        }

        if ( palette.enabled ) {
            this.enabled.set( palette.enabled );
        } else {
            this.default.set( Colors.Lavender );
        }

        if ( palette.disabled ) {
            this.disabled.set( palette.disabled );
        } else {
            this.default.set( Colors.Grey );
        }
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//[x:LEFT-RIGHT][y:DOWN-UP][z:BACK-FRONT]
const Left_Down_Back   = /*#__PURE__*/new Vector3( -1, -1, -1 ).normalize();
const Left_Down        = /*#__PURE__*/new Vector3( -1, -1, 0 ).normalize();
const Left_Down_Front  = /*#__PURE__*/new Vector3( -1, -1, 1 ).normalize();
const Left_Back        = /*#__PURE__*/new Vector3( -1, 0, -1 ).normalize();
const Left             = /*#__PURE__*/new Vector3( -1, 0, 0 ).normalize();
const Left_Front       = /*#__PURE__*/new Vector3( -1, 0, 1 ).normalize();
const Left_Up_Back     = /*#__PURE__*/new Vector3( -1, 1, -1 ).normalize();
const Left_Up          = /*#__PURE__*/new Vector3( -1, 1, 0 ).normalize();
const Left_Up_Front    = /*#__PURE__*/new Vector3( -1, 1, 1 ).normalize();
const Down_Back        = /*#__PURE__*/new Vector3( 0, -1, -1 ).normalize();
const Down             = /*#__PURE__*/new Vector3( 0, -1, 0 ).normalize();
const Down_Front       = /*#__PURE__*/new Vector3( 0, -1, 1 ).normalize();
const Back             = /*#__PURE__*/new Vector3( 0, 0, -1 ).normalize();
const Null             = /*#__PURE__*/new Vector3( 0, 0, 0 ).normalize();
const Front            = /*#__PURE__*/new Vector3( 0, 0, 1 ).normalize();
const Up_Back          = /*#__PURE__*/new Vector3( 0, 1, -1 ).normalize();
const Up               = /*#__PURE__*/new Vector3( 0, 1, 0 ).normalize();
const Up_Front         = /*#__PURE__*/new Vector3( 0, 1, 1 ).normalize();
const Right_Down_Back  = /*#__PURE__*/new Vector3( 1, -1, -1 ).normalize();
const Right_Down       = /*#__PURE__*/new Vector3( 1, -1, 0 ).normalize();
const Right_Down_Front = /*#__PURE__*/new Vector3( 1, -1, 1 ).normalize();
const Right_Back       = /*#__PURE__*/new Vector3( 1, 0, -1 ).normalize();
const Right            = /*#__PURE__*/new Vector3( 1, 0, 0 ).normalize();
const Right_Front      = /*#__PURE__*/new Vector3( 1, 0, 1 ).normalize();
const Right_Up_Back    = /*#__PURE__*/new Vector3( 1, 1, -1 ).normalize();
const Right_Up         = /*#__PURE__*/new Vector3( 1, 1, 0 ).normalize();
const Right_Up_Front   = /*#__PURE__*/new Vector3( 1, 1, 1 ).normalize();

/*


 -Z              nnw N nne
 /|\            NW   |   NE
 |          wnw  \  |  /  ene
 |          W ------x------ E
 |          wsw  /  |  \  ese
 |             SW   |   SE
 |              ssw S sse
 |
 _|_________________________________\ +X
 |                                 /

 */
const Cardinales = {
    North:            Back,
    North_North_East: /*#__PURE__*/new Vector3( core.OneHalf, 0, -( core.SquareRootOfThreeOnTwo ) ).normalize(),
    North_East:       /*#__PURE__*/new Vector3( core.SquareRootOfTwoOnTwo, 0, -( core.SquareRootOfTwoOnTwo ) ).normalize(),
    East_North_East:  /*#__PURE__*/new Vector3( core.SquareRootOfThreeOnTwo, 0, -( core.OneHalf ) ).normalize(),
    East:             Right,
    East_South_East:  /*#__PURE__*/new Vector3( core.SquareRootOfThreeOnTwo, 0, -( -core.OneHalf ) ).normalize(),
    South_East:       /*#__PURE__*/new Vector3( core.SquareRootOfTwoOnTwo, 0, -( -core.SquareRootOfTwoOnTwo ) ).normalize(),
    South_South_East: /*#__PURE__*/new Vector3( core.OneHalf, 0, -( -core.SquareRootOfThreeOnTwo ) ).normalize(),
    South:            Front,
    South_South_West: /*#__PURE__*/new Vector3( -core.OneHalf, 0, -( -core.SquareRootOfThreeOnTwo ) ).normalize(),
    South_West:       /*#__PURE__*/new Vector3( -core.SquareRootOfTwoOnTwo, 0, -( -core.SquareRootOfTwoOnTwo ) ).normalize(),
    West_South_West:  /*#__PURE__*/new Vector3( -core.SquareRootOfThreeOnTwo, 0, -( -core.OneHalf ) ).normalize(),
    West:             Left,
    West_North_West:  /*#__PURE__*/new Vector3( -core.SquareRootOfThreeOnTwo, 0, -( core.OneHalf ) ).normalize(),
    North_West:       /*#__PURE__*/new Vector3( -core.SquareRootOfTwoOnTwo, 0, -( core.SquareRootOfTwoOnTwo ) ).normalize(),
    North_North_West: /*#__PURE__*/new Vector3( -core.OneHalf, 0, -( core.SquareRootOfThreeOnTwo ) ).normalize()
};

const Directions = {
    Left_Down_Back,
    Left_Down,
    Left_Down_Front,
    Left_Back,
    Left,
    Left_Front,
    Left_Up_Back,
    Left_Up,
    Left_Up_Front,
    Down_Back,
    Down,
    Down_Front,
    Back,
    Null,
    Front,
    Up_Back,
    Up,
    Up_Front,
    Right_Down_Back,
    Right_Down,
    Right_Down_Front,
    Right_Back,
    Right,
    Right_Front,
    Right_Up_Back,
    Right_Up,
    Right_Up_Front,

    Cardinales
};

/**
 * @module Loader/ASCLoader
 * @desc A loader for ASC cloud point files.
 *
 * @requires {@link https://github.com/Itee/@itee/client @itee/client}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example
 *
 * import { ASCLoader } from '@itee/plugin-three'
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
    constructor( manager = threeFull.DefaultLoadingManager, logger = core.DefaultLogger ) {

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
    load( url, onLoad, onProgress, onError, sampling ) {

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
    setOffset( offset ) {

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
    _parse( blob, groupToFeed, onLoad, onProgress, onError, sampling ) {

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

        function seek() {

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
    _parseLine( line ) {

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
    _parseLines( lines ) {

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
    _parseLinesAsXYZ( lines ) {

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
    _parseLinesAsXYZI( lines ) {

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
    _parseLinesAsXYZRGB( lines ) {

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
    _parseLinesAsXYZnXnYnZ( lines ) {

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
    _parseLinesAsXYZIRGB( lines ) {

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
    _parseLinesAsXYZInXnYnZ( lines ) {

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
    _parseLinesAsXYZRGBnXnYnZ( lines ) {

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
    _parseLinesAsXYZIRGBnXnYnZ( lines ) {

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
    _parseLineB( line ) {

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
    _parseLineC( line ) {

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
    _offsetPoints() {

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
    _createCloudPoint( groupToFeed ) {

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
    _createSubCloudPoint( group ) {

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
 * @requires {@link https://github.com/Itee/@itee/client @itee/client}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example
 *
 * import { LASLoader } from '@itee/plugin-three'
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

const NullCharRegex = /*#__PURE__*/new RegExp( '\0', 'g' ); // eslint-disable-line no-control-regex

const PointClasses = /*#__PURE__*/utils.toEnum( {
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
    constructor( manager = threeFull.DefaultLoadingManager, logger = core.DefaultLogger ) {

        this.manager = manager;
        this.logger  = logger;

        this._reader         = new client.TBinaryReader();
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
    load( url, onLoad, onProgress, onError, sampling ) {

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
    setOffset( offset ) {

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
    parse( arraybuffer, onLoad, onProgress, onError ) {

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
            Reserved:                      this._reader.skipOffsetOf( client.Byte.Four ),
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
            Reserved:                      this._reader.skipOffsetOf( client.Byte.Two ) && null,
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
                console.error( 'Unable to determine LASF_Projection underlying type ! Skip current record.' );
                this._reader.skipOffsetOf( recordLength );
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

    _parseGeoDoubleParamsTag( recordLength ) {

        const numberOfEntries = recordLength / client.Byte.Height;
        const params          = [];

        for ( let i = 0 ; i < numberOfEntries ; i++ ) {
            params[ i ] = this._reader.getFloat64();
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

        const records = [];

        for ( let i = 0 ; i < 256 ; i++ ) {
            records.push( {
                ClassNumber: this._reader.getUint8(),
                Description: this._reader.getString( 15 ).replace( NullCharRegex, '' )
            } );
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

        const record = new Uint8Array( recordLength );

        for ( let i = 0 ; i < recordLength ; i++ ) {
            record[ i ] = this._reader.getUint8();
        }

        return record

    }

    // PointDataRecords

    _parsePointDataRecords( header, onProgress ) {

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
    _offsetPoints() {

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
    _createSubCloudPoint( group ) {

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

    constructor( size, bits ) {
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
    // Calculate the intersection of two bits
    static _intersect( bit1, bit2 ) {
        return bit1 === BitArray._ON && bit2 === BitArray._ON ? BitArray._ON : BitArray._OFF
    }
    // Calculate the union of two bits
    static _union( bit1, bit2 ) {
        return bit1 === BitArray._ON || bit2 === BitArray._ON ? BitArray._ON : BitArray._OFF
    }
    // Calculate the difference of two bits
    static _difference( bit1, bit2 ) {
        return bit1 === BitArray._ON && bit2 !== BitArray._ON ? BitArray._ON : BitArray._OFF
    }
    // Get the longest or shortest (smallest) length of the two bit arrays
    static _getLen( bitArray1, bitArray2, smallest ) {
        var l1 = bitArray1.getLength();
        var l2 = bitArray2.getLength();

        return l1 > l2 ? smallest ? l2 : l1 : smallest ? l2 : l1
    }
    /* PUBLIC STATIC METHODS */
    static getUnion( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._union( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }
    static getIntersection( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._intersect( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }
    static getDifference( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._difference( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }
    static shred( number ) {
        var bits = new Array();
        var q    = number;
        do {
            bits.push( q % 2 );
            q = Math.floor( q / 2 );
        } while ( q > 0 )
        return new BitArray( bits.length, bits.reverse() )
    }
    getLength() {
        return this.m_bits.length
    }

    getAt( index ) {
        if ( index < this.m_bits.length ) {
            return this.m_bits[ index ]
        }
        return null
    }

    setAt( index, value ) {
        if ( index < this.m_bits.length ) {
            this.m_bits[ index ] = value ? BitArray._ON : BitArray._OFF;
        }
    }

    resize( newSize ) {
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

    getCompliment() {
        var result = new BitArray( this.m_bits.length );
        for ( var i = 0 ; i < this.m_bits.length ; i++ ) {
            result.setAt( i, this.m_bits[ i ] ? BitArray._OFF : BitArray._ON );
        }
        return result
    }

    toString() {
        var s = new String();
        for ( var i = 0 ; i < this.m_bits.length ; i++ ) {
            s = s.concat( this.m_bits[ i ] === BitArray._ON ? '1' : '0' );
        }
        return s
    }

    toNumber() {
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

    static getBit( bitField, bitPosition ) {
        return ( bitField & ( 1 << bitPosition ) ) === 0 ? 0 : 1
    }

    static setBit( bitField, bitPosition ) {
        return bitField | ( 1 << bitPosition )
    }

    static clearBit( bitField, bitPosition ) {
        const mask = ~( 1 << bitPosition );
        return bitField & mask
    }

    static updateBit( bitField, bitPosition, bitValue ) {
        const bitValueNormalized = bitValue ? 1 : 0;
        const clearMask          = ~( 1 << bitPosition );
        return ( bitField & clearMask ) | ( bitValueNormalized << bitPosition )
    }

    static getBits( bitField, bitPositions ) {
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
exports.ColorPalette = ColorPalette;
exports.Colors = Colors;
exports.DBFLoader = DBFLoader;
exports.Directions = Directions;
exports.LASLoader = LASLoader;
exports.PointClasses = PointClasses;
exports.SHPLoader = SHPLoader;
exports.ShapeType = ShapeType;
exports.registerPlugin = registerPlugin;
//# sourceMappingURL=plugin-three.cjs.map
