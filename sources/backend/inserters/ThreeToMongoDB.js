/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { DefaultLogger }         from 'itee-client'
import { TAbstractDataInserter } from 'itee-database'
import {
    isArray,
    isDefined,
    isEmptyArray,
    isNotDefined,
    isNull
}                                from 'itee-validators'

class ThreeToMongoDB extends TAbstractDataInserter {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                logger: DefaultLogger,
            }, ...parameters
        }
        super( _parameters )

        this.logger = _parameters.logger
        this.mergeStrategy = 'add'

        // Addition
        // Update
        // Deletion

        // Add objects from file if missing in database
        // Remove objects from database if missing in file
        // Update objects in database if existing in file

    }

    // Utils
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

                const parentDocument = await this._readOneDocument( 'Objects3D', { _id: parentId } )
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
                    const dbChildren         = await this._readManyDocument( 'Objects3D', { parent: parentId } )
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
        }

    }

    async _parseObjects ( objects = [], parentId = null ) {

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

    async _parseObject ( object, parentId = null ) {

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
        let document = await this._readOneDocument( objectType, {
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
                const dbChildren         = await this._readManyDocument( 'Objects3D', { parent: document._id } )
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

    async _getOrCreateDocuments ( objects = [] ) {

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

    async _getOrCreateDocument ( data ) {

        if ( isNotDefined( data ) ) {
            return null
        }

        let document = await this._readOneDocument( data.type, { uuid: data.uuid } )
        if ( isDefined( document ) ) {
            document = await this._updateDocument( document, data )
        } else {
            document = await this._createDocument( data )
        }

        return document

    }

    // Create
    // Todo non async createDocument to allow multi promises at once
    async _createDocuments ( datas = [] ) {

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

    async _createDocument ( data ) {

        if ( isNotDefined( data ) ) {
            return null
        }

        const model         = this._driver.model( data.type )
        const savedDocument = await model( data ).save()
        return savedDocument._doc

    }

    // Read
    async _readOneDocument ( type, query ) {

        if ( isNotDefined( type ) || isNotDefined( query ) ) {
            return null
        }

        const model = await this._driver
                                .model( type )
                                .findOne( query )
                                .exec()

        return ( isDefined( model ) ) ? model._doc : null

    }

    async _readManyDocument ( type, query ) {

        if ( isNotDefined( type ) || isNotDefined( query ) ) {
            return null
        }

        let models = await this._driver
                                  .model( type )
                                  .find( query )
                                  .exec()

        return models.map( model => model._doc )

    }

    // Update
    async _updateDocuments ( documents = [], updateQuery, queryOptions ) {

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

    async _updateDocument ( document, updateQuery, queryOptions ) {

        if ( isNotDefined( document ) ) {
            return null
        }

        return await this._driver
                         .model( document.type )
                         .findByIdAndUpdate( document._id, updateQuery, queryOptions )
                         .exec()

    }

    // Delete
    async _deleteDocuments ( documents = [] ) {

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

    async _deleteDocument ( document ) {

        if ( isNotDefined( document ) ) {
            return null
        }

        return await this._driver
                         .model( document.type )
                         .findByIdAndDelete( document._id )
                         .exec()

    }

    ///
    async _removeChildrenDocuments ( documents ) {

        let removed = []
        for ( let childIndex = documents.length - 1 ; childIndex >= 0 ; childIndex-- ) {
            removed.push( this._removeChildDocument( documents[ childIndex ] ) )
        }
        return Promise.all( removed )

    }

    async _removeChildDocument ( document ) {

        // Remove children recursively
        const children = await this._readManyDocument( 'Objects3D', { parent: document._id } )
        await this._removeChildrenDocuments( children )

        // Remove geometry only if current object is the last that reference it
        await this._removeOrphanGeometryWithId( document.geometry )

        // Remove material only if current object is the last that reference it
        await this._removeOrphanMaterialsWithIds( document.material || [] )

        // finally remove the incriminated document
        await this._deleteDocument( document )

    }

    // Remove orphan geometry
    async _removeOrphanGeometryWithId ( geometryId ) {

        if ( isNotDefined( geometryId ) ) { return }

        const referencingObjects = await this._readManyDocument( 'Objects3D', { geometry: geometryId } )
        if ( referencingObjects.length > 1 ) { return }

        const geometryDocument = await this._readOneDocument( 'Geometries', { _id: geometryId } )
        await this._deleteDocument( geometryDocument )

    }

    // Remove only orphan materials
    async _removeOrphanMaterialsWithIds ( materialsIds ) {

        const removed = []
        for ( let index = 0, numberOfMaterials = materialsIds.length ; index < numberOfMaterials ; index++ ) {
            removed.push( this._removeOrphanMaterialWithId( materialsIds[ index ] ) )
        }

        return Promise.all( removed )

    }

    // Remove only orphan material
    async _removeOrphanMaterialWithId ( materialId ) {

        const referencingObjects = await this._readManyDocument( 'Objects3D', { material: materialId } )
        if ( referencingObjects.length > 1 ) { return }

        const materialDocument = await this._readOneDocument( 'Materials', { _id: materialId } )
        await this._deleteDocument( materialDocument )

    }

}

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

ThreeToMongoDB.AvailableLineTypes         = [ 'Line', 'LineLoop', 'LineSegments' ]
ThreeToMongoDB.AvailableLineMaterialTypes = [ 'LineBasicMaterial', 'LineDashedMaterial' ]

ThreeToMongoDB.AvailablePointTypes         = [ 'Points' ]
ThreeToMongoDB.AvailablePointMaterialTypes = [ 'PointsMaterial' ]

ThreeToMongoDB.AvailableSpriteTypes         = [ 'Sprite' ]
ThreeToMongoDB.AvailableSpriteMaterialTypes = [ 'SpriteMaterial' ]

export { ThreeToMongoDB }
