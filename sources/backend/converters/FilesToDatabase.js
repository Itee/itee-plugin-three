/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Modules/UploadDispatcher
 *
 * @description This module will dispatch the uplaod file to the correct parser.
 */

import {
    isArray,
    isDefined,
    isFunction
}                         from 'itee-validators'
import path               from 'path'
import {
    DoubleSide,
    Group,
    Mesh,
    MeshPhongMaterial,
    ShapeBufferGeometry
}                         from 'three-full'
import { AscToThree }     from './AscToThree'
import { DbfToThree }     from './DbfToThree'
import { JsonToThree }    from './JsonToThree'
import { MtlToThree }     from './MtlToThree'
import { Obj2ToThree }    from './Obj2ToThree'
import { ShpToThree }     from './ShpToThree'
import { ThreeToMongoDB } from './ThreeToMongoDB'

// Todo: Make it a converter
// const AscFile = require( './AscFile' )

const FileFormat = Object.freeze( {
    Asc:  '.asc',
    Dbf:  '.dbf',
    Fbx:  '.fbx',
    Mtl:  '.mtl',
    Json: '.json',
    Obj:  '.obj',
    Shp:  '.shp',
    Stl:  '.stl',

    toString () {

        const formats = Object.values( this )
        let result    = ''
        for ( let index = 0, numberOfFormats = formats.length ; index < numberOfFormats ; index++ ) {
            result += formats[ index ]
            result += ( ( index === numberOfFormats - 1 ) ? ', ' : '.' )
        }
        return result

    }
} )

// Todo: allow to add/remove converters and output database
class FilesToDatabase {

    /**
     * In case database call return nothing consider that is a not found.
     * If response parameter is a function consider this is a returnNotFound callback function to call,
     * else check if server response headers aren't send yet, and return response with status 204
     *
     * @param response - The server response or returnNotFound callback
     * @returns {*} callback call or response with status 204
     */
    static returnNotFound ( response ) {

        if ( isFunction( response ) ) { return response() }
        if ( response.headersSent ) { return }

        response.status( 204 ).end()

    }

    /**
     * In case database call return an error.
     * If response parameter is a function consider this is a returnError callback function to call,
     * else check if server response headers aren't send yet, log and flush stack trace (if allowed) and return response with status 500 and
     * stringified error as content
     *
     * @param error - A server/database error
     * @param response - The server response or returnError callback
     * @returns {*} callback call or response with status 500 and associated error
     */
    static returnError ( error, response ) {

        if ( isFunction( response ) ) { return response( error, null ) }
        if ( response.headersSent ) { return }

        response.format( {

            'application/json': () => {
                response.status( 500 ).json( error )
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' )
            }

        } )

    }

    /**
     * In case database call return some data.
     * If response parameter is a function consider this is a returnData callback function to call,
     * else check if server response headers aren't send yet, and return response with status 200 and
     * stringified data as content
     *
     * @param data - The server/database data
     * @param response - The server response or returnData callback
     * @returns {*} callback call or response with status 200 and associated data
     */
    static returnData ( data, response ) {

        if ( isFunction( response ) ) { return response( null, data ) }
        if ( response.headersSent ) { return }

        const _data = isArray( data ) ? data : [ data ]

        response.format( {

            'application/json': () => {
                response.status( 200 ).json( _data )
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' )
            }

        } )

    }

    /**
     * In case database call return some data AND error.
     * If response parameter is a function consider this is a returnErrorAndData callback function to call,
     * else check if server response headers aren't send yet, log and flush stack trace (if allowed) and
     * return response with status 406 with stringified data and error in a literal object as content
     *
     * @param error - A server/database error
     * @param data - The server/database data
     * @param response - The server response or returnErrorAndData callback
     * @returns {*} callback call or response with status 406, associated error and data
     */
    static returnErrorAndData ( error, data, response ) {

        if ( isFunction( response ) ) { return response( error, data ) }
        if ( response.headersSent ) { return }

        const result = {
            errors: error,
            datas:  data
        }

        response.format( {

            'application/json': () => {
                response.status( 416 ).json( result )
            },

            'default': () => {
                response.status( 416 ).send( 'Range Not Satisfiable' )
            }

        } )

    }

    constructor ( Mongoose ) {

        this._numberOfFileToProcess = 0
        this._errors                = []

        this._ascToThree  = new AscToThree()
        this._jsonToThree = new JsonToThree()
        this._shpToThree  = new ShpToThree()
        this._dbfToThree  = new DbfToThree()
        this._mtlToThree  = new MtlToThree()
        this._objToThree  = new Obj2ToThree()

        this._parentId        = null
        this._disableRootNode = null
        this._threeToMongo    = new ThreeToMongoDB( Mongoose )

    }

