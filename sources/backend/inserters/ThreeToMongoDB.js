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

import { DefaultLogger }         from 'itee-core'
import { TAbstractDataInserter } from 'itee-database'
import {
    isArray,
    isDefined,
    isEmptyArray,
    isNotDefined,
    isNull
}                                from 'itee-validators'

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
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                logger: DefaultLogger
            }, ...parameters
        }
        super( _parameters )

        this.logger        = _parameters.logger
        this.mergeStrategy = 'add'

        this._cache = {}

        // Addition
        // Update
        // Deletion

        // Add objects from file if missing in database
        // Remove objects from database if missing in file
        // Update objects in database if existing in file

    }

    // Utils
    // Todo: Use itee-utils
    static _arrayify ( data ) {

        let array = []

        if ( isDefined( data ) ) {

            if ( isArray( data ) ) {
                array = data
            } else {
                array = [ data ]
            }

        }

        return array

    }

    static _toLog ( object ) {

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
    async _save ( data, parameters, onSuccess, onProgress, onError ) {

        const dataToParse = ThreeToMongoDB._arrayify( data )
        if ( isEmptyArray( dataToParse ) ) {
            onError( 'No data to save in database. Abort insert !' )
            return
        }

        const names = dataToParse.map( _data => _data.name )
        this.logger.log( `ThreeToMongoDB: Saving ${ names }` )

        // Check startegy
        if ( parameters.mergeStrategy ) {
            this.mergeStrategy = parameters.mergeStrategy
        }

        try {

            // Check if parent is required
            const parentId  = parameters.parentId
            let children    = null
            let childrenIds = null
            if ( isDefined( parentId ) ) {

                const parentDocument = await this._readDocument( 'Objects3D', { _id: parentId } )
                if ( isNull( parentDocument ) ) {
                    onError( `Unable to retrieve parent with id (${ parameters.parentId }). Abort insert !` )
                    return
                }

                // then update it
                if ( this.mergeStrategy === 'add' ) {

                    // If parent exist let create children
                    children    = await this._parseObjects( dataToParse, parentId )
                    childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : []

                    // Add children to given parent
                    await this._updateDocument( parentDocument, {
                        $addToSet: {
                            children: childrenIds
                        }
                    } )

                } else if ( this.mergeStrategy === 'replace' ) {

                    // Merge children into parent
                    //// Clean up current dbObject dependencies
                    // Children create and update will be perform on children iteration but remove need to be checked here !
                    const dbChildren         = await this._readDocuments( 'Objects3D', { parent: parentId } )
                    const childrenUuids      = dataToParse.map( child => child.uuid )
                    const dbChildrenToRemove = dbChildren.filter( dbChild => !childrenUuids.includes( dbChild.uuid ) )

                    await this._removeChildrenDocuments( dbChildrenToRemove )

                    // If parent exist let create children
                    children    = await this._parseObjects( dataToParse, parentId )
                    childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : []

                    await this._updateDocument( parentDocument, {
                        $set: {
                            children: childrenIds
                        }
                    } )

                }

            } else {

                // If not required just create children as root objects
                children    = await this._parseObjects( dataToParse, null )
                childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : []

            }

            this.logger.log( `ThreeToMongoDB: Saved ${ childrenIds }` )
            onSuccess()

        } catch ( error ) {
            onError( error )
        } finally {
            this._cache = {}
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
        this.logger.debug(`_parseObjects(...)`)

        const _objects = ThreeToMongoDB._arrayify( objects )
        if ( isEmptyArray( _objects ) ) {
            return null
        }

        const documents = []
        for ( let index = 0, numberOfObjects = _objects.length ; index < numberOfObjects ; index++ ) {
            documents.push( this._parseObject( _objects[ index ], parentId ) )
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
        this.logger.debug( `_parseObject(${ ThreeToMongoDB._toLog( object ) }, ${ parentId })` )

        if ( isNotDefined( object ) ) {
            return null
        }

        // Preprocess objects here to save geometry, materials and related before to save the object itself
        const objectType      = object.type
        const objectName      = object.name
        const objectGeometry  = object.geometry
        const objectChildren  = ThreeToMongoDB._arrayify( object.children )
        const objectMaterials = ThreeToMongoDB._arrayify( object.material )

        // If it is a terminal object ( No children ) with an empty geometry
        if ( isDefined( objectGeometry ) && isEmptyArray( objectChildren ) ) {

            if ( objectGeometry.isGeometry ) {

                const vertices = objectGeometry.vertices
                if ( isNotDefined( vertices ) || isEmptyArray( vertices ) ) {
                    this.logger.error( `Leaf object ${ objectName } have a geometry that doesn't contain vertices ! Skip it.` )
                    return null
                }

            } else if ( objectGeometry.isBufferGeometry ) {

                const attributes = objectGeometry.attributes
                if ( isNotDefined( attributes ) ) {
                    this.logger.error( `Buffer geometry of ${ objectName } doesn't contain attributes ! Skip it.` )
                    return null
                }

                const positions = attributes.position
                if ( isNotDefined( positions ) || positions.count === 0 ) {
                    this.logger.error( `Leaf object ${ objectName } have a buffer geometry that doesn't contain position attribute ! Skip it.` )
                    return null
                }

            } else {
                this.logger.error( `Object ${ objectName } contain an unknown/unmanaged geometry of type ${ objectGeometry.type } ! Skip it.` )
                return null
            }

        }

        let availableMaterialTypes = null

        if ( ThreeToMongoDB.AvailableLineTypes.includes( objectType ) ) {

            if ( isNotDefined( objectGeometry ) ) {
                this.logger.error( `Missing geometry for object ${ object.name } of type ${ objectType }. Only Sprite can contains material without geometry ! Skip it.` )
                return null
            }

            availableMaterialTypes = ThreeToMongoDB.AvailableLineMaterialTypes

        } else if ( ThreeToMongoDB.AvailablePointTypes.includes( objectType ) ) {

            if ( isNotDefined( objectGeometry ) ) {
                this.logger.error( `Missing geometry for object ${ object.name } of type ${ objectType }. Only Sprite can contains material without geometry ! Skip it.` )
                return null
            }

            availableMaterialTypes = ThreeToMongoDB.AvailablePointMaterialTypes

        } else if ( ThreeToMongoDB.AvailableSpriteTypes.includes( objectType ) ) {

            availableMaterialTypes = ThreeToMongoDB.AvailableSpriteMaterialTypes

        }

        if ( availableMaterialTypes ) {

            for ( let materialIndex = 0, numberOfMaterials = objectMaterials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                const material     = objectMaterials[ materialIndex ]
                const materialType = material.type
                if ( !availableMaterialTypes.includes( materialType ) ) {
                    this.logger.error( `Object ${ objectName } of type ${ objectType }, contain an invalid material of type ${ materialType } ! Skip it.` )
                    return null
                }

            }

        }

        const geometry   = await this._getOrCreateDocuments( objectGeometry )
        const geometryId = ( isDefined( geometry ) ) ? geometry.filter( geometry => geometry ).map( geometry => geometry._id ).pop() : null

        const materials    = await this._getOrCreateDocuments( objectMaterials )
        const materialsIds = ( isDefined( materials ) ) ? materials.filter( material => material ).map( material => material._id ) : []

        // Check if object already exist
        // We could use getOrCreateDocument here only if children/geometry/materials cleanup is perform on schema database side
        let document = await this._readDocument( objectType, {
            uuid:   object.uuid,
            parent: parentId
        } )

        // Todo if document.parent != parentId warn id collision !n m
        if ( isDefined( document ) ) {

            // Check merge strategie
            // If add, only update existing and create new objects
            // else if replace, remove missings children from new data, update existing and create new
            if ( this.mergeStrategy === 'add' ) {

                const children    = await this._parseObjects( objectChildren, document._id )
                const childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : []

                await this._updateDocument( document, {
                    $addToSet: {
                        children: childrenIds // geometry: geometryId, // Geometry is not an array !!
                        // material: materialsIds // Should check which material still exist !!!
                    }
                } )

            } else if ( this.mergeStrategy === 'replace' ) {

                //// Clean up current dbObject dependencies
                // Children create and update will be perform on children iteration but remove need to be checked here !
                const dbChildren         = await this._readDocuments( 'Objects3D', { parent: document._id } )
                const childrenUuids      = objectChildren.map( child => child.uuid )
                const dbChildrenToRemove = dbChildren.filter( dbChild => !childrenUuids.includes( dbChild.uuid ) )

                await this._removeChildrenDocuments( dbChildrenToRemove )

                const children    = await this._parseObjects( objectChildren, document._id )
                const childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : []

                await this._updateDocument( document, {
                    $set: {
                        children: childrenIds,
                        geometry: geometryId,
                        material: materialsIds
                    }
                } )

            } else {
                this.logger.error( `Unknown/Unmanaged merge srategy ${ this.mergeStrategy }` )
            }

        } else {

            object.parent   = parentId
            object.children = []
            object.geometry = geometryId
            object.material = materialsIds
            document        = await this._createDocument( object )

            const children    = await this._parseObjects( objectChildren, document._id )
            const childrenIds = ( isDefined( children ) ) ? children.filter( child => child ).map( child => child._id ) : []

            await this._updateDocument( document, {
                $set: {
                    children: childrenIds,
                    geometry: geometryId,
                    material: materialsIds
                }
            } )

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
        this.logger.debug( `_getOrCreateDocuments(...)` )

        const _objects = ThreeToMongoDB._arrayify( objects )
        if ( isEmptyArray( _objects ) ) {
            return null
        }

        const documents = []
        for ( let index = 0, numberOfObjects = _objects.length ; index < numberOfObjects ; index++ ) {
            documents.push( this._getOrCreateDocument( _objects[ index ] ) )
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
        this.logger.debug( `_getOrCreateDocument(${ ThreeToMongoDB._toLog( data ) })` )

        if ( isNotDefined( data ) ) {
            return null
        }

        let document = await this._readDocument( data.type, { uuid: data.uuid } )
        if ( isDefined( document ) ) {
            document = await this._updateDocument( document, data )
        } else {
            document = await this._createDocument( data )
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
        this.logger.debug( `_createDocuments(...)` )

        const _datas = ThreeToMongoDB._arrayify( datas )
        if ( isEmptyArray( _datas ) ) {
            return null
        }

        const documents = []
        for ( let index = 0, numberOfDocuments = _datas.length ; index < numberOfDocuments ; index++ ) {
            documents.push( this._createDocument( _datas[ index ] ) )
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
        this.logger.debug( `_createDocument(${ ThreeToMongoDB._toLog( data ) })` )

        if ( isNotDefined( data ) ) {
            return null
        }

        const model = await this._driver
                                .model( data.type )( data )
                                .save()

        //        const model         = this._driver.model( data.type )
        //        const savedModel = await model( data ).save()

        const savedDocument = ( isDefined( model ) ) ? model._doc : null
        if ( savedDocument ) {
            this._cache[ savedDocument.uuid ] = savedDocument
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
        this.logger.debug( `_readDocuments(...)` )

        if ( isNotDefined( type ) || isNotDefined( query ) ) {
            return null
        }

        let models = await this._driver
                               .model( type )
                               .find( query )
                               .exec()

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
        this.logger.debug( `_readDocument(${ type }, ${ JSON.stringify( query ) })` )

        if ( isNotDefined( type ) || isNotDefined( query ) ) {
            return null
        }

        const cachedDocument = this._cache[ query.uuid ]
        if ( cachedDocument ) {
            return cachedDocument
        }

        const model = await this._driver
                                .model( type )
                                .findOne( query )
                                .exec()

        const readDocument = ( isDefined( model ) ) ? model._doc : null
        if ( readDocument ) {
            this._cache[ readDocument.uuid ] = readDocument
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
        this.logger.debug( `_updateDocuments(...)` )

        const _documents = ThreeToMongoDB._arrayify( documents )
        if ( isEmptyArray( _documents ) ) {
            return null
        }

        const updates = []
        for ( let index = 0, numberOfDocuments = _documents.length ; index < numberOfDocuments ; index++ ) {
            updates.push( this._updateDocument( _documents[ index ], updateQuery, queryOptions ) )
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
        this.logger.debug( `_updateDocument(${ ThreeToMongoDB._toLog( document ) }, ${ JSON.stringify( updateQuery ) }, ${ JSON.stringify( queryOptions ) })` )

        if ( isNotDefined( document ) ) {
            return null
        }

        const model = await this._driver
                                .model( document.type )
                                .findByIdAndUpdate( document._id, updateQuery, queryOptions )
                                .exec()

        const updatedDocument = ( isDefined( model ) ) ? model._doc : null
        if ( updatedDocument ) {
            this._cache[ updatedDocument.uuid ] = updatedDocument
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
        this.logger.debug( `_deleteDocuments(...)` )

        const _documents = ThreeToMongoDB._arrayify( documents )
        if ( isEmptyArray( _documents ) ) {
            return null
        }

        const deletes = []
        for ( let index = 0, numberOfDocuments = _documents.length ; index < numberOfDocuments ; index++ ) {
            deletes.push( this._deleteDocument( _documents[ index ] ) )
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
        this.logger.debug( `_deleteDocument(${ ThreeToMongoDB._toLog( document ) })` )

        if ( isNotDefined( document ) ) {
            return null
        }

        const model = await this._driver
                                .model( document.type )
                                .findByIdAndDelete( document._id )
                                .exec()

        const deletedDocument = ( isDefined( model ) ) ? model._doc : null
        if ( deletedDocument ) {
            delete this._cache[ deletedDocument.uuid ]
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
        this.logger.debug( `_removeChildrenDocuments(...)` )

        let removed = []
        for ( let childIndex = documents.length - 1 ; childIndex >= 0 ; childIndex-- ) {
            removed.push( this._removeChildDocument( documents[ childIndex ] ) )
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
        this.logger.debug( `_removeChildDocument(${ ThreeToMongoDB._toLog( document ) })` )

        // Remove children recursively
        const children = await this._readDocuments( 'Objects3D', { parent: document._id } )
        await this._removeChildrenDocuments( children )

        // Remove geometry only if current object is the last that reference it
        await this._removeOrphanGeometryWithId( document.geometry )

        // Remove material only if current object is the last that reference it
        await this._removeOrphanMaterialsWithIds( document.material || [] )

        // finally remove the incriminated document
        await this._deleteDocument( document )

    }

    /**
     * Remove geometry only in case it is orphan and no object still reference it.
     *
     * @param {Mongoose.ObjectId|String} geometryId - The geometry id to match for deletion
     * @returns {Promise<void>}
     * @private
     */
    async _removeOrphanGeometryWithId ( geometryId ) {
        this.logger.debug( `_removeOrphanGeometryWithId(${ geometryId })` )

        if ( isNotDefined( geometryId ) ) { return }

        const referencingObjects = await this._readDocuments( 'Objects3D', { geometry: geometryId } )
        if ( referencingObjects.length > 1 ) { return }

        const geometryDocument = await this._readDocument( 'Geometries', { _id: geometryId } )
        await this._deleteDocument( geometryDocument )

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
        this.logger.debug( `_removeOrphanMaterialsWithIds(...)` )

        const removed = []
        for ( let index = 0, numberOfMaterials = materialsIds.length ; index < numberOfMaterials ; index++ ) {
            removed.push( this._removeOrphanMaterialWithId( materialsIds[ index ] ) )
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
        this.logger.debug( `_removeOrphanMaterialWithId(${ materialId })` )

        const referencingObjects = await this._readDocuments( 'Objects3D', { material: materialId } )
        if ( referencingObjects.length > 1 ) { return }

        const materialDocument = await this._readDocument( 'Materials', { _id: materialId } )
        await this._deleteDocument( materialDocument )

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
]
ThreeToMongoDB.AvailableLineTypes           = [ 'Line', 'LineLoop', 'LineSegments' ]
ThreeToMongoDB.AvailableLineMaterialTypes   = [ 'LineBasicMaterial', 'LineDashedMaterial' ]
ThreeToMongoDB.AvailablePointTypes          = [ 'Points' ]
ThreeToMongoDB.AvailablePointMaterialTypes  = [ 'PointsMaterial' ]
ThreeToMongoDB.AvailableSpriteTypes         = [ 'Sprite' ]
ThreeToMongoDB.AvailableSpriteMaterialTypes = [ 'SpriteMaterial' ]

export { ThreeToMongoDB }
