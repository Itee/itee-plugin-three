/**
 * @module Schemas/Math/Ray
 * @desc Export the ThreeJs Ray Model and Schema for Mongoose.
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

let _schema = undefined

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
    const Vector3 = Types.Vector3

    _schema = new Schema( {
        origin:    Vector3,
        direction: Vector3
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.Ray = {
    name:            'Ray',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