    return ( response, callbacks = {} ) {

        const _callbacks = Object.assign( {

                immediate:                null,
                beforeAll:                null,
                beforeReturnErrorAndData: null,
                afterReturnErrorAndData:  null,
                beforeReturnError:        null,
                afterReturnError:         null,
                beforeReturnData:         null,
                afterReturnData:          null,
                beforeReturnNotFound:     null,
                afterReturnNotFound:      null,
                afterAll:                 null

            },
            callbacks,
            {
                returnErrorAndData: FilesToDatabase.returnErrorAndData.bind( this ),
                returnError:        FilesToDatabase.returnError.bind( this ),
                returnData:         FilesToDatabase.returnData.bind( this ),
                returnNotFound:     FilesToDatabase.returnNotFound.bind( this )
            } )

        /**
         * The callback that will be used for parse database response
         */
        function dispatchResult ( error = null, data = null ) {

            const haveData  = isDefined( data )
            const haveError = isDefined( error )

            if ( _callbacks.beforeAll ) { _callbacks.beforeAll() }

            if ( haveData && haveError ) {

                if ( _callbacks.beforeReturnErrorAndData ) { _callbacks.beforeReturnErrorAndData( error, data ) }
                _callbacks.returnErrorAndData( error, data, response )
                if ( _callbacks.afterReturnErrorAndData ) { _callbacks.afterReturnErrorAndData( error, data ) }

            } else if ( haveData && !haveError ) {

                if ( _callbacks.beforeReturnData ) { _callbacks.beforeReturnData( data ) }
                _callbacks.returnData( data, response )
                if ( _callbacks.afterReturnData ) { _callbacks.afterReturnData( data ) }

            } else if ( !haveData && haveError ) {

                if ( _callbacks.beforeReturnError ) { _callbacks.beforeReturnError( error ) }
                _callbacks.returnError( error, response )
                if ( _callbacks.afterReturnError ) { _callbacks.afterReturnError( error ) }

            } else if ( !haveData && !haveError ) {

                if ( _callbacks.beforeReturnNotFound ) { _callbacks.beforeReturnNotFound() }
                _callbacks.returnNotFound( response )
                if ( _callbacks.afterReturnNotFound ) { _callbacks.afterReturnNotFound() }

            }

            if ( _callbacks.afterAll ) { _callbacks.afterAll() }

        }

        // An immediate callback hook ( for timing for example )
        if ( _callbacks.immediate ) { _callbacks.immediate() }

        return dispatchResult

    }

    // Public
    saveFilesInDatabase ( request, response ) {

        const parameters    = request.body
        const files         = this._convertFilesObjectToArray( request.files )
        const numberOfFiles = files.length

        this._parentId        = parameters.parentId
        this._disableRootNode = ( parameters.disableRootNode === 'true' )

        if ( numberOfFiles === 0 ) {

            FilesToDatabase.returnData( null, response )

        } else if ( numberOfFiles === 1 ) {

            this._saveSingleFile( files[ 0 ], parameters, response )

        } else if ( numberOfFiles === 2 ) {

            this._saveAssociativeFiles( files[ 0 ], files[ 1 ], parameters, response )

        } else {

            FilesToDatabase.returnError( `Impossible d'analyser ${numberOfFiles} fichiers associatifs simultanément !`, response )

        }

    }

    // Private
    _convertFilesObjectToArray ( files ) {

        const fileArray = []

        for ( let field in files ) {

            if ( !Object.prototype.hasOwnProperty.call( files, field ) ) { continue }

            fileArray.push( files[ field ] )

        }

        return fileArray

    }

