/**
 * @module Schemas/Curves/CubicBezierCurve
 * @desc Export the ThreeJs CubicBezierCurve Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve } = require( './Curve' )

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
    const Vector2 = Types.Vector2

    _schema = new Schema( {
        v0: Vector2,
        v1: Vector2,
        v2: Vector2,
        v3: Vector2
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

    const CurveBaseModel = Curve.getModelFrom( Mongoose )
    _model               = CurveBaseModel.discriminator( 'CubicBezierCurve', getSchemaFrom( Mongoose ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.CubicBezierCurve = {
    name:            'CubicBezierCurve',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
