/**
 * ┳      ┏┓┓    •   ┏┳┓┓           ┓ ━┓ ┏┓      ┏┓ ┳┳┓   ┓  ┓  
 * ┃╋┏┓┏┓ ┃┃┃┓┏┏┓┓┏┓  ┃ ┣┓┏┓┏┓┏┓  ┓┏┃  ┃ ┃┫  ━━  ┣ ┏┃┃┃┏┓┏┫┓┏┃┏┓
 * ┻┗┗ ┗ •┣┛┗┗┻┗┫┗┛┗• ┻ ┛┗┛ ┗ ┗   ┗┛┻• ╹•┗┛      ┗┛┛┛ ┗┗┛┗┻┗┻┗┗ 
 *              ┛                                               
 * @desc    This itee plugin allow to use three js content from end to end in an itee client-server-database architecture
 * @author  [Itee (Tristan Valcke)]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses}
 * 
 */
import { TAbstractFileConverter, TAbstractDataInserter, TAbstractConverterManager } from 'itee-database';
import { TMongooseController, TMongoDBPlugin } from 'itee-mongodb';
import require$$0$3, { isNotDefined, isDefined, isArray, isEmptyArray, isNull, isNotObject, isNotNumber, isNotString, isNotArray, isNaN as isNaN$1, isUndefined, isNotBoolean, isObject, isEmptyString, isBlankString, isString, isNotEmptyString, isNotEmptyArray } from 'itee-validators';
import { ColladaLoader, DefaultLoadingManager, FileLoader, FBXLoader, ObjectLoader, MTLLoader, OBJLoader2, Vector3 as Vector3$1, Shape as Shape$1, STLLoader, TDSLoader, Box3 as Box3$1, Group as Group$1, BufferGeometry as BufferGeometry$2, BufferAttribute as BufferAttribute$1, PointsMaterial as PointsMaterial$1, Points as Points$1, EventDispatcher, Object3D as Object3D$2, Vector2, Spherical as Spherical$1, LineBasicMaterial as LineBasicMaterial$1, MeshBasicMaterial as MeshBasicMaterial$1, DoubleSide, Mesh as Mesh$1, OctahedronBufferGeometry as OctahedronBufferGeometry$1, Quaternion as Quaternion$1, EdgesGeometry as EdgesGeometry$1, LineSegments as LineSegments$1, Float32BufferAttribute, Line as Line$1, ArrowHelper as ArrowHelper$1, CylinderBufferGeometry as CylinderBufferGeometry$1, BoxBufferGeometry as BoxBufferGeometry$1, PlaneBufferGeometry as PlaneBufferGeometry$1, ConeBufferGeometry as ConeBufferGeometry$1, Plane as Plane$1, Raycaster, Euler, SplineCurve as SplineCurve$1, QuadraticBezierCurve3 as QuadraticBezierCurve3$1, QuadraticBezierCurve as QuadraticBezierCurve$1, Path as Path$1, LineCurve3 as LineCurve3$1, LineCurve as LineCurve$1, EllipseCurve as EllipseCurve$1, CurvePath as CurvePath$1, Curve as Curve$1, CubicBezierCurve3 as CubicBezierCurve3$1, CubicBezierCurve as CubicBezierCurve$1, CatmullRomCurve3 as CatmullRomCurve3$1, ArcCurve as ArcCurve$1, WireframeGeometry as WireframeGeometry$1, SphereGeometry as SphereGeometry$1, TubeGeometry as TubeGeometry$1, TorusKnotGeometry as TorusKnotGeometry$1, TorusGeometry as TorusGeometry$1, TextGeometry as TextGeometry$1, TetrahedronGeometry as TetrahedronGeometry$1, ShapeGeometry as ShapeGeometry$1, RingGeometry as RingGeometry$1, PolyhedronGeometry as PolyhedronGeometry$1, PlaneGeometry as PlaneGeometry$1, ParametricGeometry as ParametricGeometry$1, OctahedronGeometry as OctahedronGeometry$1, LatheGeometry as LatheGeometry$1, IcosahedronGeometry as IcosahedronGeometry$1, Geometry as Geometry$2, ExtrudeGeometry as ExtrudeGeometry$1, DodecahedronGeometry as DodecahedronGeometry$1, ConeGeometry as ConeGeometry$1, CylinderGeometry as CylinderGeometry$1, CircleGeometry as CircleGeometry$1, BoxGeometry as BoxGeometry$1, Face3 as Face3$1, InstancedBufferGeometry as InstancedBufferGeometry$1, SphereBufferGeometry as SphereBufferGeometry$1, TubeBufferGeometry as TubeBufferGeometry$1, TorusKnotBufferGeometry as TorusKnotBufferGeometry$1, TorusBufferGeometry as TorusBufferGeometry$1, TextBufferGeometry as TextBufferGeometry$1, TetrahedronBufferGeometry as TetrahedronBufferGeometry$1, RingBufferGeometry as RingBufferGeometry$1, PolyhedronBufferGeometry as PolyhedronBufferGeometry$1, ParametricBufferGeometry as ParametricBufferGeometry$1, LatheBufferGeometry as LatheBufferGeometry$1, IcosahedronBufferGeometry as IcosahedronBufferGeometry$1, ExtrudeBufferGeometry as ExtrudeBufferGeometry$1, DodecahedronBufferGeometry, CircleBufferGeometry as CircleBufferGeometry$1, TextureLoader, MeshLambertMaterial as MeshLambertMaterial$1, MeshPhongMaterial as MeshPhongMaterial$1, Color as Color$1, LinearFilter, ImageLoader, Sprite as Sprite$1, LineLoop as LineLoop$1, LOD as LOD$1, SkinnedMesh as SkinnedMesh$1, HemisphereLight as HemisphereLight$1, SpotLight as SpotLight$1, RectAreaLight as RectAreaLight$1, PointLight as PointLight$1, DirectionalLight as DirectionalLight$1, AmbientLight as AmbientLight$1, OrthographicCamera as OrthographicCamera$1, PerspectiveCamera as PerspectiveCamera$1, Scene as Scene$1, Fog as Fog$1, FogExp2, VertexColors } from 'three-full';
import { TBinaryReader, Endianness, Byte, Keys, Mouse, TDataBaseManager } from 'itee-client';
import { DefaultLogger, OneHalf, SquareRootOfThreeOnTwo, SquareRootOfTwoOnTwo } from 'itee-core';
import { toEnum, ringClockwise, ringContainsSome, toArray, degreesToRadians } from 'itee-utils';
import { createRequire } from 'node:module';
import { BSON_DATA_OBJECT, BSON_DATA_ARRAY } from 'bson';

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @see [IFC Standard]{@link http://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/}
 *
 */


class TObjects3DController extends TMongooseController {

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
        if ( isNotDefined( type ) || isNotDefined( query ) ) { return null }

        const model = await this._driver
                                .model( type )
                                .findOne( query )
                                .exec();

        return ( isDefined( model ) ) ? model._doc : null

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
        if ( isNotDefined( type ) || isNotDefined( query ) ) { return null }

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

        if ( isNotDefined( document ) ) {
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

            if ( isDefined( childId ) ) {
                result.children.push( childId );
            }

            const childGeometry = child.geometry;
            if ( isDefined( childGeometry ) ) {
                result.geometries.push( childGeometry.toString() );
            }

            const childMaterials = child.material;
            if ( childMaterials ) {
                const _materials = isArray( childMaterials ) ? childMaterials.map( mat => mat.toString() ) : [ childMaterials.toString() ];
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

                TMongooseController.returnData( {
                    deletedObjectsCount,
                    deletedGeometriesResult,
                    deletedMaterialsResult
                }, response );

            } else ;

        } catch ( error ) {

            TMongooseController.returnError( error, response );

        }

    }

    async _deleteDocuments( type, documentIds ) {
        if ( isEmptyArray( documentIds ) ) { return 0 }

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
        if ( isNotDefined( document ) ) { return null }

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
        if ( isNotDefined( parentId ) ) { return null }

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
        if ( isNotDefined( geometryId ) ) { return }

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
        if ( isNotDefined( materialsIds ) ) { return }
        if ( isEmptyArray( materialsIds ) ) { return }

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
        if ( isNotDefined( materialId ) ) { return }

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
class ColladaToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.ArrayBuffer
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

            const loader    = new ColladaLoader();
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
const DBFVersion = /*#__PURE__*/toEnum( {
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
const DataType = /*#__PURE__*/toEnum( {
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
                manager: DefaultLoadingManager,
                logger:  DefaultLogger,
                reader:  new TBinaryReader()
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

        const loader = new FileLoader( scope.manager );
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
            .setEndianess( Endianness.Big )
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

        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
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
        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
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
        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
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
class DbfToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( { dumpType: TAbstractFileConverter.DumpType.ArrayBuffer } );
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
class FbxToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.ArrayBuffer
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

            const loader    = new FBXLoader();
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
class JsonToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.JSON
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

            const loader    = new ObjectLoader();
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
class MtlToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.String
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

            const loader    = new MTLLoader();
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
class Obj2ToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.JSON
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

            const loader    = new OBJLoader2();
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
const ShapeType = /*#__PURE__*/toEnum( {
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
                manager:      DefaultLoadingManager,
                logger:       DefaultLogger,
                reader:       new TBinaryReader(),
                globalOffset: new Vector3$1( 0, 0, 0 ),
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

        const loader = new FileLoader( scope.manager );
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
            .setEndianess( Endianness.Big )
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

        this._reader.setEndianess( Endianness.Little );

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
            this._reader.setEndianess( Endianness.Little );

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

        this._reader.setEndianess( Endianness.Big );

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

            shapes.push( new Shape$1( points ) );

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
class ShpToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.ArrayBuffer
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
class StlToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.JSON
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

            const loader    = new STLLoader();
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
class TdsToThree extends TAbstractFileConverter {

    /**
     * @constructor
     */
    constructor() {
        super( {
            dumpType: TAbstractFileConverter.DumpType.ArrayBuffer
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

            const loader    = new TDSLoader();
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
class ThreeToMongoDB extends TAbstractDataInserter {

    /**
     * @constructor
     * @param {Object} [parameters={}] - An object containing all parameters to pass through the inheritance chain and for initialize this instance
     * @param {TLogger} [parameters.logger=Itee.Core.DefaultLogger]
     */
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                logger: DefaultLogger
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

        const dataToParse = toArray( data );
        if ( isEmptyArray( dataToParse ) ) {
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
            if ( isDefined( parentId ) ) {

                const parentDocument = await this._readDocument( 'Objects3D', { _id: parentId } );
                if ( isNull( parentDocument ) ) {
                    onError( `Unable to retrieve parent with id (${ parameters.parentId }). Abort insert !` );
                    return
                }

                // then update it
                if ( this.mergeStrategy === 'add' ) {

                    // If parent exist let create children
                    children    = await this._parseObjects( dataToParse, parentId );
                    childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

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
                    childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

                    await this._updateDocument( parentDocument, {
                        $set: {
                            children: childrenIds
                        }
                    } );

                }

            } else {

                // If not required just create children as root objects
                children    = await this._parseObjects( dataToParse, null );
                childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

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

        const _objects = toArray( objects );
        if ( isEmptyArray( _objects ) ) {
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

        if ( isNotDefined( object ) ) {
            return null
        }

        // Preprocess objects here to save geometry, materials and related before to save the object itself
        const objectType      = object.type;
        const objectName      = object.name;
        const objectGeometry  = object.geometry;
        const objectChildren  = toArray( object.children );
        const objectMaterials = toArray( object.material );

        // If it is a terminal object ( No children ) with an empty geometry
        if ( isDefined( objectGeometry ) && isEmptyArray( objectChildren ) ) {

            if ( objectGeometry.isGeometry ) {

                const vertices = objectGeometry.vertices;
                if ( isNotDefined( vertices ) || isEmptyArray( vertices ) ) {
                    this.logger.error( `Leaf object ${ objectName } have a geometry that doesn't contain vertices ! Skip it.` );
                    return null
                }

            } else if ( objectGeometry.isBufferGeometry ) {

                const attributes = objectGeometry.attributes;
                if ( isNotDefined( attributes ) ) {
                    this.logger.error( `Buffer geometry of ${ objectName } doesn't contain attributes ! Skip it.` );
                    return null
                }

                const positions = attributes.position;
                if ( isNotDefined( positions ) || positions.count === 0 ) {
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

            if ( isNotDefined( objectGeometry ) ) {
                this.logger.error( `Missing geometry for object ${ object.name } of type ${ objectType }. Only Sprite can contains material without geometry ! Skip it.` );
                return null
            }

            availableMaterialTypes = ThreeToMongoDB.AvailableLineMaterialTypes;

        } else if ( ThreeToMongoDB.AvailablePointTypes.includes( objectType ) ) {

            if ( isNotDefined( objectGeometry ) ) {
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
        const geometryId = ( isDefined( geometry ) ) ? geometry.filter( geometry => geometry ).map( geometry => geometry._id ).pop() : null;

        const materials    = await this._getOrCreateDocuments( objectMaterials );
        const materialsIds = ( isDefined( materials ) ) ? materials.filter( material => material ).map( material => material._id ) : [];

        // Check if object already exist
        // We could use getOrCreateDocument here only if children/geometry/materials cleanup is perform on schema database side
        let document = await this._readDocument( objectType, {
            uuid:   object.uuid,
            parent: parentId
        } );

        // Todo if document.parent != parentId warn id collision !n m
        if ( isDefined( document ) ) {

            // Check merge strategie
            // If add, only update existing and create new objects
            // else if replace, remove missings children from new data, update existing and create new
            if ( this.mergeStrategy === 'add' ) {

                const children    = await this._parseObjects( objectChildren, document._id );
                const childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

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
                const childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

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
            const childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : [];

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

        const _objects = toArray( objects );
        if ( isEmptyArray( _objects ) ) {
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

        if ( isNotDefined( data ) ) {
            return null
        }

        let document = await this._readDocument( data.type, { uuid: data.uuid } );
        if ( isDefined( document ) ) {
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

        const _datas = toArray( datas );
        if ( isEmptyArray( _datas ) ) {
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

        if ( isNotDefined( data ) ) {
            return null
        }

        const model = await this._driver
                                .model( data.type )( data )
                                .save();

        //        const model         = this._driver.model( data.type )
        //        const savedModel = await model( data ).save()

        const savedDocument = ( isDefined( model ) ) ? model._doc : null;
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

        if ( isNotDefined( type ) || isNotDefined( query ) ) {
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

        if ( isNotDefined( type ) || isNotDefined( query ) ) {
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

        const readDocument = ( isDefined( model ) ) ? model._doc : null;
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

        const _documents = toArray( documents );
        if ( isEmptyArray( _documents ) ) {
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

        if ( isNotDefined( document ) ) {
            return null
        }

        const model = await this._driver
                                .model( document.type )
                                .findByIdAndUpdate( document._id, updateQuery, queryOptions )
                                .exec();

        const updatedDocument = ( isDefined( model ) ) ? model._doc : null;
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

        const _documents = toArray( documents );
        if ( isEmptyArray( _documents ) ) {
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

        if ( isNotDefined( document ) ) {
            return null
        }

        const model = await this._driver
                                .model( document.type )
                                .findByIdAndDelete( document._id )
                                .exec();

        const deletedDocument = ( isDefined( model ) ) ? model._doc : null;
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

        if ( isNotDefined( geometryId ) ) { return }

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

const require$1 = createRequire(import.meta.url);
function __require() { return require$1("node:buffer"); }

/**
 * @module Schemas/Core/BufferAttribute
 * @desc Export the ThreeJs BufferAttribute Model and Schema for Mongoose.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
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
	      } = require$$0$3;
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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isColor ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is not a object or Three.Color instance` ) }

            if ( !( 'r' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain r property` ) }
            if ( isNotNumber( value.r ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'g' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain g property` ) }
            if ( isNotNumber( value.g ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'b' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain b property` ) }
            if ( isNotNumber( value.b ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

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
    Color.COLOR_BSON_TYPE = BSON_DATA_OBJECT;

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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isEuler ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } is not a object or Euler instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected x to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected y to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected z to be a number` ) }

            if ( !( 'order' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain order property` ) }
            if ( isNotString( value.order ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected order to be a string` ) }
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
    Euler.EULER_BSON_TYPE = BSON_DATA_OBJECT;

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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } is null or undefined` ) }
            if ( isNotArray( value ) && !value.isMatrix3 ) { throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } is not an array or Matrix3 instance` ) }

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

                if ( isNotNumber( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( isNaN$1( val ) ) {
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
    Matrix3.MATRIX3_BSON_TYPE = BSON_DATA_ARRAY;

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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } is null or undefined` ) }
            if ( isNotArray( value ) && !value.isMatrix4 ) { throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } is not an array or Matrix4 instance` ) }

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

                if ( isNotNumber( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( isNaN$1( val ) ) {
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
    Matrix4.MATRIX4_BSON_TYPE = BSON_DATA_ARRAY;

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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isQuaternion ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } is not a object or Quaternion instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } does not contain w property` ) }
            if ( isNotNumber( value.w ) ) { throw new Mongoose.SchemaType.CastError( `Quaternion: ${ value } expected to be a number` ) }

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
    Quaternion.QUATERNION_BSON_TYPE = BSON_DATA_OBJECT;

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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector2 ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } is not a object or Vector2 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector2: ${ value } expected to be a number` ) }

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
    Vector2.VECTOR2_BSON_TYPE = BSON_DATA_OBJECT;

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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector3 ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } is not a object or Vector3 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

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
    Vector3.VECTOR3_BSON_TYPE = BSON_DATA_OBJECT;

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

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector4 ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } is not a object or Vector4 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain w property` ) }
            if ( isNotNumber( value.w ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

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
    Vector4.VECTOR4_BSON_TYPE = BSON_DATA_OBJECT;

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
        .addController( TMongooseController )
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


const Colors = /*#__PURE__*/toEnum( {
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
    North_North_East: /*#__PURE__*/new Vector3( OneHalf, 0, -( SquareRootOfThreeOnTwo ) ).normalize(),
    North_East:       /*#__PURE__*/new Vector3( SquareRootOfTwoOnTwo, 0, -( SquareRootOfTwoOnTwo ) ).normalize(),
    East_North_East:  /*#__PURE__*/new Vector3( SquareRootOfThreeOnTwo, 0, -( OneHalf ) ).normalize(),
    East:             Right,
    East_South_East:  /*#__PURE__*/new Vector3( SquareRootOfThreeOnTwo, 0, -( -OneHalf ) ).normalize(),
    South_East:       /*#__PURE__*/new Vector3( SquareRootOfTwoOnTwo, 0, -( -SquareRootOfTwoOnTwo ) ).normalize(),
    South_South_East: /*#__PURE__*/new Vector3( OneHalf, 0, -( -SquareRootOfThreeOnTwo ) ).normalize(),
    South:            Front,
    South_South_West: /*#__PURE__*/new Vector3( -OneHalf, 0, -( -SquareRootOfThreeOnTwo ) ).normalize(),
    South_West:       /*#__PURE__*/new Vector3( -SquareRootOfTwoOnTwo, 0, -( -SquareRootOfTwoOnTwo ) ).normalize(),
    West_South_West:  /*#__PURE__*/new Vector3( -SquareRootOfThreeOnTwo, 0, -( -OneHalf ) ).normalize(),
    West:             Left,
    West_North_West:  /*#__PURE__*/new Vector3( -SquareRootOfThreeOnTwo, 0, -( OneHalf ) ).normalize(),
    North_West:       /*#__PURE__*/new Vector3( -SquareRootOfTwoOnTwo, 0, -( SquareRootOfTwoOnTwo ) ).normalize(),
    North_North_West: /*#__PURE__*/new Vector3( -OneHalf, 0, -( SquareRootOfThreeOnTwo ) ).normalize()
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
    constructor( manager = DefaultLoadingManager, logger = DefaultLogger ) {

        this.manager = manager;
        this.logger  = logger;

        this._boundingBox    = new Box3$1();
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

        const loader = new FileLoader( this.manager );
        loader.setResponseType( 'blob' );
        loader.load( url, function ( blob ) {

            const groupToFeed = new Group$1();
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

            const geometry  = new BufferGeometry$2();
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

            geometry.setAttribute( 'position', new BufferAttribute$1( positions, 3 ) );
            geometry.setAttribute( 'color', new BufferAttribute$1( colors, 3 ) );

            const material = new PointsMaterial$1( {
                size:         0.01,
                vertexColors: true
            } );

            cloud = new Points$1( geometry, material );
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
        const geometry       = new BufferGeometry$2();
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

        geometry.setAttribute( 'position', new BufferAttribute$1( positions, 3 ) );
        geometry.setAttribute( 'color', new BufferAttribute$1( colors, 3 ) );

        const material = new PointsMaterial$1( {
            size:         0.005,
            vertexColors: true
        } );

        const cloud = new Points$1( geometry, material );

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

const NullCharRegex = /*#__PURE__*/new RegExp( '\0', 'g' ); // eslint-disable-line no-control-regex

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
    constructor( manager = DefaultLoadingManager, logger = DefaultLogger ) {

        this.manager = manager;
        this.logger  = logger;

        this._reader         = new TBinaryReader();
        this._fullVersion    = '';
        this._boundingBox    = new Box3$1();
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

        const loader = new FileLoader( this.manager );
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

        const numberOfEntries = recordLength / Byte.Height;
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

            const pointsGroup            = new Group$1();
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
        const material              = new PointsMaterial$1( {
            size:         0.01,
            vertexColors: true
        } );
        let numberOfPointInSplit    = 0;
        let splice                  = null;
        let cloudPoint              = null;

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = lasDatas.PointDataRecords.splice( 0, SPLIT_LIMIT );
            numberOfPointInSplit = splice.length;
            const geometry       = new BufferGeometry$2();
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
                    if ( isDefined( colorPointClass ) ) {

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

            geometry.setAttribute( 'position', new BufferAttribute$1( positions, 3 ) );
            geometry.setAttribute( 'color', new BufferAttribute$1( colors, 3 ) );

            cloudPoint = new Points$1( geometry, material );
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
        const geometry       = new BufferGeometry$2();
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

        geometry.setAttribute( 'position', new BufferAttribute$1( positions, 3 ) );
        geometry.setAttribute( 'color', new BufferAttribute$1( colors, 3 ) );

        const material = new PointsMaterial$1( {
            size:         0.005,
            vertexColors: true
        } );

        const cloud = new Points$1( geometry, material );

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

/**
 * @module Controllers/CameraControls
 * @desc This module export CameraControls class and CameraControlMode enum values.
 *
 * @requires {@link module: [itee-client]{@link https://github.com/Itee/itee-client}}
 * @requires {@link module: [itee-utils]{@link https://github.com/Itee/itee-utils}}
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [three-full]{@link https://github.com/Itee/three-full}}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example
 *
 * import { CameraControls, CameraControlMode } from 'itee-plugin-three'
 *
 */


const FRONT = /*#__PURE__*/new Vector3$1( 0, 0, -1 );
const BACK  = /*#__PURE__*/new Vector3$1( 0, 0, 1 );
const UP    = /*#__PURE__*/new Vector3$1( 0, 1, 0 );
const DOWN  = /*#__PURE__*/new Vector3$1( 0, -1, 0 );
const RIGHT = /*#__PURE__*/new Vector3$1( 1, 0, 0 );
const LEFT  = /*#__PURE__*/new Vector3$1( -1, 0, 0 );

/**
 * Enum values to define the internal state of CameraControl
 *
 * @type {Enum}
 * @name State
 * @property {number} [None=0] - The default state when nothing happen.
 * @property {number} [Rotating=1] - The state when current action is interpreted as Rotating.
 * @property {number} [Panning=2] - The state when current action is interpreted as Panning.
 * @property {number} [Rolling=3] - The state when current action is interpreted as Rolling.
 * @property {number} [Zooming=4] - The state when current action is interpreted as Zooming.
 * @property {number} [Moving=5] - The state when current action is interpreted as Moving.
 * @constant
 * @private
 */
const State = /*#__PURE__*/toEnum( {
    None:     0,
    Rotating: 1,
    Panning:  2,
    Rolling:  3,
    Zooming:  4,
    Moving:   5
} );

/**
 * Enum values to set the current mode of displacement for Camera.
 *
 * @typedef {Enum} module:Controllers/CameraControls.CameraControlMode
 * @property {number} [FirstPerson=1] - The state when current action is interpreted as Rotating.
 * @property {number} [Orbit=2] - The state when current action is interpreted as Panning.
 * @property {number} [Fly=3] - The state when current action is interpreted as Rolling.
 * @property {number} [Path=4] - The state when current action is interpreted as Zooming.
 * @constant
 * @public
 */
const CameraControlMode = /*#__PURE__*/toEnum( {
    FirstPerson: 1,
    Orbit:       2,
    Fly:         3,
    Path:        4
} );

function isInWorker() {
    return typeof importScripts === 'function'
}

/**
 * @class
 * @classdesc The CameraControls allow to manage all camera type, in all displacement mode.
 * It manage keyboard and mouse binding to different camera actions.
 * @augments EventDispatcher
 */
class CameraControls extends EventDispatcher {

    // Internal events
    /**
     * Move event.
     *
     * @event module:Controllers/CameraControls~CameraControls#move
     * @type {object}
     * @property {String} [type=move] - Indicates the type of fired event
     */

    /**
     * Scale event.
     *
     * @event module:Controllers/CameraControls~CameraControls#scale
     * @type {object}
     * @property {String} [type=scale] - Indicates the type of fired event
     */

    /**
     * Rotate event.
     *
     * @event module:Controllers/CameraControls~CameraControls#rotate
     * @type {object}
     * @property {String} [type=rotate] - Indicates the type of fired event
     */

    /**
     * Change event.
     *
     * @event module:Controllers/CameraControls~CameraControls#change
     * @type {object}
     * @property {String} [type=change] - Indicates the type of fired event
     */

    /**
     * @constructor
     * @param {Object} parameters - A parameters object containing properties initialization
     * @param {THREE~Camera} parameters.camera - The camera to use
     * @param {Object} [parameters.logger=DefaultLogger] - A logger for output
     * @param {THREE~Object3D} [parameters.target=THREE~Object3D] - A target to look, or used as pivot point
     * @param {module:Controllers/CameraControls.CameraControlMode} [parameters.mode=CameraControlMode.Orbit] - The current controller mode
     * @param {Window|HTMLDocument|HTMLDivElement|HTMLCanvasElement} [parameters.domElement=window] - The DOMElement to listen for mouse and keyboard inputs
     */
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                logger:     DefaultLogger,
                camera:     null,
                target:     new Object3D$2(),
                mode:       CameraControlMode.Orbit,
                domElement: ( isInWorker() ) ? null : window
            }, ...parameters
        };

        super();

        // Need to be defined before domElement to make correct binding events
        this._handlers = {
            onMouseEnter:  this._onMouseEnter.bind( this ),
            onMouseLeave:  this._onMouseLeave.bind( this ),
            onMouseDown:   this._onMouseDown.bind( this ),
            onMouseMove:   this._onMouseMove.bind( this ),
            onMouseWheel:  this._onMouseWheel.bind( this ),
            onMouseUp:     this._onMouseUp.bind( this ),
            onDblClick:    this._onDblClick.bind( this ),
            onTouchStart:  this._onTouchStart.bind( this ),
            onTouchEnd:    this._onTouchEnd.bind( this ),
            onTouchCancel: this._onTouchCancel.bind( this ),
            onTouchLeave:  this._onTouchLeave.bind( this ),
            onTouchMove:   this._onTouchMove.bind( this ),
            onKeyDown:     this._onKeyDown.bind( this ),
            onKeyUp:       this._onKeyUp.bind( this )
        };

        this.logger     = _parameters.logger;
        this.camera     = _parameters.camera;
        this.target     = _parameters.target;
        this.mode       = _parameters.mode;
        this.domElement = _parameters.domElement;

        // Set to false to disable controls
        this.enabled = true;

        this._paths               = [];
        this._trackPath           = false;
        this._cameraJump          = 0.1; // = 1 / path.getLength()
        this._currentPathPosition = null;
        this._currentPathOffset   = 0;
        this._currentPathIndex    = 0;
        this._currentPath         = null;
        this._maxJump             = 1.0;

        this._lockedTarget = true;

        // Touches events specific
        this.previousTouches = [];

        // Set to false to disable all/specific displacement
        this.canMove   = true;
        this.moveSpeed = 1.0;

        this.canFront          = true;
        this.frontMinimum      = -Infinity;
        this.frontMaximum      = -Infinity;
        this.frontMinSpeed     = 0.0;
        this.frontSpeed        = 1.0;
        this.frontMaxSpeed     = Infinity;
        this.frontAcceleration = 1.0;

        this.canBack          = true;
        this.backMinimum      = -Infinity;
        this.backMaximum      = -Infinity;
        this.backMinSpeed     = 0.0;
        this.backSpeed        = 1.0;
        this.backMaxSpeed     = Infinity;
        this.backAcceleration = 1.0;

        this.canUp          = true;
        this.upMinimum      = -Infinity;
        this.upMaximum      = -Infinity;
        this.upMinSpeed     = 0.0;
        this.upSpeed        = 1.0;
        this.upMaxSpeed     = Infinity;
        this.upAcceleration = 1.0;

        this.canDown          = true;
        this.downMinimum      = -Infinity;
        this.downMaximum      = -Infinity;
        this.downMinSpeed     = 0.0;
        this.downSpeed        = 1.0;
        this.downMaxSpeed     = Infinity;
        this.downAcceleration = 1.0;

        this.canLeft          = true;
        this.leftMinimum      = -Infinity;
        this.leftMaximum      = -Infinity;
        this.leftMinSpeed     = 0.0;
        this.leftSpeed        = 1.0;
        this.leftMaxSpeed     = Infinity;
        this.leftAcceleration = 1.0;

        this.canRight          = true;
        this.rightMinimum      = -Infinity;
        this.rightMaximum      = -Infinity;
        this.rightMinSpeed     = 0.0;
        this.rightSpeed        = 1.0;
        this.rightMaxSpeed     = Infinity;
        this.rightAcceleration = 1.0;

        this.canRotate = true;

        /**
         * How far you can orbit vertically, upper and lower limits.
         * Range is 0 to Math.PI radians.
         * @type {number}
         */
        this.minPolarAngle = 0.001;

        /**
         * How far you can orbit horizontally, upper and lower limits.
         * If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
         * @type {number}
         */
        this.maxPolarAngle = ( Math.PI - 0.001 );
        this.minAzimuthAngle    = -Infinity;
        this.maxAzimuthAngle    = Infinity;
        this.rotateMinSpeed     = 0.0;
        this.rotateSpeed        = 1.0;
        this.rotateMaxSpeed     = Infinity;
        this.rotateAcceleration = 1.0;

        this.canPan          = true;
        this.panMinimum      = -Infinity;
        this.panMaximum      = -Infinity;
        this.panMinSpeed     = 0.0;
        this.panSpeed        = 0.001;
        this.panMaxSpeed     = Infinity;
        this.panAcceleration = 1.0;

        this.canRoll          = true;
        this.rollMinimum      = -Infinity;
        this.rollMaximum      = -Infinity;
        this.rollMinSpeed     = 0.0;
        this.rollSpeed        = 0.1;
        this.rollMaxSpeed     = Infinity;
        this.rollAcceleration = 1.0;

        this.canZoom          = true;
        this.zoomMinimum      = 0;
        this.zoomMaximum      = Infinity;
        this.zoomMinSpeed     = 0.0;
        this.zoomSpeed        = 0.001;
        this.zoomMaxSpeed     = Infinity;
        this.zoomAcceleration = 1.0;

        this.canLookAt = true;

        // The actions map about input events
        this.actionsMap = {
            front:  [ Keys.Z.value, Keys.UP_ARROW.value ],
            back:   [ Keys.S.value, Keys.DOWN_ARROW.value ],
            up:     [ Keys.A.value, Keys.PAGE_UP.value ],
            down:   [ Keys.E.value, Keys.PAGE_DOWN.value ],
            left:   [ Keys.Q.value, Keys.LEFT_ARROW.value ],
            right:  [ Keys.D.value, Keys.RIGHT_ARROW.value ],
            rotate: [ Mouse.Left.value ],
            pan:    [ Mouse.Middle.value ],
            roll:   {
                left:  [ Keys.R.value ],
                right: [ Keys.T.value ]
            },
            zoom:             [ Mouse.Wheel.value ],
            lookAtFront:      [ Keys.NUMPAD_2.value ],
            lookAtFrontLeft:  [ Keys.NUMPAD_3.value ],
            lookAtFrontRight: [ Keys.NUMPAD_1.value ],
            lookAtBack:       [ Keys.NUMPAD_8.value ],
            lookAtBackLeft:   [ Keys.NUMPAD_9.value ],
            lookAtBackRight:  [ Keys.NUMPAD_7.value ],
            lookAtUp:         [ Keys.NUMPAD_5.value ],
            lookAtDown:       [ Keys.NUMPAD_0.value ],
            lookAtLeft:       [ Keys.NUMPAD_6.value ],
            lookAtRight:      [ Keys.NUMPAD_4.value ]
        };

        // The current internal state of controller
        this._state = State.None;

    }

    /**
     * The camera getter
     * @function module:Controllers/CameraControls~CameraControls#get camera
     * @returns {THREE~Camera}
     */
    get camera() {

        return this._camera

    }

    /**
     * The camera setter
     * @function module:Controllers/CameraControls~CameraControls#set camera
     * @param {THREE~Camera} value
     * @throws Will throw an error if the argument is null.
     */
    set camera( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !value.isCamera ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera.` ) }

        this._camera = value;

    }

    /**
     * The target getter
     * @type {THREE~Object3D}
     * @throws {Error} if the argument is null.
     */
    get target() {

        return this._target

    }

    set target( value ) {

        if ( isNull( value ) ) { throw new Error( 'Target cannot be null ! Expect an instance of Object3D.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Target cannot be undefined ! Expect an instance of Object3D.' ) }
        if ( !value.isObject3D ) { throw new Error( `Target cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

        this._target = value;

    }

    /**
     * @property {module:Controllers/CameraControls#CameraControlMode} mode - The current displacement mode
     * @throws {Error} if the argument is null.
     */
    get mode() {
        return this._mode
    }

    set mode( value ) {

        if ( isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from CameraControlMode enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from CameraControlMode enum.' ) }
        if ( !CameraControlMode.includes( value ) ) { throw new Error( `Mode cannot be an instance of ${ value.constructor.name }. Expect a value from TCameraControlMode enum.` ) }

        this._mode = value;

        if ( this._trackPath ) {
            this._initPathDisplacement();
        }

    }

    get paths() {
        return this._paths
    }

    set paths( value ) {

        this._paths = value;

    }

    get trackPath() {
        return this._trackPath
    }

    set trackPath( value ) {

        if ( isNotBoolean( value ) ) { throw new Error( `Track path cannot be an instance of ${ value.constructor.name }. Expect a boolean.` ) }

        this._trackPath = value;

        if ( this._trackPath ) {
            this._initPathDisplacement();
        }

    }

    get domElement() {

        return this._domElement

    }

    set domElement( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of HTMLDocument.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of HTMLDocument.' ) }
        if ( ![
            'Window',
            'HTMLDocument',
            'HTMLDivElement',
            'HTMLCanvasElement',
            'OffscreenCanvas'
        ].includes( value.constructor.name ) ) { throw new Error( `DomElement cannot be an instance of ${ value.constructor.name }. Expect an instance of Window, HTMLDocument or HTMLDivElement.` ) }

        // Check focusability of given dom element because in case the element is not focusable
        // the keydown event won't work !

        // Clear previous element
        if ( this._domElement ) {
            this._domElement.removeEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
            this._domElement.removeEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
            this.dispose();
        }

        this._domElement = value;
        this._domElement.addEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
        this._domElement.addEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
        this.impose();

    }

    get handlers() {
        return this._handlers
    }

    /**
     * Chainable setter for camera property
     *
     * @param {THREE~Camera} value - The camera to manage
     * @return {module:Controllers/CameraControls~CameraControls} The current instance (this, chainable)
     */
    setCamera( value ) {

        this.camera = value;
        return this

    }

    /**
     * Chainable setter for target property
     *
     * @param {THREE~Object3D} value - The target to use
     * @return {CameraControls} The current instance (this, chainable)
     */
    setTarget( value ) {

        this.target = value;
        return this

    }

    /**
     * Chainable setter for mode property
     *
     * @param {Enum.State} value - The target to use
     * @return {CameraControls} The current instance (this, chainable)
     */
    setMode( value ) {

        this.mode = value;
        return this

    }

    /**
     * Chainable setter for mode
     *
     * @param {State} value - The target to use
     * @throws {BadERROR} a bad error
     * @return {CameraControls} The current instance (this, chainable)
     */
    setPaths( value ) {

        this.paths = value;
        return this

    }

    addPath( value ) {

        this._paths.push( value );
        return this

    }

    setTrackPath( value ) {

        this.trackPath = value;
        return this

    }

    setDomElement( value ) {

        this.domElement = value;
        return this

    }

    ///////////////

    impose() {

        this._domElement.addEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.addEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.addEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.addEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.addEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.addEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.addEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.addEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.addEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.addEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.addEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.addEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( { type: 'impose' } );

    }

    dispose() {

        this._domElement.removeEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.removeEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.removeEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.removeEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.removeEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.removeEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.removeEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.removeEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.removeEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.removeEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.removeEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.removeEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( { type: 'dispose' } );

    }

    update() {

    }

    setCameraPosition( newCameraPosition ) {

        this._camera.position.copy( newCameraPosition );
        this._camera.lookAt( this._target.position );

        return this

    }

    /**
     * Mon blablabla...
     * @param {external:THREE~Vector3} newTargetPosition - The new target position
     * @return {CameraControls} The current instance (this, chainable)
     */
    setTargetPosition( newTargetPosition ) {

        this._target.position.copy( newTargetPosition );
        this._camera.lookAt( this._target.position );

        return this

    }

    // Handlers
    _preventEvent( event ) {
        if ( !event.preventDefault ) { return }

        event.preventDefault();
    }

    _consumeEvent( event ) {
        if ( !event.cancelable ) { return }
        if ( !event.stopImmediatePropagation ) { return }

        event.stopImmediatePropagation();
    }

    // Keys
    _onKeyDown( keyEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( keyEvent );

        const actionMap = this.actionsMap;
        const key       = keyEvent.keyCode;

        //todo
        //        const altActive   = keyEvent.altKey
        //        const ctrlActive  = keyEvent.ctrlKey
        //        const metaActive  = keyEvent.metaKey
        //        const shiftActive = keyEvent.shiftKey

        if ( actionMap.front.includes( key ) ) {

            this._front();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.back.includes( key ) ) {

            this._back();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.up.includes( key ) ) {

            this._up();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.down.includes( key ) ) {

            this._down();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.left.includes( key ) ) {

            this._left();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.right.includes( key ) ) {

            this._right();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.rotate.includes( key ) ) {

            this._rotate( 1.0 );
        } else if ( actionMap.pan.includes( key ) ) {

            this._pan( 1.0 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.roll.left.includes( key ) ) {

            this._roll( 1.0 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.roll.right.includes( key ) ) {

            this._roll( -1 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.zoom.includes( key ) ) {

            this._zoom( 1.0 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtFront.includes( key ) ) {

            this._lookAt( FRONT );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtFrontLeft.includes( key ) ) {

            this._lookAt( new Vector3$1( -1, 0, -1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtFrontRight.includes( key ) ) {

            this._lookAt( new Vector3$1( 1, 0, -1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtBack.includes( key ) ) {

            this._lookAt( BACK );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtBackLeft.includes( key ) ) {

            this._lookAt( new Vector3$1( -1, 0, 1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtBackRight.includes( key ) ) {

            this._lookAt( new Vector3$1( 1, 0, 1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtUp.includes( key ) ) {

            this._lookAt( UP );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtDown.includes( key ) ) {

            this._lookAt( DOWN );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtLeft.includes( key ) ) {

            this._lookAt( LEFT );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtRight.includes( key ) ) {

            this._lookAt( RIGHT );
            this._consumeEvent( keyEvent );

        } else ;

    }

    _onKeyUp( keyEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( keyEvent );

    }

    // Touches
    _onTouchStart( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = touchEvent.touches;

    }

    _onTouchEnd( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = [];
        this._state          = State.None;

    }

    _onTouchCancel( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = [];
        this._state          = State.None;

    }

    _onTouchLeave( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = [];
        this._state          = State.None;

    }

    _onTouchMove( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        const previousTouches         = this.previousTouches;
        const currentTouches          = touchEvent.changedTouches;
        const numberOfPreviousTouches = previousTouches.length;
        const numberOfCurrentTouches  = currentTouches.length;

        if ( numberOfPreviousTouches === 2 && numberOfCurrentTouches === 2 ) {

            const previousTouchA    = new Vector2( previousTouches[ 0 ].clientX, previousTouches[ 0 ].clientY );
            const previousTouchB    = new Vector2( previousTouches[ 1 ].clientX, previousTouches[ 1 ].clientY );
            const previousGap       = previousTouchA.distanceTo( previousTouchB );
            const previousCenter    = new Vector2().addVectors( previousTouchA, previousTouchB ).divideScalar( 2 );
            const previousDirection = new Vector2().subVectors( previousTouchA, previousTouchB ).normalize();

            const currentTouchA    = new Vector2( currentTouches[ 0 ].clientX, currentTouches[ 0 ].clientY );
            const currentTouchB    = new Vector2( currentTouches[ 1 ].clientX, currentTouches[ 1 ].clientY );
            const currentGap       = currentTouchA.distanceTo( currentTouchB );
            const currentCenter    = new Vector2().addVectors( currentTouchA, currentTouchB ).divideScalar( 2 );
            const currentDirection = new Vector2().subVectors( previousTouchA, previousTouchB ).normalize();

            const deltaPan  = new Vector2().subVectors( currentCenter, previousCenter );
            const deltaZoom = currentGap - previousGap;
            const deltaRoll = currentDirection.dot( previousDirection );

            this._pan( deltaPan );
            this._zoom( deltaZoom );
            this._roll( deltaRoll );
            this._consumeEvent( touchEvent );

        } else if ( numberOfPreviousTouches === 1 && numberOfCurrentTouches === 1 ) {

            const deltaRotate = new Vector2(
                currentTouches[ 0 ].clientX - previousTouches[ 0 ].clientX,
                currentTouches[ 0 ].clientY - previousTouches[ 0 ].clientY
            ).divideScalar( 10 ); //todo: to high sensibility else !!!

            this._rotate( deltaRotate );
            this._consumeEvent( touchEvent );

        } else {

            this.logger.warn( 'Ignoring inconsistent touches event.' );

        }

        this.previousTouches = currentTouches;

    }

    // Mouse
    _onMouseEnter( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        this.impose();
        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus();
        }

    }

    _onMouseLeave( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur();
        }
        this.dispose();
        this._state = State.None;

    }

    _onMouseDown( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        const actionMap = this.actionsMap;
        const button    = mouseEvent.button;

        if ( actionMap.front.includes( button ) ) {

            this._state = State.Moving;
            this._front();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.back.includes( button ) ) {

            this._state = State.Moving;
            this._back();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.up.includes( button ) ) {

            this._state = State.Moving;
            this._up();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.down.includes( button ) ) {

            this._state = State.Moving;
            this._down();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.left.includes( button ) ) {

            this._state = State.Moving;
            this._left();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.right.includes( button ) ) {

            this._state = State.Moving;
            this._right();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.rotate.includes( button ) ) {

            this._state = State.Rotating;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.pan.includes( button ) ) {

            this._state = State.Panning;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.roll.left.includes( button ) ) {

            this._state = State.Rolling;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.roll.right.includes( button ) ) {

            this._state = State.Rolling;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.zoom.includes( button ) ) {

            this._state = State.Zooming;
            this._consumeEvent( mouseEvent );

        } else {

            this._state = State.None;

        }

    }

    _onMouseMove( mouseEvent ) {

        if ( !this.enabled || this._state === State.None ) { return }
        this._preventEvent( mouseEvent );

        const state = this._state;
        const delta = {
            x: mouseEvent.movementX || mouseEvent.mozMovementX || mouseEvent.webkitMovementX || 0,
            y: mouseEvent.movementY || mouseEvent.mozMovementY || mouseEvent.webkitMovementY || 0
        };

        switch ( state ) {

            case State.Moving:
                break

            case State.Rotating:
                this._rotate( delta );
                this._consumeEvent( mouseEvent );
                break

            case State.Panning:
                this._pan( delta );
                this._consumeEvent( mouseEvent );
                break

            case State.Rolling:
                this._roll( delta );
                this._consumeEvent( mouseEvent );
                break

            case State.Zooming:
                this._zoom( delta );
                this._consumeEvent( mouseEvent );
                break

            default:
                throw new RangeError( `Unknown state: ${ state }` )

        }

    }

    //todo allow other displacement from wheel
    _onMouseWheel( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        const delta = mouseEvent.wheelDelta || mouseEvent.deltaY;
        this._zoom( delta );
        this._consumeEvent( mouseEvent );

    }

    _onMouseUp( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        this._state = State.None;
        this._consumeEvent( mouseEvent );

    }

    _onDblClick( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        this.logger.warn( 'CameraControls: Double click events is not implemented yet, sorry for the disagreement.' );

    }

    // Positional methods
    _front() {

        if ( !this.canMove || !this.canFront ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            const cameraDirection = FRONT.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.frontSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else if ( this._camera.isOrthographicCamera ) {

            const cameraDirection = FRONT.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.frontSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

            //            const halfOffsetWidth = this.domElement.offsetWidth / 2
            //            const halfOffsetHeight = this.domElement.offsetHeight / 2
            //            this._camera.top -= halfOffsetHeight * this.frontSpeed
            //            this._camera.bottom += halfOffsetHeight * this.frontSpeed
            //            this._camera.right -= halfOffsetWidth * this.frontSpeed
            //            this._camera.left += halfOffsetWidth * this.frontSpeed

            const zoomDisplacement = this.frontSpeed * this.zoomSpeed;
            this._camera.zoom += zoomDisplacement;

            this._camera.updateProjectionMatrix();

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     * @method
     * @private
     * @return {void}
     */
    _back() {

        if ( !this.canMove || !this.canBack ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            const cameraDirection = BACK.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.backSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else if ( this._camera.isOrthographicCamera ) {

            const cameraDirection = BACK.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.backSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

            //            const halfOffsetWidth = this.domElement.offsetWidth / 2
            //            const halfOffsetHeight = this.domElement.offsetHeight / 2
            //            this._camera.top += halfOffsetHeight * this.frontSpeed
            //            this._camera.bottom -= halfOffsetHeight * this.frontSpeed
            //            this._camera.right += halfOffsetWidth * this.frontSpeed
            //            this._camera.left -= halfOffsetWidth * this.frontSpeed

            const zoomDisplacement = this.backSpeed * this.zoomSpeed;
            if ( this._camera.zoom - zoomDisplacement <= 0.0 ) {
                this._camera.zoom = 0.01;
            } else {
                this._camera.zoom -= zoomDisplacement;
            }

            this._camera.updateProjectionMatrix();

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     * @method
     * @private
     * @return {void}
     * @fires module:Controllers/CameraControls~CameraControls#move
     * @fires module:Controllers/CameraControls~CameraControls#change
     */
    _up() {

        if ( !this.canMove || !this.canUp ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = UP.clone()
                                   .applyQuaternion( this._camera.quaternion )
                                   .multiplyScalar( this.upSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     * @method
     * @private
     * @return {void}
     */
    _down() {

        if ( !this.canMove || !this.canDown ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = DOWN.clone()
                                     .applyQuaternion( this._camera.quaternion )
                                     .multiplyScalar( this.downSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     *
     * @private
     * @return {void}
     */
    _left() {

        if ( !this.canMove || !this.canLeft ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = LEFT.clone()
                                     .applyQuaternion( this._camera.quaternion )
                                     .multiplyScalar( this.leftSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _right() {

        if ( !this.canMove || !this.canRight ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = RIGHT.clone()
                                      .applyQuaternion( this._camera.quaternion )
                                      .multiplyScalar( this.rightSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _rotate( delta ) {

        if ( !this.canRotate ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const distanceTo     = cameraPosition.distanceTo( targetPosition );
            const targetToCamera = new Vector3$1().subVectors( cameraPosition, targetPosition ).normalize();
            const rotateSpeed    = this.rotateSpeed;

            switch ( this._mode ) {

                case CameraControlMode.FirstPerson: {

                    //        const normalizedX = (delta.x / this._domElement.clientWidth) - 1.0
                    //        const normalizedY = (delta.y / this._domElement.clientHeight) - 1.0
                    const normalizedX = delta.x;
                    const normalizedY = delta.y;

                    const newTargetPosition = new Vector3$1( -normalizedX, normalizedY, 0 )
                        .applyQuaternion( this._camera.quaternion )
                        .multiplyScalar( rotateSpeed )
                        .add( targetPosition );

                    // Protect against owl head
                    const cameraToTargetDirection = new Vector3$1().subVectors( newTargetPosition, cameraPosition ).normalize();
                    const dotProductUp            = UP.clone().dot( cameraToTargetDirection );
                    const dotProductRight         = RIGHT.clone().dot( cameraToTargetDirection );

                    const max = 0.97;
                    if ( dotProductUp < -max || dotProductUp > max || dotProductRight < -2 || dotProductRight > 2 ) {
                        return
                    }

                    // Care the target distance will change the sensitivity of mouse move
                    // and
                    // We need to set target at pre-defined distance of camera
                    // because if we use newTargetPosition the distance between
                    // camera and target will increase silently over the time
                    const lockedTargetPostion = cameraToTargetDirection.multiplyScalar( 1.0 ) // Todo: option
                                                                       .add( cameraPosition );
                    this.setTargetPosition( lockedTargetPostion );
                }
                    break

                case CameraControlMode.Orbit: {

                    // restrict theta and phi between desired limits
                    const spherical = new Spherical$1().setFromVector3( targetToCamera );

                    const newTheta  = spherical.theta + ( degreesToRadians( -delta.x ) * rotateSpeed );
                    const newPhi    = spherical.phi + ( degreesToRadians( -delta.y ) * rotateSpeed );
                    spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, newTheta ) );
                    spherical.phi   = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, newPhi ) );

                    const newPosition = new Vector3$1().setFromSpherical( spherical )
                                                     .multiplyScalar( distanceTo )
                                                     .add( targetPosition );

                    this.setCameraPosition( newPosition );
                }
                    break

                default:
                    throw new RangeError( `Unamanaged rotation for camera mode ${ this._mode }` )

            }

        } /*else {

         // Todo: ...

         }*/

        this.dispatchEvent( { type: 'rotate' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _pan( delta ) {

        if ( !this.canPan ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            // Take into account the distance between the camera and his target
            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const distanceTo     = cameraPosition.distanceTo( targetPosition );
            const displacement   = new Vector3$1( -delta.x, delta.y, 0 ).applyQuaternion( this._camera.quaternion )
                                                                      .multiplyScalar( this.panSpeed * distanceTo );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        }

        this.dispatchEvent( { type: 'pan' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _roll( delta ) {

        if ( !this.canRoll ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const targetToCamera = new Vector3$1().subVectors( cameraPosition, targetPosition ).normalize();
            const angle          = delta * this.rollSpeed;

            this._camera.up.applyAxisAngle( targetToCamera, angle );
            this._camera.lookAt( targetPosition );
            //or
            //        this._camera.rotateOnAxis( targetToCamera, angle )

        }

        this.dispatchEvent( { type: 'roll' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _zoom( delta ) {

        if ( !this.canZoom ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            switch ( this._mode ) {

                case CameraControlMode.FirstPerson: {

                    if ( delta > 0 ) {
                        this._camera.fov--;
                    } else {
                        this._camera.fov++;
                    }

                    this._camera.updateProjectionMatrix();
                }
                    break

                case CameraControlMode.Orbit: {

                    const cameraPosition                 = this._camera.position;
                    const targetPosition                 = this._target.position;
                    const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition );
                    const displacement                   = FRONT.clone()
                                                                .applyQuaternion( this._camera.quaternion )
                                                                .multiplyScalar( delta * this.zoomSpeed * distanceBetweenCameraAndTarget );

                    let cameraNextPosition                   = cameraPosition.clone().add( displacement );
                    const currentCameraToNextCameraDirection = new Vector3$1().subVectors( cameraNextPosition, cameraPosition ).normalize();
                    const targetToCurrentCameraDirection     = new Vector3$1().subVectors( cameraPosition, targetPosition ).normalize();
                    const targetToNextCameraDirection        = new Vector3$1().subVectors( cameraNextPosition, targetPosition ).normalize();
                    const dotCurrentDirection                = currentCameraToNextCameraDirection.dot( targetToCurrentCameraDirection );
                    const dotNextDirection                   = currentCameraToNextCameraDirection.dot( targetToNextCameraDirection );
                    const nextCameraToTargetSquaredDistance  = cameraNextPosition.distanceToSquared( targetPosition );

                    if ( dotCurrentDirection < 0 && ( ( nextCameraToTargetSquaredDistance < ( this.zoomMinimum * this.zoomMinimum ) ) || dotNextDirection > 0 ) ) {

                        cameraNextPosition = targetToCurrentCameraDirection.clone()
                                                                           .multiplyScalar( this.zoomMinimum )
                                                                           .add( targetPosition );

                    }

                    this._camera.position.copy( cameraNextPosition );
                }
                    break

                default:
                    throw new RangeError( `Invalid camera control mode parameter: ${ this._mode }` )

            }

        } else if ( this._camera.isOrthographicCamera ) {

            const containerWidth                 = this.domElement.offsetWidth;
            const containerHeight                = this.domElement.offsetHeight;
            const aspect                         = containerWidth / containerHeight;
            const cameraPosition                 = this._camera.position;
            const targetPosition                 = this._target.position;
            const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition );
            const direction                      = ( delta > 0 ) ? FRONT.clone() : BACK.clone();
            const cameraDirection                = direction.applyQuaternion( this._camera.quaternion ).normalize();
            const displacement                   = cameraDirection.multiplyScalar( this.zoomSpeed * distanceBetweenCameraAndTarget );

            cameraPosition.add( displacement );

            const newDistance = cameraPosition.distanceTo( targetPosition );
            const zoomHeight  = ( newDistance / 2 );
            const zoomWidth   = ( ( newDistance * aspect ) / 2 );

            this._camera.top    = zoomHeight;
            this._camera.bottom = -zoomHeight;
            this._camera.right  = zoomWidth;
            this._camera.left   = -zoomWidth;

            this._camera.updateProjectionMatrix();

            // OR

            //            const deltaZoom = this.zoomSpeed * 100
            //            if ( delta > 0 ) {
            //
            //                if ( this._camera.zoom + deltaZoom >= 100.0 ) {
            //                    this._camera.zoom = 100.0
            //                } else {
            //                    this._camera.zoom += deltaZoom
            //                }
            //
            //            } else {
            //
            //                if ( this._camera.zoom - deltaZoom <= 0.0 ) {
            //                    this._camera.zoom = 0.01
            //                } else {
            //                    this._camera.zoom -= deltaZoom
            //                }
            //
            //            }
            //
            //            this._camera.updateProjectionMatrix()

            // OR

            //            const zoomFactor = this.zoomSpeed * 1000
            //            const width      = this._camera.right * 2
            //            const height     = this._camera.top * 2
            //            const aspect     = width / height
            //
            //            const distance                      = this._camera.position.distanceTo( this._target.position )
            //
            //            const zoomHeight = ( delta < 0 ) ? height + zoomFactor : height - zoomFactor
            //            const zoomWidth  = ( delta < 0 ) ? width + ( zoomFactor * aspect ) : width - ( zoomFactor * aspect )
            //
            //            this._camera.top    = ( zoomHeight / 2 )
            //            this._camera.bottom = -( zoomHeight / 2 )
            //            this._camera.right  = ( zoomWidth / 2 )
            //            this._camera.left   = -( zoomWidth / 2 )
            //
            //            this._camera.updateProjectionMatrix()

        }

        this.dispatchEvent( { type: 'zoom' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _lookAt( direction ) {

        if ( !this.canLookAt ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const _direction     = direction.clone();
            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const distanceTo     = cameraPosition.distanceTo( targetPosition );

            switch ( this.mode ) {

                // The result is inverted in front of Orbit type but is correct in FP mode except up and down so invert y axis
                case CameraControlMode.FirstPerson: {
                    _direction.y            = -( _direction.y );
                    const newTargetPosition = _direction.multiplyScalar( distanceTo ).add( cameraPosition );
                    this.setTargetPosition( newTargetPosition );
                }
                    break

                case CameraControlMode.Orbit: {
                    const newCameraPosition = _direction.multiplyScalar( distanceTo ).add( targetPosition );
                    this.setCameraPosition( newCameraPosition );
                }
                    break

                default:
                    throw new RangeError( `Invalid camera control mode parameter: ${ this._mode }` )

            }

        }/* else {

         // Todo: ...

         }*/

        this.dispatchEvent( { type: 'lookAt' } );
        this.dispatchEvent( { type: 'change' } );

    }

    // Helpers
    _initPathDisplacement() {

        //todo: project on closest path position
        //todo: move on path in the FRONT camera direction

        if ( isEmptyArray( this._paths ) ) {
            this.logger.warn( 'Try to init path displacement without any paths' );
            return
        }

        if ( isNotDefined( this._currentPath ) ) {

            this._currentPathIndex  = 0;
            this._currentPathOffset = 0;
            this._currentPath       = this._paths[ 0 ];

        }

        this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset );

        switch ( this._mode ) {

            case CameraControlMode.FirstPerson: {

                if ( this._lockedTarget ) {

                    const displacement = new Vector3$1().subVectors( this._currentPathPosition, this.camera.position );
                    this._camera.position.add( displacement );
                    this._target.position.add( displacement );

                } else {

                    this.setCameraPosition( this._currentPathPosition );

                }
            }
                break

            case CameraControlMode.Orbit: {

                if ( this._lockedTarget ) {

                    const displacement = new Vector3$1().subVectors( this._currentPathPosition, this.target.position );
                    this._camera.position.add( displacement );
                    this._target.position.add( displacement );

                } else {

                    this.setTargetPosition( this._currentPathPosition );

                }
            }
                break

            default:
                throw new RangeError( `Invalid camera control _mode parameter: ${ this._mode }` )

        }

    }

    _getPathDisplacement( cameraDirection ) {

        let displacement = null;

        //Todo: add options to move in camera direction or not
        // try a default positive progress on path
        const currentPathPosition = this._currentPathPosition;

        const nextPositiveOffset   = this._currentPathOffset + this._cameraJump;
        const positiveOffset       = ( nextPositiveOffset < 1 ) ? nextPositiveOffset : 1;
        const positivePathPosition = this._currentPath.getPointAt( positiveOffset );
        const positiveDisplacement = new Vector3$1().subVectors( positivePathPosition, currentPathPosition );
        const positiveDirection    = positiveDisplacement.clone().normalize();
        const positiveDot          = cameraDirection.dot( positiveDirection );

        const nextNegativeOffset   = this._currentPathOffset - this._cameraJump;
        const negativeOffset       = ( nextNegativeOffset > 0 ) ? nextNegativeOffset : 0;
        const negativePathPosition = this._currentPath.getPointAt( negativeOffset );
        const negativeDisplacement = new Vector3$1().subVectors( negativePathPosition, currentPathPosition );
        const negativeDirection    = negativeDisplacement.clone().normalize();
        const negativeDot          = cameraDirection.dot( negativeDirection );

        if ( positiveDot === 0 && negativeDot < 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap();

            let indexOfBestPath  = undefined;
            let bestDisplacement = undefined;
            let bestDotProduct   = -1;
            let isFromStart      = undefined;
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index;

                const startDisplacement = pathExtremity.startDisplacement;
                if ( startDisplacement ) {

                    const startDirection = startDisplacement.clone().normalize();
                    const startDot       = cameraDirection.dot( startDirection );

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex;
                        bestDisplacement = startDisplacement;
                        bestDotProduct   = startDot;
                        isFromStart      = true;

                    }

                }

                const endDisplacement = pathExtremity.endDisplacement;
                if ( endDisplacement ) {

                    const endDirection = endDisplacement.clone().normalize();
                    const endDot       = cameraDirection.dot( endDirection );

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex;
                        bestDisplacement = endDisplacement;
                        bestDotProduct   = endDot;
                        isFromStart      = false;
                    }

                }

            } );

            if ( indexOfBestPath !== undefined ) {

                this._currentPathIndex    = indexOfBestPath;
                this._currentPath         = this._paths[ this._currentPathIndex ];
                this._currentPathOffset   = ( isFromStart ) ? this._cameraJump : 1 - this._cameraJump;
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset );
                displacement              = bestDisplacement;

            } else {

                this.logger.warn( 'Reach path end.' );
                displacement = new Vector3$1();

            }

        } else if ( positiveDot > 0 && negativeDot <= 0 ) {

            displacement              = positiveDisplacement;
            this._currentPathOffset   = positiveOffset;
            this._currentPathPosition = positivePathPosition;

        } else if ( positiveDot <= 0 && negativeDot > 0 ) {

            displacement              = negativeDisplacement;
            this._currentPathOffset   = negativeOffset;
            this._currentPathPosition = negativePathPosition;

        } else if ( positiveDot < 0 && negativeDot === 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap();

            let indexOfBestPath  = undefined;
            let bestDisplacement = undefined;
            let bestDotProduct   = -1;
            let isFromStart      = undefined;
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index;

                const startDisplacement = pathExtremity.startDisplacement;
                if ( startDisplacement ) {

                    const startDirection = startDisplacement.clone().normalize();
                    const startDot       = cameraDirection.dot( startDirection );

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex;
                        bestDisplacement = startDisplacement;
                        bestDotProduct   = startDot;
                        isFromStart      = true;

                    }

                }

                const endDisplacement = pathExtremity.endDisplacement;
                if ( endDisplacement ) {

                    const endDirection = endDisplacement.clone().normalize();
                    const endDot       = cameraDirection.dot( endDirection );

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex;
                        bestDisplacement = endDisplacement;
                        bestDotProduct   = endDot;
                        isFromStart      = false;
                    }

                }

            } );

            if ( indexOfBestPath !== undefined ) {

                this._currentPathIndex    = indexOfBestPath;
                this._currentPath         = this._paths[ this._currentPathIndex ];
                this._currentPathOffset   = ( isFromStart ) ? this._cameraJump : 1 - this._cameraJump;
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset );
                displacement              = bestDisplacement;

            } else {

                this.logger.warn( 'Reach path start.' );
                displacement = new Vector3$1();

            }

        } else if ( ( positiveDot < 0 && negativeDot < 0 ) || ( positiveDot > 0 && negativeDot > 0 ) ) { // Could occurs in high sharp curve with big move step

            if ( positiveDot > negativeDot ) {

                displacement              = positiveDisplacement;
                this._currentPathOffset   = positiveOffset;
                this._currentPathPosition = positivePathPosition;

            } else {

                displacement              = negativeDisplacement;
                this._currentPathOffset   = negativeOffset;
                this._currentPathPosition = negativePathPosition;

            }

        } else {

            this.logger.warn( 'Unable to find correct next path position.' );
            displacement = new Vector3$1();

        }

        return displacement

    }

    _getDirectionsMap() {

        //todo: use cache !!! Could become a complet map with nodes on path network

        const currentPathPosition = this._currentPathPosition;
        const currentIndex        = this._currentPathIndex;
        const jump                = this._cameraJump;
        const maxDistance         = this._maxJump;

        return this._paths.reduce( ( array, path, index ) => {

            if ( index === currentIndex ) { return array }

            const start           = path.getPointAt( 0 );
            const distanceToStart = currentPathPosition.distanceToSquared( start );
            let startDisplacement = undefined;
            if ( distanceToStart < maxDistance ) {
                startDisplacement = new Vector3$1().subVectors( path.getPointAt( jump ), start );
            }

            const end           = path.getPointAt( 1 );
            const distanceToEnd = currentPathPosition.distanceToSquared( end );
            let endDisplacement = undefined;
            if ( distanceToEnd < maxDistance ) {
                endDisplacement = new Vector3$1().subVectors( path.getPointAt( 1 - jump ), end );
            }

            if ( startDisplacement || endDisplacement ) {
                array.push( {
                    index,
                    startDisplacement,
                    endDisplacement
                } );
            }

            return array

        }, [] )

    }

}

//// Extra work

//
//// t: current time, b: begInnIng value, c: change In value, d: duration
//const ease = {
//    def:              'easeOutQuad',
//    easeInQuad:       function ( x, t, b, c, d ) {
//        return c * (t /= d) * t + b;
//    },
//    easeOutQuad:      function ( x, t, b, c, d ) {
//        return -c * (t /= d) * (t - 2) + b;
//    },
//    easeInOutQuad:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t + b;
//        }
//        return -c / 2 * ((--t) * (t - 2) - 1) + b;
//    },
//    easeInCubic:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t + b;
//    },
//    easeOutCubic:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t + 1) + b;
//    },
//    easeInOutCubic:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t + 2) + b;
//    },
//    easeInQuart:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t + b;
//    },
//    easeOutQuart:     function ( x, t, b, c, d ) {
//        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
//    },
//    easeInOutQuart:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t + b;
//        }
//        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
//    },
//    easeInQuint:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t * t + b;
//    },
//    easeOutQuint:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
//    },
//    easeInOutQuint:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
//    },
//    easeInSine:       function ( x, t, b, c, d ) {
//        return -c * Math.cos( t / d * (Math.PI / 2) ) + c + b;
//    },
//    easeOutSine:      function ( x, t, b, c, d ) {
//        return c * Math.sin( t / d * (Math.PI / 2) ) + b;
//    },
//    easeInOutSine:    function ( x, t, b, c, d ) {
//        return -c / 2 * (Math.cos( Math.PI * t / d ) - 1) + b;
//    },
//    easeInExpo:       function ( x, t, b, c, d ) {
//        return (t == 0) ? b : c * Math.pow( 2, 10 * (t / d - 1) ) + b;
//    },
//    easeOutExpo:      function ( x, t, b, c, d ) {
//        return (t == d) ? b + c : c * (-Math.pow( 2, -10 * t / d ) + 1) + b;
//    },
//    easeInOutExpo:    function ( x, t, b, c, d ) {
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( t == d ) {
//            return b + c;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * Math.pow( 2, 10 * (t - 1) ) + b;
//        }
//        return c / 2 * (-Math.pow( 2, -10 * --t ) + 2) + b;
//    },
//    easeInCirc:       function ( x, t, b, c, d ) {
//        return -c * (Math.sqrt( 1 - (t /= d) * t ) - 1) + b;
//    },
//    easeOutCirc:      function ( x, t, b, c, d ) {
//        return c * Math.sqrt( 1 - (t = t / d - 1) * t ) + b;
//    },
//    easeInOutCirc:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return -c / 2 * (Math.sqrt( 1 - t * t ) - 1) + b;
//        }
//        return c / 2 * (Math.sqrt( 1 - (t -= 2) * t ) + 1) + b;
//    },
//    easeInElastic:    function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return -(a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//    },
//    easeOutElastic:   function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return a * Math.pow( 2, -10 * t ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) + c + b;
//    },
//    easeInOutElastic: function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d / 2) == 2 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * (.3 * 1.5);
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        if ( t < 1 ) {
//            return -.5 * (a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//        }
//        return a * Math.pow( 2, -10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) * .5 + c + b;
//    },
//    easeInBack:       function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * (t /= d) * t * ((s + 1) * t - s) + b;
//    },
//    easeOutBack:      function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
//    },
//    easeInOutBack:    function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
//        }
//        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
//    },
//    easeInBounce:     function ( x, t, b, c, d ) {
//        return c - jQuery.easing.easeOutBounce( x, d - t, 0, c, d ) + b;
//    },
//    easeOutBounce:    function ( x, t, b, c, d ) {
//        if ( (t /= d) < (1 / 2.75) ) {
//            return c * (7.5625 * t * t) + b;
//        } else if ( t < (2 / 2.75) ) {
//            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
//        } else if ( t < (2.5 / 2.75) ) {
//            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
//        } else {
//            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
//        }
//    },
//    easeInOutBounce:  function ( x, t, b, c, d ) {
//        if ( t < d / 2 ) {
//            return jQuery.easing.easeInBounce( x, t * 2, 0, c, d ) * .5 + b;
//        }
//        return jQuery.easing.easeOutBounce( x, t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
//    }
//}
//
////const accelerations = {
////    Linear: function( speed ) {
////        return speed + acceleration
////    }
////}
//
//class Movement {
//
//    constructor ( min, max, minSpeed, currentSpeed, maxSpeed, acceleration ) {
//
//        this.bounds   = {
//            min: -Infinity,
//            max: Infinity
//        }
//        this.speed    = {
//            min:     0,
//            current: 1.0,
//            max:     Infinity
//        }
//        this.minSpeed = 0.0
//        this.speed    = 1.0
//        this.maxSpeed = Infinity
//
//        this.acceleration = function ( timer ) {
//            return speed += 0.1
//        }
//
//        this.deceleration = function ( timer, speed ) {
//            return speed -= 0.1
//        }
//    }
//
//}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


//import { LineBasicMaterial }        from 'three-full/sources/materials/LineBasicMaterial'

class HighlightableLineMaterial extends LineBasicMaterial$1 {

    constructor( parameters ) {
        super( parameters );
        this.isHighlightableMaterial = true;
        //        this.type                    = 'HighlightableLineMaterial'

        this.depthTest   = false;
        this.depthWrite  = false;
        this.fog         = false;
        this.transparent = true;
        this.linewidth   = 1;
        this.oldColor    = this.color.clone();

    }

    highlight( highlighted ) {

        if ( highlighted ) {

            const lum = 0.35;
            const _r  = this.color.r;
            const _g  = this.color.g;
            const _b  = this.color.b;
            const r   = Math.min( Math.max( 0, _r + ( _r * lum ) ), 1.0 );
            const g   = Math.min( Math.max( 0, _g + ( _g * lum ) ), 1.0 );
            const b   = Math.min( Math.max( 0, _b + ( _b * lum ) ), 1.0 );
            this.color.setRGB( r, g, b );

        } else {

            this.color.copy( this.oldColor );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { DoubleSide }        from 'three-full/sources/constants'
//import { MeshBasicMaterial } from 'three-full/sources/materials/MeshBasicMaterial'

class HighlightableMaterial extends MeshBasicMaterial$1 {

    constructor( parameters ) {
        super( parameters );
        this.isHighlightableMaterial = true;
        //        this.type                    = 'HighlightableMaterial'

        this.depthTest   = false;
        this.depthWrite  = false;
        this.fog         = false;
        this.side        = DoubleSide;
        this.transparent = true;
        this.oldColor    = this.color.clone();

    }

    highlight( highlighted ) {

        if ( highlighted ) {

            const lum = 0.35;
            const _r  = this.color.r;
            const _g  = this.color.g;
            const _b  = this.color.b;
            const r   = Math.min( Math.max( 0, _r + ( _r * lum ) ), 1.0 );
            const g   = Math.min( Math.max( 0, _g + ( _g * lum ) ), 1.0 );
            const b   = Math.min( Math.max( 0, _b + ( _b * lum ) ), 1.0 );
            this.color.setRGB( r, g, b );

        } else {

            this.color.copy( this.oldColor );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { DoubleSide }        from 'three-full/sources/constants'
//import { BufferGeometry }    from 'three-full/sources/core/BufferGeometry'
//import { MeshBasicMaterial } from 'three-full/sources/materials/MeshBasicMaterial'
//import { Mesh }              from 'three-full/sources/objects/Mesh'

class AbstractHitbox extends Mesh$1 {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new BufferGeometry$2(),
                material: new MeshBasicMaterial$1( {
                    visible:    false,
                    depthTest:  false,
                    depthWrite: false,
                    fog:        false,
                    side:       DoubleSide,
                    color:      0x654321
                    //                    opacity:     0.0,
                    //                    transparent: true
                } )
            }, ...parameters
        };

        super( _parameters.geometry, _parameters.material );
        this.isHitbox         = true;
        this.type             = 'Hitbox';
        this.matrixAutoUpdate = false;

    }
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


//import { OctahedronBufferGeometry } from 'three-full/sources/geometries/OctahedronGeometry'

class OctahedricalHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new OctahedronBufferGeometry$1( 1.2, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isOctahedricalHitbox = true;
        this.type                 = 'OctahedricalHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { Object3D }   from 'three-full/sources/core/Object3D'
//import { Quaternion } from 'three-full/sources/math/Quaternion'

class AbstractHandle extends Object3D$2 {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                debug:  false,
                color:  0xffffff,
                hitbox: null
            }, ...parameters
        };

        super( _parameters );
        this.isHandle         = true;
        this.type             = 'Handle';
        this.matrixAutoUpdate = true;

        this.debug  = _parameters.debug;
        this.color  = _parameters.color;
        this.hitbox = _parameters.hitbox;

        this.baseQuaternion = new Quaternion$1();

    }

    get color() {

        return this.line.material.color.clone()

    }

    set color( value ) {

        if ( isNull( value ) ) { throw new Error( 'Color cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Color cannot be undefined ! Expect an instance of Color.' ) }
        //        if ( !( value instanceof Color ) ) { throw new Error( `Color cannot be an instance of ${value.constructor.name}. Expect an instance of Color.` ) }

        this.traverse( ( child ) => {

            let materials = child.material;
            if ( !materials ) { return }

            materials.color.setHex( value );

        } );

    }

    get hitbox() {
        return this._hitbox
    }

    set hitbox( value ) {
        this._hitbox = value;
        this.add( value );
    }

    setColor( value ) {

        this.color = value;
        return this

    }

    setHitbox( value ) {
        this.hitbox = value;
        return this
    }

    setScale( x, y, z ) {

        this.scale.set( x, y, z );
        return this

    }

    setPosition( x, y, z ) {
        this.position.set( x, y, z );
        return this
    }

    highlight( value ) {

        for ( let childIndex = 0, numberOfChildren = this.children.length ; childIndex < numberOfChildren ; childIndex++ ) {
            const child = this.children[ childIndex ];
            if ( child.isHitbox ) { continue }

            const childMaterial = child.material;
            if ( isUndefined( childMaterial ) || !childMaterial.isHighlightableMaterial ) { continue }

            childMaterial.highlight( value );
        }

    }

    raycast( raycaster, intersects ) {

        const intersections = raycaster.intersectObject( this._hitbox, false );
        if ( intersections.length > 0 ) {
            intersects.push( {
                distance: intersections[ 0 ].distance,
                object:   this
            } );
        }

    }

    setRotationFromAxisAndAngle( axis, angle ) {

        this.quaternion.setFromAxisAngle( axis, angle );
        this.baseQuaternion.copy( this.quaternion );
        return this

    }

    // eslint-disable-next-line no-unused-vars
    update( cameraDirection ) {}

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class OctahedricalHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                color:  0xffffff,
                hitbox: new OctahedricalHitbox()
            }, ...parameters
        };

        super( _parameters );
        this.isOmnidirectionalHandle = true;
        this.type                    = 'OmnidirectionalHandle';

        const octahedronGeometry    = new OctahedronBufferGeometry$1( 0.1, 0 );
        const octahedronMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.55
        } );
        const octahedron            = new Mesh$1( octahedronGeometry, octahedronMaterial );
        octahedron.matrixAutoUpdate = false;
        this.add( octahedron );

        const edgesGeometry    = new EdgesGeometry$1( octahedronGeometry );
        const edgesMaterial    = new HighlightableLineMaterial( {
            color:     _parameters.color,
            linewidth: 4
        } );
        const edges            = new LineSegments$1( edgesGeometry, edgesMaterial );
        edges.matrixAutoUpdate = false;
        this.add( edges );

    }

    update( cameraDirection ) {
        super.update( cameraDirection );

        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'

class PlanarHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        const planePositions = ( parameters.centered ) ?
                               [
                                   -0.6, -0.6, 0.0,
                                   0.6, -0.6, 0.0,
                                   0.6, 0.6, 0.0,
                                   -0.6, 0.6, 0.0
                               ] : [
                0.0, 0.0, 0.0,
                1.1, 0.0, 0.0,
                1.1, 1.1, 0.0,
                0.0, 1.1, 0.0
            ];

        const planeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ];
        const planeBufferGeometry = new BufferGeometry$2();
        planeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) );
        planeBufferGeometry.setIndex( planeIndexes );

        const _parameters = {
            ...{
                geometry: planeBufferGeometry
            }, ...parameters
        };

        super( _parameters );
        this.isPlanarHitbox = true;
        this.type           = 'PlanarHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class PlaneHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                showEdges: false,
                centered:  false,
                color:     0xffffff,
                hitbox:    new PlanarHitbox( { centered: parameters.centered || false } ),
                direction: new Vector3$1( 0, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isPlaneHandle = true;
        this.type          = 'PlaneHandle';

        // Edge line
        if ( _parameters.showEdges ) {

            const lineBufferGeometry = new BufferGeometry$2();
            lineBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0.75, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.75, 0.0 ], 3 ) );

            const lineMaterial = new HighlightableLineMaterial( {
                color: _parameters.color
            } );

            const line            = new Line$1( lineBufferGeometry, lineMaterial );
            line.matrixAutoUpdate = false;
            this.add( line );

        }


        // Plane
        const planePositions = ( _parameters.centered ) ?
                               [
                                   -0.5, -0.5, 0.0,
                                   0.5, -0.5, 0.0,
                                   0.5, 0.5, 0.0,
                                   -0.5, 0.5, 0.0
                               ] : [
                0.1, 0.1, 0.0,
                1.0, 0.1, 0.0,
                1.0, 1.0, 0.0,
                0.1, 1.0, 0.0
            ];

        const planeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ];
        const planeBufferGeometry = new BufferGeometry$2();
        planeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) );
        planeBufferGeometry.setIndex( planeIndexes );

        const planeMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } );
        const plane            = new Mesh$1( planeBufferGeometry, planeMaterial );
        plane.matrixAutoUpdate = false;
        this.add( plane );

        this.xAxis = new Vector3$1( 1, 0, 0 );
        this.yAxis = new Vector3$1( 0, 1, 0 );
        this.zAxis = new Vector3$1( 0, 0, 1 );

        this.xDirection = new Vector3$1( _parameters.direction.x, 0, 0 );
        this.yDirection = new Vector3$1( 0, _parameters.direction.y, 0 );
        this.zDirection = new Vector3$1( 0, 0, _parameters.direction.z );
        this.direction  = _parameters.direction;

        if ( this.debug ) {
            const origin      = new Vector3$1( 0, 0, 0 );
            const direction   = _parameters.direction;
            const arrowHelper = new ArrowHelper$1( direction, origin, 1, 0x123456 );
            this.add( arrowHelper );
        }
    }

    get direction() {

        return this._direction

    }

    set direction( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3$1 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

    }

    update( cameraDirection ) {

        super.update( cameraDirection );

        // Decompose direction by main orientation
        const xDirection = new Vector3$1( this._direction.x, 0, 0 );
        const yDirection = new Vector3$1( 0, this._direction.y, 0 );
        const zDirection = new Vector3$1( 0, 0, this._direction.z );
        const xDot       = xDirection.dot( cameraDirection );
        const yDot       = yDirection.dot( cameraDirection );
        const zDot       = zDirection.dot( cameraDirection );

        this.quaternion.copy( this.baseQuaternion );

        // XY Plane
        if ( xDot > 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( 0 );

        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( 0 );

        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( 0 );

        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( 0 );

        }

        // XZ Plane
        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( -1 );

        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( 1 );

        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( -1 );

        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( 1 );

        }

        // YZ Plane
        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( -1 );

        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( 1 );

        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( -1 );

        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( 1 );

        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection( direction ) {

        this.direction = direction;
        return this

    }

    flipXDirection() {

        this.xDirection.setX( -this.xDirection.x );

    }

    flipYDirection() {

        this.yDirection.setY( -this.yDirection.y );

    }

    flipZDirection() {

        this.zDirection.setZ( -this.zDirection.z );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'
//import { Vector3 }                from 'three-full/sources/math/Vector3'

class LineGeometry extends BufferGeometry$2 {

    constructor( pointA = new Vector3$1( 0, 0, 0 ), pointB = new Vector3$1( 1, 0, 0 ) ) {
        super();

        this.type = 'LineGeometry';
        this.setAttribute( 'position', new Float32BufferAttribute( [ pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z ], 3 ) );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


//import { CylinderBufferGeometry } from 'three-full/sources/geometries/CylinderGeometry'

class CylindricaHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        const cylinderGeometry = new CylinderBufferGeometry$1( 0.2, 0, 1, 4, 1, false );
        cylinderGeometry.translate( 0, 0.5, 0 );
        const _parameters = {
            ...{
                geometry: cylinderGeometry
            }, ...parameters
        };

        super( _parameters );
        this.isCylindricaHitbox = true;
        this.type               = 'CylindricaHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class ScaleHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new CylindricaHitbox(),
                direction: new Vector3$1( 0, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isScaleHandle = true;
        this.type          = 'ScaleHandle';

        const lineGeometry    = new LineGeometry( new Vector3$1( 0, 0, 0 ), new Vector3$1( 0, 0.88, 0 ) );
        const lineMaterial    = new HighlightableLineMaterial( { color: _parameters.color } );
        const line            = new Line$1( lineGeometry, lineMaterial );
        line.matrixAutoUpdate = false;
        this.add( line );

        const boxGeometry = new BoxBufferGeometry$1( 0.12, 0.12, 0.12 );
        boxGeometry.translate( 0, 0.94, 0 );
        const boxMaterial    = new HighlightableMaterial( { color: _parameters.color } );
        const box            = new Mesh$1( boxGeometry, boxMaterial );
        box.matrixAutoUpdate = false;
        this.add( box );

        this.direction = _parameters.direction;

    }

    get direction() {

        return this._direction

    }

    set direction( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3$1 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

        if ( value.y > 0.99999 ) {

            this.quaternion.set( 0, 0, 0, 1 );

        } else if ( value.y < -0.99999 ) {

            this.quaternion.set( 1, 0, 0, 0 );

        } else {

            const axis    = new Vector3$1( value.z, 0, -value.x ).normalize();
            const radians = Math.acos( value.y );

            this.quaternion.setFromAxisAngle( axis, radians );

        }

    }

    update( cameraDirection ) {

        super.update( cameraDirection );

        const dotProduct = this._direction.dot( cameraDirection );
        if ( dotProduct >= 0 ) {
            this.flipDirection();
        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection( direction ) {

        this.direction = direction;
        return this

    }

    flipDirection() {

        this.direction = this._direction.negate();

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { DoubleSide }          from 'three-full/sources/constants'
//import { Object3D }            from 'three-full/sources/core/Object3D'
//import { PlaneBufferGeometry } from 'three-full/sources/geometries/PlaneGeometry'
//import { MeshBasicMaterial }   from 'three-full/sources/materials/MeshBasicMaterial'
//import { Mesh }                from 'three-full/sources/objects/Mesh'

class AbstractGizmo extends Object3D$2 {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                debug:     false,
                planeSize: 50
            },
            ...parameters
        };

        super( _parameters );
        this.isGizmo          = true;
        this.type             = 'AbstractGizmo';
        this.matrixAutoUpdate = true;

        this.debug = _parameters.debug;


        //        this.handles                  = new Object3D()
        //        this.handles.name             = 'Handles'
        //        this.handles.matrixAutoUpdate = false
        //
        //        this.add( this.handles )

        ///

        const planeGeometry                  = new PlaneBufferGeometry$1( _parameters.planeSize, _parameters.planeSize, 2, 2 );
        const planeMaterial                  = new MeshBasicMaterial$1( {
            side:        DoubleSide,
            visible:     this.debug,
            transparent: true,
            opacity:     0.33,
            color:       0x123456
        } );
        this.intersectPlane                  = new Mesh$1( planeGeometry, planeMaterial );
        this.intersectPlane.name             = 'IntersectPlane';
        this.intersectPlane.matrixAutoUpdate = true;
        this.intersectPlane.visible          = true;

        this.add( this.intersectPlane );

    }

    _setupHandles( handlesMap ) {

        const parent = this;
        //        const parent = this.handles

        for ( let name in handlesMap ) {

            const element = handlesMap[ name ];
            if ( isNotArray( element ) ) {

                element.name        = name;
                element.renderOrder = Infinity;
                element.updateMatrix();

                parent.add( element );

            } else {

                for ( let i = element.length ; i-- ; ) {

                    const object   = handlesMap[ name ][ i ][ 0 ];
                    const position = handlesMap[ name ][ i ][ 1 ];
                    const rotation = handlesMap[ name ][ i ][ 2 ];
                    const scale    = handlesMap[ name ][ i ][ 3 ];
                    const tag      = handlesMap[ name ][ i ][ 4 ];

                    // name and tag properties are essential for picking and updating logic.
                    object.name = name;
                    object.tag  = tag;

                    // avoid being hidden by other transparent objects
                    object.renderOrder = Infinity;

                    if ( position ) {
                        object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
                    }
                    if ( rotation ) {
                        object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );
                    }
                    if ( scale ) {
                        object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );
                    }

                    object.updateMatrix();

                    const tempGeometry = object.geometry.clone();
                    tempGeometry.applyMatrix4( object.matrix );
                    object.geometry = tempGeometry;

                    object.position.set( 0, 0, 0 );
                    object.rotation.set( 0, 0, 0 );
                    object.scale.set( 1, 1, 1 );

                    parent.add( object );

                }

            }

        }

    }

    highlight( axis ) {

        // Reset highlight for all of them
        for ( let key in this.handleGizmos ) {
            this.handleGizmos[ key ].highlight( false );
        }

        // Highlight the picked (if exist)
        const currentHandle = this.handleGizmos[ axis ];
        if ( currentHandle ) {
            currentHandle.highlight( true );
        }

    }

    update( cameraPosition, cameraDirection ) {

        this.traverse( ( child ) => {

            if ( !child.isHandle ) { return }

            child.update( cameraDirection );

        } );

        this.updateIntersectPlane( cameraPosition );

    }

    updateIntersectPlane( cameraPosition ) {

        this.intersectPlane.lookAt( cameraPosition );
        this.intersectPlane.updateMatrix();

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class ScaleGizmo extends AbstractGizmo {

    constructor() {

        super();
        this.isScaleGizmo = true;
        this.type         = 'ScaleGizmo';

        this.handleGizmos = {

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 ),

            XY: new PlaneHandle( {
                color:     0xaaaa00,
                direction: new Vector3$1( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new PlaneHandle( {
                color:     0x00aaaa,
                direction: new Vector3$1( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3$1( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new PlaneHandle( {
                color:     0xaa00aa,
                direction: new Vector3$1( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3$1( 1, 0, 0 ), degreesToRadians( 90 ) ),

            X: new ScaleHandle( {
                color:     0xaa0000,
                direction: new Vector3$1( 1, 0, 0 )
            } ),

            Y: new ScaleHandle( {
                color:     0x00aa00,
                direction: new Vector3$1( 0, 1, 0 )
            } ),

            Z: new ScaleHandle( {
                color:     0x0000aa,
                direction: new Vector3$1( 0, 0, 1 )
            } )

        };

        this._setupHandles( this.handleGizmos );
        //        this.init()

    }

    raycast( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects );
        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'
//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'

class LozengeHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        // Lozenge
        const lozengePositions        = [
            0.0, 0.0, 0.0,
            0.85, 0.0, 0.0,
            1.1, 1.1, 0.0,
            0.0, 0.85, 0.0
        ];
        const lozengeIndexes          = [
            0, 1, 2,
            2, 3, 0
        ];
        const positionBufferAttribute = new Float32BufferAttribute( lozengePositions, 3 );
        const lozengeBufferGeometry   = new BufferGeometry$2();
        lozengeBufferGeometry.setAttribute( 'position', positionBufferAttribute );
        lozengeBufferGeometry.setIndex( lozengeIndexes );

        const _parameters = {
            ...{
                geometry: lozengeBufferGeometry
            }, ...parameters
        };

        super( _parameters );
        this.isPlanarHitbox = true;
        this.type           = 'PlanarHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class LozengeHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new LozengeHitbox(),
                direction: new Vector3$1( 1, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isPlaneHandle = true;
        this.type          = 'PlaneHandle';

        // Edge line
        const lineBufferGeometry = new BufferGeometry$2();
        lineBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0.1, 0.75, 0.0, 1.0, 1.0, 0.0, 0.75, 0.1, 0.0 ], 3 ) );

        const lineMaterial = new HighlightableLineMaterial( {
            color: _parameters.color
        } );

        const line            = new Line$1( lineBufferGeometry, lineMaterial );
        line.matrixAutoUpdate = false;
        this.add( line );

        // Lozenge
        const lozengePositions      = [
            0.1, 0.1, 0.0,
            0.75, 0.1, 0.0,
            1.0, 1.0, 0.0,
            0.1, 0.75, 0.0
        ];
        const lozengeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ];
        const lozengeBufferGeometry = new BufferGeometry$2();
        lozengeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( lozengePositions, 3 ) );
        lozengeBufferGeometry.setIndex( lozengeIndexes );

        const lozengeMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } );
        const lozenge            = new Mesh$1( lozengeBufferGeometry, lozengeMaterial );
        lozenge.matrixAutoUpdate = false;
        this.add( lozenge );

        this.direction  = _parameters.direction;
        this.xDirection = new Vector3$1( _parameters.direction.x, 0, 0 );
        this.yDirection = new Vector3$1( 0, _parameters.direction.y, 0 );
        this.zDirection = new Vector3$1( 0, 0, _parameters.direction.z );
        this.xAxis      = new Vector3$1( 1, 0, 0 );
        this.yAxis      = new Vector3$1( 0, 1, 0 );
        this.zAxis      = new Vector3$1( 0, 0, 1 );
    }

    get direction() {

        return this._direction

    }

    set direction( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3$1 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

    }

    update( cameraDirection ) {

        super.update( cameraDirection );

        const xDot = this.xDirection.dot( cameraDirection );
        const yDot = this.yDirection.dot( cameraDirection );
        const zDot = this.zDirection.dot( cameraDirection );

        this.quaternion.copy( this.baseQuaternion );

        // XY Plane
        if ( xDot > 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );

        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );

        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );

        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );

        }

        // XZ Plane
        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );

        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );

        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );

        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );

        }

        // YZ Plane
        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );

        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );

        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );

        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );

        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection( direction ) {

        this.direction = direction;
        return this

    }

    flipXAxis() {

        const tempDirection = this._direction.clone();
        tempDirection.x     = -tempDirection.x;

        this.direction = tempDirection;

    }

    flipYAxis() {

        const tempDirection = this._direction.clone();
        tempDirection.y     = -tempDirection.y;

        this.direction = tempDirection;

    }

    flipZAxis() {

        const tempDirection = this._direction.clone();
        tempDirection.z     = -tempDirection.z;

        this.direction = tempDirection;

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class TranslateHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new CylindricaHitbox(),
                direction: new Vector3$1( 0, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isTranslateHandle = true;
        this.type              = 'TranslateHandle';

        const lineGeometry    = new LineGeometry( new Vector3$1( 0, 0, 0 ), new Vector3$1( 0, 0.8, 0 ) );
        const lineMaterial    = new HighlightableLineMaterial( { color: _parameters.color } );
        const line            = new Line$1( lineGeometry, lineMaterial );
        line.matrixAutoUpdate = false;
        this.add( line );

        const coneGeometry = new ConeBufferGeometry$1( 0.05, 0.2, 12, 1, false );
        coneGeometry.translate( 0, 0.9, 0 );
        const coneMaterial    = new HighlightableMaterial( { color: _parameters.color } );
        const cone            = new Mesh$1( coneGeometry, coneMaterial );
        cone.matrixAutoUpdate = false;
        this.add( cone );

        this.direction = _parameters.direction;

    }

    get direction() {

        return this._direction

    }

    set direction( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3$1 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

        if ( value.y > 0.99999 ) {

            this.quaternion.set( 0, 0, 0, 1 );

        } else if ( value.y < -0.99999 ) {

            this.quaternion.set( 1, 0, 0, 0 );

        } else {

            const axis    = new Vector3$1( value.z, 0, -value.x ).normalize();
            const radians = Math.acos( value.y );

            this.quaternion.setFromAxisAngle( axis, radians );

        }

    }

    update( cameraDirection ) {

        super.update( cameraDirection );

        const dotProduct = this._direction.dot( cameraDirection );
        if ( dotProduct >= 0 ) {
            this.flipDirection();
        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection( direction ) {

        this.direction = direction;
        return this

    }

    flipDirection() {

        this.direction = this._direction.negate();

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class TranslateGizmo extends AbstractGizmo {

    constructor() {

        super();
        this.isTranslateGizmo = true;
        this.type             = 'TranslateGizmo';

        this.handleGizmos = {

            X: new TranslateHandle( {
                color:     0xaa0000,
                direction: new Vector3$1( 1, 0, 0 )
            } ),

            Y: new TranslateHandle( {
                color:     0x00aa00,
                direction: new Vector3$1( 0, 1, 0 )
            } ),

            Z: new TranslateHandle( {
                color:     0x0000aa,
                direction: new Vector3$1( 0, 0, 1 )
            } ),

            XY: new LozengeHandle( {
                color:     0xaaaa00,
                direction: new Vector3$1( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new LozengeHandle( {
                color:     0x00aaaa,
                direction: new Vector3$1( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3$1( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new LozengeHandle( {
                color:     0xaa00aa,
                direction: new Vector3$1( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3$1( 1, 0, 0 ), degreesToRadians( 90 ) ),

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 )

        };

        this._setupHandles( this.handleGizmos );
        //        this.init()

    }

    raycast( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects );
        }

    }
}

/**
 * @module Controllers/ClippingController
 *
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example Todo
 *
 */


// Basic Geometries
class ClippingBox extends LineSegments$1 {

    constructor() {
        super();

        this.margin = 0.01;

        this.geometry         = new EdgesGeometry$1( new BoxBufferGeometry$1( 2, 2, 2 ) );
        this.material         = new LineBasicMaterial$1( {
            color: 0xffffff
        } );
        this.matrixAutoUpdate = false;

        // Planes
        this.normalPlanes = {
            normalRightSide:  new Vector3$1( -1, 0, 0 ),
            normalLeftSide:   new Vector3$1( 1, 0, 0 ),
            normalFrontSide:  new Vector3$1( 0, -1, 0 ),
            normalBackSide:   new Vector3$1( 0, 1, 0 ),
            normalTopSide:    new Vector3$1( 0, 0, -1 ),
            normalBottomSide: new Vector3$1( 0, 0, 1 )
        };

        this.planes = {
            rightSidePlane:  new Plane$1( this.normalPlanes.normalRightSide.clone(), 0 ),
            leftSidePlane:   new Plane$1( this.normalPlanes.normalLeftSide.clone(), 0 ),
            frontSidePlane:  new Plane$1( this.normalPlanes.normalFrontSide.clone(), 0 ),
            backSidePlane:   new Plane$1( this.normalPlanes.normalBackSide.clone(), 0 ),
            topSidePlane:    new Plane$1( this.normalPlanes.normalTopSide.clone(), 0 ),
            bottomSidePlane: new Plane$1( this.normalPlanes.normalBottomSide.clone(), 0 )
        };

        this._boundingBox = new Box3$1();

    }

    getBoundingSphere() {

        this.geometry.computeBoundingSphere();
        this.geometry.boundingSphere.applyMatrix4( this.matrixWorld );

        return this.geometry.boundingSphere

    }

    setColor( color ) {

        this.material.color.set( color );

    }

    applyClippingTo( state, objects ) {

        if ( isNotDefined( objects ) ) { return }

        let planes = [];
        for ( let i in this.planes ) {
            planes.push( this.planes[ i ] );
        }

        objects.traverse( ( object ) => {

            if ( isNotDefined( object ) ) { return }
            if ( isNotDefined( object.geometry ) ) { return }
            if ( isNotDefined( object.material ) ) { return }

            const materials = isArray( object.material ) ? object.material : [ object.material ];

            for ( let materialIndex = 0, numberOfMaterial = materials.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                let material = materials[ materialIndex ];
                if ( !material.clippingPlanes ) {
                    material.clippingPlanes = [];
                }
                material.clippingPlanes = ( state ) ? planes : [];
            }

        } );

    }

    updateSize( size ) {

        this.scale.set( size.x, size.y, size.z );

    }

    update() {

        this._boundingBox.setFromObject( this );

        const margin = this.margin;
        const min    = this._boundingBox.min;
        const max    = this._boundingBox.max;

        this.planes.rightSidePlane.constant  = max.x + margin;
        this.planes.leftSidePlane.constant   = -min.x + margin;
        this.planes.frontSidePlane.constant  = max.y + margin;
        this.planes.backSidePlane.constant   = -min.y + margin;
        this.planes.topSidePlane.constant    = max.z + margin;
        this.planes.bottomSidePlane.constant = -min.z + margin;

    }

}

// Controller
const ClippingModes = /*#__PURE__*/toEnum( {
    None:      'None',
    Translate: 'Translate',
    Rotate:    'Rotate',
    Scale:     'Scale'
} );

class ClippingControls extends Object3D$2 {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                camera:        null,
                domElement:    window,
                mode:          ClippingModes.None,
                objectsToClip: new Object3D$2()
            }, ...parameters
        };

        super();

        // Need to be defined before domElement to make correct binding events
        this._handlers = {
            onMouseEnter:  this._onMouseEnter.bind( this ),
            onMouseLeave:  this._onMouseLeave.bind( this ),
            onMouseDown:   this._onMouseDown.bind( this ),
            onMouseMove:   this._onMouseMove.bind( this ),
            onMouseWheel:  this._onMouseWheel.bind( this ),
            onMouseUp:     this._onMouseUp.bind( this ),
            onDblClick:    this._onDblClick.bind( this ),
            onTouchStart:  this._onTouchStart.bind( this ),
            onTouchEnd:    this._onTouchEnd.bind( this ),
            onTouchCancel: this._onTouchCancel.bind( this ),
            onTouchLeave:  this._onTouchLeave.bind( this ),
            onTouchMove:   this._onTouchMove.bind( this ),
            onKeyDown:     this._onKeyDown.bind( this ),
            onKeyUp:       this._onKeyUp.bind( this )
        };

        this._events = {
            impose:     { type: 'impose' },
            dispose:    { type: 'dispose' },
            change:     { type: 'change' },
            translate:  { type: 'translate' },
            rotate:     { type: 'rotate' },
            scale:      { type: 'scale' },
            mouseEnter: { type: 'mouseEnter' },
            mouseLeave: { type: 'mouseLeave' },
            mouseDown:  { type: 'mouseDown' },
            mouseUp:    { type: 'mouseUp' }
        };

        // Could/Should(?) use the objectsToClip boundingbox if exist ! [only in case we are sure that boundingbox (is/must be) implemented for each object3D.]
        this._objectsToClipBoundingBox = new Box3$1();
        this._objectsToClipSize        = new Vector3$1();
        this._objectsToClipCenter      = new Vector3$1();

        this._clippingBox = new ClippingBox();
        this.add( this._clippingBox );

        this.camera           = _parameters.camera;
        this.domElement       = _parameters.domElement;
        this.mode             = _parameters.mode;
        this.objectsToClip    = _parameters.objectsToClip;
        this.translationSnap  = 0.1;
        this.scaleSnap        = 0.1;
        this.rotationSnap     = 0.1;
        this.matrixAutoUpdate = false;

        this.enabled = false; // Should be true by default

        this.size = 1;

        this._dragging          = false;
        this._firstPoint        = new Vector3$1();
        this._secondPoint       = new Vector3$1();
        this._mouseDisplacement = new Vector3$1();
        this._offset            = new Vector3$1();
        this._raycaster         = new Raycaster();
        this._pointerVector     = new Vector2();
        this._directionToMouse  = new Vector3$1();
        this._cameraPosition    = new Vector3$1();
        this._cameraDirection   = new Vector3$1();
        this._worldPosition     = new Vector3$1();
        this._worldRotation     = new Euler();

        this._gizmos = {
            //            'None':      null,
            'Translate': new TranslateGizmo(),
            'Scale':     new ScaleGizmo()
            //            'Rotate':    new RotateGizmo(),
        };
        for ( let mode in this._gizmos ) {
            this.add( this._gizmos[ mode ] );
        }
        this._currentGizmo  = null;
        this._currentHandle = null;

        // The actions map about input events
        this.actionsMap = {
            setMode: {
                translate: [ Keys.T.value ],
                rotate:    [ Keys.R.value ],
                scale:     [ Keys.S.value ]
            },
            translate: {
                front: [ Keys.Z.value, Keys.UP_ARROW.value ],
                back:  [ Keys.S.value, Keys.DOWN_ARROW.value ],
                up:    [ Keys.A.value, Keys.PAGE_UP.value ],
                down:  [ Keys.E.value, Keys.PAGE_DOWN.value ],
                left:  [ Keys.Q.value, Keys.LEFT_ARROW.value ],
                right: [ Keys.D.value, Keys.RIGHT_ARROW.value ]
            },
            scale: {
                widthPlus:   [ Keys.LEFT_ARROW.value ],
                widthMinus:  [ Keys.RIGHT_ARROW.value ],
                heightPlus:  [ Keys.PAGE_UP.value ],
                heightMinus: [ Keys.PAGE_DOWN.value ],
                depthPlus:   [ Keys.UP_ARROW.value ],
                depthMinus:  [ Keys.DOWN_ARROW.value ]
            },
            rotate: {
                xAxis: [ Keys.X.value ],
                yAxis: [ Keys.Y.value ],
                zAxis: [ Keys.Z.value ]
            }
        };

    }

    get objectsToClip() {
        return this._objectsToClip
    }

    set objectsToClip( value ) {

        if ( isNull( value ) ) { throw new Error( 'Objects to clip cannot be null ! Expect an instance of Object3D' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Objects to clip cannot be undefined ! Expect an instance of Object3D' ) }
        if ( !( value instanceof Object3D$2 ) ) { throw new Error( `Objects to clip cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

        this._objectsToClip = value;
        this.updateClipping();

    }

    get camera() {
        return this._camera
    }

    set camera( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !value.isCamera && !value.isPerspectiveCamera && !value.isOrthographicCamera ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera, PerspectiveCamera, or OrthographicCamera.` ) }

        this._camera = value;

    }

    get domElement() {
        return this._domElement
    }

    set domElement( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( !( ( value instanceof Window ) || ( value instanceof HTMLDocument ) || ( value instanceof HTMLDivElement ) || ( value instanceof HTMLCanvasElement ) ) ) { throw new Error( `Target cannot be an instance of ${ value.constructor.name }. Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.` ) }

        // Clear previous element
        if ( this._domElement ) {
            this._domElement.removeEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
            this._domElement.removeEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
            this.dispose();
        }

        this._domElement = value;
        this._domElement.addEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
        this._domElement.addEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
        this.impose();

    }

    get mode() {
        return this._mode
    }

    set mode( value ) {

        if ( isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from ClippingModes enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from ClippingModes enum.' ) }
        //        if ( !( value instanceof ClippingModes ) ) { throw new Error( `Mode cannot be an instance of ${value.constructor.name}. Expect a value from TClippingModes enum.` ) }

        this._mode = value;

        // Reset gizmos visibility
        for ( let mode in this._gizmos ) {
            this._gizmos[ mode ].visible = false;
        }

        if ( this._mode === ClippingModes.None ) {

            this._currentGizmo = null;

        } else {

            this._currentGizmo         = this._gizmos[ this._mode ];
            this._currentGizmo.visible = true;

        }

        this.updateGizmo();

    }

    setCamera( value ) {

        this.camera = value;
        return this

    }

    setDomElement( value ) {

        this.domElement = value;
        return this

    }

    setMode( value ) {

        this.mode = value;
        return this

    }

    setObjectsToClip( objects ) {

        this.objectsToClip = objects;
        return this

    }

    impose() {

        this._domElement.addEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.addEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.addEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.addEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.addEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.addEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.addEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.addEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.addEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.addEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.addEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.addEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( this._events.impose );

    }

    dispose() {

        this._domElement.removeEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.removeEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.removeEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.removeEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.removeEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.removeEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.removeEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.removeEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.removeEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.removeEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.removeEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.removeEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( this._events.dispose );

    }

    setTranslationSnap( translationSnap ) {
        this.translationSnap = translationSnap;
    }

    setRotationSnap( rotationSnap ) {
        this.rotationSnap = rotationSnap;
    }

    enable() {

        this.visible = true;
        this.enabled = true;

        // Init size and position
        if ( isDefined( this._objectsToClip ) ) {

            this._objectsToClipBoundingBox.setFromObject( this._objectsToClip );

            this._objectsToClipBoundingBox.getSize( this._objectsToClipSize );
            this._objectsToClipSize.divideScalar( 2 );
            this.scale.set( this._objectsToClipSize.x, this._objectsToClipSize.y, this._objectsToClipSize.z );

            this._objectsToClipBoundingBox.getCenter( this._objectsToClipCenter );
            this.position.set( this._objectsToClipCenter.x, this._objectsToClipCenter.y, this._objectsToClipCenter.z );

            // update...
            this.updateMatrix();
            this.updateMatrixWorld();
        }

        this.updateClipping();
        this.updateGizmo();

    }

    disable() {

        this.visible = false;
        this.enabled = false;
        this.updateClipping();

    }

    updateClipping() {

        if ( isNotDefined( this._objectsToClip ) ) { return }

        this._clippingBox.update();
        this._clippingBox.applyClippingTo( this.enabled, this._objectsToClip );

    }

    updateGizmo() {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( isNotDefined( this._currentGizmo ) ) { return }

        this._camera.getWorldPosition( this._cameraPosition );
        this._camera.getWorldDirection( this._cameraDirection );
        this._currentGizmo.update( this._cameraPosition, this._cameraDirection );

    }

    /// Handlers
    _consumeEvent( event ) {

        if ( !event.cancelable ) {
            return
        }

        event.stopImmediatePropagation();

    }

    // Keyboard
    _onKeyDown( keyEvent ) {

        if ( !this.enabled ) { return }
        keyEvent.preventDefault();

        const actionMap  = this.actionsMap;
        const key        = keyEvent.keyCode;
        //        const altActive   = keyEvent.altKey
        const ctrlActive = keyEvent.ctrlKey;
        //        const metaActive  = keyEvent.metaKey
        //        const shiftActive = keyEvent.shiftKey

        /* if ( altActive ) {

         } else */
        if ( ctrlActive ) {

            switch ( this._mode ) {

                case ClippingModes.Translate:

                    if ( actionMap.translate.front.includes( key ) ) {

                        this._translateZ( this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.back.includes( key ) ) {

                        this._translateZ( -this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.right.includes( key ) ) {

                        this._translateX( this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.left.includes( key ) ) {

                        this._translateX( -this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.up.includes( key ) ) {

                        this._translateY( this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.down.includes( key ) ) {

                        this._translateY( -this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    }

                    break

                case ClippingModes.Rotate:

                    break

                case ClippingModes.Scale:

                    if ( actionMap.scale.depthPlus.includes( key ) ) {

                        this._scaleZ( this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.depthMinus.includes( key ) ) {

                        this._scaleZ( -this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.widthPlus.includes( key ) ) {

                        this._scaleX( this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.widthMinus.includes( key ) ) {

                        this._scaleX( -this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.heightPlus.includes( key ) ) {

                        this._scaleY( this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.heightMinus.includes( key ) ) {

                        this._scaleY( -this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    }

                    break

            }

            //        } else if ( metaActive ) {
            //        } else if ( shiftActive ) {
        } else if ( actionMap.setMode.translate.includes( key ) ) {

            this.setMode( ClippingModes.Translate );
            this.updateClipping();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.setMode.rotate.includes( key ) ) {

            this.setMode( ClippingModes.Rotate );
            this.updateClipping();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.setMode.scale.includes( key ) ) {

            this.setMode( ClippingModes.Scale );
            this.updateClipping();
            this._consumeEvent( keyEvent );

        }

    }

    _onKeyUp( keyEvent ) {

        if ( !this.enabled || keyEvent.defaultPrevented ) { return }
        keyEvent.preventDefault();

        // Todo...

    }

    // Mouse
    _onDblClick( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault();

        // Todo...

    }

    _onMouseDown( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( mouseEvent.button !== Mouse.Left.value ) { return }
        if ( isNotDefined( this._currentHandle ) ) { return }

        mouseEvent.preventDefault();

        this._dragging = true;

        // Set the current plane to intersect with mouse
        // Add first reference to mouse position for next usage under mouse move
        const planeIntersect = this.intersectObjects( mouseEvent, [ this._currentGizmo.intersectPlane ] );
        if ( planeIntersect ) {
            this._firstPoint = planeIntersect.point;
        }

        this._consumeEvent( mouseEvent );
        this.dispatchEvent( this._events.mouseDown );

    }

    _onMouseEnter( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault();

        this.impose();
        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus();
        }

    }

    _onMouseLeave( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault();

        this._dragging = false;

        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur();
        }
        this.dispose();

    }

    _onMouseMove( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }

        mouseEvent.preventDefault();

        // Check for hovering or not
        if ( this._dragging === false ) {

            // Check mouseIn
            const intersect = this.intersectObjects( mouseEvent, [ this._currentGizmo ] );
            //            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.children )
            //            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
            if ( intersect ) {

                const handle = intersect.object;

                // Check if a previous handle is already selected
                if ( this._currentHandle && handle !== this._currentHandle ) {
                    this._currentHandle.highlight( false );
                    this.dispatchEvent( this._events.mouseLeave );
                }

                this._currentHandle = handle;
                this._currentHandle.highlight( true );
                this.dispatchEvent( this._events.mouseEnter );

                this._consumeEvent( mouseEvent );

            } else if ( isDefined( this._currentHandle ) ) {

                this._currentHandle.highlight( false );
                this._currentHandle = null;
                this.dispatchEvent( this._events.mouseLeave );

            }

        } else {

            const currentHandle     = this._currentHandle;
            const currentHandleName = currentHandle.name;

            const planeIntersect = this.intersectObjects( mouseEvent, [ this._currentGizmo.intersectPlane ] );
            if ( planeIntersect ) {

                this._secondPoint = planeIntersect.point;

            }

            // Update the mouse displacement in world coordinates
            this._mouseDisplacement.subVectors( this._secondPoint, this._firstPoint );
            this._firstPoint.copy( this._secondPoint );

            // Apply change
            switch ( this._mode ) {

                case ClippingModes.Translate:

                    if ( currentHandleName === 'X' ) {

                        this._offset.set( 1, 0, 0 );

                    } else if ( currentHandleName === 'Y' ) {

                        this._offset.set( 0, 1, 0 );

                    } else if ( currentHandleName === 'Z' ) {

                        this._offset.set( 0, 0, 1 );

                    } else if ( currentHandleName === 'XY' ) {

                        this._offset.set( 1, 1, 0 );

                    } else if ( currentHandleName === 'YZ' ) {

                        this._offset.set( 0, 1, 1 );

                    } else if ( currentHandleName === 'XZ' ) {

                        this._offset.set( 1, 0, 1 );

                    } else if ( currentHandleName === 'XYZ' ) {

                        this._offset.set( 1, 1, 1 );

                    }

                    this._offset.multiply( this._mouseDisplacement );
                    this._translate( this._offset );
                    break

                case ClippingModes.Rotate:
                    /*
                     if ( currentHandle.isRotateHandle ) {

                     } else if ( currentHandle.isPlaneHandle ) {

                     } else if ( currentHandle.isOmnidirectionalHandle ) {

                     }
                     */
                    break

                case ClippingModes.Scale:

                    if ( currentHandle.isScaleHandle ) {

                        this._offset
                            .copy( this._currentHandle.direction )
                            .multiply( this._mouseDisplacement );

                    } else if ( currentHandle.isPlaneHandle ) {

                        const xDot = this._currentHandle.xDirection.dot( this._mouseDisplacement );
                        if ( xDot > 0 ) {
                            this._offset.setX( Math.abs( this._mouseDisplacement.x ) );
                        } else if ( xDot < 0 ) {
                            this._offset.setX( -Math.abs( this._mouseDisplacement.x ) );
                        } else {
                            this._offset.setX( 0 );
                        }

                        const yDot = this._currentHandle.yDirection.dot( this._mouseDisplacement );
                        if ( yDot > 0 ) {
                            this._offset.setY( Math.abs( this._mouseDisplacement.y ) );
                        } else if ( yDot < 0 ) {
                            this._offset.setY( -Math.abs( this._mouseDisplacement.y ) );
                        } else {
                            this._offset.setY( 0 );
                        }

                        const zDot = this._currentHandle.zDirection.dot( this._mouseDisplacement );
                        if ( zDot > 0 ) {
                            this._offset.setZ( Math.abs( this._mouseDisplacement.z ) );
                        } else if ( zDot < 0 ) {
                            this._offset.setZ( -Math.abs( this._mouseDisplacement.z ) );
                        } else {
                            this._offset.setZ( 0 );
                        }

                    } else if ( currentHandle.isOmnidirectionalHandle ) {

                        this.getWorldPosition( this._worldPosition );
                        this._directionToMouse.subVectors( this._firstPoint, this._worldPosition );
                        const worldDot = this._directionToMouse.dot( this._mouseDisplacement );
                        const length   = ( worldDot > 0 ) ? this._mouseDisplacement.length() : -this._mouseDisplacement.length();
                        this._offset.set( length, length, length );

                    }

                    this._scale( this._offset );
                    break

                default:
                    throw new RangeError( `Invalid switch parameter: ${ this._mode }` )

            }

            this.updateClipping();
            this._consumeEvent( mouseEvent );
            this.dispatchEvent( this._events.change );

        }

    }

    _onMouseUp( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( mouseEvent.button !== Mouse.Left.value ) { return }
        // todo isActive when mouse enter

        mouseEvent.preventDefault();

        this._dragging = false;
        this.dispatchEvent( this._events.mouseUp );

        // Check mouseIn
        const intersect = this.intersectObjects( mouseEvent, [ this._currentGizmo ] );
        //        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.children )
        //        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
        if ( intersect ) {

            this._currentHandle = intersect.object;
            this._currentHandle.highlight( true );

            this._consumeEvent( mouseEvent );
            this.dispatchEvent( this._events.mouseEnter );

        } else if ( isDefined( this._currentHandle ) ) {

            this._currentHandle.highlight( false );
            this._currentHandle = null;

            this.dispatchEvent( this._events.mouseLeave );

        }

        this.updateGizmo();

    }

    _onMouseWheel( mouseEvent ) {

        if ( !this.enabled ) { return }
        mouseEvent.preventDefault();

        // Todo...

    }

    // Touche
    _onTouchCancel( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchEnd( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchLeave( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchMove( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchStart( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    /// Utils
    // eslint-disable-next-line no-unused-vars
    getActiveHandle( pointer ) {

    }

    intersectObjects( pointer, objects ) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        /*
         const mousePositionX  = mouseEvent.layerX || mouseEvent.offsetX || 1
         const mousePositionY  = mouseEvent.layerY || mouseEvent.offsetY || 1
         const containerWidth  = this._domElement.offsetWidth
         const containerHeight = this._domElement.offsetHeight
         const x               = ( mousePositionX / containerWidth ) * 2 - 1
         const y               = -( mousePositionY / containerHeight ) * 2 + 1
         */

        const clientRect = this._domElement.getBoundingClientRect();
        const x          = ( ( ( pointer.clientX - clientRect.left ) / clientRect.width ) * 2 ) - 1;
        const y          = ( -( ( pointer.clientY - clientRect.top ) / clientRect.height ) * 2 ) + 1;

        this._pointerVector.set( x, y );
        this._raycaster.setFromCamera( this._pointerVector, this._camera );

        const intersections = this._raycaster.intersectObjects( objects, false );
        return intersections[ 0 ] ? intersections[ 0 ] : null

    }

    // Methods

    // Moving
    _translate( displacement ) {

        this.position.add( displacement );
        this.updateMatrix();

    }

    _translateX( deltaX ) {

        this.position.setX( this.position.x + deltaX );
        this.updateMatrix();

    }

    _translateY( deltaY ) {

        this.position.setY( this.position.y + deltaY );
        this.updateMatrix();

    }

    _translateZ( deltaZ ) {

        this.position.setZ( this.position.z + deltaZ );
        this.updateMatrix();

    }

    _translateXY( deltaX, deltaY ) {

        this.position.setX( this.position.x + deltaX );
        this.position.setY( this.position.y + deltaY );
        this.updateMatrix();

    }

    _translateXZ( deltaX, deltaZ ) {

        this.position.setX( this.position.x + deltaX );
        this.position.setZ( this.position.z + deltaZ );
        this.updateMatrix();

    }

    _translateYZ( deltaY, deltaZ ) {

        this.position.setY( this.position.y + deltaY );
        this.position.setZ( this.position.z + deltaZ );
        this.updateMatrix();

    }

    _translateXYZ( deltaX, deltaY, deltaZ ) {

        this.position.set( this.position.x + deltaX, this.position.y + deltaY, this.position.z + deltaZ );
        this.updateMatrix();

    }

    // Rotating
    // eslint-disable-next-line no-unused-vars
    _rotateX( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateY( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateZ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXY( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXZ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateYZ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXYZ( delta ) {}

    // Scaling
    _scale( changeAmout ) {

        this.scale.add( changeAmout );
        this.updateMatrix();

    }

    _scaleX( deltaX ) {

        this.scale.setX( this.scale.x + deltaX );
        this.updateMatrix();

    }

    _scaleY( deltaY ) {

        this.scale.setY( this.scale.y + deltaY );
        this.updateMatrix();

    }

    _scaleZ( deltaZ ) {

        this.scale.setZ( this.scale.z + deltaZ );
        this.updateMatrix();

    }

    _scaleXY( deltaX, deltaY ) {

        this.scale.setX( this.scale.x + deltaX );
        this.scale.setY( this.scale.y + deltaY );
        this.updateMatrix();

    }

    _scaleXZ( deltaX, deltaZ ) {

        this.scale.setX( this.scale.x + deltaX );
        this.scale.setZ( this.scale.z + deltaZ );
        this.updateMatrix();

    }

    _scaleYZ( deltaY, deltaZ ) {

        this.scale.setY( this.scale.y + deltaY );
        this.scale.setZ( this.scale.z + deltaZ );
        this.updateMatrix();

    }

    _scaleXYZ( deltaX, deltaY, deltaZ ) {

        this.scale.set( this.scale.x + deltaX, this.scale.y + deltaY, this.scale.z + deltaZ );
        this.updateMatrix();

    }

}

/**
 * @module Managers/CurvesManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example Todo
 *
 */


class CurvesManager extends TDataBaseManager {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                basePath: '/curves'
            },
            ...parameters
        };

        super( _parameters );

    }

    convert( data ) {

        if ( !data ) {
            throw new Error( 'CurvesManager: Unable to convert null or undefined data !' )
        }

        const curveType = data.type;
        let curve       = undefined;

        switch ( curveType ) {

            case 'ArcCurve':
                curve = new ArcCurve$1();
                break

            case 'CatmullRomCurve3':
                curve = new CatmullRomCurve3$1();
                break

            case 'CubicBezierCurve':
                curve = new CubicBezierCurve$1();
                break

            case 'CubicBezierCurve3':
                curve = new CubicBezierCurve3$1();
                break

            case 'Curve':
                curve = new Curve$1();
                break

            case 'CurvePath':
                curve = new CurvePath$1();
                break

            case 'EllipseCurve':
                curve = new EllipseCurve$1();
                break

            case 'LineCurve':
                curve = new LineCurve$1();
                break

            case 'LineCurve3':
                curve = new LineCurve3$1();
                break

            // Missing NURBSCurve

            case 'Path':
                curve = new Path$1();
                break

            case 'QuadraticBezierCurve':
                curve = new QuadraticBezierCurve$1();
                break

            case 'QuadraticBezierCurve3':
                curve = new QuadraticBezierCurve3$1();
                break

            case 'SplineCurve':
                curve = new SplineCurve$1();
                break

            case 'Shape':
                curve = new Shape$1();
                break

            default:
                throw new Error( `TCurvesManager: Unknown curve of type: ${ curveType }` )

        }

        curve.fromJSON( data );

        return curve

    }

    _onJson( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( dataIndex / numberOfDatas );

        }

        onSuccess( results );

    }

}

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


const ArrayType = /*#__PURE__*/toEnum( {
    Int8Array:         0,
    Uint8Array:        1,
    Uint8ClampedArray: 2,
    Int16Array:        3,
    Uint16Array:       4,
    Int32Array:        5,
    Uint32Array:       6,
    Float32Array:      7,
    Float64Array:      8
} );

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
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:              '/geometries',
                projectionSystem:      'zBack',
                globalScale:           1,
                computeNormals:        true,
                computeBoundingBox:    true,
                computeBoundingSphere: true
            }, ...parameters
        };

        super( _parameters );

        this.projectionSystem      = _parameters.projectionSystem;
        this.globalScale           = _parameters.globalScale;
        this.computeNormals        = _parameters.computeNormals;
        this.computeBoundingBox    = _parameters.computeBoundingBox;
        this.computeBoundingSphere = _parameters.computeBoundingSphere;
    }

    //// Getter/Setter

    get computeBoundingBox() {
        return this._computeBoundingBox
    }

    set computeBoundingBox( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute bounding box cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute bounding box cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute bounding box cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeBoundingBox = value;
    }

    get computeBoundingSphere() {
        return this._computeBoundingSphere
    }

    set computeBoundingSphere( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute bounding sphere cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeBoundingSphere = value;
    }

    get computeNormals() {
        return this._computeNormals
    }

    set computeNormals( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute normals cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute normals cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute normals cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeNormals = value;
    }

    get projectionSystem() {
        return this._projectionSystem
    }

    set projectionSystem( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

        this._projectionSystem = value;

    }

    get globalScale() {
        return this._globalScale
    }

    set globalScale( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

        this._globalScale = value;

    }

    setComputeBoundingBox( value ) {

        this.computeBoundingBox = value;
        return this

    }

    setComputeBoundingShpere( value ) {

        this.computeBoundingSphere = value;
        return this

    }

    setComputeNormals( value ) {
        this.computeNormals = value;
        return this
    }

    setProjectionSystem( value ) {

        this.projectionSystem = value;
        return this

    }

    setGlobalScale( value ) {

        this.globalScale = value;
        return this

    }

    //// Methods

    _onJson( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( new ProgressEvent( 'GeometriesManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) );

        }

        onSuccess( results );

    }

    /**
     * @public
     * @memberOf GeometriesManager.prototype
     *
     * @param data
     * @returns {*}
     */
    convert( data ) {

        if ( !data ) {
            throw new Error( 'GeometriesManager: Unable to convert null or undefined data !' )
        }

        const geometryType = data.type;
        if ( !geometryType ) {
            throw new Error( 'GeometriesManager: Unable to convert untyped data !' )
        }

        let geometry = null;

        // Keep backward compat to next Major release
        if ( data.isBufferGeometry || geometryType.includes( 'BufferGeometry' ) ) {

            geometry = this._convertJsonToBufferGeometry( data );
            if ( this._computeNormals ) {
                geometry.computeVertexNormals();
            }

        } else if ( data.isGeometry || geometryType.includes( 'Geometry' ) ) {

            geometry = this._convertJsonToGeometry( data );
            if ( this._computeNormals ) {
                geometry.computeFaceNormals();
            }

        } else {

            throw new Error( `TGeometriesManager: Unable to retrieve geometry of type ${ geometryType } !` )

        }

        // Todo: Allow to force if exist
        if ( this.computeBoundingBox ) {
            geometry.boundingBox = null;
            geometry.computeBoundingBox();
        }

        if ( this.computeBoundingSphere ) {
            geometry.boundingSphere = null;
            geometry.computeBoundingSphere();
        }

        return geometry

    }

    _convertJsonToGeometry( data ) {

        const geometryType = data.types;
        let geometry       = null;

        switch ( geometryType ) {

            case 'BoxGeometry':
                geometry = new BoxGeometry$1();
                break

            case 'CircleGeometry':
                geometry = new CircleGeometry$1();
                break

            case 'CylinderGeometry':
                geometry = new CylinderGeometry$1();
                break

            case 'ConeGeometry':
                geometry = new ConeGeometry$1();
                break

            case 'EdgesGeometry':
                geometry = new EdgesGeometry$1();
                break

            case 'DodecahedronGeometry':
                geometry = new DodecahedronGeometry$1();
                break

            case 'ExtrudeGeometry':
                geometry = new ExtrudeGeometry$1();
                break

            case 'Geometry':
                geometry = new Geometry$2();
                break

            case 'IcosahedronGeometry':
                geometry = new IcosahedronGeometry$1();
                break

            case 'LatheGeometry':
                geometry = new LatheGeometry$1();
                break

            case 'OctahedronGeometry':
                geometry = new OctahedronGeometry$1();
                break

            case 'ParametricGeometry':
                geometry = new ParametricGeometry$1();
                break

            case 'PlaneGeometry':
                geometry = new PlaneGeometry$1();
                break

            case 'PolyhedronGeometry':
                geometry = new PolyhedronGeometry$1();
                break

            case 'RingGeometry':
                geometry = new RingGeometry$1();
                break

            case 'ShapeGeometry':
                geometry = new ShapeGeometry$1();
                break

            case 'TetrahedronGeometry':
                geometry = new TetrahedronGeometry$1();
                break

            case 'TextGeometry':
                geometry = new TextGeometry$1();
                break

            case 'TorusGeometry':
                geometry = new TorusGeometry$1();
                break

            case 'TorusKnotGeometry':
                geometry = new TorusKnotGeometry$1();
                break

            case 'TubeGeometry':
                geometry = new TubeGeometry$1();
                break

            case 'SphereGeometry':
                geometry = new SphereGeometry$1();
                break

            case 'WireframeGeometry':
                geometry = new WireframeGeometry$1();
                break

            default:
                throw new Error( `TGeometriesManager: Unknown geometry of type: ${ geometryType }` )

        }

        geometry.uuid = data.uuid;
        geometry.name = data.name;
        geometry.type = data.type;

        var vertices = [];
        var vertex   = undefined;
        for ( var index = 0, numberOfVertices = data.vertices.length ; index < numberOfVertices ; ++index ) {

            vertex = data.vertices[ index ];
            vertices.push( new Vector3$1( vertex.x, vertex.y, vertex.z ) );

        }
        geometry.vertices = vertices;
        //                geometry.colors                  = data.colors

        var faces = [];
        var face  = undefined;
        for ( var faceIndex = 0, numberOfFaces = data.faces.length ; faceIndex < numberOfFaces ; faceIndex++ ) {
            face = data.faces[ faceIndex ];
            faces.push( new Face3$1( face.a, face.b, face.c, face.normal, face.color, face.materialIndex ) );
        }
        geometry.faces         = faces;
        //                geometry.faceVertexUvs           = [ [ Number ] ]
        geometry.morphTargets  = [];
        geometry.morphNormals  = [];
        geometry.skinWeights   = [];
        geometry.skinIndices   = [];
        geometry.lineDistances = [];

        geometry.elementsNeedUpdate      = true; //data.elementsNeedUpdate
        geometry.verticesNeedUpdate      = true; //data.verticesNeedUpdate
        geometry.uvsNeedUpdate           = true; //data.uvsNeedUpdate
        geometry.normalsNeedUpdate       = true; //data.normalsNeedUpdate
        geometry.colorsNeedUpdate        = true; //data.colorsNeedUpdate
        geometry.lineDistancesNeedUpdate = true; //data.lineDistancesNeedUpdate
        geometry.groupsNeedUpdate        = true; //data.groupsNeedUpdate

    }

    _convertJsonToBufferGeometry( data ) {

        const bufferGeometryType = data.type;
        let bufferGeometry       = null;

        switch ( bufferGeometryType ) {

            case 'BoxBufferGeometry':
                bufferGeometry = new BoxBufferGeometry$1();
                break

            case 'BufferGeometry':
                bufferGeometry = new BufferGeometry$2();
                break

            case 'CircleBufferGeometry':
                bufferGeometry = new CircleBufferGeometry$1();
                break

            case 'CylinderBufferGeometry':
                bufferGeometry = new CylinderBufferGeometry$1();
                break

            case 'ConeBufferGeometry':
                bufferGeometry = new ConeBufferGeometry$1();
                break

            case 'DodecahedronBufferGeometry':
                bufferGeometry = new DodecahedronBufferGeometry();
                break

            case 'ExtrudeBufferGeometry':
                bufferGeometry = new ExtrudeBufferGeometry$1();
                break

            case 'IcosahedronBufferGeometry':
                bufferGeometry = new IcosahedronBufferGeometry$1();
                break

            case 'LatheBufferGeometry':
                bufferGeometry = new LatheBufferGeometry$1();
                break

            case 'OctahedronBufferGeometry':
                bufferGeometry = new OctahedronBufferGeometry$1();
                break

            case 'ParametricBufferGeometry':
                bufferGeometry = new ParametricBufferGeometry$1();
                break

            case 'PlaneBufferGeometry':
                bufferGeometry = new PlaneBufferGeometry$1();
                break

            case 'PolyhedronBufferGeometry':
                bufferGeometry = new PolyhedronBufferGeometry$1();
                break

            case 'RingBufferGeometry':
                bufferGeometry = new RingBufferGeometry$1();
                break

            case 'ShapeBufferGeometry':
                bufferGeometry = new BufferGeometry$2();
                //                bufferGeometry = new ShapeBufferGeometry(  )
                break

            case 'TetrahedronBufferGeometry':
                bufferGeometry = new TetrahedronBufferGeometry$1();
                break

            case 'TextBufferGeometry':
                bufferGeometry = new TextBufferGeometry$1();
                break

            case 'TorusBufferGeometry':
                bufferGeometry = new TorusBufferGeometry$1();
                break

            case 'TorusKnotBufferGeometry':
                bufferGeometry = new TorusKnotBufferGeometry$1();
                break

            case 'TubeBufferGeometry':
                bufferGeometry = new TubeBufferGeometry$1();
                break

            case 'SphereBufferGeometry':
                bufferGeometry = new SphereBufferGeometry$1();
                break

            case 'InstancedBufferGeometry':
                bufferGeometry = new InstancedBufferGeometry$1();
                break

            default:
                throw new Error( `TGeometriesManager: Unknown buffer geometry of type: ${ bufferGeometryType }` )

        }

        // COMMON PARTS
        bufferGeometry._id  = data._id;
        bufferGeometry.uuid = data.uuid;
        bufferGeometry.name = data.name;

        // Extract index
        const dataIndexes = data.index;
        if ( dataIndexes && dataIndexes.array && dataIndexes.array.length > 0 ) {

            const arrayBuffer    = this.__convertBase64ToArrayBuffer( dataIndexes.array );
            const typedArray     = this.__convertArrayBufferToTypedArray( arrayBuffer );
            bufferGeometry.index = new BufferAttribute$1( typedArray, dataIndexes.itemSize, dataIndexes.normalized );

        }

        // Extract attributes
        const dataAttributes = data.attributes;
        if ( dataAttributes ) {

            let attributes = {};

            // TODO: using loop instead !!
            const positionAttributes = dataAttributes.position;
            if ( positionAttributes ) {

                const arrayBuffer = this.__convertBase64ToArrayBuffer( positionAttributes.array );
                const typedArray  = this.__convertArrayBufferToTypedArray( arrayBuffer );
                const globalScale = this.globalScale;

                const positionArray = new Float32Array( typedArray );

                if ( this._projectionSystem === 'zBack' ) {

                    let x = null;
                    let y = null;
                    let z = null;
                    for ( let pi = 0, numPos = positionArray.length ; pi < numPos ; pi += 3 ) {
                        x                       = positionArray[ pi ] / globalScale;
                        y                       = positionArray[ pi + 2 ] / globalScale;
                        z                       = -positionArray[ pi + 1 ] / globalScale;
                        positionArray[ pi ]     = x;
                        positionArray[ pi + 1 ] = y;
                        positionArray[ pi + 2 ] = z;
                    }

                } else {

                    for ( let posIndex = 0, numPos = positionArray.length ; posIndex < numPos ; posIndex++ ) {
                        positionArray[ posIndex ] /= globalScale;
                    }

                }

                attributes[ 'position' ] = new BufferAttribute$1( positionArray, positionAttributes.itemSize, positionAttributes.normalized );

            }

            const normalAttributes = dataAttributes.normal;
            if ( normalAttributes ) {

                const arrayBuffer      = this.__convertBase64ToArrayBuffer( normalAttributes.array );
                const typedArray       = this.__convertArrayBufferToTypedArray( arrayBuffer );
                attributes[ 'normal' ] = new BufferAttribute$1( typedArray, normalAttributes.itemSize, normalAttributes.normalized );

            }

            const uvAttributes = dataAttributes.uv;
            if ( uvAttributes ) {

                const arrayBuffer  = this.__convertBase64ToArrayBuffer( uvAttributes.array );
                const typedArray   = this.__convertArrayBufferToTypedArray( arrayBuffer );
                attributes[ 'uv' ] = new BufferAttribute$1( typedArray, uvAttributes.itemSize, uvAttributes.normalized );

            }

            bufferGeometry.attributes = attributes;

        }

        if ( isDefined( data.groups ) ) {
            bufferGeometry.groups = data.groups;
        }

        // Need to set null because only checked vs undefined data.boundingBox
        if ( isDefined( data.boundingBox ) ) {
            bufferGeometry.boundingBox = data.boundingBox;
        }

        // idem... data.boundingSphere
        if ( isDefined( data.boundingSphere ) ) {
            bufferGeometry.boundingSphere = data.boundingSphere;
        }

        //        if ( isDefined( data.drawRange ) ) {
        //            bufferGeometry.drawRange = data.drawRange
        //        }

        if ( bufferGeometryType === 'ShapeBufferGeometry' ) {

            bufferGeometry.shapes        = data.shapes.map( jsonShape => {return new Shape$1().fromJSON( jsonShape )} );
            bufferGeometry.curveSegments = data.curveSegments;

        }

        return bufferGeometry

    }

    __convertArrayBufferToTypedArray( arrayBuffer ) {

        const ONE_BYTE       = 1;
        const TWO_BYTE       = 2;
        const FOUR_BYTE      = 4;
        const HEIGHT_BYTE    = 8;
        const dataView       = new DataView( arrayBuffer );
        const dataByteLength = arrayBuffer.byteLength - 1;
        const type           = dataView.getUint8( 0 );

        let typedArray = null;

        switch ( type ) {

            case ArrayType.Int8Array:
                typedArray = new Int8Array( dataByteLength / ONE_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getInt8( offset );
                }
                break

            case ArrayType.Uint8Array:
                typedArray = new Uint8Array( dataByteLength / ONE_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getUint8( offset );
                }
                break

            case ArrayType.Uint8ClampedArray:
                typedArray = new Uint8ClampedArray( dataByteLength / ONE_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getUint8( offset );
                }
                break

            case ArrayType.Int16Array:
                typedArray = new Int16Array( dataByteLength / TWO_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += TWO_BYTE ) {
                    typedArray[ index ] = dataView.getInt16( offset );
                }
                break

            case ArrayType.Uint16Array:
                typedArray = new Uint16Array( dataByteLength / TWO_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += TWO_BYTE ) {
                    typedArray[ index ] = dataView.getUint16( offset );
                }
                break

            case ArrayType.Int32Array:
                typedArray = new Int32Array( dataByteLength / FOUR_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getInt32( offset );
                }
                break

            case ArrayType.Uint32Array:
                typedArray = new Uint32Array( dataByteLength / FOUR_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getUint32( offset );
                }
                break

            case ArrayType.Float32Array:
                typedArray = new Float32Array( dataByteLength / FOUR_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getFloat32( offset );
                }
                break

            case ArrayType.Float64Array:
                typedArray = new Float64Array( dataByteLength / HEIGHT_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += HEIGHT_BYTE ) {
                    typedArray[ index ] = dataView.getFloat64( offset );
                }
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${ type }` )

        }

        return typedArray

    }

    __convertBase64ToArrayBuffer( base64 ) {

        const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const lookup = new Uint8Array( 256 );
        for ( let i = 0 ; i < chars.length ; i++ ) {
            lookup[ chars.charCodeAt( i ) ] = i;
        }

        ////////

        const base64Length = base64.length;

        let bufferLength = base64Length * 0.75;
        if ( base64[ base64Length - 1 ] === '=' ) {
            bufferLength--;
            if ( base64[ base64Length - 2 ] === '=' ) {
                bufferLength--;
            }
        }

        let arraybuffer = new ArrayBuffer( bufferLength );
        let bytes       = new Uint8Array( arraybuffer );
        let encoded1    = undefined;
        let encoded2    = undefined;
        let encoded3    = undefined;
        let encoded4    = undefined;

        for ( let i = 0, pointer = 0 ; i < base64Length ; i += 4 ) {
            encoded1 = lookup[ base64.charCodeAt( i ) ];
            encoded2 = lookup[ base64.charCodeAt( i + 1 ) ];
            encoded3 = lookup[ base64.charCodeAt( i + 2 ) ];
            encoded4 = lookup[ base64.charCodeAt( i + 3 ) ];

            bytes[ pointer++ ] = ( encoded1 << 2 ) | ( encoded2 >> 4 );
            bytes[ pointer++ ] = ( ( encoded2 & 15 ) << 4 ) | ( encoded3 >> 2 );
            bytes[ pointer++ ] = ( ( encoded3 & 3 ) << 6 ) | ( encoded4 & 63 );
        }

        return arraybuffer

    }

}

/**
 * @module Managers/TexturesManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class TexturesManager extends TDataBaseManager {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                basePath: '/textures'
            },
            ...parameters
        };

        super( _parameters );

    }

    convert( data ) {

        if ( !data ) {
            throw new Error( 'TexturesManager: Unable to convert null or undefined data !' )
        }

        const textureType = data.type;
        //        let texture       = undefined

        switch ( textureType ) {

            default:
                throw new Error( `TTexturesManager: Unknown texture of type: ${ textureType }` )

        }

        // Common object properties

        //        if ( textureType === 'Line' ) { }
        //        return texture

    }

    _onJson( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( dataIndex / numberOfDatas );

        }

        onSuccess( results );
    }

}

/**
 * @module Managers/MaterialsManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @requires TDataBaseManager
 *
 */


const DEFAULT_IMAGE = /*#__PURE__*/new ImageLoader().load(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4gkKDRoGpGNegQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=' );

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class MaterialsManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     * @param texturesPath
     * @param texturesProvider
     */
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:                '/materials',
                texturesPath:            '/textures',
                texturesProviderOptions: {},
                generateMipmap:          false,
                autoFillTextures:        true
            }, ...parameters
        };

        super( _parameters );

        this.texturesPath     = _parameters.texturesPath;
        this.generateMipmap   = _parameters.generateMipmap;
        this.autoFillTextures = _parameters.autoFillTextures;
        this.texturesProvider = new TextureLoader( _parameters.texturesProviderOptions );

    }

    get texturesPath() {
        return this._texturesPath
    }

    set texturesPath( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Textures path cannot be null ! Expect a non empty string.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Textures path cannot be undefined ! Expect a non empty string.' ) }
        if ( isNotString( value ) ) { throw new TypeError( `Textures path cannot be an instance of ${ value.constructor.name } ! Expect a non empty string.` ) }
        if ( isEmptyString( value ) ) { throw new TypeError( 'Textures path cannot be empty ! Expect a non empty string.' ) }
        if ( isBlankString( value ) ) { throw new TypeError( 'Textures path cannot contain only whitespace ! Expect a non empty string.' ) }

        this._texturesPath = value;

    }

    get texturesProvider() {
        return this._texturesProvider
    }

    set texturesProvider( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Textures provider cannot be null ! Expect an instance of TextureLoader.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Textures provider cannot be undefined ! Expect an instance of TextureLoader.' ) }
        if ( !( value instanceof TexturesManager ) && !( value instanceof TextureLoader ) ) { throw new TypeError( `Textures provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TTexturesManager.` ) }

        this._texturesProvider = value;

    }

    get generateMipmap() {
        return this._generateMipmap
    }

    set generateMipmap( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Generate mipmap cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Generate mipmap cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Generate mipmap cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._generateMipmap = value;
    }

    get autoFillTextures() {
        return this._autoFillTextures
    }

    set autoFillTextures( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }

        this._autoFillTextures = value;

    }

    setTexturesPath( value ) {

        this.texturesPath = value;
        return this

    }

    setTexturesProvider( value ) {

        this.texturesProvider = value;
        return this

    }

    setGenerateMipmap( value ) {

        this.generateMipmap = value;
        return this

    }

    setAutoFillTextures( value ) {

        this.autoFillTextures = value;
        return this

    }

    //// Methods

    _onJson( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( new ProgressEvent( 'MaterialsManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) );

        }

        if ( this._autoFillTextures ) {
            this.fillTextures( results, onSuccess, onProgress, onError );
        } else {
            onSuccess( results );
        }

    }

    /**
     *
     * @param data
     * @return {undefined}
     */
    convert( data ) {

        if ( !data ) {
            throw new Error( 'MaterialsManager: Unable to convert null or undefined data !' )
        }

        const type   = data.type;
        let material = null;

        switch ( type ) {

            case 'MeshPhongMaterial': {
                material = new MeshPhongMaterial$1();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

                const specular = data.specular;
                if ( isDefined( specular ) ) {
                    material.specular = this._setColor( specular );
                }

                const shininess = data.shininess;
                if ( isDefined( shininess ) ) {
                    material.shininess = shininess;
                }

                const map = data.map;
                if ( isDefined( map ) ) {
                    material.map = map;
                }

                const lightMap = data.lightMap;
                if ( isDefined( lightMap ) ) {
                    material.lightMap = lightMap;
                }

                const lightMapIntensity = data.lightMapIntensity;
                if ( isDefined( lightMapIntensity ) ) {
                    material.lightMapIntensity = lightMapIntensity;
                }

                const aoMap = data.aoMap;
                if ( isDefined( aoMap ) ) {
                    material.aoMap = aoMap;
                }

                const aoMapIntensity = data.aoMapIntensity;
                if ( isDefined( aoMapIntensity ) ) {
                    material.aoMapIntensity = aoMapIntensity;
                }

                const emissive = data.emissive;
                if ( isDefined( emissive ) ) {
                    material.emissive = this._setColor( emissive );
                }

                const emissiveIntensity = data.emissiveIntensity;
                if ( isDefined( emissiveIntensity ) ) {
                    material.emissiveIntensity = emissiveIntensity;
                }

                const emissiveMap = data.emissiveMap;
                if ( isDefined( emissiveMap ) ) {
                    material.emissiveMap = emissiveMap;
                }

                const bumpMap = data.bumpMap;
                if ( isDefined( bumpMap ) ) {
                    material.bumpMap = bumpMap;
                }

                const bumpScale = data.bumpScale;
                if ( isDefined( bumpScale ) ) {
                    material.bumpScale = bumpScale;
                }

                const normalMap = data.normalMap;
                if ( isDefined( normalMap ) ) {
                    material.normalMap = normalMap;
                }

                const normalScale = data.normalScale;
                if ( isDefined( normalScale ) ) {
                    material.normalScale = this._setVector2( normalScale );
                }

                const displacementMap = data.displacementMap;
                if ( isDefined( displacementMap ) ) {
                    material.displacementMap = displacementMap;
                }

                const displacementScale = data.displacementScale;
                if ( isDefined( displacementScale ) ) {
                    material.displacementScale = displacementScale;
                }

                const displacementBias = data.displacementBias;
                if ( isDefined( displacementBias ) ) {
                    material.displacementBias = displacementBias;
                }

                const specularMap = data.specularMap;
                if ( isDefined( specularMap ) ) {
                    material.specularMap = specularMap;
                }

                const alphaMap = data.alphaMap;
                if ( isDefined( alphaMap ) ) {
                    material.alphaMap = alphaMap;
                }

                const envMap = data.envMap;
                if ( isDefined( envMap ) ) {
                    material.envMap = envMap;
                }

                const combine = data.combine;
                if ( isDefined( combine ) ) {
                    material.combine = combine;
                }

                const reflectivity = data.reflectivity;
                if ( isDefined( reflectivity ) ) {
                    material.reflectivity = reflectivity;
                }

                const refractionRatio = data.refractionRatio;
                if ( isDefined( refractionRatio ) ) {
                    material.refractionRatio = refractionRatio;
                }

                const wireframe = data.wireframe;
                if ( isDefined( wireframe ) ) {
                    material.wireframe = wireframe;
                }

                const wireframeLinewidth = data.wireframeLinewidth;
                if ( isDefined( wireframeLinewidth ) ) {
                    material.wireframeLinewidth = wireframeLinewidth;
                }

                const wireframeLinecap = data.wireframeLinecap;
                if ( isDefined( wireframeLinecap ) ) {
                    material.wireframeLinecap = wireframeLinecap;
                }

                const wireframeLinejoin = data.wireframeLinejoin;
                if ( isDefined( wireframeLinejoin ) ) {
                    material.wireframeLinejoin = wireframeLinejoin;
                }

                const skinning = data.skinning;
                if ( isDefined( skinning ) ) {
                    material.skinning = skinning;
                }

                const morphTargets = data.morphTargets;
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets;
                }

                const morphNormals = data.morphNormals;
                if ( isDefined( morphNormals ) ) {
                    material.morphNormals = morphNormals;
                }

            }
                break

            case 'MeshLambertMaterial': {
                material = new MeshLambertMaterial$1();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

                const map = data.map;
                if ( isDefined( map ) ) {
                    material.map = map;
                }

                const lightMap = data.lightMap;
                if ( isDefined( lightMap ) ) {
                    material.lightMap = lightMap;
                }

                const lightMapIntensity = data.lightMapIntensity;
                if ( isDefined( lightMapIntensity ) ) {
                    material.lightMapIntensity = lightMapIntensity;
                }

                const aoMap = data.aoMap;
                if ( isDefined( aoMap ) ) {
                    material.aoMap = aoMap;
                }

                const aoMapIntensity = data.aoMapIntensity;
                if ( isDefined( aoMapIntensity ) ) {
                    material.aoMapIntensity = aoMapIntensity;
                }

                const emissive = data.emissive;
                if ( isDefined( emissive ) ) {
                    material.emissive = this._setColor( emissive );
                }

                const emissiveIntensity = data.emissiveIntensity;
                if ( isDefined( emissiveIntensity ) ) {
                    material.emissiveIntensity = emissiveIntensity;
                }

                const emissiveMap = data.emissiveMap;
                if ( isDefined( emissiveMap ) ) {
                    material.emissiveMap = emissiveMap;
                }

                const specularMap = data.specularMap;
                if ( isDefined( specularMap ) ) {
                    material.specularMap = specularMap;
                }

                const alphaMap = data.alphaMap;
                if ( isDefined( alphaMap ) ) {
                    material.alphaMap = alphaMap;
                }

                const envMap = data.envMap;
                if ( isDefined( envMap ) ) {
                    material.envMap = envMap;
                }

                const combine = data.combine;
                if ( isDefined( combine ) ) {
                    material.combine = combine;
                }

                const reflectivity = data.reflectivity;
                if ( isDefined( reflectivity ) ) {
                    material.reflectivity = reflectivity;
                }

                const refractionRatio = data.refractionRatio;
                if ( isDefined( refractionRatio ) ) {
                    material.refractionRatio = refractionRatio;
                }

                const wireframe = data.wireframe;
                if ( isDefined( wireframe ) ) {
                    material.wireframe = wireframe;
                }

                const wireframeLinewidth = data.wireframeLinewidth;
                if ( isDefined( wireframeLinewidth ) ) {
                    material.wireframeLinewidth = wireframeLinewidth;
                }

                const wireframeLinecap = data.wireframeLinecap;
                if ( isDefined( wireframeLinecap ) ) {
                    material.wireframeLinecap = wireframeLinecap;
                }

                const wireframeLinejoin = data.wireframeLinejoin;
                if ( isDefined( wireframeLinejoin ) ) {
                    material.wireframeLinejoin = wireframeLinejoin;
                }

                const skinning = data.skinning;
                if ( isDefined( skinning ) ) {
                    material.skinning = skinning;
                }

                const morphTargets = data.morphTargets;
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets;
                }

                const morphNormals = data.morphNormals;
                if ( isDefined( morphNormals ) ) {
                    material.morphNormals = morphNormals;
                }

            }
                break

            case 'LineBasicMaterial': {
                material = new LineBasicMaterial$1();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

            }
                break

            case 'PointsMaterial': {
                material = new PointsMaterial$1();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

                const map = data.map;
                if ( isDefined( map ) ) {
                    material.map = map;
                }

                const morphTargets = data.morphTargets;
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets;
                }

                const size = data.size;
                if ( isDefined( size ) ) {
                    material.size = size;
                }

                const sizeAttenuation = data.sizeAttenuation;
                if ( isDefined( sizeAttenuation ) ) {
                    material.sizeAttenuation = sizeAttenuation;
                }

            }
                break

            default:
                throw new Error( `TMaterialsManager: Unmanaged material of type: ${ type }` )

        }

        return material

    }

    _fillBaseMaterialData( material, data ) {

        const _id = data._id;
        if ( isDefined( _id ) && isString( _id ) ) {
            material._id = _id;
        }

        const uuid = data.uuid;
        if ( isDefined( uuid ) && isString( uuid ) ) {
            material.uuid = uuid;
        }

        const name = data.name;
        if ( isDefined( name ) && isString( name ) ) {
            material.name = name;
        }

        const fog = data.fog;
        if ( isDefined( fog ) ) {
            material.fog = fog;
        }

        const lights = data.lights;
        if ( isDefined( lights ) ) {
            material.lights = lights;
        }

        const blending = data.blending;
        if ( isDefined( blending ) ) {
            material.blending = blending;
        }

        const side = data.side;
        if ( isDefined( side ) ) {
            material.side = side;
        }

        const flatShading = data.flatShading;
        if ( isDefined( flatShading ) ) {
            material.flatShading = flatShading;
        }

        const vertexColors = data.vertexColors;
        if ( isDefined( vertexColors ) ) {
            material.vertexColors = vertexColors;
        }

        const opacity = data.opacity;
        if ( isDefined( opacity ) ) {
            material.opacity = opacity;
        }

        const transparent = data.transparent;
        if ( isDefined( transparent ) ) {
            material.transparent = transparent;
        }

        const blendSrc = data.blendSrc;
        if ( isDefined( blendSrc ) ) {
            material.blendSrc = blendSrc;
        }

        const blendDst = data.blendDst;
        if ( isDefined( blendDst ) ) {
            material.blendDst = blendDst;
        }

        const blendEquation = data.blendEquation;
        if ( isDefined( blendEquation ) ) {
            material.blendEquation = blendEquation;
        }

        const blendSrcAlpha = data.blendSrcAlpha;
        if ( isDefined( blendSrcAlpha ) ) {
            material.blendSrcAlpha = blendSrcAlpha;
        }

        const blendDstAlpha = data.blendDstAlpha;
        if ( isDefined( blendDstAlpha ) ) {
            material.blendDstAlpha = blendDstAlpha;
        }

        const blendEquationAlpha = data.blendEquationAlpha;
        if ( isDefined( blendEquationAlpha ) ) {
            material.blendEquationAlpha = blendEquationAlpha;
        }

        const depthFunc = data.depthFunc;
        if ( isDefined( depthFunc ) ) {
            material.depthFunc = depthFunc;
        }

        const depthTest = data.depthTest;
        if ( isDefined( depthTest ) ) {
            material.depthTest = depthTest;
        }

        const depthWrite = data.depthWrite;
        if ( isDefined( depthWrite ) ) {
            material.depthWrite = depthWrite;
        }

        const clippingPlanes = data.clippingPlanes;
        if ( isDefined( clippingPlanes ) ) {
            material.clippingPlanes = clippingPlanes;
        }

        const clipIntersection = data.clipIntersection;
        if ( isDefined( clipIntersection ) ) {
            material.clipIntersection = clipIntersection;
        }

        const clipShadows = data.clipShadows;
        if ( isDefined( clipShadows ) ) {
            material.clipShadows = clipShadows;
        }

        const colorWrite = data.colorWrite;
        if ( isDefined( colorWrite ) ) {
            material.colorWrite = colorWrite;
        }

        const precision = data.precision;
        if ( isDefined( precision ) ) {
            material.precision = precision;
        }

        const polygonOffset = data.polygonOffset;
        if ( isDefined( polygonOffset ) ) {
            material.polygonOffset = polygonOffset;
        }

        const polygonOffsetFactor = data.polygonOffsetFactor;
        if ( isDefined( polygonOffsetFactor ) ) {
            material.polygonOffsetFactor = polygonOffsetFactor;
        }

        const polygonOffsetUnits = data.polygonOffsetUnits;
        if ( isDefined( polygonOffsetUnits ) ) {
            material.polygonOffsetUnits = polygonOffsetUnits;
        }

        const dithering = data.dithering;
        if ( isDefined( dithering ) ) {
            material.dithering = dithering;
        }

        const alphaTest = data.alphaTest;
        if ( isDefined( alphaTest ) ) {
            material.alphaTest = alphaTest;
        }

        const premultipliedAlpha = data.premultipliedAlpha;
        if ( isDefined( premultipliedAlpha ) ) {
            material.premultipliedAlpha = premultipliedAlpha;
        }

        const overdraw = data.overdraw;
        if ( isDefined( overdraw ) ) {
            material.overdraw = overdraw;
        }

        const visible = data.visible;
        if ( isDefined( visible ) ) {
            material.visible = visible;
        }

        const userData = data.userData;
        if ( isDefined( userData ) ) {
            material.userData = userData;
        }

        const needsUpdate = data.needsUpdate;
        if ( isDefined( needsUpdate ) ) {
            material.needsUpdate = needsUpdate;
        }

    }

    _setVector2( vec2 ) {

        const x = vec2.x;
        const y = vec2.y;
        if ( isNotDefined( x ) || isNotDefined( y ) ) {
            throw new Error( 'MaterialsManager: Unable to convert null or undefined vector 2 !' )
        }

        return new Vector2( x, y )

    }

    _setColor( color ) {

        const r = color.r;
        const g = color.g;
        const b = color.b;
        if ( isNotDefined( r ) || isNotDefined( g ) || isNotDefined( b ) ) {
            throw new Error( 'MaterialsManager: Unable to convert null or undefined color !' )
        }

        return new Color$1( r, g, b )

    }

    fillTextures( materials, onSuccess/*, onProgress, onError */ ) {

        const texturesMap = this._retrieveTexturesOf( materials );

        for ( let key in materials ) {

            const material = materials[ key ];
            const textures = texturesMap[ key ];

            for ( let textureKey in textures ) {
                material[ textureKey ] = textures[ textureKey ];
            }

        }

        // Don't forget to return all input object to callback,
        // else some ids won't never be considered as processed !
        onSuccess( materials );

    }

    _retrieveTexturesOf( materials ) {

        const availableTextures = [ 'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap', 'displacementMap', 'specularMap', 'alphaMap', 'envMap' ];
        const texturesMap       = {};
        const localCache        = {};

        for ( let id in materials ) {

            const material = materials[ id ];

            let textures = {};
            for ( let i = 0, numberOfAvailableTextures = availableTextures.length ; i < numberOfAvailableTextures ; i++ ) {
                let mapType = availableTextures[ i ];

                const map = material[ mapType ];
                if ( isDefined( map ) && isString( map ) && isNotEmptyString( map ) ) {

                    const texturePath  = `${ this._texturesPath }/${ map }`;
                    const cachedResult = localCache[ texturePath ];

                    if ( isDefined( cachedResult ) ) {

                        textures[ mapType ] = cachedResult;

                    } else {

                        const texture = this._texturesProvider.load(
                            texturePath,
                            () => {},
                            () => {},
                            () => {

                                if ( !texture.image ) {
                                    texture.image       = DEFAULT_IMAGE;
                                    texture.needsUpdate = true;
                                }

                            }
                        );
                        texture.name  = map;

                        if ( !this._generateMipmap ) {
                            texture.generateMipmaps = false;
                            texture.magFilter       = LinearFilter;
                            texture.minFilter       = LinearFilter;
                        }

                        localCache[ texturePath ] = texture;
                        textures[ mapType ]       = texture;

                    }

                }

            }

            texturesMap[ id ] = textures;

        }

        return texturesMap

    }

}

/**
 * @module Managers/ObjectsManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */


/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class ObjectsManager extends TDataBaseManager {

    /**
     *
     * @param parameters
     */
    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:                  '/objects',
                geometriesProviderOptions: {},
                materialsProviderOptions:  {},
                projectionSystem:          'zBack',
                globalScale:               1,
                autoFillObjects3D:         true
            }, ...parameters
        };

        super( _parameters );

        this.projectionSystem   = _parameters.projectionSystem;
        this.globalScale        = _parameters.globalScale;
        this.autoFillObjects3D  = _parameters.autoFillObjects3D;
        this.geometriesProvider = new GeometriesManager( _parameters.geometriesProviderOptions );
        this.materialsProvider  = new MaterialsManager( _parameters.materialsProviderOptions );

    }

    //// Getter/Setter

    get geometriesProvider() {
        return this._geometriesProvider
    }

    set geometriesProvider( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Geometries provider cannot be null ! Expect an instance of GeometriesManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Geometries provider cannot be undefined ! Expect an instance of GeometriesManager.' ) }
        if ( !( value instanceof GeometriesManager ) ) { throw new TypeError( `Geometries provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TGeometriesManager.` ) }

        this._geometriesProvider = value;

    }

    get materialsProvider() {
        return this._materialsProvider
    }

    set materialsProvider( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Materials provider cannot be null ! Expect an instance of MaterialsManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Materials provider cannot be undefined ! Expect an instance of MaterialsManager.' ) }
        if ( !( value instanceof MaterialsManager ) ) { throw new TypeError( `Materials provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TMaterialsManager.` ) }

        this._materialsProvider = value;

    }

    get projectionSystem() {
        return this._projectionSystem
    }

    set projectionSystem( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

        this._projectionSystem = value;

    }

    get globalScale() {
        return this._globalScale
    }

    set globalScale( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

        this._globalScale = value;

    }

    get autoFillObjects3D() {
        return this._autoFillObjects3D
    }

    set autoFillObjects3D( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }

        this._autoFillObjects3D = value;

    }

    setGeometriesProvider( value ) {

        this.geometriesProvider = value;
        return this

    }

    setMaterialsProvider( value ) {

        this.materialsProvider = value;
        return this

    }

    setProjectionSystem( value ) {

        this.projectionSystem = value;
        return this

    }

    setGlobalScale( value ) {

        this.globalScale = value;
        return this

    }

    setAutoFillObjects3D( value ) {

        this.autoFillObjects3D = value;
        return this

    }

    //// Methods

    _onJson( jsonData, onSuccess, onProgress, onError ) {

        // Convert data from db to instanced object and add them into a map
        const results = {};
        for ( let dataIndex = 0, numberOfDatas = jsonData.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = jsonData[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( new ProgressEvent( 'ObjectsManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) );

        }

        // In case autoFill is true query materials and geometry
        if ( this._autoFillObjects3D ) {
            this.fillObjects3D( results, onSuccess, onProgress, onError );
        } else {
            onSuccess( results );
        }

    }

    // eslint-disable-next-line no-unused-vars
    _onArrayBuffer( data, onSuccess, onProgress, onError ) {}

    // eslint-disable-next-line no-unused-vars
    _onBlob( data, onSuccess, onProgress, onError ) {}

    // eslint-disable-next-line no-unused-vars
    _onText( data, onSuccess, onProgress, onError ) {}

    /**
     *
     * @param data
     * @return {*}
     */
    convert( data ) {

        if ( !data ) {
            throw new Error( 'ObjectsManager: Unable to convert null or undefined data !' )
        }

        const objectType = data.type;
        let object       = null;

        // Todo: Use factory instead and allow user to register its own object type !!!
        switch ( objectType ) {

            case 'Object3D':
                object = new Object3D$2();
                this._fillBaseObjectsData( object, data );
                break

            case 'Scene':
                object = new Scene$1();
                this._fillBaseObjectsData( object, data );
                if ( isDefined( data.background ) ) {

                    if ( Number.isInteger( data.background ) ) {

                        object.background = new Color$1( data.background );

                    }

                }
                if ( isDefined( data.fog ) ) {

                    if ( data.fog.type === 'Fog' ) {

                        object.fog = new Fog$1( data.fog.color, data.fog.near, data.fog.far );

                    } else if ( data.fog.type === 'FogExp2' ) {

                        object.fog = new FogExp2( data.fog.color, data.fog.density );

                    }

                }
                object.overrideMaterial = data.overrideMaterial;
                object.autoUpdate       = data.autoUpdate;
                break

            case 'PerspectiveCamera':
                object = new PerspectiveCamera$1();
                this._fillBaseObjectsData( object, data );
                object.fov    = data.fov;
                object.aspect = data.aspect;
                object.near   = data.near;
                object.far    = data.far;
                if ( isDefined( data.focus ) ) {
                    object.focus = data.focus;
                }
                if ( isDefined( data.zoom ) ) {
                    object.zoom = data.zoom;
                }
                if ( isDefined( data.filmGauge ) ) {
                    object.filmGauge = data.filmGauge;
                }
                if ( isDefined( data.filmOffset ) ) {
                    object.filmOffset = data.filmOffset;
                }
                if ( isDefined( data.view ) ) {
                    object.view = Object.assign( {}, data.view );
                }
                break

            case 'OrthographicCamera':
                object = new OrthographicCamera$1( data.left, data.right, data.top, data.bottom, data.near, data.far );
                this._fillBaseObjectsData( object, data );
                break

            case 'AmbientLight':
                object = new AmbientLight$1( data.color, data.intensity );
                this._fillBaseObjectsData( object, data );
                break

            case 'DirectionalLight':
                object = new DirectionalLight$1( data.color, data.intensity );
                this._fillBaseObjectsData( object, data );
                break

            case 'PointLight':
                object = new PointLight$1( data.color, data.intensity, data.distance, data.decay );
                this._fillBaseObjectsData( object, data );
                break

            case 'RectAreaLight':
                object = new RectAreaLight$1( data.color, data.intensity, data.width, data.height );
                this._fillBaseObjectsData( object, data );
                break

            case 'SpotLight':
                object = new SpotLight$1( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );
                this._fillBaseObjectsData( object, data );
                break

            case 'HemisphereLight':
                object = new HemisphereLight$1( data.color, data.groundColor, data.intensity );
                this._fillBaseObjectsData( object, data );
                break

            case 'SkinnedMesh':
                object = new SkinnedMesh$1();
                this._fillBaseObjectsData( object, data );
                object.geometry          = data.geometry;
                object.material          = data.material;
                object.drawMode          = data.drawMode;
                object.bindMode          = data.bindMode;
                object.bindMatrix        = data.bindMatrix;
                object.bindMatrixInverse = data.bindMatrixInverse;
                break

            case 'Mesh':
                object = new Mesh$1();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'LOD':
                object = new LOD$1();
                this._fillBaseObjectsData( object, data );
                object.levels = data.levels;
                break

            case 'Line':
                object = new Line$1();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'LineLoop':
                object = new LineLoop$1();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'LineSegments':
                object = new LineSegments$1();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'Points':
                object = new Points$1();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'Sprite':
                object = new Sprite$1();
                this._fillBaseObjectsData( object, data );
                object.material = data.material;
                break

            case 'Group':
                object = new Group$1();
                this._fillBaseObjectsData( object, data );
                break

            default:
                throw new Error( `TObjectsManager: Unknown object of type: ${ objectType }` )

        }

        return object

    }

    _fillBaseObjectsData( object, data ) {

        // Common object properties
        object._id = data._id;

        if ( isDefined( data.uuid ) ) {
            object.uuid = data.uuid;
        }

        if ( isDefined( data.name ) ) {
            object.name = data.name;
        }

        // IMPLICIT
        //        if ( isDefined( data.type ) ) {
        //            object.type = data.type
        //        }

        if ( isDefined( data.parent ) ) {
            object.parent = data.parent;
        }

        if ( isNotEmptyArray( data.children ) ) {
            object.children = data.children;
        }

        if ( isDefined( data.up ) ) {
            object.up.x = data.up.x;
            object.up.y = data.up.y;
            object.up.z = data.up.z;
        }

        if ( isDefined( data.position ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.position.x = data.position.x / this._globalScale;
                object.position.y = data.position.z / this._globalScale;
                object.position.z = -data.position.y / this._globalScale;

            } else {

                object.position.x = data.position.x / this._globalScale;
                object.position.y = data.position.y / this._globalScale;
                object.position.z = data.position.z / this._globalScale;

            }

        }

        if ( isDefined( data.rotation ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.rotation.x     = data.rotation.x;
                object.rotation.y     = data.rotation.z;
                object.rotation.z     = -data.rotation.y;
                object.rotation.order = data.rotation.order;

            } else {

                object.rotation.x     = data.rotation.x;
                object.rotation.y     = data.rotation.y;
                object.rotation.z     = data.rotation.z;
                object.rotation.order = data.rotation.order;

            }

        }

        if ( isDefined( data.quaternion ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.quaternion.x = data.quaternion.x;
                object.quaternion.y = data.quaternion.z;
                object.quaternion.z = -data.quaternion.y;
                object.quaternion.w = data.quaternion.w;

            } else {

                object.quaternion.x = data.quaternion.x;
                object.quaternion.y = data.quaternion.y;
                object.quaternion.z = data.quaternion.z;
                object.quaternion.w = data.quaternion.w;

            }

        }

        if ( isDefined( data.scale ) ) {

            if ( data.scale.x !== 0 && data.scale.y !== 0 && data.scale.z !== 0 ) {
                object.scale.x = data.scale.x;
                object.scale.y = data.scale.y;
                object.scale.z = data.scale.z;
            } else {
                this.logger.warn( 'Try to assign null scale !' );
            }

        }

        if ( isDefined( data.modelViewMatrix ) && isNotEmptyArray( data.modelViewMatrix ) ) {
            object.modelViewMatrix.fromArray( data.modelViewMatrix );
        }

        if ( isDefined( data.normalMatrix ) && isNotEmptyArray( data.normalMatrix ) ) {
            object.normalMatrix.fromArray( data.normalMatrix );
        }

        if ( isDefined( data.matrix ) && isNotEmptyArray( data.matrix ) ) {
            object.matrix.fromArray( data.matrix );
        }

        if ( isDefined( data.matrixWorld ) && isNotEmptyArray( data.matrixWorld ) ) {
            object.matrixWorld.fromArray( data.matrixWorld );
        }

        if ( isDefined( data.matrixAutoUpdate ) ) {
            object.matrixAutoUpdate = data.matrixAutoUpdate;
        }

        if ( isDefined( data.matrixWorldNeedsUpdate ) ) {
            object.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate;
        }

        if ( isDefined( data.layers ) ) {
            object.layers.mask = data.layers;
        }

        if ( isDefined( data.visible ) ) {
            object.visible = data.visible;
        }

        if ( isDefined( data.castShadow ) ) {
            object.castShadow = data.castShadow;
        }

        if ( isDefined( data.receiveShadow ) ) {
            object.receiveShadow = data.receiveShadow;
        }

        if ( isDefined( data.frustumCulled ) ) {
            object.frustumCulled = data.frustumCulled;
        }

        if ( isDefined( data.renderOrder ) ) {
            object.renderOrder = data.renderOrder;
        }

        if ( isDefined( data.userData ) ) {
            object.userData = data.userData;
        }

    }

    //// Callback

    /**
     *
     * @param objects
     * @param {GlobalFunction} onSuccess
     * @param {GlobalCallback} onProgress
     * @param {module:Managers/ObjectsManager~ObjectsManager~ClassCallback} onError
     */
    fillObjects3D( objects, onSuccess, onProgress, onError ) {

        const self = this;

        // Get objects that need geometry or materials
        const objectsArray = [];
        for ( let id in objects ) {

            const object = objects[ id ];
            if ( object.geometry || object.material ) {
                objectsArray.push( objects[ id ] );
            }

        }

        // In case no objects need to be filled return result
        if ( objectsArray.length === 0 ) {
            onSuccess( objects );
            return
        }

        // Else fill geometries and materials for filtered objects
        let geometriesMap = undefined;
        let materialsMap  = undefined;

        this._retrieveGeometriesOf( objectsArray, ( geometries ) => {
            geometriesMap = geometries;
            onEndDataFetching();
        }, onProgress, onError );

        this._retrieveMaterialsOf( objectsArray, ( materials ) => {
            materialsMap = materials;
            onEndDataFetching();
        }, onProgress, onError );

        function onEndDataFetching() {

            if ( !geometriesMap || !materialsMap ) { return }

            for ( let key in objects ) {
                const mesh = objects[ key ];
                self.applyGeometry( mesh, geometriesMap );
                self.applyMaterials( mesh, materialsMap );
            }

            // Don't forget to return all input object to callback,
            // else some ids won't never be considered as processed !
            onSuccess( objects );

        }

    }

    _retrieveGeometriesOf( meshes, onSuccess, onProgress, onError ) {

        const geometriesIds = meshes.map( object => object.geometry )
                                    .filter( ( value, index, self ) => {
                                        return value && self.indexOf( value ) === index
                                    } );

        if ( geometriesIds.length === 0 ) {
            onSuccess( {} );
            return
        }

        this._geometriesProvider.read(
            geometriesIds,
            null,
            onSuccess,
            onProgress,
            onError
        );

    }

    _retrieveMaterialsOf( meshes, onSuccess, onProgress, onError ) {

        const materialsArray       = meshes.map( object => object.material );
        const concatMaterialsArray = [].concat.apply( [], materialsArray );
        const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
            return value && self.indexOf( value ) === index
        } );

        if ( materialsIds.length === 0 ) {
            onSuccess( {} );
            return
        }

        this._materialsProvider.read(
            materialsIds,
            null,
            onSuccess,
            onProgress,
            onError
        );

    }

    /*
     ///// PROMISE

     async fillObjects3DByPromises ( objects, onSuccess, onProgress, onError ) {

     const self         = this
     const objectsArray = []
     for ( let id in objects ) {
     objectsArray.push( objects[ id ] )
     }

     const [ geometriesMap, materialsMap ] = await Promise.all( [
     this._getGeometriesPromiseOf( objectsArray, onProgress, onError ),
     this._getMaterialsPromiseOf( objectsArray, onProgress, onError )
     ] )

     for ( let key in objects ) {
     const mesh = objects[ key ]
     self.applyGeometry( mesh, geometriesMap )
     self.applyMaterials( mesh, materialsMap )
     }

     // Don't forget to return all input object to callback,
     // else some ids won't never be considered as processed !
     onSuccess( objects )

     }

     _getGeometriesPromiseOf ( meshes, onProgress, onError ) {

     const self = this

     return new Promise( function ( resolve, reject ) {

     const geometriesIds = meshes.map( object => object.geometry )
     .filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( geometriesIds.length === 0 ) {
     resolve( {} )
     return
     }

     self._geometriesProvider.read(
     geometriesIds,
     null,
     geometries => {
     resolve( geometries )
     },
     onProgress,
     onError
     )

     } )

     }

     _getMaterialsPromiseOf ( meshes, onProgress, onError ) {

     const self = this

     return new Promise( function ( resolve, reject ) {

     const materialsArray       = meshes.map( object => object.material )
     const concatMaterialsArray = [].concat.apply( [], materialsArray )
     const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( materialsIds.length === 0 ) {
     resolve( {} )
     return
     }

     self._materialsProvider.read(
     materialsIds,
     null,
     materials => {
     resolve( materials )
     },
     onProgress,
     onError
     )

     } )

     }

     ///// ASYNC

     async fillObjects3D ( objects, onSuccess, onProgress, onError ) {

     const self         = this
     const objectsArray = []
     for ( let id in objects ) {

     const object = objects[ id ]
     if ( object.geometry || object.material ) {
     objectsArray.push( objects[ id ] )
     }

     }

     if ( objectsArray.length === 0 ) {
     onSuccess( objects )
     return
     }

     let geometriesMap = undefined
     this._retrieveGeometriesOf( objectsArray, ( geometries ) => {
     geometriesMap = geometries
     onEndDataFetching()
     }, onProgress, onError )

     let materialsMap = undefined
     this._retrieveMaterialsOf( objectsArray, ( materials ) => {
     materialsMap = materials
     onEndDataFetching()
     }, onProgress, onError )

     function onEndDataFetching () {

     if ( !geometriesMap || !materialsMap ) { return }

     for ( let key in objects ) {
     const mesh = objects[ key ]
     self.applyGeometry( mesh, geometriesMap )
     self.applyMaterials( mesh, materialsMap )
     }

     // Don't forget to return all input object to callback,
     // else some ids won't never be considered as processed !
     onSuccess( objects )

     }

     }

     _retrieveGeometriesOf ( meshes, onSucess, onProgress, onError ) {

     const geometriesIds = meshes.map( object => object.geometry )
     .filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( geometriesIds.length === 0 ) {
     onSucess( {} )
     return
     }

     this._geometriesProvider.read(
     geometriesIds,
     null,
     onSucess,
     onProgress,
     onError
     )

     }

     _retrieveMaterialsOf ( meshes, onSucess, onProgress, onError ) {

     const materialsArray       = meshes.map( object => object.material )
     const concatMaterialsArray = [].concat.apply( [], materialsArray )
     const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( materialsIds.length === 0 ) {
     onSucess( {} )
     return
     }

     this._materialsProvider.read(
     materialsIds,
     null,
     onSucess,
     onProgress,
     onError
     )

     }

     /////////////
     */

    applyGeometry( object, geometries ) {

        const geometryId = object.geometry;
        if ( !geometryId ) {
            return
        }

        const geometry = geometries[ geometryId ];
        if ( !geometry ) {
            this.logger.error( 'Unable to retrieve geometry !!!' );
            return
        }

        object.geometry = geometry;

    }

    applyMaterials( object, materials ) {

        const materialIds = object.material;
        if ( !materialIds ) {
            return
        }

        if ( Array.isArray( materialIds ) ) {

            if ( materialIds.length === 1 ) {

                const materialId = materialIds[ 0 ];
                const material   = materials[ materialId ];
                if ( !material ) {
                    this.logger.error( 'Unable to retrieve material !!!' );
                    return null
                }

                object.material = material.clone();

            } else {

                object.material = [];
                for ( let materialIndex = 0, numberOfMaterial = materialIds.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                    const materialId = materialIds[ materialIndex ];
                    const material   = materials[ materialId ];
                    if ( !material ) {
                        this.logger.error( 'Unable to retrieve material !!!' );
                        return null
                    }

                    object.material.push( material.clone() );
                }
            }

        } else if ( typeof materialIds === 'string' ) {

            const material = materials[ materialIds ];
            if ( !material ) {
                this.logger.error( 'Unable to retrieve material !!!' );
                return
            }

            object.material = material.clone();

        } else {

            this.logger.error( 'Invalid material ids, expected string or array of string' );

        }

    }

}

/**
 * @module Objects3D/OrbitControlsHelper
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */


/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class OrbitControlsHelper extends LineSegments$1 {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                radius:     2,
                radials:    16,
                circles:    2,
                divisions:  64,
                innerColor: new Color$1( 0x444444 ),
                outerColor: new Color$1( 0x888888 )
            }, ...parameters
        };

        super(
            OrbitControlsHelper._createInternalGeometry( _parameters.radius, _parameters.radials, _parameters.circles, _parameters.divisions, _parameters.innerColor, _parameters.outerColor ),
            OrbitControlsHelper._createInternalMaterial()
        );


        this.matrixAutoUpdate = false;
        //        this.control     = control
        this._intervalId      = undefined;

        //        this.impose()

    }
    static _createInternalGeometry( RADIUS, RADIALS, CIRCLES, DIVISIONS, color1, color2 ) {

        const vertices = [];
        const colors   = [];

        let x,
            z,
            v,
            i,
            j,
            r,
            color;

        // create the radials
        for ( i = 0 ; i <= RADIALS ; i++ ) {

            v = ( i / RADIALS ) * ( Math.PI * 2 );

            x = Math.sin( v ) * RADIUS;
            z = Math.cos( v ) * RADIUS;

            vertices.push( 0, 0, 0 );
            vertices.push( x, 0, z );

            color = ( i & 1 ) ? color1 : color2;

            colors.push( color.r, color.g, color.b );
            colors.push( color.r, color.g, color.b );

        }

        // create the circles
        for ( i = 0 ; i <= CIRCLES ; i++ ) {

            color = ( i & 1 ) ? color1 : color2;

            r = RADIUS - ( RADIUS / CIRCLES * i );

            for ( j = 0 ; j < DIVISIONS ; j++ ) {

                // first vertex
                v = ( j / DIVISIONS ) * ( Math.PI * 2 );

                x = Math.sin( v ) * r;
                z = Math.cos( v ) * r;

                vertices.push( x, 0, z );
                colors.push( color.r, color.g, color.b );

                // second vertex
                v = ( ( j + 1 ) / DIVISIONS ) * ( Math.PI * 2 );

                x = Math.sin( v ) * r;
                z = Math.cos( v ) * r;

                vertices.push( x, 0, z );
                colors.push( color.r, color.g, color.b );

            }

            // create axis
            vertices.push(
                -1, 0, 0, 1, 0, 0,
                0, -1, 0, 0, 1, 0,
                0, 0, -1, 0, 0, 1
            );
            colors.push(
                0, 0, 0, 1, 0, 0, // black to red
                0, 0, 0, 0, 1, 0, // black to green
                0, 0, 0, 0, 0, 1 // black to blue
            );

        }

        const positionBufferAttribute = new Float32BufferAttribute( vertices, 3 );
        positionBufferAttribute.name  = 'TOrbitControlsHelperPositionBufferAttribute';

        const colorBufferAttribute = new Float32BufferAttribute( colors, 3 );
        colorBufferAttribute.name  = 'TOrbitControlsHelperColorBufferAttribute';

        const geometry = new BufferGeometry$2();
        geometry.setAttribute( 'position', positionBufferAttribute );
        geometry.setAttribute( 'color', colorBufferAttribute );
        geometry.name = 'TOrbitControlsHelperGeometry';

        return geometry

    }
    static _createInternalMaterial() {

        const material       = new LineBasicMaterial$1( { vertexColors: VertexColors } );
        material.transparent = true;
        material.opacity     = 0.0;
        material.name        = 'TOrbitControlsHelperMaterial';

        return material

    }
    startOpacityAnimation() {

        // In case fade off is running, kill it an restore opacity to 1
        if ( this._intervalId !== undefined ) {

            clearInterval( this._intervalId );
            this._intervalId = undefined;

        }

        this.material.opacity = 1.0;

    }

    endOpacityAnimation() {

        // Manage transparency interval
        this._intervalId = setInterval( function () {

            if ( this.material.opacity <= 0.0 ) {

                this.material.opacity = 0.0;
                clearInterval( this._intervalId );
                this._intervalId = undefined;

            } else {

                this.material.opacity -= 0.1;

            }

        }.bind( this ), 100 );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


//import { TorusBufferGeometry } from 'three-full/sources/geometries/TorusGeometry'

class TorusHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new TorusBufferGeometry$1( 1, 0.12, 4, 12, Math.PI )
            }, ...parameters
        };

        super( _parameters );
        this.isTorusHitbox = true;
        this.type          = 'TorusHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class RotateGizmo extends AbstractGizmo {

    constructor() {

        super();
        this.isRotateGizmo = true;
        this.type          = 'RotateGizmo';

        const CircleGeometry = ( radius, facing, arc ) => {

            const geometry = new BufferGeometry$2();
            let vertices   = [];
            arc            = arc ? arc : 1;

            for ( let i = 0 ; i <= 64 * arc ; ++i ) {

                if ( facing === 'x' ) {
                    vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
                }
                if ( facing === 'y' ) {
                    vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
                }
                if ( facing === 'z' ) {
                    vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );
                }

            }

            geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
            return geometry

        };

        this.handleGizmos = {

            X: [
                [ new Line$1( new CircleGeometry( 1, 'x', 0.5 ), new HighlightableLineMaterial( { color: 0xff0000 } ) ) ],
                [ new Mesh$1( new OctahedronBufferGeometry$1( 0.04, 0 ), new HighlightableMaterial( { color: 0xff0000 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Y: [
                [ new Line$1( new CircleGeometry( 1, 'y', 0.5 ), new HighlightableLineMaterial( { color: 0x00ff00 } ) ) ],
                [ new Mesh$1( new OctahedronBufferGeometry$1( 0.04, 0 ), new HighlightableMaterial( { color: 0x00ff00 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Z: [
                [ new Line$1( new CircleGeometry( 1, 'z', 0.5 ), new HighlightableLineMaterial( { color: 0x0000ff } ) ) ],
                [ new Mesh$1( new OctahedronBufferGeometry$1( 0.04, 0 ), new HighlightableMaterial( { color: 0x0000ff } ) ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ] ]
            ],

            E: [ [ new Line$1( new CircleGeometry( 1.25, 'z', 1 ), new HighlightableLineMaterial( { color: 0xcccc00 } ) ) ] ],

            XYZ: [ [ new Line$1( new CircleGeometry( 1, 'z', 1 ), new HighlightableLineMaterial( { color: 0x787878 } ) ) ] ]

        };

        this.pickerGizmos = {

            X: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, -Math.PI / 2, -Math.PI / 2 ] ] ],

            Y: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ] ],

            Z: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ] ],

            E: [
                [
                    new TorusHitbox( {
                        radius:          1.25,
                        tube:            0.12,
                        radialSegments:  2,
                        tubularSegments: 24
                    } )
                ]
            ],

            XYZ: [ [ new TorusHitbox() ] ]

        };

        //        this.pickerGizmos.XYZ[ 0 ][ 0 ].visible = false // disable XYZ picker gizmo

        this._setupHandles( this.handleGizmos );
        //        this.init()

    }

    raycast( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects );
        }

    }
    /*
     update ( rotation, eye2 ) {

     super.update( rotation, eye2 )

     const tempMatrix     = new Matrix4()
     const worldRotation  = new Euler( 0, 0, 1 )
     const tempQuaternion = new Quaternion()
     const unitX          = new Vector3( 1, 0, 0 )
     const unitY          = new Vector3( 0, 1, 0 )
     const unitZ          = new Vector3( 0, 0, 1 )
     const quaternionX    = new Quaternion()
     const quaternionY    = new Quaternion()
     const quaternionZ    = new Quaternion()
     const eye            = eye2.clone()

     worldRotation.copy( this.planes[ 'XY' ].rotation )
     tempQuaternion.setFromEuler( worldRotation )

     tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix )
     eye.applyMatrix4( tempMatrix )

     this.traverse( child => {

     tempQuaternion.setFromEuler( worldRotation )

     if ( child.name === 'X' ) {

     quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Y' ) {

     quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Z' ) {

     quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ )
     child.quaternion.copy( tempQuaternion )

     }

     } )

     }
     */

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


//import { BoxBufferGeometry } from 'three-full/sources/geometries/BoxGeometry'

class BoxHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new BoxBufferGeometry$1( 1, 1, 1, 1, 1, 1 )
            }, ...parameters
        };

        super( _parameters );
        this.isBoxHitbox = true;
        this.type        = 'BoxHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class BoxHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                boxColor:   0x104b83,
                edgesColor: 0x123456,
                hitbox:     new BoxHitbox( {
                    geometry: new BoxBufferGeometry$1( 1.1, 1.1, 1.1, 1, 1, 1 )
                } )
            }, ...parameters
        };

        super( _parameters );
        this.isOmnidirectionalHandle = true;
        this.type                    = 'OmnidirectionalHandle';

        ////

        const boxGeometry = new BoxBufferGeometry$1( 1.0, 1.0, 1.0, 1, 1, 1 );
        boxGeometry.name  = 'BoxHandle_Box_Geometry';

        const boxMaterial = new HighlightableMaterial( {
            color:       _parameters.boxColor,
            transparent: false,
            opacity:     1.0
        } );
        boxMaterial.name  = 'BoxHandle_Box_Material';

        const box            = new Mesh$1( boxGeometry, boxMaterial );
        box.name             = 'BoxHandle_Box';
        box.matrixAutoUpdate = false;

        this.add( box );

        ////

        const edgesGeometry = new EdgesGeometry$1( boxGeometry );
        edgesGeometry.name  = 'BoxHandle_Edges_Geometry';

        const edgesMaterial = new HighlightableLineMaterial( {
            color:       _parameters.edgesColor,
            linewidth:   4,
            transparent: false,
            opacity:     1.0
        } );
        edgesMaterial.name  = 'BoxHandle_Edges_Material';

        const edges            = new LineSegments$1( edgesGeometry, edgesMaterial );
        edges.name             = 'BoxHandle_Edges';
        edges.matrixAutoUpdate = false;

        this.add( edges );

    }

    update( cameraDirection ) {
        super.update( cameraDirection );

        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class ConeHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                coneColor:  0x104b83,
                edgesColor: 0x123456,
                hitbox:     new BoxHitbox( {
                    geometry: new ConeBufferGeometry$1( 1.1, 1.1 )
                } )
            }, ...parameters
        };

        super( _parameters );
        this.isOmnidirectionalHandle = true;
        this.type                    = 'OmnidirectionalHandle';

        ////

        const coneGeometry = new ConeBufferGeometry$1( 1.0, 1.0 );
        coneGeometry.name  = 'ConeHandle_Cone_Geometry';

        const coneMaterial = new HighlightableMaterial( {
            color:       _parameters.coneColor,
            transparent: false,
            opacity:     1.0
        } );
        coneMaterial.name  = 'ConeHandle_Cone_Material';

        const cone            = new Mesh$1( coneGeometry, coneMaterial );
        cone.name             = 'ConeHandle_Cone';
        cone.matrixAutoUpdate = true;

        this.add( cone );

        ////

        //        const edgesGeometry = new EdgesGeometry( coneGeometry )
        //        edgesGeometry.name  = 'ConeHandle_Edges_Geometry'
        //
        //        const edgesMaterial = new HighlightableLineMaterial( {
        //            color:       _parameters.edgesColor,
        //            linewidth:   4,
        //            transparent: false,
        //            opacity:     1.0
        //        } )
        //        edgesMaterial.name  = 'ConeHandle_Edges_Material'
        //
        //        const edges            = new LineSegments( edgesGeometry, edgesMaterial )
        //        edges.name             = 'ConeHandle_Edges'
        //        edges.matrixAutoUpdate = false
        //
        //        this.add( edges )

    }

    update( cameraDirection ) {
        super.update( cameraDirection );

        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class LookAtGizmo extends AbstractGizmo {


    //TYPE ENTITY ENUM COLOMNU

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                boxColor:   0xA9A9A9,
                edgesColor: 0xD3D3D3
            },
            ...parameters
        };

        super( _parameters );
        this.isLookAtGizmo = true;
        this.type          = 'LookAtGizmo';

        this.explodeFactor = 0.25;

        this.handleGizmos = {

            // Cone faces
            FACE_RIGHT: new ConeHandle( {
                coneColor: 0xdd0000
            } ).setPosition( +( 4 + this.explodeFactor ), 0, 0 )
               .setRotationFromAxisAndAngle( new Vector3$1( 0, 0, 1 ), degreesToRadians( 90 ) )
               .setScale( 1, 4, 1 ),

            FACE_LEFT: new ConeHandle( {
                coneColor: 0x550000
            } ).setPosition( -( 4 + this.explodeFactor ), 0, 0 )
               .setRotationFromAxisAndAngle( new Vector3$1( 0, 0, 1 ), degreesToRadians( -90 ) )
               .setScale( 1, 4, 1 ),

            FACE_TOP: new ConeHandle( {
                coneColor: 0x0000dd
            } ).setPosition( 0, +( 4 + this.explodeFactor ), 0 )
               .setRotationFromAxisAndAngle( new Vector3$1( 1, 0, 0 ), degreesToRadians( 180 ) )
               .setScale( 1, 4, 1 ),

            FACE_BOTTOM: new ConeHandle( {
                coneColor: 0x000055
            } ).setPosition( 0, -( 4 + this.explodeFactor ), 0 )
               .setScale( 1, 4, 1 ),

            FACE_FRONT: new ConeHandle( {
                coneColor: 0x005500
            } ).setPosition( 0, 0, +( 4 + this.explodeFactor ) )
               .setRotationFromAxisAndAngle( new Vector3$1( 1, 0, 0 ), degreesToRadians( -90 ) )
               .setScale( 1, 4, 1 ),

            FACE_BACK: new ConeHandle( {
                coneColor: 0x00dd00
            } ).setPosition( 0, 0, -( 4 + this.explodeFactor ) )
               .setRotationFromAxisAndAngle( new Vector3$1( 1, 0, 0 ), degreesToRadians( 90 ) )
               .setScale( 1, 4, 1 ),

            // Planar faces
            //            FACE_RIGHT:  new BoxHandle().setPosition( +( 2 + this.explodeFactor ), +0, +0 ).setScale( 1, 3, 3 ),
            //            FACE_LEFT:   new BoxHandle().setPosition( -( 2 + this.explodeFactor ), +0, +0 ).setScale( 1, 3, 3 ),
            //            FACE_TOP:    new BoxHandle().setPosition( +0, +( 2 + this.explodeFactor ), +0 ).setScale( 3, 1, 3 ),
            //            FACE_BOTTOM: new BoxHandle().setPosition( +0, -( 2 + this.explodeFactor ), +0 ).setScale( 3, 1, 3 ),
            //            FACE_FRONT:  new BoxHandle().setPosition( +0, +0, +( 2 + this.explodeFactor ) ).setScale( 3, 3, 1 ),
            //            FACE_BACK:   new BoxHandle().setPosition( +0, +0, -( 2 + this.explodeFactor ) ).setScale( 3, 3, 1 ),

            CORNER_TOP_LEFT_FRONT:     new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_TOP_LEFT_BACK:      new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_TOP_RIGHT_FRONT:    new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_TOP_RIGHT_BACK:     new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_LEFT_FRONT:  new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_LEFT_BACK:   new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_RIGHT_FRONT: new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_RIGHT_BACK:  new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),

            EDGE_TOP_FRONT:    new BoxHandle( _parameters ).setPosition( 0, +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_TOP_LEFT:     new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), 0 ).setScale( 1, 1, 3 ),
            EDGE_TOP_BACK:     new BoxHandle( _parameters ).setPosition( 0, +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_TOP_RIGHT:    new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), 0 ).setScale( 1, 1, 3 ),
            EDGE_LEFT_FRONT:   new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), 0, +( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_LEFT_BACK:    new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), 0, -( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_RIGHT_FRONT:  new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), 0, +( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_RIGHT_BACK:   new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), 0, -( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_BOTTOM_FRONT: new BoxHandle( _parameters ).setPosition( 0, -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_BOTTOM_LEFT:  new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), 0 ).setScale( 1, 1, 3 ),
            EDGE_BOTTOM_BACK:  new BoxHandle( _parameters ).setPosition( 0, -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_BOTTOM_RIGHT: new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), 0 ).setScale( 1, 1, 3 )

        };

        this._setupHandles( this.handleGizmos );

    }

    raycast( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            handle.raycast( raycaster, intersects );
        }

    }
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class RotateHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{}, ...parameters
        };

        super( _parameters );
        this.isRotateHandle = true;
        this.type           = 'RotateHandle';

    }

    update( cameraDirection ) {
        super.update( cameraDirection );


        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


//import { SphereBufferGeometry } from 'three-full/sources/geometries/SphereGeometry'

class SphericalHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new SphereBufferGeometry$1( 1, 8, 6, 0, 2 * Math.PI, 0, Math.PI )
            }, ...parameters
        };

        super( _parameters );
        this.isSphericalHitbox = true;
        this.type              = 'SphericalHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */


class HighlightableMesh extends Mesh$1 {

    constructor( geometry, parameters = {} ) {
        super( geometry, new HighlightableMaterial( {
            color:       parameters.color,
            transparent: true,
            opacity:     0.55
        } ) );

        this.isHighlightableMesh = true;
        this.type                = 'HighlightableMesh';

    }

    highlight( value ) {

        this.material.highlight( value );

    }

}

export { ASCLoader, AbstractGizmo, AbstractHandle, AbstractHitbox, BitArray, BitManager, CameraControlMode, CameraControls, ClippingBox, ClippingControls, ClippingModes, ColorPalette, Colors, CurvesManager, CylindricaHitbox, DBFLoader, Directions, GeometriesManager, HighlightableMesh, LASLoader, LookAtGizmo, LozengeHandle, LozengeHitbox, MaterialsManager, ObjectsManager, OctahedricalHandle, OctahedricalHitbox, OrbitControlsHelper, PlanarHitbox, PlaneHandle, PointClasses, RotateGizmo, RotateHandle, SHPLoader, ScaleGizmo, ScaleHandle, ShapeType, SphericalHitbox, TexturesManager, TorusHitbox, TranslateGizmo, TranslateHandle, registerPlugin };
//# sourceMappingURL=plugin.mjs.map
