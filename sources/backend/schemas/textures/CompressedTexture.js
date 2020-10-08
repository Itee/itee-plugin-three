/**
 * @module Schemas/Textures/CompressedTexture
 * @desc Export the ThreeJs CompressedTexture Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Textures/Texture Schemas/Textures/Texture}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Texture } = require( './Texture' )

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

    const Schema = Mongoose.Schema

    _schema = new Schema( {} )

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

    const TextureBaseModel = Texture.getModelFrom( Mongoose )
    _model                 = TextureBaseModel.discriminator( 'CompressedTexture', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.CompressedTexture = {
    name:            'CompressedTexture',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
