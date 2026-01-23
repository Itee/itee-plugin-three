/**
 * @module Schemas/Textures/Texture
 * @desc Export the ThreeJs Texture Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

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

    const Schema   = Mongoose.Schema
    const Types    = Schema.Types
    const ObjectId = Types.ObjectId
    const Vector2  = Types.Vector2
    const Matrix3  = Types.Matrix3

    _schema = new Schema( {
        uuid:             String,
        name:             String,
        image:            ObjectId,
        mipmaps:          [],
        mapping:          Number,
        wrapS:            Number,
        wrapT:            Number,
        magFilter:        Number,
        minFilter:        Number,
        anisotropy:       Number,
        format:           Number,
        type:             Number,
        offset:           Vector2,
        repeat:           Vector2,
        center:           Vector2,
        rotation:         Number,
        matrixAutoUpdate: Boolean,
        matrix:           Matrix3,
        generateMipmaps:  Boolean,
        premultiplyAlpha: Boolean,
        flipY:            Boolean,
        unpackAlignment:  Number,
        encoding:         Number,
        version:          Number
    }, {
        collection:       'textures',
        discriminatorKey: 'type'
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

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model = Mongoose.model( 'Textures', getSchemaFrom( Mongoose ) )
    _model.discriminator( 'Texture', new Mongoose.Schema( {} ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.Texture = {
    name: 'Texture',
    getSchemaFrom,
    getModelFrom,
    registerModelTo
}
