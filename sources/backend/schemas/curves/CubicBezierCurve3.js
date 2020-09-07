/**
 * @module Schemas/Curves/CubicBezierCurve3
 * @desc Export the ThreeJs CubicBezierCurve3 Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Curves/Curve Schemas/Curves/Curve}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { Curve } = require( './Curve' )

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
    const Vector3 = Types.Vector3

    _schema = new Schema( {
        v0: Vector3,
        v1: Vector3,
        v2: Vector3,
        v3: Vector3
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

    const CurveBaseModel = Curve.getModelFrom( Mongoose )
    _model               = CurveBaseModel.discriminator( 'CubicBezierCurve3', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.CubicBezierCurve3 = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
