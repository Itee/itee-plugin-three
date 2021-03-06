/**
 * @module Schemas/Materials/MeshToonMaterial
 * @desc Export the ThreeJs MeshToonMaterial Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Materials/Material Schemas/Materials/Material}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Material } = require( './Material' )

let _schema = undefined
let _model  = undefined

function getSchemaFrom ( Mongoose ) {
    'use strict'

    if ( !_schema ) {
        _createSchema( Mongoose )
    }

    return _schema

}

function _createSchema ( Mongoose ) {
    'use strict'

    const Schema  = Mongoose.Schema
    const Types   = Schema.Types
    const Mixed   = Types.Mixed
    const Color   = Types.Color
    const Vector2 = Types.Vector2

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
    } )

}

function getModelFrom ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return _model

}

function _createModel ( Mongoose ) {
    'use strict'

    const MaterialBaseModel = Material.getModelFrom( Mongoose )
    _model                  = MaterialBaseModel.discriminator( 'MeshToonMaterial', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.MeshToonMaterial = {
    name:            'MeshToonMaterial',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
