/**
 * @module Schemas/Materials/MeshLambertMaterial
 * @desc Export the ThreeJs MeshLambertMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material } = require( './Material' )

let _schema = undefined
let _model  = undefined

function getSchemaFrom( Mongoose ) {
    'use strict'

    if ( !_schema ) {
        _createSchema( Mongoose )
    }

    return _schema

}

function _createSchema( Mongoose ) {
    'use strict'

    const Schema = Mongoose.Schema
    const Types  = Schema.Types
    const Color  = Types.Color
    const Mixed  = Types.Mixed

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
    } )

}

function getModelFrom( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return _model

}

function _createModel( Mongoose ) {
    'use strict'

    const MaterialBaseModel = Material.getModelFrom( Mongoose )
    _model                  = MaterialBaseModel.discriminator( 'MeshLambertMaterial', getSchemaFrom( Mongoose ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.MeshLambertMaterial = {
    name:            'MeshLambertMaterial',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
