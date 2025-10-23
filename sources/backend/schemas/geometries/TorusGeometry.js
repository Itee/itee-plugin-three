/**
 * @module Schemas/Geometries/TorusGeometry
 * @desc Export the ThreeJs TorusGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/Geometry Schemas/Core/Geometry}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Geometry } = require( '../core/Geometry' )

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

    const GeometryBaseModel = Geometry.getModelFrom( Mongoose )
    _model                  = GeometryBaseModel.discriminator( 'TorusGeometry', getSchemaFrom( Mongoose ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.TorusGeometry = {
    name:            'TorusGeometry',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
