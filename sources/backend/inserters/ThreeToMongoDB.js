/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TAbstractDataInserter } from 'itee-database'
import {
    isArray,
    isNotDefined
}                                from 'itee-validators'

class ThreeToMongoDB extends TAbstractDataInserter {

    constructor ( parameters = {} ) {

        super( parameters )

    }

    _save ( data, parameters, onSuccess, onProgress, onError ) {

        const self                 = this
        const parentId             = parameters.parentId
        const disableRootNode      = ( parameters.disableRootNode === 'true' )
        const dataToParse          = ( disableRootNode ) ? data.children : ( isArray( data ) ) ? data : [ data ]
        const errors               = []
        const numberOfRootChildren = dataToParse.length
        let processedRootChildren  = 0

        if ( numberOfRootChildren === 0 ) {
            onError( 'No node to save in database !' )
        }

        let rootChildIndex = 0
        checkNextRootChild()

        function checkNextRootChild () {

            const rootChild = dataToParse[ rootChildIndex ]

            self._parse(
                rootChild,
                ( childrenIds ) => {

                    processedRootChildren++

                    onProgress( {
                        name: rootChild.name,
                        done: processedRootChildren,
                        todo: numberOfRootChildren
                    } )

                    // In case the root object haven't parent or children skip update
                    if ( isNotDefined( parentId ) || isNotDefined( childrenIds ) ) {

                        checkEndOfParsing()
                        return

                    } else if ( typeof childrenIds === 'string' ) {

                        // Convert single childrenId to array to avoid unecessary code duplication
                        childrenIds = [ childrenIds ]

                    } else {
                        // already an array, it's ok
                    }

                    const Objects3DModelBase = self._driver.model( 'Objects3D' )
                    Objects3DModelBase.findOneAndUpdate( { _id: parentId }, { $push: { children: childrenIds } }, ( error, rootObject ) => {

                        if ( error ) {

                            errors.push( error )
                            checkEndOfParsing()
                            return

                        }

                        if ( !rootObject ) {

                            errors.push( `Unable to retrieve parent object with the given id: ${parentId} !!!` )
                            checkEndOfParsing()
                            return

                        }

                        // Update Children with parent id
                        const rootId           = rootObject.id
                        const numberOfChildren = childrenIds.length
                        let endUpdates         = 0

                        for ( let childIndex = 0 ; childIndex < numberOfChildren ; childIndex++ ) {

                            let childId = childrenIds[ childIndex ]

                            Objects3DModelBase.findByIdAndUpdate( childId, { $set: { parent: rootId } }, ( error ) => {

                                if ( error ) {
                                    errors.push( error )
                                }

                                endUpdates++
                                if ( endUpdates < numberOfChildren ) {
                                    return
                                }

                                checkEndOfParsing()

                            } )

                        }

                    } )

                },
                onProgress,
                onError
            )

        }

        function checkEndOfParsing () {
            rootChildIndex++
            if ( rootChildIndex < numberOfRootChildren ) {
                checkNextRootChild()
                return
            }

            if ( errors.length > 0 ) {
                onError( errors )
            } else {
                onSuccess( parentId )
            }
        }

    }

    _parse ( object, onSuccess, onProgress, onError ) {

        const self             = this
        const numberOfChildren = object.children.length
        let childrenIds        = []
        let childIndex         = 0

        if ( numberOfChildren > 0 ) {

            checkNextChild()

        } else {

            self._saveInDataBase( object, [], onError, onSuccess )

        }

        function checkNextChild () {

            const child = object.children[ childIndex ]

            self._parse(
                child,
                objectId => {

                    childrenIds.push( objectId )

                    onProgress( {
                        name: child.name,
                        done: childrenIds.length,
                        todo: numberOfChildren
                    } )

                    if ( childrenIds.length < numberOfChildren ) {
                        childIndex++
                        checkNextChild()
                        return
                    }

                    self._saveInDataBase( object, childrenIds, onError, onSuccess )

                },
                onProgress,
                onError
            )

        }

    }

    ///////////

