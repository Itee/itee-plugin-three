/**
 * @module Schemas/Helpers/AxesHelper
 * @desc Export the ThreeJs AxesHelper Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Object3D Schemas/Core/Object3D}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Object3D } = require( '../core/Object3D' )

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

    _schema = new Schema( {} )

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

    const Object3DBaseModel = Object3D.getModelFrom( Mongoose )
    _model                  = Object3DBaseModel.discriminator( 'AxesHelper', getSchemaFrom( Mongoose ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.AxesHelper = {
    name:            'AxesHelper',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
