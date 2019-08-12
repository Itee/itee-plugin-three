/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const Curve = require( '../curves/Curve' )

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
    const Vector2 = Types.Vector2

    const NestedCurveSchema = new Schema(
        {
            type:               {
                type:    String,
                default: 'Curve'
            },
            arcLengthDivisions: Number
        },
        {
            id:  false,
            _id: false
        }
    )

    const NestedPathSchema = new Schema(
        {

            // CurvePath inheritance
            curves:    [ NestedCurveSchema ], // Curve
            autoClose: {
                type:    Boolean,
                default: false
            },

            // Path inheritance
            currentPoint: Vector2

        },
        {
            id:  false,
            _id: false
        }
    )

    _schema = new Schema( {

        // CurvePath inheritance
        curves:    [ NestedCurveSchema ], // Curve
        autoClose: {
            type:    Boolean,
            default: false
        },

        // Path inheritance
        currentPoint: Vector2,

        // Shape inheritance
        uuid:  String,
        holes: [ NestedPathSchema ] // Path

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
    _model               = CurveBaseModel.discriminator( 'Shape', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
