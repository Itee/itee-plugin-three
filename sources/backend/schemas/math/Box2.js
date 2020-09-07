/**
 * @module Schemas/Math/Box2
 * @desc Export the ThreeJs Box2 Model and Schema for Mongoose.
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
    const Vector2 = Types.Vector2

    _schema = new Schema( {
        min: Vector2,
        max: Vector2
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.Box2 = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