    _parseUserData ( jsonUserData ) {

        let userData = {}

        for ( let prop in jsonUserData ) {

            if ( !Object.prototype.hasOwnProperty.call( jsonUserData, prop ) ) { continue }

            userData[ prop.replace( /\./g, '' ) ] = jsonUserData[ prop ]

        }

        return userData

    }

    _saveInDataBase ( object, childrenArrayIds, onError, onSuccess ) {

        // Remove null ids that could come from invalid objects
        const self        = this
        const childrenIds = childrenArrayIds.filter( ( item ) => {
            return item
        } )

        // Preprocess objects here to save geometry, materials and related before to save the object itself
        const objectType = object.type
        const geometry   = object.geometry
        const materials  = object.material

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

            self._saveCurveInDatabase( object, childrenIds, onError, onSuccess )

        } else if ( geometry && materials ) {

            if ( geometry.isGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.vertices || geometry.vertices.length === 0 ) ) {

                    console.error( `Object ${object.name} geometry doesn't contain vertices ! Skip it.` )
                    onSuccess( null )
                    return

                }

                if ( objectType === 'Line' || objectType === 'LineLoop' || objectType === 'LineSegments' ) {

                    // if material != LineBasicMaterial or LineDashedMaterial... ERROR
                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false
                        let material        = undefined
                        let materialType    = undefined
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ]
                            materialType = material.type
                            if ( materialType !== 'LineBasicMaterial' && materialType !== 'LineDashedMaterial' ) {
                                materialOnError = true
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` )
                            onSuccess( null )
                            return

                        }

                    } else if ( materials.type !== 'LineBasicMaterial' && materials.type !== 'LineDashedMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` )
                        onSuccess( null )
                        return

                    } else {

                        // Materials are ok for this type of object

                    }

                } else if ( objectType === 'Points' ) {

                    // if material != PointsMaterial... ERROR

                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false
                        let material        = undefined
                        let materialType    = undefined
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ]
                            materialType = material.type
                            if ( materialType !== 'PointsMaterial' ) {
                                materialOnError = true
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` )
                            onSuccess( null )
                            return

                        }

                    } else if ( materials.type !== 'PointsMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` )
                        onSuccess( null )
                        return

                    } else {

                        // Materials are ok for this type of object

                    }

                } else {

                    // Regular object

                }

                self._saveGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveMaterialInDatabase( materials, onError, ( materialIds ) => {

                        self._saveObject3DInDatabase( object, childrenIds, geometryId, materialIds, onError, onSuccess )

                    } )

                } )

            } else if ( geometry.isBufferGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.attributes[ 'position' ] || geometry.attributes[ 'position' ].count === 0 ) ) {

                    console.error( `Object ${object.name} geometry doesn't contain vertices ! Skip it.` )
                    onSuccess( null )
                    return

                }

                if ( objectType === 'Line' || objectType === 'LineLoop' || objectType === 'LineSegments' ) {

                    // if material != LineBasicMaterial or LineDashedMaterial... ERROR
                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false
                        let material        = undefined
                        let materialType    = undefined
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ]
                            materialType = material.type
                            if ( materialType !== 'LineBasicMaterial' && materialType !== 'LineDashedMaterial' ) {
                                materialOnError = true
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` )
                            onSuccess( null )
                            return

                        }

                    } else if ( materials.type !== 'LineBasicMaterial' && materials.type !== 'LineDashedMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` )
                        onSuccess( null )
                        return

                    } else {

                        // Materials are ok for this type of object

                    }

                } else if ( objectType === 'Points' ) {

                    // if material != PointsMaterial... ERROR

                    if ( Array.isArray( materials ) ) {

                        let materialOnError = false
                        let material        = undefined
                        let materialType    = undefined
                        for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                            material     = materials[ materialIndex ]
                            materialType = material.type
                            if ( materialType !== 'PointsMaterial' ) {
                                materialOnError = true
                                break
                            }

                        }

                        if ( materialOnError ) {

                            console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` )
                            onSuccess( null )
                            return

                        }

                    } else if ( materials.type !== 'PointsMaterial' ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` )
                        onSuccess( null )
                        return

                    } else {

                        // Materials are ok for this type of object

                    }

                } else {

                    // Regular object

                }

                self._saveBufferGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveMaterialInDatabase( materials, onError, ( materialIds ) => {

                        self._saveObject3DInDatabase( object, childrenIds, geometryId, materialIds, onError, onSuccess )

                    } )

                } )

            } else {

                console.error( `Object ${object.name} contain an unknown/unmanaged geometry of type ${geometry.type} ! Skip it.` )
                onSuccess( null )

            }

        } else if ( geometry && !materials ) {

            // Is this right ??? Object can have geometry without material ???

            if ( geometry.isGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.vertices || geometry.vertices.length === 0 ) ) {

                    console.error( `Mesh ${object.name} geometry doesn't contain vertices ! Skip it.` )
                    onSuccess( null )
                    return

                }

                self._saveGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveObject3DInDatabase( object, childrenIds, geometryId, [], onError, onSuccess )

                } )

            } else if ( geometry.isBufferGeometry ) {

                // If it is a terminal object ( No children ) with an empty geometry
                if ( childrenIds.length === 0 && ( !geometry.attributes[ 'position' ] || geometry.attributes[ 'position' ].count === 0 ) ) {

                    console.error( `Mesh ${object.name} buffer geometry doesn't contain position attributes ! Skip it.` )
                    onSuccess( null )
                    return

                }

                self._saveBufferGeometryInDatabase( geometry, onError, ( geometryId ) => {

                    self._saveObject3DInDatabase( object, childrenIds, geometryId, null, onError, onSuccess )

                } )

            } else {

                console.error( `Object ${object.name} contain an unknown/unmanaged geometry of type ${geometry.type} ! Skip it.` )
                onSuccess( null )

            }

        } else if ( !geometry && materials ) {

            if ( objectType === 'Sprite' ) {

                // if material != SpriteMaterial... ERROR
                if ( Array.isArray( materials ) ) {

                    let materialOnError = false
                    let material        = undefined
                    let materialType    = undefined
                    for ( let materialIndex = 0, numberOfMaterials = materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                        material     = materials[ materialIndex ]
                        materialType = material.type
                        if ( materialType !== 'SpriteMaterial' ) {
                            materialOnError = true
                            break
                        }

                    }

                    if ( materialOnError ) {

                        console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materialType} ! Skip it.` )
                        onSuccess( null )
                        return

                    }

                } else if ( materials.type !== 'SpriteMaterial' ) {

                    console.error( `Object ${object.name} of type ${objectType}, contain an invalid material of type ${materials.type} ! Skip it.` )
                    onSuccess( null )
                    return

                } else {

                    // Materials are ok for this type of object

                }

            } else {

                console.error( `Missing geometry for object ${object.name} of type ${objectType}. Only Sprite can contains material without geometry ! Skip it.` )
                onSuccess( null )
                return

            }

            self._saveMaterialInDatabase( materials, onError, ( materialIds ) => {

                self._saveObject3DInDatabase( object, childrenIds, null, materialIds, onError, onSuccess )

            } )

        } else {

            self._saveObject3DInDatabase( object, childrenIds, null, null, onError, onSuccess )

        }

    }

    // Object3D

    _checkIfObject3DAlreadyExist ( /*object*/ ) {

        // Todo
        return null

    }

    _getObject3DModel ( object, childrenIds, geometryId, materialsIds ) {

        object.parent   = null
        object.children = childrenIds
        object.geometry = geometryId
        object.material = materialsIds

        return this._driver.model( object.type )( object )

    }

    _saveObject3DInDatabase ( object, childrenIds, geometryId, materialsIds, onError, onSuccess ) {

        const self     = this
        const objectId = this._checkIfObject3DAlreadyExist( object )

        if ( objectId ) {

            onSuccess( objectId )

        } else {

            this._getObject3DModel( object, childrenIds, geometryId, materialsIds )
                .save()
                .then( savedObject => {

                    const objectId = savedObject.id

                    // Update Children with parent id
                    if ( childrenIds && childrenIds.length > 0 ) {
                        updateChildren( onError, onSuccess )
                    } else {
                        onSuccess( objectId )
                    }

                    function updateChildren ( onError, onSuccess ) {

                        const savedChildrenIds = savedObject._doc.children
                        const numberOfChildren = savedChildrenIds.length

                        let endUpdates = 0
                        let childId    = undefined
                        const errors   = []

                        for ( let childIndex = 0 ; childIndex < numberOfChildren ; childIndex++ ) {

                            childId = savedChildrenIds[ childIndex ]

                            const Objects3DModelBase = self._driver.model( 'Objects3D' )
                            Objects3DModelBase.findByIdAndUpdate( childId, { $set: { parent: objectId } }, ( error ) => {

                                if ( error ) {
                                    errors.push( error )
                                }

                                endUpdates++
                                if ( endUpdates < numberOfChildren ) {
                                    return
                                }

                                returnResult( onError, onSuccess )

                            } )

                        }

                        function returnResult ( onError, onSuccess ) {

                            if ( errors.length > 0 ) {
                                onError( errors )
                            } else {
                                onSuccess( objectId )
                            }

                        }

                    }

                } )
                .catch( onError )

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

        const curveId = this._checkIfCurveAlreadyExist( curve )

        if ( curveId ) {

            onSuccess( curveId )

        } else {

            this._getCurveModel( curve )
                .save()
                .then( savedCurve => { onSuccess( savedCurve.id ) } )
                .catch( onError )

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

        const geometryId = this._checkIfGeometryAlreadyExist( geometry )

        if ( geometryId ) {

            onSuccess( geometryId )

        } else {

            this._getGeometryModel( geometry )
                .save()
                .then( savedGeometry => { onSuccess( savedGeometry.id ) } )
                .catch( onError )

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

        const bufferGeometryId = this._checkIfBufferGeometryAlreadyExist( bufferGeometry )

        if ( bufferGeometryId ) {

            onSuccess( bufferGeometryId )

        } else {

            this._getBufferGeometryModel( bufferGeometry )
                .save()
                .then( savedBufferGeometry => { onSuccess( savedBufferGeometry.id ) } )
                .catch( onError )

        }

    }

    // Material

    _checkIfMaterialAlreadyExist ( /*materials*/ ) {

        // Todo
        return null

    }

    _getMaterialModel ( material, texturesIds ) {

        material.texturesIds = texturesIds

        return this._driver.model( material.type )( material )

    }

    _saveMaterialInDatabase ( materials, onError, onSuccess ) {

        if ( isArray( materials ) ) {

            const numberOfMaterials    = materials.length
            let materialIds            = new Array( numberOfMaterials )
            let numberOfSavedMaterials = 0
            let material               = undefined
            for ( let materialIndex = 0 ; materialIndex < numberOfMaterials ; materialIndex++ ) {

                material         = materials[ materialIndex ]
                const materialId = this._checkIfMaterialAlreadyExist( material )

                if ( materialId ) {

                    materialIds[ materialIndex ] = materialId
                    numberOfSavedMaterials++

                    // End condition
                    if ( numberOfSavedMaterials === numberOfMaterials ) {
                        onSuccess( materialIds )
                    }

                } else {

                    ( () => {

                        const materialLocalIndex = materialIndex

                        this._getMaterialModel( material )
                            .save()
                            .then( savedMaterial => {

                                materialIds[ materialLocalIndex ] = savedMaterial.id
                                numberOfSavedMaterials++

                                // End condition
                                if ( numberOfSavedMaterials === numberOfMaterials ) {
                                    onSuccess( materialIds )
                                }

                            } )
                            .catch( onError )

                    } )()

                }

            }

        } else {

            const materialId = this._checkIfMaterialAlreadyExist( materials )

            if ( materialId ) {

                onSuccess( materialId )

            } else {

                this._getMaterialModel( materials )
                    .save()
                    .then( savedMaterial => {

                        // Return id
                        onSuccess( savedMaterial.id )

                    } )
                    .catch( onError )

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

        const textureId = this._checkIfTextureAlreadyExist( texture )

        if ( textureId ) {

            onSuccess( textureId )

        } else {

            this._getTextureModel( texture )
                .save()
                .then( savedTexture => { onSuccess( savedTexture.id ) } )
                .catch( onError )

        }

    }

}

export { ThreeToMongoDB }
