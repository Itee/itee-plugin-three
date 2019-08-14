/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
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

    _schema = new Schema( {
        geometry: {
            type: ObjectId,
            ref:  'Geometry'
        },
        material: [
            {
                type: ObjectId,
                ref:  'LineBasicMaterial'
            }
        ],
        drawMode: Number
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
    _model                  = Object3DBaseModel.discriminator( 'LineSegments', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.LineSegments = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}
