/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { Curve } = require( '../curves/Curve' )

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

    const NestedCurveSchema = new Schema( {
        type: {
            type:    String,
            default: 'Curve'
        },
        arcLengthDivisions: Number
    }, {
        id:  false,
        _id: false
    } )

    _schema = new Schema( {
        curves:    [ NestedCurveSchema ], // Curve
        autoClose: {
            type:    Boolean,
            default: false
        }
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
    _model               = CurveBaseModel.discriminator( 'CurvePath', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.CurvePath = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