    _fileConversionSuccessCallback ( response, extraSuccessCallback, data ) {

        if ( extraSuccessCallback ) {
            extraSuccessCallback( data )
            return
        }

        this._threeToMongo.save(
            data,
            {
                parentId:        this._parentId,
                disableRootNode: this._disableRootNode
            },
            ( success ) => {
                this._numberOfFileToProcess--
                this._checkEndOfReturns( response, [
                    {
                        title:   'Succées',
                        message: `Sauvegarder sous l'identifiant ${success}`
                    }
                ] )
            },
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _fileConversionProgressCallback ( response, progress ) {

        console.log( progress )

    }

    _fileConversionErrorCallback ( response, error ) {

        this._errors.push( error )
        this._numberOfFileToProcess--
        this._checkEndOfReturns( response )

    }

    _checkEndOfReturns ( response, data ) {

        if ( this._numberOfFileToProcess > 0 ) { return }

        if ( this._errors.length > 0 ) {
            this.return( response )( this._errors )
            this._errors = []
        } else {
            FilesToDatabase.returnData( data, response )
        }

    }

    ///

    _saveSingleFile ( file, parameters, response ) {

        const fileExtension = path.extname( file.filename )

        this._numberOfFileToProcess++

        switch ( fileExtension ) {

            case FileFormat.Asc:
                this._saveAsc( file.file, parameters, response )
                break

            case FileFormat.Obj:
                this._saveObj( file.file, parameters, response )
                break

            case FileFormat.Mtl:
                this._saveMtl( file.file, parameters, response )
                break

            case FileFormat.Json:
                this._saveJson( file.file, parameters, response )
                break

            case FileFormat.Shp:
                this._saveShp( file.file, parameters, response )
                break

            default:
                this._errors.push( {
                    title:   'Mauvaise extension de fichier',
                    message: `Le format de fichier ${fileExtension} n'est pas géré !`
                } )
                this._numberOfFileToProcess--
                this._checkEndOfReturns( response )
                break

        }

    }

    _saveAsc ( file, parameters, response ) {

        this._ascToThree.convert(
            file,
            parameters,
            this._fileConversionSuccessCallback.bind( this, response, null ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _saveObj ( file, parameters, response ) {

        this._objToThree.convert(
            file,
            parameters,
            this._fileConversionSuccessCallback.bind( this, response, null ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _saveMtl ( file, parameters, response ) {

        this._mtlToThree.convert(
            file,
            parameters,
            this._fileConversionSuccessCallback.bind( this, response, null ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _saveJson ( file, parameters, response ) {

        this._jsonToThree.convert(
            file,
            parameters,
            this._fileConversionSuccessCallback.bind( this, response, null ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _saveShp ( file, parameters, response ) {

        this._shpToThree.convert(
            file,
            parameters,
            this._fileConversionSuccessCallback.bind( this, response, null ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    ///

    _saveAssociativeFiles ( firstFile, secondFile, parameters, response ) {

        // Check files extensions
        const firstFileExtension  = path.extname( firstFile.filename )
        const secondFileExtension = path.extname( secondFile.filename )

        this._numberOfFileToProcess++ // Unecessary to set to 2 due to the fact that files are considered as a single package

        if ( firstFileExtension === FileFormat.Mtl && secondFileExtension === FileFormat.Obj ) {

            this._saveObjMtlCouple( secondFile.file, firstFile.file, parameters, response )

        } else if ( firstFileExtension === FileFormat.Obj && secondFileExtension === FileFormat.Mtl ) {

            this._saveObjMtlCouple( firstFile.file, secondFile.file, parameters, response )

        } else if ( firstFileExtension === FileFormat.Shp && secondFileExtension === FileFormat.Dbf ) {

            this._saveShpDbfCouple( firstFile.file, secondFile.file, parameters, response )

        } else if ( firstFileExtension === FileFormat.Dbf && secondFileExtension === FileFormat.Shp ) {

            this._saveShpDbfCouple( secondFile.file, firstFile.file, parameters, response )

        } else {

            this._errors.push( {
                title:   'Mauvaise extension de fichier',
                message: `Extension de fichiers associaifs inconnue: ${firstFileExtension}, ${secondFileExtension}`
            } )
            this._numberOfFileToProcess--
            this._checkEndOfReturns( response )

        }

    }

    _saveObjMtlCouple ( objFile, mtlFile, parameters, response ) {

        this._mtlToThree.convert(
            mtlFile,
            parameters,
            this._fileConversionSuccessCallback.bind( this, response, ( materials ) => {

                materials.preload()
                parameters[ 'materials' ] = materials

                this._objToThree.convert(
                    objFile,
                    parameters,
                    this._fileConversionSuccessCallback.bind( this, response, null ),
                    this._fileConversionProgressCallback.bind( this, response ),
                    this._fileConversionErrorCallback.bind( this, response )
                )

            } ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _saveShpDbfCouple ( shpFile, dbfFile, parameters, response ) {

        this._shpToThree.convert(
            shpFile,
            parameters,
            this._fileConversionSuccessCallback.bind( this, response, shpData => {

                this._dbfToThree.convert( dbfFile,
                    parameters,
                    dbfData => {

                        const group = new Group()
                        group.name  = 'Locaux'

                        let mesh     = null
                        let geometry = null
                        let material = null
                        for ( let shapeIndex = 0, numberOfShapes = shpData.length ; shapeIndex < numberOfShapes ; shapeIndex++ ) {

                            geometry = new ShapeBufferGeometry( shpData[ shapeIndex ] )
                            material = new MeshPhongMaterial( {
                                color: 0xb0f2b6,
                                side:  DoubleSide
                            } )
                            mesh     = new Mesh( geometry, material )

                            // Merge Dbf data with Shp data
                            const shapeName         = dbfData.datas[ shapeIndex ][ 'CODE' ]
                            mesh.name               = shapeName
                            mesh.userData[ 'Code' ] = shapeName

                            group.add( mesh )

                        }

                        // Insert to db here !
                        this._fileConversionSuccessCallback( response, null, group )

                    },
                    this._fileConversionProgressCallback.bind( this, response ),
                    this._fileConversionErrorCallback.bind( this, response )
                )

            } ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _saveThreeInMongoDB ( threeData ) {

        console.log( threeData )

    }

}

module.exports = FilesToDatabase
