/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TUniversalLoader
 * @classdesc The TUniversalLoader allow to automatically select correct THREE loader for given files. (based on https://github.com/jeromeetienne/threex.universalloader)
 * @example Todo...
 *
 */

/* eslint-env browser */

import {
    DefaultLogger,
    FileFormat
}                           from 'itee-client'
import { degreesToRadians } from 'itee-utils'

import {
    isArray,
    isFunction,
    isObject,
    isString
} from 'itee-validators'
import {
    ColladaLoader,
    DefaultLoadingManager,
    DoubleSide,
    FBXLoader,
    Group,
    Mesh,
    MeshPhongMaterial,
    MTLLoader,
    ObjectLoader,
    OBJLoader,
    ShapeBufferGeometry,
    STLLoader
} from 'three-full'

import { ASCLoader } from './ASCLoader'
import { DBFLoader } from './DBFLoader'
import { SHPLoader } from './SHPLoader'

// Helpers
/**
 *
 * @param fileUrl
 * @return {string|*}
 */
function getFilePath ( fileUrl ) {

    return fileUrl.substring( 0, fileUrl.lastIndexOf( '/' ) )

}

/**
 *
 * @param fileUrl
 * @return {string|*}
 */
function getFileName ( fileUrl ) {

    return fileUrl.substring( fileUrl.lastIndexOf( '/' ) + 1 )

}

/**
 *
 * @param fileName
 */
function getFileExtension ( fileName ) {

    return fileName.slice( ( fileName.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 )

}

/**
 *
 * @param fileUrl
 * @return {string|*}
 */
function computeUrl ( fileUrl ) {

    const filePath = getFilePath( fileUrl )
    const isBlob   = ( fileUrl.indexOf( 'blob' ) > -1 )

    return ( isBlob ) ? filePath : fileUrl

}

/**
 *
 * @param manager
 * @param logger
 * @constructor
 */
function TUniversalLoader ( manager = DefaultLoadingManager, logger = DefaultLogger ) {

    this.manager = manager
    this.logger  = logger

}

Object.assign( TUniversalLoader.prototype, {

    /**
     *
     * @param files
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( files, onLoad, onProgress, onError ) {

        if ( !files ) {
            this.logger.error( 'Unable to load null or undefined files !' )
            return
        }

        if ( files instanceof FileList ) {

            const numberOfFiles = files.length
            this.logger.log( `numberOfFiles: ${numberOfFiles}` )

            const filesUrls = []
            let fileUrl     = ''
            let fileObject  = null

            for ( let fileIndex = 0 ; fileIndex < numberOfFiles ; ++fileIndex ) {
                fileObject = files[ fileIndex ]
                fileUrl    = `${URL.createObjectURL( fileObject )}/${fileObject.name}`

                filesUrls.push( { url: fileUrl } )
            }

            this.load( filesUrls, onLoad, onProgress, onError )

        } else if ( files instanceof File ) {

            const fileUrl = `${URL.createObjectURL( files )}/${files.name}`
            this.loadSingleFile( { url: fileUrl }, onLoad, onProgress, onError )

        } else if ( isObject( files ) ) {

            this.loadSingleFile( files, onLoad, onProgress, onError )

        } else if ( isFunction( files ) ) {

            this.load( files(), onLoad, onProgress, onError )

        } else if ( isArray( files ) ) {

            // Todo: need to rework logic here and use wrapper object instead of array of object to avoid
            // Todo: array of 2 differents files.
            if ( ( files.length === 2 ) && ( isObject( files[ 0 ] ) && isObject( files[ 1 ] ) ) ) {

                this.loadAssociatedFiles( files, onLoad, onProgress, onError )

            } else {

                for ( let fileIndex = 0, numberOfFiles = files.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
                    this.load( files[ fileIndex ], onLoad, onProgress, onError )
                }

            }

        } else if ( isString( files ) ) {

            this.loadSingleFile( { url: files }, onLoad, onProgress, onError )

        } else {

            this.logger.error( 'TUniversalLoader: Invalid files parameter !!!' )

        }

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    loadSingleFile ( file, onLoad, onProgress, onError ) {

        const fileUrl       = file.url
        const fileName      = getFileName( fileUrl )
        const fileExtension = getFileExtension( fileName )
        file.url            = computeUrl( fileUrl )

        switch ( fileExtension ) {

            case FileFormat.Asc.value:
                this._loadAsc( file, onLoad, onProgress, onError )
                break

            case FileFormat.Dae.value:
                this._loadDae( file, onLoad, onProgress, onError )
                break

            case FileFormat.Dbf.value:
                this._loadDbf( file, onLoad, onProgress, onError )
                break

            case FileFormat.Fbx.value:
                this._loadFbx( file, onLoad, onProgress, onError )
                break

            case FileFormat.Json.value:
                this._loadJson( file, onLoad, onProgress, onError )
                break

            case FileFormat.Obj.value:
                this._loadObj( file, onLoad, onProgress, onError )
                break

            case FileFormat.Shp.value:
                this._loadShp( file, onLoad, onProgress, onError )
                break

            case FileFormat.Stl.value:
                this._loadStl( file, onLoad, onProgress, onError )
                break

            default:
                throw new RangeError( `Invalid file extension: ${fileExtension}. Supported formats are: ${FileFormat.toString()}`, 'TUniversalLoader' )
                break

        }

    },

    /**
     *
     * @param files
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    loadAssociatedFiles ( files, onLoad, onProgress, onError ) {

        const firstFile          = files[ 0 ]
        const firstUrl           = firstFile.url
        const firstFileName      = getFileName( firstUrl )
        const firstFileExtension = getFileExtension( firstFileName )
        firstFile.url            = computeUrl( firstUrl )

        const secondFile          = files[ 1 ]
        const secondUrl           = secondFile.url
        const secondFileName      = getFileName( secondUrl )
        const secondFileExtension = getFileExtension( secondFileName )
        secondFile.url            = computeUrl( secondUrl )

        if ( firstFileExtension === FileFormat.Mtl.value && secondFileExtension === FileFormat.Obj.value ) {

            this._loadObjMtlCouple( secondFile, firstFile, onLoad, onProgress, onError )

        } else if ( firstFileExtension === FileFormat.Obj.value && secondFileExtension === FileFormat.Mtl.value ) {

            this._loadObjMtlCouple( firstFile, secondFile, onLoad, onProgress, onError )

        } else if ( firstFileExtension === FileFormat.Shp.value && secondFileExtension === FileFormat.Dbf.value ) {

            this._loadShpDbfCouple( firstFile, secondFile, onLoad, onProgress, onError )

        } else if ( firstFileExtension === FileFormat.Dbf.value && secondFileExtension === FileFormat.Shp.value ) {

            this._loadShpDbfCouple( secondFile, firstFile, onLoad, onProgress, onError )

        } else {

            this.loadSingleFile( files[ 0 ], onLoad, onProgress, onError )
            this.loadSingleFile( files[ 1 ], onLoad, onProgress, onError )

        }

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadAsc ( file, onLoad, onProgress, onError ) {

        const loader = new ASCLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadDae ( file, onLoad, onProgress, onError ) {

        const loader = new ColladaLoader( this.manager )
        loader.load(
            file.url,
            data => {

                onLoad( data.scene )

            },
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadDbf ( file, onLoad, onProgress, onError ) {

        const loader = new DBFLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadFbx ( file, onLoad, onProgress, onError ) {

        const loader = new FBXLoader( this.manager )
        loader.load(
            file.url,
            object => {

                const position = file.position
                if ( position ) {
                    object.position.set( position.x, position.y, position.z )
                }

                onLoad( object )

            },
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadJson ( file, onLoad, onProgress, onError ) {

        const loader = new ObjectLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadObj ( file, onLoad, onProgress, onError ) {

        const loader = new OBJLoader( this.manager )
        loader.load(
            file.url,
            onLoad,
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadShp ( file, onLoad, onProgress, onError ) {

        const loader = new SHPLoader( this.manager )
        loader.load(
            file.url,
            shapes => {

                const group = new Group()

                for ( let shapeIndex = 0, numberOfShapes = shapes.length ; shapeIndex < numberOfShapes ; shapeIndex++ ) {

                    group.add(
                        new Mesh(
                            new ShapeBufferGeometry( shapes[ shapeIndex ] ),
                            new MeshPhongMaterial( {
                                color: Math.random() * 0xffffff,
                                side:  DoubleSide
                            } )
                        )
                    )

                }

                // Todo: make proper import system from different referentiels
                group.rotateX( degreesToRadians( -90 ) )

                onLoad( group )

            },
            onProgress,
            onError
        )

    },

    /**
     *
     * @param file
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadStl ( file, onLoad, onProgress, onError ) {

        const loader = new STLLoader( this.manager )
        loader.load(
            file.url,
            geometry => {

                const material = new MeshPhongMaterial()
                const object   = new Mesh( geometry, material )

                const position = file.position
                if ( position ) {
                    object.position.set( position.x, position.y, position.z )
                }

                onLoad( object )

            },
            onProgress,
            onError
        )

    },

    /**
     *
     * @param objFile
     * @param mtlFile
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadObjMtlCouple ( objFile, mtlFile, onLoad, onProgress, onError ) {

        const mtlLoader = new MTLLoader( this.manager )
        const objLoader = new OBJLoader( this.manager )

        const texturePath = mtlFile.texturePath
        if ( texturePath ) {
            mtlLoader.setTexturePath( texturePath )
        }

        mtlLoader.load(
            mtlFile.url,
            materials => {

                materials.preload()

                for ( let materialIndex = 0, numberOfMaterials = materials.materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {
                    const material                       = materials.materials[ materialIndex ]
                    material.opacity                     = 1.0
                    materials.materials[ materialIndex ] = material
                }

                objLoader.setMaterials( materials )
                objLoader.load(
                    objFile.url,
                    onLoad,
                    onProgress,
                    onError
                )

            },
            onProgress,
            onError
        )

    },

    /**
     *
     * @param shpFile
     * @param dbfFile
     * @param onLoad
     * @param onProgress
     * @param onError
     * @private
     */
    _loadShpDbfCouple ( shpFile, dbfFile, onLoad, onProgress, onError ) {

        let _shapes = undefined
        let _dbf    = undefined

        const shpLoader = new SHPLoader( this.manager )
        shpLoader.load(
            shpFile.url,
            shapes => {

                _shapes = shapes
                checkEnd()

            },
            onProgress,
            onError
        )

        const dbfLoader = new DBFLoader( this.manager )
        dbfLoader.load(
            dbfFile.url,
            dbf => {

                _dbf = dbf
                checkEnd()

            },
            onProgress,
            onError
        )

        function checkEnd () {

            if ( !_shapes || !_dbf ) {
                return
            }

            const group = new Group()
            group.name  = 'Locaux'

            let mesh = undefined
            for ( let shapeIndex = 0, numberOfShapes = _shapes.length ; shapeIndex < numberOfShapes ; shapeIndex++ ) {

                mesh = new Mesh(
                    new ShapeBufferGeometry( _shapes[ shapeIndex ] ),
                    new MeshPhongMaterial( {
                        color: 0xb0f2b6,
                        //                        color: Math.random() * 0xffffff,
                        side:  DoubleSide
                    } )
                )

                const shapeName         = _dbf.datas[ shapeIndex ][ 'CODE' ]
                mesh.name               = shapeName
                mesh.userData[ 'Code' ] = shapeName

                group.add( mesh )

            }

            onLoad( group )

        }

    }

} )

export { TUniversalLoader }
