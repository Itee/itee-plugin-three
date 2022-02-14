/**
 * @module Schemas/Objects/LensFlare
 * @desc Export the ThreeJs LensFlare Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D } = require( '../core/Object3D' )

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

    const Schema   = Mongoose.Schema
    const Types    = Schema.Types
    const ObjectId = Types.ObjectId
    const Color    = Types.Color
    const Vector3  = Types.Vector3

    _schema = new Schema( {
        lensFlares:     [ {
            texture:  ObjectId,
            size:     Number,
            distance: Number,
            x:        Number,
            y:        Number,
            z:        Number,
            scale:    Number,
            rotation: Number,
            opacity:  Number,
            color:    Color,
            blending: Number
        } ],
        positionScreen: Vector3
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

    const Object3DBaseModel = Object3D.getModelFrom( Mongoose )
    _model                  = Object3DBaseModel.discriminator( 'LensFlare', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.LensFlare = {
    name:            'LensFlare',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
