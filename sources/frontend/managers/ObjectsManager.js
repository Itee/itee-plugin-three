/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class ClassName
 * @classdesc Todo...
 * @example Todo...
 *
 */

/* eslint-env browser */

import { TDataBaseManager }  from 'itee-client'
import {
    isDefined,
    isNotBoolean,
    isNotEmptyArray,
    isNull,
    isUndefined
}                            from 'itee-validators'
import { OrthographicCamera } from 'three-full/sources/cameras/OrthographicCamera'
import { PerspectiveCamera }  from 'three-full/sources/cameras/PerspectiveCamera'
import { Object3D }           from 'three-full/sources/core/Object3D'
import { AmbientLight }       from 'three-full/sources/lights/AmbientLight'
import { DirectionalLight }   from 'three-full/sources/lights/DirectionalLight'
import { HemisphereLight }    from 'three-full/sources/lights/HemisphereLight'
import { PointLight }         from 'three-full/sources/lights/PointLight'
import { RectAreaLight }      from 'three-full/sources/lights/RectAreaLight'
import { SpotLight }          from 'three-full/sources/lights/SpotLight'
import { Color }              from 'three-full/sources/math/Color'
import { Group }              from 'three-full/sources/objects/Group'
import { Line }               from 'three-full/sources/objects/Line'
import { LineLoop }           from 'three-full/sources/objects/LineLoop'
import { LineSegments }       from 'three-full/sources/objects/LineSegments'
import { LOD }                from 'three-full/sources/objects/LOD'
import { Mesh }               from 'three-full/sources/objects/Mesh'
import { Points }             from 'three-full/sources/objects/Points'
import { SkinnedMesh }        from 'three-full/sources/objects/SkinnedMesh'
import { Sprite }             from 'three-full/sources/objects/Sprite'
import { Fog }                from 'three-full/sources/scenes/Fog'
import { FogExp2 }            from 'three-full/sources/scenes/FogExp2'
import { Scene }              from 'three-full/sources/scenes/Scene'
// Waiting three-shaking fix
//import {
//    AmbientLight,
//    Color,
//    DirectionalLight,
//    Fog,
//    FogExp2,
//    Group,
//    HemisphereLight,
//    Line,
//    LineLoop,
//    LineSegments,
//    LOD,
//    Mesh,
//    Object3D,
//    OrthographicCamera,
//    PerspectiveCamera,
//    PointLight,
//    Points,
//    RectAreaLight,
//    Scene,
//    SkinnedMesh,
//    SpotLight,
//    Sprite
//}                            from 'three-full'
import { GeometriesManager }  from './GeometriesManager'
import { MaterialsManager }   from './MaterialsManager'

class ObjectsManager extends TDataBaseManager {

