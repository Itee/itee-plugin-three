/**
 * @module Schemas/Math/Triangle
 * @desc Export the ThreeJs Triangle Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema = undefined

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
        a: Vector3,
        b: Vector3,
        c: Vector3
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.Triangle = {
    name:            'Triangle',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
