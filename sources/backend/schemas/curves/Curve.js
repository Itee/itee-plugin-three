/**
 * @module Schemas/Curves/Curve
 * @desc Export the ThreeJs Curve Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

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

    _schema = new Schema( {
        type:               {
            type:    String,
            default: 'Curve'
        },
        arcLengthDivisions: Number
    }, {
        collection:       'curves',
        discriminatorKey: 'type'
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

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model = Mongoose.model( 'Curves', getSchemaFrom( Mongoose ) )
    _model.discriminator( 'Curve', new Mongoose.Schema( {} ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.Curve = {
    name: 'Curve',
    getSchemaFrom,
    getModelFrom,
    registerModelTo
}
