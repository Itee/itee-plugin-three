/**
 * @module Schemas/Geometries/TetrahedronBufferGeometry
 * @desc Export the ThreeJs TetrahedronBufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferGeometry Schemas/Core/BufferGeometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { BufferGeometry } = require( '../core/BufferGeometry' )

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

    const BufferGeometryBaseModel = BufferGeometry.getModelFrom( Mongoose )
    _model                        = BufferGeometryBaseModel.discriminator( 'TetrahedronBufferGeometry', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.TetrahedronBufferGeometry = {
    name:            'TetrahedronBufferGeometry',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
