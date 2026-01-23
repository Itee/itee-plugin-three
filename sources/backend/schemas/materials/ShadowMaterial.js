/**
 * @module Schemas/Materials/ShadowMaterial
 * @desc Export the ThreeJs ShadowMaterial Model and Schema for Mongoose.
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

    _schema = new Schema( {
        color:       Color,
        opacity:     Number,
        lights:      Boolean,
        transparent: Boolean
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
    _model                  = MaterialBaseModel.discriminator( 'ShadowMaterial', getSchemaFrom( Mongoose ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.ShadowMaterial = {
    name:            'ShadowMaterial',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
