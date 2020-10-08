/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @see [IFC Standard]{@link http://standards.buildingsmart.org/IFC/RELEASE/IFC4_1/FINAL/HTML/}
 *
 */

import { TMongooseController } from 'itee-mongodb'
import {
    isArray,
    isDefined,
    isNotDefined
}                              from 'itee-validators'

class TObjects3DController extends TMongooseController {

    constructor ( parameters = {} ) {
        super( parameters )
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

        if ( isNotDefined( type ) || isNotDefined( query ) ) {
            return null
        }

        const model = await this._driver
                                .model( type )
                                .findOne( query )
                                .exec()

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

        if ( isNotDefined( document ) ) {
            return null
        }

        return await this._driver
                         .model( document.type )
                         .findByIdAndUpdate( document._id, updateQuery, queryOptions )
                         .exec()

    }

    async getAllChildrenIds ( parentId, recursive = false ) {

        const result              = {
            children:   [],
            geometries: [],
            materials:  []
        }
        const subChildrenPromises = []
        const children            = await this._readManyDocument( 'Objects3D', { parent: parentId } )
        for ( let childIndex = 0, numberOfChildren = children.length ; childIndex < numberOfChildren ; childIndex++ ) {

            const child   = children[ childIndex ]
            const childId = child._id.toString()

            if ( isDefined( childId ) ) {
                result.children.push( childId )
            }

            const childGeometry = child.geometry
            if ( isDefined( childGeometry ) ) {
                result.geometries.push( childGeometry.toString() )
            }

            const childMaterials = child.material
            if ( childMaterials ) {
                const _materials = isArray( childMaterials ) ? childMaterials.map( mat => mat.toString() ) : [ childMaterials.toString() ]
                result.materials.push( ..._materials )
            }

            const subChildren = child.children
            if ( subChildren ) {
                const subChildrenPromise = this.getAllChildrenIds( childId, recursive )
                subChildrenPromises.push( subChildrenPromise )
            }

        }

        // Merge children results
        if ( subChildrenPromises.length > 0 ) {

            const promisesResults = await Promise.all( subChildrenPromises )
            for ( let resultIndex = 0, numberOfResults = promisesResults.length ; resultIndex < numberOfResults ; resultIndex++ ) {
                const promisesResult = promisesResults[ resultIndex ]
                result.children.push( ...promisesResult.children )
                result.geometries.push( ...promisesResult.geometries )
                result.materials.push( ...promisesResult.materials )
            }

        }


        return result

        //        //        console.time( 'Children.Map: ' )
        //        //        const result      = {
        //        //            children:   [],
        //        //            geometries: [],
        //        //            materials:  []
        //        //        }
        //        //        result.children   = children.map( child => child._id )
        //        //        result.geometries = children.map( child => child.geometry ).filter( geometry => geometry )
        //        //        result.materials  = children.map( child => child.material ).filter( material => material )
        //        //        console.timeEnd( 'Children.Map: ' )
        //
        //        // Alt
        //        //        console.time( 'Children.Reduce: ' )
        //        const result = {
        //            children:   [],
        //            geometries: [],
        //            materials:  []
        //        }
        //        children.reduce( ( accumulator, child ) => {
        //
        //            accumulator.children.push( child._id.toString() )
        //
        //            const childGeometry = child.geometry
        //            if ( isDefined( childGeometry ) ) {
        //                accumulator.geometries.push( child.geometry.toString() )
        //            }
        //
        //            const childMaterials = child.material
        //            if ( childMaterials ) {
        //                const _materials = isArray( childMaterials ) ? childMaterials.map( mat => mat.toString() ) : [ childMaterials.toString() ]
        //                accumulator.materials.push( ..._materials )
        //            }
        //
        //            return accumulator
        //
        //        }, result )
        //        //        console.timeEnd( 'Children.Reduce: ' )
        //
        //        if ( recursive ) {
        //
        //            const getAllChildrenPromises = []
        //            for ( let childIndex = 0, numberOfChildren = children.length ; childIndex < numberOfChildren ; childIndex++ ) {
        //                const child        = children[ childIndex ]
        //                const childId      = child._id
        //                const childPromise = this.getAllChildrenIds( childId, recursive )
        //                getAllChildrenPromises.push( childPromise )
        //            }
        //            const promisesResults = await Promise.all( getAllChildrenPromises )
        //            promisesResults.reduce( ( accumulator, child ) => {
        //
        //                result.children.push( ...child.children )
        //                result.geometries.push( ...child.geometries )
        //                result.materials.push( ...child.materials )
        //
        //                return result
        //
        //            }, result )
        //
        //        }
        //
        //                return {
        //                    children:   [ ...new Set( result.children ) ],
        //                    geometries: [ ...new Set( result.geometries ) ],
        //                    materials:  [ ...new Set( result.materials ) ]
        //                }

    }

    async _deleteOne ( id, response ) {

        console.time( '_deleteOne' )

        try {

            const alternative = [ 'oneByOne', 'allInOne' ][ 1 ]
            if ( alternative === 'oneByOne' ) {

                const document        = await this._readOneDocument( 'Objects3D', { _id: id } )
                const parentResult    = await this._removeParentReference( document )
                const childrenResults = await this._removeChildDocument( document )
                const deleteResult    = {
                    ...childrenResults,
                    parent: parentResult
                }

                TMongooseController.returnData( deleteResult, response )


            } else {

                const results = await this.getAllChildrenIds( id, true )
                results.children.push( id )

                const cleanResults = {
                    children:   [ ...new Set( results.children ) ],
                    geometries: [ ...new Set( results.geometries ) ],
                    materials:  [ ...new Set( results.materials ) ]
                }

                const deletedObjectsCount     = await this._deleteDocuments( 'Objects3D', cleanResults.children )
                const deletedGeometriesResult = await this._deleteDocuments( 'Geometries', cleanResults.geometries )
                const deletedMaterialsResult  = await this._deleteDocuments( 'Materials', cleanResults.materials )

                TMongooseController.returnData( {
                    deletedObjectsCount,
                    deletedGeometriesResult,
                    deletedMaterialsResult
                }, response )

            }

        } catch ( error ) {

            TMongooseController.returnError( error, response )

        } finally {

            console.timeEnd( '_deleteOne' )

        }

    }

    async _deleteDocuments ( type, documentIds ) {

        //        console.log( `Delete many: [${ documentIds }]` )

        const deleteResult = await this._driver
                                       .model( type )
                                       .deleteMany( {
                                           _id: {
                                               $in: documentIds
                                           }
                                       } )
                                       .exec()

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
        if ( isNotDefined( document ) ) { return null }

        console.log( `Delete: ${ document.name } [${ document._id }]` )

        const deleteResult = await this._driver
                                       .model( document.type )
                                       .findByIdAndDelete( document._id )
                                       .exec()

        return ( deleteResult && deleteResult._doc ) ? deleteResult._doc._id : null

    }

    ///

    async _removeParentReference ( document ) {
        const parentId = document.parent
        if ( isNotDefined( parentId ) ) { return null }

        const parentDocument         = await this._readOneDocument( 'Objects3D', { _id: parentId } )
        const childrenIds            = parentDocument.children
        const indexOfCurrentDocument = childrenIds.indexOf( document._id )
        childrenIds.splice( indexOfCurrentDocument, 1 )

        const updateResult = await this._updateDocument( parentDocument, {
            $set: {
                children: childrenIds
            }
        } )

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

        // Remove children recursively
        const children        = await this._readManyDocument( 'Objects3D', { parent: document._id } )
        const childrenResults = await this._removeChildrenDocuments( children )

        // Remove geometry only if current object is the last that reference it
        const geometryResult = await this._removeOrphanGeometryWithId( document.geometry )

        // Remove material only if current object is the last that reference it
        const materialsResult = await this._removeOrphanMaterialsWithIds( document.material || [] )

        // finally remove the incriminated document
        const documentResult = await this._deleteDocument( document )

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

        if ( isNotDefined( geometryId ) ) { return }

        const referencingObjects = await this._readManyDocument( 'Objects3D', { geometry: geometryId } )
        if ( referencingObjects.length > 1 ) { return }

        const geometryDocument = await this._readOneDocument( 'Geometries', { _id: geometryId } )
        const deleteResult     = await this._deleteDocument( geometryDocument )

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

        const referencingObjects = await this._readManyDocument( 'Objects3D', { material: materialId } )
        if ( referencingObjects.length > 1 ) { return }

        const materialDocument = await this._readOneDocument( 'Materials', { _id: materialId } )
        const deleteResult     = await this._deleteDocument( materialDocument )
        return deleteResult
    }

}

export { TObjects3DController }