    /**
     *
     * @param parameters
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:           '/objects',
                geometriesProvider: new GeometriesManager(),
                materialsProvider:  new MaterialsManager(),
                projectionSystem:   'zBack',
                globalScale:        1,
                autoFillObjects3D:  true
            }, ...parameters
        }

        super( _parameters )

        this.geometriesProvider = _parameters.geometriesProvider
        this.materialsProvider  = _parameters.materialsProvider
        this.projectionSystem   = _parameters.projectionSystem
        this.globalScale        = _parameters.globalScale
        this.autoFillObjects3D  = _parameters.autoFillObjects3D

    }

    //// Getter/Setter

    get geometriesProvider () {
        return this._geometriesProvider
    }

    set geometriesProvider ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Geometries provider cannot be null ! Expect an instance of GeometriesManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Geometries provider cannot be undefined ! Expect an instance of GeometriesManager.' ) }
        if ( !( value instanceof GeometriesManager ) ) { throw new TypeError( `Geometries provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TGeometriesManager.` ) }

        this._geometriesProvider = value

    }

    get materialsProvider () {
        return this._materialsProvider
    }

    set materialsProvider ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Materials provider cannot be null ! Expect an instance of MaterialsManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Materials provider cannot be undefined ! Expect an instance of MaterialsManager.' ) }
        if ( !( value instanceof MaterialsManager ) ) { throw new TypeError( `Materials provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TMaterialsManager.` ) }

        this._materialsProvider = value

    }

    get projectionSystem () {
        return this._projectionSystem
    }

    set projectionSystem ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

        this._projectionSystem = value

    }

    get globalScale () {
        return this._globalScale
    }

    set globalScale ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

        this._globalScale = value

    }

    get autoFillObjects3D () {
        return this._autoFillObjects3D
    }

    set autoFillObjects3D ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }

        this._autoFillObjects3D = value

    }

    setGeometriesProvider ( value ) {

        this.geometriesProvider = value
        return this

    }

    setMaterialsProvider ( value ) {

        this.materialsProvider = value
        return this

    }

    setProjectionSystem ( value ) {

        this.projectionSystem = value
        return this

    }

    setGlobalScale ( value ) {

        this.globalScale = value
        return this

    }

    setAutoFillObjects3D ( value ) {

        this.autoFillObjects3D = value
        return this

    }

    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Convert data from db to instanced object and add them into a map
        const results = {}
        for ( let dataIndex = 0, numberOfDatas = jsonData.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = jsonData[ dataIndex ]

            try {
                results[ data._id ] = this.convert( data )
            } catch ( err ) {
                onError( err )
            }

            onProgress( new ProgressEvent( 'ObjectsManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) )

        }

        // In case autoFill is true query materials and geometry
        if ( this._autoFillObjects3D ) {
            this.fillObjects3D( results, onSuccess, onProgress, onError )
        } else {
            onSuccess( results )
        }

    }

    // eslint-disable-next-line no-unused-vars
    _onArrayBuffer ( data, onSuccess, onProgress, onError ) {}

    // eslint-disable-next-line no-unused-vars
    _onBlob ( data, onSuccess, onProgress, onError ) {}

    // eslint-disable-next-line no-unused-vars
    _onText ( data, onSuccess, onProgress, onError ) {}

    /**
     *
     * @param data
     * @return {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'ObjectsManager: Unable to convert null or undefined data !' )
        }

        const objectType = data.type
        let object       = null

        // Todo: Use factory instead and allow user to register its own object type !!!
        switch ( objectType ) {

            case 'Object3D':
                object = new Object3D()
                this._fillBaseObjectsData( object, data )
                break

            case 'Scene':
                object = new Scene()
                this._fillBaseObjectsData( object, data )
                if ( isDefined( data.background ) ) {

                    if ( Number.isInteger( data.background ) ) {

                        object.background = new Color( data.background )

                    }

                }
                if ( isDefined( data.fog ) ) {

                    if ( data.fog.type === 'Fog' ) {

                        object.fog = new Fog( data.fog.color, data.fog.near, data.fog.far )

                    } else if ( data.fog.type === 'FogExp2' ) {

                        object.fog = new FogExp2( data.fog.color, data.fog.density )

                    }

                }
                object.overrideMaterial = data.overrideMaterial
                object.autoUpdate       = data.autoUpdate
                break

            case 'PerspectiveCamera':
                object = new PerspectiveCamera()
                this._fillBaseObjectsData( object, data )
                object.fov    = data.fov
                object.aspect = data.aspect
                object.near   = data.near
                object.far    = data.far
                if ( isDefined( data.focus ) ) {
                    object.focus = data.focus
                }
                if ( isDefined( data.zoom ) ) {
                    object.zoom = data.zoom
                }
                if ( isDefined( data.filmGauge ) ) {
                    object.filmGauge = data.filmGauge
                }
                if ( isDefined( data.filmOffset ) ) {
                    object.filmOffset = data.filmOffset
                }
                if ( isDefined( data.view ) ) {
                    object.view = Object.assign( {}, data.view )
                }
                break

            case 'OrthographicCamera':
                object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far )
                this._fillBaseObjectsData( object, data )
                break

            case 'AmbientLight':
                object = new AmbientLight( data.color, data.intensity )
                this._fillBaseObjectsData( object, data )
                break

            case 'DirectionalLight':
                object = new DirectionalLight( data.color, data.intensity )
                this._fillBaseObjectsData( object, data )
                break

            case 'PointLight':
                object = new PointLight( data.color, data.intensity, data.distance, data.decay )
                this._fillBaseObjectsData( object, data )
                break

            case 'RectAreaLight':
                object = new RectAreaLight( data.color, data.intensity, data.width, data.height )
                this._fillBaseObjectsData( object, data )
                break

            case 'SpotLight':
                object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay )
                this._fillBaseObjectsData( object, data )
                break

            case 'HemisphereLight':
                object = new HemisphereLight( data.color, data.groundColor, data.intensity )
                this._fillBaseObjectsData( object, data )
                break

            case 'SkinnedMesh':
                object = new SkinnedMesh()
                this._fillBaseObjectsData( object, data )
                object.geometry          = data.geometry
                object.material          = data.material
                object.drawMode          = data.drawMode
                object.bindMode          = data.bindMode
                object.bindMatrix        = data.bindMatrix
                object.bindMatrixInverse = data.bindMatrixInverse
                break

            case 'Mesh':
                object = new Mesh()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'LOD':
                object = new LOD()
                this._fillBaseObjectsData( object, data )
                object.levels = data.levels
                break

            case 'Line':
                object = new Line()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'LineLoop':
                object = new LineLoop()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'LineSegments':
                object = new LineSegments()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'Points':
                object = new Points()
                this._fillBaseObjectsData( object, data )
                object.geometry = data.geometry
                object.material = data.material
                object.drawMode = data.drawMode
                break

            case 'Sprite':
                object = new Sprite()
                this._fillBaseObjectsData( object, data )
                object.material = data.material
                break

            case 'Group':
                object = new Group()
                this._fillBaseObjectsData( object, data )
                break

            default:
                throw new Error( `TObjectsManager: Unknown object of type: ${ objectType }` )

        }

        return object

    }

    _fillBaseObjectsData ( object, data ) {

        // Common object properties
        object._id = data._id

        if ( isDefined( data.uuid ) ) {
            object.uuid = data.uuid
        }

        if ( isDefined( data.name ) ) {
            object.name = data.name
        }

        // IMPLICIT
        //        if ( isDefined( data.type ) ) {
        //            object.type = data.type
        //        }

        if ( isDefined( data.parent ) ) {
            object.parent = data.parent
        }

        if ( isNotEmptyArray( data.children ) ) {
            object.children = data.children
        }

        if ( isDefined( data.up ) ) {
            object.up.x = data.up.x
            object.up.y = data.up.y
            object.up.z = data.up.z
        }

        if ( isDefined( data.position ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.position.x = data.position.x / this._globalScale
                object.position.y = data.position.z / this._globalScale
                object.position.z = -data.position.y / this._globalScale

            } else {

                object.position.x = data.position.x / this._globalScale
                object.position.y = data.position.y / this._globalScale
                object.position.z = data.position.z / this._globalScale

            }

        }

        if ( isDefined( data.rotation ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.rotation.x     = data.rotation.x
                object.rotation.y     = data.rotation.z
                object.rotation.z     = -data.rotation.y
                object.rotation.order = data.rotation.order

            } else {

                object.rotation.x     = data.rotation.x
                object.rotation.y     = data.rotation.y
                object.rotation.z     = data.rotation.z
                object.rotation.order = data.rotation.order

            }

        }

        if ( isDefined( data.quaternion ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.quaternion.x = data.quaternion.x
                object.quaternion.y = data.quaternion.z
                object.quaternion.z = -data.quaternion.y
                object.quaternion.w = data.quaternion.w

            } else {

                object.quaternion.x = data.quaternion.x
                object.quaternion.y = data.quaternion.y
                object.quaternion.z = data.quaternion.z
                object.quaternion.w = data.quaternion.w

            }

        }

        if ( isDefined( data.scale ) ) {

            if ( data.scale.x !== 0 && data.scale.y !== 0 && data.scale.z !== 0 ) {
                object.scale.x = data.scale.x
                object.scale.y = data.scale.y
                object.scale.z = data.scale.z
            } else {
                console.warn( 'Try to assign null scale !' )
            }

        }

        if ( isDefined( data.modelViewMatrix ) && isNotEmptyArray( data.modelViewMatrix ) ) {
            object.modelViewMatrix.fromArray( data.modelViewMatrix )
        }

        if ( isDefined( data.normalMatrix ) && isNotEmptyArray( data.normalMatrix ) ) {
            object.normalMatrix.fromArray( data.normalMatrix )
        }

        if ( isDefined( data.matrix ) && isNotEmptyArray( data.matrix ) ) {
            object.matrix.fromArray( data.matrix )
        }

        if ( isDefined( data.matrixWorld ) && isNotEmptyArray( data.matrixWorld ) ) {
            object.matrixWorld.fromArray( data.matrixWorld )
        }

        if ( isDefined( data.matrixAutoUpdate ) ) {
            object.matrixAutoUpdate = data.matrixAutoUpdate
        }

        if ( isDefined( data.matrixWorldNeedsUpdate ) ) {
            object.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate
        }

        if ( isDefined( data.layers ) ) {
            object.layers.mask = data.layers
        }

        if ( isDefined( data.visible ) ) {
            object.visible = data.visible
        }

        if ( isDefined( data.castShadow ) ) {
            object.castShadow = data.castShadow
        }

        if ( isDefined( data.receiveShadow ) ) {
            object.receiveShadow = data.receiveShadow
        }

        if ( isDefined( data.frustumCulled ) ) {
            object.frustumCulled = data.frustumCulled
        }

        if ( isDefined( data.renderOrder ) ) {
            object.renderOrder = data.renderOrder
        }

        if ( isDefined( data.userData ) ) {
            object.userData = data.userData
        }

    }

    //// Callback

    fillObjects3D ( objects, onSuccess, onProgress, onError ) {

        const self = this

        // Get objects that need geometry or materials
        const objectsArray = []
        for ( let id in objects ) {

            const object = objects[ id ]
            if ( object.geometry || object.material ) {
                objectsArray.push( objects[ id ] )
            }

        }

        // In case no objects need to be filled return result
        if ( objectsArray.length === 0 ) {
            onSuccess( objects )
            return
        }

        // Else fill geometries and materials for filtered objects
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

    _retrieveGeometriesOf ( meshes, onSuccess, onProgress, onError ) {

        const geometriesIds = meshes.map( object => object.geometry )
                                    .filter( ( value, index, self ) => {
                                        return value && self.indexOf( value ) === index
                                    } )

        if ( geometriesIds.length === 0 ) {
            onSuccess( {} )
            return
        }

        this._geometriesProvider.read(
            geometriesIds,
            null,
            onSuccess,
            onProgress,
            onError
        )

    }

    _retrieveMaterialsOf ( meshes, onSuccess, onProgress, onError ) {

        const materialsArray       = meshes.map( object => object.material )
        const concatMaterialsArray = [].concat.apply( [], materialsArray )
        const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
            return value && self.indexOf( value ) === index
        } )

        if ( materialsIds.length === 0 ) {
            onSuccess( {} )
            return
        }

        this._materialsProvider.read(
            materialsIds,
            null,
            onSuccess,
            onProgress,
            onError
        )

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

    applyGeometry ( object, geometries ) {

        const geometryId = object.geometry
        if ( !geometryId ) {
            return
        }

        const geometry = geometries[ geometryId ]
        if ( !geometry ) {
            console.error( 'Unable to retrieve geometry !!!' )
            return
        }

        object.geometry = geometry

    }

    applyMaterials ( object, materials ) {

        const materialIds = object.material
        if ( !materialIds ) {
            return
        }

        if ( Array.isArray( materialIds ) ) {

            if ( materialIds.length === 1 ) {

                const materialId = materialIds[ 0 ]
                const material   = materials[ materialId ]
                if ( !material ) {
                    console.error( 'Unable to retrieve material !!!' )
                    return null
                }

                object.material = material.clone()

            } else {

                object.material = []
                for ( let materialIndex = 0, numberOfMaterial = materialIds.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                    const materialId = materialIds[ materialIndex ]
                    const material   = materials[ materialId ]
                    if ( !material ) {
                        console.error( 'Unable to retrieve material !!!' )
                        return null
                    }

                    object.material.push( material.clone() )
                }
            }

        } else if ( typeof materialIds === 'string' ) {

            const material = materials[ materialIds ]
            if ( !material ) {
                console.error( 'Unable to retrieve material !!!' )
                return
            }

            object.material = material.clone()

        } else {

            console.error( 'Invalid material ids, expected string or array of string' )

        }

    }

}

export { ObjectsManager }
