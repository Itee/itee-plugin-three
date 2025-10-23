/**
 * @module Schemas/Materials/MeshNormalMaterial
 * @desc Export the ThreeJs MeshNormalMaterial Model and Schema for Mongoose.
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

    const Schema  = Mongoose.Schema
    const Types   = Schema.Types
    const Mixed   = Types.Mixed
    const Vector2 = Types.Vector2

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
    _model                  = MaterialBaseModel.discriminator( 'MeshNormalMaterial', getSchemaFrom( Mongoose ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.MeshNormalMaterial = {
    name:            'MeshNormalMaterial',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
